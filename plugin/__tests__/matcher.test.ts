/**
 * matcher / 插件转换的行为测试（T03 说明书「测试」一节逐条覆盖，另加 T03 扩充规则的测试）。
 * 运行：node --test "plugin/__tests__/*.test.ts"（或 npm run test:plugin）
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  cleanJsxText,
  isIdentifierLike,
  isInScope,
  loadAllowSuspicious,
  scanModule,
  type Candidate,
} from "../matcher.ts";
import { makeContext, run, transform, transformed } from "./helpers.ts";
import { createTranslator, installT3zhRuntime } from "../../runtime/t3zh-runtime.ts";
import { SAMPLE_DICT } from "./helpers.ts";

const FILE = "apps/web/src/Example.tsx";

function scan(code: string, ctx = makeContext(), file = FILE): Candidate[] {
  return scanModule(code, file, ctx).candidates;
}

function find(candidates: Candidate[], key: string): Candidate {
  const hit = candidates.find((candidate) => candidate.key === key);
  assert.ok(hit, `candidate ${JSON.stringify(key)} not found in ${JSON.stringify(candidates.map((c) => c.key))}`);
  return hit;
}

// ---------------------------------------------------------------------------
// A：JSX 文本
// ---------------------------------------------------------------------------

test("A: JSX 文本被包裹，多行空白按 JSX 规则折叠", () => {
  const code = `export function X() {\n  return (\n    <p>\n      Hello\n      world\n    </p>\n  );\n}\n`;
  const out = transformed(code);
  assert.match(out, /<p>\{__t3zh_t\("Hello world"\)\n\n\n\}<\/p>/);
  const candidate = find(scan(code), "Hello world");
  assert.equal(candidate.category, "A");
  assert.equal(candidate.decision, "translate");
  assert.equal(candidate.line, 4, "行号指向文字所在行");
  // 行数不变：后续代码行号不受影响。
  assert.equal(out.split("\n").length, code.split("\n").length);
});

test("A: cleanJsxText 与 React/Babel 规则一致", () => {
  assert.equal(cleanJsxText("\n    Hello\n    world\n  "), "Hello world");
  assert.equal(cleanJsxText("Hello "), "Hello ", "单行文本保留首尾空格");
  assert.equal(cleanJsxText("  lead\n\t\ttrail  "), "  lead trail  ");
  assert.equal(cleanJsxText("\n   \n  "), "");
  assert.equal(cleanJsxText("a \n  b"), "a  b", "不间断空格不算可折叠空白");
  assert.equal(cleanJsxText("x\r\n  y"), "x y");
});

test("A: 与元素混排的文本照常转换（jsx-text-fragment），首尾空格保留给运行时", () => {
  const code = `const x = <p>Click <b>here</b> now</p>;`;
  const out = transformed(code);
  assert.match(out, /<p>\{__t3zh_t\("Click "\)\}<b>\{__t3zh_t\("here"\)\}<\/b>\{__t3zh_t\(" now"\)\}<\/p>/);
  assert.equal(find(scan(code), "Click").reason, "jsx-text-fragment");
});

test("A: 文本和表达式混排记 mixed-jsx，不转换", () => {
  const code = `const x = <span>{count} files</span>;\nconst y = <span>Status: {ok ? "Good" : "Bad"}</span>;`;
  const candidates = scan(code);
  for (const key of ["files", "Status:", "Good", "Bad"]) {
    const candidate = find(candidates, key);
    assert.equal(candidate.decision, "skip");
    assert.equal(candidate.reason, "mixed-jsx");
  }
  assert.equal(transformed(code), code);
});

test("A: JSX 子表达式里直接渲染的字符串（条件分支、&&、||）被包裹；条件本身不动", () => {
  const code = `const x = <b>{busy ? "Saving" : mode === "Default" ? "Save changes" : "Save"}</b>;\nconst y = <i>{show && "Archive"}{name || "Untitled"}</i>;`;
  const out = transformed(code);
  assert.match(out, /busy \? __t3zh_t\("Saving"\) : mode === "Default" \? __t3zh_t\("Save changes"\) : __t3zh_t\("Save"\)/);
  assert.match(out, /show && __t3zh_t\("Archive"\)/);
  assert.match(out, /name \|\| __t3zh_t\("Untitled"\)/);
  assert.ok(!out.includes(`__t3zh_t("Default")`), "比较里的字符串不动");
});

test("A: 纯空白、纯符号文本不包裹", () => {
  const code = `const x = <p>{" "}·{a}</p>;\nconst y = <p>  </p>;`;
  assert.equal(transformed(code), code);
  assert.equal(find(scan(code), "·").reason, "no-letters");
});

// ---------------------------------------------------------------------------
// B：JSX 属性
// ---------------------------------------------------------------------------

test("B: 白名单属性被包裹，非白名单属性（className、key、data-*、value…）不动", () => {
  const code = [
    `const x = <input`,
    `  placeholder="Search…"`,
    `  title={"Settings"}`,
    `  aria-label={\`Close\`}`,
    `  className="Settings"`,
    `  key="Settings"`,
    `  data-label="Settings"`,
    `  value="Settings"`,
    `  name="Settings"`,
    `  id="Settings"`,
    `/>;`,
  ].join("\n");
  const out = transformed(code);
  assert.match(out, /placeholder=\{__t3zh_t\("Search…"\)\}/);
  assert.match(out, /title=\{__t3zh_t\("Settings"\)\}/);
  assert.match(out, /aria-label=\{__t3zh_t\(`Close`\)\}/);
  for (const attr of ["className", "key", "data-label", "value", "name", "id"]) {
    assert.ok(out.includes(`${attr}="Settings"`), `${attr} 不应被改动`);
  }
});

test("B: 属性字符串保留原样（HTML 实体已解码、换行不折叠），行数不变", () => {
  const code = `const x = <i title="a &amp; b\n   c">x</i>;\nconst after = 1;`;
  const out = transformed(code);
  assert.match(out, /title=\{__t3zh_t\("a & b\\n   c"\)\n\}/);
  assert.equal(out.split("\n").length, code.split("\n").length);
});

test("B: 原始白名单属性即使和值用途字面量相同也照常转换，但标记 valueUse", () => {
  const ctx = makeContext({ prescanSources: { "other.ts": `if (row.source === "Default") {}` } });
  const candidate = find(scan(`const x = <Badge label="Default" />;`, ctx), "Default");
  assert.equal(candidate.category, "B");
  assert.equal(candidate.decision, "translate");
  assert.equal(candidate.valueUse, true);
});

test("B: 扩充的属性名（如 ariaLabel、triggerLabel）可疑判定同 C 类", () => {
  const ctx = makeContext({ prescanSources: { "other.ts": `if (x === "Mixed") {}` } });
  const candidates = scan(`const x = <Picker triggerLabel="Mixed" ariaLabel="Model picker" />;`, ctx);
  assert.equal(find(candidates, "Mixed").decision, "suspicious");
  assert.equal(find(candidates, "Model picker").decision, "translate");
});

// ---------------------------------------------------------------------------
// C：对象字面量属性
// ---------------------------------------------------------------------------

test("C: label/title/description 等键的字符串值被包裹，其他键不动", () => {
  const code = `export const options = [{ value: "default", label: "Inherit defaults", description: \`Uses \${x}\`, id: "Settings", kind: "Settings" }];`;
  const out = transformed(code, "apps/web/src/options.ts");
  assert.match(out, /label: __t3zh_t\("Inherit defaults"\)/);
  assert.match(out, /description: __t3zh_t\(`Uses \$\{x\}`\)/);
  assert.match(out, /value: "default"/);
  assert.match(out, /id: "Settings"/);
  assert.match(out, /kind: "Settings"/);
});

test("C: 带表达式的模板字面量整体包裹，运行时按模板匹配并代入", () => {
  const code = `const result = { title: \`Delete \${name}?\`, description: \`\${n} files changed\` };`;
  const out = transformed(code, "apps/web/src/x.ts");
  assert.match(out, /title: __t3zh_t\(`Delete \$\{name\}\?`\)/);
  const t = installT3zhRuntime(SAMPLE_DICT, { navigator: { languages: ["zh-CN"] } }).t;
  const value = run(out, t, { name: "notes.md", n: 3 }) as { title: string; description: string };
  assert.equal(value.title, "删除 notes.md？");
  assert.equal(value.description, "已更改 3 个文件");
  // en 模式原样输出
  const en = installT3zhRuntime(SAMPLE_DICT, { navigator: { languages: ["en-US"] } }).t;
  assert.deepEqual(run(out, en, { name: "notes.md", n: 3 }), { title: "Delete notes.md?", description: "3 files changed" });
});

test("C: 解构默认值 `{ label = \"...\" }` 记 C 类（destructuring-default）", () => {
  const code = `function Button({ label = "Save changes", size = "Large" }) { return label; }`;
  const out = transformed(code, "apps/web/src/b.tsx");
  assert.match(out, /label = __t3zh_t\("Save changes"\)/);
  assert.match(out, /size = "Large"/);
  assert.equal(find(scan(code), "Save changes").reason, "destructuring-default");
});

test("C: 发给服务端的命令输入（input: {...}）不转换", () => {
  const code = `forkThread({ environmentId, input: { title: \`\${t} fork\` } }); toast({ title: "Settings" });`;
  const candidates = scan(code);
  assert.equal(find(candidates, "{0} fork").reason, "rpc-input");
  assert.equal(find(candidates, "Settings").decision, "translate");
});

// ---------------------------------------------------------------------------
// D：白名单函数参数
// ---------------------------------------------------------------------------

test("D: 白名单函数的字符串参数被包裹，非白名单函数不动", () => {
  const code = `setError("Settings"); this.setError("Settings"); api.dialogs.confirm("Archive"); setThreadError(id, "Close"); setStatus("Settings"); window.confirm("Close");`;
  const out = transformed(code, "apps/web/src/d.ts");
  assert.match(out, /setError\(__t3zh_t\("Settings"\)\)/);
  assert.match(out, /this\.setError\(__t3zh_t\("Settings"\)\)/);
  assert.match(out, /api\.dialogs\.confirm\(__t3zh_t\("Archive"\)\)/);
  assert.match(out, /setThreadError\(id, __t3zh_t\("Close"\)\)/);
  assert.match(out, /setStatus\("Settings"\)/);
  assert.match(out, /window\.confirm\(__t3zh_t\("Close"\)\)/);
});

// ---------------------------------------------------------------------------
// 从不转换
// ---------------------------------------------------------------------------

test("从不转换：console.* 和 new Error(...)、错误类构造", () => {
  const code = [
    `console.log({ label: "Settings" });`,
    `console.error(<span title="Settings">Settings</span>);`,
    `throw new Error({ title: "Settings" });`,
    `const e = new FooError({ description: "Settings" });`,
    `const f = Data.TaggedError({ title: "Settings" });`,
    `const g = AcpRequestError.internalError({ title: "Settings" });`,
    `function h() { throw { title: "Settings" }; }`,
  ].join("\n");
  const candidates = scan(code);
  assert.ok(candidates.length > 0);
  for (const candidate of candidates) assert.equal(candidate.decision, "skip", JSON.stringify(candidate));
  assert.deepEqual(
    [...new Set(candidates.map((candidate) => candidate.reason))].sort(),
    ["console", "error-constructor", "throw"],
  );
  assert.equal(transformed(code), code);
});

test("从不转换：setError 这类小写函数不算错误类（D 类照常处理）", () => {
  assert.equal(find(scan(`setError("Settings");`), "Settings").decision, "translate");
});

test("从不转换：=== 两侧、switch case、比较里的条件分支", () => {
  const code = [
    `if (row.source === "Default") {}`,
    `const same = "Settings" !== value;`,
    `switch (kind) { case "Settings": break; }`,
    `const label = x === "Default" ? 1 : 2;`,
    `const obj = { label: kind === "Settings" ? "Default" : "Archive" };`,
  ].join("\n");
  const out = transformed(code, "apps/web/src/c.ts");
  assert.ok(out.includes(`row.source === "Default"`));
  assert.ok(out.includes(`"Settings" !== value`));
  assert.ok(out.includes(`case "Settings":`));
  assert.ok(out.includes(`x === "Default" ? 1 : 2`));
  assert.ok(out.includes(`kind === "Settings" ?`), "条件里的比较不动");
});

test("从不转换：as const 里无键名的元素、非白名单键的值、对值本身的 as const 断言", () => {
  const code = [
    `export const NAMES = ["Settings", "Archive"] as const;`,
    `export const TABS = [{ id: "general", value: "Settings", to: "/settings/general" }] as const;`,
    `export const ONE = { label: "Close" as const };`,
  ].join("\n");
  const candidates = scan(code, makeContext(), "apps/web/src/tabs.ts");
  assert.deepEqual(candidates.map((c) => `${c.key}:${c.decision}:${c.reason}`), ["Close:skip:as-const"]);
  assert.equal(transformed(code, "apps/web/src/tabs.ts"), code);
});

test("E1：as const 数组/对象里白名单键（label/title/description…）的值按 C 类转换，其他键不动", () => {
  const code = [
    `export const TABS = [{ id: "general", label: "Settings", to: "/settings/general" }] as const;`,
    `export const MODES = { a: { title: "Archive", description: cond ? "Close" : "Default" } } as const satisfies Record<string, unknown>;`,
  ].join("\n");
  const candidates = scan(code, makeContext(), "apps/web/src/tabs.ts");
  assert.deepEqual(
    candidates.map((c) => `${c.key}:${c.decision}:${c.reason}:${c.rule}`),
    ["Settings:translate:as-const-property:E1", "Archive:translate:as-const-property:E1", "Close:translate:as-const-property:E1", "Default:translate:as-const-property:E1"],
  );
  const out = transformed(code, "apps/web/src/tabs.ts");
  assert.match(out, /id: "general", label: __t3zh_t\("Settings"\), to: "\/settings\/general"/);
});

test("E1：预扫描不再把 as const 里白名单键的值记为值用途，其他 as const 元素照旧", () => {
  const ctx = makeContext({
    prescanSources: {
      "search.ts": `export const ITEMS = [{ id: "project-grouping", title: "Project grouping", hint: cond ? "A hint" : "B hint" }, "Bare"] as const;`,
    },
  });
  assert.equal(ctx.valueUse.has("Project grouping"), false);
  assert.equal(ctx.valueUse.has("A hint"), false);
  assert.equal(ctx.valueUse.has("project-grouping"), true, "非白名单键的值照旧是值用途");
  assert.equal(ctx.valueUse.has("Bare"), true, "无键名元素照旧是值用途");
});

test("E1：值用途检查照常——as const 里的 label 若在别处被比较，记 suspicious", () => {
  const ctx = makeContext({ prescanSources: { "a.ts": `if (tab.label === "Settings") {}` } });
  const candidate = find(scan(`export const TABS = [{ label: "Settings" }] as const;`, ctx, "apps/web/src/t.ts"), "Settings");
  assert.equal(candidate.decision, "suspicious");
  assert.equal(candidate.reason, "value-use");
  assert.equal(candidate.rule, "E1");
});

test("从不转换：带标签的模板字面量、className 工具函数、atom 调试标签", () => {
  const code = [
    "const a = css`title: ${x}`;",
    `const b = cva("p-2", { variants: { tone: { title: "Settings text-lg" } } });`,
    `const c = useAtomCommand(cmd, { label: "load earlier thread history" });`,
    `const d = createEnvironmentRpcCommand({ label: "environment-data:device:list" });`,
  ].join("\n");
  const candidates = scan(code, makeContext(), "apps/web/src/m.ts");
  assert.ok(candidates.every((candidate) => candidate.decision === "skip"));
  assert.equal(find(candidates, "Settings text-lg").reason, "non-display-call");
  assert.equal(transformed(code, "apps/web/src/m.ts"), code);
});

test("从不转换：标识符/路径/URL 样的文本", () => {
  for (const key of ["environment-data:device:list", "/model", "--tailscale", "t3.json", "https://example.com", "#71717b", "~/.codex"]) {
    assert.equal(isIdentifierLike(key), true, key);
  }
  for (const key of ["auto-settle", "12-hour", "Settings", "Delete files?", "files."]) {
    assert.equal(isIdentifierLike(key), false, key);
  }
  assert.equal(find(scan(`const x = <input placeholder="https://api.example.com" />;`), "https://api.example.com").reason, "identifier-like");
});

test("逃生口：/* t3zh-skip */ 对节点及其子树生效", () => {
  const code = [
    `const a = { /* t3zh-skip */ label: "Settings", title: "Archive" };`,
    `const b = { label: /* t3zh-skip */ "Close" };`,
    `/* t3zh-skip */`,
    `const c = <p title="Settings">Hello world</p>;`,
    `const d = (`,
    `  <div>`,
    `    {/* t3zh-skip */}`,
    `    <span>Default</span>`,
    `    <span>Archive</span>`,
    `  </div>`,
    `);`,
  ].join("\n");
  const candidates = scan(code);
  const reasons = candidates.map((candidate) => `${candidate.key}:${candidate.decision}:${candidate.reason}`);
  assert.deepEqual(reasons, [
    "Settings:skip:skip-comment",
    "Archive:translate:property",
    "Close:skip:skip-comment",
    "Settings:skip:skip-comment",
    "Hello world:skip:skip-comment",
    "Default:skip:skip-comment",
    "Archive:translate:jsx-text",
  ]);
});

