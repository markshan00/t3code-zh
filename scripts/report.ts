#!/usr/bin/env node
/**
 * T04 覆盖率与可疑项报告（CONVENTIONS §4）。
 *
 * 用法：node scripts/report.ts [源码目录，默认 upstream/] [--tag=<基线 tag>] [--previous=<tag>]
 * 结果写到 reports/<基线 tag>/：
 *   summary.md、summary.json、untranslated.json、suspicious.md、mixed-jsx.md、
 *   ab-value-use.md、stale.json
 *
 * 判定口径全部来自 `plugin/matcher.ts`，本脚本不另写任何「哪些位置能翻、能不能翻」的逻辑：
 *   - createScanContext({ root })  全仓库预扫描 + 放行表 + 词库（与构建插件同一份上下文）
 *   - listScopeFiles(root)         §4 范围内的文件（按文件系统，含未被 web 引入的 packages）
 *   - scanModule(code, file, ctx)  每个文件的候选与决定；candidate.key/kind/decision/reason 直接用
 *
 * 「已翻译 / 未翻译」按运行时**实际查表**归类：对每个 translate 候选，先 `translator.lookupMessage`
 * 再 `translator.matchTemplate`（与 runtime/t3zh-runtime.ts 的 createTranslator 完全同一实现，
 * 也就是 matcher 做模板误配检查时用的那一份，顺序同 §5）。真正命中的词库 key 记为「已使用」，
 * 供 stale 判定；`candidate.key`（`{0}` 形式）只作为给未翻译条目建议新增词条的 key。
 * 「按 §5 运行时会得到的错误译文」同样用这份查表渲染，保证与实际运行一致。
 *
 * 只有脚本本身出错（读文件、解析源码、预扫描含错误）才返回非 0；未翻译再多也返回 0。
 * 输出不含时间戳，同样输入跑两次逐字节一致。
 */

import fs from "node:fs";
import path from "node:path";
import {
  ZH_ROOT,
  createScanContext,
  listScopeFiles,
  scanModule,
  type Candidate,
  type CreatedScanContext,
  type ValueUseInfo,
} from "../plugin/matcher.ts";
import { createTranslator, type Translator } from "../runtime/t3zh-runtime.ts";

/** 基线 tag（CONVENTIONS §1）。报告目录名用它，可用 --tag= 覆盖。 */
const BASELINE_TAG = "v0.0.46-nightly.20261007.2774";

// ---------------------------------------------------------------------------
// 参数与路径
// ---------------------------------------------------------------------------

const argv = process.argv.slice(2);
const argValue = (prefix: string): string | undefined => {
  const found = argv.find((a) => a.startsWith(prefix));
  return found ? found.slice(prefix.length) : undefined;
};
const tag = argValue("--tag=") ?? BASELINE_TAG;
const explicitPrevious = argValue("--previous=");
const root = path.resolve(argv.find((a) => !a.startsWith("--")) ?? path.join(ZH_ROOT, "upstream"));
const reportsDir = path.join(ZH_ROOT, "reports");
const outDir = path.join(reportsDir, tag);

function toPosix(p: string): string {
  return p.split(path.sep).join("/");
}

/** 报告里的文件路径一律相对扫描根，与 cwd 无关。 */
function rel(file: string): string {
  return toPosix(path.relative(root, file));
}

// ---------------------------------------------------------------------------
// 扫描上下文（只用一次；预扫描错误在这里就拦下，不生成任何报告）
// ---------------------------------------------------------------------------

let ctx: CreatedScanContext;
try {
  ctx = createScanContext({ root });
} catch (error) {
  console.error(`✗ 无法建立扫描上下文：${(error as Error).message}`);
  process.exit(1);
}

// matcher 把预扫描的解析失败交给调用方处理（构建插件同样会拒绝）。报告若视而不见，
// 会生成一份「缺少值用途风险」的、看着正常但不可信的报告，所以这里直接失败、不写文件。
if (ctx.prescan.errors.length > 0) {
  for (const error of ctx.prescan.errors) console.error(`✗ 预扫描解析失败 ${error.file}: ${error.message}`);
  console.error(`✗ 预扫描有 ${ctx.prescan.errors.length} 个文件无法解析，报告未生成`);
  process.exit(1);
}

