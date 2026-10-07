/**
 * patches/0008（2702 新增的七处「英文句子中间嵌运行时值」的显示文字）测试，T10-fix1。
 * 运行：node --test "plugin/__tests__/*.test.ts"（或 npm run test:plugin）
 *
 * - 0007 新增的 apps/web/src/newThreadDisplayStrings.ts 与 0008 打到 upstream/ 四个文件的副本上。
 * - 显示处求值：从补丁前后源码各取出那个 JSX 元素的子节点（按 JSX 空白规则整理），代入同一组值求出界面文字。
 *   没有汉化运行时与 en 模式：补丁后与补丁前逐字相同；zh 模式：整句中文、值逐字保留、t() 只收到固定骨架。
 * - 骨架命中的是专用模板 / 精确词条；新模板不截走源码里任何 translate 候选。
 * - 补丁对转换判定的影响只有这几处 mixed-jsx 跳过项消失；不新增候选、不引入值用途。
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
import * as t from "@babel/types";

import { collectValueUse, createScanContext, listScopeFiles, scanModule, type ValueUseInfo } from "../matcher.ts";
import { createTranslator, installT3zhRuntime, type T3zhDict } from "../../runtime/t3zh-runtime.ts";

const traverse = ((babelTraverse as any).default ?? babelTraverse) as typeof import("@babel/traverse").default;
const generate = ((babelGenerator as any).default ?? babelGenerator) as typeof import("@babel/generator").default;

const ZH_ROOT = path.resolve(import.meta.dirname, "../..");
// 默认 upstream/（当前基线）；升级时可用 T3ZH_UPSTREAM 指向新 tag 的源码（scripts/upgrade-check.sh）。
const UPSTREAM = process.env.T3ZH_UPSTREAM ? path.resolve(process.env.T3ZH_UPSTREAM) : path.join(ZH_ROOT, "upstream");
const PATCHES = path.join(ZH_ROOT, "patches");
const PATCH = path.join(PATCHES, "0008-inline-value-display-strings.patch");
const HELPER_PATCH = path.join(PATCHES, "0007-new-thread-display-strings.patch");
const MAIN_DICT: T3zhDict = JSON.parse(fs.readFileSync(path.join(ZH_ROOT, "dict/zh-CN.json"), "utf8"));
const HELPER = "apps/web/src/newThreadDisplayStrings.ts";
const SCHEDULED = "apps/web/src/components/settings/ScheduledTasksSettings.tsx";
const INSPECTOR = "apps/web/src/components/chat/V2ItemInspector.tsx";
const HTML_FRAME = "apps/web/src/components/chat/HtmlRenderFrame.tsx";
const ATTACHMENT = "apps/web/src/components/files/AttachmentFilePreview.tsx";
const PATCHED_FILES = [SCHEDULED, INSPECTOR, HTML_FRAME, ATTACHMENT];
const SLOT = "";

type Node = any;

function copyUpstream(files: readonly string[]): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "t3zh-0008-"));
  for (const file of files) {
    fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
    fs.copyFileSync(path.join(UPSTREAM, file), path.join(dir, file));
  }
  return dir;
}

const BEFORE = copyUpstream(PATCHED_FILES);
const PATCHED = copyUpstream(PATCHED_FILES);
execFileSync("git", ["apply", `--include=${HELPER}`, HELPER_PATCH], { cwd: PATCHED });
execFileSync("git", ["apply", PATCH], { cwd: PATCHED });

const read = (root: string, file: string) => fs.readFileSync(path.join(root, file), "utf8");

interface HelperModule {
  fillSlot(before: string, value: string, after: string): string;
  translateFixed(value: string): string;
}

async function loadHelper(): Promise<HelperModule> {
  return import(pathToFileURL(path.join(PATCHED, HELPER)).href);
}

/** 用真实主词库给 globalThis.__t3zh 装运行时，t 外面包一层记录调用；返回调用记录与恢复函数。 */
function installRuntime(locale: "zh-CN" | "en" | null): { calls: string[]; restore: () => void } {
  const g = globalThis as Record<string, any>;
  const previous = g.__t3zh;
  const calls: string[] = [];
  if (locale === null) {
    g.__t3zh = undefined;
  } else {
    const installed = installT3zhRuntime(MAIN_DICT, {
      localStorage: { getItem: () => locale, setItem: () => {} },
      navigator: null,
      systemLanguages: null,
      document: null,
      location: null,
      target: null,
    });
    assert.equal(installed.locale, locale);
    g.__t3zh = {
      ...installed.api,
      t: (value: string) => {
        calls.push(value);
        return installed.api.t(value);
      },
    };
  }
  return {
    calls,
    restore: () => {
      g.__t3zh = previous;
    },
  };
}