// ---------------------------------------------------------------------------
// 文件范围
// ---------------------------------------------------------------------------

test("范围：测试文件、stories、声明文件、node_modules 不处理", () => {
  assert.equal(isInScope("apps/web/src/components/Foo.tsx"), true);
  assert.equal(isInScope("packages/shared/src/x.ts"), true);
  for (const file of [
    "apps/web/src/components/Foo.test.tsx",
    "apps/web/src/components/Foo.spec.ts",
    "apps/web/src/components/__tests__/Foo.tsx",
    "apps/web/src/components/Foo.stories.tsx",
    "apps/web/src/env.d.ts",
    "apps/web/src/perf.bench.ts",
    "apps/web/node_modules/x/src/a.ts",
    "apps/server/src/index.ts",
    "apps/web/vite.config.ts",
    "packages/shared/test/a.ts",
  ]) {
    assert.equal(isInScope(file), false, file);
  }
});

// ---------------------------------------------------------------------------
// 可疑项
// ---------------------------------------------------------------------------

const DEFAULT_DUAL_USE = {
  "apps/web/src/components/settings/KeybindingsSettings.tsx": `export function Row({ row }) { const canRemove = row.source !== "Default"; return canRemove; }`,
};
const SETTING_INHERITANCE = `export const INHERIT = { label: "Default", description: "Inherit defaults" };`;

