/**
 * T03 审核 r2 的反例回归测试（reviews/T03-r2.md，审核员脚本 /tmp/t3zh-T03-r2/new-counterexamples.mjs），以及「保护穿透」通用测试。
 *
 * 1. r2 的 26 组反例全部照搬：原代码和「中文模式代码」（转换后、__t3zh_t 用真实中文词库查表）都实际执行，断言行为一致；
 *    console 类反例比较两边实际打印的参数；prescan 类反例断言预扫描收到了值。
 * 2. 保护穿透：对 protectedContext 的每一种受保护位置，各用「直接字面量、嵌套对象成员、立即执行函数、TS 断言包裹」4 种写法
 *    （调用类位置再加一种「callee 带 TS 包装」）构造用例，断言没有包裹、预扫描收到了值；
 *    另有对照组：同样的写法放在不受保护的位置时照常转换、预扫描不收。
 *
 * 运行：node --test "plugin/__tests__/*.test.ts"（或 npm run test:plugin）
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { stripTypeScriptTypes } from "node:module";

import { collectValueUse, scanModule, type ScanContext, type ValueUseInfo } from "../matcher.ts";
import { transformCode } from "../vite-plugin-t3zh.ts";
import { createTranslator, type T3zhDict } from "../../runtime/t3zh-runtime.ts";

const ZH: T3zhDict = { messages: { "Save changes": "保存更改", Archive: "归档", Close: "关闭" }, templates: {} };
const translate = createTranslator(ZH);
const t = (value: unknown) => (typeof value === "string" ? translate(value) : value);
const WRAP = `__t3zh_t("Save changes")`;

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
function contextOf(code: string, file: string): { ctx: ScanContext; valueUse: Map<string, ValueUseInfo> } {
  const valueUse = new Map<string, ValueUseInfo>();
  collectValueUse(code, file, file, valueUse);
  return { ctx: { valueUse, allowSuspicious: new Set(), dict: ZH }, valueUse };
}

function convert(code: string, file: string, ctx: ScanContext): string {
  const output = transformCode(code, file, ctx).output?.code ?? code;
  return output.replace(`import { __t3zh_t } from "virtual:t3zh-runtime";`, "");
}

function execute(code: string): { result: unknown; logs: unknown[][] } {
  const logs: unknown[][] = [];
  const fakeConsole = { log: (...args: unknown[]) => logs.push(args), warn: (...args: unknown[]) => logs.push(args) };
  const tag = (strings: TemplateStringsArray, ...args: unknown[]) => String.raw({ raw: strings }, ...args);
  const result = new Function("__t3zh_t", "foo", "tag", "console", `${compileTs(code)}\nreturn result;`)(t, (x: unknown) => x, tag, fakeConsole);
  return { result, logs };
}

// ---------------------------------------------------------------------------
// 1. 审核 r2 的反例（new-counterexamples.mjs 的 26 组，原样照搬）
// ---------------------------------------------------------------------------

type R2Type = "stable" | "prescan" | "display";
const r2Cases: Array<[name: string, code: string, type: R2Type]> = [
  ["E1-nested-test", 'const state={}; const x={label:(state.raw=({label:"Save changes"}).label).length>5?"Archive":"Close"} as const; const y={label:"Save changes"}; const result=state.raw===y.label;', "stable"],
  ["E2-nested-test", 'const state={}; const X_LABELS={a:(state.raw=({label:"Save changes"}).label).length>5?"Archive":"Close"} as const; const y={label:"Save changes"}; const result=state.raw===y.label;', "stable"],
  ["E1-nested-computed", 'const x={label:{[({label:"Save changes"}).label]:1}} as const; const y={label:"Save changes"}; const result=x.label[y.label];', "stable"],
  ["E2-nested-computed", 'const X_LABELS={a:{[({label:"Save changes"}).label]:1}} as const; const y={label:"Save changes"}; const result=X_LABELS.a[y.label];', "stable"],
  ["E1-nested-console", 'const x={label:console.log({label:"Save changes"})} as const; const y={label:"Save changes"}; const result=0;', "prescan"],
  ["E2-nested-console", 'const X_LABELS={a:console.log({label:"Save changes"})} as const; const y={label:"Save changes"}; const result=0;', "prescan"],
  ["computed-key-nested-cross", 'const x={[({label:"Save changes"}).label]:1}; const y={label:"Save changes"}; const result=x[y.label];', "stable"],
  ["computed-key-callback-cross", 'const x={[(()=>({label:"Save changes"}).label)()]:1}; const y={label:"Save changes"}; const result=x[y.label];', "stable"],
  ["comparison-nested-cross", 'const y={label:"Save changes"}; const result=({label:"Save changes"}).label===y.label;', "stable"],
  ["case-nested-cross", 'const y={label:"Save changes"}; let result=0; switch(y.label){case ({label:"Save changes"}).label:result=1;}', "stable"],
  ["enum-nested-cross", 'enum X { A=({label:"Save changes"}).label.length } const y={label:"Save changes"}; const result=X.A===y.label.length;', "stable"],
  ["error-callback", 'const x=new Error((()=>({label:"Save changes"}).label)()); const result=x.message;', "stable"],
  ["throw-callback", 'let result; try{throw (()=>({label:"Save changes"}))();}catch(x){result=x.label;}', "stable"],
  ["tag-callback", 'const result=tag`value:${(()=>({label:"Save changes"}).label)()}`;', "stable"],
  ["error-assertion", 'const x=new (Error as typeof Error)({label:"Save changes"}.label); const result=x.message;', "stable"],
  ["console-assertion", '(console as Console).log({label:"Save changes"}); const result=0;', "stable"],
  ["console-global-assertion", '(globalThis.console as Console).log({label:"Save changes"}); const result=0;', "stable"],
  ["tag-direct-positive", 'const result=tag`value:${({label:"Save changes"}).label}`;', "stable"],
  ["error-direct-positive", 'const x=new Error(({label:"Save changes"}).label); const result=x.message;', "stable"],
  ["throw-direct-positive", 'let result; try{throw {label:"Save changes"};}catch(x){result=x.label;}', "stable"],
  ["computed-key-direct-positive", 'const x={[true?"Save changes":"Archive"]:1}; const y={label:"Save changes"}; const result=x[y.label];', "stable"],
  ["E1-hidden-direct-positive", 'const x={label:foo("Save changes")} as const; const y={label:"Save changes"}; const result=x.label===y.label;', "stable"],
  ["E2-hidden-direct-positive", 'const X_LABELS={a:foo("Save changes")} as const; const y={label:"Save changes"}; const result=X_LABELS.a===y.label;', "stable"],
  ["E2-authorized-positive", 'const X_LABELS={a:"Save changes"} as const; const result=X_LABELS.a;', "display"],
  ["normal-condition-positive", 'const x={label:({label:"Save changes"}).label.length>5?"Archive":"Close"}; const result=x.label;', "display"],
  ["normal-and-positive", 'const x={label:({label:"Save changes"}).label.length>5&&"Archive"}; const result=x.label;', "display"],
];

for (const [name, code, type] of r2Cases) {
  test(`审核 r2 反例 ${name}：原代码与中文模式代码行为一致`, () => {
    const file = `apps/web/src/${name}.ts`;
    const { ctx, valueUse } = contextOf(code, file);
    const converted = convert(code, file, ctx);
    const original = execute(code);
    const zh = execute(converted);
    const detail = `converted:\n${converted}`;
    if (type === "display") {
      // 显示用途照常翻译：中文模式的结果就是原结果的中文。
      assert.equal(zh.result, t(original.result), detail);
      assert.notEqual(zh.result, original.result, `应当被翻译\n${detail}`);
      return;
    }
    assert.deepEqual(zh.result, original.result, detail);
    assert.deepEqual(zh.logs, original.logs, `console 实际打印的参数应相同\n${detail}`);
    // 受保护位置里的值保持英文；与它同文的 C 类值是值用途 → suspicious，也不包裹。
    assert.ok(!converted.includes(WRAP), `不应包裹 "Save changes"\n${detail}`);
    assert.equal(valueUse.has("Save changes"), true, "预扫描应收到受保护位置里的值");
  });
}

test("审核 r2 反例：受保护子树里的候选是 skip，同文的普通 C 类值是 suspicious/value-use", () => {
  const code = 'const x={[({label:"Save changes"}).label]:1}; const y={label:"Save changes"};';
  const file = "apps/web/src/r2.ts";
  const { ctx } = contextOf(code, file);
  const rows = scanModule(code, file, ctx).candidates.map((c) => `${c.decision}/${c.reason}`);
  assert.deepEqual(rows, ["skip/computed-key", "suspicious/value-use"]);
});

// ---------------------------------------------------------------------------
// 2. 保护穿透：每一种受保护位置 × 4 种写法
// ---------------------------------------------------------------------------

/** 4 种写法：受保护位置里放的表达式。 */
const FORMS: Record<string, string> = {
  direct: `"Save changes"`,
  nested: `({label:"Save changes"}).label`,
  iife: `(() => ({label:"Save changes"}).label)()`,
  ts: `({label:"Save changes"} as { label: string }).label!`,
};

