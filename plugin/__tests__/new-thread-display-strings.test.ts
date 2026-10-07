/**
 * patches/0007（新建任务页面上插件包不到的英文）测试，T09。
 * 运行：node --test "plugin/__tests__/*.test.ts"（或 npm run test:plugin）
 *
 * - 把 0004 里同文件的部分和 0007 依次打到 upstream/ 相关文件的副本上（与 build-zh.sh 的顺序一致），
 *   加载新增的 apps/web/src/newThreadDisplayStrings.ts。
 * - 默认名只翻名单里的精确值，用户起的名字原样；每次显示查表次数锁定为 0 / 1。
 * - 句中槽位：t() 只收到「固定骨架 + U+E000」，命中的是词库专用模板；项目名在翻译之后才插入。
 * - h1 aria-label：从补丁前后源码各取 headingLabel 表达式求值，en 模式逐个相同，zh 模式是预期译文。
 * - 补丁对转换判定的影响只有预期的几条跳过项（mixed-jsx 与纯标点）消失；新文件不产生候选、不引入值用途。
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { parse } from "@babel/parser";
import babelTraverse from "@babel/traverse";
import babelGenerator from "@babel/generator";

import { collectValueUse, createScanContext, scanModule, type ValueUseInfo } from "../matcher.ts";
import { createTranslator, installT3zhRuntime, type T3zhDict } from "../../runtime/t3zh-runtime.ts";

const traverse = ((babelTraverse as any).default ?? babelTraverse) as typeof import("@babel/traverse").default;
const generate = ((babelGenerator as any).default ?? babelGenerator) as typeof import("@babel/generator").default;

const ZH_ROOT = path.resolve(import.meta.dirname, "../..");
// 默认 upstream/（当前基线）；升级时可用 T3ZH_UPSTREAM 指向新 tag 的源码（scripts/upgrade-check.sh）。
const UPSTREAM = process.env.T3ZH_UPSTREAM ? path.resolve(process.env.T3ZH_UPSTREAM) : path.join(ZH_ROOT, "upstream");
const PATCHES = path.join(ZH_ROOT, "patches");
const PATCH = path.join(PATCHES, "0007-new-thread-display-strings.patch");
const MAIN_DICT: T3zhDict = JSON.parse(fs.readFileSync(path.join(ZH_ROOT, "dict/zh-CN.json"), "utf8"));
const HELPER = "apps/web/src/newThreadDisplayStrings.ts";
const HEADLINE = "apps/web/src/components/chat/DraftHeroHeadline.tsx";
const HEADER = "apps/web/src/components/chat/ChatHeader.tsx";
const PATCHED_FILES = [
  "apps/web/src/components/Sidebar.tsx",
  "apps/web/src/components/chat/ChatComposer.tsx",
  HEADER,
  HEADLINE,
  "apps/web/src/components/settings/SettingsFontPreviews.tsx",
  "apps/web/src/hooks/useThreadActionMenu.ts",
  "apps/web/src/hooks/useThreadActions.ts",
];
/** 0007 之前、同样改这些文件的补丁（build-zh.sh 按文件名顺序应用）。 */
const EARLIER_PATCHES: { patch: string; file: string }[] = [
  { patch: "0004-display-site-translation.patch", file: "apps/web/src/components/Sidebar.tsx" },
];
const SLOT = "";

type Node = any;

function copyUpstream(files: readonly string[]): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "t3zh-0007-"));
  for (const file of files) {
    fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
    fs.copyFileSync(path.join(UPSTREAM, file), path.join(dir, file));
  }
  return dir;
}

/** 0007 之前的补丁里同文件的部分（与构建时一致的起点）。 */
function applyEarlier(dir: string): void {
  for (const { patch, file } of EARLIER_PATCHES) {
    execFileSync("git", ["apply", `--include=${file}`, path.join(PATCHES, patch)], { cwd: dir });
  }
}

const BEFORE = copyUpstream(PATCHED_FILES);
applyEarlier(BEFORE);
const PATCHED = copyUpstream(PATCHED_FILES);
applyEarlier(PATCHED);
execFileSync("git", ["apply", PATCH], { cwd: PATCHED });

