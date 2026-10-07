/**
 * T03 审核 r4 的反例回归测试（reviews/T03-r4.md，审核员脚本 /tmp/t3zh-T03-r4/compositions.mjs、error-names.mjs），
 * 以及 bind/call/apply 任意层组合的生成矩阵（CONVENTIONS §4「受保护的语法形式」：.call/.apply/.bind 作用在受保护目标上）。
 *
 * 1. r4 的 36 组 bind 组合 + 6 组错误类名原样照搬：原代码和「中文模式代码」都实际执行，结果和 console 参数必须一致，且不包裹。
 * 2. 生成矩阵：受保护目标 × 多层 bind/call/apply 与逗号、条件、可选链、TS 断言的组合，断言不包裹、预扫描收到值、行为一致。
 * 3. 对照组：显示函数（setError）经同样的组合仍按 D 类转换。
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
const FILE = "apps/web/src/r4.ts";

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

/** 只用这段代码自身做预扫描（与审核员脚本相同：反例自身的完整预扫描、空放行表、小词库）。 */
function analyze(code: string, file = FILE) {
  const valueUse = new Map<string, ValueUseInfo>();
  collectValueUse(code, file, file, valueUse);
  const ctx: ScanContext = { valueUse, allowSuspicious: new Set(), dict: ZH };
  const output = transformCode(code, file, ctx).output?.code ?? code;
  const converted = output.replace(`import { __t3zh_t } from "virtual:t3zh-runtime";`, "");
  return { valueUse, converted, candidates: scanModule(code, file, ctx).candidates };
}

/** 执行一段代码，返回 `result` 和替身 console 收到的全部参数。globalThis/window/self 是同一个替身全局对象。 */
function execute(code: string): { result: unknown; logs: unknown[][] } {
  const logs: unknown[][] = [];
  const fakeConsole = { log: (...args: unknown[]) => logs.push(["log", ...args]), warn: (...args: unknown[]) => logs.push(["warn", ...args]) };
  const cn = (...args: unknown[]) => args.join(" ");
  const noop = function noop() {};
  const fakeGlobal = { console: fakeConsole, Error, TypeError, DOMException, RegExp, cn, noop };
  const tag = (strings: TemplateStringsArray, ...args: unknown[]) => String.raw({ raw: strings }, ...args);
  const run = new Function(
    "__t3zh_t", "console", "flag", "cn", "noop", "method", "tag", "globalThis", "window", "self",
    `${compileTs(code)}\nreturn result;`,
  );
  const result = run(t, fakeConsole, true, cn, noop, "log", tag, fakeGlobal, fakeGlobal, fakeGlobal);
  return { result, logs };
}

/** 原代码和中文模式代码的执行结果（结果与 console 参数）必须相同。 */
function assertSameBehavior(code: string, converted: string): void {
  const original = execute(code);
  const zh = execute(converted);
  assert.deepEqual(zh, original, `原代码与中文模式代码行为不同\nconverted:\n${converted}`);
}

// ---------------------------------------------------------------------------
// 1. 审核 r4 的反例（compositions 36 组 + error-names 6 组，原样照搬）
// ---------------------------------------------------------------------------