interface Position {
  name: string;
  /** 用表达式 X 构造整段代码。 */
  code: (x: string) => string;
  file?: string;
  /** 调用类位置：callee 带 TS 包装的写法（第 5 种）。 */
  calleeTs?: string;
  /** 不能放任意表达式的位置（TS 类型）：直接给出 4 种写法。 */
  forms?: Record<string, string>;
}

const POSITIONS: Position[] = [
  { name: "比较左侧", code: (x) => `const result = ${x} === value;` },
  { name: "比较右侧", code: (x) => `const result = value != ${x};` },
  { name: "switch case", code: (x) => `switch (value) { case ${x}: break; }` },
  { name: "switch 判别式", code: (x) => `switch (${x}) { case 1: break; }` },
  { name: "if test", code: (x) => `if (${x}) { go(); }` },
  { name: "while test", code: (x) => `while (${x}) { break; }` },
  { name: "do-while test", code: (x) => `do { go(); } while (${x});` },
  { name: "for test", code: (x) => `for (let i = 0; ${x}; i++) { break; }` },
  { name: "条件表达式 test", code: (x) => `const result = ${x} ? 1 : 2;` },
  { name: "&& 左侧", code: (x) => `const result = ${x} && 1;` },
  { name: "enum 初始化", code: (x) => `enum E { A = ${x} }` },
  { name: "计算对象键", code: (x) => `const result = { [${x}]: 1 };` },
  { name: "计算类成员键", code: (x) => `class K { [${x}] = 1; }` },
  { name: "计算成员下标", code: (x) => `const result = obj[${x}];` },
  {
    name: "TS 类型位置",
    code: (x) => x,
    forms: {
      direct: `let a: "Save changes" = v;`,
      nested: `let b: { label: "Save changes" } = v;`,
      iife: `const c = (): { label: "Save changes" } => v;`,
      ts: `const d = v as { label: "Save changes" };`,
    },
  },
  { name: "new Error 参数", code: (x) => `const result = new Error(${x});`, calleeTs: `const result = new (Error as ErrorConstructor)(({label:"Save changes"}).label);` },
  { name: "new *Exception 参数", code: (x) => `const result = new DOMException(${x});`, calleeTs: `const result = new (globalThis.DOMException as any)(({label:"Save changes"}).label);` },
  { name: "*Error(...) 参数", code: (x) => `const result = Data.TaggedError(${x});`, calleeTs: `const result = (Data as any).TaggedError(({label:"Save changes"}).label);` },
  { name: "throw 参数", code: (x) => `function f() { throw ${x}; }` },
  { name: "带标签模板插值", code: (x) => `const result = tag\`value: \${${x}}\`;` },
  { name: "console 参数", code: (x) => `console.log(${x});`, calleeTs: `(console as Console)["warn"]!(({label:"Save changes"}).label);` },
  { name: "window.console 参数", code: (x) => `window.console.error(${x});`, calleeTs: `(window.console satisfies Console).error(({label:"Save changes"}).label);` },
  { name: "禁用属性 className 的值", code: (x) => `const result = <div className={${x}} />;`, file: "apps/web/src/p.tsx" },
  { name: "禁用属性 value 的值", code: (x) => `const result = <Row value={${x}} />;`, file: "apps/web/src/p.tsx" },
  { name: "data-* 属性的值", code: (x) => `const result = <div data-state={${x}} />;`, file: "apps/web/src/p.tsx" },
  { name: "RegExp 参数", code: (x) => `const result = new RegExp(${x});`, calleeTs: `const result = new (RegExp as any)(({label:"Save changes"}).label);` },
  { name: "非显示调用 cn 参数", code: (x) => `const result = cn(${x});`, calleeTs: `const result = (cn as typeof cn)(({label:"Save changes"}).label);` },
  { name: "非显示调用 useAtomCommand 参数", code: (x) => `useAtomCommand(cmd, { label: ${x} });`, calleeTs: `useAtomCommand!(cmd, { label: ({label:"Save changes"}).label });` },
  { name: "as const 非白名单键的值", code: (x) => `const result = { mode: ${x} } as const;` },
  { name: "as const 无键名数组元素", code: (x) => `const result = [${x}] as const;` },
  { name: "as const 白名单键值里的调用参数", code: (x) => `const result = { label: foo(${x}) } as const;` },
  { name: "E2 映射表值里的模板插值", code: (x) => `const X_LABELS = { a: \`\${${x}} now\` } as const;` },
];

