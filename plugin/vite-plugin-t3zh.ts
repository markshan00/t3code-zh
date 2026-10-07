/**
 * t3code-zh 构建时转换插件（Vite / rolldown）。
 *
 * - enforce: "pre"，并由 build/vite.zh.config.ts 放在 plugins 第一位：在 TanStack Router
 *   代码分割、React Compiler（@rolldown/plugin-babel）和 oxc 的 TS/JSX 转换之前运行，看到的是原始源码。
 *   configResolved 里核对实际插件顺序，不对就报错。
 * - buildStart 跑一次全仓库预扫描（matcher.createScanContext）。
 * - 只处理 §4 范围内的模块；判定全部来自 matcher.scanModule，这里只按 edit 改代码。
 * - 用 magic-string 做最小改动（只包裹、不重排），输出 sourcemap。
 * - 提供虚拟模块 virtual:t3zh-runtime（runtime/t3zh-runtime.ts + 打包进去的词库）。
 * - buildEnd 打印统计并写 reports/transform-stats.json。
 *
 * 只用可擦除的 TS 语法：包装配置会在 Node 里直接 import 本文件。
 */
import fs from "node:fs";
import path from "node:path";
import MagicString from "magic-string";
import {
  RUNTIME_FN,
  RUNTIME_MODULE_ID,
  ZH_ROOT,
  createScanContext,
  isInScope,
  scanModule,
  type Candidate,
  type CreatedScanContext,
  type Edit,
} from "./matcher.ts";

const RESOLVED_RUNTIME_ID = `\0${RUNTIME_MODULE_ID}`;
const RUNTIME_IMPL_ID = `${RUNTIME_MODULE_ID}/impl`;
const PLUGIN_NAME = "t3zh";

/** 必须排在本插件之后的插件（名字前缀）。 */
const MUST_RUN_AFTER = ["@rolldown/plugin-babel", "tanstack-router", "tanstack:router", "vite:react", "vite:oxc", "vite:esbuild"];

export interface T3zhPluginOptions {
  /** monorepo 根（.build/src）。 */
  monorepoRoot: string;
  /** 词库路径，默认 <t3code-zh>/dict/zh-CN.json。 */
  dictPath?: string;
  /** 放行表路径，默认 <t3code-zh>/dict/allow-suspicious.json。 */
  allowSuspiciousPath?: string;
  /** 统计输出路径，默认 <t3code-zh>/reports/transform-stats.json；false 不写。 */
  statsFile?: string | false;
}

interface FileRecord {
  rel: string;
  candidates: Candidate[];
  edits: number;
}

type Counter = Record<string, number>;

function bump(counter: Counter, key: string, by = 1): void {
  counter[key] = (counter[key] ?? 0) + by;
}