const read = (root: string, file: string) => fs.readFileSync(path.join(root, file), "utf8");
const helperCode = read(PATCHED, HELPER);

interface HelperModule {
  displayDefaultName(value: string | null | undefined): string | null | undefined;
  translateAroundSlot(before: string, after: string): [string, string];
  fillSlot(before: string, value: string, after: string): string;
  translateFixed(value: string): string;
}

async function loadHelper(): Promise<HelperModule> {
  return import(pathToFileURL(path.join(PATCHED, HELPER)).href);
}

/** 用真实主词库给 globalThis.__t3zh 装运行时，t 外面包一层记录调用；返回调用记录与恢复函数。 */
function installRuntime(locale: "zh-CN" | "en"): { calls: string[]; restore: () => void } {
  const g = globalThis as Record<string, any>;
  const previous = g.__t3zh;
  const installed = installT3zhRuntime(MAIN_DICT, {
    localStorage: { getItem: () => locale, setItem: () => {} },
    navigator: null,
    systemLanguages: null,
    document: null,
    location: null,
    target: null,
  });
  assert.equal(installed.locale, locale);
  const calls: string[] = [];
  g.__t3zh = {
    ...installed.api,
    t: (value: string) => {
      calls.push(value);
      return installed.api.t(value);
    },
  };
  return {
    calls,
    restore: () => {
      g.__t3zh = previous;
    },
  };
}

const translate = createTranslator(MAIN_DICT);

// 用户起的名字：有的单独交给 t() 会被模板改掉（反证在下面），显示处必须原样。
const USER_NAMES = [
  "t3code",
  "New thread on main",
  "New threads",
  "new thread",
  " New thread",
  "No project yet",
  "Custom status",
  "feature/foo to main",
  "Fix login bug",
];

test("默认名：名单里的精确值查到主词库译文，每次查表 1 次；其余原样，查表 0 次", async () => {
  const { displayDefaultName } = await loadHelper();
  const { calls, restore } = installRuntime("zh-CN");
  try {
    assert.equal(displayDefaultName("New thread"), "新建任务");
    assert.equal(displayDefaultName("No project"), "无项目");
    assert.equal(MAIN_DICT.messages["New thread"], "新建任务");
    assert.equal(MAIN_DICT.messages["No project"], "无项目");
    assert.deepEqual(calls, ["New thread", "No project"]);
    calls.length = 0;
    for (const name of USER_NAMES) assert.equal(displayDefaultName(name), name, name);
    assert.equal(displayDefaultName(null), null);
    assert.equal(displayDefaultName(undefined), undefined);
    assert.deepEqual(calls, [], "名单外的值不能交给 t()");
    // 反证：这些名字直接交给 t() 会被模板改坏。
    assert.notEqual(translate("New thread on main"), "New thread on main");
    assert.notEqual(translate(" New thread"), " New thread");
  } finally {
    restore();
  }
});

