/**
 * patches/0004-display-site-translation.patch 的维护测试（CONVENTIONS §5.6）。
 * 运行：node --test plugin/__tests__/display-site-translation.test.ts（或 npm run test:plugin）
 *
 * 做法：把 0001+0004 打到 upstream/ 相关文件的副本上，再用**真实转换插件**（真实
 * `createScanContext` + `transformCode`）转换这些文件，把结果当模块 import 执行；词库用真实
 * 主词库 / 真实桌面词库，运行时用真实 `createTranslator` / `installT3zhRuntime`。
 *
 * 覆盖范围（每条都是实际执行，不是源码正则）：
 *   - progress 门控：名单与真实来源集合相等、名单内外行为、查表 0/1 次数、en / 缺 `__t3zh` / 缺 `t`；
 *   - providerStatusLabel：真实 `getProviderSummary` + 真实运行时，静态 headline、认证骨架的
 *     接受/拒绝边界、参数逐字保留、查表次数；
 *   - `localizeTerminologyText`：整串优先、术语先行的受控替换、动态分支名，以及真实
 *     `shared → getSourceControlPresentation → 转换后 dialog 调用表达式` 链上的 providerName
 *     术语碰撞（完整译文逐字相等）；en / 缺运行时；
 *   - 菜单链：DOM fallback 与桌面原生入口的真实模块执行，固定标签中译、动态内容原样、
 *     已译中文标签 0 次查表、名单内外与 en 的查表 0/1 次数，以及 `LegacySidebar` 项目右键
 *     菜单里以**函数参数**传 label 的那条真实路径；
 *   - §5.3：数据对象生成处不含 `__t3zh`；usage 回归。
 *
 * 说明（不要据此推断未列的入口都已覆盖）：
 *   - 每条链取的都是**代表值**，不是穷举；`en` 与「缺 `__t3zh` / 缺 `t`」两种样本只加在
 *     **可选 web 运行时入口**（progress、provider、localize、DOM 菜单）上。桌面原生入口没有
 *     「缺 `__t3zh` / 缺 `t`」这两种形态：它的翻译由主进程 glue 的 `__t3zh_t` 按**系统语言**解析，
 *     解析为 en 时逐字返回原文，所以那侧只有「真实 glue + zh 系统语言」与
 *     「真实 glue + en 系统语言」两个样本；两端在 en 下门控仍命中名单，
 *     **真实实现都会调用一次**恒等 translator，不是零次；
 *   - 桌面词库本身的「每条词条都有出处」由 plugin/__tests__/desktop.test.ts 负责，
 *     本文件只核对名单里的标签在真实桌面词库下译出预期结果；
 *   - 只测补丁新增/改写的显示入口，未覆盖 0004 之外的其他任务文件。
 *
 * 不复制模拟实现：显示函数体、名单、Set 与调用表达式都**逐字取自**补丁应用后 + 真实插件转换后的
 * 真实文件，改坏真实实现（含多查/少查一次表）就测不过。唯一的例外是桌面原生入口不从
 * `ElectronMenu.ts` 整模块 import —— 它的 class 定义在模块加载时就要构建树才有的 `effect` /
 * `@t3tools/*`，所以那侧逐字抽出 `TRANSLATABLE_MENU_LABELS` / `TRANSLATABLE_MENU_LABEL_SET` /
 * `displayMenuLabel`，并 `import` 真实 `t3zh-desktop.ts` glue（真实 `electron` 替身 + 真实桌面
 * 词库）接上 `__t3zh_t`；计数在真实 glue **外面**包一层，实现本身一行不动。
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import MagicString from "magic-string";
import { parse } from "@babel/parser";

import { createScanContext, type ScanContext } from "../../plugin/matcher.ts";
import { transformCode } from "../../plugin/vite-plugin-t3zh.ts";
import { createTranslator, installT3zhRuntime, type T3zhDict } from "../../runtime/t3zh-runtime.ts";

const ZH_ROOT = path.resolve(import.meta.dirname, "../..");
// 默认 upstream/（当前基线）；升级时可用 T3ZH_UPSTREAM 指向新 tag 的源码（scripts/upgrade-check.sh）。
const UPSTREAM = process.env.T3ZH_UPSTREAM ? path.resolve(process.env.T3ZH_UPSTREAM) : path.join(ZH_ROOT, "upstream");
const PATCH_0001 = path.join(ZH_ROOT, "patches/0001-language-setting.patch");
const PATCH_0004 = path.join(ZH_ROOT, "patches/0004-display-site-translation.patch");
const PATCH_0012 = path.join(ZH_ROOT, "patches/0012-file-reveal-menu-labels.patch");
const MAIN_DICT: T3zhDict = JSON.parse(fs.readFileSync(path.join(ZH_ROOT, "dict/zh-CN.json"), "utf8"));
const DESKTOP_DICT_FILE = path.join(ZH_ROOT, "dict/zh-CN.desktop.json");
const DESKTOP_DICT: T3zhDict = JSON.parse(fs.readFileSync(DESKTOP_DICT_FILE, "utf8"));
const TRANSLATOR = createTranslator(MAIN_DICT);

/**
 * 0004 改到的全部文件（含只改注释/顺序也要覆盖的 logic.ts）。
 */
const PATCHED_FILES = [
  "apps/desktop/src/electron/ElectronMenu.ts",
  "apps/web/src/components/BranchToolbarBranchSelector.tsx",
  "apps/web/src/components/GitActionsControl.logic.ts",
  "apps/web/src/components/GitActionsControl.tsx",
  "apps/web/src/components/LegacySidebar.tsx",
  "apps/web/src/components/PullRequestThreadDialog.tsx",
  "apps/web/src/components/RightPanelTabs.tsx",
  "apps/web/src/components/Sidebar.tsx",
  "apps/web/src/components/ThreadStatusIndicators.tsx",
  "apps/web/src/components/chat/ComposerTasksBadge.tsx",
  "apps/web/src/components/chat/SubagentTooltipContent.tsx",
  "apps/web/src/components/onboarding/WelcomeWizard.tsx",
  "apps/web/src/components/pullRequest/PullRequestStackMenu.tsx",
  "apps/web/src/components/settings/CodexSetupSection.tsx",
  "apps/web/src/components/settings/ProjectDefaultsSettings.tsx",
  "apps/web/src/components/settings/ProviderInstanceCard.tsx",
  "apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx",
  "apps/web/src/components/settings/SettingsPanels.tsx",
  "apps/web/src/components/settings/SourceControlWritingSettings.tsx",
  "apps/web/src/components/settings/providerStatus.ts",
  "apps/web/src/components/threadActionMenu.logic.ts",
  "apps/web/src/components/usage/UsagePriceOverrides.tsx",
  "apps/web/src/contextMenuFallback.ts",
  "apps/web/src/sourceControlPresentation.ts",
  "apps/web/src/vite-env.d.ts",
];

/**
 * 0004 没改、但真实链路测试要 import 的上游文件。它们与补丁树逐字节相同，所以从 upstream/
 * 复制进同一个临时树即可让相对 import 走真实模块，而不是把函数抄进测试再喂参数。
 */
const UPSTREAM_ONLY_FILES = [
  "apps/web/src/components/preview/fileExplorerLabel.ts",
  "apps/web/src/components/ChatMarkdown.tsx",
];

/** 0001 改到、且 0004 也需要的文件（vite-env.d.ts 的类型声明）。 */
const PATCH_0001_FILES = [
  "apps/web/src/components/settings/SettingsPanels.tsx",
  "apps/web/src/components/settings/settingsSearch.ts",
  "apps/web/src/vite-env.d.ts",
];

function applyPatches(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "t3zh-0004-"));
  for (const file of new Set([...PATCH_0001_FILES, ...PATCHED_FILES, ...UPSTREAM_ONLY_FILES])) {
    fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
    fs.copyFileSync(path.join(UPSTREAM, file), path.join(dir, file));
  }
  execFileSync("git", ["apply", PATCH_0001], { cwd: dir });
  execFileSync("git", ["apply", PATCH_0004], { cwd: dir });
  execFileSync("git", ["apply", PATCH_0012], { cwd: dir });
  return dir;
}

const PATCHED = applyPatches();
const read = (file: string) => fs.readFileSync(path.join(PATCHED, file), "utf8");
const upstream = (file: string) => fs.readFileSync(path.join(UPSTREAM, file), "utf8");

/**
 * 真实构建上下文：与 build-zh.sh 一样对整棵树做预扫描（值用途字面量决定插件是否包裹
 * 某个显示值，例如 `Unavailable`、`Branch`、`Browser`），词库用真实主词库。
 */
const SCAN_CONTEXT: ScanContext = createScanContext({
  root: UPSTREAM,
  dictPath: path.join(ZH_ROOT, "dict/zh-CN.json"),
  allowSuspiciousPath: path.join(ZH_ROOT, "dict/allow-suspicious.json"),
});

const VIRTUAL_IMPORT = 'import { __t3zh_t } from "virtual:t3zh-runtime";';
const RUNTIME_SHIM = "const __t3zh_t = (value) => globalThis.__t3zh?.t?.(value) ?? value;";

/**
 * 把补丁后的真实文件变成可 import 的临时模块。测试执行的显示辅助函数只依赖
 * `globalThis.__t3zh` 和自己的参数，所以默认删掉全部 import 与带 source 的 re-export
 * （`@t3tools/*`、`effect`、相对路径的图标/类型……；这些绑定只出现在不执行的函数体里），
 * 并把 `virtual:t3zh-runtime` 换成真实运行时调用。用 Babel 定位范围，避免正则误伤。
 *
 * `keepSources` 里的 import 原样保留：桌面原生入口要真 import 真实 glue，不能把这条删掉。
 * 一处 import 都不删的模块（ElectronMenu.ts）由调用方传入它自己的全部 import 源。
 */
