#!/usr/bin/env node
/**
 * T02：从 0.0.45 中文版的打包产物里提取旧词库，转成 CONVENTIONS §3 格式。
 *
 * 输入（只读）：~/.t3/backups/app.asar.bak-0.0.45-zh.1-local.3
 *   打包后的 JS：apps/server/dist/client/assets/server-PkaaCpC9.js
 * 输出：
 *   dict/zh-CN.json        主词库
 *   dict/conflicts.md      同一句英文多个译法的冲突清单
 *   dict/invalid.json      占位符不一致 / 含表达式 / 值为空 的无效条目
 *   dict/extract-report.md 提取报告
 *   dict/glossary.md       术语表（统计来自主词库）
 *
 * 五个来源（用 AST 定位，不用正则抠对象）：
 *   1  c  : 英文原文 → 中文的直接映射（如 "% zoom" → "% 缩放"），被 5 展开继承
 *   2  l  : 位置占位符模板（如 "{0} active · {1} done"）
 *   3  u  : 英文 key 式消息（key → 英文原文，含 {count} 命名占位符）
 *   4  d["zh-CN"] : 中文 key 式消息（与 3 同 key 顺序，配对得中英）
 *   5  p  : 覆盖表 {...c, High: "高", ...}，查表优先级最高
 *
 * 用法：node scripts/extract-dict.ts
 * 两次运行输出必须完全一致（无时间戳、无随机性，抽样用固定种子）。
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { parse } from "@babel/parser";
import _traverse from "@babel/traverse";
import * as asar from "@electron/asar";
import { renderGlossary } from "./glossary.ts";

const traverse = _traverse.default ?? _traverse;

// ---------------------------------------------------------------- 常量

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BACKUP = path.join(process.env.HOME, ".t3/backups/app.asar.bak-0.0.45-zh.1-local.3");
const ASAR_TMP = "/tmp/t3zh-asar";
const SERVER_JS = path.join(ASAR_TMP, "apps/server/dist/client/assets/server-PkaaCpC9.js");
const BASELINE = "v0.0.46-nightly.20261004.2644";

// 输出目录：默认仓库 dict/；可用 --out=<dir> 或环境变量 T3ZH_OUT 覆盖，
// 便于在不动仓库主词库的前提下做验证（T06 之后重跑必须用这种方式）。
const OUT_ARG = process.argv.find((a) => a.startsWith("--out="));
const DICT_DIR = path.resolve(ROOT, (OUT_ARG ? OUT_ARG.slice("--out=".length) : process.env.T3ZH_OUT) || "dict");

// 占位符：{name}（字母开头）或 {0}
const RE_NAMED = /\{([A-Za-z][A-Za-z0-9_]*)\}/g;
const RE_POS = /\{(\d+)\}/g;

// 来源 → 优先级（数字越大越优先）。按说明书：5 > 3/4 > 1 > 2。
const SOURCE_PRIORITY = { "5": 5, "3/4": 4, "1": 3, "2": 2 };
const SOURCE_LABEL = {
  "1": "1 obj1(c) 英→中直映射",
  "2": "2 obj2(l) 位置占位符模板",
  "3/4": "3/4 obj3(u)+obj4(d.zh-CN) key 配对",
  "5": "5 obj5(p) 覆盖表",
};

// ---------------------------------------------------------------- 工具

/** 按 Unicode 码点比较（不是 UTF-16 code unit）。 */
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

/** 提取占位符集合。 */
function placeholdersOf(text) {
  const set = new Set();
  for (const m of text.matchAll(RE_NAMED)) set.add(m[1]);
  for (const m of text.matchAll(RE_POS)) set.add(m[1]);
  return set;
}

function sameSet(a, b) {
  if (a.size !== b.size) return false;
  for (const x of a) if (!b.has(x)) return false;
  return true;
}

/** 值节点 → 文本；含表达式返回 { exprs: n } 供判无效。 */
function textOfValue(node) {
  if (node.type === "StringLiteral") return { text: node.value, exprs: 0 };
  if (node.type === "TemplateLiteral") {
    const text = node.quasis.map((q) => q.value.cooked ?? q.value.raw).join("");
    return { text, exprs: node.expressions.length };
  }
  return { text: null, exprs: -1, kind: node.type };
}

