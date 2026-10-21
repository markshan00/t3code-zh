/**
 * 准备汉化构建用的上游源码树（T21-W，CI 各 job 共用；本地也可在临时目录里跑）。
 *
 * 用法：
 *   （源码由 scripts/windows/fetch-upstream.sh 浅取到空目录，或用任意干净的基线 worktree。）
 *   node scripts/windows/prepare-source.ts prepare --src <目录> --version <版本> --platform <mac|linux|win>
 *       [--expect-commit <commit>] [--evidence <json>]
 *       等价于 scripts/build-zh.sh 第 1、4、5 步和第 9 步的版本字段：核对基线（以 build-zh.sh 的
 *       BASELINE_COMMIT 为准）→ 按序应用共享 patches/ →（仅 win）应用 scripts/windows/patches/
 *       → T3 Connect 公开标识写 .env 并核对 → 复制 web 包装配置和桌面汉化文件 → 写 server 版本。
 *   node scripts/windows/prepare-source.ts verify-tree --src <目录> --version <版本> --platform <…>
 *       等价于 build-zh.sh 第 13 步的工作树守卫：只允许补丁、包装配置、桌面汉化文件、server 版本字段，
 *       以及逐项验证过的上游生成文件出现改动；.env 只能是四个 T3 Connect 公开标识。
 *
 * 不 reset、不 clean：要求 prepare 时工作树干净（新取的源码天然干净），不对已有改动做破坏性操作。
 */
import fs from "node:fs";
import path from "node:path";

import { readBuildZhConstants, type BuildZhConstants } from "./lib/build-zh-constants.ts";
import {
  check,
  fail,
  git,
  isMainModule,
  log,
  main,
  parseArgs,
  requireValue,
  run,
  sha256File,
  validateVersion,
  writeJson,
  ZH_ROOT,
} from "./lib/common.ts";

export const PLATFORMS = ["mac", "linux", "win"] as const;
export type Platform = (typeof PLATFORMS)[number];

export const SHARED_PATCH_DIR = path.join(ZH_ROOT, "patches");
export const WINDOWS_PATCH_DIR = path.join(ZH_ROOT, "scripts/windows/patches");
const SERVER_PACKAGE_JSON = "apps/server/package.json";

/** 补丁目录下按文件名排序的 *.patch（只看第一层，与 build-zh.sh 的 find -maxdepth 1 | LC_ALL=C sort 一致）。 */
export function listPatches(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".patch"))
    .map((entry) => entry.name)
    .sort((a, b) => Buffer.compare(Buffer.from(a), Buffer.from(b)))
    .map((name) => path.join(dir, name));
}

export function patchesForPlatform(platform: Platform): string[] {
  return [...listPatches(SHARED_PATCH_DIR), ...(platform === "win" ? listPatches(WINDOWS_PATCH_DIR) : [])];
}

function parsePlatform(value: string): Platform {
  check((PLATFORMS as ReadonlyArray<string>).includes(value), `--platform 只能是 ${PLATFORMS.join("/")}：${value}`);
  return value as Platform;
}

function patchTouchedFiles(src: string, patch: string): string[] {
  const { stdout } = git(src, ["apply", "--numstat", patch], { capture: true });
  return stdout
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.split("\t")[2]!)
    .filter(Boolean);
}

/** 由 build-zh.sh 常量算出的、允许出现在工作树改动里的路径（不含上游生成文件，单独验证）。 */
export function allowedTreeChanges(src: string, constants: BuildZhConstants, platform: Platform): Set<string> {
  const allowed = new Set<string>();
  for (const patch of patchesForPlatform(platform)) for (const file of patchTouchedFiles(src, patch)) allowed.add(file);
  allowed.add(`apps/web/${constants.wrapperName}`);
  for (const [, name] of constants.desktopI18nFiles) allowed.add(`${constants.desktopI18nDir}/${name}`);
  allowed.add(SERVER_PACKAGE_JSON);
  return allowed;
}