function stripExternalImports(code: string, keepSources: ReadonlySet<string> = new Set()): string {
  const ast = parse(code, { sourceType: "module", plugins: ["typescript", "jsx"] });
  const edits: Array<{ start: number; end: number; code: string }> = [];
  for (const node of ast.program.body as any[]) {
    if (node.type === "ImportDeclaration") {
      if (keepSources.has(node.source.value)) continue;
      edits.push({
        start: node.start,
        end: node.end,
        code: node.source.value === "virtual:t3zh-runtime" ? RUNTIME_SHIM : "",
      });
      continue;
    }
    const isReExport =
      (node.type === "ExportNamedDeclaration" || node.type === "ExportAllDeclaration") && node.source;
    if (isReExport) edits.push({ start: node.start, end: node.end, code: "" });
  }
  const output = new MagicString(code);
  for (const edit of edits) {
    if (edit.code === "") output.remove(edit.start, edit.end);
    else output.overwrite(edit.start, edit.end, edit.code);
  }
  return output.toString();
}

/** 用真实插件转换补丁后的文件（返回转换结果，不删 import）。 */
function transformPatched(file: string): string {
  const result = transformCode(read(file), path.join(PATCHED, file), SCAN_CONTEXT);
  return result.output ? result.output.code : read(file);
}

/** 转换 + 删外部 import；没有改动时返回原文（同样删一遍 import）。 */
function transformed(file: string): string {
  return stripExternalImports(transformPatched(file));
}

const MODULE_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "t3zh-0004-modules-"));
let moduleCounter = 0;

/** 把转换后的真实模块写成文件再 import（Node 的类型擦除会去掉类型标注，`new Function` 做不到）。 */
async function loadTransformedModule<T = Record<string, any>>(file: string): Promise<T> {
  const name = `${path.basename(file).replace(/\.[jt]sx?$/, "")}-${moduleCounter++}.ts`;
  const target = path.join(MODULE_DIR, name);
  fs.writeFileSync(target, `${transformed(file)}\n`);
  return (await import(pathToFileURL(target).href)) as T;
}

/** 装真实 zh-CN / en 运行时到 globalThis.__t3zh，返回还原函数。 */
function installRuntime(locale: "zh-CN" | "en"): () => void {
  const g = globalThis as Record<string, any>;
  const previous = g.__t3zh;
  const installed = installT3zhRuntime(MAIN_DICT, {
    localStorage: { getItem: () => locale, setItem: () => {} },
    navigator: null,
    document: null,
    location: null,
    target: null,
  });
  g.__t3zh = installed.api;
  return () => {
    g.__t3zh = previous;
  };
}

/**
 * 装真实运行时，并在**真实 translator 外面**包一层计数（实现本身不动）。用来断言
 * 「某个入口在一次调用里查了几次表」，而不是只看结果 —— 少查、多查都要能被发现。
 */
function countingRuntime(locale: "zh-CN" | "en"): {
  restore: () => void;
  calls: () => number;
  reset: () => void;
} {
  const restoreInner = installRuntime(locale);
  const api = (globalThis as Record<string, any>).__t3zh;
  const real = api.t;
  let calls = 0;
  (globalThis as Record<string, any>).__t3zh = {
    ...api,
    t: (value: unknown) => {
      calls += 1;
      return real(value);
    },
  };
  return {
    restore: restoreInner,
    calls: () => calls,
    reset: () => {
      calls = 0;
    },
  };
}

/**
 * 「同一个纯函数的逐字文本 + 真实 translator 外包一层计数」的骨架，当前**只有桌面原生菜单入口**
 * 用它 —— 那个入口不碰全局、只调真实 glue 的 `__t3zh_t`，必须靠 `import` 绑定后再包计数。
 * DOM 菜单入口直接走 `globalThis.__t3zh?.t`，用上面的 `countingRuntime` 计数，不走这里。
 * 函数体逐字取自真实转换结果；`tExpression` 是入口真实的取用表达式（桌面是真实 glue 的
 * `__t3zh_t`），`render` 是转换结果里消费 `item.label` 的那一行。计数包在真实 translator **外面**，
 * 实现本身一行不动：多查一次、少查一次都能从 `calls()` 看出来。
 */
function countingModuleSource(
  displayFunctionText: string,
  tExpression: string,
  render: (translated: unknown) => string,
  importLine = "",
): string {
  return [
    ...(importLine === "" ? [] : [`${importLine};`]),
    `let __t3zh_calls = 0;`,
    `const __t3zh_t = (value) => { __t3zh_calls += 1; return ${tExpression}; };`,
    `export ${displayFunctionText}`,
    `export const calls = () => __t3zh_calls;`,
    `export const reset = () => { __t3zh_calls = 0; };`,
    `export const render = (value) => (${render});`,
    "",
  ].join("\n");
}

/** 依次把 __t3zh 变成「没有」「没有 t」两种缺失形态，跑一遍断言后还原。 */
function withoutRuntime(assertions: (probe: () => void) => void): void {
  const g = globalThis as Record<string, any>;
  const previous = g.__t3zh;
  try {
    g.__t3zh = undefined;
    assertions(() => {});
    g.__t3zh = {};
    assertions(() => {});
    g.__t3zh = { t: null };
    assertions(() => {});
  } finally {
    g.__t3zh = previous;
  }
}

/**
 * 从源码里抽出 `const NAME = …;` 的**逐字文本**（方括号/花括号/圆括号配对到顶层分号）。
 * 逐字抽出而不是重建，任何写进声明内部的改动都会跟着被测到。
 */
function extractDeclaration(code: string, name: string): string {
  const start = code.indexOf(`const ${name} =`);
  assert.ok(start >= 0, `找不到 const ${name}`);
  let depth = 0;
  for (let i = code.indexOf("=", start); i < code.length; i++) {
    const character = code[i];
    if (character === "[" || character === "{" || character === "(") depth += 1;
    else if (character === "]" || character === "}" || character === ")") depth -= 1;
    else if (character === ";" && depth === 0) return code.slice(start, i + 1);
  }
  throw new Error(`const ${name} 没有找到顶层分号`);
}

/** 从逐字抽出的声明里读字符串数组元素（走 AST，注释里的引号不算）。 */
function stringArrayElements(declaration: string, name: string): string[] {
  const ast = parse(declaration, { sourceType: "module", plugins: ["typescript", "jsx"] });
  const found: string[] = [];
  const visit = (node: any): void => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      for (const item of node) visit(item);
      return;
    }
    if (node.type === "VariableDeclarator" && node.id?.name === name && node.init?.type === "ArrayExpression") {
      for (const element of node.init.elements) {
        assert.equal(element?.type, "StringLiteral", `${name} 的元素必须都是字符串字面量`);
        found.push(element.value);
      }
      return;
    }
    for (const [key, value] of Object.entries(node)) {
      if (key === "loc" || key === "start" || key === "end") continue;
      visit(value);
    }
  };
  visit(ast.program.body);
  assert.ok(found.length > 0, `找不到 const ${name} 的字符串数组`);
  return found;
}

/** 从源码里抽出 `export function NAME(...) { ... }` 的逐字文本（花括号配对扫描）。 */
function extractFunction(code: string, name: string): string {
  const start = code.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `找不到 function ${name}`);
  const bodyStart = code.indexOf("{", start);
  let depth = 0;
  for (let i = bodyStart; i < code.length; i++) {
    if (code[i] === "{") depth += 1;
    else if (code[i] === "}") {
      depth -= 1;
      if (depth === 0) return code.slice(start, i + 1);
    }
  }
  throw new Error(`function ${name} 花括号不配对`);
}

// ---------------------------------------------------------------------------
// 1. progress 门控：名单内查真实词条，名单外原样返回
// ---------------------------------------------------------------------------

/** 名单来源：客户端两处 + 服务端 GitManager 的 13 个 phase（§5.1 的精确名单）。 */
function expectedProgressValues(): string[] {
  const logic = upstream("apps/web/src/components/GitActionsControl.logic.ts");
  const gitManager = upstream("apps/server/src/git/GitManager.ts");
  const client = ["Pulling latest changes...", "Starting source control action..."].filter((value) =>
    logic.includes(JSON.stringify(value)),
  );
  assert.equal(client.length, 2, "客户端 progress 值不在 GitActionsControl.logic.ts");
  const server: string[] = [];
  for (const value of [
    "Generating commit message...",
    "Committing...",
    "Preparing feature branch...",
    "Pushing...",
  ]) {
    assert.ok(gitManager.includes(JSON.stringify(value)), `${value} 不在 GitManager.ts`);
    server.push(value);
  }
  // 三个短标签 / 单数术语来自 packages/shared 的 provider 展示（六种 kind 去重后是三组）：
  // github/forgejo/azure-devops/bitbucket → PR + pull request，gitlab → MR + merge request，
  // 未识别 kind（generic）→ change request/change request。
  const shared = upstream("packages/shared/src/sourceControl.ts");
  for (const [shortName, longName] of [
    ["PR", "pull request"],
    ["MR", "merge request"],
    ["change request", "change request"],
  ]) {
    assert.ok(
      shared.includes(`shortName: ${JSON.stringify(shortName)}`) &&
        shared.includes(`longName: ${JSON.stringify(longName)}`),
      `shared 里的 ${shortName}/${longName} 变了`,
    );
    server.push(`Preparing ${shortName}...`, `Generating ${shortName} content...`, `Creating ${longName}...`);
  }
  for (const template of [
    '`Preparing ${changeRequestTerms?.shortLabel ?? "PR"}...`',
    "`Generating ${terms.shortLabel} content...`",
    "`Creating ${terms.singular}...`",
  ]) {
    assert.ok(gitManager.includes(template), `${template} 不在 GitManager.ts`);
  }
  return [...client, ...server];
}