test("句中槽位：t() 只收到固定骨架 + U+E000，命中专用模板，切出的两段与词库译文一致", async () => {
  const { translateAroundSlot, fillSlot } = await loadHelper();
  const cases: { before: string; after: string; template: string; expected: [string, string] }[] = [
    {
      before: "What should we build in ",
      after: "?",
      template: "What should we build in {project}?",
      expected: ["想在 ", " 中构建什么？"],
    },
    { before: "", after: " to start", template: "{project} to start", expected: ["", "后开始"] },
    { before: "New thread in ", after: "", template: "New thread in {0}", expected: ["在 ", " 新建任务"] },
    {
      before: 'Delete thread "',
      after: '"?',
      template: 'Delete thread "{title}"?',
      expected: ["要删除任务“", "”吗？"],
    },
  ];
  const { calls, restore } = installRuntime("zh-CN");
  try {
    for (const { before, after, template, expected } of cases) {
      const skeleton = before + SLOT + after;
      assert.equal(translate.lookupMessage(skeleton), undefined, `${template} 不能有同名 messages`);
      assert.equal(translate.matchTemplate(skeleton)?.key, template, `${skeleton} 应命中 ${template}`);
      const zh = MAIN_DICT.templates[template];
      assert.ok(zh, `${template} 没有模板词条`);
      assert.deepEqual(expected, zh.split(/\{[A-Za-z0-9]+\}/), `${template} 的译文与预期切分不一致`);
      calls.length = 0;
      assert.deepEqual(translateAroundSlot(before, after), expected);
      assert.deepEqual(calls, [skeleton], "每次只查一次表，且只查固定骨架");
    }
    // 项目名在翻译之后插入：交给 t() 会被宽模板改坏的名字，在这里逐字保留。
    for (const name of USER_NAMES) {
      calls.length = 0;
      assert.equal(fillSlot("What should we build in ", name, "?"), `想在 ${name} 中构建什么？`);
      assert.deepEqual(calls, ["What should we build in " + SLOT + "?"]);
    }
    assert.equal(fillSlot("", "选择项目", " to start"), "选择项目后开始");
    // 没有命中模板时两段原样。
    assert.deepEqual(translateAroundSlot("Nothing matches ", " here"), ["Nothing matches ", " here"]);
  } finally {
    restore();
  }
  // 译文里槽位不是恰好一个时（例如词库被改坏）退回英文两段。
  const g = globalThis as Record<string, any>;
  const previous = g.__t3zh;
  try {
    g.__t3zh = { t: () => `${SLOT}x${SLOT}` };
    assert.deepEqual(translateAroundSlot("What should we build in ", "?"), ["What should we build in ", "?"]);
    g.__t3zh = { t: () => "没有槽位" };
    assert.deepEqual(translateAroundSlot("What should we build in ", "?"), ["What should we build in ", "?"]);
  } finally {
    g.__t3zh = previous;
  }
});

test("固定字面量：输入框提示与大标题的三句都有精确词条", async () => {
  const { translateFixed } = await loadHelper();
  const placeholderSource = fs.readFileSync(path.join(UPSTREAM, "apps/web/src/composerPlaceholder.ts"), "utf8");
  const placeholder = /DISCONNECTED_COMPOSER_PLACEHOLDER =\s*"([^"]+)"/.exec(placeholderSource)?.[1];
  assert.equal(placeholder, "Ask for changes, send follow-ups, or attach images");
  const { calls, restore } = installRuntime("zh-CN");
  try {
    for (const text of [
      placeholder,
      "What should we work on?",
      "Add a project to start",
      "Choose a project",
      "This permanently clears conversation history for this thread.",
    ]) {
      const zh = MAIN_DICT.messages[text];
      assert.ok(zh, `${text} 没有精确词条`);
      assert.equal(translateFixed(text), zh);
    }
    assert.equal(calls.length, 5);
  } finally {
    restore();
  }
});

test("en 模式与没有汉化运行时：全部原样", async () => {
  const helper = await loadHelper();
  const check = () => {
    for (const name of ["New thread", "No project", ...USER_NAMES]) assert.equal(helper.displayDefaultName(name), name);
    assert.deepEqual(helper.translateAroundSlot("What should we build in ", "?"), ["What should we build in ", "?"]);
    assert.deepEqual(helper.translateAroundSlot("", " to start"), ["", " to start"]);
    assert.deepEqual(helper.translateAroundSlot("New thread in ", ""), ["New thread in ", ""]);
    assert.equal(helper.translateFixed("Ask for changes, send follow-ups, or attach images"), "Ask for changes, send follow-ups, or attach images");
  };
  const { restore } = installRuntime("en");
  try {
    check();
  } finally {
    restore();
  }
  const g = globalThis as Record<string, any>;
  const previous = g.__t3zh;
  try {
    g.__t3zh = undefined;
    check();
    g.__t3zh = {};
    check();
  } finally {
    g.__t3zh = previous;
  }
});

