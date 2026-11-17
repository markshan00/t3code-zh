/**
 * 上游 gt-react 中文语言包的构建期叠加（T33 语言方案第 3 条，tasks/T33-upgrade-v0110.md）。
 *
 * 上游 v0.1.10 起用 gt-react 给设置页做了多语言：`apps/web/src/i18n/translations/<locale>.json`，
 * 键是 GT 按原文算出的哈希，`en.json` 是哈希 → 英文原文，`zh.json` 是哈希 → 上游中文。
 * `gt("…")` / `msg("…")` + `m()` 不在插件的转换位置里，中文模式下显示的是 GT 的 zh 包，
 * 用词与我们的词库不一致（线程 / 任务、通用 / 常规……）。这里在构建时改写 zh.json 这个模块：
 *
 *   对 en.json 的每个哈希，原文在主词库 messages 里有精确词条（去首尾空白后完全相同）就用我们的
 *   译文，否则保留上游 zh.json 的译文（上游也没有就不写，GT 显示英文原文）。
 *
 * 不叠加（保留上游）的情况：
 *   - 原文不是字符串（GT 给带变量的 <T> 存的是 JSX 结构）；
 *   - 原文含 `{` / `}`：带占位符或 ICU 参数；
 *   - 我们的译文含 `{` `}` `'` `<` `>`：GT 对 gt() / m() 的译文按 ICU 解释，`''`、`'{x}'` 会被改写，
 *     `<b>` 会打「String interpolation failed」日志（探针 .build/T33/A1/probe/icu-probe.json），
 *     为了显示与词库逐字一致，这类条目不叠加。
 * zh.json 里有、en.json 里已没有的哈希（上游删掉的原文）原样保留，不增不删。
 *
 * 不手改上游文件，也不做成补丁：插件在 load 钩子里返回叠加后的 JSON 文本（见 vite-plugin-t3zh.ts）。
 * 只用可擦除的 TS 语法：本文件会被 Node 直接加载。
 */
import fs from "node:fs";
import path from "node:path";

/** 上游 GT 语言包的位置（相对 monorepo 根）。 */
export const GT_TRANSLATIONS_DIR = "apps/web/src/i18n/translations";
export const GT_EN_FILE = `${GT_TRANSLATIONS_DIR}/en.json`;
export const GT_ZH_FILE = `${GT_TRANSLATIONS_DIR}/zh.json`;
/** 上游加载语言包的模块（`import(\`./translations/${locale}.json\`)`）：它进了构建，zh.json 就必须经过叠加。 */
export const GT_LOADER_FILE = "apps/web/src/i18n/initializeI18n.ts";

export type GtCatalog = Record<string, unknown>;

export type GtOverlaySource = "dict" | "upstream" | "none";
export type GtOverlayReason =
  | "dict-exact"
  | "no-dict-entry"
  | "placeholder"
  | "non-string"
  | "icu-sensitive-translation";

export interface GtOverlayEntry {
  hash: string;
  /** en.json 的原文。 */
  source: unknown;
  /** 上游 zh.json 的译文（没有时 undefined）。 */
  upstream: unknown;
  /** 叠加后的值（没有时 undefined：GT 显示英文原文）。 */
  final: unknown;
  /** 最终值来自哪里。 */
  from: GtOverlaySource;
  reason: GtOverlayReason;
}

export interface GtOverlayResult {
  catalog: GtCatalog;
  entries: GtOverlayEntry[];
  /** zh.json 里有、en.json 里没有的哈希（原样保留）。 */
  orphanHashes: string[];
  counts: Record<GtOverlaySource, number> & { orphans: number; total: number };
}

const PLACEHOLDER_CHARS = /[{}]/;
const ICU_SENSITIVE_CHARS = /[{}'<>]/;

/** 按上面的规则叠加。纯函数：插件、测试和 72 条结果表共用。 */
export function overlayGtTranslations(en: GtCatalog, zh: GtCatalog, messages: Record<string, string>): GtOverlayResult {
  const catalog: GtCatalog = {};
  const entries: GtOverlayEntry[] = [];
  const counts = { dict: 0, upstream: 0, none: 0, orphans: 0, total: 0 };
  for (const [hash, source] of Object.entries(en)) {
    const upstream = Object.hasOwn(zh, hash) ? zh[hash] : undefined;
    let final = upstream;
    let reason: GtOverlayReason;
    if (typeof source !== "string") {
      reason = "non-string";
    } else if (PLACEHOLDER_CHARS.test(source)) {
      reason = "placeholder";
    } else {
      const trimmed = source.trim();
      const ours = trimmed === "" || !Object.hasOwn(messages, trimmed) ? undefined : messages[trimmed];
      if (typeof ours !== "string") {
        reason = "no-dict-entry";
      } else if (ICU_SENSITIVE_CHARS.test(ours)) {
        reason = "icu-sensitive-translation";
      } else {
        const leading = source.slice(0, source.length - source.trimStart().length);
        const trailing = source.slice(source.trimEnd().length);
        final = leading + ours + trailing;
        reason = "dict-exact";
      }
    }
    const from: GtOverlaySource = reason === "dict-exact" ? "dict" : final === undefined ? "none" : "upstream";
    if (final !== undefined) catalog[hash] = final;
    entries.push({ hash, source, upstream, final, from, reason });
    counts[from] += 1;
    counts.total += 1;
  }
  const orphanHashes: string[] = [];
  for (const [hash, value] of Object.entries(zh)) {
    if (Object.hasOwn(en, hash)) continue;
    catalog[hash] = value;
    orphanHashes.push(hash);
  }
  counts.orphans = orphanHashes.length;
  return { catalog, entries, orphanHashes, counts };
}

function readCatalog(file: string): GtCatalog {
  const value: unknown = JSON.parse(fs.readFileSync(file, "utf8"));
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`t3zh: ${file} is not a JSON object`);
  }
  return value as GtCatalog;
}

/** 读 monorepo 里的 en.json / zh.json 并叠加；返回叠加结果和要交给打包器的 JSON 文本。 */
export function buildGtZhCatalog(monorepoRoot: string, messages: Record<string, string>): GtOverlayResult & { code: string } {
  const en = readCatalog(path.join(monorepoRoot, GT_EN_FILE));
  const zh = readCatalog(path.join(monorepoRoot, GT_ZH_FILE));
  const result = overlayGtTranslations(en, zh, messages);
  return { ...result, code: `${JSON.stringify(result.catalog, null, 2)}\n` };
}