interface ProgressGate {
  list: string[];
  set: Set<string>;
  label: (value: string) => string;
}

/**
 * 名单、Set 与门控函数**逐字**取自真实转换后的 `GitActionsControl.tsx`（同一文件里的三段声明），
 * 只补上跨声明引用。这里不重建 Set，也不改任何一行：写进声明里的改动会原样被测到。
 */
async function loadProgressGate(): Promise<ProgressGate> {
  const code = transformed("apps/web/src/components/GitActionsControl.tsx");
  const arrayDeclaration = extractDeclaration(code, "KNOWN_GIT_ACTION_PROGRESS");
  const setDeclaration = extractDeclaration(code, "KNOWN_GIT_ACTION_PROGRESS_SET");
  const labelDeclaration = extractDeclaration(code, "progressLabel");
  const file = path.join(MODULE_DIR, `progressLabel-${moduleCounter++}.ts`);
  fs.writeFileSync(
    file,
    `${arrayDeclaration}\n${setDeclaration}\n${labelDeclaration}\nexport { progressLabel };\n`,
  );
  const mod = (await import(pathToFileURL(file).href)) as {
    progressLabel: (value: string) => string;
  };
  return {
    list: stringArrayElements(arrayDeclaration, "KNOWN_GIT_ACTION_PROGRESS"),
    set: new Set(stringArrayElements(arrayDeclaration, "KNOWN_GIT_ACTION_PROGRESS")),
    label: mod.progressLabel,
  };
}

