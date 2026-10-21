/**
 * scripts/windows/ 与 .github/workflows/build-windows.yml 的静态 / 单元测试（T21-W）。
 *
 *   node --test scripts/windows/windows-ci.test.ts
 *
 * 需要上游 git 对象的用例（Windows 补丁能否打到 v0.1.1 上）从 T3ZH_UPSTREAM_GIT（默认 <仓库>/upstream）读取
 * 固定 tag 的文件，不依赖任何工作区 HEAD；找不到时跳过。workflow 结构检查用 ruby 自带的 YAML 解析，没有 ruby 时跳过。
 */
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

import { buildZhConstantsFromText, readBuildZhConstants } from "./lib/build-zh-constants.ts";
import { quoteForCmd, sanitizedPackagingEnv, validateVersion, ZH_ROOT } from "./lib/common.ts";
import { checkCliArchiveMembers, cliArchiveStem, normalizeTarMembers } from "./check-cli-archive.ts";
import {
  checkOutputEntries,
  checkStageBuildConfig,
  checkUnpackedFiles,
  extraOutputEntries,
  installerName,
  normalizeAsarEntry,
  PAYLOAD_FILE_LIMIT,
} from "./package-windows.ts";
import { listPatches, porcelainPath, WINDOWS_PATCH_DIR } from "./prepare-source.ts";

const VERSION = "0.1.1-zh.1";
const UPSTREAM_TAG = "v0.1.1";
const UPSTREAM_COMMIT = "fe27e8e3dc12dcbb108e9a28fd9b8cb65f34ae92";
const WORKFLOW = path.join(ZH_ROOT, ".github/workflows/build-windows.yml");
const WINDOWS_PATCH = path.join(WINDOWS_PATCH_DIR, "0001-windows-zh-packaging.patch");

// ---------------------------------------------------------------------------
// build-zh.sh 常量

test("从当前 build-zh.sh 读出全部常量", () => {
  const c = readBuildZhConstants(path.join(ZH_ROOT, "scripts/build-zh.sh"));
  assert.match(c.baselineCommit, /^[0-9a-f]{40}$/);
  assert.equal(c.wrapperName, "vite.zh.config.ts");
  assert.ok(c.desktopI18nFiles.length >= 3);
  for (const [from] of c.desktopI18nFiles) assert.ok(fs.existsSync(path.join(ZH_ROOT, from)), from);
  assert.ok(fs.existsSync(path.join(ZH_ROOT, "build", c.wrapperName)));
  assert.ok(c.minTranslate > 0);
  assert.ok(c.guardText.length > 0);
});

