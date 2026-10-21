/** v0.1.0：真实补丁、转换插件、运行时与原版 JSX 表达式的显示回归。 */
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { stripTypeScriptTypes } from "node:module";
import { pathToFileURL } from "node:url";
import { parse } from "@babel/parser";
import traverseImport from "@babel/traverse";
import generateImport from "@babel/generator";
import * as t from "@babel/types";
import { createTranslator, installT3zhRuntime } from "../../runtime/t3zh-runtime.ts";
import { createScanContext } from "../matcher.ts";
import { transformCode } from "../vite-plugin-t3zh.ts";

const traverse = (traverseImport as any).default ?? traverseImport;
const generate = (generateImport as any).default ?? generateImport;
const ROOT = path.resolve(import.meta.dirname, "../..");
const UPSTREAM = path.resolve(process.env.T3ZH_UPSTREAM ?? path.join(ROOT, "upstream"));
const BASE = "apps/web/src/";
const PATCH = path.join(ROOT, "patches/0022-stable-display-strings.patch");
const FILE = {
  workflow: BASE + "components/chat/ThreadLineageWorkflowRow.tsx",
  landing: BASE + "components/promptLinks/HostedPromptLinkLanding.tsx",
  link: BASE + "components/promptLinks/NewThreadLinkView.tsx",
  prompt: BASE + "components/promptLinks/linkedPrompt.ts",
  stack: BASE + "components/pullRequest/PullRequestStackMenu.tsx",
  excerpt: BASE + "components/pullRequest/guide/GuideExcerpt.tsx",
  rail: BASE + "components/pullRequest/guide/GuideRail.tsx",
  stop: BASE + "components/pullRequest/guide/GuideStop.tsx",
  tour: BASE + "components/pullRequest/guide/GuideTour.tsx",
  telemetry: BASE + "components/settings/TelemetryExportSettings.tsx",
  update: BASE + "components/sidebar/UpdateEverythingDialog.tsx",
  updateLogic: BASE + "components/sidebar/updateEverything.logic.ts",
  capsule: BASE + "components/sidebar/SidebarUpdateCapsule.tsx",
};

function patchedTree(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "t3zh-stable-display-"));
  // 自动跟随 0022 的文件增量；前序补丁只应用这些文件和实际依赖的公共 helper。
  const changed = execFileSync("git", ["apply", "--numstat", PATCH], { encoding: "utf8" })
    .trim().split("\n").map((line) => line.split("\t")[2]!);
  const files = [...new Set([...changed, BASE + "newThreadDisplayStrings.ts"])];
  for (const file of files) {
    const source = path.join(UPSTREAM, file);
    if (!fs.existsSync(source)) continue;
    const target = path.join(dir, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target);
  }
  for (const patch of fs.readdirSync(path.join(ROOT, "patches")).filter((name) => name.endsWith(".patch")).sort()) {
    execFileSync("git", ["apply", ...files.map((file) => `--include=${file}`), path.join(ROOT, "patches", patch)], { cwd: dir });
  }
  return dir;
}

const DIR = patchedTree();
after(() => fs.rmSync(DIR, { recursive: true, force: true }));
const stablePath = path.join(DIR, BASE, "stableDisplayStrings.ts");
fs.writeFileSync(stablePath, fs.readFileSync(stablePath, "utf8").replace('from "./newThreadDisplayStrings"', 'from "./newThreadDisplayStrings.ts"'));
const helper = await import(pathToFileURL(path.join(DIR, BASE, "newThreadDisplayStrings.ts")).href);
const stable = await import(pathToFileURL(stablePath).href);
const dict = JSON.parse(fs.readFileSync(path.join(ROOT, "dict/zh-CN.json"), "utf8"));
const translator = createTranslator(dict);
const context = createScanContext({ root: UPSTREAM });
const original = (file: string) => fs.readFileSync(path.join(UPSTREAM, file), "utf8");
const patched = (file: string) => fs.readFileSync(path.join(DIR, file), "utf8");
const converted = new Map<string, string>();
function final(file: string): string {
  if (!converted.has(file)) {
    const source = patched(file);
    converted.set(file, transformCode(source, path.join(UPSTREAM, file), context).output?.code ?? source);
  }
  return converted.get(file)!;
}
const ast = (source: string) => parse(source, { sourceType: "module", plugins: ["typescript", "jsx"] });
const code = (node: any): string => generate(node).code;
function selectAll(source: string, predicate: (node: any) => boolean): any[] {
  const found: any[] = [];
  traverse(ast(source), { enter(p: any) { if (predicate(p.node)) found.push(p.node); } });
  return found;
}
function select(source: string, predicate: (node: any) => boolean): any {
  const found = selectAll(source, predicate);
  assert.equal(found.length, 1, `表达式应唯一，实际 ${found.length} 个`);
  return found[0];
}
const declaration = (source: string, name: string) => select(source, (node) => t.isVariableDeclarator(node) && t.isIdentifier(node.id, { name })).init;
const fn = (source: string, name: string) => select(source, (node) => t.isFunctionDeclaration(node) && node.id?.name === name);

