/**
 * 桌面主进程字符串调研（T07，reports/desktop-main-strings.md 的第 1 步）。
 *
 * 用法：node plugin/desktop/survey-strings.ts [源码目录，默认 upstream/apps/desktop/src] > out.tsv
 *
 * 列出全部非测试 .ts 里「含空白、至少两个单词」的字符串字面量和模板字面量（插值写成 {0}、{1}…），
 * 每行：file:line、文字（JSON）、所在位置（由近到远最多 4 层：属性键、调用对象、return、变量名等）。
 * 单词标签（File、Edit 等）不在这个口径里，要另外 grep label:、title: 等（见报告「方法」）。
 * 只读，不改任何文件。
 */
import fs from "node:fs";
import path from "node:path";

import { parse } from "@babel/parser";

type Node = any;

const ZH_ROOT = path.resolve(import.meta.dirname, "../..");
const UPSTREAM = process.env.T3ZH_UPSTREAM ? path.resolve(process.env.T3ZH_UPSTREAM) : path.join(ZH_ROOT, "upstream");
const root = path.resolve(process.argv[2] ?? path.join(UPSTREAM, "apps/desktop/src"));

function listFiles(dir: string, into: string[]): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "__tests__") listFiles(file, into);
    } else if (
      entry.name.endsWith(".ts") &&
      !entry.name.endsWith(".test.ts") &&
      entry.name !== "updatesTestHarness.ts" &&
      entry.name !== "AnnotationStyles.generated.ts"
    ) {
      into.push(file);
    }
  }
  return into.sort();
}

function calleeName(node: Node): string {
  if (!node) return "";
  if (node.type === "Identifier") return node.name;
  if (node.type === "MemberExpression" || node.type === "OptionalMemberExpression") {
    return `${calleeName(node.object)}.${node.property.name ?? node.property.value ?? "?"}`;
  }
  if (node.type === "CallExpression") return `${calleeName(node.callee)}()`;
  return node.type;
}

function describe(stack: Node[]): string {
  const context: string[] = [];
  for (let i = stack.length - 2; i >= 0 && context.length < 4; i--) {
    const parent = stack[i];
    if (parent.type === "ObjectProperty") context.push(`key:${parent.key.name ?? parent.key.value}`);
    else if (parent.type === "CallExpression") context.push(`call:${calleeName(parent.callee)}`);
    else if (parent.type === "NewExpression") context.push(`new call:${calleeName(parent.callee)}`);
    else if (parent.type === "ReturnStatement") context.push("return");
    else if (parent.type === "ThrowStatement") context.push("throw");
    else if (parent.type === "ClassMethod") context.push(`method:${parent.key.name}`);
    else if (parent.type === "VariableDeclarator") context.push(`var:${parent.id.name}`);
  }
  return context.join(" < ");
}

const files = listFiles(root, []);
const rows: string[] = [];
for (const file of files) {
  const ast = parse(fs.readFileSync(file, "utf8"), { sourceType: "module", plugins: ["typescript"] });
  const stack: Node[] = [];
  const visit = (node: Node): void => {
    if (!node || typeof node.type !== "string") return;
    stack.push(node);
    let text: string | null = null;
    if (node.type === "StringLiteral") text = node.value;
    else if (node.type === "TemplateLiteral") {
      text = node.quasis
        .map((quasi: Node, i: number) => quasi.value.cooked + (i < node.expressions.length ? `{${i}}` : ""))
        .join("");
    }
    if (text !== null && /[A-Za-z]{2,}[^A-Za-z]+[A-Za-z]{2,}/.test(text) && /\s/.test(text)) {
      rows.push(`${path.relative(root, file)}:${node.loc.start.line}\t${JSON.stringify(text)}\t${describe(stack)}`);
    }
    for (const key of Object.keys(node)) {
      if (key === "loc" || key.endsWith("Comments")) continue;
      const child = node[key];
      if (Array.isArray(child)) child.forEach(visit);
      else if (child && typeof child.type === "string") visit(child);
    }
    stack.pop();
  };
  visit(ast.program);
}
process.stdout.write(`${rows.join("\n")}\n`);
process.stderr.write(`${files.length} 个文件，${rows.length} 条\n`);