test("可疑项：'Default' 既用于比较又用于 C 类 label——比较处不动，label 记 suspicious 且不转换", () => {
  const ctx = makeContext({ prescanSources: DEFAULT_DUAL_USE });
  // 比较处：本身不是候选位置，转换后原样保留
  const compare = DEFAULT_DUAL_USE["apps/web/src/components/settings/KeybindingsSettings.tsx"];
  assert.equal(transformed(compare, "apps/web/src/components/settings/KeybindingsSettings.tsx", ctx), compare);
  // C 类 label
  const candidates = scan(SETTING_INHERITANCE, ctx, "apps/web/src/components/settings/SettingInheritance.tsx");
  const label = find(candidates, "Default");
  assert.equal(label.category, "C");
  assert.equal(label.decision, "suspicious");
  assert.equal(label.reason, "value-use");
  assert.equal(label.edit, undefined);
  const out = transformed(SETTING_INHERITANCE, "apps/web/src/components/settings/SettingInheritance.tsx", ctx);
  assert.match(out, /label: "Default"/);
  assert.match(out, /description: __t3zh_t\("Inherit defaults"\)/);
});

test("可疑项放行：allow-suspicious 里的 key 转换（allow-listed），未放行的仍跳过", () => {
  const prescanSources = { "a.ts": `if (a === "Default" || b === "Archive") {}` };
  const code = `export const x = [{ label: "Default" }, { label: "Archive" }];`;
  const ctx = makeContext({ prescanSources, allow: ["Default"] });
  const candidates = scan(code, ctx, "apps/web/src/x.ts");
  assert.equal(find(candidates, "Default").decision, "translate");
  assert.equal(find(candidates, "Default").reason, "allow-listed");
  assert.equal(find(candidates, "Archive").decision, "suspicious");
  const out = transformed(code, "apps/web/src/x.ts", ctx);
  assert.match(out, /label: __t3zh_t\("Default"\)/);
  assert.match(out, /label: "Archive"/);
});

