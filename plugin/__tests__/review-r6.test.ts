/**
 * T03 审核 r6 的反例回归测试（reviews/T03-r6.md，审核员脚本 /tmp/t3zh-T03-r6/minimal-committed.mjs、spread-effects.mjs、
 * deeper-model.mjs、d-expanded.mjs、generated-depth4.mjs）。
 *
 * 1. 更深的 call/apply/bind 方法组合（X.bind.call.call(…)、X.bind.bind(…)()、X.call.bind(…)……）：无法精确求值时，
 *    返回值保守地当作绑定了子树里点到的任何函数（matcher 的 mentionedTargets），受保护目标的实参照样受保护。
 * 2. 实参含展开（...xs）时参数位置对不上：D 类不转，键参数等预扫描收集全部实参（含展开数组里的元素）。
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
const FILE = "apps/web/src/r6.ts";

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

const SET_THREAD_ERROR = "function setThreadError(id, message){return [id, message]}";

// ---------------------------------------------------------------------------
// 1. 审核 r6 的反例（原样照搬；setThreadError 补上一个返回参数的定义以便执行）
// ---------------------------------------------------------------------------

const r6Cases: Array<[name: string, code: string]> = [
["nested-bind", "const result=RegExp.bind.call.call(RegExp.bind,RegExp,null)(({label:\"Save changes\"}).label).test(\"Save changes\");"],
["bound-method", "const result=RegExp.bind.bind(RegExp,null)()(({label:\"Save changes\"}).label).test(\"Save changes\");"],
["D-direct", "const result=setThreadError(...[],\"Save changes\",\"Archive\");"],
["D-call", "const result=setThreadError.call(null,...[],\"Save changes\",\"Archive\");"],
["D-bind", "const result=setThreadError.bind(null,...[],\"Save changes\",\"Archive\")();"],
["key-spread", "const m=new Map();m.set(...[],\"Save changes\",1);const o={label:\"Save changes\"};const result=m.get(o.label);"],
["case", "const result=setThreadError(...[],\"thread id\",\"Save changes\");"],
["case", "const result=setThreadError.call(null,...[],\"thread id\",\"Save changes\");"],
["case", "const result=setThreadError.bind(null,...[],\"thread id\",\"Save changes\")();"],
["case", "const m=new Map();m.set(...[],\"Save changes\",1);const o={label:\"Save changes\"};const result=m.get(o.label);"],
["case", "const o={label:\"Save changes\"};const result=Object.hasOwn(...[],{\"Save changes\":1},o.label);"],
];

r6Cases.forEach(([name, code], index) => {
  const runnable = code.includes("setThreadError") ? `${SET_THREAD_ERROR} ${code}` : code;
  test(`审核 r6 反例 #${index} ${name}：原代码与中文模式代码行为一致`, () => {
    const { converted } = analyze(runnable, "apps/web/src/components/r6.tsx");
    assertSameBehavior(runnable, converted);
  });
});

// ---------------------------------------------------------------------------
// 2. 方法的方法：更深的 call/apply/bind 组合 × 受保护目标
// ---------------------------------------------------------------------------

const ARG = `({label:"Save changes"}).label`;
const DEEP_FORMS: Array<[name: string, build: (f: string) => string]> = [
  ["bind.call.call", (f) => `${f}.bind.call.call(${f}.bind, ${f}, null)(${ARG})`],
  ["bind.bind()()", (f) => `${f}.bind.bind(${f}, null)()(${ARG})`],
  ["call.bind", (f) => `${f}.call.bind(${f}, null)(${ARG})`],
  ["apply.bind", (f) => `${f}.apply.bind(${f}, null)([${ARG}])`],
  ["bind.apply.call", (f) => `${f}.bind.apply.call(${f}.bind, ${f}, [null])(${ARG})`],
  ["call.call.bind", (f) => `${f}.call.call.bind(${f}.call, ${f}, null)(${ARG})`],
  ["bound-return-called", (f) => `(${f}.bind.bind(${f}))(null)(${ARG})`],
  ["sequence-deep", (f) => `(0, ${f}.bind).bind(${f}, null)()(${ARG})`],
];
const TARGETS: Array<[name: string, callee: string, toResult: (call: string) => string]> = [
  ["console.log", "console.log", (call) => `${call}; const result=0;`],
  ["Error", "Error", (call) => `const result=${call}.message;`],
  ["RegExp", "RegExp", (call) => `const result=${call}.test("Save changes");`],
  ["cn", "cn", (call) => `const result=${call};`],
];
for (const [targetName, callee, toResult] of TARGETS) {
  for (const [formName, build] of DEEP_FORMS) {
    const code = toResult(build(callee));
    test(`r6 深层组合 ${targetName} × ${formName}：不包裹，预扫描收到值，行为一致`, () => {
      const { converted, valueUse } = analyze(code);
      assert.ok(!converted.includes(WRAP), `不应包裹\n${converted}`);
      assert.ok(valueUse.has("Save changes"), `预扫描应收到值\n${code}`);
      assertSameBehavior(code, converted);
    });
  }
}

// ---------------------------------------------------------------------------
// 3. 展开参数：D 类不转，键参数预扫描收到值
// ---------------------------------------------------------------------------

test("r6 展开参数：setThreadError 的任一调用形式带展开时不按 D 类转换", () => {
  for (const code of [
    'setThreadError(...ids, "Save changes");',
    'setThreadError(...[], "Archive", "Save changes");',
    'setThreadError.call(null, ...[], "Archive", "Save changes");',
    'setThreadError.bind(null, ...[])("Archive", "Save changes");',
    'setThreadError.bind(null, "Archive")(...rest, "Save changes");',
  ]) {
    const { candidates } = analyze(code, "apps/web/src/components/r6-d.tsx");
    const hit = candidates.find((c) => c.decision === "translate");
    assert.equal(hit, undefined, `带展开时不应按 D 类转换：${code}`);
  }
});

test("r6 展开参数：键方法和 Object.hasOwn 带展开时，预扫描收集全部实参（含展开数组元素）", () => {
  for (const code of [
    'm.set(...[], "Save changes", 1);',
    'm.get(...["Save changes"]);',
    'Object.hasOwn(...[], obj, "Save changes");',
    'localStorage.getItem(...prefix, "Save changes");',
  ]) {
    const { valueUse } = analyze(code);
    assert.ok(valueUse.has("Save changes"), `预扫描应收到值：${code}`);
  }
});

test("r6 对照组：不带展开的 setThreadError 仍按 D 类只翻第 1 个参数", () => {
  const { candidates } = analyze('setThreadError("Archive", "Save changes");', "apps/web/src/components/r6-d.tsx");
  assert.equal(candidates.find((c) => c.text === "Save changes")?.decision, "translate");
  assert.notEqual(candidates.find((c) => c.text === "Archive")?.decision, "translate");
});