/** 从源码里取 `const headingLabel = ...` 的初始化表达式，包成以组件局部变量和 helper 为参数的函数。 */
function headingLabelEvaluator(code: string): (vars: HeadingVars, helper: HelperModule) => string {
  const ast = parse(code, { sourceType: "module", plugins: ["typescript", "jsx"] });
  let source: string | null = null;
  traverse(ast, {
    VariableDeclarator(pathNode) {
      const node = pathNode.node as Node;
      if (node.id?.type === "Identifier" && node.id.name === "headingLabel" && node.init) {
        source = generate(node.init).code;
        pathNode.stop();
      }
    },
  });
  assert.ok(source, "找不到 headingLabel");
  const fn = new Function(
    "isScratchDraft",
    "hasResolvedProject",
    "canChooseProject",
    "activeProjectDisplayName",
    "translateFixed",
    "fillSlot",
    "displayDefaultName",
    `return (${source});`,
  );
  return (vars, helper) =>
    fn(
      vars.isScratchDraft,
      vars.hasResolvedProject,
      vars.canChooseProject,
      vars.activeProjectDisplayName,
      helper.translateFixed,
      helper.fillSlot,
      helper.displayDefaultName,
    );
}

interface HeadingVars {
  isScratchDraft: boolean;
  hasResolvedProject: boolean;
  canChooseProject: boolean;
  activeProjectDisplayName: string | undefined;
}

function headingCombos(): HeadingVars[] {
  const combos: HeadingVars[] = [];
  for (const isScratchDraft of [true, false])
    for (const hasResolvedProject of [true, false])
      for (const canChooseProject of [true, false])
        for (const activeProjectDisplayName of ["t3code", "No project", "New thread on main", undefined])
          combos.push({ isScratchDraft, hasResolvedProject, canChooseProject, activeProjectDisplayName });
  return combos;
}

test("h1 aria-label：en 模式与原版逐个相同，zh 模式是预期译文", async () => {
  const helper = await loadHelper();
  const original = headingLabelEvaluator(read(BEFORE, HEADLINE));
  const patched = headingLabelEvaluator(read(PATCHED, HEADLINE));

  const en = installRuntime("en");
  try {
    for (const vars of headingCombos()) assert.equal(patched(vars, helper), original(vars, helper), JSON.stringify(vars));
  } finally {
    en.restore();
  }

  const zh = installRuntime("zh-CN");
  try {
    const expect = (vars: HeadingVars): string => {
      if (vars.isScratchDraft) return "我们要做什么？";
      if (vars.hasResolvedProject) {
        const name = vars.activeProjectDisplayName === "No project" ? "无项目" : String(vars.activeProjectDisplayName);
        return `想在 ${name} 中构建什么？`;
      }
      if (vars.canChooseProject) {
        const name =
          vars.activeProjectDisplayName === undefined
            ? "选择项目"
            : vars.activeProjectDisplayName === "No project"
              ? "无项目"
              : vars.activeProjectDisplayName;
        return `${name}后开始`;
      }
      return "添加项目后开始";
    };
    for (const vars of headingCombos()) assert.equal(patched(vars, helper), expect(vars), JSON.stringify(vars));
  } finally {
    zh.restore();
  }
});

/** 找到含给定表达式子节点的 JSX 片段 / 元素，返回其子节点概要（文本或表达式源码）。 */
function jsxChildrenContaining(code: string, marker: string): string[][] {
  const ast = parse(code, { sourceType: "module", plugins: ["typescript", "jsx"] });
  const found: string[][] = [];
  traverse(ast, {
    enter(pathNode) {
      const node = pathNode.node as Node;
      if (node.type !== "JSXFragment" && node.type !== "JSXElement") return;
      const children: string[] = [];
      for (const child of node.children as Node[]) {
        if (child.type === "JSXText") {
          if (child.value.trim() !== "") children.push(`text:${child.value.trim()}`);
        } else if (child.type === "JSXExpressionContainer") {
          children.push(`expr:${generate(child.expression).code}`);
        } else {
          children.push(child.type);
        }
      }
      if (children.some((c) => c === `expr:${marker}`)) found.push(children);
    },
  });
  return found;
}