test("可疑项放行表：文件不存在视为空；格式不对报错", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "t3zh-allow-"));
  assert.equal(loadAllowSuspicious(path.join(dir, "missing.json")).size, 0);
  fs.writeFileSync(path.join(dir, "ok.json"), `["Default", "Mixed"]`);
  assert.deepEqual([...loadAllowSuspicious(path.join(dir, "ok.json"))], ["Default", "Mixed"]);
  fs.writeFileSync(path.join(dir, "bad.json"), `{"Default": true}`);
  assert.throws(() => loadAllowSuspicious(path.join(dir, "bad.json")));
  fs.rmSync(dir, { recursive: true });
});

test("预扫描：比较、case、as const、字面量类型、enum、对象键、Schema.Literal、includes 都算值用途", () => {
  const ctx = makeContext({
    prescanSources: {
      "a.ts": [
        `if (x == "Cmp") {}`,
        `switch (y) { case "Case": }`,
        `const z = ["AsConst"] as const;`,
        `type T = "LitType" | "Other";`,
        `enum E { EnumKey = "EnumValue" }`,
        `const o = { ObjKey: 1, "Str Key": 2 }; o["Member Key"];`,
        `const s = Schema.Literals(["SchemaLit"]);`,
        `["Listed"].includes(v); set.has("Has");`,
      ].join("\n"),
    },
  });
  for (const value of ["Cmp", "Case", "AsConst", "LitType", "EnumKey", "EnumValue", "ObjKey", "Str Key", "Member Key", "SchemaLit", "Listed", "Has"]) {
    assert.ok(ctx.valueUse.has(value), value);
  }
});