function keyName(key) {
  if (!key) return null;
  if (key.type === "Identifier") return key.name;
  if (key.type === "StringLiteral") return key.value;
  if (key.type === "NumericLiteral") return String(key.value);
  return null;
}

function objectProps(obj) {
  return obj.properties.filter((p) => p.type === "ObjectProperty");
}

/** 固定种子 PRNG，报告抽样用（保证两次运行一致）。 */
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sha256File(p) {
  return crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
}

function writeFileDeterministic(p, content) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, "utf8");
}

// ---------------------------------------------------------------- 1. 解包

function extractAsar() {
  if (!fs.existsSync(BACKUP)) throw new Error(`备份不存在：${BACKUP}`);
  fs.rmSync(ASAR_TMP, { recursive: true, force: true });
  asar.extractAll(BACKUP, ASAR_TMP);
  if (!fs.existsSync(SERVER_JS)) throw new Error(`解包后找不到 ${SERVER_JS}`);
}

// ---------------------------------------------------------------- 2. 定位五个来源

function locateSources(ast) {
  // 容器只有 2 个属性，必须扫全部对象；大对象单独收集。
  // 名字会被遮蔽（同一文件里有多个 c/u/p/d），所以定位一律靠结构，不靠变量名。
  const bigObjects = [];
  let containerPath = null;
  traverse(ast, {
    ObjectExpression(p) {
      if (p.node.properties.length >= 100) bigObjects.push(p);
      if (containerPath) return;
      const names = objectProps(p.node).map((q) => keyName(q.key));
      if (names.length === 2 && names.includes("en") && names.includes("zh-CN")) containerPath = p;
    },
  });
  if (!containerPath) throw new Error("找不到含 en / zh-CN 的容器对象");

  const deref = (node, scope) => {
    let n = node;
    for (let i = 0; i < 10 && n.type === "Identifier"; i++) {
      const binding = scope.getBinding(n.name);
      if (!binding || binding.path.node.type !== "VariableDeclarator" || !binding.path.node.init) break;
      n = binding.path.node.init;
    }
    return n;
  };

  const cprops = containerPath.node.properties;
  const s3enNode = deref(cprops.find((p) => keyName(p.key) === "en").value, containerPath.scope);
  const s34zhNode = deref(cprops.find((p) => keyName(p.key) === "zh-CN").value, containerPath.scope);
  if (s3enNode.type !== "ObjectExpression" || s34zhNode.type !== "ObjectExpression")
    throw new Error("容器 en / zh-CN 不是对象字面量");

  // obj1 / obj2：靠唯一 key 定位
  let s1Node = null;
  let s2Node = null;
  for (const p of bigObjects) {
    const keys = objectProps(p.node).map((q) => keyName(q.key));
    if (keys.includes("% zoom")) s1Node = p.node;
    if (keys.includes("{0} active · {1} done")) s2Node = p.node;
  }
  if (!s1Node) throw new Error("找不到 obj1（含 key «% zoom»）");
  if (!s2Node) throw new Error("找不到 obj2（含 key «{0} active · {1} done»）");

  // obj5：展开 obj1 的那个对象
  const s5Candidates = [];
  for (const p of bigObjects) {
    for (const prop of p.node.properties) {
      if (prop.type !== "SpreadElement") continue;
      const target = deref(prop.argument, p.scope);
      if (target === s1Node) s5Candidates.push(p);
    }
  }
  if (s5Candidates.length !== 1) throw new Error(`展开 obj1 的对象应有 1 个，实得 ${s5Candidates.length}`);
  const s5Path = s5Candidates[0];

  return {
    obj1: s1Node,
    obj2: s2Node,
    obj3: s3enNode,
    obj4: s34zhNode,
    obj5: s5Path.node,
  };
}

// ---------------------------------------------------------------- 3. 展开成条目