const translator: Translator | null = ctx.dict ? createTranslator(ctx.dict) : null;
const messages = ctx.dict?.messages ?? {};
const templates = ctx.dict?.templates ?? {};

// ---------------------------------------------------------------------------
// 扫描
// ---------------------------------------------------------------------------

interface Occurrence {
  file: string;
  line: number;
  category: Candidate["category"];
  /** 所在组件；取不到时用属性名/键名。 */
  context: string;
}

/** 同一 key 的一组出现位置。 */
interface Group {
  text: string;
  kind: Candidate["kind"];
  occurrences: Occurrence[];
  /** 该文本在预扫描里的值用途信息（suspicious/value-use 一节与 A/B 清单会用到）。 */
  valueUse: ValueUseInfo;
}

/** 可疑项 template-collision 用：同一文本可能撞上不同模板，按 (文本, 模板) 分组。 */
interface CollisionGroup {
  text: string;
  kind: Candidate["kind"];
  template: string;
  /** 按 §5 运行时会得到的错误译文。 */
  wrongResult: string;
  occurrences: Occurrence[];
}

/** A/B 值用途重名清单用：显示位置 + 同一文本作为值用途字面量的位置。 */
interface ValueUseGroup {
  text: string;
  kind: Candidate["kind"];
  category: Candidate["category"];
  occurrences: Occurrence[];
  valueUse: ValueUseInfo;
}

function occurrenceOf(c: Candidate): Occurrence {
  return { file: rel(c.file), line: c.line, category: c.category, context: c.component || c.context };
}

function pushGroup(map: Map<string, Group>, c: Candidate): void {
  const id = `${c.kind}\u0000${c.key}`;
  let group = map.get(id);
  if (!group) {
    group = { text: c.key, kind: c.kind, occurrences: [], valueUse: valueUseInfo(c.text, c.key) };
    map.set(id, group);
  }
  group.occurrences.push(occurrenceOf(c));
}

function byCountThenText<T extends { text: string; occurrences: Occurrence[] }>(a: T, b: T): number {
  return b.occurrences.length - a.occurrences.length || (a.text < b.text ? -1 : a.text > b.text ? 1 : 0);
}

function sortOccurrences(list: Occurrence[]): Occurrence[] {
  return [...list].sort(
    (a, b) =>
      (a.file < b.file ? -1 : a.file > b.file ? 1 : 0) || a.line - b.line || (a.category < b.category ? -1 : 1),
  );
}

/** 运行时会真正命中的词库条目：先 messages（§5 第 2 步）再 templates（第 3 步）。 */
function lookupDict(c: Candidate): { key: string; via: "message" | "template" } | null {
  if (!translator) return null;
  if (translator.lookupMessage(c.text) !== undefined) return { key: c.key, via: "message" };
  const hit = translator.matchTemplate(c.text);
  return hit ? { key: hit.key, via: "template" } : null;
}

function valueUseInfo(text: string, key: string): ValueUseInfo {
  const map = ctx.valueUse;
  if (map instanceof Map) return (map.get(text) as ValueUseInfo | undefined) ?? (map.get(key) as ValueUseInfo | undefined) ?? { count: 0, locations: [] };
  return map.has(key) ? { count: 1, locations: [] } : { count: 0, locations: [] };
}

interface Report {
  scopeFiles: number;
  occurrences: number;
  byReason: Record<string, number>;
  byCategory: Record<string, Record<string, number>>;
  translated: Group[];
  untranslated: Group[];
  abValueUse: ValueUseGroup[];
  mixedJsx: Group[];
  suspiciousValueUse: Group[];
  suspiciousCollision: CollisionGroup[];
  /** 真正命中的词库 key（messages key 或 templates key）。 */
  usedDictKeys: Set<string>;
}

const files = listScopeFiles(root);

