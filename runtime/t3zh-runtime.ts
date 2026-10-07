/**
 * t3code-zh 运行时（CONVENTIONS §5）。
 *
 * - 构建时插件把界面文字包成 `__t3zh_t(<原表达式>)`，并通过虚拟模块
 *   `virtual:t3zh-runtime` 注入本文件导出的 `installT3zhRuntime(词库)` 的结果。
 * - 语言只在页面加载时确定一次；切换语言写 localStorage 后刷新页面
 *   （React Compiler 会缓存渲染结果，全局函数返回值变了不会触发重渲染）。
 * - 只用可擦除的 TS 语法：本文件会被 Node 直接加载（单元测试、插件构建期检查），
 *   也会被 Vite（oxc）和 React Compiler（babel，typescript+jsx 解析）处理。
 *
 * 本文件只依赖标准全局对象，且全部做了存在性判断：在 Worker、Node 等没有
 * window/localStorage/document 的环境里也能加载。
 */

export type Locale = "en" | "zh-CN";
export type LocalePreference = "system" | "en" | "zh-CN";

export interface T3zhDict {
  messages: Record<string, string>;
  templates: Record<string, string>;
}

export const LOCALE_STORAGE_KEY = "t3code-zh.locale";
export const LOCALE_PREFERENCES: readonly LocalePreference[] = ["system", "en", "zh-CN"];

/** 查表结果缓存的上限。超过后整体清空，避免动态文本（计时、计数）让缓存无限增长。 */
export const TRANSLATION_CACHE_LIMIT = 10_000;

// 词库占位符语法与 scripts/check-dict.ts 一致：`{name}`（字母开头）或 `{0}`。
const PLACEHOLDER_PATTERN = /\{([A-Za-z][A-Za-z0-9_]*|\d+)\}/g;
const LETTER_PATTERN = /\p{L}/u;

export function isLocalePreference(value: unknown): value is LocalePreference {
  return value === "system" || value === "en" || value === "zh-CN";
}

/**
 * `system` 偏好下的语言解析（§5）：依次检查 languages，取第一个可识别的。
 * - 语言是 en → en
 * - 语言是 zh：maximize 后脚本是 Hans → zh-CN；是 Hant → en
 * - 其他语言（以及无法解析的标签）跳过，看下一项
 * 都不符合返回 en。
 */
export function resolveSystemLocale(languages: readonly string[]): Locale {
  for (const tag of languages) {
    if (typeof tag !== "string" || tag.trim() === "") continue;
    let locale: Intl.Locale;
    try {
      locale = new Intl.Locale(tag);
    } catch {
      continue;
    }
    if (locale.language === "en") return "en";
    if (locale.language === "zh") {
      let script: string | undefined;
      try {
        script = locale.maximize().script;
      } catch {
        script = locale.script;
      }
      if (script === "Hans") return "zh-CN";
      if (script === "Hant") return "en";
    }
  }
  return "en";
}

export function resolveLocale(preference: LocalePreference, languages: readonly string[]): Locale {
  if (preference === "en" || preference === "zh-CN") return preference;
  return resolveSystemLocale(languages);
}

interface TemplatePart {
  literal: string | null;
  name: string | null;
}

interface CompiledTemplate {
  key: string;
  /** 英文模板里第一个占位符之前的字面文字，用于快速预筛。 */
  prefix: string;
  /** 英文模板里最后一个占位符之后的字面文字，用于快速预筛。 */
  suffix: string;
  /** 字面文字（不含占位符）的总长度：排序用，也是可匹配输入的最短长度下限。 */
  literalLength: number;
  /** 中文模板拆成的片段。 */
  target: TemplatePart[];
  /** 占位符名 → 正则捕获组序号（同名占位符重复出现时用反向引用约束为同一值）。 */
  groupOf: Map<string, number>;
  regex: RegExp | null;
}

function splitTemplate(template: string): TemplatePart[] {
  const parts: TemplatePart[] = [];
  let last = 0;
  for (const match of template.matchAll(PLACEHOLDER_PATTERN)) {
    const index = match.index ?? 0;
    if (index > last) parts.push({ literal: template.slice(last, index), name: null });
    parts.push({ literal: null, name: match[1] ?? "" });
    last = index + match[0].length;
  }
  if (last < template.length) parts.push({ literal: template.slice(last), name: null });
  return parts;
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\/-]/g, "\\$&");
}

/**
 * 预处理一条模板。以下情况返回 null（该模板不参与匹配）：
 * - 没有占位符（应在 messages 里，check-dict 会拦）；
 * - 中文侧用了英文侧没有的占位符（无法代入）；
 * - 字面部分不含任何字母：例如 `{0} · {1}`、`{0}/{1}`，会匹配几乎任意文本，
 *   把无关字符串改坏（如路径 `a/b`）。
 */