/** 仅把 JSX 节点变成不渲染的 React 元素形状；显示表达式与 helper 函数不重写。 */
function lowerElement(node: any): any {
  const properties = node.openingElement.attributes.map((attribute: any) => {
    if (t.isJSXSpreadAttribute(attribute)) return t.spreadElement(attribute.argument);
    const value = attribute.value === null ? t.booleanLiteral(true)
      : t.isJSXExpressionContainer(attribute.value) ? attribute.value.expression : attribute.value;
    return t.objectProperty(t.stringLiteral(attribute.name.name), value);
  });
  return t.callExpression(t.identifier("jsxElement"), [
    t.stringLiteral(code(node.openingElement.name)),
    t.objectExpression(properties),
    t.arrayExpression(t.react.buildChildren(node).map((child) => t.isJSXElement(child) ? lowerElement(child) : child)),
  ]);
}
function evaluate(node: any, scope: Record<string, any> = {}): any {
  const tree = ast(`(${code(node)})`);
  traverse(tree, { JSXElement(p: any) { p.replaceWith(lowerElement(p.node)); } });
  const variables = {
    ...helper, ...stable,
    jsxElement: (type: string, props: any, children: any[]) => ({ type, props: { ...props, children } }),
    ...scope,
  };
  return new Function(...Object.keys(variables), "return " + stripTypeScriptTypes(`(${code((tree.program.body[0] as any).expression)})`))(...Object.values(variables));
}
function text(value: any): string {
  if (value === null || value === undefined || typeof value === "boolean") return "";
  if (Array.isArray(value)) return value.map(text).join("");
  if (typeof value === "object") return text(value.props.children);
  return String(value);
}
function childGroups(source: string, needle: string): any[][] {
  return selectAll(source, (node) => t.isJSXElement(node) && t.react.buildChildren(node).some(
    (child) => {
      // 排除祖先里的条件 JSX / map 回调，只取直接显示这一句的元素。
      let containsElement = false;
      t.traverseFast(child, (nested) => {
        if (t.isJSXElement(nested) || t.isJSXFragment(nested)) containsElement = true;
      });
      const objectSlots = t.isCallExpression(child) && t.isIdentifier(child.callee, { name: "displayParts" });
      return (!containsElement || objectSlots) && code(child).includes(needle);
    },
  )).map((node) => t.react.buildChildren(node));
}
function children(source: string, needle: string): any[] {
  const groups = childGroups(source, needle);
  assert.equal(groups.length, 1, `JSX ${needle} 应唯一，实际 ${groups.length} 个`);
  return groups[0]!;
}
const render = (nodes: any[], scope: Record<string, any>) => text(nodes.map((node) => evaluate(node, scope)));
const risk = "feature/foo to main $& \uE000 用户输入";
const locales = [null, "en", "zh-CN"] as const;
type Locale = (typeof locales)[number];

function runtime(locale: Locale) {
  const global = globalThis as any;
  const previous = global.__t3zh;
  const calls: string[] = [];
  const pluginCalls: unknown[] = [];
  const api = locale === null ? null : installT3zhRuntime(dict, {
    localStorage: { getItem: () => locale, setItem() {} }, navigator: null,
    systemLanguages: null, document: null, location: null, target: null,
  }).api;
  global.__t3zh = api ? { ...api, t(value: string) { calls.push(value); return api.t(value); } } : undefined;
  return {
    calls,
    pluginCalls,
    scope: { __t3zh_t: (value: unknown) => {
      if (!api) return value;
      pluginCalls.push(value);
      return api.t(value);
    } },
    restore() { global.__t3zh = previous; },
  };
}
function assertSafeCalls(calls: string[], dynamic: string[] = [risk]): void {
  for (const call of calls) {
    for (const value of dynamic) assert.ok(!call.includes(value), `动态内容不应传给 t：${call}`);
    if (Object.hasOwn(dict.messages, call)) continue;
    const hit = translator.matchTemplate(call);
    assert.ok(hit, `固定槽位骨架必须命中词库：${call}`);
    const shape = (value: string) => value.replace(/\{(?:\d+|[A-Za-z]\w*)\}|[\uE000-\uE00F]/g, "{slot}");
    assert.equal(shape(hit.key), shape(call), `不应误配宽模板：${call} → ${hit.key}`);
  }
}
function assertNoDynamicPluginCalls(calls: unknown[]): void {
  assert.ok(calls.every((value) => typeof value !== "string" || !value.includes(risk)), "动态内容也不应经插件调用再次查表");
}
function checkChildren(file: string, needle: string, scope: Record<string, any>, expected: string, oldNeedle = needle): void {
  for (const locale of locales) {
    const r = runtime(locale);
    try {
      const variables = { ...scope, ...r.scope };
      const before = render(children(original(file), oldNeedle), variables);
      const after = render(children(final(file), needle), variables);
      assert.equal(after, locale === "zh-CN" ? expected : before);
      assertSafeCalls(r.calls);
      assertNoDynamicPluginCalls(r.pluginCalls);
    } finally { r.restore(); }
  }
}

