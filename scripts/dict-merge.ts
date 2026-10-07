#!/usr/bin/env node
/**
 * 升级用：把填好的待译清单合并进词库（docs/UPGRADE.md 第 3 步）。
 *
 * 用法：node scripts/dict-merge.ts <清单.json>... [--baseline=<新基线 tag>] [--check]
 *   清单是 dict-todo.ts 生成的 dict/todo/<tag>.json，可以再加手写的附加清单（同样格式，例如
 *   dict/todo/<tag>.extra.json：复数后缀模板的单 / 复数两条具体模板、顺手修的旧词条缺口）。
 *   - zh 非空：写进 dict/zh-CN.json 对应 section。key 已存在且译文不同 → 报错停下（不静默覆盖已审过的词条）
 *   - skip 非空：写进 dict/todo-skip.json（{ key, reason }），以后 dict-todo.ts 不再列出
 *   - zh、skip 都空：计入「未处理」，合并照常进行
 *   - zh、skip 都填：报错
 *   - --baseline=：同时把词库的 baseline 字段改成新 tag
 *   - --check：只校验、不写文件
 * 写回按 CONVENTIONS §3：key 按 Unicode 码点排序、2 空格缩进、末尾换行；写完跑 scripts/check-dict.ts。
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { ZH_ROOT } from "../plugin/matcher.ts";
import type { SkipEntry, TodoEntry } from "./dict-todo.ts";

const argv = process.argv.slice(2);
const todoFiles = argv.filter((a) => !a.startsWith("--"));
if (todoFiles.length === 0) {
  console.error("用法：node scripts/dict-merge.ts <清单.json>... [--baseline=<tag>] [--check]");
  process.exit(2);
}
const checkOnly = argv.includes("--check");
const baseline = argv.find((a) => a.startsWith("--baseline="))?.slice("--baseline=".length);
const dictFile = path.join(ZH_ROOT, "dict", "zh-CN.json");
const skipFile = path.join(ZH_ROOT, "dict", "todo-skip.json");

const todo: TodoEntry[] = todoFiles.flatMap((file) => JSON.parse(fs.readFileSync(path.resolve(file), "utf8")));
const dict = JSON.parse(fs.readFileSync(dictFile, "utf8")) as {
  baseline: string;
  messages: Record<string, string>;
  templates: Record<string, string>;
};
const skipList: SkipEntry[] = fs.existsSync(skipFile) ? JSON.parse(fs.readFileSync(skipFile, "utf8")) : [];
const skipKeys = new Set(skipList.map((entry) => entry.key));

const errors: string[] = [];
let added = 0;
let skipped = 0;
let pending = 0;
for (const entry of todo) {
  const zh = (entry.zh ?? "").trim();
  const reason = (entry.skip ?? "").trim();
  if (zh !== "" && reason !== "") {
    errors.push(`${entry.key}：zh 和 skip 不能同时填`);
    continue;
  }
  if (zh === "" && reason === "") {
    pending += 1;
    continue;
  }
  if (reason !== "") {
    if (!skipKeys.has(entry.key)) {
      skipList.push({ key: entry.key, reason });
      skipKeys.add(entry.key);
      skipped += 1;
    }
    continue;
  }
  const section = dict[entry.section];
  const existing = section[entry.key];
  if (existing !== undefined && existing !== zh) {
    errors.push(`${entry.key}：词库里已有「${existing}」，与清单的「${zh}」不同（要改已有词条请直接编辑词库）`);
    continue;
  }
  if (existing === undefined) {
    section[entry.key] = zh;
    added += 1;
  }
}

if (errors.length > 0) {
  for (const error of errors) console.error(`✗ ${error}`);
  process.exit(1);
}

const byCodePoint = (a: string, b: string) => {
  const x = [...a];
  const y = [...b];
  for (let i = 0; i < Math.min(x.length, y.length); i += 1) {
    const d = (x[i].codePointAt(0) ?? 0) - (y[i].codePointAt(0) ?? 0);
    if (d !== 0) return d;
  }
  return x.length - y.length;
};
const sorted = (record: Record<string, string>) =>
  Object.fromEntries(Object.keys(record).sort(byCodePoint).map((key) => [key, record[key]]));

const nextDict = {
  baseline: baseline ?? dict.baseline,
  messages: sorted(dict.messages),
  templates: sorted(dict.templates),
};
const nextSkip = [...skipList].sort((a, b) => byCodePoint(a.key, b.key));

console.log(`新增词条 ${added}、新登记不再列出 ${skipped}、未处理 ${pending}${baseline ? `、baseline → ${baseline}` : ""}`);

// 先写到临时文件跑 check-dict，通过后再替换词库，校验失败时词库保持原样。--check 也走这一步，只是不写回。
const staged = `${dictFile}.merge-tmp`;
fs.writeFileSync(staged, `${JSON.stringify(nextDict, null, 2)}\n`);
try {
  execFileSync("node", [path.join(ZH_ROOT, "scripts", "check-dict.ts"), staged], { stdio: "inherit" });
} catch {
  fs.rmSync(staged);
  console.error("✗ 合并结果没通过 check-dict，词库未改动");
  process.exit(1);
}
if (checkOnly) {
  fs.rmSync(staged);
  console.log("（--check：校验通过，未写文件）");
  process.exit(0);
}

// 两个文件都先写好临时文件再替换；第二个替换失败时把词库恢复原样，两者不会一新一旧。
const stagedSkip = `${skipFile}.merge-tmp`;
fs.writeFileSync(stagedSkip, `${JSON.stringify(nextSkip, null, 2)}\n`);
const originalDict = fs.readFileSync(dictFile);
fs.renameSync(staged, dictFile);
try {
  fs.renameSync(stagedSkip, skipFile);
} catch (error) {
  fs.writeFileSync(dictFile, originalDict);
  fs.rmSync(stagedSkip, { force: true });
  console.error("✗ 写 dict/todo-skip.json 失败，词库已恢复原样");
  throw error;
}
