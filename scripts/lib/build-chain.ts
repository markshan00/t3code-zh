/**
 * 读取上游构建链的关键字符串，供 scripts/build-zh.sh 的「构建链守卫」比对。
 *
 * 用法：
 *   node scripts/lib/build-chain.ts <文件> <点分路径>
 *
 * - <文件> 是 package.json：按点分路径取 JSON 值（如 scripts.build、scripts.build:desktop——
 *   路径按第一个点切成「scripts」和其余部分，脚本名里可以带冒号）。
 * - <文件> 是 vite.config.ts：用 Babel 解析，在所有对象字面量里找该路径（如 run.tasks.build.command），
 *   必须恰好找到一处，且值是字符串字面量或字符串数组字面量。
 *
 * 字符串原样输出（不加引号），数组输出 JSON。找不到或不唯一时退出码 1。
 */
import fs from "node:fs";
import babelParser from "@babel/parser";

const [file, dotted] = process.argv.slice(2);
if (!file || !dotted) {
  console.error("usage: node scripts/lib/build-chain.ts <file> <dotted.path>");
  process.exit(2);
}

function fail(message: string): never {
  console.error(`build-chain: ${file}: ${message}`);
  process.exit(1);
}

function print(value: unknown): void {
  process.stdout.write(typeof value === "string" ? value : JSON.stringify(value));
  process.stdout.write("\n");
}

const source = fs.readFileSync(file, "utf8");

if (file.endsWith(".json")) {
  const data = JSON.parse(source);
  const first = dotted.indexOf(".");
  const parts = first === -1 ? [dotted] : [dotted.slice(0, first), dotted.slice(first + 1)];
  let value: any = data;
  for (const part of parts) value = value?.[part];
  if (value === undefined) fail(`${dotted} not found`);
  print(value);
} else {
  const ast = babelParser.parse(source, { sourceType: "module", plugins: ["typescript"] });
  const path = dotted.split(".");
  const keyName = (prop: any): string | null => {
    if (prop.type !== "ObjectProperty" || prop.computed) return null;
    if (prop.key.type === "Identifier") return prop.key.name;
    if (prop.key.type === "StringLiteral") return prop.key.value;
    return null;
  };
  const resolve = (node: any, rest: string[]): any => {
    if (rest.length === 0) return node;
    if (node?.type !== "ObjectExpression") return undefined;
    const prop = node.properties.find((p: any) => keyName(p) === rest[0]);
    return prop ? resolve(prop.value, rest.slice(1)) : undefined;
  };
  const literal = (node: any): unknown => {
    if (node?.type === "StringLiteral") return node.value;
    if (node?.type === "TemplateLiteral" && node.expressions.length === 0) return node.quasis[0].value.cooked;
    if (node?.type === "ArrayExpression") return node.elements.map(literal);
    return fail(`${dotted} is not a string/array literal (${node?.type})`);
  };
  const found: any[] = [];
  const walk = (node: any) => {
    if (!node || typeof node.type !== "string") return;
    if (node.type === "ObjectExpression") {
      const hit = resolve(node, path);
      if (hit !== undefined) found.push(hit);
    }
    for (const key of Object.keys(node)) {
      if (key === "loc" || key === "start" || key === "end" || key.endsWith("Comments")) continue;
      const child = node[key];
      if (Array.isArray(child)) child.forEach(walk);
      else if (child && typeof child === "object") walk(child);
    }
  };
  walk(ast.program);
  if (found.length !== 1) fail(`expected exactly one ${dotted}, found ${found.length}`);
  print(literal(found[0]));
}