test("displayParts：实际代码行提示重排 React 对象槽位并保持身份，只查询固定骨架", () => {
  const call = select(final(FILE.excerpt), (node) => t.isCallExpression(node) && t.isIdentifier(node.callee, { name: "displayParts" }));
  const skeleton = evaluate(call.arguments[0]);
  const element = Object.freeze({ $$typeof: Symbol.for("react.transitional.element"), type: "span", key: "path", props: Object.freeze({ children: risk }) });
  for (const locale of locales) {
    const r = runtime(locale);
    try {
      const parts = stable.displayParts(skeleton, [element, 12, 15]);
      assert.deepEqual(parts, locale === "zh-CN"
        ? ["已加载的差异中没有 ", element, " 的第 ", 12, "-", 15, " 行。"]
        : ["", element, " lines ", 12, "-", 15, " are not in the loaded diff."]);
      assert.equal(parts[1], element);
      assert.deepEqual(r.calls, locale === null ? [] : [skeleton]);
      assertSafeCalls(r.calls);
    } finally { r.restore(); }
  }
});

test("工作流：真实阶段状态与比较值保持英文，仅 aria-label 翻译动作、标题周边和状态", () => {
  assert.equal(code(fn(patched(FILE.workflow), "phaseStatusLabel")), code(fn(original(FILE.workflow), "phaseStatusLabel")));
  const states = [
    { phase: { state: "running", members: [] }, status: "running", zh: "运行中" },
    { phase: { state: "done", members: [{ status: "failed" }] }, status: "failed", zh: "失败" },
    { phase: { state: "done", members: [{ status: "interrupted" }] }, status: "stopped", zh: "已停止" },
    { phase: { state: "done", members: [] }, status: "done", zh: "已完成" },
    { phase: { state: "pending", members: [] }, status: "not started", zh: "尚未开始" },
  ];
  const attribute = (source: string) => select(source, (node) => t.isJSXAttribute(node) && node.name.name === "aria-label" && code(node).includes("phase.title")).value.expression;
  for (const locale of locales) for (const open of [false, true]) for (const item of states) {
    const r = runtime(locale);
    try {
      const phase = { ...item.phase, title: risk };
      const snapshot = structuredClone(phase);
      assert.equal(evaluate(fn(patched(FILE.workflow), "phaseStatusLabel"))(phase), item.status);
      const status = evaluate(fn(final(FILE.workflow), "phaseStatusLabel"), r.scope)(phase);
      // not started 只用于显示，插件按 E3 翻译；实际参与比较的 failed 等状态必须保持原值。
      assert.equal(status, locale === "zh-CN" && item.status === "not started" ? item.zh : item.status);
      const scope = { phase, status, open, ...r.scope };
      assert.equal(evaluate(attribute(final(FILE.workflow)), scope), locale === "zh-CN"
        ? `${open ? "收起" : "展开"}“${risk}”阶段，${item.zh}`
        : evaluate(attribute(original(FILE.workflow)), scope));
      assert.deepEqual(phase, snapshot);
      assertSafeCalls(r.calls);
      assertNoDynamicPluginCalls(r.pluginCalls);
      r.calls.length = 0;
      assert.equal(stable.displayWorkflowStatus(risk), risk);
      assert.deepEqual(r.calls, []);
    } finally { r.restore(); }
  }
});

test("工作流人数：原版和最终 JSX 单复数完整对应", () => {
  for (const count of [1, 3]) checkChildren(FILE.workflow, "phase.settledCount", {
    phase: { settledCount: 1, members: Array(count) },
  }, `1/${count} 个 Agent`);
});

test("工作流：真实 RuntimeSubagentStatus 全集的读屏文本翻译，图标仍接原始状态", () => {
  const source = original("packages/client-runtime/src/state/subagentRuntime.ts");
  const alias = select(source, (node) => t.isTSTypeAliasDeclaration(node) && node.id.name === "RuntimeSubagentStatus");
  assert.ok(t.isTSUnionType(alias.typeAnnotation));
  const statuses = alias.typeAnnotation.types.map((type: any) => {
    assert.ok(t.isTSLiteralType(type) && t.isStringLiteral(type.literal));
    return type.literal.value;
  });
  const iconStatuses = (source: string) => selectAll(source, (node) => t.isJSXAttribute(node)
    && node.name.name === "status" && code(node.value).includes("member.status")).map((node) => node.value.expression);
  const statusExpressions = iconStatuses(final(FILE.workflow));
  assert.equal(statusExpressions.length, 2, "图标与 tooltip 都接原始 status");
  assert.deepEqual(statusExpressions.map(code), iconStatuses(original(FILE.workflow)).map(code));
  for (const locale of locales) for (const status of [...statuses, risk]) {
    const r = runtime(locale);
    try {
      const member = { status };
      const scope = { member, ...r.scope };
      const before = render(children(original(FILE.workflow), "member.status"), scope);
      const after = render(children(final(FILE.workflow), "member.status"), scope);
      if (locale === "zh-CN" && status !== risk) {
        assert.equal(typeof dict.messages[status], "string", `${status} 缺少精确显示词条`);
        assert.match(dict.messages[status], /[一-鿿]/);
        assert.equal(after, dict.messages[status]);
      } else assert.equal(after, before);
      assertSafeCalls(r.calls);
      r.calls.length = 0;
      for (const expression of statusExpressions) assert.equal(evaluate(expression, scope), status);
      assert.deepEqual(member, { status });
      assert.deepEqual(r.calls, []);
    } finally { r.restore(); }
  }
});

