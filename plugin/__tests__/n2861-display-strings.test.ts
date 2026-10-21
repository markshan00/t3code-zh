/** n2861: real display expressions, English parity and dynamic-value isolation. */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { stripTypeScriptTypes } from "node:module";
import { pathToFileURL } from "node:url";
import { parse } from "@babel/parser";
import babelTraverse from "@babel/traverse";
import babelGenerator from "@babel/generator";
import * as t from "@babel/types";
import { createTranslator, installT3zhRuntime } from "../../runtime/t3zh-runtime.ts";
import { collectValueUse, createScanContext, listScopeFiles, scanModule, type ValueUseInfo } from "../matcher.ts";
import { transformCode } from "../vite-plugin-t3zh.ts";

const traverse = (babelTraverse as any).default ?? babelTraverse;
const generate = (babelGenerator as any).default ?? babelGenerator;
const ROOT = path.resolve(import.meta.dirname, "../..");
const UPSTREAM = path.resolve(process.env.T3ZH_UPSTREAM ?? path.join(ROOT, "upstream"));
const PATCHES = fs.readdirSync(path.join(ROOT, "patches")).filter(p => p.endsWith(".patch")).sort();
const N2861 = "0020-n2861-display-strings.patch";
const MCP = "apps/web/src/components/chat/McpAppFrame.tsx";
const WELCOME = "apps/web/src/components/onboarding/WelcomeWizard.tsx";
const PREVIEW = "apps/web/src/components/preview/PreviewUnreachable.tsx";
const HELPER = "apps/web/src/newThreadDisplayStrings.ts";
const NEW_HELPER = "apps/web/src/n2861DisplayStrings.ts";
const COMPOSER = "apps/web/src/components/chat/ComposerPrimaryActions.tsx";
const TIMELINE = "apps/web/src/components/chat/MessagesTimeline.tsx";
const PERMISSIONS = "apps/web/src/components/settings/settingsLayout.tsx";
const SETTINGS = "apps/web/src/hooks/useSettings.ts";
const PROVIDER = "apps/web/src/components/settings/ProviderInstanceCard.tsx";
const USAGE = "apps/web/src/components/usage/UsagePage.tsx";
const FIND = "apps/web/src/components/chat/ThreadFindBar.tsx";
const DIFF_HELPER = "apps/web/src/diffSearchDisplayStrings.ts";
const DIFF_VIEW = "apps/web/src/components/diffs/StyledDiffCodeView.tsx";
const CLI = "apps/web/src/components/settings/CliCommandSettingsRow.tsx";
const CODE_LANGUAGES = "apps/web/src/composer-code-languages.ts";
const CODE_PICKER = "apps/web/src/components/chat/ComposerCodeBlockLanguagePicker.tsx";
const PR_SUMMARY = "apps/web/src/components/pullRequest/PullRequestSummaryTab.tsx";
const COMMAND_RESULTS = "apps/web/src/components/CommandPaletteResults.tsx";
const FILES = ["apps/web/src/n2935DisplayStrings.ts", PR_SUMMARY,CODE_LANGUAGES, CODE_PICKER, COMMAND_RESULTS, MCP, WELCOME, PREVIEW, HELPER, NEW_HELPER, COMPOSER, TIMELINE, PERMISSIONS, SETTINGS, PROVIDER, USAGE, FIND, DIFF_HELPER, DIFF_VIEW, CLI, "apps/web/src/acceptanceDisplayStrings.ts", "apps/web/src/connectionPermissionDisplayStrings.ts"];
function tree(patches: readonly string[]) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "t3zh-n2861-"));
  for (const f of FILES) {
    fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true });
    if (fs.existsSync(path.join(UPSTREAM, f))) fs.copyFileSync(path.join(UPSTREAM, f), path.join(dir, f));
  }
  for (const p of patches) execFileSync("git", ["apply", ...FILES.map(f => `--include=${f}`), path.join(ROOT, "patches", p)], { cwd: dir });
  return dir;
}
const BEFORE = tree(PATCHES.filter(p => p < N2861));
const TEMP = tree(PATCHES);
after(() => { for (const d of [BEFORE, TEMP]) fs.rmSync(d, { recursive: true, force: true }); });
for (const f of ["apps/web/src/acceptanceDisplayStrings.ts", "apps/web/src/connectionPermissionDisplayStrings.ts", NEW_HELPER, DIFF_HELPER]) {
  const file = path.join(TEMP, f);
  fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace(/from "\.\/newThreadDisplayStrings"/g, 'from "./newThreadDisplayStrings.ts"'));
}
const cleanupFile = path.join(TEMP, "apps/web/src/n2935DisplayStrings.ts");
fs.writeFileSync(cleanupFile, fs.readFileSync(cleanupFile, "utf8").replace(
  /from "\.\/(newThreadDisplayStrings|acceptanceDisplayStrings)"/g, 'from "./$1.ts"'));
