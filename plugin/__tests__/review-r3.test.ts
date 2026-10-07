/**
 * T03 审核 r3 的反例回归测试（reviews/T03-r3.md，审核员脚本 /tmp/t3zh-T03-r3/adversarial.mjs），以及 CONVENTIONS §4
 * 「受保护的语法形式与已知限制」（2026-10-05 定案）的矩阵测试。
 *
 * 1. r3 的 26 组反例原样照搬：原代码和「中文模式代码」都实际执行，比较结果和 console 实际打印的参数。
 * 2. 受保护语法形式 × 每类受保护目标（console、new Error、Error()、*Error/*Exception、RegExp、非显示调用）：
 *    断言不包裹、预扫描收到值、中文模式执行结果与原代码相同。
 * 3. §4 新增的值用途位置（`in` 左侧、键参数、Object.hasOwn、字符串方法）：预扫描收到值，同文的 C 类值判 suspicious，执行结果不变。
 * 4. 对照组：正常显示调用（setError、toast、confirm……，含各种语法形式）仍被转换。
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
const FILE = "apps/web/src/r3.ts";

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
// 1. 审核 r3 的反例（adversarial.mjs 的 26 组，原样照搬）
// ---------------------------------------------------------------------------

const r3Cases: Array<[name: string, code: string, expect?: "display"]> = [
  ["error-bare", 'const result=Error(({label:"Save changes"}).label).message;'],
  ["error-bare-ts", 'const result=(Error as ErrorConstructor)((()=>({label:"Save changes"}).label)()).message;'],
  ["error-sequence", 'const result=new (0,Error)(({label:"Save changes"}).label).message;'],
  ["error-sequence-ts", 'const result=new ((0,Error) as ErrorConstructor)(({label:"Save changes"}).label).message;'],
  ["error-conditional", 'const result=new (flag?Error:TypeError)(({label:"Save changes"}).label).message;'],
  ["console-sequence", '(0,console.log)({label:"Save changes"}); const result=0;'],
  ["console-object-sequence", '(0,console).log({label:"Save changes"}); const result=0;'],
  ["console-conditional", '(flag?console.log:console.warn)({label:"Save changes"}); const result=0;'],
  ["regexp-sequence", 'const re=new (0,RegExp)(({label:"Save changes"}).label); const result=re.test("Save changes");'],
  ["regexp-object-sequence", 'const re=new (0,globalThis).RegExp(({label:"Save changes"}).label); const result=re.test("Save changes");'],
  ["non-display-sequence", 'const result=(0,cn)(({label:"Save changes"}).label);'],
  ["error-direct-control", 'const result=new Error(({label:"Save changes"}).label).message;'],
  ["console-direct-control", 'console.log({label:"Save changes"}); const result=0;'],
  ["regexp-direct-control", 'const result=new RegExp(({label:"Save changes"}).label).source;'],
  ["non-display-direct-control", 'const result=cn(({label:"Save changes"}).label);'],
  ["console-dynamic-control", 'console[method]({label:"Save changes"}); const result=0;'],
  ["console-call-control", 'console.log.call(console,{label:"Save changes"}); const result=0;'],
  ["console-optional-control", 'console?.log?.({label:"Save changes"}); const result=0;'],
  ["error-instantiation-control", 'const result=new (Error<any>)(({label:"Save changes"}).label).message;'],
  ["callee-test-control", 'const result=(flag?({label:"Save changes"}).label.length:0) ? 1 : 0;'],
  ["asconst-e1-spread", 'const x={...{label:"Save changes"}} as const; const result=x.label;', "display"],
  ["asconst-e1-array", 'const x=[{items:[{label:"Save changes"}]}] as const; const result=x[0].items[0].label;', "display"],
  ["asconst-e2-nested-control", 'const X_LABELS={label:cn((()=>({label:"Save changes"}).label)())} as const; const result=X_LABELS.label;'],
  ["asconst-cross-function-control", 'const x={show:()=>({label:"Save changes"})} as const; const result=x.show().label;'],
  ["tag-control", 'const result=tag`prefix:${(()=>({label:"Save changes"}).label)()}`;'],
  ["skip-cross-function-control", '/* t3zh-skip */ const x=()=>({label:"Save changes"}); const result=x().label;'],
];