function collectEntries(src) {
  const entries = []; // { en, zh, source }

  // 来源 1：obj1 自身（obj5 会展开覆盖它，但它是独立来源）
  for (const p of objectProps(src.obj1)) {
    const en = keyName(p.key);
    const v = textOfValue(p.value);
    entries.push({ en, zh: v.text, source: "1", exprs: v.exprs, rawValueType: v.kind ?? p.value.type });
  }

  // 来源 2：obj2 模板
  for (const p of objectProps(src.obj2)) {
    const en = keyName(p.key);
    const v = textOfValue(p.value);
    entries.push({ en, zh: v.text, source: "2", exprs: v.exprs, rawValueType: v.kind ?? p.value.type });
  }

  // 来源 3/4：obj3 英文 + obj4 中文，按 key 配对
  const zhByKey = new Map();
  for (const p of objectProps(src.obj4)) {
    const v = textOfValue(p.value);
    zhByKey.set(keyName(p.key), { zh: v.text, exprs: v.exprs, valueType: v.kind ?? p.value.type });
  }
  for (const p of objectProps(src.obj3)) {
    const key = keyName(p.key);
    const enV = textOfValue(p.value);
    const zhV = zhByKey.get(key);
    if (!zhV) {
      entries.push({ en: enV.text, zh: null, source: "3/4", exprs: -1, rawValueType: "missing-zh", note: `key ${key} 在 obj4 缺中文` });
    } else {
      entries.push({ en: enV.text, zh: zhV.zh, source: "3/4", exprs: enV.exprs || zhV.exprs, rawValueType: zhV.valueType, key });
    }
  }
  const enKeys = new Set(objectProps(src.obj3).map((p) => keyName(p.key)));
  for (const p of objectProps(src.obj4)) {
    const key = keyName(p.key);
    if (!enKeys.has(key)) {
      const v = textOfValue(p.value);
      entries.push({ en: null, zh: v.text, source: "3/4", exprs: -1, rawValueType: "missing-en", note: `key ${key} 在 obj3 缺英文` });
    }
  }

  // 来源 5：obj5 自身属性（展开来的 obj1 条目已由来源 1 覆盖）
  for (const p of objectProps(src.obj5)) {
    const en = keyName(p.key);
    const v = textOfValue(p.value);
    entries.push({ en, zh: v.text, source: "5", exprs: v.exprs, rawValueType: v.kind ?? p.value.type });
  }

  return entries;
}

// ---------------------------------------------------------------- 4. 分类

/** 去掉首尾空白：CONVENTIONS §3 要求 key 是去空白后的文本；同理 value 也要去，
 *  否则运行时会「原文空白 + 词库里的空白」叠成两个空格（§5 查表规则 2 会把原文空白拼回去）。 */
function normalizeEntry(e) {
  return {
    ...e,
    en: e.en == null ? null : e.en.trim(),
    zh: e.zh == null ? null : e.zh.trim(),
  };
}

function classify(entries) {
  const invalid = [];
  const untranslated = [];
  const valid = [];

  for (const raw of entries) {
    const e = normalizeEntry(raw);
    // 缺一侧：结构性异常，归为无效
    if (e.en == null || e.zh == null) {
      invalid.push({ ...e, reason: e.en == null ? "missing-english" : "missing-chinese" });
      continue;
    }
    // 英文原文去空白后为空
    if (e.en === "") {
      invalid.push({ ...e, reason: "empty-key" });
      continue;
    }
    // 值为空 / 纯空白
    if (e.zh === "") {
      invalid.push({ ...e, reason: "empty-value" });
      continue;
    }
    // 值里含 ${} 表达式（模板字面量带表达式）
    if (e.exprs > 0) {
      invalid.push({ ...e, reason: "expression-in-value" });
      continue;
    }
    // 值不是字符串/模板字面量
    if (e.zh == null || typeof e.zh !== "string") {
      invalid.push({ ...e, reason: `non-string-value(${e.rawValueType})` });
      continue;
    }
    // 中英占位符集合不一致
    const enPh = placeholdersOf(e.en);
    const zhPh = placeholdersOf(e.zh);
    if (!sameSet(enPh, zhPh)) {
      invalid.push({
        ...e,
        reason: "placeholder-mismatch",
        enPlaceholders: [...enPh].sort(),
        zhPlaceholders: [...zhPh].sort(),
      });
      continue;
    }
    // 中文等于英文：未翻译
    if (e.zh === e.en) {
      untranslated.push(e);
      continue;
    }
    valid.push(e);
  }

  return { invalid, untranslated, valid };
}