test("常量解析：只认字面量，读取到的变量缺失 / 展开 / 重复时报错", () => {
  const base = fs.readFileSync(path.join(ZH_ROOT, "scripts/build-zh.sh"), "utf8");
  assert.throws(() => buildZhConstantsFromText(base.replace(/^GUARD_TEXT=.*$/m, "")), /GUARD_TEXT/);
  assert.throws(() => buildZhConstantsFromText(base.replace(/^GUARD_TEXT=.*$/m, 'GUARD_TEXT="${X}"')), /展开/);
  assert.throws(() => buildZhConstantsFromText(`${base}\nMIN_TRANSLATE=1\n`), /多次/);
  assert.throws(() => buildZhConstantsFromText(base.replace(/^BASELINE_COMMIT=.*$/m, 'BASELINE_COMMIT="abc"')), /40 位/);
  // 不读取的变量重复赋值不影响（build-zh.sh 里 STEP_NO 顶格赋值两次）。
  assert.doesNotThrow(() => buildZhConstantsFromText(`${base}\nSTEP_NO=99\n`));
  const arrayText = base.replace(
    /^DESKTOP_I18N_FILES=\($/m,
    "DESKTOP_I18N_FILES=(\n  # 注释行\n",
  );
  assert.equal(buildZhConstantsFromText(arrayText).desktopI18nFiles.length, readBuildZhConstants(path.join(ZH_ROOT, "scripts/build-zh.sh")).desktopI18nFiles.length);
  assert.throws(() => buildZhConstantsFromText(base.replace(/"dict\/zh-CN\.desktop\.json:zh-CN\.desktop\.json"/, '"../x:y"')), /路径异常/);
});

// ---------------------------------------------------------------------------
// 版本号、环境变量、参数引号

test("版本号：接受正式命名，拒绝 nightly / 上游预览版 / 非法格式", () => {
  assert.equal(validateVersion(VERSION), VERSION);
  assert.equal(validateVersion("0.1.0-zh.2"), "0.1.0-zh.2");
  for (const bad of ["0.1.0-nightly.20261017.1", "0.1.0-pr.12.3", "0.1.0-preview.20261017.4", "v0.1.0", "0.1", "0.1.0-zh..1"]) {
    assert.throws(() => validateVersion(bad), undefined, bad);
  }
});

test("打包环境剥离更新源与签名变量（大小写不敏感），保留其他变量", () => {
  const env = sanitizedPackagingEnv({
    PATH: "/bin",
    GITHUB_REPOSITORY: "owner/repo",
    github_repository: "owner/repo",
    GITHUB_REPOSITORY_OWNER: "owner",
    T3CODE_DESKTOP_UPDATE_REPOSITORY: "owner/repo",
    T3CODE_DESKTOP_MOCK_UPDATES: "true",
    T3CODE_DESKTOP_SIGNED: "true",
    CSC_LINK: "x",
    WIN_CSC_LINK: "x",
    AZURE_CLIENT_SECRET: "x",
    APPLE_API_KEY: "x",
    GH_TOKEN: "x",
    GITHUB_TOKEN: "x",
    ELECTRON_RUN_AS_NODE: "1",
    GITHUB_WORKSPACE: "/w",
    RUNNER_TEMP: "/t",
    T3CODE_HOME: "/h",
  });
  assert.deepEqual(Object.keys(env).sort(), ["GITHUB_WORKSPACE", "PATH", "RUNNER_TEMP", "T3CODE_HOME"]);
});

test("cmd.exe 参数引号：普通路径原样，含空格加引号，含特殊字符拒绝", () => {
  assert.equal(quoteForCmd("D:\\a\\_temp\\x.tar.gz"), "D:\\a\\_temp\\x.tar.gz");
  assert.equal(quoteForCmd("C:\\Program Files\\vp.cmd"), '"C:\\Program Files\\vp.cmd"');
  assert.throws(() => quoteForCmd("a&b c"));
  assert.throws(() => quoteForCmd('a"b'));
});

// ---------------------------------------------------------------------------
// 工作树守卫、补丁顺序

test("porcelain 路径：普通、重命名、带引号", () => {
  assert.equal(porcelainPath(" M apps/server/package.json"), "apps/server/package.json");
  assert.equal(porcelainPath("R  a/old.ts -> a/new.ts"), "a/new.ts");
  assert.equal(porcelainPath('?? "apps/web/a b.ts"'), "apps/web/a b.ts");
});

test("补丁按字节序排列，只取第一层 *.patch", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "t3zh-w-test-"));
  try {
    for (const name of ["0010-b.patch", "0002-a.patch", "README.md", "0001-Z.patch"]) fs.writeFileSync(path.join(dir, name), "");
    fs.mkdirSync(path.join(dir, "disabled"));
    fs.writeFileSync(path.join(dir, "disabled/0000-x.patch"), "");
    assert.deepEqual(listPatches(dir).map((file) => path.basename(file)), ["0001-Z.patch", "0002-a.patch", "0010-b.patch"]);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  assert.deepEqual(listPatches(WINDOWS_PATCH_DIR).map((file) => path.basename(file)), ["0001-windows-zh-packaging.patch"]);
});

// ---------------------------------------------------------------------------
// Windows 打包配置与产物校验

const goodStagePackage = () => ({
  version: VERSION,
  build: {
    productName: "T3 Code (Beta)",
    electronLanguages: ["en-US", "zh-CN"],
    nsis: { differentialPackage: true, installerLanguages: ["zh_CN"], language: "2052" },
    win: { target: ["nsis"], icon: "icon.ico", signExts: [".node", ".dll"], signAndEditExecutable: true },
  },
});