function prepareTemplate(key: string, value: string): CompiledTemplate | null {
  const source = splitTemplate(key);
  const target = splitTemplate(value);
  const names = new Set<string>();
  let literal = "";
  for (const part of source) {
    if (part.name !== null) names.add(part.name);
    else literal += part.literal ?? "";
  }
  if (names.size === 0) return null;
  if (!LETTER_PATTERN.test(literal)) return null;
  for (const part of target) {
    if (part.name !== null && !names.has(part.name)) return null;
  }
  const first = source[0];
  const lastPart = source[source.length - 1];
  return {
    key,
    prefix: first && first.name === null ? (first.literal ?? "") : "",
    suffix: lastPart && lastPart.name === null && source.length > 1 ? (lastPart.literal ?? "") : "",
    literalLength: literal.length,
    target,
    groupOf: new Map(),
    regex: null,
  };
}

/** 第一次用到时才编译正则（§5：模板正则在第一次用到时编译并缓存）。 */
function compileRegex(template: CompiledTemplate): RegExp {
  if (template.regex) return template.regex;
  let pattern = "^";
  let group = 0;
  for (const part of splitTemplate(template.key)) {
    if (part.name === null) {
      pattern += escapeRegExp(part.literal ?? "");
      continue;
    }
    const existing = template.groupOf.get(part.name);
    if (existing !== undefined) {
      pattern += `\\${existing}`;
    } else {
      group += 1;
      template.groupOf.set(part.name, group);
      pattern += "(.+?)";
    }
  }
  pattern += "$";
  // s 标志：占位符的值允许跨行（如多行错误信息）。
  template.regex = new RegExp(pattern, "s");
  return template.regex;
}

export interface Translator {
  /** 按 §5 第 2、3 步查表；未命中原样返回。调用方负责第 1 步（非字符串、en 模式）。 */
  (value: string): string;
  /** 只查 messages（去首尾空白后精确匹配），未命中返回 undefined。构建期检查用。 */
  lookupMessage(value: string): string | undefined;
  /** 只做模板匹配（输入先去首尾空白），未命中返回 undefined。构建期检查用。 */
  matchTemplate(value: string): { key: string; result: string } | undefined;
}

export function createTranslator(dict: T3zhDict): Translator {
  const messages = new Map<string, string>(Object.entries(dict.messages ?? {}));
  const cache = new Map<string, string>();
  let templates: CompiledTemplate[] | null = null;

  function getTemplates(): CompiledTemplate[] {
    if (templates) return templates;
    const prepared: CompiledTemplate[] = [];
    for (const [key, value] of Object.entries(dict.templates ?? {})) {
      const template = prepareTemplate(key, value);
      if (template) prepared.push(template);
    }
    // 长模板优先：先比字面文字长度（占位符名长短没有意义），再比整体长度，最后按码点排，保证确定性。
    prepared.sort(
      (a, b) =>
        b.literalLength - a.literalLength ||
        b.key.length - a.key.length ||
        (a.key < b.key ? -1 : a.key > b.key ? 1 : 0),
    );
    templates = prepared;
    return templates;
  }

  function matchTrimmed(trimmed: string): { key: string; result: string } | undefined {
    for (const template of getTemplates()) {
      if (trimmed.length <= template.literalLength) continue;
      if (!trimmed.startsWith(template.prefix) || !trimmed.endsWith(template.suffix)) continue;
      const match = compileRegex(template).exec(trimmed);
      if (!match) continue;
      let result = "";
      for (const part of template.target) {
        if (part.name === null) {
          result += part.literal ?? "";
        } else {
          const group = template.groupOf.get(part.name);
          result += group === undefined ? "" : (match[group] ?? "");
        }
      }
      return { key: template.key, result };
    }
    return undefined;
  }

  function lookup(value: string): string {
    const trimmed = value.trim();
    if (trimmed === "") return value;
    const leading = value.slice(0, value.length - value.trimStart().length);
    const trailing = value.slice(value.trimEnd().length);
    const message = messages.get(trimmed);
    if (message !== undefined) return leading + message + trailing;
    const template = matchTrimmed(trimmed);
    if (template) return leading + template.result + trailing;
    return value;
  }

  const translate = ((value: string): string => {
    const cached = cache.get(value);
    if (cached !== undefined) return cached;
    const result = lookup(value);
    if (cache.size >= TRANSLATION_CACHE_LIMIT) cache.clear();
    cache.set(value, result);
    return result;
  }) as Translator;
  translate.lookupMessage = (value: string) => messages.get(value.trim());
  translate.matchTemplate = (value: string) => {
    const trimmed = value.trim();
    return trimmed === "" ? undefined : matchTrimmed(trimmed);
  };
  return translate;
}