test("工作流：顶层展开/收起标签保留任意用户标题", () => {
  const attribute = (source: string) => select(source, (node) => t.isJSXAttribute(node)
    && node.name.name === "aria-label" && code(node.value).includes("expanded")).value.expression;
  for (const locale of locales) for (const expanded of [false, true]) {
    const r = runtime(locale);
    try {
      const scope = { expanded, label: risk, ...r.scope };
      assert.equal(evaluate(attribute(final(FILE.workflow)), scope), locale === "zh-CN"
        ? `${expanded ? "收起" : "展开"} ${risk}` : evaluate(attribute(original(FILE.workflow)), scope));
      assertSafeCalls(r.calls);
      assertNoDynamicPluginCalls(r.pluginCalls);
    } finally { r.restore(); }
  }
});

test("评审指南：已读数、两处步骤序号和动态下一步标题", () => {
  checkChildren(FILE.rail, "stops.length", { reviewed: 2, stops: Array(5) }, "已读 2/5");
  for (const locale of locales) {
    const r = runtime(locale);
    try {
      const before = childGroups(original(FILE.stop), "stopCount");
      const after = childGroups(final(FILE.stop), "stopCount");
      assert.equal(before.length, 2);
      assert.equal(after.length, 2);
      for (let i = 0; i < before.length; i++) {
        const scope = { index: 1, stopCount: 5, ...r.scope };
        assert.equal(render(after[i]!, scope), locale === "zh-CN" ? "第 2 步，共 5 步" : render(before[i]!, scope));
      }
      assertSafeCalls(r.calls);
    } finally { r.restore(); }
  }
  checkChildren(FILE.stop, "Next:", { nextTitle: risk }, `下一步：${risk}`);
});

test("评审指南：原版 stopSubline 输出经真实显示调用翻译，任意文本不查表", () => {
  const source = original("packages/client-runtime/src/reviewGuideTour.ts");
  const stopFilePaths = evaluate(fn(source, "stopFilePaths"));
  const stopSubline = evaluate(fn(source, "stopSubline"), { stopFilePaths });
  for (const count of [0, 1, 3]) {
    const stop = { excerpts: [], files: Array.from({ length: count }, (_, i) => ({ path: `${risk}/${i}` })) };
    checkChildren(FILE.rail, "stopSubline", { stop, stopSubline }, count === 0 ? "上下文，无代码" : `${count} 个文件`);
  }
  const r = runtime("zh-CN");
  try {
    assert.equal(stable.displayGuideSubline(risk), risk);
    assert.deepEqual(r.calls, []);
  } finally { r.restore(); }
});

test("指南摘录：动态错误、路径、代码行对象均原样插入，不传给 t", () => {
  checkChildren(FILE.tour, "The diff could not be loaded", { diff: { error: risk } }, `无法加载差异，因此无法显示代码摘录：${risk}`);
  checkChildren(FILE.excerpt, "Loading ", { excerpt: { path: risk } }, `正在加载 ${risk}…`);
  checkChildren(FILE.excerpt, "are not in the loaded diff.", { excerpt: { path: risk, start: 12, end: 15 } }, `已加载的差异中没有 ${risk} 的第 12-15 行。`);
  for (const side of ["old", "new"]) checkChildren(FILE.excerpt, "diff lines", {
    excerpt: { side }, slice: { shown: 3, total: 7 },
  }, `${side === "old" ? "已移除的代码，" : ""}显示 3/7 行差异`);
});

test("提示词链接：隐藏字符警告和克隆仓库按钮保留原版单复数及动态仓库名", () => {
  for (const hiddenCharacters of [1, 3]) checkChildren(FILE.landing, "T3 Code removed", {
    prompt: { hiddenCharacters },
  }, `T3 Code 已移除 ${hiddenCharacters} 个隐藏字符。发送前请先阅读提示词。`);
  checkChildren(FILE.link, "Clone ", { name: risk }, `克隆 ${risk}`);
});

test("提示词链接：真实 notes.push 的服务提供方/模型回退说明不翻动态内容", () => {
  const note = (source: string) => select(source, (node) => t.isCallExpression(node) && t.isMemberExpression(node.callee)
    && t.isIdentifier(node.callee.object, { name: "notes" }) && t.isIdentifier(node.callee.property, { name: "push" })).arguments[0];
  for (const locale of locales) for (const resolved of [null, { exact: false }]) for (const model of [`model/${risk}`, null]) {
    const r = runtime(locale);
    try {
      const link = { provider: risk, model };
      const scope = { link, resolved, ...r.scope };
      const expected = resolved === null ? `此链接指定的 ${link.provider} 尚未在此配置，因此已使用你的默认模型。`
        : `此链接指定了 ${link.model}，但 ${link.provider} 在此未提供该模型，因此已使用其默认模型。`;
      assert.equal(evaluate(note(final(FILE.link)), scope), locale === "zh-CN" ? expected : evaluate(note(original(FILE.link)), scope));
      assert.deepEqual(link, { provider: risk, model });
      assertSafeCalls(r.calls);
      assertNoDynamicPluginCalls(r.pluginCalls);
    } finally { r.restore(); }
  }
});