const translated = new Map<string, Group>();
const untranslated = new Map<string, Group>();
const abValueUse = new Map<string, ValueUseGroup>();
const mixedJsx = new Map<string, Group>();
const susValueUse = new Map<string, Group>();
const susCollision = new Map<string, CollisionGroup>();
const byReason: Record<string, number> = {};
const byCategory: Record<string, Record<string, number>> = {};
const usedDictKeys = new Set<string>();
const parseErrors: string[] = [];
let occurrences = 0;

for (const file of files) {
  let candidates: Candidate[];
  try {
    candidates = scanModule(fs.readFileSync(file, "utf8"), file, ctx).candidates;
  } catch (error) {
    parseErrors.push(`${rel(file)}: ${(error as Error).message}`);
    continue;
  }
  for (const c of candidates) {
    occurrences += 1;
    const cat = (byCategory[c.category] ??= { translate: 0, skip: 0, suspicious: 0 });
    cat[c.decision] = (cat[c.decision] ?? 0) + 1;
    byReason[c.reason] = (byReason[c.reason] ?? 0) + 1;

    if (c.decision === "translate") {
      const hit = lookupDict(c);
      if (hit) {
        // 真正命中的词库 key（messages key 或 templates key）才算「已用」，用于 stale 判定。
        usedDictKeys.add(hit.key);
        pushGroup(translated, c);
      } else {
        pushGroup(untranslated, c);
      }
      // A、B 位置的文本即使和值用途字面量相同也照常转换，但必须在报告里列出（§4）。
      // 这里描述的是「源码文本 vs 预扫描值用途字面量」的重名，与上式「运行时命中的词库 key」
      // 是两回事，所以放在 if/else 之外单独判定，不参与 usedDictKeys。
      if (c.valueUse && (c.category === "A" || c.category === "B")) {
        const id = `${c.kind}\u0000${c.key}`;
        let group = abValueUse.get(id);
        if (!group) {
          group = { text: c.key, kind: c.kind, category: c.category, occurrences: [], valueUse: valueUseInfo(c.text, c.key) };
          abValueUse.set(id, group);
        }
        group.occurrences.push(occurrenceOf(c));
      }
    } else if (c.decision === "suspicious" && c.reason === "template-collision") {
      const template = c.collidingTemplate ?? "";
      const id = `${c.kind}\u0000${c.key}\u0000${template}`;
      let group = susCollision.get(id);
      if (!group) {
        group = { text: c.key, kind: c.kind, template, wrongResult: translator ? translator(c.text) : "", occurrences: [] };
        susCollision.set(id, group);
      }
      group.occurrences.push(occurrenceOf(c));
    } else if (c.decision === "suspicious") {
      pushGroup(susValueUse, c);
    } else if (c.reason === "mixed-jsx") {
      pushGroup(mixedJsx, c);
    }
  }
}

if (parseErrors.length > 0) {
  for (const message of parseErrors) console.error(`✗ 解析失败 ${message}`);
  console.error(`✗ ${parseErrors.length} 个文件无法解析，报告未生成`);
  process.exit(1);
}

const report: Report = {
  scopeFiles: files.length,
  occurrences,
  byReason,
  byCategory,
  translated: [...translated.values()].sort(byCountThenText),
  untranslated: [...untranslated.values()].sort(byCountThenText),
  abValueUse: [...abValueUse.values()].sort(byCountThenText),
  mixedJsx: [...mixedJsx.values()].sort(byCountThenText),
  suspiciousValueUse: [...susValueUse.values()].sort(byCountThenText),
  suspiciousCollision: [...susCollision.values()].sort(byCountThenText),
  usedDictKeys,
};

// ---------------------------------------------------------------------------
// 汇总数字（口径见 summary.md；可翻译位置总数 = 已翻译 + 未翻译）
// ---------------------------------------------------------------------------

const countDecision = (decision: string): number =>
  Object.values(report.byCategory).reduce((sum, c) => sum + (c[decision] ?? 0), 0);

