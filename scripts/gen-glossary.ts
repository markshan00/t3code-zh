#!/usr/bin/env node
/**
 * 只重新生成术语表：读现有 dict/zh-CN.json，用 glossary.ts 的 renderGlossary 写回 dict/glossary.md。
 *
 * 用法：node scripts/gen-glossary.ts [dict/zh-CN.json] [dict/glossary.md]
 *
 * 存在的意义：extract-dict.ts 会从旧备份整体重跑并**覆盖** dict/zh-CN.json 的现有内容；
 * 当只想在不动主词库的前提下刷新术语表（例如 T06 往里加词条后），用这个脚本。
 * 主词库本身绝不被本脚本写入。
 */

import fs from "node:fs";
import path from "node:path";
import { renderGlossary } from "./glossary.ts";

const inPath = process.argv[2] ?? "dict/zh-CN.json";
const outPath = process.argv[3] ?? "dict/glossary.md";

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

const dict = JSON.parse(fs.readFileSync(inPath, "utf8"));
const messages = new Map(Object.entries(dict.messages ?? {}));
const templates = new Map(Object.entries(dict.templates ?? {}));
fs.writeFileSync(outPath, renderGlossary({ messages, templates, compareCodePoints }) + "\n", "utf8");
console.log(`✓ ${outPath} 已从 ${inPath} 重新生成（${messages.size} + ${templates.size} 条）`);
