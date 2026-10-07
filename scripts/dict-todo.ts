#!/usr/bin/env node
/**
 * 升级用：列出新基线上需要补译的文字，写成可直接填写的待译清单（docs/UPGRADE.md 第 3 步）。
 *
 * 用法：node scripts/dict-todo.ts <源码目录> --tag=<新基线 tag> [--out=<文件>]
 *   默认输出 dict/todo/<tag>.json。输出文件已存在时，同一 key 已填的 zh / skip 保留（可以分几次填）。
 *
 * 收两类（判定全部来自 plugin/matcher.ts，与 scripts/report.ts 同一套）：
 *   - untranslated：translate 候选，运行时查表（先 messages 再 templates）查不到
 *   - collision：suspicious / template-collision，静态文字不在 messages 却会被某条模板截走；
 *     补一条精确词条后它就变成 translate，并按精确词条翻译
 * 不收：dict/todo-skip.json 里登记过的 key（刻意保留英文的，例如发给 AI 的工具说明、格式名；或已由其他词条覆盖的，
 *   例如带复数后缀 `{1}` 的模板改由单、复数两条具体模板覆盖）。
 *
 * 每条：{ key, section, zh, skip, why, where[], collidesWith?, wrongResult? }
 *   - 填 zh：译文，dict-merge.ts 写进 dict/zh-CN.json 的 section（messages / templates）
 *   - 或填 skip：不加词条的理由，dict-merge.ts 写进 dict/todo-skip.json，以后升级不再列出
 *   - why：本条为什么进清单（untranslated / collision）
 * 排序：按第一个出现位置的文件路径、行号，同一文件的文字挨在一起，翻译时上下文连贯。
 */

import fs from "node:fs";
import path from "node:path";
import { ZH_ROOT, createScanContext, listScopeFiles, scanModule, type Candidate } from "../plugin/matcher.ts";
import { createTranslator } from "../runtime/t3zh-runtime.ts";

const argv = process.argv.slice(2);
const argValue = (prefix: string): string | undefined => argv.find((a) => a.startsWith(prefix))?.slice(prefix.length);
const rootArg = argv.find((a) => !a.startsWith("--"));
const tag = argValue("--tag=");
if (!rootArg || !tag) {
  console.error("用法：node scripts/dict-todo.ts <源码目录> --tag=<新基线 tag> [--out=<文件>]");
  process.exit(2);
}
const root = path.resolve(rootArg);
const outFile = path.resolve(argValue("--out=") ?? path.join(ZH_ROOT, "dict", "todo", `${tag}.json`));
const skipFile = path.join(ZH_ROOT, "dict", "todo-skip.json");

export interface TodoEntry {
  key: string;
  section: "messages" | "templates";
  zh: string;
  skip: string;
  why: "untranslated" | "collision";
  where: string[];
  collidesWith?: string;
  wrongResult?: string;
}

export interface SkipEntry {
  key: string;
  reason: string;
}

const skipList: SkipEntry[] = fs.existsSync(skipFile) ? JSON.parse(fs.readFileSync(skipFile, "utf8")) : [];
const skipKeys = new Set(skipList.map((entry) => entry.key));

const ctx = createScanContext({ root });
if (ctx.prescan.errors.length > 0) {
  for (const error of ctx.prescan.errors) console.error(`✗ 预扫描解析失败 ${error.file}: ${error.message}`);
  process.exit(1);
}
const translator = ctx.dict ? createTranslator(ctx.dict) : null;
const rel = (file: string) => path.relative(root, file).split(path.sep).join("/");

interface Group {
  entry: TodoEntry;
  firstFile: string;
  firstLine: number;
}
const groups = new Map<string, Group>();

function add(c: Candidate, why: TodoEntry["why"]): void {
  if (skipKeys.has(c.key)) return;
  const id = `${c.kind}\u0000${c.key}`;
  let group = groups.get(id);
  if (!group) {
    group = {
      entry: {
        key: c.key,
        section: c.kind === "template" ? "templates" : "messages",
        zh: "",
        skip: "",
        why,
        where: [],
        ...(why === "collision"
          ? { collidesWith: c.collidingTemplate ?? "", wrongResult: translator ? translator(c.text) : "" }
          : {}),
      },
      firstFile: rel(c.file),
      firstLine: c.line,
    };
    groups.set(id, group);
  }
  if (group.entry.where.length < 5) {
    group.entry.where.push(`${rel(c.file)}:${c.line}（${c.category}，${c.component || c.context}）`);
  }
}

for (const file of listScopeFiles(root)) {
  for (const c of scanModule(fs.readFileSync(file, "utf8"), file, ctx).candidates) {
    if (c.decision === "translate") {
      const hit = translator && (translator.lookupMessage(c.text) !== undefined || translator.matchTemplate(c.text));
      if (!hit) add(c, "untranslated");
    } else if (c.decision === "suspicious" && c.reason === "template-collision") {
      add(c, "collision");
    }
  }
}

// 增量：保留旧清单里同一 key 已填的 zh / skip。
const previous = new Map<string, TodoEntry>();
if (fs.existsSync(outFile)) {
  for (const old of JSON.parse(fs.readFileSync(outFile, "utf8")) as TodoEntry[]) previous.set(`${old.section}\u0000${old.key}`, old);
}

const entries = [...groups.values()]
  .sort((a, b) => (a.firstFile < b.firstFile ? -1 : a.firstFile > b.firstFile ? 1 : a.firstLine - b.firstLine))
  .map(({ entry }) => {
    const old = previous.get(`${entry.section}\u0000${entry.key}`);
    return old ? { ...entry, zh: old.zh ?? "", skip: old.skip ?? "" } : entry;
  });

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, `${JSON.stringify(entries, null, 2)}\n`);
const count = (why: TodoEntry["why"]) => entries.filter((e) => e.why === why).length;
const filled = entries.filter((e) => (e.zh ?? "") !== "" || (e.skip ?? "") !== "").length;
console.log(
  `待译清单已写入 ${path.relative(ZH_ROOT, outFile)}：${entries.length} 条（未翻译 ${count("untranslated")}、模板误配 ${count("collision")}），` +
    `已填 ${filled}；跳过 todo-skip.json 登记的 ${skipKeys.size} 条`,
);