test("staging build 配置：通过与各类不符", () => {
  const expected = { version: VERSION, productName: "T3 Code (Beta)" };
  assert.deepEqual(checkStageBuildConfig(goodStagePackage(), expected), []);
  const withPublish = goodStagePackage() as any;
  withPublish.build.publish = [{ provider: "github", owner: "o", repo: "r" }];
  assert.match(checkStageBuildConfig(withPublish, expected).join("\n"), /publish/);
  const noZh = goodStagePackage() as any;
  noZh.build.electronLanguages = ["en-US"];
  assert.match(checkStageBuildConfig(noZh, expected).join("\n"), /zh-CN/);
  const multi = goodStagePackage() as any;
  multi.build.nsis.installerLanguages = ["en_US", "zh_CN"];
  assert.match(checkStageBuildConfig(multi, expected).join("\n"), /installerLanguages/);
  const signed = goodStagePackage() as any;
  signed.build.win.azureSignOptions = {};
  assert.match(checkStageBuildConfig(signed, expected).join("\n"), /签名/);
  assert.match(checkStageBuildConfig(goodStagePackage(), { ...expected, version: "0.1.0-zh.2" }).join("\n"), /version/);
});

test("输出目录：只有一个安装包、没有更新清单", () => {
  const exe = installerName(VERSION);
  assert.equal(exe, "T3-Code-0.1.1-zh.1-x64.exe");
  assert.deepEqual(checkOutputEntries([exe, `${exe}.blockmap`, "builder-debug.yml", "builder-effective-config.yaml"], VERSION), []);
  assert.match(checkOutputEntries([exe, "latest.yml"], VERSION).join("\n"), /更新清单/);
  assert.match(checkOutputEntries([exe, "nightly.yml"], VERSION).join("\n"), /更新清单/);
  assert.match(checkOutputEntries([exe, "other.exe"], VERSION).join("\n"), /只有一个安装包/);
  assert.match(checkOutputEntries([], VERSION).join("\n"), /只有一个安装包/);
  assert.deepEqual(extraOutputEntries([exe, "SHA256SUMS.txt", "x.log"], VERSION), ["x.log"]);
});

test("win-unpacked 文件清单：语言包、许可证、WSL runtime、无更新配置、文件数上限", () => {
  const good = [
    "T3 Code (Beta).exe",
    "locales/en-US.pak",
    "locales/zh-CN.pak",
    "resources/app.asar",
    "resources/server.asar",
    "resources/T3-Code-LICENSE.txt",
    "resources/wsl-runtime.tar.gz",
    "resources/wsl-runtime.tar.gz.sha256",
    "resources/resource-monitor/t3-resource-monitor.exe",
  ];
  const check = (files: string[]) => checkUnpackedFiles(files, "T3 Code (Beta)", "T3-Code-LICENSE.txt").join("\n");
  assert.equal(check(good), "");
  assert.match(check([...good, "resources/app-update.yml"]), /app-update/);
  assert.match(check(good.filter((rel) => rel !== "locales/zh-CN.pak")), /locales/);
  assert.match(check([...good, "locales/de.pak"]), /locales/);
  assert.match(check(good.filter((rel) => !rel.includes("LICENSE"))), /LICENSE/);
  const many = [...good, ...Array.from({ length: PAYLOAD_FILE_LIMIT }, (_, i) => `resources/extra-${i}`)];
  assert.match(check(many), /上限/);
  assert.equal(normalizeAsarEntry("\\apps\\server\\dist\\bin.mjs"), "apps/server/dist/bin.mjs");
  assert.equal(normalizeAsarEntry("/package.json"), "package.json");
});

test("CLI 归档结构检查", () => {
  const stem = cliArchiveStem(VERSION);
  assert.equal(stem, "t3-0.1.1-zh.1-linux-x64");
  const listing = [`./${stem}/`, `${stem}/t3`, `${stem}/client/`, `${stem}/client/index.html`, `${stem}/node_modules/`, `${stem}/node_modules/node-pty/build/Release/pty.node`].join("\n");
  const members = normalizeTarMembers(listing);
  assert.deepEqual(checkCliArchiveMembers(members, VERSION), []);
  assert.match(checkCliArchiveMembers(members, "0.1.0-zh.2").join("\n"), /顶层目录/);
  assert.match(checkCliArchiveMembers([...members, `${stem}/apps/server/dist/bin.mjs`], VERSION).join("\n"), /bin\.mjs/);
  assert.match(checkCliArchiveMembers(members.filter((m) => !m.endsWith("pty.node")), VERSION).join("\n"), /pty\.node/);
});