for (const [name, code, expect] of r3Cases) {
  test(`审核 r3 反例 ${name}：原代码与中文模式代码行为一致`, () => {
    const { converted } = analyze(code);
    if (expect === "display") {
      // E1 显示叶子照常翻译：中文模式的结果就是原结果的中文。
      const original = execute(code).result;
      assert.equal(execute(converted).result, t(original), converted);
      assert.notEqual(t(original), original);
      return;
    }
    assertSameBehavior(code, converted);
    assert.ok(!converted.includes(WRAP), `不应包裹\n${converted}`);
  });
}

// ---------------------------------------------------------------------------
// 2. 受保护语法形式 × 每类受保护目标
// ---------------------------------------------------------------------------

const ARG = `({label:"Save changes"}).label`;

interface Target {
  name: string;
  kind: "call" | "new";
  /** 调用对象（不带全局前缀）。 */
  base: string;
  /** `.call/.apply/.bind` 的 this 实参。 */
  thisArg: string;
  /** 用整个调用表达式构造计算 result 的代码。 */
  result: (call: string) => string;
}

const TARGETS: Target[] = [
  { name: "console.log", kind: "call", base: "console.log", thisArg: "console", result: (c) => `${c}; const result = 0;` },
  { name: "new Error", kind: "new", base: "Error", thisArg: "null", result: (c) => `const result = ${c}.message;` },
  { name: "Error(…) 直接调用", kind: "call", base: "Error", thisArg: "null", result: (c) => `const result = ${c}.message;` },
  { name: "new TypeError", kind: "new", base: "TypeError", thisArg: "null", result: (c) => `const result = ${c}.message;` },
  { name: "TypeError(…) 直接调用", kind: "call", base: "TypeError", thisArg: "null", result: (c) => `const result = ${c}.message;` },
  { name: "new DOMException", kind: "new", base: "DOMException", thisArg: "null", result: (c) => `const result = ${c}.message;` },
  { name: "new RegExp", kind: "new", base: "RegExp", thisArg: "null", result: (c) => `const result = ${c}.test("Save changes");` },
  { name: "RegExp(…) 直接调用", kind: "call", base: "RegExp", thisArg: "null", result: (c) => `const result = ${c}.test("Save changes");` },
  { name: "非显示调用 cn", kind: "call", base: "cn", thisArg: "null", result: (c) => `const result = ${c};` },
];