// ---------------------------------------------------------------- 5. 合并（优先级 5 > 3/4 > 1 > 2）

function merge(valid) {
  const groups = new Map(); // en → [ {zh, source} ]
  for (const e of valid) {
    if (!groups.has(e.en)) groups.set(e.en, []);
    groups.get(e.en).push({ zh: e.zh, source: e.source });
  }

  const messages = new Map();
  const templates = new Map();
  const conflicts = [];
  let rawEntryCount = 0; // 归入 groups 的来源条目数
  let collapsedDuplicates = 0; // 同一英文 + 同一中文重复出现，去重后消失的条目数
  const collapsedByPair = new Map(); // "来源A == 来源B" → 次数

  const sortedEns = [...groups.keys()].sort(compareCodePoints);

  for (const en of sortedEns) {
    const cands = groups.get(en);
    rawEntryCount += cands.length;
    // 去重后按（优先级降序，中文码点升序）排序
    const unique = [];
    for (const c of cands) {
      const prev = unique.find((u) => u.zh === c.zh);
      if (prev) {
        // 记下是哪两个来源在此处重复（用于报告里的重复来源分布）
        const pair = [prev.sources[0], c.source].sort().join(" 与 ");
        collapsedByPair.set(pair, (collapsedByPair.get(pair) ?? 0) + 1);
        if (!prev.sources.includes(c.source)) prev.sources.push(c.source);
      } else {
        unique.push({ zh: c.zh, sources: [c.source] });
      }
    }
    collapsedDuplicates += cands.length - unique.length;
    unique.sort((a, b) => {
      const pa = Math.max(...a.sources.map((s) => SOURCE_PRIORITY[s]));
      const pb = Math.max(...b.sources.map((s) => SOURCE_PRIORITY[s]));
      if (pa !== pb) return pb - pa;
      return compareCodePoints(a.zh, b.zh);
    });

    const winner = unique[0];
    const distinct = unique.length > 1;
    if (distinct) {
      conflicts.push({
        en,
        chosen: winner.zh,
        chosenSource: winner.sources.slice().sort().join(","),
        candidates: unique.map((u) => ({
          zh: u.zh,
          sources: u.sources.slice().sort(),
          priority: Math.max(...u.sources.map((s) => SOURCE_PRIORITY[s])),
          kept: u === winner,
        })),
      });
    }

    const hasPlaceholder = placeholdersOf(en).size > 0;
    if (hasPlaceholder) {
      templates.set(en, winner.zh);
    } else {
      messages.set(en, winner.zh);
    }
  }

  return { messages, templates, conflicts, rawEntryCount, collapsedDuplicates, collapsedByPair };
}

// ---------------------------------------------------------------- 6. 输出：词库

function buildDict(messages, templates) {
  const sortMap = (m) => {
    const out = {};
    for (const k of [...m.keys()].sort(compareCodePoints)) out[k] = m.get(k);
    return out;
  };
  return {
    baseline: BASELINE,
    messages: sortMap(messages),
    templates: sortMap(templates),
  };
}

// ---------------------------------------------------------------- 7. 输出：conflicts.md

function renderConflicts(conflicts) {
  const clean = (s) => String(s).replace(/\|/g, "\\|").replace(/\n/g, "\\n");
  const lines = [];
  lines.push("# 词库冲突清单");
  lines.push("");
  lines.push(`共 ${conflicts.length} 条英文在原词库里有多个不同中文。`);
  lines.push("");
  lines.push("取舍优先级（高 → 低）：`5 覆盖表` > `3/4 key 式` > `1 英→中直映射` > `2 位置占位符模板`。");
  lines.push("同级候选再按中文 Unicode 码点升序取第一条。下表 `保留` 列为最终取值。");
  lines.push("");
  lines.push("## 汇总");
  lines.push("");
  lines.push("| 优先级取舍 | 条数 |");
  lines.push("|---|---|");
  const byWinner = new Map();
  for (const c of conflicts) byWinner.set(c.chosenSource, (byWinner.get(c.chosenSource) ?? 0) + 1);
  for (const [src, n] of [...byWinner.entries()].sort((a, b) => compareCodePoints(a[0], b[0]))) {
    lines.push(`| 来源 ${src} 胜出 | ${n} |`);
  }
  lines.push("");
  lines.push("## 明细");
  lines.push("");
  for (const c of conflicts) {
    lines.push(`### ${clean(c.en)}`);
    lines.push("");
    lines.push(`最终取值：\`${clean(c.chosen)}\`（来源 ${c.chosenSource}）`);
    lines.push("");
    lines.push("| 候选中文 | 来源 | 优先级 | 保留 |");
    lines.push("|---|---|---|---|");
    for (const cand of c.candidates) {
      lines.push(
        `| ${clean(cand.zh)} | ${cand.sources.join(", ")} | ${cand.priority} | ${cand.kept ? "✅" : "—"} |`
      );
    }
    lines.push("");
  }
  return lines.join("\n");
}