test("提示词链接：拼接提示前只翻固定提醒，notes 原样保留", () => {
  const description = (source: string) => select(source, (node) => t.isObjectProperty(node)
    && t.isIdentifier(node.key, { name: "description" }) && code(node.value).includes("...notes")).value;
  for (const locale of locales) {
    const r = runtime(locale);
    try {
      const scope = { notes: [risk, "No project"], ...r.scope };
      assert.equal(evaluate(description(final(FILE.prompt)), scope), locale === "zh-CN"
        ? `发送前请先阅读。 ${risk} No project` : evaluate(description(original(FILE.prompt)), scope));
      assertSafeCalls(r.calls);
      assert.ok(!r.calls.includes("No project"));
      assertNoDynamicPluginCalls(r.pluginCalls);
    } finally { r.restore(); }
  }
});

test("遥测：权限句、端点标签和运行端点翻译，动态环境名/URL及 signal 值保持原样", () => {
  for (const environment of [null, { label: risk }, { label: "the selected environment" }]) {
    checkChildren(FILE.telemetry, "This connection lacks permission", { environment },
      `此连接没有更改 ${environment?.label ?? "所选环境"} 上设置的权限。`);
  }
  for (const locale of locales) {
    const r = runtime(locale);
    try {
      const before = evaluate(declaration(original(FILE.telemetry), "SIGNALS"), r.scope);
      const after = evaluate(declaration(final(FILE.telemetry), "SIGNALS"), r.scope);
      assert.deepEqual(after.map(({ key, signal }: any) => ({ key, signal })), before.map(({ key, signal }: any) => ({ key, signal })));
      for (let i = 0; i < before.length; i++) {
        const a = render(children(original(FILE.telemetry), "endpoint"), { ...before[i], ...r.scope });
        const b = render(children(final(FILE.telemetry), "endpoint"), { ...after[i], ...r.scope });
        assert.equal(b, locale === "zh-CN" ? ["追踪端点", "指标端点", "日志端点"][i] : a);
      }
      assertSafeCalls(r.calls);
    } finally { r.restore(); }
  }
  for (const value of ["", `https://endpoint/${risk}`]) checkChildren(FILE.telemetry, "Running:", {
    key: "otlpLogsUrl", running: { otlpLogsUrl: value },
  }, `当前使用：${value || "已停用"}`);
});

test("更新对话框：真实 tasks 计数和三条中断提示完整翻译，英文/无运行时与原版相等", () => {
  const sentence = (source: string) => select(source, (node) => t.isConditionalExpression(node)
    && code(node.test) === "stopped === 0" && code(node.consequent).includes("will be interrupted"));
  for (const locale of locales) for (const [stopped, continuing] of [[0, 1], [1, 0], [2, 3]]) {
    const r = runtime(locale);
    try {
      const running = stopped! + continuing!;
      const scope = { stopped, continuing, running, ...r.scope };
      const rawThreads = evaluate(declaration(original(FILE.update), "threads"), scope);
      const threads = evaluate(declaration(final(FILE.update), "threads"), scope);
      const before = evaluate(sentence(original(FILE.update)), { ...scope, threads: rawThreads });
      const after = evaluate(sentence(final(FILE.update)), { ...scope, threads });
      const expected = `${running} 个运行中的任务将被中断${stopped === 0 ? "，可在重启后恢复。" : continuing === 0 ? "。" : `，其中 ${continuing} 个可在重启后恢复。`}`;
      assert.equal(after, locale === "zh-CN" ? expected : before);
      assertSafeCalls(r.calls);
    } finally { r.restore(); }
  }
});

test("更新失败：真实 label 分支保留任意设备名，状态/动作/比较值不翻译", () => {
  const label = (source: string) => select(source, (node) => t.isObjectProperty(node) && t.isIdentifier(node.key, { name: "label" })
    && code(node.value).includes("failed.length === 1")).value;
  const machineStatus = fn(original(FILE.updateLogic), "resolveUpdateRunMachineStatus");
  assert.equal(code(fn(patched(FILE.updateLogic), "resolveUpdateRunMachineStatus")), code(machineStatus));
  for (const locale of locales) for (const count of [1, 3]) {
    const r = runtime(locale);
    try {
      const failed = Array.from({ length: count }, () => ({ machine: { label: risk } }));
      const scope = { failed, ...r.scope };
      assert.equal(evaluate(label(final(FILE.updateLogic)), scope), locale === "zh-CN"
        ? count === 1 ? `${risk} 更新失败` : "3 项失败" : evaluate(label(original(FILE.updateLogic)), scope));
      assertSafeCalls(r.calls);
      r.calls.length = 0;
      assert.equal(evaluate(machineStatus, r.scope)({ result: "failed" }, "servers", {}), "failed");
      assert.deepEqual(r.calls, []);
    } finally { r.restore(); }
  }
});