const cleanup = await import(pathToFileURL(cleanupFile).href);
const helper = await import(pathToFileURL(path.join(TEMP, HELPER)).href);
const acceptance = await import(pathToFileURL(path.join(TEMP, "apps/web/src/acceptanceDisplayStrings.ts")).href);
const permissions = await import(pathToFileURL(path.join(TEMP, "apps/web/src/connectionPermissionDisplayStrings.ts")).href);
const download = await import(pathToFileURL(path.join(TEMP, NEW_HELPER)).href);
const diffSearch = await import(pathToFileURL(path.join(TEMP, DIFF_HELPER)).href);
const dict = JSON.parse(fs.readFileSync(path.join(ROOT, "dict/zh-CN.json"), "utf8"));
const SLOT = "\uE000";
const risky = "feature/foo to main $& Lua";
const read = (root: string, f: string) => fs.readFileSync(path.join(root, f), "utf8");
const ast = (code: string) => parse(code, { sourceType: "module", plugins: ["typescript", "jsx"] });
function elements(root: string, file: string): any[][] {
  const result: any[][] = [];
  traverse(ast(read(root, file)), {
    JSXElement(p: any) { result.push(t.react.buildChildren(p.node)); },
    JSXFragment(p: any) { result.push(t.react.buildChildren(p.node)); },
  });
  return result;
}
function one(root: string, file: string, match: (c: any[]) => boolean): any[] {
  const found = elements(root, file).filter(match);
  assert.equal(found.length, 1, file);
  return found[0];
}
function evaluate(code: string, scope: Record<string, unknown>): unknown {
  return new Function(...Object.keys(scope), stripTypeScriptTypes(`const result = (${code});`, { mode: "strip" }) + "return result;")(...Object.values(scope));
}
function render(children: any[], scope: Record<string, unknown>): string {
  return children.map(node => {
    if (t.isJSXElement(node) || t.isJSXFragment(node)) return render(t.react.buildChildren(node), scope);
    const value = evaluate(generate(node).code, { ...scope, ...helper, ...acceptance, ...permissions, ...download });
    return value == null || typeof value === "boolean" ? "" : String(value);
  }).join("");
}
function runtime(locale: "en" | "zh-CN" | null) {
  const previous = globalThis.__t3zh;
  const calls: string[] = [];
  let api: any = null;
  if (locale === null) globalThis.__t3zh = undefined;
  else {
    api = installT3zhRuntime(dict, { localStorage: { getItem: () => locale, setItem() {} }, navigator: null, systemLanguages: null, document: null, location: null, target: null }).api;
    globalThis.__t3zh = { ...api, t(value: string) { calls.push(value); return api.t(value); } };
  }
  return { calls, t: (value: unknown) => (api ? api.t(value) : value), restore() { globalThis.__t3zh = previous; } };
}
const fillSlotCall = (before: string) => (c: any[]) =>
  c.length === 1 && t.isCallExpression(c[0]) && t.isIdentifier(c[0].callee, { name: "fillSlot" }) && c[0].arguments[0]?.value === before;
const textChild = (value: string) => (c: any[]) => c.some(n => t.isStringLiteral(n) && n.value === value);