// ---------------------------------------------------------------------------
// Windows 补丁对固定 tag 的 v0.1.1 源文件

function upstreamGitDir(): string | undefined {
  const dir = process.env.T3ZH_UPSTREAM_GIT ?? path.join(ZH_ROOT, "upstream");
  const probe = spawnSync("git", ["-C", dir, "rev-parse", `${UPSTREAM_TAG}^{commit}`], { encoding: "utf8" });
  return probe.status === 0 && probe.stdout.trim() === UPSTREAM_COMMIT ? dir : undefined;
}

test("Windows 补丁：上限常量与 package-windows.ts 一致", () => {
  const text = fs.readFileSync(WINDOWS_PATCH, "utf8");
  const match = /^\+export const WINDOWS_PACKAGED_PAYLOAD_FILE_LIMIT = (\d+) \+ (\d+);$/m.exec(text);
  assert.ok(match, "补丁里找不到新的文件数上限");
  assert.equal(Number(match[1]) + Number(match[2]), PAYLOAD_FILE_LIMIT);
  assert.match(text, /^\+\s+\? \[\.\.\.DESKTOP_ELECTRON_LANGUAGES, "zh-CN"\]$/m);
  assert.match(text, /^\+\s+installerLanguages: \["zh_CN"\],$/m);
  assert.match(text, /^\+\s+language: "2052",$/m);
});