const translate = createTranslator(MAIN_DICT);

// ---- 显示处：补丁前后各取一个 JSX 元素的子节点 ----

/** 文件里所有 JSX 元素的子节点（JSX 文本按 React 的空白规则整理成 StringLiteral，表达式容器取出表达式）。 */
function elementChildren(code: string): Node[][] {
  const ast = parse(code, { sourceType: "module", plugins: ["typescript", "jsx"] });
  const result: Node[][] = [];
  traverse(ast, {
    JSXElement(pathNode) {
      result.push(t.react.buildChildren(pathNode.node as Node) as Node[]);
    },
  });
  return result;
}

function findOne(list: Node[][], predicate: (children: Node[]) => boolean, label: string): Node[] {
  const found = list.filter(predicate);
  assert.equal(found.length, 1, `${label}：应恰好找到 1 个元素，实际 ${found.length}`);
  return found[0];
}

/** 补丁前：子节点里有一段与 text 完全相同的 JSX 文字。 */
function beforeElement(file: string, text: string): Node[] {
  return findOne(
    elementChildren(read(BEFORE, file)),
    (children) => children.some((c) => t.isStringLiteral(c) && c.value === text),
    `${file} 补丁前「${text}」`,
  );
}

/** fillSlot / translateFixed 调用，或两支都是这种调用的条件表达式。 */
function isDisplayCall(node: Node): boolean {
  if (t.isConditionalExpression(node)) return isDisplayCall(node.consequent) && isDisplayCall(node.alternate);
  return t.isCallExpression(node) && t.isIdentifier(node.callee) && ["fillSlot", "translateFixed"].includes(node.callee.name);
}

/** 补丁后：唯一的子节点是显示调用，源码里含 call。 */
function afterElement(file: string, call: string): Node[] {
  return findOne(
    elementChildren(read(PATCHED, file)),
    (children) => children.length === 1 && isDisplayCall(children[0]) && generate(children[0]).code.includes(call),
    `${file} 补丁后「${call}」`,
  );
}

/** 按 React 的渲染规则把子节点求成文字：字符串原样，数字转字符串，null / undefined / 布尔不显示。 */
function render(children: Node[], scope: Record<string, unknown>, helper: HelperModule): string {
  return children
    .map((c) => {
      if (t.isStringLiteral(c)) return c.value;
      assert.ok(!t.isJSXElement(c) && !t.isJSXFragment(c), "这些显示处不应含子元素");
      const names = [...Object.keys(scope), "fillSlot", "translateFixed"];
      const values = [...Object.values(scope), helper.fillSlot, helper.translateFixed];
      const value = new Function(...names, `return (${generate(c).code});`)(...values);
      return value === null || value === undefined || typeof value === "boolean" ? "" : String(value);
    })
    .join("");
}

interface Sample {
  scope: Record<string, unknown>;
  en: string;
  zh: string;
  /** zh 模式下 t() 收到的全部参数。 */
  calls: string[];
}

interface DisplayCase {
  name: string;
  file: string;
  /** 补丁前元素里的一段 JSX 文字（定位用）。 */
  beforeText: string;
  /** 补丁后元素里调用的源码片段（定位用）。 */
  afterCall: string;
  samples: Sample[];
}

// 交给 t() 会被宽模板改坏的值（`{head} to {base}` 等），显示处必须逐字保留。
const RISKY = "feature/foo to main";
const SIZE = (2345678).toLocaleString();