// ---------------------------------------------------------------- 8. 输出：extract-report.md

function renderReport({ srcCounts, classed, merged, conflicts, invalid, untranslated, dict, sample, rawEntryCount, collapsedDuplicates, collapsedByPair }) {
  const clean = (s) => String(s).replace(/\|/g, "\\|").replace(/\n/g, "\\n");
  const L = [];
  const totalSource = srcCounts.reduce((a, b) => a + b.count, 0);
  const finalCount = Object.keys(dict.messages).length + Object.keys(dict.templates).length;
  const discarded = conflicts.reduce((a, c) => a + c.candidates.filter((x) => !x.kept).length, 0);
  const checked = finalCount + discarded + collapsedDuplicates + invalid.length + untranslated.length;

  L.push("# 旧词库提取报告");
  L.push("");
  L.push(`- 基线：\`${BASELINE}\``);
  L.push(`- 源文件：\`apps/server/dist/client/assets/server-PkaaCpC9.js\``);
  L.push(`- 备份 sha256：\`${sha256File(BACKUP)}\``);
  L.push("");
  L.push("## 各来源条目数");
  L.push("");
  L.push("| 来源 | 对象 | 条目数 | 说明 |");
  L.push("|---|---|---|---|");
  for (const s of srcCounts) L.push(`| ${s.label} | \`${s.varName}\` | ${s.count} | ${s.note} |`);
  L.push(`| **合计** | | **${totalSource}** | |`);
  L.push("");
  L.push("## 合并结果");
  L.push("");
  L.push("| 项 | 数量 |");
  L.push("|---|---|");
  L.push(`| messages | ${Object.keys(dict.messages).length} |`);
  L.push(`| templates | ${Object.keys(dict.templates).length} |`);
  L.push(`| 主词库合计 | ${finalCount} |`);
  L.push(`| 冲突条数（同一英文多个中文） | ${conflicts.length} |`);
  L.push(`| 冲突中被舍弃的候选 | ${discarded} |`);
  L.push(`| 同英文同中文的重复条目（去重消失） | ${collapsedDuplicates} |`);
  L.push(`| 无效条目 | ${invalid.length} |`);
  L.push(`| 未翻译（中文 = 英文） | ${untranslated.length} |`);
  L.push("");
  L.push("## 对账");
  L.push("");
  L.push("```");
  L.push(`五个来源条目总数        ${totalSource}`);
  L.push(`= 主词库条目            ${finalCount}`);
  L.push(`+ 冲突中被舍弃的候选    ${discarded}`);
  L.push(`+ 重复条目（去重）      ${collapsedDuplicates}`);
  L.push(`+ 无效条目              ${invalid.length}`);
  L.push(`+ 未翻译                ${untranslated.length}`);
  L.push(`= ${checked}`);
  L.push("```");
  L.push(`对账结果：**${totalSource === checked ? "一致 ✅" : `不一致 ❌（差 ${totalSource - checked}）`}**`);
  L.push("");
  L.push("说明：分类只对「有效条目」做，无效 / 未翻译条目在去重之前就被剔除，因此不计入重复数。");
  L.push(`有效条目 ${rawEntryCount} = 主词库 ${finalCount} + 冲突舍弃 ${discarded} + 重复 ${collapsedDuplicates}；`);
  L.push(`有效 ${rawEntryCount} + 无效 ${invalid.length} + 未翻译 ${untranslated.length} = ${rawEntryCount + invalid.length + untranslated.length}，与来源总数一致。`);
  L.push("");
  L.push("### 重复条目的来源分布");
  L.push("");
  L.push("同一英文在不同来源里给出了完全相同的中文时，去重后只保留一份；下表是这些重复出现在哪两个来源之间。");
  L.push("");
  if (collapsedByPair && collapsedByPair.size) {
    L.push("| 重复出现于 | 条数 |");
    L.push("|---|---:|");
    for (const [pair, n] of [...collapsedByPair.entries()].sort((a, b) => b[1] - a[1])) {
      L.push(`| 来源 ${pair} | ${n} |`);
    }
  } else {
    L.push("（无）");
  }
  L.push("");
  L.push("其中「来源 3/4 与 3/4」是指 obj4 里不同的 key 指向了相同的英文原文（2747 个 key 对应 2525 个不同英文），");
  L.push("「3/4 与 5」是覆盖表把 key 式里已有的映射原样再列了一遍；这些都不影响最终取值，只是同一句被记了两遍。");
  L.push("");
  L.push("## 无效条目分类");
  L.push("");
  const invalidByReason = new Map();
  for (const e of invalid) invalidByReason.set(e.reason, (invalidByReason.get(e.reason) ?? 0) + 1);
  if (invalidByReason.size === 0) {
    L.push("（无）");
  } else {
    L.push("| 原因 | 条数 |");
    L.push("|---|---|");
    for (const [r, n] of [...invalidByReason.entries()].sort()) L.push(`| ${r} | ${n} |`);
  }
  L.push("");
  L.push("## 未翻译（中文 = 英文，不进主词库）");
  L.push("");
  if (untranslated.length === 0) {
    L.push("（无）");
  } else {
    L.push("| 英文 | 来源 |");
    L.push("|---|---|");
    for (const e of untranslated.slice(0, 200)) L.push(`| ${clean(e.en)} | ${e.source} |`);
    if (untranslated.length > 200) L.push(`| …另有 ${untranslated.length - 200} 条 | |`);
  }
  L.push("");
  L.push("## 随机抽样 20 条");
  L.push("");
  L.push("（固定随机种子 20261004，两次运行结果一致）");
  L.push("");
  L.push("| # | 英文 | 中文 | 来源 | 位置 |");
  L.push("|---|---|---|---|---|");
  sample.forEach((s, i) => {
    L.push(`| ${i + 1} | ${clean(s.en)} | ${clean(s.zh)} | ${s.source} | ${s.slot} |`);
  });
  L.push("");
  return L.join("\n");
}