/** `git status --porcelain` 一行 → 路径（处理重命名与引号，与 build-zh.sh 相同口径）。 */
export function porcelainPath(line: string): string {
  let file = line.slice(3);
  const arrow = file.lastIndexOf(" -> ");
  if (arrow >= 0) file = file.slice(arrow + 4);
  if (file.startsWith('"') && file.endsWith('"')) file = file.slice(1, -1);
  return file;
}

function statusLines(src: string): string[] {
  const { stdout } = git(src, ["status", "--porcelain", "--untracked-files=all"], { capture: true });
  return stdout.split(/\r?\n/).filter(Boolean);
}

function headCommit(src: string): string {
  return git(src, ["rev-parse", "HEAD"], { capture: true }).stdout.trim();
}

function connectConfig(command: "prepare" | "check-source" | "check-artifacts", src: string): void {
  run(process.execPath, [path.join(ZH_ROOT, "scripts/lib/t3-connect-config.ts"), command, src]);
}

export function writeServerVersion(src: string, version: string): void {
  const file = path.join(src, SERVER_PACKAGE_JSON);
  const pkg = JSON.parse(fs.readFileSync(file, "utf8"));
  pkg.version = version;
  fs.writeFileSync(file, `${JSON.stringify(pkg, null, 2)}\n`);
}

function checkServerVersionOnly(src: string, version: string): void {
  const original = JSON.parse(git(src, ["show", `HEAD:${SERVER_PACKAGE_JSON}`], { capture: true }).stdout);
  const actual = JSON.parse(fs.readFileSync(path.join(src, SERVER_PACKAGE_JSON), "utf8"));
  check(actual.version === version, `${SERVER_PACKAGE_JSON} 的 version 是 ${actual.version}，不是 ${version}`);
  check(
    JSON.stringify({ ...original, version }) === JSON.stringify(actual),
    `${SERVER_PACKAGE_JSON} 除 version 外还有改动`,
  );
}