const CASES: DisplayCase[] = [
  {
    name: "投递记录弹窗标题",
    file: SCHEDULED,
    beforeText: "Deliveries · ",
    afterCall: 'fillSlot("Deliveries · "',
    samples: [
      {
        scope: { task: { title: "Daily publish" } },
        en: "Deliveries · Daily publish",
        zh: "投递记录 · Daily publish",
        calls: [`Deliveries · ${SLOT}`],
      },
      {
        scope: { task: { title: RISKY } },
        en: `Deliveries · ${RISKY}`,
        zh: `投递记录 · ${RISKY}`,
        calls: [`Deliveries · ${SLOT}`],
      },
    ],
  },
  {
    name: "投递详情的缺失字段",
    file: SCHEDULED,
    beforeText: "Empty placeholders: ",
    afterCall: 'fillSlot("Empty placeholders: "',
    samples: [
      {
        scope: { selected: { missingFields: ["body.path", "query.id"] } },
        en: "Empty placeholders: body.path, query.id",
        zh: "为空的占位符：body.path, query.id",
        calls: [`Empty placeholders: ${SLOT}`],
      },
    ],
  },
  {
    name: "投递列表的缺失字段数量（单 / 复数）",
    file: SCHEDULED,
    beforeText: " empty placeholder",
    afterCall: '" empty placeholder"',
    samples: [
      {
        scope: { delivery: { missingFields: ["body.path"] } },
        en: "1 empty placeholder",
        zh: "1 个占位符为空",
        calls: [`${SLOT} empty placeholder`],
      },
      {
        scope: { delivery: { missingFields: ["body.path", "query.id"] } },
        en: "2 empty placeholders",
        zh: "2 个占位符为空",
        calls: [`${SLOT} empty placeholders`],
      },
      {
        scope: { delivery: { missingFields: Array.from({ length: 12 }, (_, i) => `f${i}`) } },
        en: "12 empty placeholders",
        zh: "12 个占位符为空",
        calls: [`${SLOT} empty placeholders`],
      },
    ],
  },
  {
    name: "工具输出读取失败",
    file: INSPECTOR,
    beforeText: "Couldn't load output: ",
    afterCall: `fillSlot("Couldn't load output: "`,
    samples: [
      {
        scope: { props: { error: "ENOENT: no such file or directory" } },
        en: "Couldn't load output: ENOENT: no such file or directory",
        zh: "无法加载输出：ENOENT: no such file or directory",
        calls: [`Couldn't load output: ${SLOT}`],
      },
      {
        scope: { props: { error: RISKY } },
        en: `Couldn't load output: ${RISKY}`,
        zh: `无法加载输出：${RISKY}`,
        calls: [`Couldn't load output: ${SLOT}`],
      },
    ],
  },
  {
    name: "非零退出码",
    file: INSPECTOR,
    beforeText: "exit ",
    afterCall: 'fillSlot("exit "',
    samples: [
      { scope: { props: { exitCode: 1 } }, en: "exit 1", zh: "退出码 1", calls: [`exit ${SLOT}`] },
      { scope: { props: { exitCode: 127 } }, en: "exit 127", zh: "退出码 127", calls: [`exit ${SLOT}`] },
      { scope: { props: { exitCode: -1 } }, en: "exit -1", zh: "退出码 -1", calls: [`exit ${SLOT}`] },
    ],
  },
  {
    name: "HTML 预览加载失败",
    file: HTML_FRAME,
    beforeText: "Unable to load ",
    afterCall: 'fillSlot("Unable to load "',
    samples: [
      {
        scope: { title: "Sales report" },
        en: "Unable to load Sales report",
        zh: "无法加载 Sales report",
        calls: [`Unable to load ${SLOT}`],
      },
      { scope: { title: RISKY }, en: `Unable to load ${RISKY}`, zh: `无法加载 ${RISKY}`, calls: [`Unable to load ${SLOT}`] },
    ],
  },
  {
    name: "附件文本截断提示",
    file: ATTACHMENT,
    beforeText: "Preview limited to the first 1 MB",
    afterCall: '"Preview limited to the first 1 MB of a "',
    samples: [
      {
        scope: { props: { sizeBytes: 2345678 } },
        en: `Preview limited to the first 1 MB of a ${SIZE} byte file. Save the file to read it in full.`,
        zh: `预览仅显示前 1 MB（文件共 ${SIZE} 字节）。保存文件后可查看完整内容。`,
        calls: [`Preview limited to the first 1 MB of a ${SLOT} byte file. Save the file to read it in full.`],
      },
      {
        scope: { props: { sizeBytes: 0 } },
        en: "Preview limited to the first 1 MB. Save the file to read it in full.",
        zh: "预览仅显示前 1 MB。保存文件后可查看完整内容。",
        calls: ["Preview limited to the first 1 MB. Save the file to read it in full."],
      },
    ],
  },
];