for (const position of POSITIONS) {
  const forms = position.forms ?? Object.fromEntries(Object.entries(FORMS).map(([form, x]) => [form, position.code(x)]));
  if (position.calleeTs) forms["callee-ts"] = position.calleeTs;
  for (const [form, code] of Object.entries(forms)) {
    test(`保护穿透：${position.name} × ${form}——不包裹，预扫描收到值`, () => {
      const file = position.file ?? "apps/web/src/p.ts";
      const { ctx, valueUse } = contextOf(code, file);
      const converted = convert(code, file, ctx);
      assert.ok(!converted.includes(WRAP), `不应包裹\n${converted}`);
      for (const candidate of scanModule(code, file, ctx).candidates.filter((c) => c.key === "Save changes")) {
        assert.equal(candidate.decision, "skip", JSON.stringify(candidate));
      }
      assert.equal(valueUse.has("Save changes"), true, `预扫描应收到值：${code}`);
    });
  }
}

test("保护穿透对照组：同样的写法放在不受保护的位置照常转换，预扫描不收", () => {
  const controls = [
    ...Object.values(FORMS).slice(1).map((x) => `const result = ${x};`),
    `const result = go(${FORMS.iife});`,
    `const x = { label: "Save changes" } as const;`,
    `const X_LABELS = { a: "Save changes" } as const;`,
    `const result = <div title={${FORMS.nested}} />;`,
    `if (ok) { toast({ title: "Save changes" }); }`,
    `const result = flag ? { label: "Save changes" } : null;`,
  ];
  for (const code of controls) {
    const file = code.includes("<div") ? "apps/web/src/c.tsx" : "apps/web/src/c.ts";
    const { ctx, valueUse } = contextOf(code, file);
    assert.ok(convert(code, file, ctx).includes(WRAP), `应当包裹：${code}`);
    assert.equal(valueUse.has("Save changes"), false, `预扫描不应收：${code}`);
  }
});

