import assert from "node:assert/strict";
import { parse } from "@babel/parser";
import { USERS_ALLOWLIST } from "./release-hygiene-allowlist.ts";
import { sha256 } from "./iteration-tooling.ts";

export function offsets(data: Buffer, needle: Buffer): number[] {
  assert.ok(needle.length > 0, "检索值不能为空");
  const result: number[] = [];
  for (let index = data.indexOf(needle); index !== -1; index = data.indexOf(needle, index + needle.length)) result.push(index);
  return result;
}

export function allowlistMatch(data: Buffer, offset: number) {
  const before = data.subarray(Math.max(0, offset - 100), offset).toString("utf8");
  const after = data.subarray(offset, offset + 300).toString("utf8");
  return USERS_ALLOWLIST.find((rule) => rule.matches(before, after));
}

export function classifyUsers(evidence: {
  kind: "asar" | "supplier" | "electron" | "other";
  contextsAllowed?: boolean; sourcesVerified?: boolean; accounted?: boolean;
  supplierIdentical?: boolean; electronContextsMatch?: boolean;
}): "上游通用写法" | "供应商预编译文件" | "Electron 原包上下文" | "需人工审查" {
  if (evidence.kind === "asar" && evidence.contextsAllowed && evidence.sourcesVerified && evidence.accounted) return "上游通用写法";
  if (evidence.kind === "supplier" && evidence.supplierIdentical) return "供应商预编译文件";
  if (evidence.kind === "electron" && evidence.electronContextsMatch) return "Electron 原包上下文";
  return "需人工审查";
}

export function readExtendInfoKeys(code: string): string[] {
  const ast = parse(code, { sourceType: "module", plugins: ["typescript"] });
  const keys = new Set<string>();
  let found = 0;
  const propertyKey = (node: any) => node.computed ? undefined : node.key?.type === "Identifier" ? node.key.name : node.key?.value;
  const walk = (node: any) => {
    if (!node || typeof node !== "object") return;
    if (node.type === "ObjectProperty" && propertyKey(node) === "extendInfo") {
      found++;
      assert.equal(node.value.type, "ObjectExpression", "extendInfo 不是静态对象，无法读取键名");
      for (const item of node.value.properties) {
        assert.equal(item.type, "ObjectProperty", "extendInfo 有展开或非静态键，无法读取");
        const key = propertyKey(item);
        assert.equal(typeof key, "string", "extendInfo 键名无法读取");
        keys.add(key);
      }
    }
    for (const [key, value] of Object.entries(node)) {
      if (["loc", "start", "end", "extra", "comments", "tokens"].includes(key)) continue;
      if (Array.isArray(value)) value.forEach(walk);
      else if (value && typeof value === "object") walk(value);
    }
  };
  walk(ast);
  assert.ok(found && keys.size, "未读出 extendInfo 键名");
  return [...keys].sort();
}

// reader 由入口绑定到 --baseline 的 git show；这里不读取构建树，也不提供回退。
export async function readBaselineExtendInfo(source: (file: string) => Promise<string>) {
  const file = "scripts/build-desktop-artifact.ts";
  const code = await source(file);
  return { source: file, sha256: sha256(Buffer.from(code)), expected: readExtendInfoKeys(code) };
}

export function checkpointIdentities(code: string): { value: string; keys: string[]; lines: number[] }[] {
  const found = new Map<string, { value: string; keys: string[]; lines: number[] }>();
  for (const match of code.matchAll(/\b(GIT_AUTHOR_EMAIL|GIT_COMMITTER_EMAIL):\s*"([^"\n]+)"/g)) {
    const value = match[2]!;
    const row = found.get(value) ?? { value, keys: [], lines: [] };
    row.keys.push(match[1]!);
    row.lines.push(code.slice(0, match.index).split("\n").length);
    found.set(value, row);
  }
  return [...found.values()].filter((row) => row.keys.includes("GIT_AUTHOR_EMAIL") && row.keys.includes("GIT_COMMITTER_EMAIL"));
}

export function isCheckpointOccurrence(data: Buffer, offset: number, value: string) {
  const before = data.subarray(Math.max(0, offset - 80), offset).toString("utf8");
  const quote = before.match(/\bGIT_(?:AUTHOR|COMMITTER)_EMAIL:\s*(["'`])$/)?.[1];
  return !!quote && data.subarray(offset, offset + Buffer.byteLength(value) + 1).toString("utf8") === value + quote;
}

// plutil 将二进制 plist 转 XML；这里保留 data 的原始 Buffer，以检查 CodeResources.hash2。
export function parsePlist(xml: string): any {
  const tokens = xml.replace(/<\?xml[^>]*\?>|<!DOCTYPE[^>]*>|<!--[\s\S]*?-->/g, "")
    .match(/<[^>]+>|[^<]+/g)!.filter((token) => token.startsWith("<") || token.trim());
  let i = 0;
  const decode = (text: string) => text.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_, entity: string) => {
    if (entity.startsWith("#x")) return String.fromCodePoint(parseInt(entity.slice(2), 16));
    if (entity.startsWith("#")) return String.fromCodePoint(Number(entity.slice(1)));
    return ({ amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" } as Record<string, string>)[entity]!;
  });
  assert.ok(/^<plist\b/.test(tokens[i++]!), "缺少 plist 根元素");
  const read = (): any => {
    const tag = tokens[i++]!;
    if (/^<(true|false)\s*\/>$/.test(tag)) return tag.includes("true");
    const match = tag.match(/^<(dict|array|string|key|data|integer|real|date)(\s*\/)?\s*>$/);
    assert.ok(match, `不支持的 plist 标签 ${tag}`);
    const type = match[1]!;
    if (match[2]) return type === "dict" ? {} : type === "array" ? [] : type === "data" ? Buffer.alloc(0) : "";
    if (type === "dict") {
      const result: Record<string, any> = Object.create(null);
      while (tokens[i] !== "</dict>") {
        assert.ok(/^<key[\s>]/.test(tokens[i]!), "plist 字典缺少 key");
        const key = read();
        assert.ok(!(key in result), "plist 字典有重复 key");
        result[key] = read();
      }
      i++;
      return result;
    }
    if (type === "array") {
      const result = [];
      while (tokens[i] !== "</array>") result.push(read());
      i++;
      return result;
    }
    const value = tokens[i]?.startsWith("</") ? "" : tokens[i++]!;
    assert.equal(tokens[i++], `</${type}>`, "plist 标签未闭合");
    if (type === "data") return Buffer.from(value.replace(/\s/g, ""), "base64");
    if (type === "integer" || type === "real") return Number(value);
    return decode(value);
  };
  const value = read();
  assert.equal(tokens[i++], "</plist>", "plist 根元素未闭合");
  assert.equal(i, tokens.length, "plist 有多余内容");
  return value;
}