const newCases = [
  { file: MCP, original: "The ", after: "The ", suffix: " app was closed", zh: (v: string) => `${v} 应用已关闭` },
  { file: MCP, original: "The ", after: "The ", suffix: " app left its page and was stopped", zh: (v: string) => `${v} 应用离开了页面，已停止运行` },
  { file: MCP, original: "Unable to load the ", after: "Unable to load the ", suffix: " app", zh: (v: string) => `无法加载 ${v} 应用` },
];
test("0020 MCP states: real JSX, locales and slot-only calls", () => {
  for (const c of newCases) {
    const original = one(BEFORE, c.file, children => textChild(c.original)(children) && textChild(c.suffix)(children));
    const patched = one(TEMP, c.file, children => fillSlotCall(c.after)(children) && children[0].arguments[2].value === c.suffix);
    for (const value of ["weather", risky, "含中文的应用"]) for (const locale of [null, "en", "zh-CN"] as const) {
      const r = runtime(locale);
      try {
        assert.equal(render(patched, { app: { server: value } }), locale === "zh-CN" ? c.zh(value) : render(original, { app: { server: value } }));
        assert.deepEqual(r.calls, locale === null ? [] : [`${c.after}${SLOT}${c.suffix}`]);
      } finally { r.restore(); }
    }
  }
});
test("0020 setup skipped and download notice: React text and dynamic values stay intact", () => {
  const original = one(BEFORE, WELCOME, textChild("Not connected, so setup skips "));
  const patched = one(TEMP, WELCOME, fillSlotCall("Not connected, so setup skips "));
  const downloadOriginal = one(BEFORE, PREVIEW, textChild(" from "));
  const downloadPatched = one(TEMP, PREVIEW, c => c.some(n => t.isIdentifier(n, { name: "beforeFile" })));
  for (const labels of [[risky], ["weather", risky]]) for (const locale of [null, "en", "zh-CN"] as const) {
    const r = runtime(locale);
    try {
      const scope = { skippedLabels: labels };
      assert.equal(render(patched, scope), locale === "zh-CN" ? `未连接，设置将跳过 ${labels.join(", ")}。以后可以在设置中配置。` : render(original, scope));
      assert.deepEqual(r.calls, locale === null ? [] : [`Not connected, so setup skips ${SLOT}. You can set ${labels.length === 1 ? "it" : "them"} up later from Settings.`]);
      r.calls.length = 0;
      const host = risky, fileName = "data$&.txt";
      const [beforeFile, afterFile] = download.downloadAroundFile(host);
      assert.equal(render(downloadPatched, { beforeFile, afterFile, fileName }), locale === "zh-CN" ? `来自 ${host} 的 ${fileName} 已改为下载。` : render(downloadOriginal, { host, fileName }));
      assert.deepEqual(r.calls, locale === null ? [] : [`${SLOT} from \uE001 was downloaded instead.`]);
    } finally { r.restore(); }
  }
});
function selected(code: string, match: (node: any) => boolean) {
  const found: any[] = [];
  traverse(ast(code), { enter(p: any) { if (match(p.node)) found.push(p.node); } });
  assert.equal(found.length, 1);
  return found[0];
}
function initializer(code: string, name: string) {
  return generate(selected(code, n => t.isVariableDeclarator(n) && t.isIdentifier(n.id, { name } )).init).code;
}
function submitDisplay(code: string) {
  return selected(code, n => t.isJSXElement(n) && t.isJSXIdentifier(n.openingElement.name, { name: "TooltipPopup" }) && generate(n).code.includes("submitTooltip"));
}
test("approved A: full thought and thread label in real failed-tool aria expression", () => {
  const original = selected(read(UPSTREAM, TIMELINE), n => t.isJSXAttribute(n) && t.isJSXIdentifier(n.name, { name: "aria-label" }) && generate(n).code.includes("tool call failed") && generate(n).code.includes("thoughtLine")).value.expression;
  const patched = selected(read(TEMP, TIMELINE), n => t.isJSXAttribute(n) && t.isJSXIdentifier(n.name, { name: "aria-label" }) && generate(n).code.includes("displayFailedTool") && generate(n).code.includes("thoughtLine")).value.expression;
  for (const failed of [true, false]) for (const thoughtLine of ["", risky]) for (const threadLabel of [null, { text: risky }]) for (const locale of [null, "en", "zh-CN"] as const) {
    const r = runtime(locale);
    try {
      const scope = { failed, thoughtLine, threadLabel, label: "Read", ...acceptance };
      const english = evaluate(generate(original).code, scope);
      const actual = evaluate(generate(patched).code, scope);
      assert.equal(actual, locale === "zh-CN" && failed ? `${thoughtLine ? `${thoughtLine} ` : ""}${threadLabel?.text ?? "Read"}，工具调用失败` : english);
      assert.deepEqual(r.calls, locale === null || !failed ? [] : [`${SLOT}, tool call failed`]);
    } finally { r.restore(); }
  }
});
test("approved B: submitTooltip data unchanged; Summarize has precedence only on its real branch", () => {
  const source = read(UPSTREAM, COMPOSER), patched = read(TEMP, COMPOSER);
  assert.equal(initializer(patched, "submitTooltip"), initializer(source, "submitTooltip"));
  for (const status of [null, "Environment disconnected", risky]) for (const compact of [true, false]) for (const locale of [null, "en", "zh-CN"] as const) {
    const r = runtime(locale);
    try {
      const scope = { submitStatus: status, compactsBeforeSend: compact, compactTokens: risky, isRunning: false, isEditingQueuedMessage: false, submitLabel: "Submit message", followUpBehavior: "steer", alternateAction: "queue", alternateShortcutLabel: "" };
      const submitTooltip = evaluate(initializer(source, "submitTooltip"), scope);
      const shown = render(t.react.buildChildren(submitDisplay(patched)), { ...scope, submitTooltip });
      const expected = locale !== "zh-CN" ? submitTooltip : status === risky ? risky : status ? dict.messages[status] : compact ? `先总结 ${risky} 个 Token 的历史，再发送` : dict.messages["Submit message"];
      assert.equal(shown, expected);
      assert.ok(r.calls.every(v => !v.includes(risky)), "dynamic token/error never reaches t()");
    } finally { r.restore(); }
  }
});
test("same-kind provider and permission adaptation uses real expression values", () => {
  const permissionFiles = [PERMISSIONS, SETTINGS];
  for (const file of permissionFiles) {
    const originalCalls: any[] = [], patchedCalls: any[] = [];
    traverse(ast(read(UPSTREAM, file)), { TemplateLiteral(p: any) { if (p.node.quasis[0].value.cooked === "This connection lacks permission to change settings on ") originalCalls.push(p.node); } });
    traverse(ast(read(TEMP, file)), { CallExpression(p: any) { if (p.node.callee.name === "fillSlot" && p.node.arguments[0]?.value === "This connection lacks permission to change settings on ") patchedCalls.push(p.node); } });
    assert.equal(originalCalls.length, file === PERMISSIONS ? 1 : 2);
    assert.equal(patchedCalls.length, originalCalls.length);
    const scope = { context: null, primaryEnvironment: { label: risky }, environments: [{ environmentId: "env", label: risky }], environmentId: "env", deniedLabels: [risky], writableIds: new Set() };
    for (let i = 0; i < originalCalls.length; i++) for (const locale of [null, "en", "zh-CN"] as const) {
      const r = runtime(locale);
      try {
        assert.equal(evaluate(generate(patchedCalls[i]).code, { ...scope, ...helper }), locale === "zh-CN" ? `此连接没有更改 ${risky} 上设置的权限。` : evaluate(generate(originalCalls[i]).code, scope));
        assert.deepEqual(r.calls, locale === null ? [] : [`This connection lacks permission to change settings on ${SLOT}.`]);
      } finally { r.restore(); }
    }
  }
  const original = selected(read(UPSTREAM, PROVIDER), n => t.isJSXAttribute(n) && t.isJSXIdentifier(n.name, { name: "aria-label" }) && generate(n).code.includes("view details")).value.expression;
  const patched = selected(read(TEMP, PROVIDER), n => t.isJSXAttribute(n) && t.isJSXIdentifier(n.name, { name: "aria-label" }) && generate(n).code.includes("view details")).value.expression;
  for (const updateProgress of [null, {}]) for (const locale of [null, "en", "zh-CN"] as const) {
    const r = runtime(locale);
    try {
      const scope = { updateProgress, versionAdvisory: { title: "Update available" }, ...acceptance, ...helper };
      const shown = evaluate(generate(patched).code, scope);
      assert.equal(shown, locale === "zh-CN" ? `${dict.messages[updateProgress ? "Updating" : "Update available"]} — view details` : evaluate(generate(original).code, scope));
    } finally { r.restore(); }
  }
});
test("0020 usage filter: actual label data unchanged, final display covers every count", () => {
  const filter = (root: string) => generate(selected(read(root, USAGE), n => t.isFunctionDeclaration(n) && n.id?.name === "UsageProviderFilter")).code;
  assert.equal(initializer(filter(TEMP), "label"), initializer(filter(UPSTREAM), "label"));
  const span = (root: string, match: (n: any) => boolean) => t.react.buildChildren(selected(filter(root), n => t.isJSXElement(n) && n.openingElement.name.name === "span" && match(t.react.buildChildren(n))));
  const original = span(BEFORE, c => c.length === 1 && t.isIdentifier(c[0], { name: "label" }));
  const patched = span(TEMP, c => c.length === 1 && t.isConditionalExpression(c[0]) && generate(c[0]).code.includes('translateFixed("All providers")'));
  const PROVIDER_ORDER = ["a", "b", "c", "d", "e", "f"];
  for (let count = 0; count <= PROVIDER_ORDER.length; count++) for (const locale of [null, "en", "zh-CN"] as const) {
    const r = runtime(locale);
    try {
      const visible = PROVIDER_ORDER.slice(0, count);
      const label = count === 6 ? "All providers" : count === 0 ? "No providers" : count === 1 ? risky : `${count} providers`;
      assert.equal(render(patched, { visible, PROVIDER_ORDER, label }), locale !== "zh-CN" ? render(original, { label }) : count === 6 ? dict.messages["All providers"] : count === 0 ? dict.messages["No providers"] : count === 1 ? risky : `${count} 个服务提供方`);
      assert.ok(r.calls.every(v => !v.includes(risky) && !v.includes(String(count))));
    } finally { r.restore(); }
  }
});
test("0020 thread find: real state label render preserves count and unknown text", () => {
  const original = one(BEFORE, FIND, c => c.length === 1 && t.isIdentifier(c[0], { name: "label" }));
  const patched = one(TEMP, FIND, c => c.length === 1 && t.isConditionalExpression(c[0]) && generate(c[0]).code.includes('translateFixed("Searching…")'));
  for (const status of [null, "loading", "error"]) for (const locale of [null, "en", "zh-CN"] as const) {
    const r = runtime(locale);
    try {
      const label = status === "loading" ? "Searching…" : status === "error" ? "Search failed" : "1/2";
      const scope = { props: { status }, label };
      assert.equal(render(patched, scope), locale === "zh-CN" && status ? dict.messages[label] : render(original, scope));
      if (!status) assert.deepEqual(r.calls, []);
    } finally { r.restore(); }
  }
});
test("0020 onboarding step callbacks translate the actual three labels without changing stage data", () => {
  assert.equal(initializer(read(TEMP, WELCOME), "ONBOARDING_STAGES"), initializer(read(UPSTREAM, WELCOME), "ONBOARDING_STAGES"));
  const steps = selected(read(TEMP, WELCOME), n => t.isJSXOpeningElement(n) && t.isJSXIdentifier(n.name, { name: "WizardSteps" }));
  const displayOnboardingStep = evaluate(initializer(read(TEMP, WELCOME), "displayOnboardingStep"), helper);
  const callback = (name: string) => evaluate(generate(steps.attributes.find((a: any) => a.name?.name === name).value.expression).code, { ...acceptance, displayOnboardingStep });
  for (const locale of [null, "en", "zh-CN"] as const) {
    const r = runtime(locale);
    try {
      for (const [index, step] of ["Connect", "Agents", "Projects"].entries()) {
        const label = locale === "zh-CN" ? dict.messages[step] : step;
        assert.equal(callback("displayStep")(step), label);
        assert.equal(callback("displayStepAria")(step, index, null), locale === "zh-CN" ? `${label}，第 ${index + 1} 步` : `${step}, step ${index + 1}`);
      }
    } finally { r.restore(); }
  }
});
test("0020 diff result labels: numeric slots only; English observer never touches DOM", () => {
  const examples = [["No results", "无匹配结果"], ["12 results", "共 12 项结果"], ["2 of 12", "2 / 12"], [risky, risky], ["user results", "user results"]];
  for (const locale of [null, "en", "zh-CN"] as const) {
    const r = runtime(locale);
    try {
      for (const [value, zh] of examples) assert.equal(diffSearch.displayDiffSearchCount(value), locale === "zh-CN" ? zh : value);
      assert.ok(r.calls.every(v => !v.includes(risky) && !/\d/.test(v)));
      if (locale !== "zh-CN") diffSearch.observeDiffSearchLabels({ querySelectorAll() { throw Error("English must not read or mutate DOM"); } })();
    } finally { r.restore(); }
  }
  const adapter = read(TEMP, DIFF_VIEW);
  assert.match(adapter, /containerRef=\{setContainer\}/);
  assert.match(adapter, /stopSearchLabels\.current\?\.\(\)/);
  assert.match(adapter, /containerRef\(element\)/);
});
test("0020 compressed send aria uses the actual finite label; label data remains upstream", () => {
  assert.equal(initializer(read(TEMP, COMPOSER), "submitLabel"), initializer(read(UPSTREAM, COMPOSER), "submitLabel"));
  const aria = selected(read(TEMP, COMPOSER), n => t.isJSXAttribute(n) && n.name.name === "aria-label" && generate(n).code.includes("submitLabel")).value.expression;
  for (const locale of [null, "en", "zh-CN"] as const) {
    const r = runtime(locale);
    try {
      const scope = { ...acceptance, ...permissions, submitStatus: null, submitLabel: "Compact and send" };
      assert.equal(evaluate(generate(aria).code, scope), locale === "zh-CN" ? "压缩并发送" : "Compact and send");
    } finally { r.restore(); }
  }
});
test("0020 CLI command descriptions: real display expression, all path branches, English parity", () => {
  assert.equal(initializer(read(TEMP, CLI), "description"), initializer(read(UPSTREAM, CLI), "description"));
  const description = selected(read(TEMP, CLI), n => t.isJSXAttribute(n) && n.name.name === "description").value.expression;
  const code = stripTypeScriptTypes(`(${generate(description).code})`);
  const states = [
    { shadowedBy: risky, installedPath: null, onPath: false },
    { shadowedBy: null, installedPath: null, onPath: false },
    { shadowedBy: null, installedPath: risky, onPath: true },
    { shadowedBy: null, installedPath: risky, onPath: false },
  ];
  for (const [index, state] of states.entries()) for (const locale of [null, "en", "zh-CN"] as const) {
    const r = runtime(locale);
    try {
      const installed = state.installedPath !== null;
      const original = evaluate(initializer(read(UPSTREAM, CLI), "description"), { state, installed });
      const actual = evaluate(code, { state, installed, description: original, ...helper });
      const expected = [`新终端会优先运行 ${risky} 处的其他 t3。移除它后即可使用 T3 Code 提供的命令。`, "在任意终端中使用 `t3` 运行 T3 Code CLI。", `已安装于 ${risky}。打开新终端即可使用。`, `已安装于 ${risky}，其目录尚未加入 PATH。将该目录加入 PATH 后即可运行 \`t3\`。`][index];
      assert.equal(actual, locale === "zh-CN" ? expected : original);
      assert.ok(r.calls.every(v => !v.includes(risky)));
    } finally { r.restore(); }
  }
});
test("0020 provider progress translates only the actual finite status labels", () => {
  assert.equal(initializer(read(TEMP, PROVIDER), "updateProgress"), initializer(read(UPSTREAM, PROVIDER), "updateProgress"));
  const span = selected(read(TEMP, PROVIDER), n => t.isTemplateLiteral(n) && n.quasis[0]?.value.cooked === "Updating · ");
  for (const updateProgress of ["Starting update", "Waiting for another provider update to finish.", "Checking for the latest version", "Verifying the installed version", risky]) for (const locale of [null, "en", "zh-CN"] as const) {
    const r = runtime(locale);
    try {
      const value = evaluate(generate(span).code, { updateProgress, ...acceptance });
      assert.equal(value, `Updating · ${locale === "zh-CN" ? dict.messages[updateProgress] ?? updateProgress : updateProgress}`);
      assert.ok(r.calls.every(v => !v.includes(risky)));
    } finally { r.restore(); }
  }
});
test("0020 removes eleven text skips plus two pronoun branches; new mixed-display helpers do not expand matcher", () => {
  const ctx = createScanContext({ root: UPSTREAM });
  const expected: Record<string, string[]> = {
    [MCP]: ["The ", " app was closed", "The ", " app left its page and was stopped", "Unable to load the ", " app"],
    [WELCOME]: ["Not connected, so setup skips ", ". You can set", " up later from Settings.", "it", "them"],
    [PREVIEW]: [" from ", " was downloaded instead."],
  };
  for (const file of [MCP, WELCOME, PREVIEW]) {
    const summary = (root: string) => scanModule(read(root, file), path.join(UPSTREAM, file), ctx).candidates.map(c => `${c.text}|${c.category}|${c.decision}|${c.reason}`);
    const a = summary(BEFORE), b = summary(TEMP);
    assert.deepEqual(b.filter(c => !a.includes(c)), []);
    // 0021 replaces the pre-existing broad Import template in this same final file.
    // Its full expression parity/data isolation is covered by n2935-display-strings.test.ts.
    const laterRemoved = file === WELCOME ? ["Import {0} {1}|A|translate|jsx-expression"] : [];
    assert.deepEqual(a.filter(c => !b.includes(c)).sort(), [...expected[file].map(s => `${s}|A|skip|mixed-jsx`), ...laterRemoved].sort());
    const collect = (root: string) => { const map = new Map<string, ValueUseInfo>(); collectValueUse(read(root, file), file, file, map); return new Set(map.keys()); };
    const previous = collect(BEFORE);
    assert.deepEqual([...collect(TEMP)].filter(v => !previous.has(v)), []);
  }
  assert.deepEqual(scanModule(read(TEMP, NEW_HELPER), path.join(UPSTREAM, NEW_HELPER), ctx).candidates, []);
  const translate = createTranslator(dict), extras = JSON.parse(fs.readFileSync(path.join(ROOT, "dict/todo/v0.0.46-nightly.20261009.2861.extra.json"), "utf8"));
  const keys = new Set(extras.filter((e: any) => e.section === "templates").map((e: any) => e.key));
  const hits: string[] = [];
  for (const file of listScopeFiles(UPSTREAM)) for (const c of scanModule(fs.readFileSync(file, "utf8"), file, ctx).candidates) {
    if (c.decision === "translate" && translate.lookupMessage(c.text) === undefined && keys.has(translate.matchTemplate(c.text)?.key)) hits.push(`${file}:${c.line}`);
  }
  assert.deepEqual(hits, [], "new templates cannot intercept other upstream display text");
});