test("混排句改成「前段 + 组件 + 后段」，不再含英文文本节点", () => {
  const headline = read(PATCHED, HEADLINE);
  assert.deepEqual(jsxChildrenContaining(headline, "projectSelector").filter((c) => c.length === 3), [
    ["expr:buildInBefore", "expr:projectSelector", "expr:buildInAfter"],
    ["expr:toStartBefore", "expr:projectSelector", "expr:toStartAfter"],
  ]);
  assert.ok(headline.includes('translateAroundSlot("What should we build in ", "?")'));
  assert.ok(headline.includes('translateAroundSlot("", " to start")'));
  const header = read(PATCHED, HEADER);
  assert.deepEqual(jsxChildrenContaining(header, "newThreadInBefore"), [
    ["expr:newThreadInBefore", "expr:displayDefaultName(activeProjectName)", "expr:newThreadInAfter"],
  ]);
  assert.ok(header.includes('translateAroundSlot("New thread in ", "")'));
  // 重命名输入框的初值是数据，保持原值。
  assert.ok(header.includes("defaultValue={renamingTitle}"));
});

test("默认名与上游源码一致", () => {
  const upstream = (file: string) => fs.readFileSync(path.join(UPSTREAM, file), "utf8");
  assert.ok(upstream("apps/server/src/project/ManagedProjectFolders.ts").includes('title: "No project",'));
  assert.ok(upstream("apps/web/src/components/ChatView.logic.ts").includes('"New thread"'));
  assert.ok(upstream("apps/server/src/orchestration-v2/ThreadTitleRegenerationService.ts").includes('"New thread"'));
  const names = /const DEFAULT_NAMES: readonly string\[\] = \[([^\]]*)\]/.exec(helperCode)?.[1] ?? "";
  assert.deepEqual([...names.matchAll(/"([^"]+)"/g)].map((m) => m[1]), ["New thread", "No project"]);
});

test("转换判定：只有预期的几条跳过项（mixed-jsx 与纯标点）消失；新文件不产生候选、不引入值用途", () => {
  const ctx = createScanContext({ root: UPSTREAM });
  const summary = (code: string, file: string) =>
    scanModule(code, file, ctx)
      .candidates.map((c) => `${c.text}|${c.category}|${c.decision}|${c.reason}`)
      .sort();
  const removedExpected: Record<string, string[]> = {
    // 「?」是混排句里的纯标点文本节点，原先按 no-letters 跳过，句子改成前后两段后一并消失。
    [HEADLINE]: ["What should we build in |A|skip|mixed-jsx", " to start|A|skip|mixed-jsx", "?|A|skip|no-letters"],
    [HEADER]: ["New thread in |A|skip|mixed-jsx"],
  };
  for (const file of PATCHED_FILES) {
    const before = summary(read(BEFORE, file), file);
    const after = summary(read(PATCHED, file), file);
    const added = after.filter((c) => !before.includes(c));
    const removed = before.filter((c) => !after.includes(c));
    assert.deepEqual(added, [], `${file} 不应新增候选`);
    const expected = removedExpected[file] ?? [];
    assert.deepEqual(removed.sort(), [...expected].sort(), `${file} 只应去掉预期的 mixed-jsx 跳过项`);
    for (const c of removed) assert.match(c, /\|skip\|(mixed-jsx|no-letters)$/, `${file} 去掉的只能是跳过项`);
  }
  assert.deepEqual(scanModule(helperCode, HELPER, ctx).candidates, []);

  // 值用途：补丁后各文件与新文件收集到的值用途字面量，不比补丁前多。
  const collect = (root: string, files: readonly string[]) => {
    const map = new Map<string, ValueUseInfo>();
    for (const file of files) collectValueUse(read(root, file), file, file, map);
    return new Set(map.keys());
  };
  const before = collect(BEFORE, PATCHED_FILES);
  const after = collect(PATCHED, [...PATCHED_FILES, HELPER]);
  const added = [...after].filter((text) => !before.has(text));
  assert.deepEqual(added, [], "补丁引入了新的值用途字面量");
  for (const text of ["New thread", "No project", "What should we build in ", " to start", "New thread in "]) {
    const helperOnly = new Map<string, ValueUseInfo>();
    collectValueUse(helperCode, HELPER, HELPER, helperOnly);
    assert.ok(!helperOnly.has(text), `${text} 不应成为值用途字面量`);
  }
});

