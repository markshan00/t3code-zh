import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { parseArgs, redact, writeJson, auditOutputs, walkFiles, parseCheckMetrics, checksPassed } from "./iteration-tooling.ts";

test("参数支持空格与等号形式，拒绝未知、重复、缺值", () => {
  assert.deepEqual(parseArgs(["a.dmg", "--out", "a b", "--baseline=abc"], ["out", "baseline"]),
    { positional: ["a.dmg"], options: { out: "a b", baseline: "abc" } });
  for (const args of [["--oops", "x"], ["--out"], ["--out", "--out"], ["--out=x", "--out=y"]]) {
    assert.throws(() => parseArgs(args, ["out"]));
  }
});

test("HOME、主机名、邮箱过滤覆盖重复、嵌套字段、JSON 转义与路径", () => {
  const patterns = [{ label: "HOME", value: "/Users/example" }, { label: "hostname_short", value: "fixture-host" },
    { label: "git_history_email_1", value: "fixture@example.invalid" }];
  assert.equal(redact("/Users/example/log /Users/example fixture-host fixture@example.invalid", patterns),
    "~/log ~ [hostname_short] [git_history_email_1]");
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "t3zh-output-test-"));
  try {
    const file = path.join(temp, "result.json");
    writeJson(file, { nested: [{ text: '\n"/Users/example" fixture-host fixture@example.invalid' }],
      "fixture@example.invalid": true }, patterns);
    assert.equal(auditOutputs(temp, patterns).passed, true);
    fs.writeFileSync(path.join(temp, "bad.log"), "fixture-host");
    fs.symlinkSync("fixture@example.invalid", path.join(temp, "link"));
    const audit = auditOutputs(temp, patterns);
    assert.equal(audit.passed, false);
    assert.deepEqual(audit.findings.map((row) => row.location).sort(), ["content", "symlink"]);
  } finally { fs.rmSync(temp, { recursive: true, force: true }); }
});

test("卷遍历包括隐藏文件、目录路径、符号链接文本且不跟随链接", () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "t3zh-walk-test-"));
  try {
    fs.mkdirSync(path.join(temp, "volume"));
    fs.mkdirSync(path.join(temp, "outside"));
    fs.writeFileSync(path.join(temp, "outside/secret"), "do not scan");
    fs.writeFileSync(path.join(temp, "volume/.hidden"), "scan");
    fs.symlinkSync("../outside", path.join(temp, "volume/link"));
    const tree = walkFiles(path.join(temp, "volume"));
    assert.deepEqual(tree.files.map((p) => path.basename(p)), [".hidden"]);
    assert.equal(tree.links[0]?.target, "../outside");
  } finally { fs.rmSync(temp, { recursive: true, force: true }); }
});

test("日志指标支持 TAP、spec 和词库自测，缺少 footer 不猜测", () => {
  assert.deepEqual(parseCheckMetrics("tests", "# tests 9\n# pass 8\n"), { passed: 8, total: 9 });
  assert.deepEqual(parseCheckMetrics("tests", "ℹ tests 7\nℹ pass 7\n"), { passed: 7, total: 7 });
  assert.deepEqual(parseCheckMetrics("tests", "ok 1 - nested\n"), { passed: null, total: null });
  assert.deepEqual(parseCheckMetrics("dict-tests", "17/17 通过"), { passed: 17, total: 17 });
  assert.deepEqual(parseCheckMetrics("dict", "✓ dict 通过：messages 12 + templates 3 = 15（baseline tag）"),
    { messages: 12, templates: 3, total: 15 });
  assert.deepEqual(parseCheckMetrics("regress", "translate 候选 80：新译出 4、误配修正 2、回归 1（对照 HEAD 的词库）"),
    { candidates: 80, newly: 4, fixed: 2, regressions: 1 });
  assert.deepEqual(parseCheckMetrics("exotic", "[OK] a: 0 处\n[命中!] b: 2 处\n[报告] c: 8 处"),
    { alarm_classes: 1, alarm_hits: 2 });
  assert.deepEqual(parseCheckMetrics("exotic", "扫描中断"), { alarm_classes: null, alarm_hits: null });
  assert.deepEqual(parseCheckMetrics("tsc", "a.ts(1): error TS1001: x\nb.ts: error TS1002: y\n"), { errors: 2 });
});

test("结果汇总中任一失败或空任务列表均不通过", () => {
  assert.equal(checksPassed([{ exit_code: 0 }, { exit_code: 0 }]), true);
  assert.equal(checksPassed([{ exit_code: 0 }, { exit_code: 1 }]), false);
  assert.equal(checksPassed([]), false);
});
