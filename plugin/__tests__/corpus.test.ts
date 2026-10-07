/**
 * 语料测试：对 upstream/ 里 §4 范围内的全部真实文件，验证「en 模式输出和原版完全一致」。
 *
 * 做法：原文件、转换后的文件分别用构建实际使用的 oxc（rolldown 自带的 transform）编译 TS/JSX，
 * 再把转换结果里的 `__t3zh_t(x)` 还原成 `x`（en 模式下 __t3zh_t 是恒等函数），两边用 Babel 统一打印后逐字比较。
 * 这同时验证了：JSX 文本空白折叠、HTML 实体、属性字符串的处理与 oxc 完全一致；转换后的代码能被 oxc 正常编译；
 * 转换不增减行数（只包裹、不重排）。
 *
 * 依赖 upstream/ 和 .build/src 里装好的 rolldown；缺任何一个就跳过（写明原因）。
 * 运行：node --test "plugin/__tests__/*.test.ts"
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import babelParser from "@babel/parser";
import babelTraverse from "@babel/traverse";
import babelGenerator from "@babel/generator";

import { RUNTIME_FN, RUNTIME_MODULE_ID, ZH_ROOT, createScanContext, listScopeFiles } from "../matcher.ts";
import { transformCode } from "../vite-plugin-t3zh.ts";

const traverse = ((babelTraverse as any).default ?? babelTraverse) as typeof import("@babel/traverse").default;
const generate = ((babelGenerator as any).default ?? babelGenerator) as typeof import("@babel/generator").default;

// 默认 upstream/（当前基线）；升级时可用 T3ZH_UPSTREAM 指向新 tag 的源码（scripts/upgrade-check.sh）。
const UPSTREAM = process.env.T3ZH_UPSTREAM ? path.resolve(process.env.T3ZH_UPSTREAM) : path.join(ZH_ROOT, "upstream");

function findRolldownUtils(): string | null {
  const pnpmDir = path.join(ZH_ROOT, ".build/src/node_modules/.pnpm");
  if (!fs.existsSync(pnpmDir)) return null;
  const candidates = fs
    .readdirSync(pnpmDir)
    .filter((name) => /^rolldown@\d/.test(name))
    .sort()
    .reverse();
  for (const name of candidates) {
    const file = path.join(pnpmDir, name, "node_modules/rolldown/dist/utils-index.mjs");
    if (fs.existsSync(file)) return file;
  }
  return null;
}

/** 解析 oxc 输出，去掉运行时 import，把 __t3zh_t(x) 还原成 x，统一打印。 */
function normalize(js: string, unwrap: boolean): string {
  const ast = babelParser.parse(js, { sourceType: "module" });
  traverse(ast, {
    ImportDeclaration(p: any) {
      if (unwrap && p.node.source.value === RUNTIME_MODULE_ID) p.remove();
    },
    CallExpression: {
      exit(p: any) {
        if (unwrap && p.node.callee.type === "Identifier" && p.node.callee.name === RUNTIME_FN && p.node.arguments.length === 1) {
          p.replaceWith(p.node.arguments[0]);
        }
      },
    },
    StringLiteral(p: any) {
      delete p.node.extra; // 只比较值，不比较引号和转义写法
    },
  });
  return generate(ast, { comments: false, compact: false, jsescOption: { minimal: true } }).code;
}

const rolldownUtils = findRolldownUtils();
const skipReason = !fs.existsSync(path.join(UPSTREAM, "apps/web/src"))
  ? "upstream/ 不存在"
  : rolldownUtils === null
    ? ".build/src 里没有装 rolldown（先跑一次 scripts/build-zh.sh 或 vp i）"
    : false;

test("语料：upstream 全部范围内文件，en 模式（__t3zh_t 恒等）编译结果与原版逐字一致", { skip: skipReason, timeout: 600_000 }, async () => {
  const oxc = await import(pathToFileURL(rolldownUtils as string).href);
  const ctx = createScanContext({ root: UPSTREAM });
  const files = listScopeFiles(UPSTREAM);
  let changed = 0;
  let edits = 0;
  const failures: string[] = [];
  for (const file of files) {
    const code = fs.readFileSync(file, "utf8");
    const result = transformCode(code, file, ctx);
    if (!result.output) continue;
    changed += 1;
    edits += result.edits;
    if (result.output.code.split("\n").length !== code.split("\n").length) {
      failures.push(`${path.relative(UPSTREAM, file)}: 转换后行数变了`);
    }
    const options = { jsx: { runtime: "automatic" as const } };
    const original = await oxc.transform(file, code, options);
    const converted = await oxc.transform(file, result.output.code, options);
    if (original.errors.length > 0) {
      failures.push(`${path.relative(UPSTREAM, file)}: 原文件 oxc 报错 ${original.errors[0].message}`);
      continue;
    }
    if (converted.errors.length > 0) {
      failures.push(`${path.relative(UPSTREAM, file)}: 转换后 oxc 报错 ${converted.errors[0].message}`);
      continue;
    }
    const a = normalize(original.code, false);
    const b = normalize(converted.code, true);
    if (a !== b) {
      const aLines = a.split("\n");
      const bLines = b.split("\n");
      const index = aLines.findIndex((line, i) => line !== bLines[i]);
      failures.push(`${path.relative(UPSTREAM, file)}: 第 ${index + 1} 行不同\n  原版：${aLines[index]}\n  转换：${bLines[index]}`);
    }
  }
  console.log(`[corpus] ${files.length} 个文件，${changed} 个有改动，共 ${edits} 处包裹/替换`);
  assert.ok(changed > 300, `有改动的文件数异常：${changed}`);
  assert.deepEqual(failures, []);
});