const translatableOccurrences = countDecision("translate");
const skipOccurrences = countDecision("skip");
const suspiciousOccurrences = countDecision("suspicious");
const translatedOccurrences = report.translated.reduce((sum, g) => sum + g.occurrences.length, 0);
const untranslatedOccurrences = report.untranslated.reduce((sum, g) => sum + g.occurrences.length, 0);
const mixedJsxOccurrences = report.mixedJsx.reduce((sum, g) => sum + g.occurrences.length, 0);
const suspiciousValueUseOccurrences = report.suspiciousValueUse.reduce((sum, g) => sum + g.occurrences.length, 0);
const suspiciousCollisionOccurrences = report.suspiciousCollision.reduce((sum, g) => sum + g.occurrences.length, 0);
const abValueUseOccurrences = report.abValueUse.reduce((sum, g) => sum + g.occurrences.length, 0);

if (translatedOccurrences + untranslatedOccurrences !== translatableOccurrences) {
  console.error(
    `✗ 统计口径对不上：已翻译 ${translatedOccurrences} + 未翻译 ${untranslatedOccurrences} != 可翻译 ${translatableOccurrences}`,
  );
  process.exit(1);
}

// 过期词条：词库里有、但运行时永远不会命中的条目（只列出，不删除）。
// 判据是「真正命中的词库 key」——命名占位符模板（如 {fileManager}）被 {0} 形式源码命中时也算已用。
const stale: Array<{ key: string; section: "messages" | "templates" }> = [];
for (const key of Object.keys(messages)) if (!report.usedDictKeys.has(key)) stale.push({ key, section: "messages" });
for (const key of Object.keys(templates)) if (!report.usedDictKeys.has(key)) stale.push({ key, section: "templates" });
stale.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));

const distinctTranslatable = new Set([...report.translated, ...report.untranslated].map((g) => `${g.kind}\u0000${g.text}`)).size;

const suspiciousDistinct =
  new Set(report.suspiciousValueUse.map((g) => g.text)).size +
  new Set(report.suspiciousCollision.map((g) => g.text)).size;

const counts = {
  scopeFiles: report.scopeFiles,
  candidateOccurrences: report.occurrences,
  translatableOccurrences,
  distinctTranslatable,
  translatedOccurrences,
  distinctTranslated: report.translated.length,
  untranslatedOccurrences,
  distinctUntranslated: report.untranslated.length,
  skipOccurrences,
  suspiciousOccurrences,
  suspiciousValueUseOccurrences,
  suspiciousCollisionOccurrences,
  abValueUseOccurrences,
  distinctAbValueUse: report.abValueUse.length,
  mixedJsxOccurrences,
  staleEntries: stale.length,
  usedDictKeys: report.usedDictKeys.size,
  dictMessages: Object.keys(messages).length,
  dictTemplates: Object.keys(templates).length,
};

// ---------------------------------------------------------------------------
// 与上一份报告的变化量：按解析后的版本 / 日期 / 数字序号排，不用字符串序
// ---------------------------------------------------------------------------

interface ParsedTag {
  version: [number, number, number];
  date: number;
  number: number;
}

/** 解析 `vMAJOR.MINOR.PATCH-…YYYYMMDD.N`；取得到多少算多少。 */
function parseTag(value: string): ParsedTag | null {
  const versionMatch = /^v?(\d+)\.(\d+)\.(\d+)/.exec(value);
  if (!versionMatch) return null;
  const dateMatch = /(\d{8})/.exec(value);
  const numberMatch = /\.(\d+)$/.exec(value);
  return {
    version: [Number(versionMatch[1]), Number(versionMatch[2]), Number(versionMatch[3])],
    date: dateMatch ? Number(dateMatch[1]) : 0,
    number: numberMatch ? Number(numberMatch[1]) : 0,
  };
}

function compareTags(a: string, b: string): number {
  const pa = parseTag(a);
  const pb = parseTag(b);
  if (pa && pb) {
    for (let i = 0; i < 3; i++) {
      if (pa.version[i] !== pb.version[i]) return (pa.version[i] as number) - (pb.version[i] as number);
    }
    if (pa.date !== pb.date) return pa.date - pb.date;
    if (pa.number !== pb.number) return pa.number - pb.number;
  }
  return a < b ? -1 : a > b ? 1 : 0;
}