/** 受保护的语法形式（§4）：返回整个调用表达式；不适用于该目标时返回 null。 */
const SYNTAX_FORMS: Record<string, (target: Target) => string | null> = {
  直接: (x) => (x.kind === "new" ? `new ${x.base}(${ARG})` : `${x.base}(${ARG})`),
  静态计算成员: (x) => {
    const callee = x.base.includes(".") ? x.base.replace(/\.(\w+)$/, `["$1"]`) : `globalThis["${x.base}"]`;
    return x.kind === "new" ? `new ${callee}(${ARG})` : `${callee}(${ARG})`;
  },
  可选链: (x) => {
    // new 的可选链必须加括号；Node 的 TS 转换会去掉多余的括号，借 `?? noop` 让括号保留下来。
    if (x.kind === "new") return `new (globalThis?.${x.base} ?? noop)(${ARG})`;
    return x.base.includes(".") ? `${x.base.replace(".", "?.")}(${ARG})` : `${x.base}?.(${ARG})`;
  },
  可选调用: (x) => (x.kind === "new" ? null : `globalThis?.${x.base}?.(${ARG})`),
  "括号 + as": (x) => (x.kind === "new" ? `new (${x.base} as any)(${ARG})` : `(${x.base} as any)(${ARG})`),
  satisfies: (x) => (x.kind === "new" ? `new (${x.base} satisfies unknown as any)(${ARG})` : `(${x.base} satisfies unknown as any)(${ARG})`),
  "<T>x": (x) => (x.kind === "new" ? `new (<any>${x.base})(${ARG})` : `(<any>${x.base})(${ARG})`),
  "非空断言 !": (x) => (x.kind === "new" ? `new (${x.base}!)(${ARG})` : `${x.base}!(${ARG})`),
  逗号末项: (x) => (x.kind === "new" ? `new (0, ${x.base})(${ARG})` : `(0, ${x.base})(${ARG})`),
  "成员对象是逗号": (x) => {
    const [head, ...rest] = x.base.split(".");
    const callee = rest.length > 0 ? `(0, ${head}).${rest.join(".")}` : `(0, globalThis).${x.base}`;
    return x.kind === "new" ? `new ${callee}(${ARG})` : `${callee}(${ARG})`;
  },
  "条件 then 分支": (x) => (x.kind === "new" ? `new (flag ? ${x.base} : noop)(${ARG})` : `(flag ? ${x.base} : noop)(${ARG})`),
  "条件 else 分支": (x) => (x.kind === "new" ? `new (!flag ? noop : ${x.base})(${ARG})` : `(!flag ? noop : ${x.base})(${ARG})`),
  "||": (x) => (x.kind === "new" ? `new (${x.base} || noop)(${ARG})` : `(${x.base} || noop)(${ARG})`),
  "&&": (x) => (x.kind === "new" ? `new (flag && ${x.base})(${ARG})` : `(flag && ${x.base})(${ARG})`),
  "??": (x) => (x.kind === "new" ? `new (${x.base} ?? noop)(${ARG})` : `(${x.base} ?? noop)(${ARG})`),
  ".call": (x) => (x.kind === "new" ? null : `${x.base}.call(${x.thisArg}, ${ARG})`),
  ".apply": (x) => (x.kind === "new" ? null : `${x.base}.apply(${x.thisArg}, [${ARG}])`),
  ".bind(t)(…)": (x) => (x.kind === "new" ? `new (${x.base}.bind(null))(${ARG})` : `${x.base}.bind(${x.thisArg})(${ARG})`),
  ".bind(t, 参数)()": (x) => (x.kind === "new" ? `new (${x.base}.bind(null, ${ARG}))()` : `${x.base}.bind(${x.thisArg}, ${ARG})()`),
  "globalThis.": (x) => (x.kind === "new" ? `new globalThis.${x.base}(${ARG})` : `globalThis.${x.base}(${ARG})`),
  "window.": (x) => (x.kind === "new" ? `new window.${x.base}(${ARG})` : `window.${x.base}(${ARG})`),
  "self.": (x) => (x.kind === "new" ? `new self.${x.base}(${ARG})` : `self.${x.base}(${ARG})`),
  "组合：逗号 + 全局前缀 + as + 条件": (x) =>
    x.kind === "new"
      ? `new (flag ? ((0, globalThis.${x.base}) as any) : noop)(${ARG})`
      : `(flag ? ((0, globalThis.${x.base}) as any) : noop)(${ARG})`,
};

for (const target of TARGETS) {
  for (const [form, build] of Object.entries(SYNTAX_FORMS)) {
    const call = build(target);
    if (call === null) continue;
    const code = target.result(call);
    test(`受保护语法形式：${target.name} × ${form}——不包裹，预扫描收到值，中文模式行为不变`, () => {
      const { valueUse, converted, candidates } = analyze(code);
      assert.ok(!converted.includes(WRAP), `不应包裹\n${converted}`);
      for (const candidate of candidates.filter((c) => c.key === "Save changes")) assert.equal(candidate.decision, "skip", JSON.stringify(candidate));
      assert.equal(valueUse.has("Save changes"), true, `预扫描应收到值：${code}`);
      assertSameBehavior(code, converted);
    });
  }
}

