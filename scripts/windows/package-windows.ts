/**
 * 在 Windows runner 上打 unsigned x64 NSIS 安装包并核对包内容（T21-W）。
 *
 * 用法（源码已 prepare --platform win、装好依赖，js-bundle 已解压到 <src>/apps）：
 *   node scripts/windows/package-windows.ts --src <源码目录> --version <版本> --wsl-runtime <t3-<版本>-linux-x64.tar.gz>
 *       --out <安装包输出目录> --evidence <证据目录> [--stage-temp <临时目录>]
 *
 * 1. 调上游 scripts/build-desktop-artifact.ts（即 `vp run dist:desktop:artifact`）：
 *    --platform win --target nsis --arch x64 --skip-build --keep-stage --wsl-runtime …；
 *    子进程环境去掉 GITHUB_REPOSITORY 等更新源 / 签名变量（lib/common.ts PACKAGING_ENV_DENYLIST），
 *    否则 runner 自动注入的 GITHUB_REPOSITORY 会让包带上指向公开仓库的自动更新配置。
 * 2. 读 --keep-stage 留下的 staging：核对 electron-builder 实际收到的 build 配置（无 publish、zh-CN.pak、
 *    单语中文 NSIS、未签名）和 win-unpacked 内容（许可证逐字节、无 app-update.yml、WSL runtime 哈希、
 *    server.asar 里的中文 web client 与版本、app.asar 里的桌面汉化守卫文字、文件数上限）。
 * 3. 输出目录只应有安装包和 electron-builder 的调试 / blockmap 文件，不应有 latest*.yml 等更新清单。
 * 安装和启动烟测不在这里，见 scripts/windows/smoke-installed.ps1（主会话维护）。
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { readBuildZhConstants, type BuildZhConstants } from "./lib/build-zh-constants.ts";
import {
  check,
  isMainModule,
  listFiles,
  log,
  main,
  parseArgs,
  requireValue,
  run,
  sanitizedPackagingEnv,
  sha256File,
  validateVersion,
  writeJson,
  ZH_ROOT,
} from "./lib/common.ts";
import { cliArchiveStem } from "./check-cli-archive.ts";

export const ARCH = "x64";
/** 与仅 Windows 补丁 0001 中的 WINDOWS_PACKAGED_PAYLOAD_FILE_LIMIT（80 + 2）一致。 */
export const PAYLOAD_FILE_LIMIT = 82;
export const EXPECTED_LOCALES = ["en-US.pak", "zh-CN.pak"];

export function installerName(version: string): string {
  return `T3-Code-${version}-${ARCH}.exe`;
}

/** electron-builder 收到的 build 配置（staging 的 package.json#build）。返回问题列表，空数组表示通过。 */
export function checkStageBuildConfig(
  stagePackage: Record<string, any>,
  expected: { readonly version: string; readonly productName: string },
): string[] {
  const problems: string[] = [];
  const build = stagePackage.build ?? {};
  if (stagePackage.version !== expected.version) problems.push(`staging version 是 ${stagePackage.version}，不是 ${expected.version}`);
  if (build.productName !== expected.productName) problems.push(`productName 是 ${build.productName}，不是 ${expected.productName}`);
  if ("publish" in build) problems.push(`build 配置含 publish（会生成自动更新源）：${JSON.stringify(build.publish)}`);
  const languages: unknown = build.electronLanguages;
  if (!Array.isArray(languages) || !languages.includes("en-US") || !languages.includes("zh-CN")) {
    problems.push(`electronLanguages 应含 en-US 与 zh-CN：${JSON.stringify(languages)}`);
  }
  const nsis = build.nsis ?? {};
  if (JSON.stringify(nsis.installerLanguages) !== JSON.stringify(["zh_CN"])) {
    problems.push(`nsis.installerLanguages 应为 ["zh_CN"]：${JSON.stringify(nsis.installerLanguages)}`);
  }
  if (nsis.language !== "2052") problems.push(`nsis.language 应为 "2052"：${JSON.stringify(nsis.language)}`);
  if (nsis.displayLanguageSelector === true) problems.push("nsis.displayLanguageSelector 不应开启");
  const win = build.win ?? {};
  if (JSON.stringify(win.target) !== JSON.stringify(["nsis"])) problems.push(`win.target 应为 ["nsis"]：${JSON.stringify(win.target)}`);
  if ("azureSignOptions" in win || "certificateFile" in win || "signtoolOptions" in win) problems.push("win 配置不应含签名设置（unsigned 构建）");
  return problems;
}