/** 读 reports/<name>/summary.json 的 counts；目录/文件不存在或 JSON 不可用都返回 null。 */
function readCounts(name: string): Record<string, number> | null {
  const file = path.join(reportsDir, name, "summary.json");
  if (!fs.existsSync(file)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(file, "utf8")) as { counts?: Record<string, number> };
    return data.counts ?? {};
  } catch {
    return null;
  }
}

/**
 * 上一份报告：显式 --previous=，否则取解析后排在当前基线之前、且**带可用 summary.json** 的最近一份。
 * 按版本逆序找第一份完整的，免得只有 summary.md 的残留/中断目录遮蔽更早的完整报告。
 */
function previousReport(): { tag: string; counts: Record<string, number> } | null {
  if (explicitPrevious) {
    const counts = readCounts(explicitPrevious);
    return counts ? { tag: explicitPrevious, counts } : null;
  }
  if (!fs.existsSync(reportsDir)) return null;
  if (!parseTag(tag)) return null;
  const earlier = fs
    .readdirSync(reportsDir)
    .filter((name) => name !== tag && parseTag(name) !== null && compareTags(name, tag) < 0)
    .sort((a, b) => compareTags(b, a));
  for (const name of earlier) {
    const counts = readCounts(name);
    if (counts) return { tag: name, counts };
  }
  return null;
}

const previous = previousReport();

// ---------------------------------------------------------------------------
// 输出
// ---------------------------------------------------------------------------

/** Markdown 表格/行内代码里安全显示文本：换行转义、竖线转义。 */
function md(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\|/g, "\\|").replace(/\r\n|\n|\r/g, "\\n");
}

function codeSpan(text: string): string {
  return `\`${md(text).replace(/`/g, "\\`")}\``;
}

function formatOccurrences(list: Occurrence[]): string {
  return sortOccurrences(list)
    .map((o) => `\`${o.file}:${o.line}\`（${o.category}${o.context ? `，${o.context}` : ""}）`)
    .join("；");
}

function formatValueUse(info: ValueUseInfo): string {
  if (info.locations.length === 0) return info.count === 0 ? "（预扫描未记录到值用途位置）" : `（未记录具体位置，总数 ${info.count}）`;
  const list = info.locations.map((l) => `\`${toPosix(l.file)}:${l.line}\`（${l.kind}）`).join("；");
  return info.count > info.locations.length ? `${list}；…（共 ${info.count} 处）` : list;
}

const pct = (part: number, whole: number): string => (whole === 0 ? "—" : `${((part / whole) * 100).toFixed(1)}%`);

