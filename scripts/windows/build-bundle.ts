/**
 * 构建平台无关的中文 JS bundle（T21-W；CI 的 bundle job 在 Linux 上运行，本地 macOS 也可跑）。
 *
 * 用法（源码已经过 prepare-source.ts prepare，且已在源码根目录装好依赖）：
 *   node scripts/windows/build-bundle.ts --src <目录> --version <版本> [--evidence <json>]
 *
 * 等价于 scripts/build-zh.sh 第 6–10 步，守卫常量从 build-zh.sh 读取：
 *   6 构建链守卫 → 7 web（包装配置 + 转换插件）→ 8 web 产物守卫 → 9 server（不经 vp run，避免 dependsOn
 *   用上游配置重建 web）与版本核对 → 10 desktop（dist-electron）与桌面汉化、T3 Connect 产物守卫。
 * 产物：<src>/apps/server/dist（含中文 web client）与 <src>/apps/desktop/dist-electron，即上游 CI 的 js-bundle。
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { readBuildZhConstants, type BuildZhConstants } from "./lib/build-zh-constants.ts";
import {
  check,
  findTextInJs,
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

const STATS_FILE = path.join(ZH_ROOT, "reports/transform-stats.json");

function guardBuildChain(src: string, constants: BuildZhConstants): void {
  const checks: [string, string, string][] = [
    ["apps/server/vite.config.ts", "run.tasks.build.command", constants.expectedServerBuildCommand],
    ["apps/server/vite.config.ts", "run.tasks.build.dependsOn", constants.expectedServerBuildDependsOn],
    ["apps/desktop/vite.config.ts", "run.tasks.build.command", constants.expectedDesktopBuildCommand],
    ["apps/desktop/vite.config.ts", "run.tasks.build.dependsOn", constants.expectedDesktopBuildDependsOn],
    ["apps/web/package.json", "scripts.build", constants.expectedWebBuildScript],
    ["package.json", "scripts.build:desktop", constants.expectedRootBuildDesktopScript],
  ];
  const mismatches: string[] = [];
  for (const [file, query, expected] of checks) {
    const { status, stdout } = run(process.execPath, [path.join(ZH_ROOT, "scripts/lib/build-chain.ts"), path.join(src, file), query], {
      capture: true,
      allowFailure: true,
    });
    const actual = stdout.trim();
    if (status !== 0 || actual !== expected) mismatches.push(`${file} ${query}\n  预期：${expected}\n  实际：${status === 0 ? actual : "（读不到）"}`);
    else log(`一致：${file} ${query} = ${actual}`);
  }
  check(mismatches.length === 0, `上游构建链变了，需要同步 build-zh.sh：\n${mismatches.join("\n")}`);
}

function buildWeb(src: string, version: string, constants: BuildZhConstants): number {
  fs.rmSync(STATS_FILE, { force: true });
  run("vp", ["build", "-c", constants.wrapperName], {
    cwd: path.join(src, "apps/web"),
    env: { ...process.env, APP_VERSION: version, T3ZH_ROOT: ZH_ROOT },
  });
  const dist = path.join(src, "apps/web/dist");
  check(fs.existsSync(path.join(dist, "index.html")), "apps/web/dist/index.html 不存在");
  check(fs.existsSync(STATS_FILE), `没有生成 ${path.relative(ZH_ROOT, STATS_FILE)}（插件没运行？）`);
  const translated = Number(JSON.parse(fs.readFileSync(STATS_FILE, "utf8")).totals?.translate);
  log(`转换总数 ${translated}（阈值 ${constants.minTranslate}）`);
  check(Number.isFinite(translated) && translated >= constants.minTranslate, `转换总数 ${translated} 低于阈值 ${constants.minTranslate}`);
  const hit = findTextInJs(dist, constants.guardText);
  check(hit, `apps/web/dist 里找不到固定中文「${constants.guardText}」：词库没有打包进去`);
  log(`固定中文「${constants.guardText}」见于 apps/web/dist/${hit}`);
  check(findTextInJs(path.join(dist, "assets"), version), `web 产物未包含交付版本 ${version}`);
  return translated;
}

function buildServer(src: string, version: string, constants: BuildZhConstants): string {
  const serverDir = path.join(src, "apps/server");
  run(process.execPath, ["scripts/cli.ts", "build"], { cwd: serverDir });
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "t3zh-build-version-"));
  try {
    const { stdout } = run(process.execPath, [path.join(serverDir, "dist/bin.mjs"), "--version"], {
      capture: true,
      env: { ...process.env, T3CODE_HOME: home },
    });
    const actual = stdout.trim();
    check(actual === `t3 v${version}`, `server 版本 ${actual} 与交付版本 ${version} 不一致`);
    log(`server --version = ${actual}`);
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
  check(
    findTextInJs(path.join(serverDir, "dist/client"), constants.guardText),
    `apps/server/dist/client 里找不到「${constants.guardText}」：server 没有带上中文 web 产物`,
  );
  return `t3 v${version}`;
}

function buildDesktop(src: string, constants: BuildZhConstants): void {
  // 与 build-zh.sh 一样直接执行上游 build 任务的命令串（已由构建链守卫核对），不经 vp run 的 dependsOn。
  run(constants.expectedDesktopBuildCommand, [], { cwd: path.join(src, "apps/desktop"), shell: true });
  const dist = path.join(src, "apps/desktop/dist-electron");
  const main = path.join(dist, "main.cjs");
  const preload = path.join(dist, "preload.cjs");
  check(fs.existsSync(main) && fs.existsSync(preload), "apps/desktop/dist-electron 里缺 main.cjs 或 preload.cjs");
  const mainCode = fs.readFileSync(main, "utf8");
  check(mainCode.includes(constants.desktopMainGuardText), `main.cjs 里找不到「${constants.desktopMainGuardText}」：桌面词库没有打包进去`);
  check(mainCode.includes(constants.desktopArgumentGuardText), `main.cjs 里找不到 ${constants.desktopArgumentGuardText}`);
  check(fs.readFileSync(preload, "utf8").includes(constants.desktopPreloadGuardText), `preload.cjs 里找不到 ${constants.desktopPreloadGuardText}`);
  log("桌面产物守卫通过");
  run(process.execPath, [path.join(ZH_ROOT, "scripts/lib/t3-connect-config.ts"), "check-artifacts", src]);
}

if (isMainModule(import.meta.url)) {
  await main("build-bundle", () => {
    const { values } = parseArgs(process.argv.slice(2), { values: ["src", "version", "evidence"] });
    const src = path.resolve(requireValue(values, "src"));
    const version = validateVersion(requireValue(values, "version"));
    const constants = readBuildZhConstants(path.join(ZH_ROOT, "scripts/build-zh.sh"));
    delete process.env.ELECTRON_RUN_AS_NODE;

    guardBuildChain(src, constants);
    const translated = buildWeb(src, version, constants);
    const serverVersion = buildServer(src, version, constants);
    buildDesktop(src, constants);

    const evidence = values.get("evidence");
    if (evidence) {
      writeJson(path.resolve(evidence), {
        version,
        translate: translated,
        minTranslate: constants.minTranslate,
        serverVersion,
        transformStatsSha256: sha256File(STATS_FILE),
        desktopMainSha256: sha256File(path.join(src, "apps/desktop/dist-electron/main.cjs")),
        serverEntrySha256: sha256File(path.join(src, "apps/server/dist/bin.mjs")),
      });
    }
    log("中文 JS bundle 构建完成");
  });
}
