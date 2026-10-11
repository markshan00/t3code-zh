import assert from 'node:assert/strict';
import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
import { redact, type PrivatePattern } from './iteration-tooling.ts';

const traverse = traverseModule.default ?? traverseModule;
export function cleanUrl(value: string): string {
  const url = new URL(value); assert.ok(['http:', 'https:'].includes(url.protocol), '只接受 HTTP URL');
  return url.origin + url.pathname;
}
export function filterEvidence(value: unknown, patterns: PrivatePattern[]): unknown {
  if (typeof value === 'string') {
    const urlsRemoved = value.replace(/https?:\/\/[^\s<>"'`]+/g, url => {
      try { return cleanUrl(url); } catch { return '[filtered-url]'; }
    }).replace(/(?:#|[?&])(?:token|credential|access_token|refresh_token|code)=[^\s"'<>]*/gi, '[filtered-pairing]');
    return redact(urlsRemoved, patterns);
  }
  if (Array.isArray(value)) return value.map(item => filterEvidence(item, patterns));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [
    /^(credential|token|accessToken|refreshToken|authorization|cookie)$/i.test(key) ? '[filtered-key]' : redact(key, patterns),
    /^(credential|token|accessToken|refreshToken|authorization|cookie)$/i.test(key) ? '[filtered-secret]' : filterEvidence(item, patterns),
  ]));
  return value;
}
export const normalizeText = (text: string) => text.replace(/\r/g, '').split('\n').map(line=>line.trim()).filter(Boolean).join('\n');
export type Expectations = { required?: string[]; forbidden?: string[]; exact?: string; ordered?: string[] };
export function compareText(text: string, expected: Expectations): string[] {
  const failures: string[] = [];
  for (const value of expected.required || []) if (!text.includes(value)) failures.push(`缺少：${value}`);
  for (const value of expected.forbidden || []) if (text.includes(value)) failures.push(`不应出现：${value}`);
  if (expected.exact !== undefined && normalizeText(text) !== normalizeText(expected.exact)) failures.push('区域文字与清单原文不一致');
  let offset = 0;
  for (const value of expected.ordered || []) {
    const found = text.indexOf(value, offset); if (found < 0) failures.push(`顺序不符：${value}`); else offset = found + value.length;
  }
  return failures;
}

// 用 AST 只改 import 的字符串字面量；组件 / helper 函数体逐字节保持。
export function rebaseImports(source: string, origin: string, exports: string[]): string {
  assert.equal(cleanUrl(origin), new URL(origin).origin + '/', 'origin 不能含路径、查询或 fragment');
  const edits: { start: number; end: number; value: string }[] = [];
  traverse(parse(source, { sourceType: 'module' }), {
    StringLiteral(p) {
      const parent = p.parent;
      const isImport = parent.type === 'ImportDeclaration' || parent.type === 'ExportNamedDeclaration' || parent.type === 'ExportAllDeclaration'
        || (parent.type === 'CallExpression' && parent.callee.type === 'Import');
      if (isImport && p.node.value.startsWith('./')) edits.push({ start: p.node.start!, end: p.node.end!,
        value: JSON.stringify(new URL('/assets/' + p.node.value.slice(2), origin).href) });
    },
  });
  for (const edit of edits.sort((a,b)=>b.start-a.start)) source = source.slice(0,edit.start)+edit.value+source.slice(edit.end);
  assert.ok(exports.every(name => /^[A-Za-z_$][\w$]*$/.test(name)), '非法导出名');
  return source + '\nexport {' + [...new Set(exports)].map(name=>`${name} as WebCheck_${name}`).join(',') + '};\n';
}
export function symbolBody(source: string, name: string): string {
  const nodes = parse(source, { sourceType: 'module' }).program.body.flatMap(node=> {
    const declaration = node.type === 'ExportNamedDeclaration' ? node.declaration : node;
    return declaration?.type === 'VariableDeclaration' ? declaration.declarations : declaration ? [declaration] : [];
  });
  const node = nodes.find(node=>'id' in node && node.id?.type === 'Identifier' && node.id.name === name);
  assert.ok(node, '找不到编译顶层符号：'+name); return source.slice(node.start!,node.end!);
}
export function summaryPassed(rows: { passed: boolean }[]) { return rows.length > 0 && rows.every(row => row.passed); }
