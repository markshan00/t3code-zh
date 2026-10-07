/**
 * t3code-zh：桌面主进程的界面文字与系统语言（T07）。
 *
 * 构建时由 scripts/build-zh.sh 复制到 .build/src/apps/desktop/src/t3zh/，同一目录里还有：
 *   - t3zh-runtime.ts      ← runtime/t3zh-runtime.ts 原样复制（查表、语言解析与 web 用同一份代码）
 *   - zh-CN.desktop.json   ← dict/zh-CN.desktop.json 原样复制
 * patches/0003 在菜单、对话框等位置把英文原文包成 `__t3zh_t(<原表达式>)`；解析出的语言是 en 时原样返回，
 * 输出与原版一致。
 *
 * 语言：主进程读不到 web 的 localStorage，只跟随系统——`app.getPreferredSystemLanguages()` 交给 web 运行时的
 * 同一个 `resolveSystemLocale`（CONVENTIONS §5 的列表检查规则：en → en；zh 且脚本为 Hans → zh-CN；zh-Hant → en；
 * 其他语言跳过；都不符合 → en）。第一次调用时确定，之后不变（菜单也只构建一次）。
 *
 * 同一份系统语言列表还经主窗口 `webPreferences.additionalArguments` 传给 preload，由 preload 暴露为
 * `globalThis.__t3zhSystemLanguages`（§5 语言来源第 1 级），见 `systemLanguagesArgument()`。
 */
import * as Electron from "electron";

import { createTranslator, resolveSystemLocale, type Locale, type T3zhDict } from "./t3zh-runtime.ts";
import desktopDict from "./zh-CN.desktop.json" with { type: "json" };

/** 主窗口 additionalArguments 里的参数前缀；preload（patches/0003）按同一前缀从 process.argv 读取。 */
export const SYSTEM_LANGUAGES_ARGUMENT_PREFIX = "--t3zh-system-languages=";

export interface DesktopTranslator {
  readonly locale: Locale;
  readonly t: (value: string) => string;
}

export function createDesktopTranslator(
  languages: readonly string[],
  dict: T3zhDict = desktopDict,
): DesktopTranslator {
  const locale = resolveSystemLocale(languages);
  if (locale !== "zh-CN") return { locale, t: (value) => value };
  const translate = createTranslator(dict);
  return { locale, t: (value) => (typeof value === "string" ? translate(value) : value) };
}

/** 系统首选语言列表（`app.getPreferredSystemLanguages()`）；读不到时返回空列表，解析为 en。 */
export function readSystemLanguages(): string[] {
  try {
    const languages: unknown = Electron.app.getPreferredSystemLanguages();
    return Array.isArray(languages)
      ? languages.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

/** 主窗口创建时调用：`--t3zh-system-languages=<JSON 数组>`。 */
export function systemLanguagesArgument(): string {
  return SYSTEM_LANGUAGES_ARGUMENT_PREFIX + JSON.stringify(readSystemLanguages());
}

let current: DesktopTranslator | undefined;

/** 主进程文字查表。语言在第一次调用时按系统语言确定。 */
export function __t3zh_t(value: string): string {
  current ??= createDesktopTranslator(readSystemLanguages());
  return current.t(value);
}

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/**
 * 查表后做 HTML 转义，用在主进程拼的 `data:` HTML 里（文本节点或双引号属性值）。
 * 补丁只把它用在不含 `& < > " '` 的英文原文上，所以 en 时输出与原版逐字相同。
 */
export function __t3zh_html(value: string): string {
  return __t3zh_t(value).replace(/[&<>"']/g, (character) => HTML_ESCAPES[character] ?? character);
}

/**
 * 查表后写成 JS 字符串字面量（含两侧双引号），用在主进程拼的内联 `<script>` 里；`<` 转成 `<`，
 * 译文里出现 `</script>` 也不会提前结束脚本。en 时与原版的 `"<英文>"` 逐字相同。
 */
export function __t3zh_js(value: string): string {
  return JSON.stringify(__t3zh_t(value)).replace(/</g, "\\u003c");
}
