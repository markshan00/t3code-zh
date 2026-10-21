import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { parse } from "@babel/parser";
import traverseModule from "@babel/traverse";
import { isReviewedDispatcherClassCheck } from "../../scripts/lib/reviewed-exotic.ts";

const traverse = (traverseModule as any).default ?? traverseModule;
const file = "apps/server/src/outboundHttp.ts";
function classify(source: string, filename = file) {
  const results: boolean[] = [];
  traverse(parse(source, { sourceType: "module", plugins: ["typescript"] }), {
    MemberExpression(p: any) {
      if (p.node.property?.name === "constructor") {
        results.push(isReviewedDispatcherClassCheck(filename, p.node, p.parent, p.parentPath.parent));
      }
    },
  });
  return results;
}

test("v0.1.0 server dispatcher class comparison is reported as reviewed", () => {
  const root = process.env.T3ZH_UPSTREAM ?? path.resolve("upstream");
  assert.deepEqual(classify(fs.readFileSync(path.join(root, file), "utf8")), [true]);
});

test("constructor calls, other receivers and display files retain the alarm", () => {
  for (const source of [
    'undici.getGlobalDispatcher().constructor("label")',
    'undici.getGlobalDispatcher().constructor.name',
    'undici.getGlobalDispatcher().constructor.name === "Other"',
    'other.getGlobalDispatcher().constructor.name === "EnvHttpProxyAgent"',
    '(/x/).constructor("label")',
  ]) assert.deepEqual(classify(source), [false], source);
  assert.deepEqual(classify('undici.getGlobalDispatcher().constructor.name === "EnvHttpProxyAgent"',
    "apps/web/src/Example.tsx"), [false]);
});