// ---------------------------------------------------------------------------
// 模板误配
// ---------------------------------------------------------------------------

test("模板误配：不在 messages 的静态文本若会被模板匹配，记 suspicious（template-collision），不包裹", () => {
  const code = `toast({ title: "Rendering diagram", description: "Failed to switch to main" }); toast({ title: "Settings" });`;
  const candidates = scan(code);
  const custom = find(candidates, "Rendering diagram");
  assert.equal(custom.decision, "suspicious");
  assert.equal(custom.reason, "template-collision");
  assert.equal(custom.collidingTemplate, "{minutes}m");
  assert.equal(find(candidates, "Failed to switch to main").collidingTemplate, "{head} to {base}");
  assert.equal(find(candidates, "Settings").decision, "translate");
  // 运行时本身仍按 §5 匹配（证明不包裹是必要的）
  assert.equal(createTranslator(SAMPLE_DICT)("Rendering diagram"), "Rendering diagra 分钟");
});

test("模板误配：带表达式的模板字面量若被骨架不同的模板匹配，记 suspicious；骨架相同则照常转换", () => {
  const code = "toast({ title: `Push to ${branch}`, description: `${n} files changed` });";
  const candidates = scan(code);
  assert.equal(find(candidates, "Push to {0}").reason, "template-collision");
  assert.equal(find(candidates, "{0} files changed").decision, "translate");
});