test("受保护语法形式：同文的普通 C 类值因预扫描判 suspicious，中文模式下正则仍匹配", () => {
  const code = `const y = {label:"Save changes"}; const re = new (0, RegExp)(({label:"Save changes"}).label); const result = re.test(y.label);`;
  const { converted, candidates } = analyze(code);
  assert.deepEqual(candidates.map((c) => `${c.decision}/${c.reason}`), ["suspicious/value-use", "skip/regex"]);
  assertSameBehavior(code, converted);
});

// ---------------------------------------------------------------------------
// 3. §4 新增的值用途位置
// ---------------------------------------------------------------------------

const Y = `const y = {label:"Save changes"};`;
const STORAGE = `const store = new Map(JSON.parse('[["Save changes","1"]]')); const ls = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => void store.set(k, v), removeItem: (k) => store.delete(k) };`;
const OBJECT = `const o = JSON.parse('{"Save changes":1}');`;
const MAP = `const m = new Map(JSON.parse('[["Save changes",1]]'));`;

const VALUE_POSITIONS: Record<string, string> = {
  "in 左侧": `${OBJECT} const probe = "Save changes" in o; const result = probe && (y.label in o);`,
  ".get 首个参数": `${MAP} const probe = m.get("Save changes"); const result = probe === m.get(y.label);`,
  ".set 首个参数": `const m = new Map(); m.set("Save changes", 1); const result = m.get(y.label);`,
  ".delete 首个参数": `${MAP} const result = m.delete(y.label); m.delete("Save changes");`,
  ".has 首个参数": `${MAP} const result = m.has("Save changes") && m.has(y.label);`,
  ".getItem 首个参数": `${STORAGE} const probe = ls.getItem("Save changes"); const result = ls.getItem(y.label) === probe;`,
  ".setItem 首个参数": `const store = new Map(); const ls = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => void store.set(k, v) }; ls.setItem("Save changes", "1"); const result = ls.getItem(y.label);`,
  ".removeItem 首个参数": `${STORAGE} const result = ls.removeItem(y.label); ls.removeItem("Save changes");`,
  ".hasOwnProperty 首个参数": `${OBJECT} const probe = o.hasOwnProperty("Save changes"); const result = probe && o.hasOwnProperty(y.label);`,
  "Object.prototype.hasOwnProperty.call": `${OBJECT} const probe = Object.prototype.hasOwnProperty.call(o, "Save changes"); const result = probe && Object.prototype.hasOwnProperty.call(o, y.label);`,
  "Object.hasOwn 第二个参数": `${OBJECT} const probe = Object.hasOwn(o, "Save changes"); const result = probe && Object.hasOwn(o, y.label);`,
  "可选链 ?.get": `${MAP} const probe = m?.get("Save changes"); const result = probe === m?.get?.(y.label);`,
  ".startsWith": `const s = "Save changes!"; s.startsWith("Save changes"); const result = s.startsWith(y.label);`,
  ".endsWith": `const s = "Save changes"; s.endsWith("Save changes"); const result = s.endsWith(y.label);`,
  ".replace": `const s = "a Save changes b"; s.replace("Save changes", "X"); const result = s.replace(y.label, "X");`,
  ".replaceAll": `const s = "Save changes Save changes"; s.replaceAll("Save changes", "X"); const result = s.replaceAll(y.label, "X");`,
  ".match": `const s = "a Save changes b"; s.match("Save changes"); const result = JSON.stringify(s.match(y.label));`,
  ".matchAll": `const s = "Save changes Save changes"; s.matchAll("Save changes"); const result = [...s.matchAll(y.label)].length;`,
  ".search": `const s = "a Save changes b"; s.search("Save changes"); const result = s.search(y.label);`,
  ".split": `const s = "a Save changes b"; s.split("Save changes"); const result = s.split(y.label).length;`,
  ".localeCompare": `const s = "Save changes"; s.localeCompare("Save changes"); const result = s.localeCompare(y.label);`,
};