test("progress 门控：名单是普通数组（非 new Set([...])），与真实来源集合相等且无重复", () => {
  const code = read("apps/web/src/components/GitActionsControl.tsx");
  assert.match(code, /const KNOWN_GIT_ACTION_PROGRESS = \[/, "名单必须是数组字面量（§5.5）");
  assert.match(code, /const KNOWN_GIT_ACTION_PROGRESS_SET = new Set\(KNOWN_GIT_ACTION_PROGRESS\)/);
  assert.doesNotMatch(code, /new Set\(\[/, "禁止 new Set([...literals])（§5.5）");
  assert.doesNotMatch(code, /\.includes\(value\)/, "禁止 [...].includes 门控（§5.5）");

  const list = stringArrayElements(extractDeclaration(code, "KNOWN_GIT_ACTION_PROGRESS"), "KNOWN_GIT_ACTION_PROGRESS");
  const expected = expectedProgressValues();
  // 集合相等，不是只比长度：重复值替掉某个来源值时 length 可能仍然相等。
  assert.equal(new Set(list).size, list.length, "名单有重复值");
  assert.equal(list.length, expected.length);
  assert.deepEqual([...list].sort(), [...expected].sort());
  for (const value of list) assert.ok(value in MAIN_DICT.messages, `${value} 缺精确词条`);
});

test("progress 门控：名单内 15 个值都查到真实译文（各查 1 次表）", async () => {
  const gate = await loadProgressGate();
  const runtime = countingRuntime("zh-CN");
  try {
    for (const value of gate.list) {
      runtime.reset();
      assert.equal(gate.label(value), TRANSLATOR(value), value);
      assert.equal(gate.label(value), MAIN_DICT.messages[value], value);
      assert.notEqual(gate.label(value), value, value);
      runtime.reset();
      gate.label(value);
      assert.equal(runtime.calls(), 1, `${value} 应恰好查 1 次表`);
    }
  } finally {
    runtime.restore();
  }
});

test("progress 门控：名单外 / 任意服务端文字原样返回（0 次查表），不被宽模板改坏", async () => {
  const gate = await loadProgressGate();
  const runtime = countingRuntime("zh-CN");
  try {
    const unknown = [
      "Custom status",
      "Upload files",
      "Compare head to base",
      "Running pre-commit...",
      "Running hook...",
      "Preparing feature ref...",
      "Pushing to origin/main...",
      "Pushing to main...",
      "Anything the server sends",
    ];
    for (const value of unknown) {
      runtime.reset();
      assert.equal(gate.label(value), value, value);
      assert.equal(runtime.calls(), 0, `${value} 是名单外内容，不该查表`);
    }
    // 反证：这批文字里凡是被宽模板命中的，直接 t() 都会被改坏 —— 门控就是为此。
    // `Preparing feature ref...` 是唯一没有任何模板命中的一项，raw t() 也原样。
    const corruptedByTemplate = unknown.filter((value) => TRANSLATOR(value) !== value);
    assert.deepEqual(corruptedByTemplate, [
      "Custom status",
      "Upload files",
      "Compare head to base",
      "Running pre-commit...",
      "Running hook...",
      "Pushing to origin/main...",
      "Pushing to main...",
      "Anything the server sends",
    ]);
    for (const value of corruptedByTemplate) {
      assert.notEqual(TRANSLATOR(value), value, `反证：${value} 直接 t() 未被改坏`);
    }
    assert.equal(TRANSLATOR("Preparing feature ref..."), "Preparing feature ref...");
  } finally {
    runtime.restore();
  }
});

test("progress 门控：en 模式下 15 个值和名单外内容都原样", async () => {
  const gate = await loadProgressGate();
  const restore = installRuntime("en");
  try {
    for (const value of gate.list) assert.equal(gate.label(value), value, value);
    for (const value of ["Custom status", "Running pre-commit...", "Preparing feature ref..."]) {
      assert.equal(gate.label(value), value, value);
    }
  } finally {
    restore();
  }
});

test("progress 门控：缺 __t3zh、缺 t 时名单内的值也返回原文", async () => {
  const gate = await loadProgressGate();
  withoutRuntime(() => {
    for (const value of gate.list) assert.equal(gate.label(value), value);
  });
});

// ---------------------------------------------------------------------------
// 2. providerStatusLabel：真实 getProviderSummary + 真实插件转换后的消费
// ---------------------------------------------------------------------------

const PROVIDER_MODULE = await loadTransformedModule<{
  getProviderSummary: (provider: any) => { headline: string; detail: string | null };
  providerStatusLabel: (headline: string) => string;
}>("apps/web/src/components/settings/providerStatus.ts");

/** 只填 getProviderSummary 会读的字段；auth.label 按契约是任意非空字符串。 */
function providerFixture(
  overrides: {
    enabled?: boolean;
    status?: string;
    installed?: boolean;
    auth?: { status: string; label?: string; type?: string };
    message?: string;
  } = {},
): any {
  const auth = overrides.auth ?? { status: "authenticated" };
  return {
    enabled: true,
    status: "ready",
    installed: true,
    message: undefined,
    ...overrides,
    // getProviderSummary 先看 unauthenticated 再看 authenticated（上游顺序），必须给其中一个状态。
    auth: auth.status === "authenticated" || auth.status === "unauthenticated" ? auth : { status: "unknown" },
  };
}

test("providerStatusLabel：真实 summary 链——静态 headline 中译，动态认证参数原样且零次再查表", async () => {
  const restore = installRuntime("zh-CN");
  try {
    const { getProviderSummary, providerStatusLabel } = PROVIDER_MODULE;
    // 静态 headline：插件在定义处已翻的保持译文，唯一被插件跳过的 Unavailable 在显示处翻。
    assert.equal(providerStatusLabel(getProviderSummary(providerFixture({ status: "error" })).headline), "不可用");
    assert.equal(providerStatusLabel(getProviderSummary(providerFixture({ status: "disabled" })).headline), "已停用");
    assert.equal(providerStatusLabel(getProviderSummary(providerFixture({ installed: false })).headline), "未找到");
    assert.equal(providerStatusLabel(getProviderSummary(undefined).headline), "正在检查服务提供方状态");
    assert.equal(providerStatusLabel(getProviderSummary(providerFixture({ status: "warning" })).headline), "需要处理");
    assert.equal(
      providerStatusLabel(getProviderSummary(providerFixture({ auth: { status: "unknown" } })).headline),
      "可用",
    );

    // 真实链：插件在源头把 headline 译成中文、参数原样带出，消费处必须逐字节返回（不再查表）。
    const runtime = countingRuntime("zh-CN");
    try {
      for (const headline of [
        getProviderSummary(providerFixture({ auth: { status: "authenticated", label: "Custom status" } })).headline,
        getProviderSummary(providerFixture({ auth: { status: "unauthenticated", label: "Custom status" } })).headline,
        getProviderSummary(providerFixture({ auth: { status: "authenticated", label: "OAuth" } })).headline,
      ]) {
        // 动态参数必须逐字保留（r4 复现链：重译后变成 `已认证 · Custo 分 statu 秒`）。
        assert.ok(headline.includes("Custom status") || headline.includes("OAuth"), `headline 丢了参数：${headline}`);
        assert.doesNotMatch(headline, /Custo 分|statu 秒/, `插件转换已改坏 headline：${headline}`);
        runtime.reset();
        assert.equal(providerStatusLabel(headline), headline, headline);
        assert.equal(runtime.calls(), 0, `已翻译的 headline 不该再查表：${headline}`);
      }
    } finally {
      runtime.restore();
    }
    assert.equal(
      providerStatusLabel(getProviderSummary(providerFixture({ auth: { status: "authenticated", label: "Custom status" } })).headline),
      "已认证 · Custom status",
    );
    assert.equal(
      providerStatusLabel(getProviderSummary(providerFixture({ auth: { status: "unauthenticated", label: "Custom status" } })).headline),
      "未认证 · Custom status",
    );
  } finally {
    restore();
  }
});

test("providerStatusLabel：英文认证骨架的接受边界（恰好一个分隔符）+ 查表次数", async () => {
  const { providerStatusLabel } = PROVIDER_MODULE;
  const runtime = countingRuntime("zh-CN");
  try {
    // 接受的英文骨架：兜底路径（zh 模式下正常已在插件源头译好，这里只在定义点没被覆盖时补翻）。
    // 词库这两条模板就是为此存在：`Authenticated · {method}` / `Not authenticated · {0}`。
    for (const [headline, expected, parameter] of [
      ["Authenticated · Custom status", "已认证 · Custom status", "Custom status"],
      ["Not authenticated · Custom status", "未认证 · Custom status", "Custom status"],
      ["Authenticated · OAuth", "已认证 · OAuth", "OAuth"],
      ["Authenticated · x\ny", "已认证 · x\ny", "x\ny"],
    ] as const) {
      runtime.reset();
      const out = providerStatusLabel(headline);
      assert.equal(out, expected, headline);
      assert.ok(out.includes(parameter), `${headline} 的参数没有逐字回填：${out}`);
      assert.equal(runtime.calls(), 1, `${headline} 应恰好查 1 次表`);
    }

    // 拒绝的输入：一律原样，且**一次表都不查**。
    for (const headline of [
      "已认证 · Custom status", // 插件已翻译的结果
      "未认证 · Custom status",
      "Custom status", // 任意服务端文字
      "Some other headline",
      "Authenticated · ", // 裸前缀，没有参数
      "Not authenticated · ",
      "Authenticated · x · y", // 参数里还有分隔符 → 不是审核过的骨架
      "Not authenticated · x · y",
      "已认证",
    ]) {
      runtime.reset();
      assert.equal(providerStatusLabel(headline), headline, headline);
      assert.equal(runtime.calls(), 0, `${headline} 不该查表`);
    }

    // 静态名单里的值查表（Unavailable 是唯一被插件跳过的那条）。
    runtime.reset();
    assert.equal(providerStatusLabel("Unavailable"), "不可用");
    assert.equal(runtime.calls(), 1);
    runtime.reset();
    assert.equal(providerStatusLabel("不可用"), "不可用");
    assert.equal(runtime.calls(), 0);
  } finally {
    runtime.restore();
  }
});

test("providerStatusLabel：en / 缺 __t3zh / 缺 t 时原样返回", async () => {
  const { providerStatusLabel } = PROVIDER_MODULE;
  for (const value of [
    "Unavailable",
    "Authenticated · Custom status",
    "Authenticated · x · y",
    "已认证 · Custom status",
  ]) {
    withoutRuntime(() => assert.equal(providerStatusLabel(value), value));
  }
  const restoreEn = installRuntime("en");
  try {
    for (const value of ["Unavailable", "Authenticated · Custom status", "Authenticated · x · y"]) {
      assert.equal(providerStatusLabel(value), value);
    }
  } finally {
    restoreEn();
  }
});

// ---------------------------------------------------------------------------
// 3. localizeTerminologyText：整串优先 / 术语先行的受控替换（§5.2、§5.4）
// ---------------------------------------------------------------------------

interface Terminology {
  shortLabel: string;
  singular: string;
}

const PROVIDERS: ReadonlyArray<{ name: string; providerName: string; terminology: Terminology }> = [
  { name: "github", providerName: "GitHub", terminology: { shortLabel: "PR", singular: "pull request" } },
  { name: "gitlab", providerName: "GitLab", terminology: { shortLabel: "MR", singular: "merge request" } },
  { name: "generic", providerName: "Bitbucket", terminology: { shortLabel: "change request", singular: "change request" } },
];

const LOCALIZE_MODULE = await loadTransformedModule<{
  localizeTerminologyText: (text: string, terminology: Terminology, preserve?: string | null) => string;
}>("apps/web/src/sourceControlPresentation.ts");
const localize = LOCALIZE_MODULE.localizeTerminologyText;

// ---------------------------------------------------------------------------
// 3b. 真实 shared → getSourceControlPresentation → 转换后 dialog 调用表达式
// ---------------------------------------------------------------------------

/**
 * 真实调用链的三个模块（都在 /tmp，改动只落在临时文件里）：
 *
 * - `shared/sourceControl.ts`：upstream `packages/shared/src/sourceControl.ts` 的逐字节副本。
 *   它只 `import type`，Node 的类型擦除会去掉，所以 `@t3tools/*` 不需要真实依赖。
 * - `presentation.ts`：补丁后 + 真实转换后的 `sourceControlPresentation.ts`。它 import 的
 *   `@t3tools/shared/sourceControl` 被接回上面那份真实源码（`getChangeRequestTerminology` /
 *   `resolveChangeRequestPresentation` 都是真的），图标换成最小替身（只出现在返回对象里，
 *   测试不比较图标，也不渲染 UI）。
 * - `dialog.ts`：只接真实 `presentation.ts`，里面嵌的是从**真实转换后**的
 *   `PullRequestThreadDialog.tsx` 里逐字抽出的那段 `localizeTerminologyText(...)` 调用表达式
 *   —— 生产接入（第三参 `sourceControlPresentation.providerName`）被改坏，这里就跟着变。
 *   （整份 `PullRequestThreadDialog.tsx` 不能直接当模块跑：JSX 在 `.ts` 里解析不了，
 *   图标与 `@t3tools/*` 也要构建树；这段表达式两样都不依赖。）
 */
const DIALOG_CHAIN_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "t3zh-0004-dialog-"));
const DIALOG_SHARED_FILE = path.join(DIALOG_CHAIN_DIR, "shared/sourceControl.ts");
const DIALOG_PRESENTATION_FILE = path.join(DIALOG_CHAIN_DIR, "presentation.ts");
const DIALOG_MODULE_FILE = path.join(DIALOG_CHAIN_DIR, "dialog.ts");

/** 从转换后的 dialog 源码里逐字抽出 description 的那个 `localizeTerminologyText(...)` 调用。 */
function extractDialogDescriptionCall(code: string): {
  text: string;
  thirdArgumentStart: number;
  thirdArgumentEnd: number;
} {
  const ast = parse(code, { sourceType: "module", plugins: ["typescript", "jsx"] });
  let found: any = null;
  const visit = (node: any): void => {
    if (!node || typeof node !== "object" || found) return;
    if (Array.isArray(node)) {
      for (const item of node) visit(item);
      return;
    }
    if (
      node.type === "CallExpression" &&
      node.callee?.type === "Identifier" &&
      node.callee.name === "localizeTerminologyText" &&
      node.arguments?.[0]?.type === "TemplateLiteral" &&
      typeof node.arguments[0].quasis?.[0]?.value?.cooked === "string" &&
      node.arguments[0].quasis[0].value.cooked.startsWith("Resolve a ")
    ) {
      found = node;
      return;
    }
    for (const [key, value] of Object.entries(node)) {
      if (key === "loc" || key === "start" || key === "end") continue;
      visit(value);
    }
  };
  visit(ast.program.body);
  assert.ok(found, "没找到 PullRequestThreadDialog 描述里的 localizeTerminologyText 调用");
  assert.equal(found.arguments.length, 3, "描述调用应该传三个实参（text / terminology / preserve）");
  return {
    text: code.slice(found.start, found.end),
    thirdArgumentStart: found.arguments[2].start - found.start,
    thirdArgumentEnd: found.arguments[2].end - found.start,
  };
}

fs.mkdirSync(path.dirname(DIALOG_SHARED_FILE), { recursive: true });
fs.copyFileSync(path.join(UPSTREAM, "packages/shared/src/sourceControl.ts"), DIALOG_SHARED_FILE);
fs.writeFileSync(
  DIALOG_PRESENTATION_FILE,
  [
    transformed("apps/web/src/sourceControlPresentation.ts"),
    // 接回真实 shared 实现（补丁后的 presentation 只用这两个函数）。
    `import { getChangeRequestTerminology, resolveChangeRequestPresentation } from ${JSON.stringify("./shared/sourceControl.ts")};`,
    // 图标只出现在返回对象的 `Icon` 字段里，本测试不渲染 UI、也不比较图标。
    "const IconStub = () => null;",
    "const PullRequestGlyph = { pullRequest: IconStub };",
    "const GitHubIcon = IconStub;",
    "const GitLabIcon = IconStub;",
    "const ForgejoIcon = IconStub;",
    "const AzureDevOpsIcon = IconStub;",
    "const BitbucketIcon = IconStub;",
    "",
  ].join("\n"),
);

/**
 * 从**真实转换后**的 dialog 源码里逐字取出 description 那个
 * `localizeTerminologyText(...)` 调用表达式，拼进一个可 import 的小模块执行。
 * 整个 `PullRequestThreadDialog.tsx` 不能直接当模块跑（JSX 不能在 `.ts` 里解析、
 * 图标/`@t3tools/*` 也要构建树），而这段表达式本身不依赖 JSX。
 */
function buildDialogModuleSource(): string {
  const call = extractDialogDescriptionCall(transformPatched("apps/web/src/components/PullRequestThreadDialog.tsx"));
  return [
    // 与 dialog 里同样的绑定方式：`terminology` 来自真实 `getSourceControlPresentation`。
    `import { getSourceControlPresentation, localizeTerminologyText } from ${JSON.stringify("./presentation.ts")};`,
    "export function renderDescription(provider: any): string {",
    "  const sourceControlPresentation = getSourceControlPresentation(provider);",
    "  const terminology = sourceControlPresentation.terminology;",
    `  return (${call.text});`,
    "}",
    `export const descriptionCall = ${JSON.stringify(call.text)};`,
    `export const descriptionCallWithoutThirdArgument = ${JSON.stringify(
      call.text.slice(0, call.thirdArgumentStart) + "undefined" + call.text.slice(call.thirdArgumentEnd),
    )};`,
    "",
  ].join("\n");
}

fs.writeFileSync(DIALOG_MODULE_FILE, buildDialogModuleSource());

const PRESENTATION_MODULE = (await import(pathToFileURL(DIALOG_PRESENTATION_FILE).href)) as {
  getSourceControlPresentation: (provider: any) => {
    providerName: string;
    terminology: Terminology;
  };
};
const DIALOG_MODULE = (await import(pathToFileURL(DIALOG_MODULE_FILE).href)) as {
  renderDescription: (provider: any) => string;
  descriptionCall: string;
  descriptionCallWithoutThirdArgument: string;
};

/** 三种术语碰撞的代表 provider：kind 决定术语，name 是契约允许的任意非空字符串。 */
const TERM_COLLISION_PROVIDERS: ReadonlyArray<{
  kind: string;
  providerName: string;
  terminology: Terminology;
  expected: string;
}> = [
  {
    kind: "unknown",
    providerName: "My change request host",
    terminology: { shortLabel: "change request", singular: "change request" },
    expected: "解析 My change request host 变更请求，然后在主仓库或独立工作树中创建草稿任务。",
  },
  {
    kind: "github",
    providerName: "My pull request host",
    terminology: { shortLabel: "PR", singular: "pull request" },
    expected: "解析 My pull request host 拉取请求，然后在主仓库或独立工作树中创建草稿任务。",
  },
  {
    kind: "gitlab",
    providerName: "My merge request host",
    terminology: { shortLabel: "MR", singular: "merge request" },
    expected: "解析 My merge request host 合并请求，然后在主仓库或独立工作树中创建草稿任务。",
  },
];

test("真实链：shared → getSourceControlPresentation → 转换后 dialog 调用的 providerName 术语碰撞", async () => {
  // 生产接线：第三参必须是 `sourceControlPresentation.providerName`（不是 undefined、不是别的）。
  assert.match(
    DIALOG_MODULE.descriptionCall,
    /sourceControlPresentation\.providerName,\s*\)$/,
    "dialog 描述调用的第三参不再是 providerName",
  );

  const restore = installRuntime("zh-CN");
  try {
    for (const { kind, providerName, terminology, expected } of TERM_COLLISION_PROVIDERS) {
      const provider = { kind, name: providerName, baseUrl: "" };
      // 术语与 providerName 都来自真实 shared（`resolveChangeRequestPresentation` /
      // `getChangeRequestTerminology`），不是测试手写的常量。
      const presentation = PRESENTATION_MODULE.getSourceControlPresentation(provider);
      assert.equal(presentation.providerName, providerName);
      assert.deepEqual(presentation.terminology, terminology, `${kind} 的术语变了`);
      // 真实转换后的 dialog 调用表达式，逐字执行。
      const out = DIALOG_MODULE.renderDescription(provider);
      assert.equal(out, expected, `${providerName} 的完整译文不符`);
      // 原 providerName 逐字出现 —— r5 要求的核心断言。
      assert.ok(out.includes(providerName), `providerName 没有逐字保留：${providerName} → ${out}`);
      // 术语照常译成词库值，且不再残留英文术语。
      assert.ok(out.includes(MAIN_DICT.messages[terminology.singular]), `术语未译成词库值：${out}`);
      assert.doesNotMatch(out, /Resolve a |draft thread|main repo|dedicated worktree/, `未整句翻译：${out}`);
    }

    // 反证：把**同一段真实调用表达式**的第三参换成 undefined（生产接入丢失的形态）就会
    // 换掉 providerName 里的术语。这条只证明该实参是必需的，不替代上面的生产链断言。
    const localizeFn = localize;
    const evaluate = (callText: string, provider: any): string => {
      const fn = new Function(
        "localizeTerminologyText",
        "sourceControlPresentation",
        "terminology",
        `return (${callText});`,
      ) as (...args: any[]) => string;
      const presentation = PRESENTATION_MODULE.getSourceControlPresentation(provider);
      return fn(localizeFn, presentation, presentation.terminology);
    };
    for (const { kind, providerName } of TERM_COLLISION_PROVIDERS) {
      const provider = { kind, name: providerName, baseUrl: "" };
      const withoutPreserve = evaluate(DIALOG_MODULE.descriptionCallWithoutThirdArgument, provider);
      assert.ok(
        !withoutPreserve.includes(providerName),
        `丢掉第三参时术语替换仍保留了 providerName（反证失效）：${providerName} → ${withoutPreserve}`,
      );
      assert.notEqual(withoutPreserve, evaluate(DIALOG_MODULE.descriptionCall, provider));
    }
  } finally {
    restore();
  }
});