test("显示处求值：没有运行时与 en 模式下和补丁前逐字相同；zh 整句中文、值原样、t() 只收到固定骨架", async () => {
  const helper = await loadHelper();
  for (const c of CASES) {
    const before = beforeElement(c.file, c.beforeText);
    const after = afterElement(c.file, c.afterCall);
    for (const sample of c.samples) {
      const label = `${c.name} ${JSON.stringify(sample.scope)}`;
      assert.equal(render(before, sample.scope, helper), sample.en, `${label}：补丁前的原版文字`);
      for (const locale of [null, "en"] as const) {
        const { restore } = installRuntime(locale);
        try {
          assert.equal(render(after, sample.scope, helper), sample.en, `${label}：${locale ?? "无运行时"} 应与原版相同`);
        } finally {
          restore();
        }
      }
      const { calls, restore } = installRuntime("zh-CN");
      try {
        assert.equal(render(after, sample.scope, helper), sample.zh, `${label}：zh 译文`);
        assert.deepEqual(calls, sample.calls, `${label}：t() 只收到固定骨架，每次显示查表 1 次`);
      } finally {
        restore();
      }
    }
  }
});

/** 0008 用到的词条：骨架 → 应命中的模板（null 表示 messages 精确词条）。 */
const ENTRIES: { skeleton: string; template: string | null }[] = [
  { skeleton: `Deliveries · ${SLOT}`, template: "Deliveries · {0}" },
  { skeleton: `Empty placeholders: ${SLOT}`, template: "Empty placeholders: {0}" },
  { skeleton: `${SLOT} empty placeholder`, template: "{0} empty placeholder" },
  { skeleton: `${SLOT} empty placeholders`, template: "{0} empty placeholders" },
  { skeleton: `Couldn't load output: ${SLOT}`, template: "Couldn't load output: {0}" },
  { skeleton: `exit ${SLOT}`, template: "exit {0}" },
  { skeleton: `Unable to load ${SLOT}`, template: "Unable to load {0}" },
  {
    skeleton: `Preview limited to the first 1 MB of a ${SLOT} byte file. Save the file to read it in full.`,
    template: "Preview limited to the first 1 MB of a {0} byte file. Save the file to read it in full.",
  },
  { skeleton: "Preview limited to the first 1 MB. Save the file to read it in full.", template: null },
];
const NEW_TEMPLATES = new Set(ENTRIES.flatMap((e) => (e.template ? [e.template] : [])));

test("骨架命中 0008 的专用模板 / 精确词条，译文里槽位恰好一个", () => {
  for (const { skeleton, template } of ENTRIES) {
    if (template === null) {
      assert.ok(translate.lookupMessage(skeleton), `${skeleton} 应有精确 messages 词条`);
      continue;
    }
    assert.equal(translate.lookupMessage(skeleton), undefined, `${template} 不能有同名 messages`);
    assert.equal(translate.matchTemplate(skeleton)?.key, template, `${JSON.stringify(skeleton)} 应命中 ${template}`);
    const zh = MAIN_DICT.templates[template];
    assert.ok(zh, `${template} 没有模板词条`);
    assert.equal(zh.match(/\{0\}/g)?.length, 1, `${template} 的译文应恰好有一个 {0}`);
  }
});

test("新模板不截走源码里任何 translate 候选", () => {
  const ctx = createScanContext({ root: UPSTREAM });
  const hits: string[] = [];
  let total = 0;
  for (const file of listScopeFiles(UPSTREAM)) {
    for (const c of scanModule(fs.readFileSync(file, "utf8"), file, ctx).candidates) {
      if (c.decision !== "translate") continue;
      total += 1;
      if (translate.lookupMessage(c.text) !== undefined) continue;
      const key = translate.matchTemplate(c.text)?.key;
      if (key && NEW_TEMPLATES.has(key)) hits.push(`${path.relative(UPSTREAM, file)}:${c.line} ${JSON.stringify(c.text)} → ${key}`);
    }
  }
  assert.ok(total > 5000, `translate 候选数异常：${total}`);
  assert.deepEqual(hits, []);
});