/** 安装包输出目录的文件名清单。 */
export function checkOutputEntries(entries: ReadonlyArray<string>, version: string): string[] {
  const problems: string[] = [];
  const exe = installerName(version);
  const exes = entries.filter((name) => name.toLowerCase().endsWith(".exe"));
  if (exes.length !== 1 || exes[0] !== exe) problems.push(`输出目录应只有一个安装包 ${exe}：${JSON.stringify(exes)}`);
  // 更新清单（latest.yml、nightly.yml 等）只在有 publish 配置时生成；builder-debug.yml 是配置转储，不是更新源。
  const feeds = entries.filter((name) => /\.ya?ml$/i.test(name) && !["builder-debug.yml", "builder-effective-config.yaml"].includes(name));
  if (feeds.length > 0) problems.push(`输出目录出现更新清单：${feeds.join(", ")}`);
  return problems;
}

/** 输出目录里除安装包、blockmap、配置转储外的文件（只提示，不判失败；上传时只取安装包）。 */
export function extraOutputEntries(entries: ReadonlyArray<string>, version: string): string[] {
  const exe = installerName(version);
  const known = new Set([exe, `${exe}.blockmap`, "builder-debug.yml", "builder-effective-config.yaml", "SHA256SUMS.txt"]);
  return entries.filter((name) => !known.has(name));
}

/** win-unpacked 的文件清单（相对路径，/ 分隔）。 */
export function checkUnpackedFiles(files: ReadonlyArray<string>, productName: string, licenseName: string): string[] {
  const problems: string[] = [];
  const has = (rel: string) => files.includes(rel);
  if (!has(`${productName}.exe`)) problems.push(`缺少 ${productName}.exe`);
  const locales = files.filter((rel) => rel.startsWith("locales/")).map((rel) => rel.slice("locales/".length)).sort();
  if (JSON.stringify(locales) !== JSON.stringify(EXPECTED_LOCALES)) problems.push(`locales 应恰为 ${EXPECTED_LOCALES.join("、")}：${locales.join("、")}`);
  for (const rel of [
    "resources/app.asar",
    "resources/server.asar",
    `resources/${licenseName}`,
    "resources/wsl-runtime.tar.gz",
    "resources/wsl-runtime.tar.gz.sha256",
    "resources/resource-monitor/t3-resource-monitor.exe",
  ]) {
    if (!has(rel)) problems.push(`缺少 ${rel}`);
  }
  if (files.some((rel) => /(^|\/)app-update\.yml$/.test(rel))) problems.push("包里有 app-update.yml（自动更新配置）");
  if (files.length > PAYLOAD_FILE_LIMIT) problems.push(`win-unpacked 有 ${files.length} 个文件，超过上限 ${PAYLOAD_FILE_LIMIT}`);
  return problems;
}

type AsarModule = {
  listPackage(archive: string, options: { isPack: boolean }): string[];
  extractFile(archive: string, filename: string): Buffer;
};

async function loadAsar(): Promise<AsarModule> {
  const entry = path.join(ZH_ROOT, "node_modules/@electron/asar/lib/asar.js");
  check(fs.existsSync(entry), "找不到 t3code-zh/node_modules/@electron/asar（先在 t3code-zh 根目录 npm ci）");
  return (await import(pathToFileURL(entry).href)) as AsarModule;
}

/** asar 条目 → / 分隔、无前导分隔符的相对路径。 */
export function normalizeAsarEntry(entry: string): string {
  return entry.replace(/\\/g, "/").replace(/^\/+/, "");
}

