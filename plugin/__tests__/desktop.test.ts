/**
 * 桌面主进程汉化（T07：plugin/desktop/t3zh-desktop.ts、patches/0003、dict/zh-CN.desktop.json）测试。
 * 运行：node --test "plugin/__tests__/*.test.ts"（或 npm run test:plugin）
 *
 * - 按 scripts/build-zh.sh 第 5 步的布局把三个文件复制到临时目录的 apps/desktop/src/t3zh/，配一个假的
 *   electron 模块注入系统语言列表，验证中文 / 英文两条路径和传给 preload 的参数。
 * - 把 patches/0003 打到 upstream/ 里这几个文件的副本上：补丁里每个 __t3zh_t(...) 的英文都要有词条，
 *   词库里每条都要有出处；role / accelerator 的取值不变；preload 的解析代码实际执行一遍。
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { parse } from "@babel/parser";

import { createTranslator, type T3zhDict } from "../../runtime/t3zh-runtime.ts";

const ZH_ROOT = path.resolve(import.meta.dirname, "../..");
// 默认 upstream/（当前基线）；升级时可用 T3ZH_UPSTREAM 指向新 tag 的源码（scripts/upgrade-check.sh）。
const UPSTREAM = process.env.T3ZH_UPSTREAM ? path.resolve(process.env.T3ZH_UPSTREAM) : path.join(ZH_ROOT, "upstream");
const PATCH = path.join(ZH_ROOT, "patches/0003-desktop-main-zh.patch");
const DICT_FILE = path.join(ZH_ROOT, "dict/zh-CN.desktop.json");
const DESKTOP_DICT: T3zhDict = JSON.parse(fs.readFileSync(DICT_FILE, "utf8"));

type Glue = typeof import("../desktop/t3zh-desktop.ts");

/** 与 build-zh.sh 第 5 步同样的布局，外加 node_modules/electron 替身（app.getPreferredSystemLanguages 读 globalThis）。 */
function makeDesktopLayout(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "t3zh-desktop-"));
  const dir = path.join(root, "apps/desktop/src/t3zh");
  fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(path.join(ZH_ROOT, "plugin/desktop/t3zh-desktop.ts"), path.join(dir, "t3zh-desktop.ts"));
  fs.copyFileSync(path.join(ZH_ROOT, "runtime/t3zh-runtime.ts"), path.join(dir, "t3zh-runtime.ts"));
  fs.copyFileSync(DICT_FILE, path.join(dir, "zh-CN.desktop.json"));
  const electron = path.join(root, "node_modules/electron");
  fs.mkdirSync(electron, { recursive: true });
  fs.writeFileSync(path.join(electron, "package.json"), JSON.stringify({ name: "electron", type: "module", main: "index.js" }));
  fs.writeFileSync(
    path.join(electron, "index.js"),
    [
      "export const app = {",
      "  getPreferredSystemLanguages() {",
      "    const value = globalThis.__fakeSystemLanguages;",
      "    if (value instanceof Error) throw value;",
      "    return value;",
      "  },",
      "};",
      "",
    ].join("\n"),
  );
  return root;
}

const LAYOUT = makeDesktopLayout();
let importCounter = 0;

/** 每次都拿一个新的模块实例（__t3zh_t 在第一次调用时确定语言并缓存）。 */
async function loadGlue(languages: unknown): Promise<Glue> {
  (globalThis as Record<string, unknown>).__fakeSystemLanguages = languages;
  const url = pathToFileURL(path.join(LAYOUT, "apps/desktop/src/t3zh/t3zh-desktop.ts")).href;
  return (await import(`${url}?instance=${importCounter++}`)) as Glue;
}

test("系统语言是简体中文时主进程文字查桌面词库", async () => {
  const glue = await loadGlue(["zh-Hans-CN", "en-US"]);
  assert.equal(glue.__t3zh_t("File"), "文件");
  assert.equal(glue.__t3zh_t("Check for Updates..."), "检查更新...");
  assert.equal(glue.__t3zh_t("About T3 Code (Alpha)"), "关于 T3 Code (Alpha)");
  assert.equal(glue.__t3zh_t("Quit T3 Code (Alpha)"), "退出 T3 Code (Alpha)");
  assert.equal(glue.__t3zh_t("Hide Others"), "隐藏其他", "精确词条优先于 Hide {0} 模板");
  assert.equal(
    glue.__t3zh_t("T3 Code 0.0.46-n2644.zh.0 is currently the newest version available."),
    "T3 Code 0.0.46-n2644.zh.0 当前已是最新版本。",
  );
  assert.equal(glue.__t3zh_t("Something the dictionary does not have"), "Something the dictionary does not have");
  // 第一次调用后语言不再变化。
  (globalThis as Record<string, unknown>).__fakeSystemLanguages = ["en-US"];
  assert.equal(glue.__t3zh_t("Edit"), "编辑");
});