function writeSummary(): void {
  const lines: string[] = [];
  lines.push(`# 覆盖率报告 ${tag}`);
  lines.push("");
  lines.push(`- 扫描根：\`${toPosix(path.relative(ZH_ROOT, root) || ".")}\`（默认 \`upstream/\`，基线 worktree）`);
  lines.push(`- 词库：\`dict/zh-CN.json\`，messages ${counts.dictMessages} + templates ${counts.dictTemplates}`);
  lines.push(`- 判定来源：\`plugin/matcher.ts\` 的 \`createScanContext\` / \`listScopeFiles\` / \`scanModule\``);
  lines.push(`- 预扫描：${ctx.prescan.fileCount} 个文件，值用途字面量 ${ctx.valueUse.size} 个，0 个解析错误`);
  lines.push(
    `- 扫描范围：${counts.scopeFiles} 个文件（§4：apps/web/src 与 web 依赖的 packages/*/src，排除测试/stories/bench/.d.ts）`,
  );
  lines.push("");
  lines.push("## 口径");
  lines.push("");
  lines.push(
    "- 报告按文件系统扫描 §4 范围（含未被 web 实际引入的 packages/ 文件），而构建插件只转换进入 web 构建模块图的文件，覆盖率数字因此**略偏保守**（分母偏大）。",
  );
  lines.push(
    "- **可翻译位置总数**指 `scanModule` 判定为 `translate` 的候选出现次数（同一段文字多处出现算多次）；**去重后的文字数**按「相同 text + 相同 kind」合并。",
  );
  lines.push(
    "- **已翻译 / 未翻译按运行时实际查表归类**：对每个 `translate` 候选，先查 messages 再查 templates（`runtime/t3zh-runtime.ts` 的 `createTranslator`，也是 matcher 做模板误配检查时用的同一实现与顺序）。能查到即「已翻译」，即使源码里的建议 key 是 `{0}` 形式、而词库用的是命名占位符（如源码 `Open in {0}` 命中词库模板 `Open in {fileManager}`）。查不到才是「未翻译」。",
  );
  lines.push(
    "- `untranslated.json` 里的 `text` 是**建议 key**（把运行时表达式换成 `{0}`、`{1}` 后的形式），补词条时用它；它与「已用词条」是两套 key，别混。",
  );
  lines.push(
    "- 可疑项、mixed-jsx 与 A/B 值用途重名清单都**单独统计**，不计入可翻译位置总数；因此 `可翻译位置总数 = 已翻译 + 未翻译` 恒成立。",
  );
  lines.push(
    "- **过期词条（stale）**：词库里有、但没有任何 `translate` 候选会在运行时命中它的条目（按真正命中的词库 key 判据，不按源码里搜不搜得到）。只列出，不删除。",
  );
  lines.push("- 位置分类 A/B/C/D 与 reason 代码见 CONVENTIONS §4 与 `plugin/matcher.ts` 的 `Candidate.reason` 注释。");
  lines.push("");
  lines.push("## 数字");
  lines.push("");
  lines.push("| 指标 | 出现次数 | 去重后文字数 |");
  lines.push("|---|---:|---:|");
  lines.push(`| 可翻译位置总数 | ${counts.translatableOccurrences} | ${counts.distinctTranslatable} |`);
  lines.push(`| 已翻译 | ${counts.translatedOccurrences}（${pct(counts.translatedOccurrences, counts.translatableOccurrences)}） | ${counts.distinctTranslated} |`);
  lines.push(`| 未翻译 | ${counts.untranslatedOccurrences}（${pct(counts.untranslatedOccurrences, counts.translatableOccurrences)}） | ${counts.distinctUntranslated} |`);
  lines.push(`| 可疑项 | ${counts.suspiciousOccurrences} | ${suspiciousDistinct} |`);
  lines.push(`| └ value-use | ${counts.suspiciousValueUseOccurrences} | ${new Set(report.suspiciousValueUse.map((g) => g.text)).size} |`);
  lines.push(`| └ template-collision | ${counts.suspiciousCollisionOccurrences} | ${new Set(report.suspiciousCollision.map((g) => g.text)).size} |`);
  lines.push(`| mixed-jsx | ${counts.mixedJsxOccurrences} | ${report.mixedJsx.length} |`);
  lines.push(`| A/B 值用途重名（单独清单，见 ab-value-use.md） | ${counts.abValueUseOccurrences} | ${counts.distinctAbValueUse} |`);
  lines.push(`| 过期词条（stale） | ${counts.staleEntries} | — |`);
  lines.push("");
  lines.push(
    `对账：可翻译位置总数 ${counts.translatableOccurrences} = 已翻译 ${counts.translatedOccurrences} + 未翻译 ${counts.untranslatedOccurrences} ✅`,
  );
  lines.push("");
  lines.push("## 分类分布（translate / skip / suspicious）");
  lines.push("");
  lines.push("| 类别 | translate | skip | suspicious |");
  lines.push("|---|---:|---:|---:|");
  for (const category of ["A", "B", "C", "D"]) {
    const c = report.byCategory[category] ?? { translate: 0, skip: 0, suspicious: 0 };
    lines.push(`| ${category} | ${c.translate ?? 0} | ${c.skip ?? 0} | ${c.suspicious ?? 0} |`);
  }
  lines.push("");
  lines.push("## 按 reason 的出现次数");
  lines.push("");
  for (const reason of Object.keys(report.byReason).sort()) {
    lines.push(`- \`${reason}\`：${report.byReason[reason]}`);
  }
  lines.push("");
  lines.push("## 与上一份报告的对比");
  lines.push("");
  if (!previous) {
    lines.push(
      explicitPrevious
        ? `（--previous=${explicitPrevious} 找不到对应报告。）`
        : "（reports/ 下没有早于当前基线、且带可用 summary.json 的报告，这是首份；只有 summary.md 的残留目录会跳过。）",
    );
  } else {
    lines.push(`对照 \`reports/${previous.tag}\`（只列本次出现的指标，正数表示比上次多）：`);
    lines.push("");
    lines.push("| 指标 | 本次 | 上次 | 变化 |");
    lines.push("|---|---:|---:|---:|");
    for (const key of Object.keys(counts)) {
      const before = previous.counts[key];
      if (before === undefined) continue;
      const delta = counts[key as keyof typeof counts] - before;
      lines.push(`| ${key} | ${counts[key as keyof typeof counts]} | ${before} | ${delta > 0 ? "+" : ""}${delta} |`);
    }
  }
  lines.push("");
  lines.push("## 附：A/B 值用途重名");
  lines.push("");
  lines.push(
    `A（JSX 文本/子表达式）和 B 原始白名单属性即使与值用途字面量相同也照常转换（只用于显示），但 §4 要求在报告里列出——见 \`ab-value-use.md\`（${counts.abValueUseOccurrences} 处）。`,
  );
  lines.push("");
  fs.writeFileSync(path.join(outDir, "summary.md"), lines.join("\n"));
}