function commandPrepare(argv: string[]): void {
  const { values } = parseArgs(argv, { values: ["src", "version", "platform", "expect-commit", "evidence"] });
  const src = path.resolve(requireValue(values, "src"));
  const version = validateVersion(requireValue(values, "version"));
  const platform = parsePlatform(requireValue(values, "platform"));
  const constants = readBuildZhConstants(path.join(ZH_ROOT, "scripts/build-zh.sh"));

  // build-zh.sh 第 1 步：基线 commit 以 build-zh.sh 为准；CI 另外传入预期值，防止在 A 段切基线前误跑。
  const head = headCommit(src);
  check(head === constants.baselineCommit, `源码 HEAD ${head} 不是 build-zh.sh 的基线 ${constants.baselineCommit}`);
  const expect = values.get("expect-commit");
  if (expect) check(expect === constants.baselineCommit, `build-zh.sh 的基线 ${constants.baselineCommit} 不是本次预期 ${expect}`);
  const dirty = statusLines(src);
  check(dirty.length === 0, `源码树不干净（prepare 只接受刚取出的干净树）：\n${dirty.join("\n")}`);

  // build-zh.sh 第 4 步（共享补丁）+ 仅 Windows 的打包补丁。
  const applied: { file: string; sha256: string }[] = [];
  for (const patch of patchesForPlatform(platform)) {
    const result = git(src, ["apply", patch], { allowFailure: true });
    if (result.status !== 0) fail(`补丁打不上：${path.relative(ZH_ROOT, patch)}（按 patches/README.md 重做）`);
    applied.push({ file: path.relative(ZH_ROOT, patch).split(path.sep).join("/"), sha256: sha256File(patch) });
    log(`已应用 ${path.relative(ZH_ROOT, patch)}`);
  }
  check(applied.length > 0, "没有任何补丁：patches/ 目录不对？");

  // build-zh.sh 第 5 步。
  connectConfig("prepare", src);
  connectConfig("check-source", src);
  fs.copyFileSync(path.join(ZH_ROOT, "build", constants.wrapperName), path.join(src, "apps/web", constants.wrapperName));
  log(`已复制 build/${constants.wrapperName} → apps/web/${constants.wrapperName}`);
  run(process.execPath, [path.join(ZH_ROOT, "scripts/check-dict.ts"), path.join(ZH_ROOT, "dict/zh-CN.desktop.json")]);
  const i18nDir = path.join(src, constants.desktopI18nDir);
  check(!fs.existsSync(i18nDir), `上游源码里已有 ${constants.desktopI18nDir}，与桌面汉化文件的目录冲突`);
  fs.mkdirSync(i18nDir, { recursive: true });
  for (const [from, to] of constants.desktopI18nFiles) {
    fs.copyFileSync(path.join(ZH_ROOT, from), path.join(i18nDir, to));
    log(`已复制 ${from} → ${constants.desktopI18nDir}/${to}`);
  }

  // build-zh.sh 第 9 步的版本字段：serverVersion、CLI --version、桌面主进程读的 server 版本都来自它。
  writeServerVersion(src, version);
  log(`${SERVER_PACKAGE_JSON} version = ${version}`);

  const evidence = values.get("evidence");
  if (evidence) {
    const zhCommit = run("git", ["-C", ZH_ROOT, "rev-parse", "HEAD"], { capture: true, allowFailure: true }).stdout.trim();
    writeJson(path.resolve(evidence), {
      platform,
      version,
      upstreamCommit: head,
      zhCommit: zhCommit || null,
      patches: applied,
      wrapper: { file: `build/${constants.wrapperName}`, sha256: sha256File(path.join(ZH_ROOT, "build", constants.wrapperName)) },
      desktopI18nFiles: constants.desktopI18nFiles.map(([from]) => ({ file: from, sha256: sha256File(path.join(ZH_ROOT, from)) })),
      dict: { file: "dict/zh-CN.json", sha256: sha256File(path.join(ZH_ROOT, "dict/zh-CN.json")) },
    });
  }
  log(`源码准备完成（${platform}，${applied.length} 个补丁）`);
}

function commandVerifyTree(argv: string[]): void {
  const { values } = parseArgs(argv, { values: ["src", "version", "platform"] });
  const src = path.resolve(requireValue(values, "src"));
  const version = validateVersion(requireValue(values, "version"));
  const platform = parsePlatform(requireValue(values, "platform"));
  const constants = readBuildZhConstants(path.join(ZH_ROOT, "scripts/build-zh.sh"));
  check(headCommit(src) === constants.baselineCommit, "源码 HEAD 已不是基线");

  // .env 被上游 Git 忽略，单独核对字段和值。
  connectConfig("check-source", src);
  checkServerVersionOnly(src, version);

  const allowed = allowedTreeChanges(src, constants, platform);
  const unexpected: string[] = [];
  for (const line of statusLines(src)) {
    const file = porcelainPath(line);
    if (allowed.has(file)) continue;
    if (constants.upstreamGeneratedFiles.includes(file)) {
      run(process.execPath, [path.join(ZH_ROOT, "scripts/lib/upstream-generated.ts"), src, constants.baselineCommit, file]);
      log(`放行上游生成文件 ${file}（与干净基线独立重生成的结果逐字节一致）`);
      continue;
    }
    unexpected.push(line);
  }
  check(unexpected.length === 0, `源码树出现了补丁、包装配置、桌面汉化文件和 server 版本字段以外的改动：\n${unexpected.join("\n")}`);
  log(`工作树改动守卫通过（${platform}，放行 ${allowed.size} 个路径）`);
}

if (isMainModule(import.meta.url)) {
  await main("prepare-source", () => {
    const [command, ...rest] = process.argv.slice(2);
    if (command === "prepare") return commandPrepare(rest);
    if (command === "verify-tree") return commandVerifyTree(rest);
    fail("用法：prepare-source.ts <prepare|verify-tree> …（见文件头）");
  });
}