test("更新侧栏：真实本机状态函数及显示调用覆盖倒计时、重启、下载和等待", () => {
  const cases = [
    { run: { phase: "countdown", restartAt: 5000 }, local: null, expected: "4 秒后重启" },
    { run: { phase: "installing", restartAt: null }, local: null, expected: "正在重启" },
    { run: { phase: "servers", restartAt: null }, local: { status: "downloading", percent: null }, expected: "正在下载" },
    { run: { phase: "servers", restartAt: null }, local: { status: "downloading", percent: 37.9 }, expected: "正在下载 37%" },
    { run: { phase: "servers", restartAt: null }, local: { status: "waiting" }, expected: "将在服务器更新后重启" },
  ];
  for (const locale of locales) for (const item of cases) {
    const r = runtime(locale);
    try {
      const scope = { run: item.run, local: item.local, now: 1000, ...r.scope };
      const before = render(children(original(FILE.capsule), "localStatusLabel"), {
        ...scope, localStatusLabel: evaluate(fn(original(FILE.capsule), "localStatusLabel"), r.scope),
      });
      const after = render(children(final(FILE.capsule), "localStatusLabel"), {
        ...scope, localStatusLabel: evaluate(fn(final(FILE.capsule), "localStatusLabel"), r.scope),
      });
      assert.equal(after, locale === "zh-CN" ? item.expected : before);
      assertSafeCalls(r.calls);
    } finally { r.restore(); }
  }
});

test("更新侧栏：真实状态映射仅在显示处翻译，慢设备 aria-label 保留名称和已用时间", () => {
  const originalLabels = evaluate(declaration(original(FILE.updateLogic), "RUN_STATUS_LABELS"));
  const ariaLabel = (source: string) => select(source, (node) => t.isJSXAttribute(node)
    && node.name.name === "aria-label" && code(node.value).includes("view.slow")).value.expression;
  for (const locale of locales) for (const status of Object.keys(originalLabels)) {
    const r = runtime(locale);
    try {
      const labels = evaluate(declaration(final(FILE.updateLogic), "RUN_STATUS_LABELS"), r.scope);
      assert.deepEqual(Object.keys(labels), Object.keys(originalLabels));
      const formatUpdateElapsed = evaluate(fn(final(FILE.updateLogic), "formatUpdateElapsed"), r.scope);
      const scope = { status, RUN_STATUS_LABELS: labels, now: 1000, machine: { startedAt: 1000 }, formatUpdateElapsed, ...r.scope };
      const after = render(children(final(FILE.capsule), "RUN_STATUS_LABELS"), scope);
      const before = render(children(original(FILE.capsule), "RUN_STATUS_LABELS"), {
        ...scope, RUN_STATUS_LABELS: originalLabels,
        formatUpdateElapsed: evaluate(fn(original(FILE.updateLogic), "formatUpdateElapsed"), r.scope),
      });
      const timed = !["done", "failed", "waiting"].includes(status);
      assert.equal(after, locale === "zh-CN"
        ? dict.messages[originalLabels[status]] + (timed ? " 不足 1 分钟" : "") : before);
      for (const slow of [null, { status: originalLabels[status], elapsed: "6m" }]) {
        const view = { label: risk, slow };
        const result = evaluate(ariaLabel(final(FILE.capsule)), { view, ...r.scope });
        assert.equal(result, locale === "zh-CN" && slow
          ? `${risk} ${dict.messages[slow.status]} 6m` : evaluate(ariaLabel(original(FILE.capsule)), { view, ...r.scope }));
        assert.deepEqual(view, { label: risk, slow });
      }
      assertSafeCalls(r.calls);
      r.calls.length = 0;
      assert.equal(stable.displayUpdateStatus(risk), risk);
      assert.deepEqual(r.calls, []);
    } finally { r.restore(); }
  }
});

test("PR 堆栈：真实说明翻译合并方式，runAction 中的 mergeMethod 协议值保持不变", () => {
  const description = (source: string) => select(source, (node) => t.isConditionalExpression(node)
    && code(node.consequent).includes("and its unmerged layers below"));
  const protocol = (source: string) => select(source, (node) => t.isConditionalExpression(node)
    && t.isObjectExpression(node.consequent) && node.consequent.properties.some((property) => t.isObjectProperty(property)
      && t.isIdentifier(property.key, { name: "mergeMethod" })));
  assert.equal(code(protocol(patched(FILE.stack))), code(protocol(original(FILE.stack))));
  for (const locale of locales) for (const mergeMethod of ["merge", "squash", "rebase", "custom"]) {
    const r = runtime(locale);
    try {
      const scope = { confirmation: "merge", reference: { number: 7 }, stack: { base: risk }, hostLabel: "GitLab", mergeMethod, ...r.scope };
      const method = ({ merge: "合并", squash: "压缩并合并", rebase: "变基" } as Record<string, string>)[mergeMethod] ?? mergeMethod;
      assert.equal(evaluate(description(final(FILE.stack)), scope), locale === "zh-CN"
        ? `使用 ${method} 将 #7 及其下方尚未合并的层合并到 ${risk}。GitLab 会在合并或加入队列前检查其规则，并在合并后对堆栈的其余部分执行变基。`
        : evaluate(description(original(FILE.stack)), scope));
      assertSafeCalls(r.calls);
      r.calls.length = 0;
      assert.deepEqual(evaluate(protocol(final(FILE.stack)), { action: "merge", mergeMethod, ...r.scope }), { mergeMethod });
      assert.deepEqual(evaluate(protocol(final(FILE.stack)), { action: "rebase", mergeMethod, ...r.scope }), { updateMethod: "rebase" });
      assert.deepEqual(r.calls, []);
    } finally { r.restore(); }
  }
});

