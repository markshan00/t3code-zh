/**
 * T03 审核 r7 的反例回归测试（reviews/T03-r7.md，审核员脚本 /tmp/t3zh-T03-r7/new-counterexamples.mjs），
 * 对应 Kimi 设计评审（reviews/T03-design-kimi.md）第 6 节建议的两个零成本类别封闭 + r7 问题 3。
 *
 * 1. `*.constructor(...)` 调用整体受保护：(/x/).constructor === RegExp，不写出受保护目标的名字就能拿到它，
 *    接收者类型静态不可知，整个类别的实参子树禁转、预扫描收为值用途（reason=constructor-call）。
 * 2. `X.bind.call/apply` 的实参含展开（String.bind.call(...[RegExp], null)）时不再走专用分支，
 *    按 mentionedTargets 保守闭包，子树里点到的 RegExp 照样受保护。
 * 3. apply 的参数数组内部含展开（m.set.apply(m, [...xs, key])）时参数映射记 unknown：
 *    D 类不转，预扫描经 allArgumentNodes 收全部实参。
 * 另含：E3 例外 formatClaudeResumeCompactionQuestion（Kimi 评审第 5 节，双端约定字符串，预防性排除）。
 *
 * 运行：node --test "plugin/__tests__/*.test.ts"（或 npm run test:plugin）
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { stripTypeScriptTypes } from "node:module";

import { collectValueUse, scanModule, type ScanContext, type ValueUseInfo } from "../matcher.ts";
import { transformCode } from "../vite-plugin-t3zh.ts";
import { createTranslator, type T3zhDict } from "../../runtime/t3zh-runtime.ts";

const ZH: T3zhDict = { messages: { "Save changes": "保存更改", Archive: "归档" }, templates: {} };
const translate = createTranslator(ZH);
const t = (value: unknown) => (typeof value === "string" ? translate(value) : value);
const WRAP = `__t3zh_t("Save changes")`;
const FILE = "apps/web/src/r7.ts";

function compileTs(code: string): string {
  const listeners = process.listeners("warning");
  process.removeAllListeners("warning");
  try {
    return stripTypeScriptTypes(code, { mode: "transform" });
  } finally {
    for (const listener of listeners) process.on("warning", listener);
  }
}

/** 只用这段代码自身做预扫描（与审核员脚本相同：反例自身的完整预扫描、空放行表、小词库）。 */
function analyze(code: string, file = FILE) {
  const valueUse = new Map<string, ValueUseInfo>();
  collectValueUse(code, file, file, valueUse);
  const ctx: ScanContext = { valueUse, allowSuspicious: new Set(), dict: ZH };
  const output = transformCode(code, file, ctx).output?.code ?? code;
  const converted = output.replace(`import { __t3zh_t } from "virtual:t3zh-runtime";`, "");
  return { valueUse, converted, candidates: scanModule(code, file, ctx).candidates };
}

/** 执行一段代码，返回 `result`。globalThis/window/self 是同一个替身全局对象。 */
function execute(code: string): unknown {
  const fakeGlobal = { RegExp, Error, String, Number, Map };
  const run = new Function(
    "__t3zh_t", "globalThis", "window", "self",
    `${compileTs(code)}\nreturn result;`,
  );
  return run(t, fakeGlobal, fakeGlobal, fakeGlobal);
}

/** 原代码和中文模式代码的执行结果必须相同。 */
function assertSameBehavior(code: string, converted: string): void {
  const original = execute(code);
  const zh = execute(converted);
  assert.deepEqual(zh, original, `原代码与中文模式代码行为不同\nconverted:\n${converted}`);
}

const ARG = `({label:"Save changes"}).label`;

// ---------------------------------------------------------------------------
// 1. r7 问题 1：*.constructor(...) 不写出 RegExp 名字就能调用它 → 整个类别受保护
// ---------------------------------------------------------------------------

const CONSTRUCTOR_CASES: Array<[name: string, code: string]> = [
  ["regex-literal-ctor", `const result=(/x/).constructor(${ARG}).test("Save changes");`],
  ["regex-literal-ctor-bind-bind", `const result=(/x/).constructor.bind.bind((/x/).constructor,null)()(${ARG}).test("Save changes");`],
  ["regex-literal-ctor-computed", `const result=(/x/)["constructor"](${ARG}).test("Save changes");`],
  ["regex-literal-ctor-new", `const result=new (/x/)["constructor"]("Save changes").test("Save changes");`],
  ["regex-literal-ctor-optional", `const result=(/x/).constructor?.(${ARG}).test("Save changes");`],
  ["string-literal-ctor", `const result=("".constructor(${ARG})).length;`],
  ["number-literal-ctor", `const result=Number.isNaN((1).constructor("Save changes"));`],
  ["variable-ctor", `const r=/x/;const result=r.constructor(${ARG}).test("Save changes");`],
];

for (const [name, code] of CONSTRUCTOR_CASES) {
  test(`r7 constructor 类别 ${name}：不包裹，预扫描收到值，行为一致`, () => {
    const { converted, valueUse, candidates } = analyze(code);
    assert.ok(!converted.includes(WRAP), `不应包裹\n${converted}`);
    assert.ok(valueUse.has("Save changes"), `预扫描应收到值\n${code}`);
    assertSameBehavior(code, converted);
  });
}