for (const [name, body] of Object.entries(VALUE_POSITIONS)) {
  test(`值用途位置 ${name}：预扫描收到值，同文 C 类值判 suspicious，中文模式行为不变`, () => {
    const code = `${Y} ${body}`;
    const { valueUse, converted, candidates } = analyze(code);
    assert.equal(valueUse.has("Save changes"), true, "预扫描应收到值");
    const label = candidates.find((c) => c.key === "Save changes" && c.context === "label");
    assert.equal(label?.decision, "suspicious", JSON.stringify(label));
    assert.ok(!converted.includes(WRAP), converted);
    assertSameBehavior(code, converted);
  });
}

test("值用途位置的反例：其他方法、键参数以外的参数不收", () => {
  for (const code of [`m.set(k, "Save changes");`, `ls.setItem(k, "Save changes");`, `s.concat("Save changes");`, `Object.hasOwn("Save changes", k);`, `get("Save changes");`]) {
    assert.equal(analyze(code).valueUse.has("Save changes"), false, code);
  }
});

// ---------------------------------------------------------------------------
// 4. 对照组：正常显示调用仍被转换
// ---------------------------------------------------------------------------

test("对照组：setError、toast、confirm 等显示调用（含各种语法形式）仍被转换，中文模式显示中文", () => {
  const SHOW = `let shown; const record = (x) => { shown = x; };`;
  const cases: Array<[string, string]> = [
    ["setError 直接", `const setError = record; setError("Save changes"); const result = shown;`],
    ["this.setError", `const self2 = { setError: record }; self2.setError("Save changes"); const result = shown;`],
    ["setError 逗号", `const setError = record; (0, setError)("Save changes"); const result = shown;`],
    ["setError as", `const setError = record; (setError as any)("Save changes"); const result = shown;`],
    ["setError.call", `const setError = record; setError.call(null, "Save changes"); const result = shown;`],
    ["setError.bind(null)(…)", `const setError = record; setError.bind(null)("Save changes"); const result = shown;`],
    ["setError?.()", `const setError = record; setError?.("Save changes"); const result = shown;`],
    ["回调里的 setError", `const setError = record; [1].forEach(() => setError("Save changes")); const result = shown;`],
    ["条件两个分支都是白名单函数", `const setError = record; const setMessage = record; (flag ? setError : setMessage)("Save changes"); const result = shown;`],
    ["api?.dialogs.confirm", `const api = { dialogs: { confirm: record } }; api?.dialogs.confirm("Save changes"); const result = shown;`],
    ["globalThis.confirm", `globalThis.confirm = record; globalThis.confirm("Save changes"); const result = shown;`],
    ["window.confirm", `window.confirm = record; window.confirm("Save changes"); const result = shown;`],
    ["toast({ title })", `const toast = (o) => o.title; const result = toast({ title: "Save changes" });`],
    ["toastManager.add({ title })", `const toastManager = { add: (o) => o.title }; const result = toastManager.add({ type: "error", title: "Save changes" });`],
    ["console 回调外的 toast", `const toast = (o) => o.title; console.log("done"); const result = toast({ title: "Save changes" });`],
  ];
  for (const [name, code] of cases) {
    const { converted } = analyze(`${SHOW} ${code}`);
    assert.ok(converted.includes(WRAP), `${name} 应当包裹\n${converted}`);
    assert.equal(execute(converted).result, "保存更改", name);
    assert.equal(execute(`${SHOW} ${code}`).result, "Save changes", name);
  }
});

test("对照组（保守）：调用对象有一个分支不是白名单函数、或是裸 confirm 时不按 D 类转换", () => {
  for (const code of [
    `(flag ? setError : setStatus)("Save changes");`,
    `confirm("Save changes");`,
    `setError.apply(null, ["Save changes"]);`,
    `(flag ? setError : console.log)("Save changes");`,
    `(flag ? setError.bind : makeHandler)(null)("Save changes");`,
  ]) {
    assert.ok(!analyze(code).converted.includes(WRAP), code);
  }
});