test("系统语言是英文、繁体中文或读不到时保持英文原文", async () => {
  for (const languages of [["en-US"], ["en-US", "zh-Hans-CN"], ["zh-Hant-TW"], ["zh-TW"], ["fr-FR", "de-DE"], [], undefined, new Error("boom")]) {
    const glue = await loadGlue(languages);
    for (const key of [...Object.keys(DESKTOP_DICT.messages), "About T3 Code (Alpha)", "Set up Screen Recording"]) {
      assert.equal(glue.__t3zh_t(key), key, `${JSON.stringify(languages)} 下 ${key} 应原样返回`);
    }
  }
});

test("语言列表按 §5 规则解析：跳过无法识别的语言，取第一个可识别的", async () => {
  const cases: Array<[unknown, "en" | "zh-CN"]> = [
    [["fr-FR", "zh-Hans-CN"], "zh-CN"],
    [["zh-CN"], "zh-CN"],
    [["zh"], "zh-CN"],
    [["zh-SG"], "zh-CN"],
    [["zh-HK"], "en"],
    [["ja-JP", "en-GB", "zh-Hans"], "en"],
    [["not a tag", "zh-Hans"], "zh-CN"],
  ];
  for (const [languages, expected] of cases) {
    const glue = await loadGlue(languages);
    assert.equal(glue.createDesktopTranslator(glue.readSystemLanguages()).locale, expected, JSON.stringify(languages));
    assert.equal(glue.__t3zh_t("File") === "文件", expected === "zh-CN", JSON.stringify(languages));
  }
});

test("传给 preload 的参数是 --t3zh-system-languages=<JSON 数组>，读不到时是空数组", async () => {
  let glue = await loadGlue(["zh-Hans-CN", "en-US"]);
  assert.equal(glue.systemLanguagesArgument(), '--t3zh-system-languages=["zh-Hans-CN","en-US"]');
  glue = await loadGlue(new Error("boom"));
  assert.equal(glue.systemLanguagesArgument(), "--t3zh-system-languages=[]");
  glue = await loadGlue(["en-US", 42]);
  assert.equal(glue.systemLanguagesArgument(), '--t3zh-system-languages=["en-US"]');
});

// ---------------------------------------------------------------------------
// patches/0003

const PATCH_0004 = path.join(ZH_ROOT, "patches/0004-display-site-translation.patch");
const PATCH_0012 = path.join(ZH_ROOT, "patches/0012-file-reveal-menu-labels.patch");
/** 0004 改到的桌面文件：原生菜单 label 的显示入口。 */
const DESKTOP_DISPLAY_FILE = "apps/desktop/src/electron/ElectronMenu.ts";

const PATCHED_FILES = [
  "apps/desktop/src/app/DesktopApp.ts",
  // 0004 的桌面原生显示入口：displayMenuLabel() 只翻审核过、有精确词条的菜单标签
  // （TRANSLATABLE_MENU_LABELS，含 Branch、Copy Path 与平台文件显示标签）。它们的词条在
  // __t3zh_t 包裹时才被使用，所以一起计入「词库里每条都有出处」的核对，避免桌面词库出现
  // 无人引用的词条（下面直接从补丁后的源码解析名单，名单增删都会跟着核对）。
  DESKTOP_DISPLAY_FILE,
  "apps/desktop/src/permissions/MacPermissionHelper.ts",
  "apps/desktop/src/preload.ts",
  "apps/desktop/src/preview/Manager.ts",
  "apps/desktop/src/snapShot/SnapShotTransition.ts",
  "apps/desktop/src/window/DesktopApplicationMenu.ts",
  "apps/desktop/src/window/DesktopWindow.ts",
];

/** upstream/ 里这几个文件复制到临时目录（git 仓库外），再用 git apply 打上 0003。 */
function patchedCopies(): { before: Map<string, string>; after: Map<string, string> } {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "t3zh-0003-"));
  const before = new Map<string, string>();
  for (const file of PATCHED_FILES) {
    const code = fs.readFileSync(path.join(UPSTREAM, file), "utf8");
    before.set(file, code);
    fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
    fs.writeFileSync(path.join(dir, file), code);
  }
  execFileSync("git", ["apply", PATCH], { cwd: dir });
  // 0004 也改 ElectronMenu.ts（桌面原生菜单的显示入口）；--include 限定到已复制进来的文件。
  execFileSync("git", ["apply", `--include=${DESKTOP_DISPLAY_FILE}`, PATCH_0004], { cwd: dir });
  execFileSync("git", ["apply", `--include=${DESKTOP_DISPLAY_FILE}`, PATCH_0012], { cwd: dir });
  const after = new Map(PATCHED_FILES.map((file) => [file, fs.readFileSync(path.join(dir, file), "utf8")]));
  return { before, after };
}