test("constructor 类别的 skip 原因是 constructor-call", () => {
  const { candidates } = analyze(`const result=(/x/).constructor(${ARG}).test("Save changes");`);
  const candidate = candidates.find((c) => c.key === "Save changes");
  assert.equal(candidate?.decision, "skip");
  assert.equal(candidate?.reason, "constructor-call");
});

// ---------------------------------------------------------------------------
// 2. r7 问题 2：bind.call/apply 的实参含展开 → mentionedTargets 保守闭包
// ---------------------------------------------------------------------------

const BIND_SPREAD_CASES: Array<[name: string, code: string]> = [
  ["bind-call-spread-recv", `const result=String.bind.call(...[RegExp],null)(${ARG}).test("Save changes");`],
  ["bind-call-empty-spread", `const result=String.bind.call(...[],RegExp,null)(${ARG}).test("Save changes");`],
  ["bind-apply-spread", `const result=String.bind.apply(...[RegExp,[null]])(${ARG}).test("Save changes");`],
  ["bind-call-spread-computed", `const result=String.bind["call"](...[RegExp],null)(${ARG}).test("Save changes");`],
];

for (const [name, code] of BIND_SPREAD_CASES) {
  test(`r7 bind.call/apply 含展开 ${name}：不包裹，预扫描收到值，行为一致`, () => {
    const { converted, valueUse } = analyze(code);
    assert.ok(!converted.includes(WRAP), `不应包裹\n${converted}`);
    assert.ok(valueUse.has("Save changes"), `预扫描应收到值\n${code}`);
    assertSameBehavior(code, converted);
  });
}

// 正向对照：不含展开时专用分支照旧精确解析（String.bind.call(RegExp, null) 实际绑定 RegExp）。
test("对照：bind.call 不含展开时仍按专用分支解析出 RegExp", () => {
  const code = `const result=String.bind.call(RegExp,null)(${ARG}).test("Save changes");`;
  const { converted, valueUse } = analyze(code);
  assert.ok(!converted.includes(WRAP), `不应包裹\n${converted}`);
  assert.ok(valueUse.has("Save changes"), `预扫描应收到值\n${code}`);
  assertSameBehavior(code, converted);
});

// ---------------------------------------------------------------------------
// 3. r7 问题 3：apply 的参数数组内部含展开 → 参数映射 unknown，预扫描全收
// ---------------------------------------------------------------------------

const APPLY_ARRAY_SPREAD_CASES: Array<[name: string, code: string]> = [
  ["apply-empty-spread", `const m=new Map();m.set.apply(m,[...[],"Save changes",1]);const o={label:"Save changes"};const result=m.get(o.label);`],
  ["apply-spread-key", `const m=new Map();m.set.apply(m,[...["Save changes"],1]);const o={label:"Save changes"};const result=m.get(o.label);`],
  ["apply-computed", `const m=new Map();m.set["apply"](m,[...[],"Save changes",1]);const o={label:"Save changes"};const result=m.get(o.label);`],
  ["apply-trailing-spread", `const m=new Map();m.set.apply(m,["Save changes",...[1]]);const o={label:"Save changes"};const result=m.get(o.label);`],
];

for (const [name, code] of APPLY_ARRAY_SPREAD_CASES) {
  test(`r7 apply 数组内部展开 ${name}：不包裹，预扫描收到值，行为一致`, () => {
    const { converted, valueUse } = analyze(code);
    assert.ok(!converted.includes(WRAP), `不应包裹\n${converted}`);
    assert.ok(valueUse.has("Save changes"), `预扫描应收到值\n${code}`);
    assertSameBehavior(code, converted);
  });
}

// 正向对照：apply 数组无展开时照旧按下标映射（首参数记键用途，C 类同文判 suspicious 不转换）。
test("对照：apply 数组无展开时首参数仍记键用途", () => {
  const code = `const m=new Map();m.set.apply(m,["Save changes",1]);const o={label:"Save changes"};const result=m.get(o.label);`;
  const { converted, valueUse } = analyze(code);
  assert.ok(!converted.includes(WRAP), `不应包裹\n${converted}`);
  assert.ok(valueUse.has("Save changes"), `预扫描应收到值\n${code}`);
  assertSameBehavior(code, converted);
});

// ---------------------------------------------------------------------------
// 4. Kimi 评审第 5 节：formatClaudeResumeCompactionQuestion 预防性加入 E3 例外
// ---------------------------------------------------------------------------

test("E3 例外：formatClaudeResumeCompactionQuestion 的 return 不转换（data-function）", () => {
  const code = `function formatClaudeResumeCompactionQuestion(){return "Save changes";} const result=0;`;
  const { converted, candidates } = analyze(code);
  assert.ok(!converted.includes(WRAP), `不应包裹\n${converted}`);
  const candidate = candidates.find((c) => c.key === "Save changes");
  assert.equal(candidate?.decision, "skip");
  assert.equal(candidate?.reason, "data-function");
});

// 对照：其他 format* 函数的 return 照常按 E3 转换。
test("对照：普通 format* 函数的 return 仍按 E3 转换", () => {
  const code = `function formatSomeLabel(){return "Save changes";} const result=0;`;
  const { converted } = analyze(code);
  assert.ok(converted.includes(WRAP), `应包裹\n${converted}`);
});