function checkAsarContents(asar: AsarModule, resources: string, version: string, constants: BuildZhConstants): Record<string, string> {
  const read = (archive: string, rel: string) => asar.extractFile(path.join(resources, archive), path.join(...rel.split("/")));

  const serverEntries = asar.listPackage(path.join(resources, "server.asar"), { isPack: false }).map(normalizeAsarEntry);
  const clientPrefix = "apps/server/dist/client/";
  check(serverEntries.includes("apps/server/dist/bin.mjs"), "server.asar 里没有 apps/server/dist/bin.mjs");
  check(serverEntries.includes(`${clientPrefix}index.html`), "server.asar 里没有中文 web client 的 index.html");
  const clientJs = serverEntries.filter((rel) => rel.startsWith(`${clientPrefix}assets/`) && rel.endsWith(".js"));
  const guardHit = clientJs.find((rel) => read("server.asar", rel).toString("utf8").includes(constants.guardText));
  check(guardHit, `server.asar 的 web client 里找不到固定中文「${constants.guardText}」`);
  const versionHit = clientJs.find((rel) => read("server.asar", rel).toString("utf8").includes(version));
  check(versionHit, `server.asar 的 web client 里找不到交付版本 ${version}`);
  // server.asar 根目录是上游 stageWindowsServerSidecar 写的 sidecar package.json（version = --build-version）。
  const serverPackage = JSON.parse(read("server.asar", "package.json").toString("utf8"));
  check(serverPackage.version === version, `server.asar 的 package.json version 是 ${serverPackage.version}`);
  const serverChunks = serverEntries.filter((rel) => /^apps\/server\/dist\/[^/]+\.mjs$/.test(rel));
  check(
    serverChunks.some((rel) => read("server.asar", rel).toString("utf8").includes(version)),
    `server.asar 的 server bundle 里找不到编译进去的版本 ${version}`,
  );

  const appEntries = asar.listPackage(path.join(resources, "app.asar"), { isPack: false }).map(normalizeAsarEntry);
  const mainRel = "apps/desktop/dist-electron/main.cjs";
  const preloadRel = "apps/desktop/dist-electron/preload.cjs";
  check(appEntries.includes(mainRel) && appEntries.includes(preloadRel), "app.asar 里缺 main.cjs 或 preload.cjs");
  const mainCode = read("app.asar", mainRel).toString("utf8");
  check(mainCode.includes(constants.desktopMainGuardText), `app.asar main.cjs 里找不到「${constants.desktopMainGuardText}」`);
  check(mainCode.includes(constants.desktopArgumentGuardText), `app.asar main.cjs 里找不到 ${constants.desktopArgumentGuardText}`);
  check(read("app.asar", preloadRel).toString("utf8").includes(constants.desktopPreloadGuardText), `app.asar preload.cjs 里找不到 ${constants.desktopPreloadGuardText}`);
  const appPackage = JSON.parse(read("app.asar", "package.json").toString("utf8"));
  check(appPackage.version === version, `app.asar package.json 的 version 是 ${appPackage.version}`);
  return { clientGuardAsset: guardHit, clientVersionAsset: versionHit };
}

function findStageDir(stageTemp: string): string {
  const candidates = fs
    .readdirSync(stageTemp, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("t3code-desktop-win-stage-"))
    .map((entry) => path.join(stageTemp, entry.name));
  check(candidates.length === 1, `${stageTemp} 下应恰有一个 t3code-desktop-win-stage-*：${candidates.length} 个`);
  return candidates[0]!;
}

