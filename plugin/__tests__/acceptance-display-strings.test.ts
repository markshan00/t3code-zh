/** Real 2702 sources + all patches; display output, locale parity and payload isolation. */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { parse } from "@babel/parser";
import { installT3zhRuntime } from "../../runtime/t3zh-runtime.ts";

const root = path.resolve(import.meta.dirname, "../..");
const upstream = process.env.T3ZH_UPSTREAM ?? path.join(root, "upstream");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "t3zh-acceptance-fix-"));
const patches = fs.readdirSync(path.join(root, "patches")).filter(x => x.endsWith(".patch")).sort();
const files = new Set<string>(["apps/web/src/components/settings/KeybindingsSettings.logic.ts"]);
for (const patch of patches) {
  for (const m of fs.readFileSync(path.join(root, "patches", patch), "utf8").matchAll(/^diff --git a\/(.+) b\//gm)) files.add(m[1]);
}
for (const file of files) {
  if (!fs.existsSync(path.join(upstream, file))) continue;
  fs.mkdirSync(path.dirname(path.join(tmp, file)), { recursive: true });
  fs.copyFileSync(path.join(upstream, file), path.join(tmp, file));
}
for (const p of patches) execFileSync("git", ["apply", path.join(root, "patches", p)], { cwd: tmp });
const helperPath = path.join(tmp, "apps/web/src/acceptanceDisplayStrings.ts");
fs.writeFileSync(helperPath, fs.readFileSync(helperPath, "utf8").replace('from "./newThreadDisplayStrings"', 'from "./newThreadDisplayStrings.ts"'));
const h = await import(pathToFileURL(helperPath).href);
const dict = JSON.parse(fs.readFileSync(path.join(root, "dict/zh-CN.json"), "utf8"));
after(() => fs.rmSync(tmp, { recursive: true, force: true }));

function runtime(locale: "en" | "zh-CN" | null) {
  const calls: string[] = [];
  const g = globalThis as any;
  const previous = g.__t3zh;
  const { api } = installT3zhRuntime(dict, { localStorage: { getItem: () => locale, setItem() {} }, navigator: null, systemLanguages: null, document: null, location: null, target: null });
  g.__t3zh = locale === null ? undefined : { ...api, t(value: string) { calls.push(value); return api.t(value); } };
  return { calls, restore: () => { g.__t3zh = previous; } };
}

test("all finite labels have exact Chinese entries; English and unknown values stay intact", () => {
  for (const locale of ["en", "zh-CN", null] as const) {
    const r = runtime(locale);
    try {
      for (const en of h.ACCEPTANCE_DISPLAY_LABELS) {
        assert.ok(dict.messages[en], en);
        assert.notEqual(dict.messages[en], en, en);
        assert.equal(h.displayKnown(en), locale === "zh-CN" ? dict.messages[en] : en, en);
      }
      r.calls.length = 0;
      for (const value of ["feature/foo to main", "Extra High", "My model", "script.custom.run", "Error: bad request", null, undefined, 123, { type: "span" }]) assert.equal(h.displayKnown(value), value);
      assert.deepEqual(r.calls, []);
    } finally { r.restore(); }
  }
});

test("reported dynamic displays: Chinese output and byte-for-byte English/no-runtime parity", () => {
  const cases: [() => string, string, string][] = [
    [() => h.displayFold("Worked for 23s"), "Worked for 23s", "已用时 23 秒"],
    [() => h.displayFold("Worked for 23 秒"), "Worked for 23 秒", "已用时 23 秒"],
    [() => h.displayCount(1, "changed file", "changed files"), "1 changed file", "已更改 1 个文件"],
    [() => h.displayCount(2, "changed file", "changed files"), "2 changed files", "已更改 2 个文件"],
    [() => h.displayCount(8, "model", "models"), "8 models", "8 个模型"],
    [() => h.displayCount(1, "favorite", "favorites"), "1 favorite", "1 个收藏"],
    [() => h.displayCount(2, "favorite", "favorites"), "2 favorites", "2 个收藏"],
    [() => h.displayCount(1, "hidden", "hidden"), "1 hidden", "1 个已隐藏"],
    [() => h.displayRelativeTime("12m ago"), "12m ago", "12 分钟前"],
    [() => h.displayScope("Latest turn"), "Latest turn", "最近一轮"],
    [() => h.displayFailedTool("feature/foo to main"), "feature/foo to main, tool call failed", "feature/foo to main，工具调用失败"],
    [() => h.displayOpenIn("Open in Finder"), "Open in Finder", "在 Finder 中打开"],
    [() => h.displayWorkSummary("已运行 6 条命令 and 已更改 1 个文件"), "已运行 6 条命令 and 已更改 1 个文件", "已运行 6 条命令，已更改 1 个文件"],
    [() => h.displayWorkSummary("已更改 2 个文件 and 已运行 1 条命令"), "已更改 2 个文件 and 已运行 1 条命令", "已更改 2 个文件，已运行 1 条命令"],
    [() => h.displayWorkSummary("Ran 1 command and changed 3 files"), "Ran 1 command and changed 3 files", "已运行 1 条命令，已更改 3 个文件"],
    [() => h.displayTerminalAction("New Terminal (⌘T)"), "New Terminal (⌘T)", "新建终端 (⌘T)"],
  ];
  for (const locale of ["en", "zh-CN", null] as const) {
    const r = runtime(locale);
    try { for (const [fn, en, zh] of cases) assert.equal(fn(), locale === "zh-CN" ? zh : en, `${locale}: ${en}`); }
    finally { r.restore(); }
  }
});

test("follow-up shortcut variants preserve English and never pass dynamic text into translation", () => {
  for (const locale of ["en", "zh-CN", null] as const) {
    const r = runtime(locale);
    try {
      for (const mode of ["enter", "mod-enter", "mod-enter-multiline"]) {
        const modifier = "feature/foo to main";
        const value = h.displayFollowUp(modifier, mode);
        if (locale === "zh-CN") { assert.match(value, /后续消息/); assert.match(value, /相反/); assert.match(value, /回车/); assert.ok(!value.includes("Press")); assert.ok(!value.includes("Enter")); }
        else {
          const suffix = mode === "mod-enter-multiline" ? `Press ${modifier} + Enter for single-line prompts or ${modifier} + Shift + Enter for multiline prompts to do the opposite for one message.` : `Press ${modifier}${mode === "mod-enter" ? " + Shift" : ""} + Enter to do the opposite for one message.`;
          assert.equal(value, "Queue follow-ups while the agent runs or steer the current run. " + suffix);
        }
        assert.ok(value.includes(modifier));
        assert.ok(r.calls.every(call => !call.includes(modifier)));
      }
      for (const value of ["Used Foo and Bar integrations", "Ran git and changed files", "feature/foo to main"]) assert.equal(h.displayWorkSummary(value), value);
    } finally { r.restore(); }
  }
});

test("provider relative times retain English text and translate both ago/just-now branches", () => {
  for (const locale of ["en", "zh-CN", null] as const) {
    const r = runtime(locale);
    try {
      const [a,b] = h.displayCheckedParts("ago");
      assert.equal(a+h.displayDuration("12m")+b, locale === "zh-CN" ? "12 分钟前检查" : "Checked 12m ago");
      const [c,d] = h.displayCheckedParts(null);
      const justNow = c+h.displayDuration("just now")+d;
      if (locale === "zh-CN") assert.equal(justNow, "刚刚检查");
      else assert.equal(justNow, "Checked just now");
    } finally { r.restore(); }
  }
});

test("patches apply cleanly and modified TypeScript parses", () => {
  const patch = ["0009-acceptance-display-strings.patch", "0010-desktop-recheck-display.patch"]
    .map(name => fs.readFileSync(path.join(root, "patches", name), "utf8")).join("\n");
  for (const m of patch.matchAll(/^diff --git a\/(.+) b\//gm)) {
    parse(fs.readFileSync(path.join(tmp,m[1]),"utf8"), { sourceType: "module", plugins: ["typescript","jsx"] });
  }
  // The source IDs used for save/compare/requests remain unchanged.
  const traits = fs.readFileSync(path.join(tmp,"apps/web/src/components/chat/TraitsPicker.tsx"),"utf8");
  assert.ok(traits.includes("displayTraitLabel(option.label)"));
  assert.ok(!traits.includes("displayKnown(option.id)"));
  const keys = fs.readFileSync(path.join(tmp,"apps/web/src/components/settings/KeybindingsSettings.logic.ts"),"utf8");
  assert.equal(keys,fs.readFileSync(path.join(upstream,"apps/web/src/components/settings/KeybindingsSettings.logic.ts"),"utf8"));
});

// Exercise the actual JSX expression at the missed pooled-usage call site, not
// just its helper. This would fail against zh.3 even though displayKnown passed.
function jsxExpression(file: string, contains: string): string {
  const source = fs.readFileSync(path.join(tmp, "apps/web/src", file), "utf8");
  const ast = parse(source, { sourceType: "module", plugins: ["typescript", "jsx"] });
  const matches: string[] = [];
  function visit(node: any) {
    if (!node || typeof node !== "object") return;
    if (node.type === "JSXExpressionContainer") {
      const expression = source.slice(node.expression.start, node.expression.end);
      if (expression.includes(contains)) matches.push(expression);
    }
    for (const [key, child] of Object.entries(node)) {
      if (key === "loc" || key === "extra") continue;
      if (Array.isArray(child)) child.forEach(visit);
      else if (child && typeof child === "object") visit(child);
    }
  }
  visit(ast);
  assert.equal(matches.length, 1, `${file}: ${contains}`);
  return matches[0]!;
}

test("pooled usage render translates built-in periods and preserves override/custom labels", () => {
  const expression = jsxExpression("components/usage/UsageLimitsPooled.tsx", "pool.label");
  const render = new Function("displayKnown", "pool", "label", `return (${expression});`);
  for (const locale of ["en", "zh-CN", null] as const) {
    const r = runtime(locale);
    try {
      for (const label of ["Weekly", "Session", "feature/foo to main"]) {
        assert.equal(render(h.displayKnown, { label }, undefined),
          locale === "zh-CN" ? (dict.messages[label] ?? label) : label);
        assert.equal(render(h.displayKnown, { label: "Weekly" }, label), label);
      }
    } finally { r.restore(); }
  }
});

test("live commands and provider titles keep dynamic values out of translation", () => {
  for (const locale of ["en", "zh-CN", null] as const) {
    const r = runtime(locale);
    try {
      const name = "feature/foo to main";
      for (const verb of ["Running", "Ran", "Failed", "Declined", "Stopped"]) {
        assert.equal(h.displayLiveCommand(verb, name),
          `${locale === "zh-CN" ? dict.messages[verb] : verb} ${name}`);
      }
      assert.equal(h.displayProviderTitle(name), locale === "zh-CN"
        ? `${name} 服务提供方状态` : `${name} provider status`);
      assert.ok(r.calls.every(call => !call.includes(name)));
      assert.equal(h.displayDuration("51m"), locale === "zh-CN" ? "51 分钟" : "51m");
      assert.equal(h.displayDuration("now"), locale === "zh-CN" ? "现在" : "now");
    } finally { r.restore(); }
  }
  const logic = fs.readFileSync(path.join(tmp, "apps/web/src/components/chat/MessagesTimeline.logic.ts"), "utf8");
  assert.ok(logic.indexOf("if (toolPresentation) return toolPresentation.displayName;") < logic.indexOf("return displayCommand(verb,"));
  const view = fs.readFileSync(path.join(tmp, "apps/web/src/components/chat/MessagesTimeline.tsx"), "utf8");
  assert.ok(view.includes("liveWorkEntryLabel(row.entry, ctx.workspaceRoot, row.active, displayLiveCommand)"));
  assert.ok(view.includes('activeItem?.userText ?? displayKnown("User message")'));
});

test("provider/weekday render calls are connected while webhook prompt payload stays original", () => {
  const provider = fs.readFileSync(path.join(tmp, "apps/web/src/components/chat/ProviderStatusBanner.tsx"), "utf8");
  assert.ok(provider.includes("displayProviderTitle(providerName)"));
  assert.ok(provider.includes("{displayKnown(message)}"));
  const scheduled = fs.readFileSync(path.join(tmp, "apps/web/src/components/settings/ScheduledTasksSettings.tsx"), "utf8");
  assert.ok(scheduled.includes("aria-label={displayKnown(WEEKDAY_LABELS[day])}"));
  assert.ok(scheduled.includes("? DEFAULT_WEBHOOK_PROMPT"));
  assert.ok(!scheduled.includes("displayKnown(DEFAULT_WEBHOOK_PROMPT)"));
});

// 0011 (zh.5): provider dismiss label, sidebar row accessible names, "use client" order.
test("provider dismiss label uses one skeleton per state and keeps the provider name out of t()", () => {
  const name = "feature/foo to main";
  const zh: Record<string, string> = {
    ready: `关闭 ${name} 服务提供方提示`,
    warning: `关闭 ${name} 服务提供方警告`,
    error: `关闭 ${name} 服务提供方错误提示`,
  };
  for (const locale of ["en", "zh-CN", null] as const) {
    const r = runtime(locale);
    try {
      for (const state of ["ready", "warning", "error", "disabled", "future-state"]) {
        const english = `Dismiss ${name} provider ${state}`;
        assert.equal(h.displayDismissProvider(name, state), locale === "zh-CN" && zh[state] ? zh[state] : english, `${locale}: ${state}`);
      }
      assert.ok(r.calls.every(call => !call.includes(name) && !call.includes("disabled") && !call.includes("future-state")));
    } finally { r.restore(); }
  }
  const banner = fs.readFileSync(path.join(tmp, "apps/web/src/components/chat/ProviderStatusBanner.tsx"), "utf8");
  assert.ok(banner.includes("aria-label={displayDismissProvider(providerName, status.status)}"));
  assert.ok(!banner.includes("`Dismiss ${providerName} provider ${status.status}`"));
});

test("sidebar row accessible names translate every status label at the call site only", () => {
  const sidebar = fs.readFileSync(path.join(tmp, "apps/web/src/components/Sidebar.tsx"), "utf8");
  assert.ok(sidebar.includes("statusLabel: topStatus ? displayKnown(topStatus.label) : null,"));
  assert.ok(sidebar.includes('statusLabel: displayKnown("Unsent draft"),'));
  // Every label the row status object can produce is in the exact allowlist.
  const start = sidebar.indexOf("const topStatus =");
  const end = sidebar.indexOf("const isWokeStatus", start);
  assert.ok(start > 0 && end > start);
  const labels = new Set<string>();
  for (const m of sidebar.slice(start, end).matchAll(/label:\s*([^,\n]+),/g)) {
    // Drop comparison operands (`=== "active"`); only the produced labels count.
    for (const s of m[1]!.replace(/[!=]==\s*"[^"]*"/g, "").matchAll(/"([^"]+)"/g)) labels.add(s[1]!);
  }
  assert.deepEqual([...labels].sort(), ["Approval", "Done", "Failed", "Goal", "Input", "Limited", "Waiting", "Woke", "Working"]);
  for (const label of [...labels, "Unsent draft"]) assert.ok(h.ACCEPTANCE_DISPLAY_LABELS.includes(label), label);
  // The status object itself stays English (sorting, icons and comparisons use it).
  assert.ok(sidebar.slice(start, end).includes('label: thread.goal?.status === "active" ? "Goal" : "Working"'));
});

test("ProviderInstanceCard keeps the \"use client\" directive first", () => {
  const card = fs.readFileSync(path.join(tmp, "apps/web/src/components/settings/ProviderInstanceCard.tsx"), "utf8");
  assert.ok(card.startsWith('"use client";\n'));
});