// ---- 调用点守卫（T09-r1 S1）：helper 单元测试证明不了显示处真的调用了它 ----

/** 会携带默认名的来源表达式。 */
const DEFAULT_NAME_SOURCES = [
  "thread.title",
  "props.projectDisplayName",
  "projectDisplayName",
  "activeThreadTitle",
  "activeProjectName",
  "activeProjectDisplayName",
  "group.displayName",
];
/** 渲染成界面文字的 JSX 属性。 */
const DISPLAY_ATTRIBUTES = ["aria-label", "title", "label", "placeholder", "description", "tooltip"];

interface CallSiteScan {
  /** 各个 displayDefaultName(...) 调用的实参源码。 */
  wrapped: string[];
  /** 直接渲染（JSX 子节点、显示属性、模板字面量内插）却没经过 displayDefaultName 的来源表达式。 */
  raw: string[];
}

function scanCallSites(code: string): CallSiteScan {
  const ast = parse(code, { sourceType: "module", plugins: ["typescript", "jsx"] });
  const wrapped: string[] = [];
  const raw: string[] = [];
  const isSource = (node: Node) => DEFAULT_NAME_SOURCES.includes(generate(node).code);
  traverse(ast, {
    CallExpression(pathNode) {
      const node = pathNode.node as Node;
      if (node.callee.type === "Identifier" && node.callee.name === "displayDefaultName") {
        wrapped.push(generate(node.arguments[0]).code);
      }
    },
    JSXExpressionContainer(pathNode) {
      const node = pathNode.node as Node;
      if (node.expression.type === "JSXEmptyExpression" || !isSource(node.expression)) return;
      const parent = pathNode.parent as Node;
      if (parent.type === "JSXAttribute") {
        const name = parent.name.type === "JSXIdentifier" ? parent.name.name : "";
        if (!DISPLAY_ATTRIBUTES.includes(name)) return; // 传给子组件的原值，由子组件在显示处包
        raw.push(`${name}={${generate(node.expression).code}}`);
      } else {
        raw.push(`{${generate(node.expression).code}}`);
      }
    },
    TemplateLiteral(pathNode) {
      for (const expression of (pathNode.node as Node).expressions) {
        if (isSource(expression)) raw.push(`\${${generate(expression).code}}`);
      }
    },
  });
  return { wrapped: wrapped.sort(), raw };
}

