/** n2761 real display expressions: English parity, finite permission errors and dynamic value isolation. */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { parse } from "@babel/parser";
import babelTraverse from "@babel/traverse";
import babelGenerator from "@babel/generator";
import * as t from "@babel/types";
import { createTranslator, installT3zhRuntime } from "../../runtime/t3zh-runtime.ts";
import { createScanContext, listScopeFiles, scanModule } from "../matcher.ts";

const traverse = (babelTraverse as any).default ?? babelTraverse;
const generate = (babelGenerator as any).default ?? babelGenerator;
const ROOT = path.resolve(import.meta.dirname, "../..");
const UPSTREAM = path.resolve(process.env.T3ZH_UPSTREAM ?? path.join(ROOT, "upstream"));
const TEMP = fs.mkdtempSync(path.join(os.tmpdir(), "t3zh-n2761-test-"));
after(() => fs.rmSync(TEMP, { recursive: true, force: true }));
const FILES = [
  "browser/ServerBrowserSurface.tsx", "components/auth/ConnectAgentSurface.tsx",
  "components/settings/GitHubAccountSettings.tsx", "components/settings/IntegrationsSettings.tsx",
  "components/ChatView.tsx", "components/projectScriptEditor.tsx", "components/GitActionsControl.tsx",
  "sourceControlPresentation.ts", "newThreadDisplayStrings.ts", "connectionPermissionDisplayStrings.ts",
  "components/chat/ComposerPrimaryActions.tsx", "components/chat/ContextWindowMeter.tsx",
  "components/onboarding/WelcomeWizard.tsx", "components/settings/ProjectSettingsPanel.tsx",
  "components/settings/settingsLayout.tsx", "hooks/useSettings.ts", "components/CommandPalette.tsx",
  "components/files/FileBrowserPanel.tsx", "components/search/ProjectContentSearchDialog.tsx", "components/chat/ChatComposer.tsx", "acceptanceDisplayStrings.ts",
].map(f => `apps/web/src/${f}`);
for (const f of FILES) {
  fs.mkdirSync(path.dirname(path.join(TEMP, f)), { recursive: true });
  if (fs.existsSync(path.join(UPSTREAM, f))) fs.copyFileSync(path.join(UPSTREAM, f), path.join(TEMP, f));
}
for (const patch of fs.readdirSync(path.join(ROOT, "patches")).filter(p => p.endsWith(".patch")).sort()) {
  execFileSync("git", ["apply", ...FILES.map(f => `--include=${f}`), path.join(ROOT, "patches", patch)], { cwd: TEMP });
}
const helper = await import(pathToFileURL(path.join(TEMP, FILES[8])).href);
const permission = await import(pathToFileURL(path.join(TEMP, FILES[9])).href);
const acceptancePath = path.join(TEMP, FILES[20]);
fs.writeFileSync(acceptancePath, fs.readFileSync(acceptancePath, "utf8").replace('from "./newThreadDisplayStrings"', 'from "./newThreadDisplayStrings.ts"'));
const acceptance = await import(pathToFileURL(acceptancePath).href);
const dict = JSON.parse(fs.readFileSync(path.join(ROOT, "dict/zh-CN.json"), "utf8"));
const SLOT = "\uE000";
const risky = "feature/foo to main";
const read = (root: string, f: string) => fs.readFileSync(path.join(root, f), "utf8");
function elements(root: string, file: string): any[][] {
  const result: any[][] = [];
  traverse(parse(read(root, file), { sourceType: "module", plugins: ["typescript", "jsx"] }), {
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
function render(children: any[], scope: Record<string, unknown>): string {
  const bindings = { ...scope, ...helper, ...permission, ...acceptance };
  return children.map(node => {
    const value = new Function(...Object.keys(bindings), `return (${generate(node).code});`)(...Object.values(bindings));
    return value == null || typeof value === "boolean" ? "" : String(value);
  }).join("");
}
function runtime(locale: "en" | "zh-CN" | null) {
  const previous = globalThis.__t3zh;
  const calls: string[] = [];
  if (locale === null) globalThis.__t3zh = undefined;
  else {
    const installed = installT3zhRuntime(dict, { localStorage: { getItem: () => locale, setItem() {} }, navigator: null, systemLanguages: null, document: null, location: null, target: null });
    globalThis.__t3zh = { ...installed.api, t(value: string) { calls.push(value); return installed.api.t(value); } };
  }
  return { calls, restore() { globalThis.__t3zh = previous; } };
}

test("real JSX display expressions preserve original English and never translate dynamic data", () => {
  const cases = [
    { file: FILES[0], text: "The page asks for ", call: 'translateFixed(fileChooser.multiple ? "The page asks', scope: { fileChooser: { multiple: true } }, en: "The page asks for files.", zh: "网页要求选择多个文件。", calls: ["The page asks for files."] },
    { file: FILES[0], text: "The page asks for ", call: 'translateFixed(fileChooser.multiple ? "The page asks', scope: { fileChooser: { multiple: false } }, en: "The page asks for a file.", zh: "网页要求选择一个文件。", calls: ["The page asks for a file."] },
    { file: FILES[0], text: "Choose ", call: 'translateFixed(fileChooser.multiple ? "Choose', scope: { fileChooser: { multiple: true } }, en: "Choose files", zh: "选择文件", calls: ["Choose files"] },
    { file: FILES[0], text: "Choose ", call: 'translateFixed(fileChooser.multiple ? "Choose', scope: { fileChooser: { multiple: false } }, en: "Choose file", zh: "选择文件", calls: ["Choose file"] },
    { file: FILES[1], text: "The name is chosen by the agent. Approval returns to ", call: 'fillSlot("The name is chosen', scope: { details: { redirectHost: risky } }, en: `The name is chosen by the agent. Approval returns to ${risky} on the computer that opened this page. Only approve a sign-in you just started.`, zh: `该名称由 Agent 自行选择。批准结果将返回打开此页面的设备上的 ${risky}。仅批准你刚刚发起的登录。`, calls: [`The name is chosen by the agent. Approval returns to ${SLOT} on the computer that opened this page. Only approve a sign-in you just started.`] },
    { file: FILES[2], text: "can't be used: ", call: 'fillSlot("can\'t be used:', scope: { entry: { error: risky } }, en: `can't be used: ${risky}`, zh: `无法使用：${risky}`, calls: [`can't be used: ${SLOT}`] },
    { file: FILES[2], text: "can't be used: ", call: 'fillSlot("can\'t be used:', scope: { entry: { error: null } }, en: "can't be used: gh reports this login as invalid.", zh: "无法使用：gh 提示该登录账户无效。", calls: ["gh reports this login as invalid.", `can't be used: ${SLOT}`] },
    { file: FILES[2], text: " is set on the server, so it overrides the account chosen here until it is unset.", call: 'fillSlot("", group.environmentVariable', scope: { group: { environmentVariable: "GH_TOKEN" } }, en: "GH_TOKEN is set on the server, so it overrides the account chosen here until it is unset.", zh: "服务器已设置 GH_TOKEN；在取消该设置前，它将覆盖此处选择的账户。", calls: [`${SLOT} is set on the server, so it overrides the account chosen here until it is unset.`] },
    { file: FILES[3], text: "Clear “", call: 'fillSlot("Clear', scope: { profilePendingClear: { name: risky } }, en: `Clear “${risky}”’s cookies and cache?`, zh: `清除“${risky}”的 Cookie 和缓存？`, calls: [`Clear “${SLOT}”’s cookies and cache?`] },
    { file: FILES[3], text: "Clear “", call: 'fillSlot("Clear', scope: { profilePendingClear: null }, en: "Clear “”’s cookies and cache?", zh: "清除“”的 Cookie 和缓存？", calls: [`Clear “${SLOT}”’s cookies and cache?`] },
  ];
  for (const c of cases) {
    const before = one(UPSTREAM, c.file, children => children.every(n => !t.isJSXElement(n) && !t.isJSXFragment(n)) && children.some(n => t.isStringLiteral(n) && n.value === c.text));
    const after = one(TEMP, c.file, children => children.length === 1 && t.isCallExpression(children[0]) && generate(children[0]).code.includes(c.call));
    assert.equal(render(before, c.scope), c.en);
    for (const locale of [null, "en", "zh-CN"] as const) {
      const r = runtime(locale);
      try {
        assert.equal(render(after, c.scope), locale === "zh-CN" ? c.zh : c.en);
        if (locale === "zh-CN") assert.deepEqual(r.calls, c.calls);
      } finally { r.restore(); }
    }
  }
});

test("only exact permission messages translate; raw errors and state definitions stay English", () => {
  const known = ["This connection cannot change threads.", "This connection cannot change keyboard shortcuts.", "This connection cannot import projects or thread history.", "This connection cannot browse host folders.", "This connection cannot search host files.", "This connection cannot read host files.", "This connection cannot upload attachments."];
  for (const locale of [null, "en", "zh-CN"] as const) {
    const r = runtime(locale);
    try {
      for (const value of [...known, risky, "Failed to connect to service", "This connection cannot change threads. Extra detail", "", null, undefined]) {
        const actual = permission.displayConnectionPermissionError(value);
        assert.equal(actual, locale === "zh-CN" && known.includes(value as string) ? dict.messages[value as string] : value);
      }
      assert.deepEqual(r.calls, locale ? known : []);
    } finally { r.restore(); }
  }
  assert.ok(read(TEMP, FILES[4]).includes('error={displayConnectionPermissionError(timelineThreadError)}'));
  assert.ok(read(TEMP, FILES[5]).includes('{displayConnectionPermissionError(validationError)}'));
  assert.ok(read(TEMP, FILES[4]).includes('"This connection cannot change threads."'));
  assert.ok(read(TEMP, FILES[5]).includes('setValidationError("This connection cannot change keyboard shortcuts.")'));
  // n2774: upstream removed ChatView's resume-compaction banner, the only ChatView site that showed compactDisabledReason.
  assert.equal(elements(TEMP, FILES[4]).filter(c => c.some(n => t.isIdentifier(n, { name: "compactDisabledReason" }))).length, 0);
  for (const [file, variable] of [[FILES[10], "submitTooltip"], [FILES[11], "compactDisabledReason"], [FILES[12], "visibleImportError"], [FILES[16], "browseAccessError"]]) {
    const expected = variable === "submitTooltip" ? `displayRunningSendTooltip(displayConnectionPermissionError(${variable}), followUpBehavior, alternateAction, alternateShortcutLabel)` : `displayConnectionPermissionError(${variable})`;
    const children = one(TEMP, file, c => c.length === 1 && t.isCallExpression(c[0]) && generate(c[0]).code === expected);
    for (const value of [...known, risky]) {
      const r = runtime("zh-CN");
      try { assert.equal(render(children, { [variable]: value, followUpBehavior: "steer", alternateAction: "queue", alternateShortcutLabel: "" }), known.includes(value) ? dict.messages[value] : value); }
      finally { r.restore(); }
    }
  }
  assert.ok(read(TEMP, FILES[12]).includes('const IMPORT_PERMISSION_MESSAGE = "This connection cannot import projects or thread history."'));
  for (const [file, expr, count] of [[FILES[18], "search.error", 1], [FILES[19], "upload.reason", 3]] as const) {
    const children = elements(TEMP, file).filter(c => c.length === 1 && t.isCallExpression(c[0]) && generate(c[0]).code === `displayConnectionPermissionError(${expr})`);
    assert.equal(children.length, count);
    for (const c of children) {
      const r = runtime("zh-CN");
      try { assert.equal(render(c, { search: { error: risky }, upload: { reason: risky } }), risky); assert.deepEqual(r.calls, []); }
      finally { r.restore(); }
    }
  }
  for (const [file, key] of [[FILES[14], "This connection does not have permission to change environment settings."], [FILES[15], "This connection does not have permission to change these settings."]]) {
    assert.ok(read(TEMP, file).includes(`? translateFixed("${key}")`));
    const r = runtime("zh-CN");
    try { assert.equal(helper.translateFixed(key), dict.messages[key]); assert.deepEqual(r.calls, [key]); }
    finally { r.restore(); }
  }
});

test("file retry message keeps raw errors and translates only known permission text and retry suffix", () => {
  const before = one(UPSTREAM, FILES[17], c => c.some(n => t.isStringLiteral(n) && n.value === " Click to retry."));
  const after = one(TEMP, FILES[17], c => c.length === 3 && t.isCallExpression(c[0]) && generate(c[0]).code === "displayConnectionPermissionError(error ?? pathSearch.error)");
  for (const error of [risky, "This connection cannot read host files.", null]) {
    const scope = { error, pathSearch: { error: "This connection cannot search host files." } };
    const value = error ?? scope.pathSearch.error;
    assert.equal(render(before, scope), `${value} Click to retry.`);
    for (const locale of [null, "en", "zh-CN"] as const) {
      const r = runtime(locale);
      try { assert.equal(render(after, scope), locale === "zh-CN" ? `${dict.messages[value] ?? value} ${dict.messages["Click to retry."]}` : `${value} Click to retry.`); }
      finally { r.restore(); }
    }
  }
});

test("project permission toast translates its display skeleton while the Error and environment name stay original", () => {
  const ast = parse(read(TEMP, FILES[13]), { sourceType: "module", plugins: ["typescript", "jsx"] });
  const descriptions: any[] = [];
  traverse(ast, { CallExpression(p: any) { if (t.isIdentifier(p.node.callee, { name: "reportFailure" }) && p.node.arguments.length === 3) descriptions.push(p.node.arguments[2]); } });
  assert.equal(descriptions.length, 1);
  for (const name of [risky, "No project", null, ""]) {
    for (const locale of [null, "en", "zh-CN"] as const) {
      const r = runtime(locale);
      try {
        const display = render(descriptions, { denied: { environmentLabel: name } });
        const value = name ?? (locale === "zh-CN" ? "此环境" : "this environment");
        assert.equal(display, locale === "zh-CN" ? `此连接无权修改 ${value} 中的项目。` : `This connection cannot change projects in ${value}.`);
        if (locale === "zh-CN") assert.deepEqual(r.calls, [...(name === null ? ["this environment"] : []), `This connection cannot change projects in ${SLOT}.`]);
      } finally { r.restore(); }
    }
  }
  assert.ok(read(TEMP, FILES[13]).includes('`This connection cannot change projects in ${denied.environmentLabel ?? "this environment"}.`'));
  assert.ok(read(TEMP, FILES[13]).includes('displayDescription ?? (error instanceof Error ? error.message : "An error occurred.")'));
});

test("Git permission display branch uses a precise dictionary entry; gh account identity stays untouched", () => {
  const ast = parse(read(TEMP, FILES[6]), { sourceType: "module", plugins: ["typescript", "jsx"] });
  let permissionBranch: any;
  traverse(ast, { VariableDeclarator(p: any) { if (p.node.id.name === "quickActionDisabledReason") permissionBranch = p.node.init.consequent; } });
  assert.ok(t.isCallExpression(permissionBranch));
  assert.equal(permissionBranch.arguments[0].value, "This connection cannot change source control.");
  const translate = createTranslator(dict);
  assert.equal(translate(permissionBranch.arguments[0].value), "此连接无权修改源代码管理。");
  assert.equal(elements(TEMP, FILES[2]).filter(c => c.some(n => t.isCallExpression(n) && t.isIdentifier(n.callee, { name: "translateFixed" }) && n.arguments[0]?.value === "Active gh account")).length, 2);
  assert.ok(read(TEMP, FILES[2]).includes('const ACTIVE_ACCOUNT = "active gh account"'));
  assert.ok(read(TEMP, FILES[2]).includes('account={group.activeAccount}'));
});

test("new slot templates cannot intercept unrelated upstream display candidates", () => {
  const todo = JSON.parse(fs.readFileSync(path.join(ROOT, "dict/todo/v0.0.46-nightly.20261007.2761.extra.json"), "utf8"));
  const templates = new Set(todo.filter((e: any) => e.section === "templates").map((e: any) => e.key));
  const translate = createTranslator(dict);
  for (const key of templates as Set<string>) assert.equal(translate.matchTemplate(key.replace("{0}", SLOT))?.key, key);
  const ctx = createScanContext({ root: UPSTREAM });
  const hits: string[] = [];
  for (const file of listScopeFiles(UPSTREAM)) {
    for (const c of scanModule(read(UPSTREAM, path.relative(UPSTREAM, file)), file, ctx).candidates) {
      if (c.decision !== "translate" || translate.lookupMessage(c.text) !== undefined) continue;
      const key = translate.matchTemplate(c.text)?.key;
      if (key && templates.has(key)) hits.push(`${file}:${c.line} ${c.text}`);
    }
  }
  assert.deepEqual(hits, []);
});
