/** n2774 display strings: patch 0016 sites, the thread status line templates, English parity and template isolation. */
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
const PATCH_0016 = "0016-n2774-display-strings.patch";
const COMPOSER = "apps/web/src/components/chat/ComposerPrimaryActions.tsx";
const CHAT_COMPOSER = "apps/web/src/components/chat/ChatComposer.tsx";
const CHECKS = "apps/web/src/components/pullRequest/PullRequestChecksPopover.tsx";
const SCRIPTS = "apps/web/src/components/ProjectScriptsControl.tsx";
const CHAT_VIEW = "apps/web/src/components/ChatView.tsx";
const HELPER = "apps/web/src/newThreadDisplayStrings.ts";
const SHARED_SCRIPTS = "packages/shared/src/projectScripts.ts";
const TIMESTAMPS = "apps/web/src/timestampFormat.ts";
const PATCHED_FILES = [COMPOSER, CHECKS, SCRIPTS, CHAT_COMPOSER];
const FILES = [...PATCHED_FILES, CHAT_VIEW, HELPER];

function tree(patches: readonly string[]): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "t3zh-n2774-test-"));
  for (const f of [...FILES, SHARED_SCRIPTS, TIMESTAMPS]) {
    fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true });
    if (fs.existsSync(path.join(UPSTREAM, f))) fs.copyFileSync(path.join(UPSTREAM, f), path.join(dir, f));
  }
  for (const patch of patches) execFileSync("git", ["apply", ...FILES.map(f => `--include=${f}`), path.join(ROOT, "patches", patch)], { cwd: dir });
  return dir;
}
const BEFORE = tree(PATCHES.filter(p => p < PATCH_0016));
const TEMP = tree(PATCHES);
after(() => { for (const dir of [BEFORE, TEMP]) fs.rmSync(dir, { recursive: true, force: true }); });