// ---------------------------------------------------------------------------
// 改法细节
// ---------------------------------------------------------------------------

test("import 注入：放在指令序言之后（保留 \"use no memo\" 等指令），不改变行号", () => {
  const withDirective = `"use no memo";\nexport const x = <p>Settings</p>;\n`;
  const out = transform(withDirective).output?.code ?? "";
  assert.ok(out.startsWith(`"use no memo";import { __t3zh_t } from "virtual:t3zh-runtime";\n`), out);
  assert.equal(out.split("\n").length, withDirective.split("\n").length);
  const noSemicolon = `"use client"\nexport const x = <p>Settings</p>;\n`;
  const out2 = transform(noSemicolon).output?.code ?? "";
  assert.ok(out2.startsWith(`"use client";import { __t3zh_t } from "virtual:t3zh-runtime";\n`), out2);
  const plain = `export const x = <p>Settings</p>;\nconst y = 1;\n`;
  const plainOut = transform(plain).output?.code ?? "";
  assert.ok(plainOut.startsWith(`import { __t3zh_t } from "virtual:t3zh-runtime";export const x`), plainOut);
  assert.equal(plainOut.split("\n").length, plain.split("\n").length);
});

test("没有需要转换的位置时不改代码、不注入 import", () => {
  const result = transform(`export const x = 1; const y = <div className="a" />;`);
  assert.equal(result.output, null);
  assert.equal(result.edits, 0);
});