/** 运行时依赖的全局对象。默认取 globalThis；测试时传入替身。 */
export interface RuntimeEnv {
  localStorage?: { getItem(key: string): string | null; setItem(key: string, value: string): void } | null;
  navigator?: { languages?: readonly string[]; language?: string; userAgent?: string } | null;
  /** 桌面版 preload 暴露的系统首选语言（globalThis.__t3zhSystemLanguages，T07 提供）。 */
  systemLanguages?: unknown;
  document?: { documentElement?: { lang: string } | null } | null;
  location?: { reload(): void } | null;
  /** 挂 `__t3zh` 全局 API 的对象（浏览器里是 window）。 */
  target?: Record<string, unknown> | null;
}

export interface T3zhGlobalApi {
  getLocale(): LocalePreference;
  getResolvedLocale(): Locale;
  setLocale(value: LocalePreference): void;
  /** 与注入的 `__t3zh_t` 是同一个函数；供补丁在显示位置翻译那些同时被代码当作值比较的文字（§5，2026-10-05 追加）。 */
  t(value: unknown): unknown;
}

export interface InstalledRuntime {
  /** 注入到被转换模块的 `__t3zh_t`。 */
  t: (value: unknown) => unknown;
  preference: LocalePreference;
  locale: Locale;
  api: T3zhGlobalApi;
}

function defaultEnv(): RuntimeEnv {
  const g = globalThis as Record<string, any>;
  // 可选属性的索引类型含 undefined；去掉它，exactOptionalPropertyTypes 下才能原样赋回 localStorage。
  let storage: NonNullable<RuntimeEnv["localStorage"]> | null = null;
  try {
    // 某些环境（隐私模式、sandbox iframe）访问 localStorage 本身就会抛错。
    storage = g.localStorage ?? null;
  } catch {
    storage = null;
  }
  return {
    localStorage: storage,
    navigator: g.navigator ?? null,
    document: g.document ?? null,
    location: g.location ?? null,
    systemLanguages: g.__t3zhSystemLanguages,
    target: typeof g.window === "object" && g.window !== null ? g.window : null,
  };
}

function readPreference(env: RuntimeEnv): LocalePreference {
  try {
    const value = env.localStorage?.getItem(LOCALE_STORAGE_KEY);
    return isLocalePreference(value) ? value : "system";
  } catch {
    return "system";
  }
}

/**
 * `system` 偏好时的语言来源（§5，2026-10-05 定案）：
 * 1. globalThis.__t3zhSystemLanguages 是非空字符串数组时用它（桌面版 preload 暴露的 app.getPreferredSystemLanguages()）；
 * 2. 否则在 Electron 里（userAgent 含 "Electron/"）用 navigator.languages 去掉第一项后的列表
 *    （第一项是打包配置 electronLanguages 固定的应用语言 en-US；去掉后为空就用原列表）；
 * 3. 否则用 navigator.languages（为空就用 navigator.language）。
 */
export function systemLanguageList(env: RuntimeEnv): string[] {
  const exposed = env.systemLanguages;
  if (Array.isArray(exposed) && exposed.length > 0 && exposed.every((item) => typeof item === "string")) {
    return [...exposed];
  }
  const nav = env.navigator;
  if (!nav) return [];
  const languages = nav.languages && nav.languages.length > 0 ? Array.from(nav.languages) : [];
  const isElectron = typeof nav.userAgent === "string" && nav.userAgent.includes("Electron/");
  if (languages.length > 0) {
    return isElectron && languages.length > 1 ? languages.slice(1) : languages;
  }
  return typeof nav.language === "string" && nav.language !== "" ? [nav.language] : [];
}

/**
 * 页面加载时调用一次：确定语言、设置 `<html lang>`、挂 `window.__t3zh`，返回 `__t3zh_t`。
 * `dict` 可以是 JSON 字符串：只有解析出的语言是 zh-CN 时才解析，en 模式不付出解析成本。
 */
export function installT3zhRuntime(dict: T3zhDict | string, env: RuntimeEnv = defaultEnv()): InstalledRuntime {
  const preference = readPreference(env);
  const locale = resolveLocale(preference, systemLanguageList(env));

  let t: (value: unknown) => unknown;
  if (locale === "en") {
    t = (value) => value;
  } else {
    const translate = createTranslator(typeof dict === "string" ? (JSON.parse(dict) as T3zhDict) : dict);
    t = (value) => (typeof value === "string" ? translate(value) : value);
  }

  const api: T3zhGlobalApi = {
    getLocale: () => readPreference(env),
    getResolvedLocale: () => locale,
    setLocale(value: LocalePreference) {
      if (!isLocalePreference(value)) {
        throw new TypeError(`t3code-zh: unsupported locale preference ${JSON.stringify(value)}`);
      }
      env.localStorage?.setItem(LOCALE_STORAGE_KEY, value);
      env.location?.reload();
    },
    t,
  };

  try {
    const root = env.document?.documentElement;
    if (root) root.lang = locale;
  } catch {
    // 没有 DOM 的环境忽略。
  }
  if (env.target) env.target.__t3zh = api;

  return { t, preference, locale, api };
}