function writeSummaryJson(): void {
  fs.writeFileSync(path.join(outDir, "summary.json"), `${JSON.stringify({ tag, root: rel(root), counts }, null, 2)}\n`);
}

function writeUntranslated(): void {
  const data = report.untranslated.map((group) => ({
    text: group.text,
    kind: group.kind,
    occurrences: sortOccurrences(group.occurrences),
  }));
  fs.writeFileSync(path.join(outDir, "untranslated.json"), `${JSON.stringify(data, null, 2)}\n`);
}

function writeAbValueUse(): void {
  const lines: string[] = [];
  lines.push(`# A/B 值用途重名 ${tag}`);
  lines.push("");
  lines.push(
    "A（JSX 文本/子表达式）和 B 原始白名单属性的文字，即使同一文本也出现在「从不转换」的值用途位置（比较、`switch case`、`as const`、字面量类型、对象键），仍照常转换——它们只用于显示。§4 要求把这些位置列出以便人工核对：若上游将来改成拿这些字段做判断，就需要改判定。",
  );
  lines.push("");
  lines.push(
    `共 ${counts.abValueUseOccurrences} 处显示位置（${counts.distinctAbValueUse} 条文字）。此清单与 suspicious、可翻译计数分开统计，不计入可翻译位置总数。`,
  );
  lines.push("");
  for (const group of report.abValueUse) {
    lines.push(`### ${codeSpan(group.text)}（${group.category}，${group.kind}，${group.occurrences.length} 处）`);
    lines.push("");
    lines.push(`- 显示位置（照常转换）：${formatOccurrences(group.occurrences)}`);
    lines.push(`- 同一文本作为值用途字面量出现 ${group.valueUse.count} 次：${formatValueUse(group.valueUse)}`);
    lines.push("");
  }
  fs.writeFileSync(path.join(outDir, "ab-value-use.md"), lines.join("\n"));
}

