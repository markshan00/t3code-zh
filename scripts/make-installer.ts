#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { ROOT, parseArgs, validateVersion, prepareOut, privatePatterns, redact, runCommand,
  writeJson, shaFile, withMount, findApp, MountCleanupError } from "./lib/iteration-tooling.ts";

const privacy = privatePatterns();
let out: string | undefined;
let ready = false;
const started = performance.now();
const steps: object[] = [];
try {
  const { options, positional } = parseArgs(process.argv.slice(2), ["out"]);
  assert.equal(positional.length, 1, "用法：node scripts/make-installer.ts <版本> [--out <目录>]");
  const version = positional[0];
  validateVersion(version);
  const release = path.join(ROOT, "release", version);
  const zips = fs.readdirSync(release).filter((file) => file.includes(version) && file.endsWith(".zip"));
  assert.equal(zips.length, 1, "release/<版本> 必须恰有一个对应版本的 ZIP");
  const zip = path.join(release, zips[0]!);
  const dmgName = zips[0]!.replace(/\.zip$/, ".dmg");
  const sourceDmg = path.join(release, dmgName);
  assert.ok(fs.statSync(sourceDmg).isFile(), "缺少与 ZIP 对应的原始 DMG");
  out = path.resolve(options.out ?? path.join(release, "installer"));
  prepareOut(out);
  ready = true;
  const targetDmg = path.join(out, dmgName);
  const command = async (name: string, binary: string, args: string[], cwd?: string) => {
    const { output, ...row } = await runCommand(binary, args, path.join(out!, `${name}.log`), privacy.patterns, { cwd });
    steps.push({ name, ...row });
    return output;
  };
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "t3zh-installer-"));
  let cleanup = true;
  let asarBefore = "", asarAfter = "", asarMounted = "";
  try {
    const unpack = path.join(temporary, "app");
    fs.mkdirSync(unpack);
    await command("unzip", "ditto", ["-x", "-k", zip, unpack]);
    const app = findApp(unpack);
    assert.ok(fs.readFileSync(path.join(app, "Contents/Resources/T3-Code-LICENSE.txt"))
      .equals(fs.readFileSync(path.join(ROOT, "upstream/LICENSE"))), "App 许可证与基线不同");
    const asar = path.join(app, "Contents/Resources/app.asar");
    asarBefore = await shaFile(asar);
    await command("sign", "codesign", ["--force", "--deep", "--sign", "-", app]);
    await command("signature", "codesign", ["--verify", "--deep", "--strict", "--verbose=2", app]);
    asarAfter = await shaFile(asar);
    assert.equal(asarAfter, asarBefore, "重新签名改变了 app.asar");
    const writable = path.join(temporary, "writable.dmg");
    await command("convert-writable", "hdiutil", ["convert", sourceDmg, "-format", "UDRW", "-o", writable]);
    await command("resize", "hdiutil", ["resize", "-size", "1g", writable]);
    await withMount(writable, path.join(temporary, "mount"), false, out, privacy.patterns, async (mount) => {
      const oldApp = findApp(mount);
      assert.equal(path.basename(oldApp), path.basename(app), "ZIP 与 DMG 的 App 名称不同");
      fs.rmSync(oldApp, { recursive: true });
      const mountedApp = path.join(mount, path.basename(app));
      await command("replace-app", "ditto", [app, mountedApp]);
      await command("mounted-signature", "codesign", ["--verify", "--deep", "--strict", "--verbose=2", mountedApp]);
      asarMounted = await shaFile(path.join(mountedApp, "Contents/Resources/app.asar"));
      assert.equal(asarMounted, asarBefore, "卷内 app.asar 不同");
    });
    await command("convert-installer", "hdiutil", ["convert", writable, "-format", "UDZO", "-o", targetDmg]);
  } catch (error) {
    if (error instanceof MountCleanupError) cleanup = false;
    throw error;
  } finally {
    if (cleanup) fs.rmSync(temporary, { recursive: true, force: true });
  }
  const digest = await shaFile(targetDmg);
  fs.writeFileSync(path.join(out, "SHA256.txt"), `${digest}  ${dmgName}\n`);
  await command("sha256-check", "shasum", ["-a", "256", "-c", "SHA256.txt"], out);
  await command("dmg-verify", "hdiutil", ["verify", targetDmg]);
  const report = { passed: true, version, dmg: targetDmg, bytes: fs.statSync(targetDmg).size, sha256: digest,
    app_asar_sha256: asarBefore, asar_signing: { before: asarBefore, after: asarAfter, mounted: asarMounted, unchanged: true },
    seconds: Number(((performance.now() - started) / 1000).toFixed(3)), steps };
  writeJson(path.join(out, "installer.json"), report, privacy.patterns);
  console.log(redact(`安装包：通过；${targetDmg}`, privacy.patterns));
  console.log(`DMG：${report.bytes} 字节；SHA-256 ${digest}`);
  console.log(`app.asar：${asarBefore}；签名前后与卷内一致`);
} catch (error) {
  if (out && ready) writeJson(path.join(out, "installer.json"),
    { passed: false, error: String(error), steps, seconds: Number(((performance.now() - started) / 1000).toFixed(3)) }, privacy.patterns);
  console.error(redact(`安装包：失败；${String(error)}`, privacy.patterns));
  process.exitCode = 1;
}