function updateDisplayFunctions(source: string, scope: Record<string, any>) {
  const dependencies = {
    ...scope,
    countLabel: evaluate(fn(source, "countLabel"), scope),
    joinList: evaluate(fn(source, "joinList"), scope),
  };
  return {
    describe: evaluate(fn(source, "describeUpdateEverything"), dependencies),
    toast: evaluate(fn(source, "getUpdateEverythingToastView"), dependencies),
  };
}

test("C/r1 批量更新：真实 summary/lines 翻译数量与固定词，保留设备、提供方和版本", () => {
  const plans = [
    {
      plan: { localVersion: null, servers: [], providerMachines: [{ environmentId: "a", label: risk, providers: ["Codex"] }] },
      expected: { summary: "更新 1 个服务提供方", lines: [`${risk}: Codex`] },
    },
    {
      plan: {
        localVersion: risk,
        servers: [
          { environmentId: "a", serverLabel: risk, selfUpdate: "npm", targetVersion: risk },
          { environmentId: "b", serverLabel: "this app", selfUpdate: "desktop-managed", targetVersion: risk },
        ],
        providerMachines: [
          { environmentId: "a", label: risk, providers: ["Codex", "this app"] },
          { environmentId: "c", label: "No project", providers: [risk] },
        ],
      },
      expected: {
        summary: "更新 本应用、2 服务器、3 个服务提供方",
        lines: [`本应用：${risk}，最后重启`, `${risk}: 服务器更新至 ${risk}, Codex, this app`, "this app: 桌面应用更新", `No project: ${risk}`],
      },
    },
    {
      plan: { localVersion: "0.1.0", servers: [], providerMachines: [] },
      expected: { summary: "更新 本应用", lines: ["本应用：0.1.0，最后重启"] },
    },
    {
      plan: { localVersion: null, servers: [{ environmentId: "a", serverLabel: risk, selfUpdate: "npm", targetVersion: "0.1.0" }], providerMachines: [] },
      expected: { summary: "更新 1 服务器", lines: [`${risk}: 服务器更新至 0.1.0`] },
    },
    { plan: { localVersion: null, servers: [], providerMachines: [] }, expected: { summary: "更新 ", lines: [] } },
  ];
  for (const locale of locales) for (const { plan, expected } of plans) {
    const r = runtime(locale);
    try {
      const saved = structuredClone(plan);
      const before = updateDisplayFunctions(original(FILE.updateLogic), r.scope).describe(plan);
      const shown = updateDisplayFunctions(final(FILE.updateLogic), r.scope).describe(plan);
      assert.deepEqual(shown, locale === "zh-CN" ? expected : before);
      assert.deepEqual(plan, saved);
      assertSafeCalls(r.calls);
      assertNoDynamicPluginCalls(r.pluginCalls);
    } finally { r.restore(); }
  }
});

test("C/r1 完成提示：真实插件输出不再误配 Updated 时间模板，失败详情保持原样", () => {
  const appVersion = risk;
  const cases = [
    {
      result: { localVersion: null, updatedServers: 0, updatedProviders: 1, failures: [], restarting: [] },
      expected: { type: "success", title: "已更新 1 个服务提供方" },
    },
    {
      result: { localVersion: appVersion, updatedServers: 2, updatedProviders: 3, failures: [], restarting: [risk, "this app", "No project"] },
      expected: { type: "success", title: "已更新 本应用、2 服务器、3 个服务提供方", description: `${risk}、this app、No project 仍在重启。` },
    },
    {
      result: { localVersion: "another-version", updatedServers: 1, updatedProviders: 0, failures: [risk, "This app: arbitrary failure", "Updated yesterday"], restarting: [risk] },
      expected: { type: "error", title: "已更新 1 服务器", description: `${risk}\nThis app: arbitrary failure\nUpdated yesterday\n${risk} 仍在重启。` },
    },
    {
      result: { localVersion: null, updatedServers: 0, updatedProviders: 0, failures: [risk], restarting: [] },
      expected: { type: "error", title: "更新失败", description: risk },
    },
    { result: { localVersion: null, updatedServers: 0, updatedProviders: 0, failures: [], restarting: [] }, expected: null },
  ];
  for (const locale of locales) for (const { result, expected } of cases) {
    const r = runtime(locale);
    try {
      const saved = structuredClone(result);
      const before = updateDisplayFunctions(original(FILE.updateLogic), r.scope).toast(result, appVersion);
      const shown = updateDisplayFunctions(final(FILE.updateLogic), r.scope).toast(result, appVersion);
      assert.deepEqual(shown, locale === "zh-CN" ? expected : before);
      assert.deepEqual(result, saved);
      assertSafeCalls(r.calls);
      assertNoDynamicPluginCalls(r.pluginCalls);
      assert.ok(!r.calls.some((value) => value.includes("arbitrary failure") || value === "Updated yesterday"));
    } finally { r.restore(); }
  }
  for (const name of ["collectServerUpdateTargets", "collectUpdateEverythingResult", "runUpdateEverything", "resolveUpdateRunMachineStatus"]) {
    assert.equal(code(fn(patched(FILE.updateLogic), name)), code(fn(original(FILE.updateLogic), name)), `${name} 数据逻辑不变`);
  }
});

