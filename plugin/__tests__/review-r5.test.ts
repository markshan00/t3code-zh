/**
 * T03 审核 r5 的反例回归测试（reviews/T03-r5.md，审核员脚本 /tmp/t3zh-T03-r5/effects.mjs、d-combinations.mjs、
 * error-identifiers.mjs、generated.mjs）。修复：调用对象解析改为值模型（path / bound / method / unknown），见 matcher 的 evaluateCallee。
 *
 * 1. `X.bind.call(T, …)(…)`、`X.bind.apply(T, […])(…)`：绑定返回的函数仍受保护。
 * 2. D 类经 bind/call 组合时参数位置按累计的已绑定参数个数对应：只翻消息参数，id 等其他参数保持原值；对不上时不转换。
 * 3. 含 Unicode 字符的错误类名（Foo中Error、FooéError、FooΩException、含 ZWNJ）直接调用与静态工厂都受保护；小写开头仍是显示函数。
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
const FILE = "apps/web/src/r5.ts";

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
// 1. bind 方法经 call/apply 调用后返回的函数
// ---------------------------------------------------------------------------

const ARG = `({label:"Save changes"}).label`;
const BIND_FORMS: Array<[name: string, build: (f: string) => string]> = [
  ["bind.call", (f) => `${f}.bind.call(${f}, null)(${ARG})`],
  ["bind.apply", (f) => `${f}.bind.apply(${f}, [null])(${ARG})`],
  ["bind.call-then-call", (f) => `${f}.bind.call(${f}, null).call(null, ${ARG})`],
  ["bind.apply-then-bind", (f) => `${f}.bind.apply(${f}, [null]).bind(null)(${ARG})`],
  ["sequence-bind.call", (f) => `(0, ${f}.bind).call(${f}, null)(${ARG})`],
  ["bind.call-with-arg", (f) => `${f}.bind.call(${f}, null, ${ARG})()`],
];
const TARGETS: Array<[name: string, callee: string, toResult: (call: string) => string]> = [
  ["console.log", "console.log", (call) => `${call}; const result=0;`],
  ["Error", "Error", (call) => `const result=${call}.message;`],
  ["RegExp", "RegExp", (call) => `const result=${call}.test("Save changes");`],
  ["cn", "cn", (call) => `const result=${call};`],
];
for (const [targetName, callee, toResult] of TARGETS) {
  for (const [formName, build] of BIND_FORMS) {
    const code = toResult(build(callee));
    test(`r5 bind 方法组合 ${targetName} × ${formName}：不包裹，预扫描收到值，行为一致`, () => {
      const { converted, valueUse } = analyze(code);
      assert.ok(!converted.includes(WRAP), `不应包裹\n${converted}`);
      assert.ok(valueUse.has("Save changes"), `预扫描应收到值\n${code}`);
      assertSameBehavior(code, converted);
    });
  }
}

// ---------------------------------------------------------------------------
// 2. D 类参数位置：累计已绑定参数
// ---------------------------------------------------------------------------

/** 每例：代码、应被翻译的文字、必须保持原值的文字。setError 翻第 0 个参数，setThreadError 翻第 1 个参数（handoff 的 D 类名单）。 */
const D_CASES: Array<[name: string, code: string, translated: string[], kept: string[]]> = [
  ["bind-then-call", 'setError.bind(null, "Save changes").call(null, "Archive");', ["Save changes"], ["Archive"]],
  ["bind-then-direct", 'setError.bind(null, "Save changes")("Archive");', ["Save changes"], ["Archive"]],
  ["call", 'setError.call(null, "Save changes", "Archive");', ["Save changes"], ["Archive"]],
  ["bind-only", 'setError.bind(null)("Save changes", "Archive");', ["Save changes"], ["Archive"]],
  ["thread-bind-id", 'setThreadError.bind(null, "Archive").call(null, "Save changes", "Archive2");', ["Save changes"], ["Archive", "Archive2"]],
  ["thread-double-bind", 'setThreadError.bind(null, "Archive").bind(null, "Save changes")("Archive2");', ["Save changes"], ["Archive", "Archive2"]],
  ["thread-bind-both", 'setThreadError.bind(null, "Archive", "Save changes").call(null, "Archive2", "Archive3");', ["Save changes"], ["Archive", "Archive2", "Archive3"]],
  ["thread-direct", 'setThreadError("Archive", "Save changes", "Archive2");', ["Save changes"], ["Archive", "Archive2"]],
];
for (const [name, code, translated, kept] of D_CASES) {
  test(`r5 D 类参数位置 ${name}：只翻消息参数`, () => {
    const { candidates } = analyze(code, "apps/web/src/components/r5-d.tsx");
    for (const text of translated) {
      const hit = candidates.find((c) => c.text === text);
      assert.equal(hit?.decision, "translate", `${text} 应翻译：${hit?.decision}/${hit?.reason}\n${code}`);
    }
    for (const text of kept) {
      const hit = candidates.find((c) => c.text === text && c.decision === "translate");
      assert.equal(hit, undefined, `${text} 不应翻译\n${code}`);
    }
  });
}

test("r5 D 类：参数位置对不上（bind.call、展开参数、apply）时不转换", () => {
  for (const code of [
    'setError.bind.call(setError, null, "Save changes")();',
    'setError.bind(null, ...prefix)("Save changes");',
    'setError.apply(null, ["Save changes"]);',
    'setError.call.call(setError, null, "Save changes");',
  ]) {
    const { candidates } = analyze(code, "apps/web/src/components/r5-d.tsx");
    const hit = candidates.find((c) => c.text === "Save changes" && c.decision === "translate");
    assert.equal(hit, undefined, `不应按 D 类转换：${code}`);
  }
});

// ---------------------------------------------------------------------------
// 3. Unicode 错误类名
// ---------------------------------------------------------------------------

const ERROR_NAMES = ["Foo中Error", "FooéError", "FooΩException", "Foo\u200CError", "中Error", "_FooError", "$Error"];
for (const name of ERROR_NAMES) {
  for (const mode of ["direct", "factory"] as const) {
    const decl = `function ${name}(message){return Error(message)} ${name}.create=(message)=>Error(message);`;
    const call = mode === "direct" ? `${name}(${ARG})` : `${name}.create(${ARG})`;
    const code = `${decl} const result=${call}.message;`;
    test(`r5 错误类名 ${name} × ${mode}：受保护`, () => {
      const { converted, valueUse } = analyze(code);
      assert.ok(!converted.includes(WRAP), `不应包裹\n${converted}`);
      assert.ok(valueUse.has("Save changes"));
      assertSameBehavior(code, converted);
    });
  }
}

test("r5 对照组：小写开头的 setError、captureSettingsError 仍是显示函数", () => {
  for (const code of ['setError("Save changes");', 'captureSettingsError("Save changes");']) {
    const { candidates } = analyze(code, "apps/web/src/components/r5-d.tsx");
    const hit = candidates.find((c) => c.text === "Save changes");
    assert.notEqual(hit?.reason, "error-constructor", code);
  }
});