test("sourcemap：输出带 map，原位置可还原", () => {
  const code = `const a = 1;\nexport const x = <p title="Settings">Hello world</p>;\n`;
  const result = transform(code);
  assert.ok(result.output);
  const map = result.output.map;
  assert.equal(map.sources.length, 1);
  assert.ok(map.mappings.length > 0);
  assert.deepEqual(map.sourcesContent, [code]);
});

test(".ts 文件按 TypeScript 解析（允许 <T>x 断言），.tsx 才启用 JSX", () => {
  const code = `const v = <string>input; export const o = { label: "Settings" };`;
  const out = transformed(code, "apps/web/src/legacy.ts");
  assert.match(out, /label: __t3zh_t\("Settings"\)/);
});

test("产品名字标：<T3Wordmark /> 后紧跟的文字（\"Code\"）不翻译", () => {
  const code = [
    `const a = <span><T3Wordmark aria-label="T3" /><span className="x">Code</span></span>;`,
    `const b = <div><T3Wordmark />Code</div>;`,
    `const c = <div><Icon /><span>Code</span></div>;`,
  ].join("\n");
  const candidates = scan(code).filter((candidate) => candidate.key === "Code");
  assert.deepEqual(candidates.map((candidate) => candidate.reason), ["brand-name", "brand-name", "jsx-text"]);
});

test("E2：赋给 *_LABELS/*Labels/*Copy 等变量的对象字面量，所有字符串值按 C 类转换", () => {
  const code = [
    `export const WORKTREE_SUBMODULES_LABELS: Record<Mode, string> = { recursive: "Recursive", "top-level": "Top level only", [K.none]: cond ? "Skip" : "Never" };`,
    `const summaryLabels = { read: "read PRs" } as const;`,
    `const accessCopy = { title: "Archive", body: "Settings" };`,
    `const SECTION_TITLE = { a: "Close" };`,
    `const PANEL_TITLES = { a: "Default" };`,
  ].join("\n");
  const candidates = scan(code, makeContext(), "apps/web/src/labels.ts");
  const describe = (key: string) => {
    const c = find(candidates, key);
    return `${c.decision}:${c.reason}:${c.rule ?? "-"}:${c.context}`;
  };
  assert.equal(describe("Recursive"), "translate:label-map:E2:WORKTREE_SUBMODULES_LABELS");
  assert.equal(describe("Top level only"), "translate:label-map:E2:WORKTREE_SUBMODULES_LABELS");
  assert.equal(describe("Skip"), "translate:label-map:E2:WORKTREE_SUBMODULES_LABELS");
  assert.equal(describe("Never"), "translate:label-map:E2:WORKTREE_SUBMODULES_LABELS");
  assert.equal(describe("read PRs"), "translate:label-map:E2:summaryLabels", "as const 的标签映射表也按 E2");
  assert.equal(describe("Archive"), "translate:property:-:title", "白名单键仍按普通 C 类");
  assert.equal(describe("Settings"), "translate:label-map:E2:accessCopy");
  assert.equal(describe("Close"), "translate:label-map:E2:SECTION_TITLE");
  assert.equal(describe("Default"), "translate:label-map:E2:PANEL_TITLES");
});