const COPIES = patchedCopies();

type Node = any;

function walk(node: Node, visit: (node: Node) => void): void {
  if (!node || typeof node.type !== "string") return;
  visit(node);
  for (const key of Object.keys(node)) {
    if (key === "loc" || key.endsWith("Comments")) continue;
    const child = node[key];
    if (Array.isArray(child)) for (const item of child) walk(item, visit);
    else if (child && typeof child.type === "string") walk(child, visit);
  }
}

function astOf(code: string): Node {
  return parse(code, { sourceType: "module", plugins: ["typescript"] });
}

/** 查表函数：__t3zh_t，以及查表后转义的 __t3zh_html（HTML）、__t3zh_js（内联脚本的字符串字面量）。 */
const TRANSLATE_CALLEES = new Set(["__t3zh_t", "__t3zh_html", "__t3zh_js"]);

/** __t3zh_t 等的参数：字符串字面量取原文；模板字面量把插值写成 {0}、{1}…；其他表达式记为 null（动态值）。 */
function wrappedArguments(code: string): Array<{ key: string | null; kind: "message" | "template" | "dynamic"; line: number }> {
  const result: Array<{ key: string | null; kind: "message" | "template" | "dynamic"; line: number }> = [];
  walk(astOf(code), (node) => {
    if (node.type !== "CallExpression" || node.callee.type !== "Identifier" || !TRANSLATE_CALLEES.has(node.callee.name)) return;
    const arg = node.arguments[0];
    const line = node.loc.start.line;
    if (arg.type === "StringLiteral") result.push({ key: arg.value, kind: "message", line });
    else if (arg.type === "TemplateLiteral" && arg.expressions.length === 0) result.push({ key: arg.quasis[0].value.cooked, kind: "message", line });
    else if (arg.type === "TemplateLiteral") {
      const key = arg.quasis.map((q: Node, i: number) => q.value.cooked + (i < arg.expressions.length ? `{${i}}` : "")).join("");
      result.push({ key, kind: "template", line });
    } else result.push({ key: null, kind: "dynamic", line });
  });
  return result;
}

/**
 * 通过变量传进 __t3zh_t 的英文（补丁里写成 __t3zh_t(<表达式>)）：上游原文必须还在，词库必须有对应词条。
 * 上游改了这些文字，这里会先报出来。
 */
const DYNAMIC_SOURCES: Array<{ file: string; texts: string[] }> = [
  {
    // DesktopApplicationMenu.ts 的 __t3zh_t(disabledReason.value)：getAutoUpdateDisabledReason 的全部返回值。
    file: "apps/desktop/src/updates/DesktopUpdates.ts",
    texts: [
      "Automatic updates are not available because no update feed is configured.",
      "Automatic updates are only available in packaged production builds.",
      "Automatic updates are disabled by the T3CODE_DISABLE_AUTO_UPDATE setting.",
      "Automatic updates on Linux require the AppImage or the .deb package.",
    ],
  },
  {
    // MacPermissionHelper.ts 的 __t3zh_t(MAC_PERMISSION_TITLES[permission])。
    file: "apps/desktop/src/permissions/MacPermission.ts",
    texts: ["Screen Recording", "Accessibility", "Full Disk Access"],
  },
];