// Type-only imports are the only imports of these two modules; strip types so Node can load them from the temp tree.
for (const f of [SHARED_SCRIPTS, TIMESTAMPS]) {
  const file = path.join(TEMP, f);
  fs.writeFileSync(file.replace(/\.ts$/, ".mjs"), stripTypeScriptTypes(fs.readFileSync(file, "utf8").replace(/^import \{ type TimestampFormat \} from .*\n/m, "")));
}
const helper = await import(pathToFileURL(path.join(TEMP, HELPER)).href);
const shared = await import(pathToFileURL(path.join(TEMP, SHARED_SCRIPTS.replace(/\.ts$/, ".mjs"))).href);
const timestamps = await import(pathToFileURL(path.join(TEMP, TIMESTAMPS.replace(/\.ts$/, ".mjs"))).href);
const dict = JSON.parse(fs.readFileSync(path.join(ROOT, "dict/zh-CN.json"), "utf8"));
const extra = JSON.parse(fs.readFileSync(path.join(ROOT, "dict/todo/v0.0.46-nightly.20261007.2774.extra.json"), "utf8"));
const SLOT = "";
const risky = "feature/foo to main";
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
  return new Function(...Object.keys(scope), `return (${code});`)(...Object.values(scope));
}
function render(children: any[], scope: Record<string, unknown>): string {
  return children.map(node => {
    const value = evaluate(generate(node).code, { ...scope, ...helper });
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

function collapsedAction(code: string) {
  const initializers: any[] = [];
  const attributes: any[] = [];
  traverse(ast(code), {
    VariableDeclarator(p: any) {
      if (t.isIdentifier(p.node.id, { name: "collapsedComposerPrimaryActionLabel" })) initializers.push(p.node.init);
    },
    JSXAttribute(p: any) {
      if (!t.isJSXIdentifier(p.node.name, { name: "aria-label" }) || !t.isJSXExpressionContainer(p.node.value)) return;
      const expression = p.node.value.expression;
      if (t.isIdentifier(expression, { name: "collapsedComposerPrimaryActionLabel" }) ||
          (t.isCallExpression(expression) && expression.arguments.some(a => t.isIdentifier(a, { name: "collapsedComposerPrimaryActionLabel" })))) {
        attributes.push(expression);
      }
    },
  });
  assert.equal(initializers.length, 1);
  assert.equal(attributes.length, 1);
  return { initializer: generate(initializers[0]).code, attribute: generate(attributes[0]).code };
}

for (const locale of [null, "en", "zh-CN"] as const) {
  test(`I1 真实 ChatComposer aria-label：${locale ?? "无运行时"}，三个固定分支与查表参数`, () => {
    const original = collapsedAction(read(UPSTREAM, CHAT_COMPOSER));
    const patchedCode = read(TEMP, CHAT_COMPOSER);
    const output = transformCode(patchedCode, path.join(UPSTREAM, CHAT_COMPOSER), createScanContext({ root: UPSTREAM })).output;
    assert.ok(output);
    const patched = collapsedAction(patchedCode);
    assert.equal(patched.initializer, original.initializer, "数据定义保持原版");
    assert.equal(patched.attribute, "translateFixed(collapsedComposerPrimaryActionLabel)");
    const cases = [
      { showResumeAction: true, tokens: null, english: "Resume thread", zh: "继续任务" },
      { showResumeAction: true, tokens: 120000, english: "Resume thread", zh: "继续任务" },
      { showResumeAction: false, tokens: 120000, english: "Open composer to compact and send", zh: "打开输入框以压缩并发送" },
      { showResumeAction: false, tokens: null, english: "Send message", zh: "发送消息" },
    ];
    for (const actual of [patched, collapsedAction(output.code)]) {
      for (const c of cases) {
        assert.equal(dict.messages[c.english], c.zh, "每个固定取值必须有精确词条");
        const scope = { showResumeAction: c.showResumeAction, props: { resumeCompactionTokens: c.tokens } };
        const originalLabel = evaluate(original.initializer, scope);
        assert.equal(originalLabel, c.english);
        const originalShown = evaluate(original.attribute, { collapsedComposerPrimaryActionLabel: originalLabel });
        const r = runtime(locale);
        try {
          const label = evaluate(actual.initializer, { ...scope, __t3zh_t: r.t });
          assert.equal(label, originalLabel, "只在最终属性翻译");
          const shown = evaluate(actual.attribute, { ...helper, __t3zh_t: r.t, collapsedComposerPrimaryActionLabel: label });
          assert.equal(shown, locale === "zh-CN" ? c.zh : originalShown);
          assert.deepEqual(r.calls, locale === null ? [] : [c.english], "t() 只收到完整固定文字");
        } finally { r.restore(); }
      }
    }
  });
}

test("0016 JSX sites: English and no-runtime output equal the original element; Chinese inserts dynamic values after translation", () => {
  const cases = [
    { file: COMPOSER, before: textChild("Summarize "), after: fillSlotCall("Summarize "), key: "tokens", values: ["120k", "1.2M", "850", risky],
      skeleton: `Summarize ${SLOT} tokens of history, then send`, zh: (v: string) => `先总结 ${v} 个 Token 的历史，再发送` },
    { file: COMPOSER, before: textChild("Send with full history ("), after: fillSlotCall("Send with full history ("), key: "tokens", values: ["120k", "1.2M", "850", risky],
      skeleton: `Send with full history (${SLOT} tokens)`, zh: (v: string) => `保留完整历史发送（${v} 个 Token）` },
    { file: CHECKS, before: textChild(" failed"), after: (c: any[]) => c.length === 1 && t.isCallExpression(c[0]) && generate(c[0]).code === 'fillSlot("", String(failedCount), " failed")', key: "failedCount", values: [1, 3, 12],
      skeleton: `${SLOT} failed`, zh: (v: string) => `${v} 项失败` },
  ];
  for (const c of cases) {
    const before = one(BEFORE, c.file, c.before);
    const patched = one(TEMP, c.file, c.after);
    for (const value of c.values) {
      const original = render(before, { [c.key]: value });
      for (const locale of [null, "en", "zh-CN"] as const) {
        const r = runtime(locale);
        try {
          assert.equal(render(patched, { [c.key]: value }), locale === "zh-CN" ? c.zh(String(value)) : original);
          assert.deepEqual(r.calls, locale === null ? [] : [c.skeleton]);
        } finally { r.restore(); }
      }
    }
  }
});

test("project action menu names: finite role suffixes translate, script names never reach t()", () => {
  let found: any = null;
  traverse(ast(read(TEMP, SCRIPTS)), { FunctionDeclaration(p: any) { if (p.node.id?.name === "displayScriptMenuName") found = p.node; } });
  assert.ok(found);
  const js = stripTypeScriptTypes(generate(found).code).replace(/^function displayScriptMenuName/, "function");
  const fn = (script: object) => evaluate(`(${js})(script)`, { script, projectScriptMenuLabel: shared.projectScriptMenuLabel, fillSlot: helper.fillSlot });
  const cases = [
    { script: { name: "Dev", runOnWorktreeCreate: false }, zh: "Dev", calls: [] },
    { script: { name: "Install", runOnWorktreeCreate: true }, zh: "Install（初始化）", calls: [`${SLOT} (setup)`] },
    { script: { name: "Clean", runOnWorktreeCreate: false, runOnSettle: true }, zh: "Clean（收起时）", calls: [`${SLOT} (on settle)`] },
    { script: { name: "Bootstrap", runOnWorktreeCreate: true, runOnSettle: true }, zh: "Bootstrap（初始化、收起时）", calls: [`${SLOT} (setup, on settle)`] },
    { script: { name: risky, runOnWorktreeCreate: true }, zh: `${risky}（初始化）`, calls: [`${SLOT} (setup)`] },
    { script: { name: "No project (setup)", runOnWorktreeCreate: false, runOnSettle: true }, zh: "No project (setup)（收起时）", calls: [`${SLOT} (on settle)`] },
  ];
  for (const c of cases) {
    for (const locale of [null, "en", "zh-CN"] as const) {
      const r = runtime(locale);
      try {
        assert.equal(fn(c.script), locale === "zh-CN" ? c.zh : shared.projectScriptMenuLabel(c.script));
        assert.deepEqual(r.calls, locale === null ? [] : c.calls);
      } finally { r.restore(); }
    }
  }
  assert.equal(read(BEFORE, SCRIPTS).split("{projectScriptMenuLabel(script)}").length, 2);
  assert.equal(read(TEMP, SCRIPTS).split("{displayScriptMenuName(script)}").length, 2);
  assert.ok(!read(TEMP, SCRIPTS).includes("{projectScriptMenuLabel(script)}"));
});

test("thread status line: the plugin wraps each label and every formatter output becomes whole Chinese", () => {
  const ctx = createScanContext({ root: UPSTREAM });
  const output = transformCode(read(TEMP, CHAT_VIEW), path.join(UPSTREAM, CHAT_VIEW), ctx).output;
  assert.ok(output);
  const attrs: Record<string, string[]> = {};
  traverse(ast(output.code), {
    JSXOpeningElement(p: any) {
      if (!t.isJSXIdentifier(p.node.name, { name: "ThreadStatusLine" })) return;
      for (const a of p.node.attributes) {
        if (!t.isJSXAttribute(a) || !["label", "actionLabel"].includes(a.name.name)) continue;
        const code = t.isStringLiteral(a.value) ? JSON.stringify(a.value.value) : generate(a.value.expression).code;
        (attrs[a.name.name] ??= []).push(code);
      }
    },
  });
  assert.equal(attrs.label?.length, 3);
  for (const code of [...attrs.label!, ...attrs.actionLabel!]) assert.match(code, /__t3zh_t\(/, code);
  // The formatters behind these labels are not wrapped, so the label template sees the English time.
  const ranges: [number, number][] = [];
  traverse(ast(read(UPSTREAM, TIMESTAMPS)), {
    FunctionDeclaration(p: any) {
      if (["formatRelativeTime", "formatRelativeTimeLabel", "formatRelativeTimeUntil", "formatRelativeTimeUntilLabel"].includes(p.node.id?.name)) ranges.push([p.node.loc.start.line, p.node.loc.end.line]);
    },
  });
  assert.equal(ranges.length, 4);
  const formatterCandidates = scanModule(read(UPSTREAM, TIMESTAMPS), path.join(UPSTREAM, TIMESTAMPS), ctx).candidates;
  assert.deepEqual(formatterCandidates.filter(c => c.decision === "translate" && ranges.some(([a, b]) => c.line >= a && c.line <= b)), []);

  const now = Date.now();
  const iso = (ms: number) => new Date(now + ms).toISOString();
  const S = 1000, M = 60 * S, H = 60 * M, D = 24 * H;
  const snoozed = [
    [iso(30 * S + 500), "已暂缓，30 秒后唤醒"], [iso(2 * S), "已暂缓，即将唤醒"], [iso(5 * M + 30 * S), "已暂缓，5 分钟后唤醒"],
    [iso(3 * H + 30 * M), "已暂缓，3 小时后唤醒"], [iso(2 * D + 3 * H), "已暂缓，2 天后唤醒"], [iso(-M), "已暂缓，已到唤醒时间"], [null, "已暂缓"],
  ] as const;
  const settled = [
    [iso(-10 * S), "刚刚收起"], [iso(-5 * M - 30 * S), "5 分钟前收起"], [iso(-3 * H - 30 * M), "3 小时前收起"], [iso(-2 * D - 3 * H), "2 天前收起"], [null, "已收起"],
  ] as const;
  const scopeFor = (shell: object) => ({ activeThreadShell: shell, formatRelativeTimeUntilLabel: timestamps.formatRelativeTimeUntilLabel, formatRelativeTimeLabel: timestamps.formatRelativeTimeLabel });
  for (const [codeIndex, field, rows] of [[0, "snoozedUntil", snoozed], [1, "settledAt", settled]] as const) {
    for (const [value, zh] of rows) {
      const shell = { [field]: value };
      const english = evaluate(attrs.label![codeIndex]!, { ...scopeFor(shell), __t3zh_t: (x: unknown) => x });
      for (const locale of ["en", "zh-CN"] as const) {
        const r = runtime(locale);
        try {
          const shown = evaluate(attrs.label![codeIndex]!, { ...scopeFor(shell), __t3zh_t: r.t });
          assert.equal(shown, locale === "zh-CN" ? zh : english, `${field}=${value}`);
          if (locale === "zh-CN") assert.doesNotMatch(String(shown), /[A-Za-z]/);
        } finally { r.restore(); }
      }
    }
  }
  const r = runtime("zh-CN");
  try {
    assert.equal(evaluate(attrs.label![2]!, { __t3zh_t: r.t }), "已从暂缓中唤醒");
    assert.deepEqual(attrs.actionLabel!.map(code => evaluate(code.replace(/isUnsnoozing|isUnsettling/g, "false"), { __t3zh_t: r.t })), ["立即唤醒", "恢复任务", "关闭"]);
    assert.deepEqual(attrs.actionLabel!.slice(0, 2).map(code => evaluate(code.replace(/isUnsnoozing|isUnsettling/g, "true"), { __t3zh_t: r.t })), ["正在唤醒...", "正在恢复..."]);
  } finally { r.restore(); }
});

test("n2774 templates match their own skeletons and cannot intercept unrelated upstream display candidates", () => {
  const translate = createTranslator(dict);
  const templates = new Set<string>(extra.filter((e: any) => e.section === "templates").map((e: any) => e.key));
  for (const key of templates) assert.equal(translate.matchTemplate(key.replace("{0}", SLOT))?.key, key, key);
  for (const e of extra.filter((e: any) => e.zh)) assert.equal(dict[e.section][e.key], e.zh, e.key);
  const skips = JSON.parse(fs.readFileSync(path.join(ROOT, "dict/todo-skip.json"), "utf8"));
  for (const e of extra.filter((e: any) => e.skip)) assert.ok(skips.some((x: any) => x.key === e.key && x.reason === e.skip), e.key);
  const ctx = createScanContext({ root: UPSTREAM });
  const hits: string[] = [];
  let total = 0;
  for (const file of listScopeFiles(UPSTREAM)) {
    for (const c of scanModule(read(UPSTREAM, path.relative(UPSTREAM, file)), file, ctx).candidates) {
      if (c.decision !== "translate") continue;
      total += 1;
      if (translate.lookupMessage(c.text) !== undefined) continue;
      const key = translate.matchTemplate(c.text)?.key;
      if (key && templates.has(key)) hits.push(`${path.relative(UPSTREAM, file)}:${c.line} ${c.text}`);
    }
  }
  assert.ok(total > 5000, `translate candidates: ${total}`);
  assert.deepEqual(hits, []);
});

test("0016 only removes the expected mixed-jsx skips; no new candidates or value-use literals", () => {
  const ctx = createScanContext({ root: UPSTREAM });
  const summary = (root: string, file: string) =>
    scanModule(read(root, file), path.join(UPSTREAM, file), ctx).candidates.map(c => `${c.text}|${c.category}|${c.decision}|${c.reason}`).sort();
  const removedExpected: Record<string, string[]> = {
    [COMPOSER]: ["Summarize |A|skip|mixed-jsx", " tokens of history, then send|A|skip|mixed-jsx", "Send with full history (|A|skip|mixed-jsx", " tokens)|A|skip|mixed-jsx"],
    [CHECKS]: [" failed|A|skip|mixed-jsx"],
    [SCRIPTS]: [],
    [CHAT_COMPOSER]: [],
  };
  for (const file of PATCHED_FILES) {
    const before = summary(BEFORE, file);
    const patched = summary(TEMP, file);
    assert.deepEqual(patched.filter(c => !before.includes(c)), [], `${file}: no new candidates`);
    assert.deepEqual(before.filter(c => !patched.includes(c)).sort(), [...removedExpected[file]!].sort(), file);
  }
  const collect = (root: string) => {
    const map = new Map<string, ValueUseInfo>();
    for (const file of PATCHED_FILES) collectValueUse(read(root, file), file, file, map);
    return new Set(map.keys());
  };
  const previous = collect(BEFORE);
  assert.deepEqual([...collect(TEMP)].filter(text => !previous.has(text)), []);
});