test("调用点：组件与任务菜单 hook 里默认名的每个显示处都经过 displayDefaultName，数据路径保持原值", () => {
  const expectations: Record<string, { wrapped: string[]; allowedRaw: string[] }> = {
    "apps/web/src/components/Sidebar.tsx": {
      wrapped: [
        "projectDisplayName", // 悬停卡片项目名
        "props.projectDisplayName", // 草稿行读屏标签
        "props.projectDisplayName", // 草稿行项目标签
        "props.projectDisplayName", // 任务行读屏标签
        "props.projectDisplayName", // 任务行项目标签
        "props.projectDisplayName", // 搜索结果行读屏标签
        "thread.title", // 悬停卡片标题
        "thread.title", // 任务行读屏标签
        "thread.title", // 任务行标题
        "thread.title", // 任务行 sr-only
        "thread.title", // 搜索结果行读屏标签
        "thread.title", // 搜索结果行标题
        "thread.title", // 归档确认框
        "thread.title", // 删除确认框
      ].sort(),
      allowedRaw: [],
    },
    [HEADER]: {
      wrapped: [
        "activeProjectName", // 面包屑项目名
        "activeProjectName", // New thread in tooltip
        "activeProjectName", // New thread in 按钮 aria-label
        "activeThreadTitle", // 服务端任务：标题
        "activeThreadTitle", // 服务端任务：tooltip
        "activeThreadTitle", // 服务端任务：按钮 aria-label
        "activeThreadTitle", // 草稿：h2 aria-label
        "activeThreadTitle", // 草稿：标题
        "activeThreadTitle", // 草稿：tooltip
      ].sort(),
      allowedRaw: [],
    },
    "apps/web/src/hooks/useThreadActionMenu.ts": {
      wrapped: ["thread.title", "thread.title"], // 归档、删除确认框
      allowedRaw: [],
    },
    [HEADLINE]: {
      wrapped: [
        "activeProjectDisplayName", // 选择器文字
        "activeProjectDisplayName", // 选择器 tooltip
        "activeProjectDisplayName", // aria-label：What should we build in
        "activeProjectDisplayName", // aria-label：to start
        "group.displayName", // 菜单项目名
        "group.displayName", // 菜单项目名 tooltip
      ].sort(),
      allowedRaw: [],
    },
  };
  for (const [file, expected] of Object.entries(expectations)) {
    const { wrapped, raw } = scanCallSites(read(PATCHED, file));
    assert.deepEqual(wrapped, expected.wrapped, `${file} 的 displayDefaultName 调用点`);
    assert.deepEqual(raw, expected.allowedRaw, `${file} 还有直接渲染的默认名来源`);
    // 反证：补丁前同样的扫描能找到这些裸值（守卫不是空转）。
    assert.ok(scanCallSites(read(BEFORE, file)).raw.length > 0, `${file} 补丁前应有裸值`);
  }
  // useThreadActions 的删除确认框：槽位里是局部变量 title（= 任务标题 ?? "this thread"）。
  const actions = read(PATCHED, "apps/web/src/hooks/useThreadActions.ts");
  assert.deepEqual(scanCallSites(actions).wrapped, ["title"]);
  assert.ok(actions.includes(`fillSlot('Delete thread "', displayDefaultName(title), '"?')`));
  assert.ok(read(BEFORE, "apps/web/src/hooks/useThreadActions.ts").includes('`Delete thread "${title}"?`'));
  // 数据路径：重命名、提交改名、拖放等仍用原值。
  const sidebar = read(PATCHED, "apps/web/src/components/Sidebar.tsx");
  assert.ok(sidebar.includes("onStartRename(threadRef, thread.title)"));
  assert.ok(sidebar.includes("onCommitRename(threadRef, renamingTitle, thread.title)"));
  const header = read(PATCHED, HEADER);
  assert.ok(header.includes("title: activeThreadTitle,"), "开始改名时存的是原标题");
  assert.ok(header.includes("originalTitle: activeThreadTitle"), "改名比较用原标题");
});

test("调用点求值：侧栏任务行的项目标签与标题在 zh 下显示译文，名单外原样，en 下原样", async () => {
  const helper = await loadHelper();
  const code = read(PATCHED, "apps/web/src/components/Sidebar.tsx");
  const ast = parse(code, { sourceType: "module", plugins: ["typescript", "jsx"] });
  const renders: string[] = [];
  traverse(ast, {
    JSXExpressionContainer(pathNode) {
      const node = pathNode.node as Node;
      if (pathNode.parent.type === "JSXAttribute") return;
      const source = node.expression.type === "JSXEmptyExpression" ? "" : generate(node.expression).code;
      if (/^displayDefaultName\((props\.projectDisplayName|thread\.title)\)$/.test(source)) renders.push(source);
    },
  });
  assert.ok(renders.includes("displayDefaultName(props.projectDisplayName)"));
  assert.ok(renders.includes("displayDefaultName(thread.title)"));
  const evaluate = (source: string, value: string) =>
    new Function("displayDefaultName", "props", "thread", `return (${source});`)(
      helper.displayDefaultName,
      { projectDisplayName: value },
      { title: value },
    );
  const zh = installRuntime("zh-CN");
  try {
    for (const source of renders) {
      assert.equal(evaluate(source, "No project"), "无项目");
      assert.equal(evaluate(source, "New thread"), "新建任务");
      assert.equal(evaluate(source, "t3code"), "t3code");
    }
  } finally {
    zh.restore();
  }
  const en = installRuntime("en");
  try {
    for (const source of renders) assert.equal(evaluate(source, "No project"), "No project");
  } finally {
    en.restore();
  }
});

// ---- 删除确认框整句（T09-r2 I1）：文案是数组 .join("\n")，插件不包，必须由补丁整句翻译 ----