test("补丁里每个被包裹的英文都有词条，词库里每条都有出处", () => {
  const translate = createTranslator(DESKTOP_DICT);
  const usedMessages = new Set<string>();
  const usedTemplates = new Set<string>();
  let dynamicCount = 0;
  for (const [file, code] of COPIES.after) {
    for (const item of wrappedArguments(code)) {
      if (item.kind === "dynamic") {
        dynamicCount++;
        continue;
      }
      if (item.kind === "message") {
        assert.ok(item.key! in DESKTOP_DICT.messages, `${file}:${item.line} 的 ${JSON.stringify(item.key)} 不在 messages 里`);
        usedMessages.add(item.key!);
      } else {
        assert.ok(item.key! in DESKTOP_DICT.templates, `${file}:${item.line} 的模板 ${JSON.stringify(item.key)} 不在 templates 里`);
        usedTemplates.add(item.key!);
      }
    }
  }
  // 0004 的 ElectronMenu.ts 给菜单 label 也加了一处 __t3zh_t 的动态调用，见 display-site-translation.test.ts。
  assert.equal(dynamicCount, 4, "动态参数只应有 disabledReason.value、MAC_PERMISSION_TITLES[permission] ×2 和 ElectronMenu 的菜单 label");
  for (const source of DYNAMIC_SOURCES) {
    const code = fs.readFileSync(path.join(UPSTREAM, source.file), "utf8");
    for (const text of source.texts) {
      assert.ok(code.includes(JSON.stringify(text)), `${source.file} 里找不到 ${JSON.stringify(text)}`);
      assert.ok(text in DESKTOP_DICT.messages, `${text} 不在 messages 里`);
      usedMessages.add(text);
    }
  }
  // 0004 的 ElectronMenu.ts：displayMenuLabel() 的实参是参数（dynamic），真正被查表的是审核过的
  // TRANSLATABLE_MENU_LABELS 名单——名单元素在这里计入「有出处」的核对。
  // 用 AST 读数组字面量，注释、顺序或分隔符变化都不会让这里悄悄漏掉一条。
  {
    const code = COPIES.after.get(DESKTOP_DISPLAY_FILE)!;
    const labels: string[] = [];
    walk(astOf(code), (node) => {
      if (node.type !== "VariableDeclarator" || node.id?.name !== "TRANSLATABLE_MENU_LABELS") return;
      assert.equal(node.init?.type, "ArrayExpression", "TRANSLATABLE_MENU_LABELS 必须是数组字面量（§5.5）");
      for (const element of node.init.elements) {
        assert.equal(element?.type, "StringLiteral", "TRANSLATABLE_MENU_LABELS 的元素必须都是字符串字面量");
        labels.push(element.value);
      }
    });
    assert.ok(labels.length > 0, "TRANSLATABLE_MENU_LABELS 不应为空");
    assert.equal(new Set(labels).size, labels.length, "TRANSLATABLE_MENU_LABELS 有重复项");
    for (const label of labels) {
      assert.ok(label in DESKTOP_DICT.messages, `${label} 不在桌面 messages 里`);
      usedMessages.add(label);
    }
  }
  assert.deepEqual(Object.keys(DESKTOP_DICT.messages).filter((key) => !usedMessages.has(key)), [], "messages 里有没用到的词条");
  assert.deepEqual(Object.keys(DESKTOP_DICT.templates).filter((key) => !usedTemplates.has(key)), [], "templates 里有没用到的词条");
  // 精确词条都按 messages 命中，不会被模板截走（模板误配，§4）。
  for (const key of Object.keys(DESKTOP_DICT.messages)) {
    assert.equal(translate(key), DESKTOP_DICT.messages[key]);
  }
});

/** 属性值可能取到的字符串：条件表达式取两个结果分支（不含条件本身），TS 断言取内层。 */
function resultStrings(node: Node, into: string[]): void {
  if (node.type === "StringLiteral") into.push(node.value);
  else if (node.type === "ConditionalExpression") {
    resultStrings(node.consequent, into);
    resultStrings(node.alternate, into);
  } else if (node.type === "TSAsExpression" || node.type === "TSSatisfiesExpression") resultStrings(node.expression, into);
  else into.push(`<${node.type}>`);
}

/** 对象字面量里 role / accelerator 属性的全部可能取值。 */
function propertyStrings(code: string, name: string): string[] {
  const values: string[] = [];
  walk(astOf(code), (node) => {
    if (node.type !== "ObjectProperty" || node.computed) return;
    const key = node.key.type === "Identifier" ? node.key.name : node.key.value;
    if (key === name) resultStrings(node.value, values);
  });
  return values.sort();
}

test("role 和 accelerator 的取值不变（windowMenu 只多出 Electron 默认子菜单的 4 个 role）", () => {
  for (const file of PATCHED_FILES) {
    const before = COPIES.before.get(file)!;
    const after = COPIES.after.get(file)!;
    assert.deepEqual(propertyStrings(after, "accelerator"), propertyStrings(before, "accelerator"), `${file} accelerator`);
    const expected = propertyStrings(before, "role");
    if (file.endsWith("DesktopApplicationMenu.ts")) expected.push("close", "front", "minimize", "zoom");
    assert.deepEqual(propertyStrings(after, "role"), expected.sort(), `${file} role`);
  }
});