const r4Cases: Array<[name: string, code: string]> = [
["console.log-bind-call", "console.log.bind(null).call(null, ({label:\"Save changes\"}).label); const result=0;"],
["console.log-bind-apply", "console.log.bind(null).apply(null, [({label:\"Save changes\"}).label]); const result=0;"],
["console.log-bind-bind", "console.log.bind(null).bind(null)(({label:\"Save changes\"}).label); const result=0;"],
["console.log-bind-call-ts", "(console.log.bind(null) as any)[\"call\"](null, ({label:\"Save changes\"}).label); const result=0;"],
["console.log-conditional-bound-member", "(flag ? console.log.bind(null) : console.log).call(null, ({label:\"Save changes\"}).label); const result=0;"],
["console.log-sequence-bound-member", "(0, console.log.bind(null)).call(null, ({label:\"Save changes\"}).label); const result=0;"],
["console.log-bind-ordinary", "console.log.bind(null)(({label:\"Save changes\"}).label); const result=0;"],
["console.log-call-ordinary", "console.log.call(null, ({label:\"Save changes\"}).label); const result=0;"],
["console.log-apply-ordinary", "console.log.apply(null, [({label:\"Save changes\"}).label]); const result=0;"],
["Error-bind-call", "const result=Error.bind(null).call(null, ({label:\"Save changes\"}).label).message;"],
["Error-bind-apply", "const result=Error.bind(null).apply(null, [({label:\"Save changes\"}).label]).message;"],
["Error-bind-bind", "const result=Error.bind(null).bind(null)(({label:\"Save changes\"}).label).message;"],
["Error-bind-call-ts", "const result=(Error.bind(null) as any)[\"call\"](null, ({label:\"Save changes\"}).label).message;"],
["Error-conditional-bound-member", "const result=(flag ? Error.bind(null) : Error).call(null, ({label:\"Save changes\"}).label).message;"],
["Error-sequence-bound-member", "const result=(0, Error.bind(null)).call(null, ({label:\"Save changes\"}).label).message;"],
["Error-bind-ordinary", "const result=Error.bind(null)(({label:\"Save changes\"}).label).message;"],
["Error-call-ordinary", "const result=Error.call(null, ({label:\"Save changes\"}).label).message;"],
["Error-apply-ordinary", "const result=Error.apply(null, [({label:\"Save changes\"}).label]).message;"],
["RegExp-bind-call", "const result=RegExp.bind(null).call(null, ({label:\"Save changes\"}).label).test(\"Save changes\");"],
["RegExp-bind-apply", "const result=RegExp.bind(null).apply(null, [({label:\"Save changes\"}).label]).test(\"Save changes\");"],
["RegExp-bind-bind", "const result=RegExp.bind(null).bind(null)(({label:\"Save changes\"}).label).test(\"Save changes\");"],
["RegExp-bind-call-ts", "const result=(RegExp.bind(null) as any)[\"call\"](null, ({label:\"Save changes\"}).label).test(\"Save changes\");"],
["RegExp-conditional-bound-member", "const result=(flag ? RegExp.bind(null) : RegExp).call(null, ({label:\"Save changes\"}).label).test(\"Save changes\");"],
["RegExp-sequence-bound-member", "const result=(0, RegExp.bind(null)).call(null, ({label:\"Save changes\"}).label).test(\"Save changes\");"],
["RegExp-bind-ordinary", "const result=RegExp.bind(null)(({label:\"Save changes\"}).label).test(\"Save changes\");"],
["RegExp-call-ordinary", "const result=RegExp.call(null, ({label:\"Save changes\"}).label).test(\"Save changes\");"],
["RegExp-apply-ordinary", "const result=RegExp.apply(null, [({label:\"Save changes\"}).label]).test(\"Save changes\");"],
["cn-bind-call", "const result=cn.bind(null).call(null, ({label:\"Save changes\"}).label);"],
["cn-bind-apply", "const result=cn.bind(null).apply(null, [({label:\"Save changes\"}).label]);"],
["cn-bind-bind", "const result=cn.bind(null).bind(null)(({label:\"Save changes\"}).label);"],
["cn-bind-call-ts", "const result=(cn.bind(null) as any)[\"call\"](null, ({label:\"Save changes\"}).label);"],
["cn-conditional-bound-member", "const result=(flag ? cn.bind(null) : cn).call(null, ({label:\"Save changes\"}).label);"],
["cn-sequence-bound-member", "const result=(0, cn.bind(null)).call(null, ({label:\"Save changes\"}).label);"],
["cn-bind-ordinary", "const result=cn.bind(null)(({label:\"Save changes\"}).label);"],
["cn-call-ordinary", "const result=cn.call(null, ({label:\"Save changes\"}).label);"],
["cn-apply-ordinary", "const result=cn.apply(null, [({label:\"Save changes\"}).label]);"],
["error-name-Foo_Error", "function Foo_Error(message){return new Error(message)} const result=Foo_Error(({label:\"Save changes\"}).label).message;"],
["error-name-Foo$Error", "function Foo$Error(message){return new Error(message)} const result=Foo$Error(({label:\"Save changes\"}).label).message;"],
["error-name-Foo_Exception", "function Foo_Exception(message){return new Error(message)} const result=Foo_Exception(({label:\"Save changes\"}).label).message;"],
["error-name-Foo$Exception", "function Foo$Exception(message){return new Error(message)} const result=Foo$Exception(({label:\"Save changes\"}).label).message;"],
["error-name-FooError", "function FooError(message){return new Error(message)} const result=FooError(({label:\"Save changes\"}).label).message;"],
["error-name-FooException", "function FooException(message){return new Error(message)} const result=FooException(({label:\"Save changes\"}).label).message;"],
];

