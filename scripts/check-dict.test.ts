#!/usr/bin/env node
/**
 * check-dict.ts 的可重复负向测试。
 *
 * 用法：node scripts/check-dict.test.ts
 * 每个用例生成一个临时词库文件，调 check-dict.ts 校验退出码；全部通过退出 0，否则退出 1。
 * 覆盖审核报告 r1 点名的三个缺口（非法 UTF-8、`{user name}`、`{{name}}`），
 * 以及排序、占位符集合、分类、首尾空白、空值、重复 key。
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CHECKER = path.join(ROOT, "scripts/check-dict.ts");
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "t3zh-checktest-"));

const BASE = { baseline: "v0.0.46-nightly.20261004.2644", messages: {}, templates: {} };

/** 写一个规范排版的词库文件；bytes 可给 Buffer 直接落盘（测非法编码）。 */
function write(name, obj, bytes) {
  const p = path.join(TMP, name);
  if (bytes) fs.writeFileSync(p, bytes);
  else fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n", "utf8");
  return p;
}

function run(file) {
  const r = spawnSync(process.execPath, [CHECKER, file], { encoding: "utf8" });
  return { code: r.status, out: (r.stdout ?? "") + (r.stderr ?? "") };
}

const cases = [];
function expect(name, file, want) {
  cases.push({ name, file, want });
}

// —— 通过用例：规范骨架
expect("规范骨架应通过", write("ok.json", { ...BASE, messages: { "Inherit defaults": "继承默认设置" } }), 0);

// —— 重要 3：非法 UTF-8。
// 只把合法 JSON value 内部的一个字节替换成 0xff，引号和结构原样保留：
// 这样旧校验器（宽松解码）会静默把 0xff 换成 U+FFFD、判定 JSON 合法而退出 0，
// 修复后（fatal 解码）必须退出 1——这个输入才能真正防住旧缺陷回归。
{
  const good = Buffer.from(JSON.stringify({ ...BASE, messages: { a: "继承默认设置" } }, null, 2) + "\n", "utf8");
  const i = good.indexOf(Buffer.from("继", "utf8")); // "继" 的首字节，位于字符串 value 内
  const bad = Buffer.from(good);
  bad[i] = 0xff; // 只破坏 value 内部一个字节，两侧引号不动
  expect("非法 UTF-8 字节应拒绝（引号与结构保留）", write("bad-utf8.json", null, bad), 1);
}

// —— 重要 4：非法占位符 / 嵌套花括号
expect(
  "含空白的非法占位符 {user name} 应拒绝",
  write("bad-ph.json", { ...BASE, messages: { "Hello {user name}": "你好 {user name}" } }),
  1
);
expect(
  "嵌套占位符 {{name}} 应拒绝",
  write("nested-ph.json", { ...BASE, templates: { "Hello {{name}}": "你好 {{name}}" } }),
  1
);
expect(
  "Unicode 名称占位符 {名字} 应拒绝",
  write("cjk-ph.json", { ...BASE, messages: { "Hello {名字}": "你好 {名字}" } }),
  1
);
// —— 重要 1（r2）：非相邻嵌套，内层是合法占位符、外层含普通文字
expect(
  "非相邻嵌套占位符 {outer {name} tail} 应拒绝",
  write("separated-nested.json", { ...BASE, templates: { "Hello {outer {name} tail}": "你好 {outer {name} tail}" } }),
  1
);
expect(
  "未配对花括号 {name 应拒绝",
  write("unpaired.json", { ...BASE, messages: { "Hello {name": "你好 {name" } }),
  1
);
// —— 反例：字面花括号（不含字母数字）不该误报
expect(
  "字面花括号 { … } 应通过",
  write("literal-brace.json", {
    ...BASE,
    messages: { "Paste this inside binds { … } in your Niri config, then save.": "将此内容粘贴到 Niri 配置的 binds { … } 中，然后保存。" },
  }),
  0
);

// —— 其余既有检查
expect("未按码点排序应拒绝", write("unsorted.json", { ...BASE, messages: { zzz: "末", aaa: "首" } }), 1);
expect(
  "占位符集合不一致应拒绝",
  write("ph-mismatch.json", { ...BASE, templates: { "hi {name}": "你好" } }),
  1
);
expect(
  "含占位符却在 messages 应拒绝",
  write("cls1.json", { ...BASE, messages: { "hi {name}": "你好 {name}" } }),
  1
);
expect(
  "无占位符却在 templates 应拒绝",
  write("cls2.json", { ...BASE, templates: { "no placeholder": "没有占位符" } }),
  1
);
expect("key 有首尾空白应拒绝", write("ws.json", { ...BASE, messages: { " spaced": "有空格" } }), 1);
expect("值为空应拒绝", write("empty-value.json", { ...BASE, messages: { hello: "" } }), 1);
expect("值有首尾空白应拒绝", write("ws-value.json", { ...BASE, messages: { hello: " 你好 " } }), 1);
expect("重复 key 应拒绝", write("dup.json", null, Buffer.from('{\n  "baseline": "v0.0.46-nightly.20261004.2644",\n  "messages": {\n    "a": "甲",\n    "a": "乙"\n  },\n  "templates": {}\n}\n', "utf8")), 1);
expect("baseline 不匹配应拒绝", write("baseline.json", { ...BASE, baseline: "v0", messages: { a: "甲" } }), 1);

// —— 跑
let failed = 0;
for (const c of cases) {
  const args = [c.file];
  if (c.name.includes("baseline")) args.push("--baseline", BASE.baseline);
  const r = spawnSync(process.execPath, [CHECKER, ...args], { encoding: "utf8" });
  const got = r.status;
  const ok = got === c.want;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${c.name}（期望退出 ${c.want}，实得 ${got}）`);
  if (!ok) console.log("      " + ((r.stdout ?? "") + (r.stderr ?? "")).trim().split("\n").slice(0, 3).join("\n      "));
}

fs.rmSync(TMP, { recursive: true, force: true });
console.log(`\n${cases.length - failed}/${cases.length} 通过`);
process.exit(failed ? 1 : 0);