test("补丁里 preload 的解析代码：合法参数暴露为 __t3zhSystemLanguages，缺失或不合法时不暴露", () => {
  const preload = COPIES.after.get("apps/desktop/src/preload.ts")!;
  const start = preload.indexOf("const t3zhSystemLanguagesArgument");
  const end = preload.indexOf("\n}\n", start) + 3;
  assert.ok(start > 0 && end > start, "找不到 preload 里的 t3code-zh 代码块");
  const js = stripTypeScriptTypes(preload.slice(start, end));
  const run = (argv: string[]) => {
    const exposed: Array<[string, unknown]> = [];
    const contextBridge = { exposeInMainWorld: (key: string, value: unknown) => exposed.push([key, value]) };
    // eslint-disable-next-line no-new-func
    new Function("process", "contextBridge", js)({ argv }, contextBridge);
    return exposed;
  };
  assert.deepEqual(run(["/x/T3 Code", "--type=renderer", '--t3zh-system-languages=["zh-Hans-CN","en-US"]']), [
    ["__t3zhSystemLanguages", ["zh-Hans-CN", "en-US"]],
  ]);
  assert.deepEqual(run(["--t3zh-system-languages=[]"]), [["__t3zhSystemLanguages", []]]);
  assert.deepEqual(run(["--type=renderer"]), []);
  assert.deepEqual(run(["--t3zh-system-languages=not json"]), []);
  assert.deepEqual(run(['--t3zh-system-languages={"0":"zh-Hans"}']), []);
  assert.deepEqual(run(['--t3zh-system-languages=["zh-Hans",1]']), []);
});

test("preload 用的参数前缀与主进程一致", async () => {
  const glue = await loadGlue(["en-US"]);
  const preload = COPIES.after.get("apps/desktop/src/preload.ts")!;
  assert.equal(preload.split(JSON.stringify(glue.SYSTEM_LANGUAGES_ARGUMENT_PREFIX)).length - 1, 2);
});

test("插进主进程 HTML / 内联脚本的译文先转义；en 时与原版逐字相同", async () => {
  const en = await loadGlue(["en-US"]);
  assert.equal(en.__t3zh_html("Live browser preview"), "Live browser preview");
  assert.equal(en.__t3zh_js("Captured window"), '"Captured window"');
  assert.equal(en.__t3zh_html(`a & "b" <c> 'd'`), "a &amp; &quot;b&quot; &lt;c&gt; &#39;d&#39;");
  assert.equal(en.__t3zh_js("</script><b>"), '"\\u003c/script>\\u003cb>"');
  assert.equal(JSON.parse(en.__t3zh_js('say "hi"\\')), 'say "hi"\\');
  const zh = await loadGlue(["zh-Hans-CN"]);
  assert.equal(zh.__t3zh_html("Live browser preview"), DESKTOP_DICT.messages["Live browser preview"]);
  assert.equal(zh.__t3zh_js("Captured window"), JSON.stringify(DESKTOP_DICT.messages["Captured window"]));
  // 两处 HTML 插入位置：把调用换回英文原文后，与上游原文逐字相同（en 输出一致的源码级证明）。
  const cases: Array<[string, string, string]> = [
    ["apps/desktop/src/snapShot/SnapShotTransition.ts", '${__t3zh_js("Captured window")}', '"Captured window"'],
    ["apps/desktop/src/preview/Manager.ts", '${__t3zh_html("Live browser preview")}', "Live browser preview"],
  ];
  for (const [file, call, original] of cases) {
    const after = COPIES.after.get(file)!;
    const before = COPIES.before.get(file)!;
    const line = after.split("\n").find((l) => l.includes(call));
    assert.ok(line, `${file} 找不到 ${call}`);
    assert.ok(before.split("\n").includes(line.replace(call, original)), `${file}: ${line.trim()}`);
  }
});

test("归类附录与生成器输出一致（每条都有结论）", () => {
  const survey = execFileSync(process.execPath, [path.join(ZH_ROOT, "plugin/desktop/survey-strings.ts")], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "t3zh-survey-"));
  const tsv = path.join(dir, "survey.tsv");
  fs.writeFileSync(tsv, survey);
  const appendix = execFileSync(process.execPath, [path.join(ZH_ROOT, "plugin/desktop/classify-strings.ts"), tsv], {
    encoding: "utf8",
  });
  assert.equal(appendix, fs.readFileSync(path.join(ZH_ROOT, "reports/desktop-main-strings-appendix.md"), "utf8"));
  // 条数随上游变化，不写死；附录与生成器输出逐字一致已经保证升级时新增条目都经过人工归类。
  assert.match(appendix, /\| 合计 \| \| \d+ \|/);
});
