#!/usr/bin/env node
/**
 * 词库校验（CONVENTIONS §3）。
 *
 * 用法：node scripts/check-dict.ts [dict/zh-CN.json]
 * 通过：退出码 0；失败：退出码 1，逐条列出问题。
 *
 * 校验项：
 *  1. 文件存在、UTF-8、严格 JSON、顶层只有 baseline / messages / templates
 *  2. 文件以换行结尾，且按 2 空格缩进；重新序列化必须与原文件逐字节一致
 *  3. 无重复 key
 *  4. key 无首尾空白、非空；value 非空、无首尾空白
 *  5. key 按 Unicode 码点升序
 *  6. 中英占位符集合一致；占位符写法合法（{name} 或 {0}）
 *  7. 分类正确：key 含占位符的必须在 templates，不含的必须在 messages
 */

import fs from "node:fs";
import path from "node:path";
import { parse } from "@babel/parser";

const DEFAULT = "dict/zh-CN.json";
const target = process.argv[2] ?? DEFAULT;
const expectedBaseline = process.argv.includes("--baseline")
  ? process.argv[process.argv.indexOf("--baseline") + 1]
  : null;

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

function compareCodePoints(a, b) {
  const ca = Array.from(a);
  const cb = Array.from(b);
  const n = Math.min(ca.length, cb.length);
  for (let i = 0; i < n; i++) {
    const x = ca[i].codePointAt(0);
    const y = cb[i].codePointAt(0);
    if (x !== y) return x - y;
  }
  return ca.length - cb.length;
}

function placeholdersOf(text) {
  const set = new Set();
  for (const m of text.matchAll(/\{([A-Za-z][A-Za-z0-9_]*)\}/g)) set.add(m[1]);
  for (const m of text.matchAll(/\{(\d+)\}/g)) set.add(m[1]);
  return set;
}

function sameSet(a, b) {
  if (a.size !== b.size) return false;
  for (const x of a) if (!b.has(x)) return false;
  return true;
}

/** 合法占位符名称：{name} 或 {0}。 */
const LEGAL_PLACEHOLDER = /^[A-Za-z][A-Za-z0-9_]*$|^\d+$/;

/**
 * 校验占位符结构（CONVENTIONS §3：只能写成 {name} 或 {0}），返回错误列表。
 *
 * 做法：从左到右按原字符串扫描，遇到 `{` 就用层级计数找配对的 `}`（不做任何预删除，
 * 免得先删内层再让外层被当成字面文字而漏判）。逐个字符 fail-fast，任何花括号都必须
 * 落在「合法占位符」或「不含字母/数字的纯符号字面 { … }」之内，否则报错：
 *   - 非法名称：`{user name}`（含空白）、`{user-name}`（含连字符）
 *   - 嵌套花括号：`{{name}}`，以及非相邻的 `{outer {name} tail}`
 *   - 未配对：`{name`、`tail}`
 * 不会误报：文本里孤立的 `{ … }`（如 Niri 配置说明里的字面花括号）不含字母数字，视为普通文字。
 */
function placeholderStructureErrors(text) {
  const errs = [];
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (ch !== "{" && ch !== "}") {
      i++;
      continue;
    }
    if (ch === "}") {
      errs.push("出现未配对的 }");
      i++;
      continue;
    }
    // 层级计数找配对的 }
    let depth = 0;
    let j = -1;
    for (let k = i; k < text.length; k++) {
      if (text[k] === "{") depth++;
      else if (text[k] === "}") {
        depth--;
        if (depth === 0) {
          j = k;
          break;
        }
      }
    }
    if (j === -1) {
      errs.push("出现未配对的 {");
      break;
    }
    const inner = text.slice(i + 1, j);
    if (inner.includes("{")) {
      errs.push(`存在嵌套花括号：{${inner}}`);
    } else if (!LEGAL_PLACEHOLDER.test(inner) && /[\p{L}\p{N}]/u.test(inner)) {
      const why = /\s/.test(inner) ? "含空白" : /[\p{Script=Han}]/u.test(inner) ? "名称含中文" : "不符合 {name} / {0} 写法";
      errs.push(`占位符 {${inner}} 非法（${why}）`);
    }
    // 其余情况：合法占位符，或不含字母数字的纯符号字面 { … }
    i = j + 1;
  }
  return errs;
}

/** 找出 JSON 文本里重复出现的对象 key（JSON.parse 会静默去重，必须用 AST 才能发现）。 */
function findDuplicateKeys(text) {
  let ast;
  try {
    ast = parse(`(${text})`, { sourceType: "script" });
  } catch {
    return null; // 已由 JSON.parse 报错，这里不再重复报
  }
  const dups = [];
  const walk = (node) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) return node.forEach(walk);
    if (node.type === "ObjectExpression") {
      const seen = new Set();
      for (const p of node.properties) {
        if (p.type !== "ObjectProperty") continue;
        const k =
          p.key.type === "StringLiteral" || p.key.type === "Identifier" || p.key.type === "NumericLiteral"
            ? String(p.key.value ?? p.key.name)
            : null;
        if (k == null) continue;
        if (seen.has(k)) dups.push(k);
        seen.add(k);
      }
    }
    for (const k of Object.keys(node)) {
      if (k === "loc" || k === "start" || k === "end") continue;
      const v = node[k];
      if (v && typeof v === "object") walk(v);
    }
  };
  walk(ast.program.body[0]?.expression);
  return dups;
}

// ---------------------------------------------------------------- 读取