test("T18 M1: real command-palette environment title stays intact and does not reach t()", () => {
  const expressions: any[] = [];
  traverse(ast(read(TEMP, COMMAND_RESULTS)), { ConditionalExpression(p: any) {
    if (generate(p.node.test).code.includes('startsWith("action:add-project:")') && generate(p.node.consequent).code.includes("props.item.title")) expressions.push(p.node);
  } });
  assert.equal(expressions.length, 4);
  for (const title of ["Projects", "Connect", "Agents", risky]) for (const locale of [null, "en", "zh-CN"] as const) {
    const r = runtime(locale);
    try {
      for (const expr of expressions) assert.equal(evaluate(generate(expr).code, { props: { item: { value: "action:add-project:environment:test", title } }, ...acceptance, ...cleanup }), title);
      assert.deepEqual(r.calls, []);
    } finally { r.restore(); }
  }
});
test("T18 M2: actual permission expressions translate only literal fallbacks", () => {
  for (const file of [PERMISSIONS, SETTINGS]) {
    const original: any[] = [], patched: any[] = [];
    traverse(ast(read(UPSTREAM, file)), { TemplateLiteral(p: any) { if (p.node.quasis[0].value.cooked === "This connection lacks permission to change settings on ") original.push(p.node); } });
    traverse(ast(read(TEMP, file)), { CallExpression(p: any) { if (p.node.callee.name === "fillSlot" && p.node.arguments[0]?.value === "This connection lacks permission to change settings on ") patched.push(p.node); } });
    const variants = [
      { context: null, primaryEnvironment: null, environments: [], environmentId: "env", deniedLabels: [], writableIds: new Set() },
      { context: { connectedEnvironments: [] }, primaryEnvironment: null, environments: [], environmentId: "env", deniedLabels: [], writableIds: new Set() },
      { context: { connectedEnvironments: [{ environmentId: "env", label: "the selected environment" }] }, primaryEnvironment: { label: "the primary environment" }, environments: [{ environmentId: "env", label: "the selected environment" }], environmentId: "env", deniedLabels: ["the selected environment"], writableIds: new Set() },
    ];
    for (let i=0;i<original.length;i++) for (const scope of variants) for (const locale of [null,"en","zh-CN"] as const) {
      const r=runtime(locale);
      try {
        const english=String(evaluate(generate(original[i]).code,scope));
        const fallback = generate(patched[i]).code.includes("translateFixed") && ((file===PERMISSIONS && !scope.primaryEnvironment && !scope.context?.connectedEnvironments.length) || (file===SETTINGS && !scope.environments.length));
        const expected=locale!=="zh-CN" ? english : english.replace("This connection lacks permission to change settings on ","此连接没有更改 ").replace(/\.$/," 上设置的权限。");
        const actual=evaluate(generate(patched[i]).code,{...scope,...helper});
        assert.equal(actual, fallback && locale==="zh-CN" ? expected.replace("the selected environment","所选环境").replace("the primary environment","主环境") : expected);
        assert.ok(r.calls.every(v=> v===`This connection lacks permission to change settings on ${SLOT}.` || v==="the selected environment" || v==="the primary environment"));
      } finally {r.restore();}
    }
  }
});
test("T18 M3: six fixed server update problems and arbitrary outputs in actual final paragraph", () => {
  const source=read(UPSTREAM,"apps/server/src/provider/providerMaintenanceRunner.ts");
  const labels=JSON.parse(fs.readFileSync(path.join(ROOT,"dict/todo/v0.0.46-nightly.20261010.2908.extra.json"),"utf8")).slice(0,6).map((e:any)=>e.key);
  const original=one(UPSTREAM,PROVIDER,c=>c.length===1 && t.isLogicalExpression(c[0]) && generate(c[0]).code==="updateProgress ?? updateProblem");
  const patched=one(TEMP,PROVIDER,c=>c.length===1 && t.isCallExpression(c[0]) && generate(c[0]).code==="displayKnown(updateProgress ?? updateProblem)");
  for(const label of labels) assert.ok(source.includes(JSON.stringify(label)),label+" stays a real fixed server literal");
  for(const value of [...labels,risky,"Running npm install package"]) for(const locale of [null,"en","zh-CN"] as const) {
    const r=runtime(locale);
    try {
      const scope={updateProgress:null,updateProblem:value};
      assert.equal(render(patched,scope),locale==="zh-CN" && labels.includes(value)?dict.messages[value]:render(original,scope));
      assert.deepEqual(r.calls,locale!==null && labels.includes(value)?[value]:[]);
    } finally {r.restore();}
  }
});
test("T18 M4: actual transformed picker shows context-specific labels without changing stored IDs", () => {
  const ctx=createScanContext({root:UPSTREAM});
  const languages=(locale:"en"|"zh-CN"|null)=> {
    const source=read(TEMP,CODE_LANGUAGES);
    const converted=transformCode(source,path.join(UPSTREAM,CODE_LANGUAGES),ctx).output?.code??source;
    const body=stripTypeScriptTypes(converted.replace(/import \{[^}]*\} from ["\']virtual:t3zh-runtime["\'];?/g,"").replace(/export /g,""),{mode:"strip"});
    const translator=createTranslator(dict);
    return new Function("__t3zh_t",body+";return {CODE_BLOCK_LANGUAGES,codeLanguageLabel};")((v:string)=>locale==="zh-CN"?translator(v):v);
  };
  const originalAria=selected(read(UPSTREAM,CODE_PICKER),n=>t.isJSXAttribute(n)&&n.name.name==="aria-label"&&generate(n).code.includes("codeLanguageLabel")).value.expression;
  const patchedAria=selected(read(TEMP,CODE_PICKER),n=>t.isJSXAttribute(n)&&n.name.name==="aria-label"&&generate(n).code.includes("codeLanguageLabel")).value.expression;
  const shown=one(TEMP,CODE_PICKER,c=>c.length===1&&t.isCallExpression(c[0])&&c[0].callee.name==="displayComposerCodeLanguage"&&generate(c[0]).code.includes("entry.id"));
  for(const locale of [null,"en","zh-CN"] as const) {
    const r=runtime(locale);
    try {
      const api=languages(locale), raw=languages("en");
      assert.deepEqual(api.CODE_BLOCK_LANGUAGES.map((e:any)=>e.id),raw.CODE_BLOCK_LANGUAGES.map((e:any)=>e.id));
      for(const language of ["","diff","bash",risky]) {
        const label=api.codeLanguageLabel(language); const entry={id:language,label};
        const expected=locale==="zh-CN"&&language===""?"纯文本":language==="diff"?"Diff":raw.codeLanguageLabel(language);
        assert.equal(render(shown,{entry}),expected);
        const scope={props:{language},current:language,...api,...download};
        assert.equal(evaluate(generate(patchedAria).code,scope),locale==="zh-CN"?`Code language: ${expected}`:evaluate(generate(originalAria).code,{props:{language},...raw}));
      }
      assert.ok(r.calls.every(v=>v==="Code language name: Plain text"));
    } finally {r.restore();}
  }
  assert.equal(read(TEMP,CODE_LANGUAGES),read(UPSTREAM,CODE_LANGUAGES));
  assert.equal(dict.messages["Plain text"],"明文");assert.equal(dict.messages.Diff,"差异");
});


test("T18 PR empty description: translate only the fixed Markdown fallback, preserve arbitrary body", () => {
  const expression = (root: string) => selected(read(root, PR_SUMMARY), n => t.isJSXAttribute(n) && n.name.name === "text" && generate(n).code.includes("detail.body")).value.expression;
  const before = expression(BEFORE), after = expression(TEMP);
  for (const body of ["", "   ", risky, "_No description provided._", "**Projects to start $&**", "中文正文"]) for (const locale of [null, "en", "zh-CN"] as const) {
    const r = runtime(locale);
    try {
      const detail = { body };
      const original = evaluate(generate(before).code, { detail });
      const expected = locale === "zh-CN" && body.trim().length === 0 ? dict.messages["_No description provided._"] : original;
      assert.equal(evaluate(generate(after).code, { detail, ...helper }), expected);
      assert.equal(detail.body, body);
      assert.deepEqual(r.calls, locale !== null && body.trim().length === 0 ? ["_No description provided._"] : []);
    } finally { r.restore(); }
  }
});