if (isMainModule(import.meta.url)) {
  await main("package-windows", async () => {
    const { values } = parseArgs(process.argv.slice(2), { values: ["src", "version", "wsl-runtime", "out", "evidence", "stage-temp"] });
    check(process.platform === "win32", "package-windows.ts 只在 Windows 上运行");
    const src = path.resolve(requireValue(values, "src"));
    const version = validateVersion(requireValue(values, "version"));
    const wslRuntime = path.resolve(requireValue(values, "wsl-runtime"));
    const out = path.resolve(requireValue(values, "out"));
    const evidenceDir = path.resolve(requireValue(values, "evidence"));
    const stageTemp = path.resolve(values.get("stage-temp") ?? path.join(process.env.RUNNER_TEMP ?? path.dirname(out), "t3zh-stage-temp"));
    const constants = readBuildZhConstants(path.join(ZH_ROOT, "scripts/build-zh.sh"));
    const productName = JSON.parse(fs.readFileSync(path.join(src, "apps/desktop/package.json"), "utf8")).productName;
    check(typeof productName === "string" && productName && !productName.includes("Nightly"), `apps/desktop/package.json 的 productName 异常：${productName}`);

    // js-bundle（bundle job 产物）和 WSL runtime（linux_cli job 产物）都必须在位。
    for (const rel of ["apps/server/dist/bin.mjs", "apps/server/dist/client/index.html", "apps/desktop/dist-electron/main.cjs"]) {
      check(fs.existsSync(path.join(src, rel)), `缺少 js-bundle 文件 ${rel}`);
    }
    check(path.basename(wslRuntime) === `${cliArchiveStem(version)}.tar.gz`, `WSL runtime 文件名应为 ${cliArchiveStem(version)}.tar.gz`);
    check(fs.existsSync(wslRuntime), `找不到 WSL runtime：${wslRuntime}`);
    const wslSha256 = sha256File(wslRuntime);

    for (const dir of [out, stageTemp]) {
      fs.rmSync(dir, { recursive: true, force: true });
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.mkdirSync(evidenceDir, { recursive: true });

    const env = sanitizedPackagingEnv(process.env);
    // staging 建在 os.tmpdir()；指到专用空目录，便于 --keep-stage 后定位，且上方没有 node_modules
    // （上游的自包含检查要求 staging 的祖先目录里没有 node_modules）。
    env.TEMP = stageTemp;
    env.TMP = stageTemp;
    env.T3CODE_DESKTOP_REUSE_RESOURCE_MONITOR = "false";
    run(
      process.execPath,
      [
        "scripts/build-desktop-artifact.ts",
        "--platform", "win",
        "--target", "nsis",
        "--arch", ARCH,
        "--build-version", version,
        "--output-dir", out,
        "--wsl-runtime", wslRuntime,
        "--skip-build",
        "--keep-stage",
        "--verbose",
      ],
      { cwd: src, env },
    );

    const stageApp = path.join(findStageDir(stageTemp), "app");
    const stagePackage = JSON.parse(fs.readFileSync(path.join(stageApp, "package.json"), "utf8"));
    const configProblems = checkStageBuildConfig(stagePackage, { version, productName });
    check(configProblems.length === 0, `electron-builder 配置不符：\n${configProblems.join("\n")}`);
    log("electron-builder 配置：无 publish、zh-CN.pak、单语中文 NSIS（2052）、未签名");

    const unpacked = path.join(stageApp, "dist/win-unpacked");
    check(fs.existsSync(unpacked), `找不到 ${unpacked}`);
    const files = listFiles(unpacked);
    const unpackedProblems = checkUnpackedFiles(files, productName, constants.appLicenseName);
    check(unpackedProblems.length === 0, `win-unpacked 内容不符：\n${unpackedProblems.join("\n")}`);
    const resources = path.join(unpacked, "resources");
    check(
      fs.readFileSync(path.join(resources, constants.appLicenseName)).equals(fs.readFileSync(path.join(src, "LICENSE"))),
      `${constants.appLicenseName} 与基线 LICENSE 不一致`,
    );
    const recordedWsl = fs.readFileSync(path.join(resources, "wsl-runtime.tar.gz.sha256"), "utf8").trim().toLowerCase();
    check(recordedWsl === wslSha256, `包内 wsl-runtime.tar.gz.sha256 (${recordedWsl}) 与输入归档 (${wslSha256}) 不一致`);
    check(sha256File(path.join(resources, "wsl-runtime.tar.gz")) === wslSha256, "包内 wsl-runtime.tar.gz 与输入归档字节不同");
    const asarHits = checkAsarContents(await loadAsar(), resources, version, constants);
    log(`win-unpacked 内容核对通过（${files.length} 个文件，上限 ${PAYLOAD_FILE_LIMIT}）`);

    const entries = fs.readdirSync(out).sort();
    const outputProblems = checkOutputEntries(entries, version);
    check(outputProblems.length === 0, `输出目录不符：\n${outputProblems.join("\n")}`);
    const extras = extraOutputEntries(entries, version);
    if (extras.length > 0) log(`提示：输出目录另有 ${extras.join(", ")}（不上传）`);
    const exe = path.join(out, installerName(version));
    const exeSha256 = sha256File(exe);
    fs.writeFileSync(path.join(out, "SHA256SUMS.txt"), `${exeSha256}  ${installerName(version)}\n`);

    for (const name of ["builder-effective-config.yaml", "builder-debug.yml"]) {
      if (fs.existsSync(path.join(out, name))) fs.copyFileSync(path.join(out, name), path.join(evidenceDir, name));
    }
    writeJson(path.join(evidenceDir, "stage-build-config.json"), stagePackage.build);
    writeJson(path.join(evidenceDir, "win-unpacked-files.json"), files);
    writeJson(path.join(evidenceDir, "package-windows.json"), {
      version,
      productName,
      installer: { name: installerName(version), bytes: fs.statSync(exe).size, sha256: exeSha256 },
      signed: false,
      wslRuntime: { name: path.basename(wslRuntime), sha256: wslSha256 },
      payloadFileCount: files.length,
      payloadFileLimit: PAYLOAD_FILE_LIMIT,
      locales: files.filter((rel) => rel.startsWith("locales/")),
      ...asarHits,
      outputEntries: entries,
    });
    log(`安装包：${exe}`);
    log(`SHA-256：${exeSha256}`);
  });
}