const CONFIRM_FILES: { file: string; titleVar: "thread" | "title" }[] = [
  { file: "apps/web/src/components/Sidebar.tsx", titleVar: "thread" },
  { file: "apps/web/src/hooks/useThreadActionMenu.ts", titleVar: "thread" },
  { file: "apps/web/src/hooks/useThreadActions.ts", titleVar: "title" },
];

/** 找出 `*.dialogs.confirm([...].join("\n"), …)` 的数组表达式源码与行号范围。 */
function deleteConfirmArrays(code: string): { source: string; start: number; end: number }[] {
  const ast = parse(code, { sourceType: "module", plugins: ["typescript", "jsx"] });
  const found: { source: string; start: number; end: number }[] = [];
  traverse(ast, {
    CallExpression(pathNode) {
      const node = pathNode.node as Node;
      const callee = generate(node.callee).code;
      if (!/\.dialogs\.confirm$/.test(callee)) return;
      const arg = node.arguments[0];
      if (arg?.type !== "CallExpression" || generate(arg.callee).code.endsWith(".join") === false) return;
      const array = arg.callee.object;
      if (array?.type !== "ArrayExpression") return;
      const source = generate(array).code;
      if (!source.includes("Delete thread")) return;
      found.push({ source, start: array.loc.start.line, end: array.loc.end.line });
    },
  });
  return found;
}

function evaluateConfirm(source: string, helper: HelperModule, titleVar: "thread" | "title", title: string): string {
  const value = titleVar === "thread" ? { title } : title;
  return (
    new Function("fillSlot", "displayDefaultName", "translateFixed", titleVar, `return (${source}).join("\\n");`)(
      helper.fillSlot,
      helper.displayDefaultName,
      helper.translateFixed,
      value,
    ) as string
  );
}

test("删除确认框：插件不在这段数组里产生候选；zh 整句中文、任务名翻译后插入；en 与原版逐字相同", async () => {
  const helper = await loadHelper();
  const ctx = createScanContext({ root: UPSTREAM });
  const titles = ["New thread", "No project", "Fix login bug", "a to b", "New thread on main"];
  const zhTitle = (title: string) => (title === "New thread" ? "新建任务" : title === "No project" ? "无项目" : title);
  for (const { file, titleVar } of CONFIRM_FILES) {
    const patchedCode = read(PATCHED, file);
    const after = deleteConfirmArrays(patchedCode);
    const before = deleteConfirmArrays(read(BEFORE, file));
    assert.equal(after.length, 1, `${file} 应有一处删除确认框`);
    assert.equal(before.length, 1);
    assert.ok(after[0].source.includes("fillSlot(") && after[0].source.includes("translateFixed("), `${file} 删除问句应整句翻译`);
    // 插件不会再包这段（不会二次翻译），也就是说运行时看到的就是这段源码的求值结果。
    const inside = scanModule(patchedCode, file, ctx).candidates.filter(
      (c: Node) => c.decision === "translate" && c.line >= after[0].start && c.line <= after[0].end,
    );
    assert.deepEqual(inside, [], `${file} 删除确认框数组里不应有插件候选`);

    const zh = installRuntime("zh-CN");
    try {
      for (const title of titles) {
        assert.equal(
          evaluateConfirm(after[0].source, helper, titleVar, title),
          `要删除任务“${zhTitle(title)}”吗？\n这会永久清除此任务的对话记录。`,
          `${file} zh ${title}`,
        );
      }
      zh.calls.length = 0;
      evaluateConfirm(after[0].source, helper, titleVar, "Fix login bug");
      assert.deepEqual(zh.calls, ['Delete thread "\uE000"?', "This permanently clears conversation history for this thread."], "任务名不进 t()");
    } finally {
      zh.restore();
    }
    const en = installRuntime("en");
    try {
      for (const title of titles) {
        assert.equal(
          evaluateConfirm(after[0].source, helper, titleVar, title),
          evaluateConfirm(before[0].source, helper, titleVar, title),
          `${file} en ${title}`,
        );
      }
    } finally {
      en.restore();
    }
  }
});
