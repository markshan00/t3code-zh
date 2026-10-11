import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const OUTPUT = "apps/desktop/src/preview/AnnotationStyles.generated.ts";
const GENERATOR = "apps/desktop/scripts/build-preview-annotation-css.mjs";
const INPUTS = [
  "apps/desktop/src/preview/PickPreload.ts",
  "apps/desktop/src/preview/Annotation.css",
  GENERATOR,
];

// 只读构建树；生成器仅在系统临时目录里运行，不改上游或 .build/src。
export function verifyUpstreamGenerated(src: string, baseline: string, output: string) {
  src = path.resolve(src);
  assert.equal(output, OUTPUT, "不在限定的上游生成文件名单中");
  const git = (...args: string[]) => execFileSync("git", ["-C", src, ...args]);
  assert.equal(git("rev-parse", "HEAD").toString().trim(), baseline, "HEAD 不是指定基线");
  git("diff", "--quiet", "HEAD", "--", ...INPUTS);
  const cleanInputs = INPUTS.map((file) => {
    assert.ok(fs.lstatSync(path.join(src, file)).isFile(), `${file} 必须是常规文件`);
    const original = git("show", `HEAD:${file}`);
    assert.ok(original.equals(fs.readFileSync(path.join(src, file))), `${file} 相对基线有改动`);
    return [file, original] as const;
  });
  assert.ok(fs.lstatSync(path.join(src, output)).isFile(), "生成结果必须是常规文件");
  const require = createRequire(path.join(src, "apps/desktop/package.json"));
  const tailwindRoot = path.dirname(require.resolve("tailwindcss/package.json"));
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "t3zh-upstream-generated-"));
  try {
    for (const [file, content] of cleanInputs) {
      fs.mkdirSync(path.dirname(path.join(temp, file)), { recursive: true });
      fs.writeFileSync(path.join(temp, file), content);
    }
    const modules = path.join(temp, "apps/desktop/node_modules");
    fs.mkdirSync(modules);
    fs.symlinkSync(tailwindRoot, path.join(modules, "tailwindcss"), "dir");
    execFileSync(process.execPath, [path.join(temp, GENERATOR)], { cwd: temp, timeout: 30_000 });
    assert.ok(
      fs.readFileSync(path.join(temp, output)).equals(fs.readFileSync(path.join(src, output))),
      "干净基线独立重生成的结果与构建文件不一致",
    );
    return { output, inputs: INPUTS, tailwindVersion: JSON.parse(fs.readFileSync(path.join(tailwindRoot, "package.json"), "utf8")).version };
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const result = verifyUpstreamGenerated(...process.argv.slice(2) as [string, string, string]);
    console.log(`[upstream-generated] 检查通过：${result.output}；tailwindcss ${result.tailwindVersion}`);
  } catch (error) {
    console.error(`[upstream-generated] 拒绝放行：${error instanceof Error ? error.message : error}`);
    process.exitCode = 1;
  }
}