test("C/r1 跳过列表：只在最终显示处翻已知原因，任意原因和设备名不传查表", () => {
  const reasons = [
    ["not connected", "未连接"], ["no permission", "没有权限"], ["already updating", "正在更新"],
    ["needs a manual update", "需要手动更新"], ["needs a newer desktop app", "需要更新的桌面应用"],
    ["on the stable channel", "使用正式版更新通道"], ["on the nightly channel", "使用每夜版更新通道"],
    ["t3@0.1.0-zh.1 is not on npm yet", "t3@0.1.0-zh.1 尚未发布到 npm"], [risk, risk],
  ];
  for (const locale of locales) {
    const r = runtime(locale);
    try {
      const skipped = reasons.map(([reason]) => ({ environmentId: "id-" + reason, label: risk, reason }));
      const saved = structuredClone(skipped);
      const before = render(children(original(FILE.update), "skipped.map"), { skipped, ...r.scope });
      const shown = render(children(final(FILE.update), "skipped.map"), { skipped, ...r.scope });
      assert.equal(shown, locale === "zh-CN" ? reasons.map(([, zh]) => `跳过 ${risk}：${zh}`).join("\n") : before);
      assert.deepEqual(skipped, saved);
      assertSafeCalls(r.calls, [risk, "0.1.0-zh.1"]);
      assertNoDynamicPluginCalls(r.pluginCalls);
    } finally { r.restore(); }
  }
});

test("C 提示词链接摘要：只翻 details 固定项和骨架，原始 No project 提示词与链接数据不变", () => {
  const prompt = { text: "No project", hiddenCharacters: 0 };
  const cases = [
    { path: "/thread/thread-id?prompt=No%20project", link: { prompt }, expected: ["打开你的一个任务。"] },
    { path: "/new?prompt=No%20project", link: { kind: "new-thread", prompt, repository: null, provider: null, model: null }, expected: ["无项目"] },
    {
      path: "/new",
      link: { kind: "new-thread", prompt, repository: { owner: risk, name: "No project" }, provider: risk, model: "No project" },
      expected: [`仓库 ${risk}/No project`, `模型 ${risk} No project`],
    },
    { path: "/new", link: { kind: "new-thread", prompt, repository: null, provider: risk, model: null }, expected: ["无项目", `模型 ${risk}`] },
    { path: "/new", link: { kind: "pull-request", prompt, pullRequest: { owner: risk, name: "No project", number: 42 } }, expected: [`拉取请求 ${risk}/No project#42`] },
  ];
  for (const locale of locales) for (const { path: appPath, link, expected } of cases) {
    const r = runtime(locale);
    try {
      const saved = structuredClone(link);
      const scope = {
        window: { location: { origin: "https://example.invalid" } },
        parseNewThreadLink: () => ({ ok: true, value: link }),
        parseThreadLinkPrompt: () => ({ ok: true, value: prompt }),
        ...r.scope,
      };
      const before = evaluate(fn(original(FILE.landing), "summarize"), scope)(appPath);
      const shown = evaluate(fn(final(FILE.landing), "summarize"), scope)(appPath);
      assert.deepEqual(shown, locale === "zh-CN" ? { ok: true, value: { prompt, details: expected } } : before);
      assert.strictEqual(shown.value.prompt, prompt, "返回原始提示词对象，不翻提示词正文");
      assert.equal(shown.value.prompt.text, "No project");
      assert.deepEqual(link, saved);
      assertSafeCalls(r.calls);
      assertNoDynamicPluginCalls(r.pluginCalls);
    } finally { r.restore(); }
  }
  for (const locale of locales) for (const appPath of ["/new", "/thread/id"]) {
    const r = runtime(locale);
    try {
      const failure = { ok: false, error: risk };
      const scope = { window: { location: { origin: "https://example.invalid" } }, parseNewThreadLink: () => failure, parseThreadLinkPrompt: () => failure, ...r.scope };
      assert.strictEqual(evaluate(fn(final(FILE.landing), "summarize"), scope)(appPath), failure);
      assert.deepEqual(r.calls, []);
      assertNoDynamicPluginCalls(r.pluginCalls);
    } finally { r.restore(); }
  }
});

test("C 更新侧栏动作：只翻最终 Later/Retry/Dismiss，协议动作和事件回调不变", () => {
  assert.equal(code(declaration(patched(FILE.capsule), "actionLabel")), code(declaration(original(FILE.capsule), "actionLabel")));
  assert.equal(code(declaration(patched(FILE.capsule), "runAction")), code(declaration(original(FILE.capsule), "runAction")));
  for (const locale of locales) for (const [action, expected] of [["later", "稍后"], ["retry", "重试"], ["dismiss", "关闭"]]) {
    const r = runtime(locale);
    try {
      const view = { action };
      const actionLabel = evaluate(declaration(original(FILE.capsule), "actionLabel"), { view });
      const scope = { actionLabel, ...r.scope };
      const before = render(children(original(FILE.capsule), "actionLabel"), scope);
      const shown = render(children(final(FILE.capsule), "actionLabel"), scope);
      assert.equal(shown, locale === "zh-CN" ? expected : before);
      assert.deepEqual(view, { action });
      assertSafeCalls(r.calls);
    } finally { r.restore(); }
  }
});