test("Windows 补丁：可打到 v0.1.1 原文件，也可接在共享补丁之后，打完仍能解析", async (t) => {
  const upstream = upstreamGitDir();
  if (!upstream) return t.skip(`找不到 ${UPSTREAM_TAG} = ${UPSTREAM_COMMIT} 的上游 git 对象`);
  const file = "scripts/build-desktop-artifact.ts";
  const original = execFileSync("git", ["-C", upstream, "show", `${UPSTREAM_TAG}:${file}`]);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "t3zh-w-patch-"));
  const git = (...args: string[]) => execFileSync("git", ["-C", dir, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  try {
    git("init", "-q");
    fs.mkdirSync(path.join(dir, "scripts"));
    fs.writeFileSync(path.join(dir, file), original);
    git("apply", "--check", WINDOWS_PATCH);

    // 共享补丁里只取改这个文件的部分；共享补丁本身打不上（例如 A 段迁移进行中）时只记录、不判本补丁失败。
    const shared = listPatches(path.join(ZH_ROOT, "patches")).filter((patch) => fs.readFileSync(patch, "utf8").includes(`b/${file}`));
    const skipped: string[] = [];
    for (const patch of shared) {
      const result = spawnSync("git", ["-C", dir, "apply", `--include=${file}`, patch], { encoding: "utf8" });
      if (result.status !== 0) skipped.push(path.basename(patch));
    }
    if (skipped.length > 0) t.diagnostic(`共享补丁未能打到 ${UPSTREAM_TAG}，未参与叠加验证：${skipped.join(", ")}`);
    git("apply", WINDOWS_PATCH);

    const patched = fs.readFileSync(path.join(dir, file), "utf8");
    const babel = path.join(ZH_ROOT, "node_modules/@babel/parser/lib/index.js");
    // 解析失败会抛异常；只验证语法，不做类型检查。
    const { parse } = (await import(pathToFileURL(babel).href)) as typeof import("@babel/parser");
    parse(patched, { sourceType: "module", plugins: ["typescript", "importAttributes"] });
    assert.match(patched, /platform === "win"\n\s+\? \[\.\.\.DESKTOP_ELECTRON_LANGUAGES, "zh-CN"\]/);
    assert.equal((patched.match(/installerLanguages: \["zh_CN"\]/g) ?? []).length, 1);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// fetch-upstream.sh 与 workflow

test("fetch-upstream.sh：语法正确，参数不全或 commit 非法时失败", () => {
  const script = path.join(ZH_ROOT, "scripts/windows/fetch-upstream.sh");
  assert.equal(spawnSync("bash", ["-n", script]).status, 0);
  assert.notEqual(spawnSync("bash", [script], { encoding: "utf8" }).status, 0);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "t3zh-w-fetch-"));
  try {
    assert.notEqual(spawnSync("bash", [script, path.join(dir, "src"), UPSTREAM_TAG, "abc"], { encoding: "utf8" }).status, 0);
    fs.writeFileSync(path.join(dir, "occupied"), "");
    assert.notEqual(spawnSync("bash", [script, dir, UPSTREAM_TAG, UPSTREAM_COMMIT], { encoding: "utf8" }).status, 0);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

function loadWorkflow(): any | undefined {
  const ruby = spawnSync(
    "ruby",
    ["-ryaml", "-rjson", "-e", "puts JSON.generate(YAML.safe_load(File.read(ARGV[0]), aliases: false))", WORKFLOW],
    { encoding: "utf8" },
  );
  if (ruby.error || ruby.status !== 0) return undefined;
  return JSON.parse(ruby.stdout);
}

test("workflow：触发、权限、版本与基线", (t) => {
  const wf = loadWorkflow();
  if (!wf) return t.skip("没有 ruby，跳过 YAML 结构检查");
  // YAML 1.1 把裸写的 on 解析成 true。
  const on = wf.on ?? wf.true;
  assert.deepEqual(Object.keys(on).sort(), ["push", "workflow_dispatch"]);
  assert.deepEqual(on.push, { branches: ["build/t23-v011-dual-platform"] });
  assert.equal(on.workflow_dispatch.inputs.version.default, VERSION);
  assert.deepEqual(wf.permissions, { contents: "read" });
  assert.equal(wf.env.UPSTREAM_TAG, UPSTREAM_TAG);
  assert.equal(wf.env.UPSTREAM_COMMIT, UPSTREAM_COMMIT);
  assert.deepEqual(Object.keys(wf.jobs), ["bundle", "linux_cli", "windows"]);
  assert.deepEqual(wf.jobs.linux_cli.needs, ["bundle"]);
  assert.deepEqual(wf.jobs.windows.needs, ["bundle", "linux_cli"]);
  assert.equal(wf.jobs.windows["runs-on"], "windows-2025");
  for (const job of Object.values<any>(wf.jobs)) assert.equal(job.permissions, undefined, "job 不应放宽权限");
});

test("workflow：不发布、不推送、不用密钥，第三方 action 固定 SHA，引用的脚本都存在", (t) => {
  const wf = loadWorkflow();
  if (!wf) return t.skip("没有 ruby，跳过 YAML 结构检查");
  const text = fs.readFileSync(WORKFLOW, "utf8");
  assert.doesNotMatch(text, /secrets\./);
  assert.doesNotMatch(text, /gh release|softprops|action-gh-release|git push|npm publish|contents: write/);
  const steps = Object.values<any>(wf.jobs).flatMap((job) => job.steps);
  for (const step of steps) {
    if (!step.uses) continue;
    if (step.uses.startsWith("actions/checkout@")) {
      assert.equal(step.with?.["persist-credentials"], false, "checkout 不保留凭据");
      continue;
    }
    assert.match(step.uses, /@[0-9a-f]{40}$/, `${step.uses} 应固定到 commit SHA`);
  }
  const referenced = new Set([...text.matchAll(/scripts\/windows\/([A-Za-z0-9_.-]+\.(?:ts|sh|ps1))/g)].map((m) => m[1]!));
  assert.ok(referenced.has("smoke-installed.ps1"));
  for (const name of referenced) {
    if (name === "smoke-installed.ps1") continue; // 主会话维护，可能尚未落盘
    assert.ok(fs.existsSync(path.join(ZH_ROOT, "scripts/windows", name)), `workflow 引用的 scripts/windows/${name} 不存在`);
  }
  // 打包步骤不得把 GITHUB_REPOSITORY 显式传给子进程（package-windows.ts 负责剥离）。
  const packageStep = wf.jobs.windows.steps.find((step: any) => /package-windows\.ts/.test(step.run ?? ""));
  assert.ok(packageStep);
  assert.equal(packageStep.env, undefined);
  // 安装包 artifact 只含 EXE 与校验和。
  const upload = wf.jobs.windows.steps.find((step: any) => step.name === "Upload Windows installer");
  assert.match(upload.with.path, /T3-Code-\$\{\{ env\.T3ZH_VERSION \}\}-x64\.exe/);
  assert.doesNotMatch(upload.with.path, /\*/);
});