test("localizeTerminologyText：受控模板组合与骨架产出整句中文", async () => {
  const restore = installRuntime("zh-CN");
  try {
    for (const { terminology } of PROVIDERS) {
      const combos = [
        `Commit, push & ${terminology.shortLabel}`,
        `Commit, push & create ${terminology.shortLabel}`,
        `Push & create ${terminology.shortLabel}`,
        `Create ${terminology.shortLabel}`,
        `Commit, push & create ${terminology.shortLabel} from default ref?`,
        `Push & create ${terminology.shortLabel} from default ref?`,
      ];
      for (const combo of combos) {
        const out = localize(combo, terminology);
        assert.match(out, /[一-鿿]/, `${combo} 未产出中文：${out}`);
        assert.doesNotMatch(out.replace(/PR|MR|#\d+/g, ""), /[A-Za-z]{3,}/, `${combo} 残留英文：${out}`);
      }
      const skeletons = [
        `Create and checkout a ref before pushing or opening a ${terminology.singular}.`,
        `Branch is behind upstream. Pull/rebase before creating a ${terminology.singular}.`,
        `Detached HEAD: check out a branch before creating a ${terminology.singular}.`,
        `Commit local changes before creating a ${terminology.singular}.`,
        `No local commits to include in a ${terminology.singular}.`,
        `Create ${terminology.singular} is currently unavailable.`,
        `Checkout ${terminology.singular}`,
        `Resolving ${terminology.singular}...`,
        `Failed to prepare ${terminology.singular} thread.`,
      ];
      for (const text of skeletons) {
        const out = localize(text, terminology);
        assert.match(out, /[一-鿿]/, `${text} 未产出中文：${out}`);
        // `origin` 是命令/远端名，保留英文是正确译法，不计入残留。
        assert.doesNotMatch(
          out.replace(/GitHub|GitLab|HEAD|URL|PR|MR|origin|#\d+/g, ""),
          /[A-Za-z]{3,}/,
          `${text} 残留英文：${out}`,
        );
        // 术语只翻一次：结果里不该再出现英文术语，也不该出现「中文术语被当参数」的半截形态。
        assert.doesNotMatch(out, new RegExp(`\\{request\\}|${terminology.singular}`), `${text} 术语未替换干净：${out}`);
      }
    }
  } finally {
    restore();
  }
});

test("localizeTerminologyText：有限调用集的每个实参都产出中文（无回退）", async () => {
  const restore = installRuntime("zh-CN");
  try {
    // 这一层的调用点是有限集合：固定标签、固定兜底句、以及唯一的动态部分是 provider
    // 自身术语的模板字面量。没有像 progress 那样由服务端填的任意文字，所以此层不做
    // 名单门控（门控在 GitActionsControl 的 progress 上），而由维护测试钉住有限集覆盖。
    // 逐字来源：GitActionsControl.logic.ts:226/268/280/320/354/429-437、
    // GitActionsControl.tsx:334-348、PullRequestThreadDialog.tsx:174-223/267。
    for (const { terminology } of PROVIDERS) {
      const args = [
        `Create ${terminology.shortLabel}`,
        `Commit, push & ${terminology.shortLabel}`,
        `Push & create ${terminology.shortLabel}`,
        `Push & create ${terminology.shortLabel} from default ref?`,
        `Commit, push & create ${terminology.shortLabel} from default ref?`,
        `Commit, push & create ${terminology.shortLabel}`,
        `Create and checkout a ref before pushing or opening a ${terminology.singular}.`,
        `Detached HEAD: check out a branch before creating a ${terminology.singular}.`,
        `Commit local changes before creating a ${terminology.singular}.`,
        `Add an "origin" remote before creating a ${terminology.singular}.`,
        `No local commits to include in a ${terminology.singular}.`,
        `Branch is behind upstream. Pull/rebase before creating a ${terminology.singular}.`,
        `Create ${terminology.singular} is currently unavailable.`,
        `Checkout ${terminology.singular}`,
        `Resolving ${terminology.singular}...`,
        `Failed to prepare ${terminology.singular} thread.`,
        `Paste a ${terminology.singular} URL, checkout command, or enter 123 / #123.`,
        `Use a ${terminology.singular} URL, checkout command, 123, or #123.`,
      ];
      for (const text of args) {
        const out = localize(text, terminology);
        assert.match(out, /[一-鿿]/, `${text} 未产出中文：${out}`);
        assert.notEqual(out, text, `${text} 未翻译`);
      }
    }
    // 无术语的固定标签（如菜单里的 Branch）走同一条路时也照常翻译成中文。
    assert.equal(localize("Branch", PROVIDERS[0].terminology), MAIN_DICT.messages["Branch"]);
  } finally {
    restore();
  }
});

test("localizeTerminologyText：默认分支对话框的动态分支名与 providerName 原样保留", async () => {
  const restore = installRuntime("zh-CN");
  try {
    // GitActionsControl.logic.ts 的 resolveDefaultBranchActionDialogCopy：description 里带
    // 分支名后缀，continueLabel 是 `Push to <branch>` / `Commit & push to <branch>`。
    const branches = ["main", "feature/foo", "Custom status", "release/2026-10"];
    for (const branch of branches) {
      for (const text of [`Push to ${branch}`, `Commit & push to ${branch}`]) {
        const out = localize(text, PROVIDERS[2].terminology);
        assert.match(out, /[一-鿿]/, `${text} 未产出中文：${out}`);
        assert.ok(out.includes(branch), `动态分支名被改坏：${text} → ${out}`);
      }
      const description = `This action will commit, push, and create a change request on "${branch}". You can continue on this ref or create a feature ref and run the same action there.`;
      const out = localize(description, PROVIDERS[2].terminology);
      assert.ok(out.includes(branch), `description 里的动态分支名被改坏：${out}`);
      assert.doesNotMatch(out, /change request/, `description 仍是半截英文：${out}`);
    }
    // PullRequestThreadDialog 的 providerName 碰撞链在上一节用真实 shared + 真实 dialog 调用
    // 断言完整译文；这里只补一条不碰撞的普通 provider，确认原行为没变。
    const out = DIALOG_MODULE.renderDescription({ kind: "github", name: "GitHub", baseUrl: "" });
    assert.ok(out.includes("GitHub"), `providerName 被改坏：${out}`);
    assert.doesNotMatch(out, /Resolve a |draft thread|main repo|dedicated worktree/, `未整句翻译：${out}`);
  } finally {
    restore();
  }
});

test("localizeTerminologyText：无 __t3zh / 无 t / en 时返回原文", async () => {
  const text = "Commit, push & MR";
  const terminology = { shortLabel: "MR", singular: "merge request" };
  withoutRuntime(() => assert.equal(localize(text, terminology), text));
  const restoreEn = installRuntime("en");
  try {
    assert.equal(localize(text, terminology), text);
    assert.equal(localize("Push to feature/foo", terminology), "Push to feature/foo");
    assert.equal(localize("Checkout pull request", PROVIDERS[0].terminology), "Checkout pull request");
    assert.equal(
      localize("Resolve a My change request host change request, then create the draft thread in the main repo or in a dedicated worktree.", PROVIDERS[2].terminology, "My change request host"),
      "Resolve a My change request host change request, then create the draft thread in the main repo or in a dedicated worktree.",
    );
  } finally {
    restoreEn();
  }
});

// ---------------------------------------------------------------------------
// 4. 菜单链：浏览器 DOM fallback 与桌面原生菜单
// ---------------------------------------------------------------------------

/** 两条菜单链共用的审核标签名单（补丁里两处字面量必须一致）。 */
const AUDITED_MENU_LABELS = [
  "Branch", "Copy Path", "Reveal in Finder", "Reveal in File Explorer", "Reveal in Files",
];

/**
 * 已译好的中文标签：`Branch` / `Copy Path` 的译文（主词库与真实桌面词库同值，native 段上面
 * 已用 `DESKTOP_DICT.messages` 断言过），外加插件自己在定义处包过的 `Preview media`。
 * 名单门控只看英文原文，这些中文值一律不该进翻译 ——「已译值先查再放行」即使结果不变也必须
 * 被抓到，所以两端都断言 0 次查表。
 */
const ALREADY_TRANSLATED_MENU_LABELS = [
  ...AUDITED_MENU_LABELS.map(label => MAIN_DICT.messages[label]),
  "Preview media",
];

/** 菜单链里由用户 / 服务端拥有、绝不能送进翻译的标签。 */
const DYNAMIC_MENU_LABELS = [
  "Custom status",
  "/tmp/Custom status",
  "feature/custom status",
  "New thread on Custom status",
  "Open in Custom Editor",
  "Copy Custom Path",
  "Some Other Project",
  "/tmp/Reveal in Finder.zip",
  "Reveal in Custom Finder",
];

test("文件芯片菜单：真实平台标签与菜单表达式在 DOM / 原生入口中译，动作 id 保持不变", async () => {
  const labels = await loadTransformedModule<{
    revealInFileExplorerLabel: (platform: string) => string;
    revealInFileExplorerLabelForOs: (os: string) => string;
    revealInFileExplorerLabelForKind: (kind: string) => string;
  }>("apps/web/src/components/preview/fileExplorerLabel.ts");
  const source = transformPatched("apps/web/src/components/ChatMarkdown.tsx");
  const ast = parse(source, { sourceType: "module", plugins: ["typescript", "jsx"] });
  let menuExpression = "";
  function visit(node: any) {
    if (!node || typeof node !== "object") return;
    if (node.type === "CallExpression" && node.callee?.property?.name === "show") {
      const argument = node.arguments[0];
      const expression = source.slice(argument.start, argument.end);
      if (expression.includes('id: "reveal"') && expression.includes('id: "copy-relative"')) {
        assert.equal(menuExpression, "", "文件菜单表达式不唯一");
        menuExpression = expression;
      }
    }
    for (const [key, value] of Object.entries(node)) {
      if (key === "loc" || key === "extra") continue;
      if (Array.isArray(value)) value.forEach(visit);
      else if (value && typeof value === "object") visit(value);
    }
  }
  visit(ast);
  assert.ok(menuExpression, "没有找到实际文件菜单表达式");
  const buildMenu = new Function("__t3zh_t", "onOpenMedia", "onOpen", "openInEditorMenuLabel",
    "onOpenInBrowser", "onReveal", "revealLabel",
    `return ${stripTypeScriptTypes(`(${menuExpression})`)};`);
  const dom = await loadTransformedModule<{ displayMenuLabel: (label: string) => string }>(
    "apps/web/src/contextMenuFallback.ts",
  );
  for (const locale of ["zh-CN", "en"] as const) {
    const restore = installRuntime(locale);
    try {
      const native = await loadNativeDisplayMenuLabel(makeDesktopLayout(),
        locale === "zh-CN" ? ["zh-Hans-CN"] : ["en-US"]);
      const t = (value: string) => globalThis.__t3zh?.t?.(value) ?? value;
      const choices = [
        [() => labels.revealInFileExplorerLabel("MacIntel"), "Reveal in Finder"],
        [() => labels.revealInFileExplorerLabel("Win32"), "Reveal in File Explorer"],
        [() => labels.revealInFileExplorerLabel("Linux"), "Reveal in Files"],
        [() => labels.revealInFileExplorerLabelForOs("darwin"), "Reveal in Finder"],
        [() => labels.revealInFileExplorerLabelForOs("windows"), "Reveal in File Explorer"],
        [() => labels.revealInFileExplorerLabelForOs("linux"), "Reveal in Files"],
        [() => labels.revealInFileExplorerLabelForKind("finder"), "Reveal in Finder"],
        [() => labels.revealInFileExplorerLabelForKind("file-explorer"), "Reveal in File Explorer"],
        [() => labels.revealInFileExplorerLabelForKind("files"), "Reveal in Files"],
      ] as const;
      for (const [label, english] of choices) {
        const items = buildMenu(t, false, true, t("Open in editor"), false, true, label());
        assert.deepEqual(items.map((item: any) => item.id), ["open", "reveal", "copy-relative", "copy-full"]);
        const expected = ["Open in editor", english, "Copy relative path", "Copy full path"]
          .map(value => locale === "zh-CN" ? MAIN_DICT.messages[value] : value);
        assert.deepEqual(items.map((item: any) => dom.displayMenuLabel(item.label)), expected);
        assert.deepEqual(items.map((item: any) => native.render(item.label)), expected);
      }
    } finally { restore(); }
  }
});

test("菜单链：DOM fallback 用真实模块——固定标签中译，动态项目名/环境名/路径原样，查表 0/1 次", async () => {
  const fallback = read("apps/web/src/contextMenuFallback.ts");
  assert.match(fallback, /header\.textContent = displayMenuLabel\(item\.label\)/);
  assert.match(fallback, /label\.textContent = displayMenuLabel\(item\.label\)/);
  const list = stringArrayElements(
    extractDeclaration(fallback, "TRANSLATABLE_MENU_LABELS"),
    "TRANSLATABLE_MENU_LABELS",
  );
  assert.deepEqual(list, AUDITED_MENU_LABELS, "DOM 菜单的可翻译标签名单变了");
  assert.match(fallback, /new Set\(TRANSLATABLE_MENU_LABELS\)/, "名单要经 Set 索引（§5.5）");

  const dom = await loadTransformedModule<{ displayMenuLabel: (label: string) => string }>(
    "apps/web/src/contextMenuFallback.ts",
  );
  const restore = installRuntime("zh-CN");
  try {
    for (const label of AUDITED_MENU_LABELS) {
      assert.equal(dom.displayMenuLabel(label), MAIN_DICT.messages[label], label);
      assert.notEqual(dom.displayMenuLabel(label), label, label);
      // 名单里的每条都必须有精确 messages，否则会落到宽模板上（这里用真实转换核对）。
      assert.ok(label in MAIN_DICT.messages && !(label in MAIN_DICT.templates), `${label} 没有精确词条`);
    }
    for (const label of DYNAMIC_MENU_LABELS) {
      assert.equal(dom.displayMenuLabel(label), label, `${label} 被误译`);
    }
    // 反证：这批动态值里有多个本来就会被宽模板改坏（门控就是为此）。
    const corruptedByTemplate = DYNAMIC_MENU_LABELS.filter((label) => TRANSLATOR(label) !== label);
    assert.deepEqual(corruptedByTemplate, [
      "Custom status",
      "/tmp/Custom status",
      "feature/custom status",
      "New thread on Custom status",
      "Open in Custom Editor",
      "Copy Custom Path",
      "/tmp/Reveal in Finder.zip",
      "Reveal in Custom Finder",
    ]);
    for (const label of corruptedByTemplate) assert.notEqual(TRANSLATOR(label), label, label);
    // 插件自己包过的标签（如 "Preview media"）不走这个入口，入口也不该再动它们。
    assert.equal(dom.displayMenuLabel("Preview media"), "Preview media");
  } finally {
    restore();
  }
  const restoreEn = installRuntime("en");
  try {
    for (const label of [...AUDITED_MENU_LABELS, ...DYNAMIC_MENU_LABELS]) {
      assert.equal(dom.displayMenuLabel(label), label, label);
    }
  } finally {
    restoreEn();
  }
  withoutRuntime(() => {
    for (const label of AUDITED_MENU_LABELS) assert.equal(dom.displayMenuLabel(label), label);
  });
});

/**
 * DOM 入口的 0/1 查表次数：真实转换后的 `displayMenuLabel` 直接走
 * `globalThis.__t3zh?.t?.(label) ?? label`，所以 `countingRuntime` 包在真实运行时外面就能
 * 数到它：名单内查 1 次、名单外 / 已翻译 / 缺运行时 0 次。en 下门控同样命中名单，
 * **仍按真实实现查 1 次**，只是 en 的 translator 是恒等函数、返回原文 —— 不是 0 次。
 */
test("菜单链：DOM 入口查表次数——名单内 1 次（含 en），名单外 / 已翻译 / 缺运行时 0 次", async () => {
  const dom = await loadTransformedModule<{ displayMenuLabel: (label: string) => string }>(
    "apps/web/src/contextMenuFallback.ts",
  );
  const runtime = countingRuntime("zh-CN");
  try {
    for (const label of AUDITED_MENU_LABELS) {
      runtime.reset();
      assert.equal(dom.displayMenuLabel(label), MAIN_DICT.messages[label], label);
      assert.equal(runtime.calls(), 1, `${label} 应恰好查 1 次表`);
      runtime.reset();
      dom.displayMenuLabel(label);
      assert.equal(runtime.calls(), 1, `${label} 重复调用每次只查 1 次`);
    }
    for (const label of DYNAMIC_MENU_LABELS) {
      runtime.reset();
      assert.equal(dom.displayMenuLabel(label), label, `${label} 被误译`);
      assert.equal(runtime.calls(), 0, `${label} 是名单外内容，不该查表`);
    }
    // 已翻译的标签（插件在定义处包过，或本来就在门控之外）同样不再查表。
    for (const label of ALREADY_TRANSLATED_MENU_LABELS) {
      runtime.reset();
      assert.equal(dom.displayMenuLabel(label), label, label);
      assert.equal(runtime.calls(), 0, `${label} 不该查表`);
    }
  } finally {
    runtime.restore();
  }

  // en：门控命中时**仍然调用一次**恒等 translator（结果原文），名单外一次都不调。
  const runtimeEn = countingRuntime("en");
  try {
    for (const label of AUDITED_MENU_LABELS) {
      runtimeEn.reset();
      assert.equal(dom.displayMenuLabel(label), label, label);
      assert.equal(runtimeEn.calls(), 1, `en 下 ${label} 仍按真实实现查 1 次表`);
    }
    for (const label of DYNAMIC_MENU_LABELS) {
      runtimeEn.reset();
      assert.equal(dom.displayMenuLabel(label), label, label);
      assert.equal(runtimeEn.calls(), 0, `en 下名单外 ${label} 不该查表`);
    }
  } finally {
    runtimeEn.restore();
  }

  withoutRuntime(() => {
    for (const label of [...AUDITED_MENU_LABELS, ...DYNAMIC_MENU_LABELS]) {
      assert.equal(dom.displayMenuLabel(label), label, label);
    }
  });
});

test("菜单链：LegacySidebar 项目右键菜单——以函数参数传 label 的固定动作也中译，且只查 1 次", async () => {
  const dom = await loadTransformedModule<{ displayMenuLabel: (label: string) => string }>(
    "apps/web/src/contextMenuFallback.ts",
  );
  const runtime = countingRuntime("zh-CN");
  try {
    const sidebar = read("apps/web/src/components/LegacySidebar.tsx");

    // r5 问题 2 的真实路径：项目的 Copy Path 经 buildTargetedItem("copy-path", "Copy Path") 传 label，
    // 插件在定义点没有字面量可包，DOM 端最终只会拿到英文 —— 门控名单必须覆盖这条路径。
    const buildTargetedItem = sidebar.match(
      /buildTargetedItem\(\s*"copy-path",\s*"Copy Path",?\s*\)/,
    );
    assert.ok(buildTargetedItem, "LegacySidebar 的 buildTargetedItem(\"copy-path\", \"Copy Path\") 变了");
    const item = { id: "copy-path:submenu", label: "Copy Path" };
    runtime.reset();
    assert.equal(dom.displayMenuLabel(item.label), "复制路径", "函数参数传出的 Copy Path 没有中译");
    assert.equal(runtime.calls(), 1, "函数参数传出的 Copy Path 应恰好查 1 次表");
    // 同一处调用点里仍在门控之外的固定动作保持英文（不在名单里，也不该被宽模板改坏）。
    for (const label of ["Rename", "Group into...", "Remove"]) {
      runtime.reset();
      assert.equal(dom.displayMenuLabel(label), label, `${label} 不该被这个入口翻译`);
      assert.equal(runtime.calls(), 0, `${label} 不该查表`);
    }
    // 项目子项的真实 label 是项目名 / 环境名 / 路径，必须原样。
    const projectTitles = ["Custom status", "/tmp/Custom status", "Some Other Project"];
    for (const label of projectTitles) {
      runtime.reset();
      assert.equal(dom.displayMenuLabel(label), label, label);
      assert.equal(runtime.calls(), 0, `${label} 不该查表`);
    }
  } finally {
    runtime.restore();
  }

  // 另一条同名但走对象字面量的路径（线程右键菜单）由插件在定义处包好，这里核对插件确实包了。
  assert.match(
    transformed("apps/web/src/components/LegacySidebar.tsx"),
    /\{\s*id: "copy-path",\s*label: __t3zh_t\("Copy Path"\)\s*\}/,
  );
  // 而以函数参数传 label 的那条（项目右键菜单）插件包不到，所以必须靠门控名单兜住 ——
  // 上面那条断言（原样源码里仍是英文 "Copy Path"）就是它没被插件包住的证据。
  assert.match(
    read("apps/web/src/components/LegacySidebar.tsx"),
    /buildTargetedItem\("copy-path", "Copy Path"\)/,
  );
});

/** 与 build-zh.sh 第 5 步同样的布局，外加 electron 替身（照 plugin/__tests__/desktop.test.ts）。 */
function makeDesktopLayout(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "t3zh-desktop-glue-"));
  const dir = path.join(root, "apps/desktop/src/t3zh");
  fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(path.join(ZH_ROOT, "plugin/desktop/t3zh-desktop.ts"), path.join(dir, "t3zh-desktop.ts"));
  fs.copyFileSync(path.join(ZH_ROOT, "runtime/t3zh-runtime.ts"), path.join(dir, "t3zh-runtime.ts"));
  fs.copyFileSync(DESKTOP_DICT_FILE, path.join(dir, "zh-CN.desktop.json"));
  const electron = path.join(root, "node_modules/electron");
  fs.mkdirSync(electron, { recursive: true });
  fs.writeFileSync(
    path.join(electron, "package.json"),
    JSON.stringify({ name: "electron", type: "module", main: "index.js" }),
  );
  fs.writeFileSync(
    path.join(electron, "index.js"),
    [
      "export const app = {",
      "  getPreferredSystemLanguages() {",
      "    return globalThis.__fakeSystemLanguages;",
      "  },",
      "};",
      "",
    ].join("\n"),
  );
  return root;
}

/**
 * 桌面原生链：`ElectronMenu.ts` 只在工具函数层面被覆盖 —— 它的 class 定义在模块加载时就要用
 * `effect/Schema`、`@t3tools/*`（构建树才有，本仓库 node_modules 里没有），整模块 import 需要
 * 构建目录，维护测试不依赖它。所以这里**逐字抽出**补丁后 + 真实转换后的
 * `TRANSLATABLE_MENU_LABELS`、`TRANSLATABLE_MENU_LABEL_SET` 与 `displayMenuLabel`，并把
 * `__t3zh_t` 用**真实 import 绑定**接上真实桌面 glue（真实桌面词库 + 真实
 * `createDesktopTranslator`）—— 名单、Set 初始化、函数体一行都不重建。
 *
 * `countingModuleSource` 在真实 glue 的 `__t3zh_t` **外面**包一层计数，所以「名单内查 1 次 /
 * 名单外和已译值查 0 次 / en 下仍按真实实现查 1 次」都是可断言的：改坏真实 Set、改坏函数体
 * （例如名单外或已译值先查再放行），或让入口多查一次，都会让本文件的测试失败。没有 `try`/`catch`
 * 回退：抽不到就 assert 失败。
 */
async function loadNativeDisplayMenuLabel(
  desktopRoot: string,
  systemLanguages: readonly string[],
): Promise<{
  displayMenuLabel: (label: string) => string;
  render: (label: string) => string;
  list: string[];
  calls: () => number;
  reset: () => void;
}> {
  const file = "apps/desktop/src/electron/ElectronMenu.ts";
  const source = transformPatched(file);
  const glue = path.join(desktopRoot, "apps/desktop/src/t3zh/t3zh-desktop.ts");
  const target = path.join(MODULE_DIR, `native-menu-${moduleCounter++}.ts`);
  fs.writeFileSync(
    target,
    [
      // 名单 / Set / 函数体逐字来自真实转换结果，不重建。
      extractDeclaration(source, "TRANSLATABLE_MENU_LABELS"),
      extractDeclaration(source, "TRANSLATABLE_MENU_LABEL_SET"),
      "export { TRANSLATABLE_MENU_LABELS };",
      countingModuleSource(
        extractFunction(source, "displayMenuLabel"),
        // 真实 glue 的导出（别名绑定，避免与计数包装同名）；查询串保证每次拿到独立模块实例
        // （语言只在首次调用时确定）。
        `__t3zh_glue(value)`,
        // 桌面原生菜单的真实消费形态（`ElectronMenu.ts` 的 `label: displayMenuLabel(item.label)`）。
        `displayMenuLabel(value)`,
        `import { __t3zh_t as __t3zh_glue } from ${JSON.stringify(`${glue}?instance=${target}`)}`,
      ),
    ].join("\n"),
  );
  (globalThis as Record<string, any>).__fakeSystemLanguages = [...systemLanguages];
  const mod = (await import(pathToFileURL(target).href)) as {
    displayMenuLabel: (label: string) => string;
    render: (label: string) => string;
    TRANSLATABLE_MENU_LABELS: string[];
    calls: () => number;
    reset: () => void;
  };
  return {
    displayMenuLabel: mod.displayMenuLabel,
    render: mod.render,
    list: mod.TRANSLATABLE_MENU_LABELS,
    calls: mod.calls,
    reset: mod.reset,
  };
}

test("菜单链：桌面原生入口真实模块 + 真实桌面词库——名单内译 1 次、名单外 0 次，en 原样", async () => {
  const source = read("apps/desktop/src/electron/ElectronMenu.ts");
  assert.match(source, /import \{ __t3zh_t \} from "\.\.\/t3zh\/t3zh-desktop\.ts"/);
  assert.match(source, /label: displayMenuLabel\(item\.label\)/);
  const list = stringArrayElements(
    extractDeclaration(source, "TRANSLATABLE_MENU_LABELS"),
    "TRANSLATABLE_MENU_LABELS",
  );
  assert.deepEqual(list, AUDITED_MENU_LABELS, "原生菜单的可翻译标签名单与 DOM 不一致");

  try {
    const native = await loadNativeDisplayMenuLabel(makeDesktopLayout(), ["zh-Hans-CN"]);
    assert.deepEqual(native.list, list, "原生模块导出的名单与源码不一致");
    for (const value of list) {
      // 桌面词库必须有精确词条（否则原生菜单只在 web 端中译，桌面端漏译 —— r4 问题 3）。
      assert.ok(value in DESKTOP_DICT.messages, `桌面词库缺 ${value}`);
      assert.equal(native.displayMenuLabel(value), DESKTOP_DICT.messages[value], value);
      assert.notEqual(native.displayMenuLabel(value), value, `${value} 在桌面词库下没中译`);
      // 真实消费入口（`label: displayMenuLabel(item.label)`）与直接调用一致。
      assert.equal(native.render(value), DESKTOP_DICT.messages[value], value);
      // 桌面词库不该靠模板匹配这些标签（模板匹配到别的文字会改坏动态内容）。
      assert.ok(!(value in DESKTOP_DICT.templates), `${value} 落在桌面词库的模板上`);
      // 名单内的标签查表**恰好 1 次**（重复查、查表后丢弃再查都能被发现）。
      native.reset();
      native.render(value);
      assert.equal(native.calls(), 1, `${value} 应恰好查 1 次表`);
    }
    for (const label of DYNAMIC_MENU_LABELS) {
      assert.equal(native.displayMenuLabel(label), label, `${label} 被误译`);
      // 名单外内容**一次表都不查**（「先查再放行」会在这里失败）。
      native.reset();
      native.render(label);
      assert.equal(native.calls(), 0, `${label} 是名单外内容，不该查表`);
    }
    // 已经译好的中文标签（插件在定义处包过、或上一轮已产出）**一次表都不查**：
    // 名单门控是 Set.has(label) 的精确判断，「已译值先查再放行」这种变异会在这里失败。
    for (const value of ALREADY_TRANSLATED_MENU_LABELS) {
      assert.equal(native.displayMenuLabel(value), value, `${value} 是已译值，不该再动`);
      assert.equal(native.render(value), value, `${value} 经真实消费入口也要原样`);
      native.reset();
      native.render(value);
      assert.equal(native.calls(), 0, `${value} 已翻译，应零次查表`);
      // 重复消费同一已译值：每次都不查表（累计 2 次调用仍为 0）。
      native.render(value);
      assert.equal(native.calls(), 0, `${value} 重复消费仍不该查表`);
    }
    // 词库里没有的英文菜单标签保持英文（不是本次目标，但不能被模板改坏）。
    for (const value of ["Copy branch name", "Preview media", "Rename", "Delete", "Copy"]) {
      assert.equal(native.displayMenuLabel(value), value, value);
      native.reset();
      native.render(value);
      assert.equal(native.calls(), 0, `${value} 不该查表`);
    }

    // 真实 native en 组合：系统语言解析为 en 时，同一个真实模块把名单里的标签也原样返回，
    // 且真实 glue 的 t 是恒等函数 —— 入口仍然要查 1 次表（查表本身不算错，结果是原文）。
    const nativeEn = await loadNativeDisplayMenuLabel(makeDesktopLayout(), ["en-US"]);
    for (const value of [...list, ...DYNAMIC_MENU_LABELS]) {
      assert.equal(nativeEn.render(value), value, `en 下 ${value} 应原样`);
    }
    // en 下门控仍命中名单，入口按真实实现**各查 1 次** glue（glue 的 t 是恒等函数，只是原文返回）；
    // 名单外（含动态值）一次都不查 —— 所以这条不能写成「en 零次」。
    for (const value of list) {
      nativeEn.reset();
      nativeEn.render(value);
      assert.equal(nativeEn.calls(), 1, `en 下名单内 ${value} 仍按真实实现走一次 glue`);
    }
    for (const value of DYNAMIC_MENU_LABELS) {
      nativeEn.reset();
      nativeEn.render(value);
      assert.equal(nativeEn.calls(), 0, `en 下名单外 ${value} 不该查表`);
    }
  } finally {
    delete (globalThis as Record<string, any>).__fakeSystemLanguages;
  }
});

// ---------------------------------------------------------------------------
// 5. §5.3：数据对象生成处不再预翻译
// ---------------------------------------------------------------------------

test("§5.3：数据对象生成处不含 __t3zh 调用", () => {
  for (const file of [
    "apps/web/src/components/GitActionsControl.logic.ts",
    "apps/web/src/components/threadActionMenu.logic.ts",
  ]) {
    assert.doesNotMatch(read(file), /__t3zh/, `${file} 不应在数据对象生成处翻译`);
  }
  const providerStatus = read("apps/web/src/components/settings/providerStatus.ts");
  assert.match(providerStatus, /headline: "Unavailable"/);
  assert.match(providerStatus, /export function providerStatusLabel\(headline: string\): string \{/);
  const sourceControl = read("apps/web/src/sourceControlPresentation.ts");
  assert.match(sourceControl, /terminology: getChangeRequestTerminology\(provider\)/);
});

// ---------------------------------------------------------------------------
// 6. usage 回归
// ---------------------------------------------------------------------------

test("usage 回归：UsagePriceOverrides 只翻 Input placeholder，比较处保持英文", () => {
  const code = read("apps/web/src/components/usage/UsagePriceOverrides.tsx");
  assert.match(code, /cell\.placeholder !== "Mixed"/);
  assert.match(code, /cell\.placeholder !== "Unavailable"/);
  assert.match(code, /__t3zh\?\.t\?\.\(aliasCell\.placeholder\)/);
  assert.match(code, /__t3zh\?\.t\?\.\(cell\.placeholder\)/);
  assert.equal(fs.existsSync(path.join(PATCHED, "apps/web/src/components/usage/usagePriceTable.ts")), false);
});

// ---------------------------------------------------------------------------
// 7. 清单与真实源码一致
// ---------------------------------------------------------------------------

test("progress 名单的来源与上游源码一致", () => {
  const gitManager = upstream("apps/server/src/git/GitManager.ts");
  for (const value of ["Generating commit message...", "Committing...", "Preparing feature branch...", "Pushing..."]) {
    assert.ok(gitManager.includes(JSON.stringify(value)), `${value} 不在 GitManager.ts`);
  }
  for (const template of [
    "`Generating ${terms.shortLabel} content...`",
    "`Creating ${terms.singular}...`",
    "`Preparing ${changeRequestTerms?.shortLabel ?? \"PR\"}...`",
  ]) {
    assert.ok(gitManager.includes(template), `${template} 不在 GitManager.ts`);
  }
  const logic = upstream("apps/web/src/components/GitActionsControl.logic.ts");
  assert.ok(logic.includes('"Pulling latest changes..."'));
  assert.ok(logic.includes('"Starting source control action..."'));
  // 名单里的 13 个服务端值都在主词库；namespaced 3 组的短标签变体也补了精确词条。
  for (const value of ["Preparing PR...", "Preparing MR...", "Preparing change request...", "Generating PR content...", "Generating MR content...", "Generating change request content...", "Creating pull request...", "Creating merge request...", "Creating change request..."]) {
    assert.ok(value in MAIN_DICT.messages, `${value} 缺精确词条`);
  }
});