const file = path.resolve(process.cwd(), target);
if (!fs.existsSync(file)) {
  console.error(`✗ 文件不存在：${target}`);
  process.exit(1);
}

// 0. UTF-8：先读 Buffer，用拒绝非法字节的解码器解码（TextDecoder 默认 fatal:false 会静默替换）
const bytes = fs.readFileSync(file);
let raw;
try {
  raw = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
} catch {
  const bad = [...bytes].findIndex((b) => b > 0x7f && (b & 0xc0) !== 0xc0); // 只用于提示
  console.error(`✗ 不是合法 UTF-8：文件含非法字节（首个可疑位置约 ${bad >= 0 ? bad : "?"}）`);
  process.exit(1);
}
if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
  err("文件带 UTF-8 BOM，CONVENTIONS §3 要求纯 UTF-8");
}

// 1. 严格 JSON
let dict;
try {
  dict = JSON.parse(raw);
} catch (e) {
  console.error(`✗ 不是合法 JSON：${e.message}`);
  process.exit(1);
}

// 2. 末尾换行 + 缩进：重新序列化应逐字节一致（比较原始字节，不只比较解码文本）
if (!raw.endsWith("\n")) err("文件没有以换行结尾");
const canonical = JSON.stringify(dict, null, 2) + "\n";
if (canonical !== raw || !Buffer.from(canonical, "utf8").equals(bytes)) {
  err("序列化不一致：期望 2 空格缩进、无多余空行、key 顺序即文件顺序（用 JSON.stringify(obj, null, 2) 可复现）");
}

// 3. 重复 key
const dups = findDuplicateKeys(raw);
if (dups && dups.length) err(`存在重复 key：${[...new Set(dups)].slice(0, 10).map((d) => JSON.stringify(d)).join(", ")}`);

// 4. 顶层结构
if (typeof dict !== "object" || dict === null || Array.isArray(dict)) {
  console.error("✗ 顶层必须是对象");
  process.exit(1);
}
const topKeys = Object.keys(dict);
for (const k of topKeys) {
  if (!["baseline", "messages", "templates"].includes(k)) err(`顶层出现未知键 ${JSON.stringify(k)}`);
}
for (const k of ["baseline", "messages", "templates"]) {
  if (!(k in dict)) err(`顶层缺少 ${k}`);
}
if (typeof dict.baseline !== "string") err("baseline 必须是字符串");
else if (expectedBaseline && dict.baseline !== expectedBaseline)
  err(`baseline 是 ${JSON.stringify(dict.baseline)}，期望 ${JSON.stringify(expectedBaseline)}`);

// ---------------------------------------------------------------- 逐节校验

function checkSection(section, wantPlaceholders) {
  const obj = dict[section];
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
    err(`${section} 必须是对象`);
    return;
  }
  const keys = Object.keys(obj);

  // 排序
  for (let i = 1; i < keys.length; i++) {
    if (compareCodePoints(keys[i - 1], keys[i]) > 0) {
      err(`${section} 未按 Unicode 码点排序：${JSON.stringify(keys[i - 1])} 在 ${JSON.stringify(keys[i])} 之前`);
      break;
    }
  }

  for (const k of keys) {
    const v = obj[k];
    // key
    if (k === "") err(`${section} 出现空 key`);
    if (k !== k.trim()) err(`${section} 的 key 有首尾空白：${JSON.stringify(k)}`);
    // value
    if (typeof v !== "string") {
      err(`${section} 的 ${JSON.stringify(k)} 的值必须是字符串，实际是 ${typeof v}`);
      continue;
    }
    if (v.trim() === "") err(`${section} 的 ${JSON.stringify(k)} 值为空或纯空白`);
    if (v !== v.trim()) err(`${section} 的 ${JSON.stringify(k)} 的值有首尾空白：${JSON.stringify(v)}`);

    // 占位符
    const en = placeholdersOf(k);
    const zh = placeholdersOf(v);
    if (!sameSet(en, zh)) {
      err(
        `${section} 占位符不一致：${JSON.stringify(k)} → ${JSON.stringify(v)}；英文 {${[...en].join(",")}} vs 中文 {${[...zh].join(",")}}`
      );
    }

    // 分类
    if (wantPlaceholders && en.size === 0) {
      err(`${section} 里的 key 含占位符，但分类应为 messages：${JSON.stringify(k)}`);
    }
    if (!wantPlaceholders && en.size > 0) {
      err(`${section} 里的 key 不含占位符，但分类应为 templates：${JSON.stringify(k)}`);
    }

    // 占位符结构：非法名称、嵌套花括号一律报错（不再只警告）
    for (const issue of placeholderStructureErrors(k)) {
      err(`${section} key ${JSON.stringify(k)}：${issue}`);
    }
    for (const issue of placeholderStructureErrors(v)) {
      err(`${section} value ${JSON.stringify(v)}：${issue}`);
    }
  }
}

checkSection("messages", false);
checkSection("templates", true);

// ---------------------------------------------------------------- 汇总

for (const w of warnings) console.warn(`⚠ ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`✗ ${e}`);
  console.error(`\n${target}：${errors.length} 项不通过（${warnings.length} 项警告）`);
  process.exit(1);
}

const m = Object.keys(dict.messages).length;
const t = Object.keys(dict.templates).length;
console.log(`✓ ${target} 通过：messages ${m} + templates ${t} = ${m + t}（baseline ${dict.baseline}）`);
if (warnings.length) console.log(`  （${warnings.length} 项警告，见上）`);
process.exit(0);
