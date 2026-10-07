/**
 * 运行时（runtime/t3zh-runtime.ts，CONVENTIONS §5）测试。
 * 运行：node --test "plugin/__tests__/*.test.ts"（或 npm run test:plugin）
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  LOCALE_STORAGE_KEY,
  TRANSLATION_CACHE_LIMIT,
  createTranslator,
  installT3zhRuntime,
  resolveLocale,
  resolveSystemLocale,
  systemLanguageList,
  type RuntimeEnv,
} from "../../runtime/t3zh-runtime.ts";
import { SAMPLE_DICT } from "./helpers.ts";

function fakeEnv(options: { stored?: string | null; languages?: string[]; language?: string; throwOnStorage?: boolean } = {}) {
  const store = new Map<string, string>();
  if (options.stored != null) store.set(LOCALE_STORAGE_KEY, options.stored);
  const target: Record<string, unknown> = {};
  const documentElement = { lang: "en" };
  let reloads = 0;
  const env: RuntimeEnv = {
    localStorage: {
      getItem(key) {
        if (options.throwOnStorage) throw new Error("SecurityError");
        return store.get(key) ?? null;
      },
      setItem(key, value) {
        store.set(key, value);
      },
    },
    navigator: { languages: options.languages ?? [], language: options.language ?? "" },
    document: { documentElement },
    location: {
      reload() {
        reloads += 1;
      },
    },
    target,
  };
  return { env, store, target, documentElement, reloads: () => reloads };
}

test("运行时：en 模式原样返回（同一个引用），不解析词库", () => {
  const { env } = fakeEnv({ stored: "en", languages: ["zh-CN"] });
  // 词库传一个非法 JSON 字符串：en 模式不应解析它
  const runtime = installT3zhRuntime("{not json", env);
  assert.equal(runtime.locale, "en");
  const value = "Settings";
  assert.equal(runtime.t(value), value);
  assert.equal(runtime.t("Hello world"), "Hello world");
});

test("运行时：zh-CN 命中 messages；未命中原样返回；非字符串原样返回", () => {
  const { env } = fakeEnv({ stored: "zh-CN" });
  const { t } = installT3zhRuntime(JSON.stringify(SAMPLE_DICT), env);
  assert.equal(t("Settings"), "设置");
  assert.equal(t("Not in dictionary"), "Not in dictionary");
  const object = { a: 1 };
  assert.equal(t(object), object);
  assert.equal(t(42), 42);
  assert.equal(t(null), null);
  assert.equal(t(undefined), undefined);
});

test("运行时：首尾空白保留（按去空白后的文本查表，再拼回原有空白）", () => {
  const t = createTranslator(SAMPLE_DICT);
  assert.equal(t("  Settings "), "  设置 ");
  assert.equal(t("Settings\n"), "设置\n");
  assert.equal(t(" Delete a.md? "), " 删除 a.md？ ");
  assert.equal(t("   "), "   ");
  assert.equal(t(""), "");
});

test("运行时：模板按长模板优先匹配，占位符可换顺序，值里可以有换行和 $ 符号", () => {
  const t = createTranslator({
    messages: {},
    templates: {
      "{0} of {1}": "共 {1} 中的 {0}",
      "{selected} of {total} selected": "已选 {selected}/{total}",
      "Error: {message}": "错误：{message}",
      "{a} and {a}": "{a} 两次",
    },
  });
  assert.equal(t("3 of 5 selected"), "已选 3/5", "更长的模板优先");
  assert.equal(t("3 of 5"), "共 5 中的 3");
  assert.equal(t("Error: line1\nline2"), "错误：line1\nline2");
  assert.equal(t("Error: costs $1 $& $$"), "错误：costs $1 $& $$");
  assert.equal(t("x and x"), "x 两次");
  assert.equal(t("x and y"), "x and y", "同名占位符必须匹配同一值");
});

test("运行时：字面部分没有字母的模板不参与匹配（不会把 a/b 之类改坏）", () => {
  const t = createTranslator({ messages: {}, templates: { "{0}/{1}": "{1}/{0}", "{0} · {1}": "{1} · {0}" } });
  assert.equal(t("a/b"), "a/b");
  assert.equal(t("x · y"), "x · y");
});

test("运行时：messages 优先于 templates", () => {
  const t = createTranslator({ messages: { "3 files changed": "三个文件" }, templates: { "{count} files changed": "已更改 {count} 个文件" } });
  assert.equal(t("3 files changed"), "三个文件");
  assert.equal(t("4 files changed"), "已更改 4 个文件");
});

test("运行时：查表结果缓存有上限", () => {
  const t = createTranslator(SAMPLE_DICT);
  for (let i = 0; i < TRANSLATION_CACHE_LIMIT + 10; i++) t(`dynamic ${i}`);
  assert.equal(t("Settings"), "设置");
});

test("语言解析：zh-CN、zh-Hans-CN、zh-TW、en-US、ja+zh-CN 等组合", () => {
  assert.equal(resolveSystemLocale(["zh-CN"]), "zh-CN");
  assert.equal(resolveSystemLocale(["zh-Hans-CN"]), "zh-CN");
  assert.equal(resolveSystemLocale(["zh"]), "zh-CN");
  assert.equal(resolveSystemLocale(["zh-SG"]), "zh-CN");
  assert.equal(resolveSystemLocale(["zh-TW"]), "en");
  assert.equal(resolveSystemLocale(["zh-Hant"]), "en");
  assert.equal(resolveSystemLocale(["zh-HK", "zh-CN"]), "en", "zh-Hant 直接返回 en，不看后面");
  assert.equal(resolveSystemLocale(["en-US"]), "en");
  assert.equal(resolveSystemLocale(["en-US", "zh-CN"]), "en");
  assert.equal(resolveSystemLocale(["ja", "zh-CN"]), "zh-CN", "其他语言跳过看下一项");
  assert.equal(resolveSystemLocale(["ja", "en-US", "zh-CN"]), "en");
  assert.equal(resolveSystemLocale(["ja", "ko"]), "en", "都不符合返回 en");
  assert.equal(resolveSystemLocale(["", "not a locale!", "zh-CN"]), "zh-CN", "无法解析的标签跳过");
  assert.equal(resolveSystemLocale([]), "en");
  assert.equal(resolveLocale("en", ["zh-CN"]), "en");
  assert.equal(resolveLocale("zh-CN", ["en-US"]), "zh-CN");
  assert.equal(resolveLocale("system", ["zh-CN"]), "zh-CN");
});

test("语言偏好：localStorage 取 system/en/zh-CN，缺省或非法值按 system；languages 为空时用 language", () => {
  assert.equal(installT3zhRuntime(SAMPLE_DICT, fakeEnv({ languages: ["zh-CN"] }).env).locale, "zh-CN");
  assert.equal(installT3zhRuntime(SAMPLE_DICT, fakeEnv({ stored: "fr", languages: ["zh-CN"] }).env).preference, "system");
  assert.equal(installT3zhRuntime(SAMPLE_DICT, fakeEnv({ stored: "system", languages: [], language: "zh-CN" }).env).locale, "zh-CN");
  assert.equal(installT3zhRuntime(SAMPLE_DICT, fakeEnv({ stored: "zh-CN", languages: ["en-US"] }).env).locale, "zh-CN");
  assert.equal(installT3zhRuntime(SAMPLE_DICT, fakeEnv({ throwOnStorage: true, languages: ["zh-CN"] }).env).locale, "zh-CN");
});

test("全局 API：window.__t3zh 的 getLocale/getResolvedLocale/setLocale，设置 <html lang>", () => {
  const fake = fakeEnv({ stored: "system", languages: ["zh-Hans-CN"] });
  installT3zhRuntime(SAMPLE_DICT, fake.env);
  const api = fake.target.__t3zh as { getLocale(): string; getResolvedLocale(): string; setLocale(v: string): void };
  assert.equal(fake.documentElement.lang, "zh-CN");
  assert.equal(api.getLocale(), "system");
  assert.equal(api.getResolvedLocale(), "zh-CN");
  api.setLocale("en");
  assert.equal(fake.store.get(LOCALE_STORAGE_KEY), "en");
  assert.equal(fake.reloads(), 1, "setLocale 后刷新页面");
  assert.equal(api.getLocale(), "en");
  assert.equal(api.getResolvedLocale(), "zh-CN", "语言只在加载时确定一次");
  assert.throws(() => api.setLocale("fr"), TypeError);
  assert.equal(fake.reloads(), 1);

  const english = fakeEnv({ languages: ["en-US"] });
  installT3zhRuntime(SAMPLE_DICT, english.env);
  assert.equal(english.documentElement.lang, "en");
});

test("全局 API 的 t：与注入的 __t3zh_t 是同一个函数，en 模式原样返回（补丁在显示位置调用它）", () => {
  const zh = fakeEnv({ languages: ["zh-Hans-CN"] });
  const zhRuntime = installT3zhRuntime(SAMPLE_DICT, zh.env);
  const zhApi = zh.target.__t3zh as { t(value: unknown): unknown };
  assert.equal(zhApi.t, zhRuntime.t);
  assert.equal(zhApi.t("Settings"), "设置");
  assert.equal(zhApi.t("Not in dict"), "Not in dict");
  assert.equal(zhApi.t(42), 42);

  const en = fakeEnv({ languages: ["en-US"] });
  installT3zhRuntime(SAMPLE_DICT, en.env);
  assert.equal((en.target.__t3zh as { t(value: unknown): unknown }).t("Settings"), "Settings");
});

test("没有 window/document/localStorage 的环境（Worker、Node）也能加载", () => {
  const runtime = installT3zhRuntime(SAMPLE_DICT, { navigator: { languages: ["zh-CN"] } });
  assert.equal(runtime.t("Settings"), "设置");
  assert.equal(installT3zhRuntime(SAMPLE_DICT, {}).locale, "en");
});

const ELECTRON_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) T3Code/0.0.46 Chrome/140.0.0.0 Electron/39.0.0 Safari/537.36";
const CHROME_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

test("system 语言来源 1：有 globalThis.__t3zhSystemLanguages（非空字符串数组）时用它", () => {
  const env = { systemLanguages: ["zh-Hans-CN", "en-US"], navigator: { languages: ["en-US"], userAgent: ELECTRON_UA } };
  assert.deepEqual(systemLanguageList(env), ["zh-Hans-CN", "en-US"]);
  assert.equal(installT3zhRuntime(SAMPLE_DICT, env).locale, "zh-CN");
  // 非法值（空数组、非字符串）忽略，退回 navigator
  assert.deepEqual(systemLanguageList({ systemLanguages: [], navigator: { languages: ["ja"] } }), ["ja"]);
  assert.deepEqual(systemLanguageList({ systemLanguages: ["zh-CN", 1], navigator: { languages: ["ja"] } }), ["ja"]);
  assert.deepEqual(systemLanguageList({ systemLanguages: "zh-CN", navigator: { languages: ["ja"] } }), ["ja"]);
});

test("system 语言来源 2：Electron 里去掉 navigator.languages 第一项（应用语言 en-US）", () => {
  const env = { navigator: { languages: ["en-US", "zh-Hans-CN"], language: "en-US", userAgent: ELECTRON_UA } };
  assert.deepEqual(systemLanguageList(env), ["zh-Hans-CN"]);
  assert.equal(installT3zhRuntime(SAMPLE_DICT, env).locale, "zh-CN");
  // 只有一项时不去掉
  const single = { navigator: { languages: ["en-US"], userAgent: ELECTRON_UA } };
  assert.deepEqual(systemLanguageList(single), ["en-US"]);
  assert.equal(installT3zhRuntime(SAMPLE_DICT, single).locale, "en");
  // languages 为空时用 language，也不去掉
  assert.deepEqual(systemLanguageList({ navigator: { languages: [], language: "zh-CN", userAgent: ELECTRON_UA } }), ["zh-CN"]);
});

test("system 语言来源 3：非 Electron 时按 navigator.languages 原样，[\"en-US\",\"zh-Hans-CN\"] 得到 en", () => {
  const env = { navigator: { languages: ["en-US", "zh-Hans-CN"], userAgent: CHROME_UA } };
  assert.deepEqual(systemLanguageList(env), ["en-US", "zh-Hans-CN"]);
  assert.equal(installT3zhRuntime(SAMPLE_DICT, env).locale, "en");
  // 显式偏好不受语言来源影响
  assert.equal(installT3zhRuntime(SAMPLE_DICT, { ...fakeEnv({ stored: "en" }).env, systemLanguages: ["zh-CN"] }).locale, "en");
});
