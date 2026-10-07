/**
 * T03 审核 r1 的反例回归测试（reviews/T03-r1.md，审核员脚本 counterexamples.mjs / guards-and-effects.mjs）。
 *
 * 1. 审核员的 78 组判定反例全部照搬，断言每组的决定；其中 E2×as const 一组按 CONVENTIONS §4（e50921a）改为 translate。
 * 2. 逻辑效果：把原代码和「中文模式代码」（转换后、__t3zh_t 用真实中文词库查表）都实际执行，断言程序行为一致。
 *
 * 运行：node --test "plugin/__tests__/*.test.ts"（或 npm run test:plugin）
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { stripTypeScriptTypes } from "node:module";

import { collectValueUse, scanModule, type ScanContext, type ValueUseInfo } from "../matcher.ts";
import { transformCode } from "../vite-plugin-t3zh.ts";
import { createTranslator, type T3zhDict } from "../../runtime/t3zh-runtime.ts";

interface Case {
  name: string;
  code: string;
  key: string;
  expected: "translate" | "skip" | "suspicious" | "absent";
  other?: string;
  templates?: Record<string, string>;
  messages?: Record<string, string>;
  allow?: string[];
}

const cases: Case[] = [];
const add = (name: string, code: string, key: string, expected: Case["expected"], extra: Partial<Case> = {}) =>
  cases.push({ name, code, key, expected, ...extra });

for (const op of ["===", "!==", "==", "!="]) {
  add(`comparison-left-${op}`, `const result = ({label:"Save changes"}).label ${op} value;`, "Save changes", "skip");
  add(`comparison-right-${op}`, `const result = value ${op} ({label:"Save changes"}).label;`, "Save changes", "skip");
}
add("comparison-branches", `const result = (flag ? {label:"Save changes"} : {label:"Archive"}) === obj;`, "Save changes", "skip");
add("switch-case", `switch (value) { case ({label:"Save changes"}).label: break; }`, "Save changes", "skip");
add("switch-body", `switch (value) { case "Mode": const x={label:"Save changes"}; }`, "Save changes", "translate");
add("bare-asconst", `const x=["Save changes"] as const;`, "Save changes", "absent");
add("nonwhite-asconst", `const x={mode:"Save changes"} as const;`, "Save changes", "absent");
add("E1-asconst", `const x=[{label:"Save changes",mode:"Archive"}] as const;`, "Save changes", "translate");
add("E1-value-conflict", `const x=[{label:"Save changes"}] as const;`, "Save changes", "suspicious", { other: `if(value==="Save changes") {}` });
add("E2-value-conflict", `const X_LABELS={a:"Save changes"};`, "Save changes", "suspicious", { other: `if(value==="Save changes") {}` });
add("E3-value-conflict", `function statusLabel(){return "Save changes";}`, "Save changes", "suspicious", { other: `switch(value){case "Save changes":break;}` });
// §4 E2（e50921a）：带 as const 的标签映射表同样按 E2 处理。审核 r1 时的约定下期望是 absent。
add("E2-asconst-authorized", `const X_LABELS={mode:"Save changes"} as const;`, "Save changes", "translate");
add("E2-asconst-other-value-use", `const X_LABELS={mode:"Save changes"} as const;`, "Save changes", "suspicious", { other: `if(value==="Save changes") {}` });
add("object-string-key", `const x={"Save changes":1,label:"Save changes"};`, "Save changes", "suspicious");
add("object-computed-key-literal", `const x={["Save changes"]:1,label:"Save changes"};`, "Save changes", "suspicious");
add("object-computed-key-conditional", `const x={[flag ? "Save changes" : "Archive"]:1,label:"Save changes"};`, "Save changes", "suspicious");
add("object-computed-key-call", `const x={[window.confirm("Save changes")]:1};`, "Save changes", "skip");
add("object-computed-key-object", `const x={[({label:"Save changes"}).label]:1};`, "Save changes", "skip");
add("member-computed-object", `const r=obj[({label:"Save changes"}).label];`, "Save changes", "skip");
add("enum-initializer", `enum X { A=({label:"Save changes"}).label.length }`, "Save changes", "skip");
for (const attr of ["className", "class", "style", "id", "key", "href", "src", "type", "role", "name", "value", "for", "htmlFor", "target", "rel", "data-state"]) {
  add(`forbidden-attr-${attr}`, `const x=<div ${attr}="Save changes"/>;`, "Save changes", "absent");
}
add("forbidden-attr-nested-object", `const x=<div data-state={({label:"Save changes"}).label}/>;`, "Save changes", "skip");
add("forbidden-attr-nested-call", `const x=<div className={window.confirm("Save changes")}/>;`, "Save changes", "skip");
add("forbidden-attr-nested-jsx", `const x=<div key={<span title="Save changes"/>}/>;`, "Save changes", "skip");
add("conditional-A", `const x=<div>{flag ? "Save changes" : "Archive"}</div>;`, "Save changes", "translate");
add("conditional-A-condition", `const x=<div>{"Save changes" && "Archive"}</div>;`, "Save changes", "absent");
add("conditional-B", `const x=<div title={flag ? "Save changes" : "Archive"}/>;`, "Save changes", "translate");
add("conditional-C", `const x={label:flag ? "Save changes" : "Archive"};`, "Save changes", "translate");
add("conditional-D", `window.confirm(flag ? "Save changes" : "Archive");`, "Save changes", "translate");
add("destructuring-default", `function X({label="Save changes"}) {return label;}`, "Save changes", "translate");
add("destructuring-value-conflict", `function X({label="Save changes"}) {return label;}`, "Save changes", "suspicious", { other: `value==="Save changes";` });
add("skip-property", `const x={/* t3zh-skip */ label:"Save changes"};`, "Save changes", "skip");
add("skip-E2", `/* t3zh-skip */ const X_LABELS={a:"Save changes"};`, "Save changes", "skip");
add("skip-E3", `/* t3zh-skip */ function statusLabel(){return "Save changes";}`, "Save changes", "skip");
add("skip-JSX", `const x=<div>{/* t3zh-skip */}<span>Save changes</span></div>;`, "Save changes", "skip");
for (const name of ["formatComposerContextProviderMarker", "formatComposerContextProviderPayload", "formatEnvelopeEntry", "formatDiffReviewRangeLabel", "formatOklchThemeColor", "nextMarkerText"]) {
  add(`data-function-${name}`, `function ${name}(){return "Save changes";}`, "Save changes", "skip");
}
add("non-display-console", `console.log({label:"Save changes"});`, "Save changes", "skip");
add("non-display-error", `new Error({label:"Save changes"});`, "Save changes", "skip");
add("non-display-throw", `throw {label:"Save changes"};`, "Save changes", "skip");
add("tagged-template", 'const x=tag`hello ${({label:"Save changes"}).label}`;', "Save changes", "skip");
add("rpc-input", `const x={input:{label:"Save changes"}};`, "Save changes", "skip");
add("mixed-JSX", `const x=<div>{n} files</div>;`, "files", "skip");
add("template-static", `const x={label:"Rendering diagram"};`, "Rendering diagram", "suspicious", { templates: { "{minutes}m": "{minutes} 分钟" } });
add("template-dynamic", "const x={label:`Push to ${branch}`};", "Push to {0}", "suspicious", { templates: { "{head} to {base}": "{head} 到 {base}" } });
add("template-same-skeleton", "const x={label:`${n} files changed`};", "{0} files changed", "translate", { templates: { "{count} files changed": "已更改 {count} 个文件" } });
add("template-exact-message", `const x={label:"Rendering diagram"};`, "Rendering diagram", "translate", { templates: { "{minutes}m": "{minutes} 分钟" }, messages: { "Rendering diagram": "渲染图表" } });
add("template-allow", `const x={label:"Rendering diagram"};`, "Rendering diagram", "translate", { templates: { "{minutes}m": "{minutes} 分钟" }, allow: ["Rendering diagram"] });
add("skip-cannot-allow", `const x={/* t3zh-skip */label:"Save changes"};`, "Save changes", "skip", { allow: ["Save changes"] });
add("comparison-cannot-allow", `const x=({label:"Save changes"}).label==="Save changes";`, "Save changes", "skip", { allow: ["Save changes"] });
add("E1-hidden-nested-asconst", `const x={label: "Save changes" as const}; const y={label:"Save changes"};`, "Save changes", "suspicious");
add("E1-hidden-value-use-in-call", `const x={label:foo("Save changes")} as const; const y={label:"Save changes"};`, "Save changes", "suspicious");
add("E1-hidden-value-use-in-template", "const x={label:`${foo(\"Save changes\")} now`} as const; const y={label:\"Save changes\"};", "Save changes", "suspicious");
add("E1-hidden-value-use-in-test", `const x={label:pick("Save changes") ? "A" : "B"} as const; const y={label:"Save changes"};`, "Save changes", "suspicious");
add("E2-hidden-value-use-in-call", `const X_LABELS={a:foo("Save changes")} as const; const y={label:"Save changes"};`, "Save changes", "suspicious");
add("conditional-test-nested", `const x={label:({label:"Save changes"}).label.length>5 ? "Archive" : "Close"};`, "Save changes", "skip");
add("logical-left-nested", `const x={label:({label:"Save changes"}).label.length>5 && "Archive"};`, "Save changes", "skip");
add("logical-left-nested-call", `const x=window.confirm("Save changes") && {label:"Archive"};`, "Save changes", "skip");
add("if-test-nested", `if (({label:"Save changes"}).label.length > 5) {}`, "Save changes", "skip");
add("while-test-nested", `while (({label:"Save changes"}).label.length > 50) {}`, "Save changes", "skip");
add("console-computed", `console["log"]({label:"Save changes"});`, "Save changes", "skip");
add("console-computed-template", "console[`warn`]({label:\"Save changes\"});", "Save changes", "skip");
add("console-in-callback", `console.log(items.map(() => ({label:"Save changes"})));`, "Save changes", "skip");
add("ts-type-position", `let x: { label: "Save changes" } = y;`, "Save changes", "absent");

function contextFor(item: Case): ScanContext {
  const valueUse = new Map<string, ValueUseInfo>();
  collectValueUse(item.code, "case.tsx", "case.tsx", valueUse);
  if (item.other) collectValueUse(item.other, "other.ts", "other.ts", valueUse);
  const dict: T3zhDict = {
    messages: { "Save changes": "保存更改", Archive: "归档", ...item.messages },
    templates: item.templates ?? {},
  };
  return { valueUse, allowSuspicious: new Set(item.allow ?? []), dict };
}

test("审核 r1 判定反例：每组的决定符合 §4（含 e50921a 的 E2×as const）", () => {
  const failures: string[] = [];
  for (const item of cases) {
    const ctx = contextFor(item);
    const found = scanModule(item.code, "apps/web/src/case.tsx", ctx).candidates.filter((c) => c.key === item.key);
    const picked = item.name.startsWith("E1-hidden") || item.name.startsWith("E2-hidden") ? found.at(-1) : found[0];
    const actual = picked ? picked.decision : "absent";
    if (actual !== item.expected) {
      failures.push(`${item.name}: expected ${item.expected}, actual ${actual} ${JSON.stringify(found.map((c) => [c.decision, c.reason]))}`);
    }
    // 不转换的反例，转换后的代码里不应出现对该文字的包裹。
    if (item.expected !== "translate") {
      const output = transformCode(item.code, "apps/web/src/case.tsx", ctx).output?.code ?? item.code;
      if (output.includes(`__t3zh_t(${JSON.stringify(item.key)})`)) failures.push(`${item.name}: output wraps the key`);
    }
  }
  assert.deepEqual(failures, []);
  assert.ok(cases.length >= 78, `cases: ${cases.length}`);
});

// ---------------------------------------------------------------------------
// 逻辑效果：执行原代码和中文模式代码，行为必须一致
// ---------------------------------------------------------------------------

const ZH: T3zhDict = { messages: { "Save changes": "保存更改", Archive: "归档" }, templates: {} };

function compileTs(code: string): string {
  // Node 自带的 TS 转换（transform 模式支持 enum）；关掉它的 ExperimentalWarning 输出。
  const listeners = process.listeners("warning");
  process.removeAllListeners("warning");
  try {
    return stripTypeScriptTypes(code, { mode: "transform" });
  } finally {
    for (const listener of listeners) process.on("warning", listener);
  }
}

function runBoth(code: string): { original: unknown; zh: unknown; output: string } {
  const valueUse = new Map<string, ValueUseInfo>();
  collectValueUse(code, "effect.ts", "effect.ts", valueUse);
  const ctx: ScanContext = { valueUse, allowSuspicious: new Set(), dict: ZH };
  const output = transformCode(code, "apps/web/src/effect.ts", ctx).output?.code ?? code;
  const converted = output.replace(`import { __t3zh_t } from "virtual:t3zh-runtime";`, "");
  const translate = createTranslator(ZH);
  const t = (value: unknown) => (typeof value === "string" ? translate(value) : value);
  const exec = (js: string) => new Function("__t3zh_t", "foo", "pick", "obj", `${compileTs(js)}\nreturn result;`)(t, (x: unknown) => x, (x: unknown) => Boolean(x), { "Save changes": 1 });
  return { original: exec(code), zh: exec(converted), output: converted };
}

const effectCases: Record<string, string> = {
  "conditional-test": `const x={label:({label:"Save changes"}).label.length>5 ? "Archive" : "Close"}; const result=x.label === "Archive" || x.label === "归档";`,
  "logical-left": `const x={label:({label:"Save changes"}).label.length>5 && "Archive"}; const result=typeof x.label === "string";`,
  "computed-key": `const x = {[({label:"Save changes"}).label]:1}; const result=Object.keys(x);`,
  "computed-key-prescan": `const flag=true; const x = {[flag ? "Save changes" : "Archive"]:1,label:"Save changes"}; const result=x[x.label];`,
  "member-computed": `const result=obj[({label:"Save changes"}).label];`,
  "E1-value-use-call": `const x={label:foo("Save changes")} as const; const y={label:"Save changes"}; const result=x.label===y.label;`,
  "E2-value-use-call": `const X_LABELS={a:foo("Save changes")} as const; const y={label:"Save changes"}; const result=X_LABELS.a===y.label;`,
  "enum-data": `enum X { A=({label:"Save changes"}).label.length } const result=X.A;`,
  "if-test": `let result=0; if (({label:"Save changes"}).label.length > 5) { result = 1; }`,
  "comparison-in-callback": `const result=[1].some(() => ({label:"Save changes"}).label === "Save changes");`,
};

for (const [name, code] of Object.entries(effectCases)) {
  test(`审核 r1 逻辑效果：${name}——原代码与中文模式代码行为一致`, () => {
    const { original, zh, output } = runBoth(code);
    assert.deepEqual(zh, original, `converted:\n${output}`);
  });
}

test("审核 r1 逻辑效果：结果分支照常翻译，且选中的分支不变", () => {
  const { original, zh } = runBoth(`const x={label:({label:"Save changes"}).label.length>5 ? "Archive" : "Close"}; const result=x.label;`);
  assert.equal(original, "Archive");
  assert.equal(zh, "归档");
});
