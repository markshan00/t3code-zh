import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { verifyUpstreamGenerated } from "./upstream-generated.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const upstream = path.join(root, "upstream");
const baseline = execFileSync("git", ["-C", upstream, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const output = "apps/desktop/src/preview/AnnotationStyles.generated.ts";
const generator = "apps/desktop/scripts/build-preview-annotation-css.mjs";
const inputs = ["apps/desktop/src/preview/PickPreload.ts", "apps/desktop/src/preview/Annotation.css", generator];
const require = createRequire(path.join(root, ".build/src/apps/desktop/package.json"));
const tailwind = path.dirname(require.resolve("tailwindcss/package.json"));

function fixture(run: (dir: string) => void) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "t3zh-generated-test-"));
  const git = (...args: string[]) => execFileSync("git", ["-C", dir, ...args]);
  try {
    git("init", "--quiet");
    const common = execFileSync("git", ["-C", upstream, "rev-parse", "--path-format=absolute", "--git-common-dir"], { encoding: "utf8" }).trim();
    fs.writeFileSync(path.join(dir, ".git/objects/info/alternates"), path.join(common, "objects") + "\n");
    // 复用既有基线对象，不创建任何 commit；只在临时树检出四个测试文件。
    git("update-ref", "HEAD", baseline);
    git("checkout", "HEAD", "--", ...inputs, output);
    const modules = path.join(dir, "apps/desktop/node_modules");
    fs.mkdirSync(modules);
    fs.symlinkSync(tailwind, path.join(modules, "tailwindcss"), "dir");
    execFileSync(process.execPath, [path.join(dir, generator)]);
    run(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test("干净基线输入与同一 tailwindcss 独立生成的真实结果可以放行", () => fixture((dir) => {
  assert.equal(verifyUpstreamGenerated(dir, baseline, output).output, output);
}));

for (const input of inputs) {
  test(`输入或生成器改动必须拒绝：${input}`, () => fixture((dir) => {
    fs.appendFileSync(path.join(dir, input), "\n/* changed fixture */\n");
    const result = spawnSync(process.execPath, [path.join(root, "scripts/lib/upstream-generated.ts"), dir, baseline, output], { encoding: "utf8" });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /拒绝放行/);
  }));
}

test("输出不一致必须拒绝，即使三个输入都没有改动", () => fixture((dir) => {
  fs.appendFileSync(path.join(dir, output), "\n// unexpected output\n");
  assert.throws(() => verifyUpstreamGenerated(dir, baseline, output), /独立重生成的结果与构建文件不一致/);
}));

test("基线不符及名单外路径不能放行", () => fixture((dir) => {
  assert.throws(() => verifyUpstreamGenerated(dir, "0".repeat(40), output), /HEAD 不是指定基线/);
  assert.throws(() => verifyUpstreamGenerated(dir, baseline, "apps/desktop/src/preview/Other.generated.ts"), /不在限定/);
}));

test("内容一致但输入模式改变也不能放行", () => fixture((dir) => {
  fs.chmodSync(path.join(dir, generator), 0o755);
  assert.throws(() => verifyUpstreamGenerated(dir, baseline, output));
}));