test("转换判定：只有这七处的 mixed-jsx 跳过项消失；不新增候选、不引入值用途", () => {
  const ctx = createScanContext({ root: UPSTREAM });
  const summary = (code: string, file: string) =>
    scanModule(code, file, ctx)
      .candidates.map((c) => `${c.text}|${c.category}|${c.decision}|${c.reason}`)
      .sort();
  const removedExpected: Record<string, string[]> = {
    // 复数后缀 `{n === 1 ? "" : "s"}` 的两个字面量原先也按混排跳过（"" 记 no-letters），改成两条整句骨架后一并消失。
    [SCHEDULED]: [
      "Deliveries · |A|skip|mixed-jsx",
      "Empty placeholders: |A|skip|mixed-jsx",
      " empty placeholder|A|skip|mixed-jsx",
      "s|A|skip|mixed-jsx",
      "|A|skip|no-letters",
    ],
    [INSPECTOR]: ["Couldn't load output: |A|skip|mixed-jsx", "exit |A|skip|mixed-jsx"],
    [HTML_FRAME]: ["Unable to load |A|skip|mixed-jsx"],
    // 原条件表达式里的模板字面量与空串（no-letters）同属这句混排，一并消失。
    [ATTACHMENT]: [
      "Preview limited to the first 1 MB|A|skip|mixed-jsx",
      " of a {0} byte file|A|skip|mixed-jsx",
      ". Save the file to read it in full.|A|skip|mixed-jsx",
      "|A|skip|no-letters",
    ],
  };
  for (const file of PATCHED_FILES) {
    const before = summary(read(BEFORE, file), file);
    const after = summary(read(PATCHED, file), file);
    const added = after.filter((c) => !before.includes(c));
    const removed = before.filter((c) => !after.includes(c));
    assert.deepEqual(added, [], `${file} 不应新增候选`);
    assert.deepEqual(removed.sort(), [...removedExpected[file]].sort(), `${file} 只应去掉预期的 mixed-jsx 跳过项`);
  }

  const collect = (root: string) => {
    const map = new Map<string, ValueUseInfo>();
    for (const file of PATCHED_FILES) collectValueUse(read(root, file), file, file, map);
    return new Set(map.keys());
  };
  const before = collect(BEFORE);
  const added = [...collect(PATCHED)].filter((text) => !before.has(text));
  assert.deepEqual(added, [], "补丁引入了新的值用途字面量");
});

test("调用点：四个文件里 fillSlot / translateFixed 的调用正好是这几处，补丁前没有", () => {
  const callSites = (root: string, file: string) => {
    const ast = parse(read(root, file), { sourceType: "module", plugins: ["typescript", "jsx"] });
    const sites: string[] = [];
    traverse(ast, {
      CallExpression(pathNode) {
        const node = pathNode.node as Node;
        if (node.callee.type !== "Identifier" || !["fillSlot", "translateFixed"].includes(node.callee.name)) return;
        sites.push(`${node.callee.name}(${node.arguments.map((a: Node) => (t.isStringLiteral(a) ? JSON.stringify(a.value) : "…")).join(", ")})`);
      },
    });
    return sites.sort();
  };
  const expected: Record<string, string[]> = {
    [SCHEDULED]: ['fillSlot("", …, …)', 'fillSlot("Deliveries · ", …, "")', 'fillSlot("Empty placeholders: ", …, "")'],
    [INSPECTOR]: [`fillSlot("Couldn't load output: ", …, "")`, 'fillSlot("exit ", …, "")'],
    [HTML_FRAME]: ['fillSlot("Unable to load ", …, "")'],
    [ATTACHMENT]: [
      'fillSlot("Preview limited to the first 1 MB of a ", …, " byte file. Save the file to read it in full.")',
      'translateFixed("Preview limited to the first 1 MB. Save the file to read it in full.")',
    ],
  };
  for (const file of PATCHED_FILES) {
    assert.deepEqual(callSites(BEFORE, file), [], `${file} 补丁前不应有调用`);
    assert.deepEqual(callSites(PATCHED, file), [...expected[file]].sort(), `${file} 的调用点`);
  }
});