test("E1/E2 显示叶子：只有真正处于显示结果位置、且不在其他受保护位置里时才豁免", () => {
  const exempt = [
    `const a = [{ label: "Save changes" }] as const;`,
    `const a = { items: [{ title: flag ? "Save changes" : "Archive" }] } as const satisfies unknown;`,
    `const a = [{ label: "Save changes" } as const] as const;`,
    `const X_LABELS: Record<K, string> = { a: "Save changes" } as const;`,
    `const COPY_LABELS = { [K.a]: x ?? "Save changes" } as const;`,
  ];
  for (const code of exempt) {
    const { ctx, valueUse } = contextOf(code, "apps/web/src/e.ts");
    assert.equal(valueUse.has("Save changes"), false, code);
    assert.ok(convert(code, "apps/web/src/e.ts", ctx).includes(WRAP), code);
  }
  const notExempt = [
    `const a = { label: "Save changes" as const };`,
    `const a = { label: ("Save changes" as const) } as const;`,
    `const a = { label: foo({ label: "Save changes" }) } as const;`,
    `const a = { label: { [flag ? "Save changes" : "x"]: 1 } } as const;`,
    `const a = { label: (({ label: "Save changes" }).label === y) ? "A" : "B" } as const;`,
    `const a = { label: console.log({ label: "Save changes" }) } as const;`,
    `const a = { label: { nested: { label: "Save changes" } }.nested.label } as const;`,
    `const a = { run: () => toast({ title: "Save changes" }) } as const;`,
    `const a = [(sideEffect({ label: "x" }), "Save changes")] as const;`,
    `const X_LABELS = { a: { b: "Save changes" } } as const;`,
    `const X_LABELS = { a: foo("Save changes") } as const;`,
    `const holder = [(X_LABELS = { a: "Save changes" })] as const;`,
  ];
  for (const code of notExempt) {
    const { ctx, valueUse } = contextOf(code, "apps/web/src/e.ts");
    assert.equal(valueUse.has("Save changes"), true, code);
    assert.ok(!convert(code, "apps/web/src/e.ts", ctx).includes(WRAP), code);
  }
});

test("callee 解析解开 TS 包装：D 类白名单函数带断言时照常识别", () => {
  const code = `(window as any).confirm("Save changes"); api!.dialogs.confirm("Archive"); (setError satisfies Fn)("Close");`;
  const { ctx } = contextOf(code, "apps/web/src/d.ts");
  const rows = scanModule(code, "apps/web/src/d.ts", ctx).candidates.map((c) => `${c.key}:${c.category}:${c.decision}`);
  assert.deepEqual(rows, ["Save changes:D:translate", "Archive:D:translate", "Close:D:translate"]);
});
