#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { ROOT, parseArgs, prepareOut, privatePatterns, redact, runCommand, writeJson,
  parseCheckMetrics, checksPassed, assertSafePath, auditOutputs } from "./lib/iteration-tooling.ts";

const privacy = privatePatterns();
try {
  const { options, positional } = parseArgs(process.argv.slice(2), ["out", "next"]);
  assert.equal(positional.length, 0, "用法：node scripts/run-checks.ts --out <目录> [--next <源码目录>]");
  assert.ok(options.out, "必须指定 --out");
  const out = path.resolve(options.out);
  const source = path.resolve(options.next ?? path.join(ROOT, ".build/next"));
  assertSafePath(source);
  prepareOut(out);
  const started = performance.now();
  const jobs = [
    { name: "plugin-tests", kind: "tests", args: ["--test", "plugin/__tests__/*.test.ts", "scripts/lib/t3-connect-config.test.ts"] },
    { name: "check-dict-tests", kind: "dict-tests", args: ["scripts/check-dict.test.ts"] },
    { name: "check-dict-web", kind: "dict", args: ["scripts/check-dict.ts", "dict/zh-CN.json"] },
    { name: "check-dict-desktop", kind: "dict", args: ["scripts/check-dict.ts", "dict/zh-CN.desktop.json"] },
    { name: "dict-regress", kind: "regress", args: ["scripts/dict-regress.ts", source] },
    { name: "exotic", kind: "exotic", args: ["scripts/check-exotic-forms.ts", source] },
    { name: "generated-guard", kind: "tests", args: ["--test", "scripts/lib/upstream-generated.test.ts"] },
    ...["web", "desktop"].map((area) => ({ name: `${area}-typecheck`, kind: "tsc",
      command: path.join(ROOT, ".build/src/node_modules/.bin/tsc"),
      args: ["--noEmit", "--incremental", "false", "--composite", "false"], cwd: path.join(ROOT, ".build/src/apps", area) })),
  ];
  const rows = [];
  for (const job of jobs) {
    const result = await runCommand("command" in job ? job.command! : process.execPath, job.args,
      path.join(out, `${job.name}.log`), privacy.patterns, { cwd: "cwd" in job ? job.cwd : ROOT, allowFailure: true });
    fs.writeFileSync(path.join(out, `${job.name}.exit`), `${result.exit_code}\n`);
    const { output, ...details } = result;
    const metrics = parseCheckMetrics(job.kind, output);
    if (job.kind === "tsc" && result.exit_code !== 0 && metrics.errors === 0) metrics.errors = null;
    rows.push({ name: job.name, ...details, metrics });
    const numbers = Object.entries(metrics).map(([key, value]) => `${key}=${value ?? "未解析"}`).join("，");
    console.log(redact(`${job.name}：${result.exit_code === 0 ? "通过" : "失败"}；${numbers}${result.exit_code ? `；日志 ${result.log}` : ""}`, privacy.patterns));
    writeJson(path.join(out, "checks.json"), { passed: checksPassed(rows), source, checks: rows }, privacy.patterns);
  }
  writeJson(path.join(out, "checks.json"), { passed: checksPassed(rows), source,
    seconds: Number(((performance.now() - started) / 1000).toFixed(3)), checks: rows }, privacy.patterns);
  const audit = auditOutputs(out, privacy.patterns);
  writeJson(path.join(out, "output-audit.json"), audit, privacy.patterns);
  console.log(redact(`全套检查：${checksPassed(rows) && audit.passed ? "通过" : "失败"}；${rows.filter((r) => !r.exit_code).length}/${rows.length}；报告 ${path.join(out, "checks.json")}`, privacy.patterns));
  process.exitCode = checksPassed(rows) && audit.passed ? 0 : 1;
} catch (error) {
  console.error(redact(String(error), privacy.patterns));
  process.exitCode = 1;
}