function writeSuspicious(): void {
  const lines: string[] = [];
  lines.push(`# 可疑项 ${tag}`);
  lines.push("");
  lines.push(
    `价值用途与模板误配，默认都不转换。value-use ${counts.suspiciousValueUseOccurrences} 处（${new Set(report.suspiciousValueUse.map((g) => g.text)).size} 条文字）、template-collision ${counts.suspiciousCollisionOccurrences} 处（${new Set(report.suspiciousCollision.map((g) => g.text)).size} 条文字）。`,
  );
  lines.push("");
  lines.push("## value-use");
  lines.push("");
  lines.push(
    "这些文字也出现在「从不转换」的位置（比较、`switch case`、`as const`、字面量类型、对象键等），默认不转换。人工确认安全后，把精确的文字加进 `dict/allow-suspicious.json`（JSON 字符串数组）即可放行。",
  );
  lines.push("");
  for (const group of report.suspiciousValueUse) {
    lines.push(`### ${codeSpan(group.text)}（${group.kind}，${group.occurrences.length} 处）`);
    lines.push("");
    lines.push(`- 可疑位置：${formatOccurrences(group.occurrences)}`);
    lines.push(`- 作为值用途字面量出现 ${group.valueUse.count} 次：${formatValueUse(group.valueUse)}`);
    lines.push("");
  }
  lines.push("## template-collision");
  lines.push("");
  lines.push(
    "这些文字（或带表达式的模板字面量）不在 `messages` 里，却会被某条 `templates` 匹配，运行时会得到半中半英的错误译文。默认不转换。处理办法：给它补一条**精确的 `messages` 词条**（静态文本），或收窄/删除撞上的那条模板。",
  );
  lines.push("");
  for (const group of report.suspiciousCollision) {
    lines.push(`### ${codeSpan(group.text)}（${group.kind}，${group.occurrences.length} 处）`);
    lines.push("");
    lines.push(`- 可疑位置：${formatOccurrences(group.occurrences)}`);
    lines.push(`- 撞上的模板：${codeSpan(group.template)}`);
    lines.push(`- 运行时错误译文：${codeSpan(group.wrongResult)}`);
    lines.push("");
  }
  fs.writeFileSync(path.join(outDir, "suspicious.md"), lines.join("\n"));
}

function writeMixedJsx(): void {
  const lines: string[] = [];
  lines.push(`# mixed-jsx ${tag}`);
  lines.push("");
  lines.push(
    "文本和表达式混排的 JSX 子节点（如 `<span>{count} files</span>`）。v1 记为 skip（reason `mixed-jsx`），不转换；此清单留作以后决定要不要支持时用。",
  );
  lines.push("");
  lines.push(`共 ${counts.mixedJsxOccurrences} 处（${report.mixedJsx.length} 条文字）。`);
  lines.push("");
  for (const group of report.mixedJsx) {
    lines.push(`- ${codeSpan(group.text)}（${group.occurrences.length} 处）：${formatOccurrences(group.occurrences)}`);
  }
  fs.writeFileSync(path.join(outDir, "mixed-jsx.md"), lines.join("\n"));
}

function writeStale(): void {
  const data = stale.map((entry) => ({
    key: entry.key,
    section: entry.section,
    value: entry.section === "messages" ? messages[entry.key] : templates[entry.key],
  }));
  fs.writeFileSync(path.join(outDir, "stale.json"), `${JSON.stringify(data, null, 2)}\n`);
}

fs.mkdirSync(outDir, { recursive: true });
writeSummary();
writeSummaryJson();
writeUntranslated();
writeAbValueUse();
writeSuspicious();
writeMixedJsx();
writeStale();

console.log(
  `覆盖率报告已写入 reports/${tag}/：可翻译 ${counts.translatableOccurrences}（去重 ${counts.distinctTranslatable}），` +
    `已翻译 ${counts.translatedOccurrences}（${pct(counts.translatedOccurrences, counts.translatableOccurrences)}），` +
    `未翻译 ${counts.untranslatedOccurrences}，可疑 value-use ${counts.suspiciousValueUseOccurrences} / ` +
    `template-collision ${counts.suspiciousCollisionOccurrences}，mixed-jsx ${counts.mixedJsxOccurrences}，` +
    `A/B 重名 ${counts.abValueUseOccurrences}，过期词条 ${counts.staleEntries}`,
);