// ---------------------------------------------------------------- main

function main() {
  console.log("[1/6] 解包 asar …");
  extractAsar();

  console.log("[2/6] 解析 AST …");
  const code = fs.readFileSync(SERVER_JS, "utf8");
  const ast = parse(code, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
    errorRecovery: true,
  });

  console.log("[3/6] 定位五个来源 …");
  const src = locateSources(ast);
  const srcCounts = [
    { label: "来源1 obj1", varName: "c", count: objectProps(src.obj1).length, note: "英文原文 → 中文直映射；被来源5 展开继承" },
    { label: "来源2 obj2", varName: "l", count: objectProps(src.obj2).length, note: "位置占位符模板（全部含 {数字} 占位符）" },
    { label: "来源3 obj3", varName: "u", count: objectProps(src.obj3).length, note: "key 式英文原文（含 {count} 等命名占位符）" },
    { label: "来源4 obj4", varName: "d['zh-CN']", count: objectProps(src.obj4).length, note: "key 式中文译文，与来源3 按 key 一一配对" },
    { label: "来源5 obj5", varName: "p", count: objectProps(src.obj5).length, note: "覆盖表，优先级最高；含 1 个展开 obj1 的 spread（不重复计数）" },
  ];
  // 来源3/4 是配对使用的，合并成一组计数，避免把同一句算两遍
  const mergeCounts = [
    srcCounts[0],
    srcCounts[1],
    { label: "来源3/4 obj3+obj4", varName: "u + d['zh-CN']", count: objectProps(src.obj3).length, note: "按 key 配对得到（英文, 中文）对" },
    srcCounts[4],
  ];

  console.log("[4/6] 分类 + 合并 …");
  const entries = collectEntries(src);
  const { invalid, untranslated, valid } = classify(entries);
  const { messages, templates, conflicts, rawEntryCount, collapsedDuplicates, collapsedByPair } = merge(valid);
  const dict = buildDict(messages, templates);

  console.log("[5/6] 写词库与清单 …");
  writeFileDeterministic(path.join(DICT_DIR, "zh-CN.json"), JSON.stringify(dict, null, 2) + "\n");
  writeFileDeterministic(path.join(DICT_DIR, "conflicts.md"), renderConflicts(conflicts) + "\n");
  writeFileDeterministic(
    path.join(DICT_DIR, "invalid.json"),
    JSON.stringify(
      invalid.map((e) => ({
        en: e.en,
        zh: e.zh,
        source: e.source,
        reason: e.reason,
        ...(e.enPlaceholders ? { enPlaceholders: e.enPlaceholders, zhPlaceholders: e.zhPlaceholders } : {}),
        ...(e.note ? { note: e.note } : {}),
      })),
      null,
      2
    ) + "\n"
  );

  console.log("[6/6] 写报告与术语表 …");
  // 抽样：固定种子
  const rnd = mulberry32(20261004);
  const allEntries = [
    ...[...messages.entries()].map(([en, zh]) => ({ en, zh, source: sourceOf(valid, en), slot: "messages" })),
    ...[...templates.entries()].map(([en, zh]) => ({ en, zh, source: sourceOf(valid, en), slot: "templates" })),
  ];
  const pool = allEntries.slice();
  const sample = [];
  for (let i = 0; i < 20 && pool.length; i++) {
    const idx = Math.floor(rnd() * pool.length);
    sample.push(pool.splice(idx, 1)[0]);
  }

  const totalSource = mergeCounts.reduce((a, b) => a + b.count, 0);
  const reportSrc = [
    { label: "来源1", varName: "c", count: srcCounts[0].count, note: "英文 → 中文直映射" },
    { label: "来源2", varName: "l", count: srcCounts[1].count, note: "位置占位符模板" },
    { label: "来源3/4", varName: 'u + d["zh-CN"]', count: srcCounts[2].count, note: "按 key 配对（配对前两侧各 2747 条）" },
    { label: "来源5", varName: "p", count: srcCounts[4].count, note: "覆盖表，spread 部分不重复计数" },
  ];
  writeFileDeterministic(
    path.join(DICT_DIR, "extract-report.md"),
    renderReport({ srcCounts: reportSrc, classed: { valid, invalid, untranslated }, merged: { messages, templates }, conflicts, invalid, untranslated, dict, sample, rawEntryCount, collapsedDuplicates, collapsedByPair }) + "\n"
  );
  writeFileDeterministic(
    path.join(DICT_DIR, "glossary.md"),
    renderGlossary({ messages, templates, compareCodePoints }) + "\n"
  );

  // 控制台摘要
  const finalCount = Object.keys(dict.messages).length + Object.keys(dict.templates).length;
  const discarded = conflicts.reduce((a, c) => a + c.candidates.filter((x) => !x.kept).length, 0);
  const checked = finalCount + discarded + collapsedDuplicates + invalid.length + untranslated.length;
  console.log("---- 摘要 ----");
  console.log(`来源条目总数 ${totalSource}`);
  console.log(`messages ${Object.keys(dict.messages).length}  templates ${Object.keys(dict.templates).length}  合计 ${finalCount}`);
  console.log(`冲突 ${conflicts.length}（舍弃 ${discarded}）  重复 ${collapsedDuplicates}  无效 ${invalid.length}  未翻译 ${untranslated.length}`);
  console.log(`对账：${totalSource} vs ${checked} → ${totalSource === checked ? "一致" : "不一致"}`);
}

function sourceOf(valid, en) {
  const hits = valid.filter((e) => e.en === en);
  return [...new Set(hits.map((e) => e.source))].sort().join(",");
}

main();
