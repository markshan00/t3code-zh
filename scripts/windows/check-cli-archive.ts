/**
 * 核对 WSL 用的 Linux CLI 归档确实是本次汉化版（T21-W，CI 的 linux_cli job 在上游 smoke-cli-archive.ts 之后运行）。
 *
 * 用法：
 *   node scripts/windows/check-cli-archive.ts --archive <t3-<版本>-linux-x64.tar.gz> --version <版本> --src <源码目录>
 *       [--evidence <json>]
 *
 * 检查：文件名与单一顶层目录 t3-<版本>-linux-x64（Windows 打包时上游 validateWindowsPackagedPayload 也按此校验）；
 * 有 t3、client/index.html、node_modules 和 node-pty；client 里有固定中文（build-zh.sh 的 GUARD_TEXT）与交付版本；
 * t3 单文件里有 T3 Connect 公开标识（与 scripts/lib/t3-connect-config.ts 对 server 产物的要求相同）。
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { readBuildZhConstants } from "./lib/build-zh-constants.ts";
import {
  check,
  isMainModule,
  listFiles,
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

export function cliArchiveStem(version: string, arch: "x64" | "arm64" = "x64"): string {
  return `t3-${version}-linux-${arch}`;
}

/** tar -tzf 的输出 → 规范化成员名（去掉 ./ 前缀和目录结尾的 /）。 */
export function normalizeTarMembers(listing: string): string[] {
  return listing
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/^\.\//, "").replace(/\/+$/, ""))
    .filter(Boolean);
}

export function checkCliArchiveMembers(members: ReadonlyArray<string>, version: string): string[] {
  const stem = cliArchiveStem(version);
  const problems: string[] = [];
  const topLevel = new Set(members.map((member) => member.split("/")[0]));
  if (topLevel.size !== 1 || !topLevel.has(stem)) problems.push(`顶层目录应只有 ${stem}，实际 ${[...topLevel].join(", ") || "（空）"}`);
  for (const required of [`${stem}/t3`, `${stem}/client/index.html`, `${stem}/node_modules`]) {
    if (!members.includes(required)) problems.push(`缺少 ${required}`);
  }
  const pty = [`${stem}/node_modules/node-pty/build/Release/pty.node`, `${stem}/node_modules/node-pty/prebuilds/linux-x64/pty.node`];
  if (!pty.some((member) => members.includes(member))) problems.push("缺少 node-pty 的 pty.node");
  const bundle = members.find((member) => member.endsWith("/bin.mjs"));
  if (bundle) problems.push(`归档里不应有 server bundle 入口 ${bundle}`);
  return problems;
}

if (isMainModule(import.meta.url)) {
  await main("check-cli-archive", async () => {
    const { values } = parseArgs(process.argv.slice(2), { values: ["archive", "version", "src", "evidence"] });
    const archive = path.resolve(requireValue(values, "archive"));
    const version = validateVersion(requireValue(values, "version"));
    const src = path.resolve(requireValue(values, "src"));
    const constants = readBuildZhConstants(path.join(ZH_ROOT, "scripts/build-zh.sh"));
    const stem = cliArchiveStem(version);
    check(path.basename(archive) === `${stem}.tar.gz`, `归档文件名应为 ${stem}.tar.gz：${path.basename(archive)}`);

    const members = normalizeTarMembers(run("tar", ["-tzf", archive], { capture: true }).stdout);
    const problems = checkCliArchiveMembers(members, version);
    check(problems.length === 0, `CLI 归档结构不对：\n${problems.join("\n")}`);

    const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "t3zh-cli-check-"));
    try {
      run("tar", ["-xzf", archive, "-C", scratch, `${stem}/t3`, `${stem}/client`]);
      const client = path.join(scratch, stem, "client");
      const assets = listFiles(client).filter((rel) => rel.endsWith(".js"));
      const read = (rel: string) => fs.readFileSync(path.join(client, rel), "utf8");
      const guardHit = assets.find((rel) => read(rel).includes(constants.guardText));
      check(guardHit, `CLI 归档 client 里找不到固定中文「${constants.guardText}」`);
      check(assets.some((rel) => read(rel).includes(version)), `CLI 归档 client 里找不到交付版本 ${version}`);
      log(`CLI 归档 client 含「${constants.guardText}」（${guardHit}）与版本 ${version}`);

      const { readT3ConnectConfig } = await import(pathToFileURL(path.join(ZH_ROOT, "scripts/lib/t3-connect-config.ts")).href);
      const connect = readT3ConnectConfig(path.join(src, ".env.example")) as Record<string, string>;
      const binary = fs.readFileSync(path.join(scratch, stem, "t3")).toString("latin1");
      for (const key of ["T3CODE_CLERK_PUBLISHABLE_KEY", "T3CODE_CLERK_CLI_OAUTH_CLIENT_ID", "T3CODE_RELAY_URL"]) {
        check(binary.includes(connect[key]!), `t3 单文件里没有 T3 Connect 公开标识 ${key}`);
      }
      log("t3 单文件含 T3 Connect 公开标识");
    } finally {
      fs.rmSync(scratch, { recursive: true, force: true });
    }

    const evidence = values.get("evidence");
    if (evidence) {
      writeJson(path.resolve(evidence), {
        archive: path.basename(archive),
        sha256: sha256File(archive),
        bytes: fs.statSync(archive).size,
        members: members.length,
      });
    }
    log(`CLI 归档核对通过：${path.basename(archive)}`);
  });
}