function sortedCounter(counter: Counter): Counter {
  return Object.fromEntries(Object.entries(counter).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
}

/** 按 edit 改代码。wrap 允许嵌套，replace 不得与其他改动重叠。 */
export function applyEdits(code: string, edits: readonly Edit[], s: MagicString = new MagicString(code)): MagicString {
  const ordered = [...edits].sort((a, b) => a.start - b.start || b.end - a.end);
  for (let i = 0; i < ordered.length; i++) {
    const edit = ordered[i] as Edit;
    const next = ordered[i + 1];
    if (next && next.start < edit.end) {
      const nested = next.end <= edit.end;
      if (!nested || edit.type === "replace" || next.type === "replace") {
        throw new Error(`t3zh: overlapping edits at ${edit.start}-${edit.end} and ${next.start}-${next.end}`);
      }
    }
    if (edit.type === "replace") {
      s.overwrite(edit.start, edit.end, edit.code);
    } else {
      s.appendLeft(edit.start, `${RUNTIME_FN}(`);
      s.prependRight(edit.end, ")");
    }
  }
  return s;
}

/** 转换一段代码。candidates 总会返回；没有要包裹的位置时 output 为 null。插件和测试共用。 */
export function transformCode(
  code: string,
  filename: string,
  ctx: Parameters<typeof scanModule>[2],
): { output: { code: string; map: ReturnType<MagicString["generateMap"]> } | null; candidates: Candidate[]; edits: number } {
  const result = scanModule(code, filename, ctx);
  const edits = result.candidates.flatMap((candidate) => (candidate.decision === "translate" && candidate.edit ? [candidate.edit] : []));
  if (edits.length === 0) return { output: null, candidates: result.candidates, edits: 0 };
  const s = applyEdits(code, edits);
  s.prependLeft(result.importInsertPos, result.importCode);
  return {
    output: { code: s.toString(), map: s.generateMap({ source: filename, includeContent: true, hires: true }) },
    candidates: result.candidates,
    edits: edits.length,
  };
}

function splitId(id: string): { file: string; query: string } {
  const queryIndex = id.indexOf("?");
  const file = queryIndex === -1 ? id : id.slice(0, queryIndex);
  return { file: file.replace(/#.*$/, ""), query: queryIndex === -1 ? "" : id.slice(queryIndex + 1) };
}

export function t3zhPlugin(options: T3zhPluginOptions): any {
  const monorepoRoot = path.resolve(options.monorepoRoot);
  const dictPath = options.dictPath ?? path.join(ZH_ROOT, "dict/zh-CN.json");
  const allowSuspiciousPath = options.allowSuspiciousPath ?? path.join(ZH_ROOT, "dict/allow-suspicious.json");
  const statsFile = options.statsFile === undefined ? path.join(ZH_ROOT, "reports/transform-stats.json") : options.statsFile;
  const runtimeFile = path.join(ZH_ROOT, "runtime/t3zh-runtime.ts");

  let ctx: CreatedScanContext | null = null;
  let pluginOrder: string[] = [];
  const files = new Map<string, FileRecord>();
  let moduleTransforms = 0;
  const skippedQueries: Counter = {};

  return {
    name: PLUGIN_NAME,
    enforce: "pre",

    configResolved(config: { plugins: ReadonlyArray<{ name: string }> }) {
      pluginOrder = config.plugins.map((plugin) => plugin.name);
      const own = pluginOrder.indexOf(PLUGIN_NAME);
      for (const [index, name] of pluginOrder.entries()) {
        if (MUST_RUN_AFTER.some((prefix) => name.startsWith(prefix)) && index < own) {
          throw new Error(`t3zh: plugin "${name}" runs before t3zh (index ${index} < ${own}); t3zh must come first`);
        }
      }
    },

    buildStart() {
      ctx = createScanContext({ root: monorepoRoot, dictPath, allowSuspiciousPath });
      files.clear();
      moduleTransforms = 0;
      if (ctx.prescan.errors.length > 0) {
        const detail = ctx.prescan.errors.map((error) => `  ${error.file}: ${error.message}`).join("\n");
        throw new Error(`t3zh: prescan could not parse ${ctx.prescan.errors.length} file(s):\n${detail}`);
      }
      console.log(
        `[t3zh] prescan: ${ctx.prescan.fileCount} files, ${ctx.prescan.valueUse.size} value-use literals; dict ${Object.keys(ctx.dict?.messages ?? {}).length} messages + ${Object.keys(ctx.dict?.templates ?? {}).length} templates`,
      );
    },

    resolveId(id: string) {
      if (id === RUNTIME_MODULE_ID) return RESOLVED_RUNTIME_ID;
      if (id === RUNTIME_IMPL_ID) return runtimeFile;
      return null;
    },

    load(id: string) {
      if (id !== RESOLVED_RUNTIME_ID) return null;
      if (!ctx?.dict) throw new Error("t3zh: runtime requested before buildStart");
      const payload = JSON.stringify({ messages: ctx.dict.messages, templates: ctx.dict.templates });
      return [
        `import { installT3zhRuntime } from ${JSON.stringify(RUNTIME_IMPL_ID)};`,
        `export const ${RUNTIME_FN} = installT3zhRuntime(${JSON.stringify(payload)}).t;`,
        "",
      ].join("\n");
    },

    transform(code: string, id: string) {
      if (id.startsWith("\0")) return null;
      const { file, query } = splitId(id);
      const rel = path.relative(monorepoRoot, file).split(path.sep).join("/");
      if (rel.startsWith("..") || path.isAbsolute(rel) || !isInScope(rel)) return null;
      // TanStack Router 代码分割产生的模块（?tsr-split=… / ?tsr-shared=…）是同一个源文件的另一份，同样要转换；
      // 其他查询（?raw、?url、?worker…）不碰。
      if (query && !/(^|&)tsr-(split|shared)(=|&|$)/.test(query)) {
        bump(skippedQueries, query);
        return null;
      }
      if (!ctx) throw new Error("t3zh: transform called before buildStart");
      let result: ReturnType<typeof transformCode>;
      try {
        result = transformCode(code, file, ctx);
      } catch (error) {
        throw new Error(`t3zh: failed to transform ${rel}: ${error instanceof Error ? error.message : String(error)}`);
      }
      moduleTransforms += 1;
      files.set(rel, { rel, candidates: result.candidates, edits: result.edits });
      return result.output;
    },

    buildEnd(error?: unknown) {
      if (error || !ctx) return;
      const stats = buildStats();
      const t = stats.totals;
      console.log(
        `[t3zh] transform: ${stats.modules.scanned} modules scanned (${stats.modules.transformed} changed); ` +
          `candidates ${t.candidates}: translate ${t.translate}, skip ${t.skip}, suspicious ${t.suspicious}`,
      );
      for (const [category, counts] of Object.entries(stats.byCategory)) {
        console.log(`[t3zh]   ${category}: translate ${counts.translate ?? 0}, skip ${counts.skip ?? 0}, suspicious ${counts.suspicious ?? 0}`);
      }
      if (statsFile) {
        fs.mkdirSync(path.dirname(statsFile), { recursive: true });
        fs.writeFileSync(statsFile, `${JSON.stringify(stats, null, 2)}\n`);
        console.log(`[t3zh] stats written to ${statsFile}`);
      }
    },
  };

  function buildStats() {
    const byCategory: Record<string, Counter> = { A: {}, B: {}, C: {}, D: {} };
    const byRule: Record<string, Counter> = { E1: {}, E2: {}, E3: {} };
    const reasons: Record<string, Counter> = { translate: {}, skip: {}, suspicious: {} };
    const totals = { candidates: 0, translate: 0, skip: 0, suspicious: 0, edits: 0, translateWithDictMessage: 0 };
    const suspicious: Array<{ file: string; line: number; category: string; reason: string; key: string; template?: string }> = [];
    const messages = ctx?.dict?.messages ?? {};
    const sortedFiles = [...files.values()].sort((a, b) => (a.rel < b.rel ? -1 : a.rel > b.rel ? 1 : 0));
    for (const record of sortedFiles) {
      totals.edits += record.edits;
      for (const candidate of record.candidates) {
        totals.candidates += 1;
        totals[candidate.decision] += 1;
        bump(byCategory[candidate.category] as Counter, candidate.decision);
        bump(reasons[candidate.decision] as Counter, candidate.reason);
        if (candidate.rule) bump(byRule[candidate.rule] as Counter, candidate.decision);
        if (candidate.decision === "translate" && candidate.kind === "message" && Object.hasOwn(messages, candidate.key)) {
          totals.translateWithDictMessage += 1;
        }
        if (candidate.decision === "suspicious") {
          suspicious.push({
            file: record.rel,
            line: candidate.line,
            category: candidate.category,
            reason: candidate.reason,
            key: candidate.key,
            ...(candidate.collidingTemplate ? { template: candidate.collidingTemplate } : {}),
          });
        }
      }
    }
    return {
      baseline: (ctx?.dict as { baseline?: string } | undefined)?.baseline ?? null,
      dict: {
        path: path.relative(ZH_ROOT, dictPath),
        messages: Object.keys(messages).length,
        templates: Object.keys(ctx?.dict?.templates ?? {}).length,
      },
      allowSuspicious: ctx?.allowSuspicious.size ?? 0,
      prescan: { files: ctx?.prescan.fileCount ?? 0, valueUseLiterals: ctx?.prescan.valueUse.size ?? 0 },
      pluginOrder,
      modules: {
        scanned: sortedFiles.length,
        transformed: sortedFiles.filter((record) => record.edits > 0).length,
        transformCalls: moduleTransforms,
        skippedQueries: sortedCounter(skippedQueries),
      },
      totals,
      byCategory: Object.fromEntries(Object.entries(byCategory).map(([key, value]) => [key, sortedCounter(value)])),
      reasons: Object.fromEntries(Object.entries(reasons).map(([key, value]) => [key, sortedCounter(value)])),
      /** §4 位置扩充 E1/E2/E3 产生的候选项（按最终决定计数）。 */
      byRule: Object.fromEntries(Object.entries(byRule).map(([key, value]) => [key, sortedCounter(value)])),
      suspicious,
    };
  }
}

export default t3zhPlugin;
