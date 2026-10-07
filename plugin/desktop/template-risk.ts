/**
 * 宽模板误配统计（T07-fix1 发现、fix2 整理成脚本）：对任意英文调用运行时 t() 会怎样。
 *
 * 用法：node plugin/desktop/template-risk.ts [样例条数，默认 15]
 *
 * 做法：用 survey-strings.ts 的同一套扫描，列出 upstream 里 apps/server/src、packages/client-runtime/src、
 * packages/ssh/src、apps/desktop/src 的多词字符串，只留出现在错误 / 原因 / 详情位置的
 * （所在位置含 message、reason、detail、Error、throw、failure），插值 {0}{1}{2} 依次代入
 * "origin/main"、"my-host"、"42"，再用当前 dict/zh-CN.json 建运行时的 createTranslator：
 *   - exact：lookupMessage 命中（有精确词条）；
 *   - template：没有精确词条却被某条模板匹配——这些就是「对任意文字调用 t()」会被改写的文字。
 * 只读，不改任何文件。
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { createTranslator, type T3zhDict } from "../../runtime/t3zh-runtime.ts";

const ZH_ROOT = path.resolve(import.meta.dirname, "../..");
const ROOTS = ["apps/server/src", "packages/client-runtime/src", "packages/ssh/src", "apps/desktop/src"];
const SAMPLE_VALUES = ["origin/main", "my-host", "42"];

const dict: T3zhDict = JSON.parse(fs.readFileSync(path.join(ZH_ROOT, "dict/zh-CN.json"), "utf8"));
const translate = createTranslator(dict);
const sampleLimit = Number(process.argv[2] ?? 15);

let total = 0;
let exact = 0;
let templated = 0;
const byTemplate = new Map<string, number>();
const samples: string[] = [];
for (const root of ROOTS) {
  const tsv = execFileSync(process.execPath, [path.join(ZH_ROOT, "plugin/desktop/survey-strings.ts"), path.join(process.env.T3ZH_UPSTREAM ? path.resolve(process.env.T3ZH_UPSTREAM) : path.join(ZH_ROOT, "upstream"), root)], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
    maxBuffer: 64 * 1024 * 1024,
  });
  for (const line of tsv.trim().split("\n")) {
    const [loc = "", json = "\"\"", ctx = ""] = line.split("\t");
    if (!/message|reason|detail|Error|throw|failure/.test(ctx)) continue;
    let text: string;
    try {
      text = JSON.parse(json) as string;
    } catch {
      continue;
    }
    text = text.replace(/\{(\d+)\}/g, (_, index: string) => SAMPLE_VALUES[Number(index) % SAMPLE_VALUES.length] ?? "x");
    total++;
    if (translate.lookupMessage(text) !== undefined) {
      exact++;
      continue;
    }
    const match = translate.matchTemplate(text);
    if (!match) continue;
    templated++;
    byTemplate.set(match.key, (byTemplate.get(match.key) ?? 0) + 1);
    if (samples.length < sampleLimit) samples.push(`${root}/${loc}\t${text}\t→ ${match.result}\t[${match.key}]`);
  }
}
const top = [...byTemplate.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
console.log(
  JSON.stringify(
    {
      dict: { messages: Object.keys(dict.messages).length, templates: Object.keys(dict.templates).length },
      total,
      exact,
      templateMatched: templated,
      topTemplates: Object.fromEntries(top),
    },
    null,
    2,
  ),
);
console.log(samples.join("\n"));