test("E2 反例：名字不匹配、嵌套对象、数组、函数参数里的对象不转换", () => {
  const code = [
    `const STATUS_MAP = { a: "Settings" };`,
    `const LABELS_BY_KIND = { a: "Settings" };`,
    `const labels = { a: "Settings" };`,
    `const X_LABELS = { nested: { a: "Settings" } };`,
    `const WEEKDAY_LABELS = ["Sun", "Mon"] as const;`,
    `register(X_LABELS, { a: "Settings" });`,
  ].join("\n");
  assert.deepEqual(scan(code, makeContext(), "apps/web/src/labels.ts"), []);
});

test("E2：值若是值用途字面量记 suspicious；as const 的标签映射表不会把自己的值判成值用途", () => {
  const ctx = makeContext({
    prescanSources: {
      "a.ts": `if (mode === "Manual") {}`,
      "b.ts": `export const summaryLabels = { read: "read PRs" } as const;`,
    },
  });
  const candidates = scan(`const SORT_LABELS = { manual: "Manual", created: "Created" };`, ctx, "apps/web/src/s.ts");
  assert.equal(find(candidates, "Manual").decision, "suspicious");
  assert.equal(find(candidates, "Manual").rule, "E2");
  assert.equal(find(candidates, "Created").decision, "translate");
  assert.equal(ctx.valueUse.has("read PRs"), false);
});

test("E3：标签类函数（*Label/*Title/*Text/*Description/*Message、format*/describe*）的 return 字符串按 C 类转换", () => {
  const code = [
    `export function resolveEnvModeLabel(mode) { return mode === "worktree" ? "New worktree" : "Current checkout"; }`,
    "export const formatElapsed = (s) => s < 60 ? `${s}s ago` : \"Long ago\";",
    `const describeChecks = useCallback(() => { if (x) return "All checks passed"; return "No checks"; }, []);`,
    `const helpers = { panelTitle() { return "Archive"; }, statusText: () => "Settings" };`,
    `class A { errorMessage() { return "Close"; } }`,
  ].join("\n");
  const candidates = scan(code, makeContext(), "apps/web/src/labels.tsx");
  const rows = candidates.map((c) => `${c.key}:${c.decision}:${c.reason}:${c.context}`);
  assert.deepEqual(rows, [
    "New worktree:translate:label-function-return:resolveEnvModeLabel",
    "Current checkout:translate:label-function-return:resolveEnvModeLabel",
    "{0}s ago:translate:label-function-return:formatElapsed",
    "Long ago:translate:label-function-return:formatElapsed",
    "All checks passed:translate:label-function-return:describeChecks",
    "No checks:translate:label-function-return:describeChecks",
    "Archive:translate:label-function-return:panelTitle",
    "Settings:translate:label-function-return:statusText",
    "Close:translate:label-function-return:errorMessage",
  ]);
  assert.ok(!transformed(code, "apps/web/src/labels.tsx").includes(`__t3zh_t("worktree")`), "比较里的字符串不动");
});

test("E3 反例：名字不匹配、嵌套回调里的 return、数据函数例外、值用途", () => {
  const ctx = makeContext({ prescanSources: { "a.ts": `switch (s) { case "Default": }` } });
  const code = [
    `function resolveMode(x) { return "Settings"; }`,
    `function formatLabel(items) { return items.map((item) => "Archive"); }`,
    `function formatEnvelopeEntry(k) { return \`\${k} unavailable="true"/>\`; }`,
    `function sourceLabel(row) { return row.isDefault ? "Default" : "Manual"; }`,
  ].join("\n");
  const candidates = scan(code, ctx, "apps/web/src/x.ts");
  assert.deepEqual(
    candidates.map((c) => `${c.key}:${c.decision}:${c.reason}`),
    ['{0} unavailable="true"/>:skip:data-function', "Default:suspicious:value-use", "Manual:translate:label-function-return"],
  );
});
