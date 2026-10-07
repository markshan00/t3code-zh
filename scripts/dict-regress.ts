#!/usr/bin/env node
/**
 * 升级用：词库改动的回归检查（docs/UPGRADE.md 第 3 步，合并待译清单之后跑）。
 *
 * 用法：node scripts/dict-regress.ts [源码目录，默认 upstream/] [--old=<git 版本，默认 HEAD>]
 *
 * 对源码里全部 translate 候选，分别用旧词库（`git show <版本>:dict/zh-CN.json`）和当前工作区词库按运行时
 * 查表，分三类：
 *   - 新译出：旧词库下原样返回、现在有译文（补译的效果）
 *   - 误配修正：旧词库下是 template-collision（被宽模板截走，插件不包、界面显示英文），现在有精确词条
 *   - 回归：旧词库下已正确翻译、现在译文变了 —— 新加的模板截走了原本译好的文字，或者改了已有词条；
 *     以及旧词库下是 translate 且有译文、现在不再是 translate（例如新模板让它变成 template-collision，插件不包）
 * 「回归」非 0 时退出码 1，逐条列出；改已有词条是有意的，就在交接里说明。
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { ZH_ROOT, createScanContext, listScopeFiles, scanModule } from "../plugin/matcher.ts";
import { createTranslator, type T3zhDict } from "../runtime/t3zh-runtime.ts";

const argv = process.argv.slice(2);
const root = path.resolve(argv.find((a) => !a.startsWith("--")) ?? path.join(ZH_ROOT, "upstream"));
const oldRev = argv.find((a) => a.startsWith("--old="))?.slice("--old=".length) ?? "HEAD";

const oldDictText = execFileSync("git", ["-C", ZH_ROOT, "show", `${oldRev}:dict/zh-CN.json`], { encoding: "utf8" });
const oldDict: T3zhDict = JSON.parse(oldDictText);
const oldDictPath = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "t3zh-dict-regress-")), "zh-CN.json");
fs.writeFileSync(oldDictPath, oldDictText);
const newDict: T3zhDict = JSON.parse(fs.readFileSync(path.join(ZH_ROOT, "dict", "zh-CN.json"), "utf8"));
const oldT = createTranslator(oldDict);
const newT = createTranslator(newDict);

// 旧词库下的判定（哪些是 collision）要用旧词库建上下文；当前判定用当前词库。
const oldCtx = createScanContext({ root, dictPath: oldDictPath });
const ctx = createScanContext({ root });
const rel = (file: string) => path.relative(root, file).split(path.sep).join("/");

let total = 0;
let newly = 0;
let fixed = 0;
const regressions: string[] = [];
for (const file of listScopeFiles(root)) {
  const code = fs.readFileSync(file, "utf8");
  const oldDecision = new Map<string, string>();
  const oldCandidates = scanModule(code, file, oldCtx).candidates;
  for (const c of oldCandidates) oldDecision.set(`${c.start}:${c.end}`, `${c.decision}/${c.reason}`);
  const newCandidates = scanModule(code, file, ctx).candidates;
  const newDecision = new Map(newCandidates.map((c) => [`${c.start}:${c.end}`, `${c.decision}/${c.reason}`]));
  // 旧词库下包裹且译出、现在插件不再包裹：界面会从中文退回英文。
  for (const c of oldCandidates) {
    if (c.decision !== "translate" || oldT(c.text) === c.text) continue;
    const now = newDecision.get(`${c.start}:${c.end}`) ?? "（不再是候选）";
    if (now.startsWith("translate/")) continue;
    regressions.push(`${rel(file)}:${c.line} ${JSON.stringify(c.text)}  旧「${oldT(c.text)}」→ 新判定 ${now}，不再翻译`);
  }
  for (const c of newCandidates) {
    if (c.decision !== "translate") continue;
    total += 1;
    const before = oldT(c.text);
    const after = newT(c.text);
    if (before === after) continue;
    if (before === c.text) newly += 1;
    else if (oldDecision.get(`${c.start}:${c.end}`) === "suspicious/template-collision") fixed += 1;
    else regressions.push(`${rel(file)}:${c.line} ${JSON.stringify(c.text)}  旧「${before}」→ 新「${after}」`);
  }
}

console.log(`translate 候选 ${total}：新译出 ${newly}、误配修正 ${fixed}、回归 ${regressions.length}（对照 ${oldRev} 的词库）`);
for (const line of regressions) console.log(`  ✗ ${line}`);
process.exit(regressions.length > 0 ? 1 : 0);