for (const [name, code] of r4Cases) {
  test(`审核 r4 反例 ${name}：不包裹，原代码与中文模式代码行为一致`, () => {
    const { converted, valueUse } = analyze(code);
    assert.ok(!converted.includes(WRAP), `不应包裹\n${converted}`);
    assert.ok(valueUse.has("Save changes"), "预扫描应收到受保护位置里的值");
    assertSameBehavior(code, converted);
  });
}

// ---------------------------------------------------------------------------
// 2. 生成矩阵：多层 bind/call/apply 组合
// ---------------------------------------------------------------------------

const ARG = `({label:"Save changes"}).label`;

/** 把"调用 F 并传入 ARG"写成各种等价形式；F 是一个函数表达式。 */
const CHAINS: Array<[name: string, build: (f: string) => string]> = [
  ["bind-bind-call", (f) => `${f}.bind(null).bind(null).call(null, ${ARG})`],
  ["bind-call-call", (f) => `${f}.bind(null).call.call(${f}.bind(null), null, ${ARG})`],
  ["call-call", (f) => `${f}.call.call(${f}, null, ${ARG})`],
  ["call-apply", (f) => `${f}.call.apply(${f}, [null, ${ARG}])`],
  ["bind-apply-sequence", (f) => `(0, ${f}.bind(null)).apply(null, [${ARG}])`],
  ["bind-conditional", (f) => `(flag ? ${f}.bind(null) : ${f}).call(null, ${ARG})`],
  ["bind-optional", (f) => `${f}.bind(null)?.call?.(null, ${ARG})`],
  ["bind-ts", (f) => `(${f}.bind(null) as any).call(null, ${ARG})`],
  ["bind-computed", (f) => `${f}.bind(null)["call"](null, ${ARG})`],
  ["bind-bind-bind", (f) => `${f}.bind(null).bind(null).bind(null)(${ARG})`],
  ["global-bind-call", (f) => `globalThis.${f}.bind(null).call(null, ${ARG})`],
];

/** 受保护目标：调用对象，以及从调用结果得到 result 的写法。 */
const TARGETS: Array<[name: string, callee: string, toResult: (call: string) => string]> = [
  ["console.log", "console.log", (call) => `${call}; const result=0;`],
  ["Error", "Error", (call) => `const result=${call}.message;`],
  ["Foo_Error", "Foo_Error", (call) => `function Foo_Error(m){return new Error(m)} const result=${call}.message;`],
  ["RegExp", "RegExp", (call) => `const result=${call}.test("Save changes");`],
  ["cn", "cn", (call) => `const result=${call};`],
];

for (const [targetName, callee, toResult] of TARGETS) {
  for (const [chainName, build] of CHAINS) {
    // globalThis 前缀只对全局目标有意义。
    if (chainName.startsWith("global") && !["console.log", "Error", "RegExp"].includes(targetName)) continue;
    const code = toResult(build(callee));
    test(`组合矩阵 ${targetName} × ${chainName}：不包裹，预扫描收到值，行为一致`, () => {
      const { converted, valueUse } = analyze(code);
      assert.ok(!converted.includes(WRAP), `不应包裹\n${converted}`);
      assert.ok(valueUse.has("Save changes"), `预扫描应收到值\n${code}`);
      assertSameBehavior(code, converted);
    });
  }
}

// ---------------------------------------------------------------------------
// 3. 对照组：显示函数经同样的组合仍按 D 类转换
// ---------------------------------------------------------------------------

test("对照组：setError 经 bind/call 组合仍按 D 类转换", () => {
  for (const code of [
    `setError.bind(null).call(null, "Save changes");`,
    `setError.call(null, "Save changes");`,
    `setError.bind(null)("Save changes");`,
  ]) {
    const { candidates } = analyze(code, "apps/web/src/components/r4-control.tsx");
    const hit = candidates.find((c) => c.text === "Save changes");
    assert.equal(hit?.decision, "translate", `${code} → ${hit?.decision}/${hit?.reason}`);
  }
});
