#!/usr/bin/env node
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { listPackage, statFile, extractFile } from "@electron/asar";
import { ROOT, parseArgs, validateVersion, prepareOut, privatePatterns, redact, runCommand, writeJson,
  sha256, shaFile, walkFiles, auditOutputs, withMount, findApp, assertSafePath, MountCleanupError } from "./lib/iteration-tooling.ts";
import { USERS_ALLOWLIST, CHECKPOINT_SOURCE } from "./lib/release-hygiene-allowlist.ts";
import { offsets, allowlistMatch, classifyUsers, readBaselineExtendInfo, checkpointIdentities,
  isCheckpointOccurrence, parsePlist } from "./lib/release-hygiene.ts";

const privacy = privatePatterns();
let out: string | undefined;
let ready = false;
const started = performance.now();
const report: any = { passed: false, checks: [], patterns: {}, users_files: [], manual_review: [], baseline_source_proofs: [] };

try {
  const { options, positional } = parseArgs(process.argv.slice(2), ["version", "out", "baseline", "build-src"]);
  assert.equal(positional.length, 1, "用法：node scripts/release-hygiene.ts <dmg> --version <版本> --out <目录> [--baseline <commit>] [--build-src <目录>]");
  validateVersion(options.version);
  assert.ok(options.out, "必须指定 --out");
  const dmg = path.resolve(positional[0]!);
  assertSafePath(dmg);
  assert.ok(fs.statSync(dmg).isFile(), "DMG 必须是常规文件");
  out = path.resolve(options.out);
  prepareOut(out);
  ready = true;
  const buildSrc = path.resolve(options["build-src"] ?? path.join(ROOT, ".build/src"));
  assertSafePath(buildSrc);
  const upstreamRepo = path.join(path.dirname(ROOT), "t3code");
  const baseline = options.baseline ?? fs.readFileSync(path.join(ROOT, "scripts/build-zh.sh"), "utf8")
    .match(/^BASELINE_COMMIT="([0-9a-f]+)"/m)?.[1];
  assert.ok(baseline && /^[0-9a-f]{7,40}$/.test(baseline), "无法读取基线 commit，或 --baseline 不是 commit hash");
  Object.assign(report, { dmg, version: options.version, baseline, build_src: buildSrc,
    git_user_email: { configured: privacy.emailConfigured, scan_performed: privacy.emailConfigured,
      status: privacy.emailConfigured ? "已配置、已扫描" : "未配置、未扫描" } });
  const command = async (name: string, binary: string, args: string[], allowFailure = false) =>
    runCommand(binary, args, path.join(out!, `${name}.log`), privacy.patterns, { allowFailure });
  const check = (name: string, passed: boolean, evidence: unknown) => report.checks.push({ name, passed, evidence });
  const sourceCache = new Map<string, string>();
  // 固定身份先在内存解析，再写过滤后的来源日志，历史中没有该身份时也不会泄漏。
  const checkpointResult = spawnSync("git", ["-C", upstreamRepo, "show", `${baseline}:${CHECKPOINT_SOURCE}`], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  assert.equal(checkpointResult.status, 0, "无法读取基线检查点身份源码");
  const identities = checkpointIdentities(checkpointResult.stdout);
  for (const [i, identity] of identities.entries()) if (!privacy.patterns.some((p) => p.value === identity.value)) {
    privacy.patterns.push({ label: `upstream_checkpoint_email_${i + 1}`, value: identity.value });
  }
  sourceCache.set(CHECKPOINT_SOURCE, checkpointResult.stdout);
  fs.writeFileSync(path.join(out, "baseline-checkpoint.log"), redact(checkpointResult.stdout, privacy.patterns));
  const source = async (file: string) => {
    if (!sourceCache.has(file)) {
      const result = await command(`baseline-${path.basename(file)}`, "git", ["-C", upstreamRepo, "show", `${baseline}:${file}`]);
      sourceCache.set(file, result.output);
    }
    return sourceCache.get(file)!;
  };
  // 主会话决定：通用写法 + 指定基线实际源码，是 ASAR 放行的两项主要证据。
  const verifiedRules = new Set<string>();
  for (const rule of USERS_ALLOWLIST) {
    const code = await source(rule.source);
    const lines = code.split("\n").flatMap((text, i) => text.includes(rule.sourceText) ? [{ line: i + 1, text: text.trim() }] : []);
    if (lines.length) verifiedRules.add(rule.id);
    report.baseline_source_proofs.push({ id: rule.id, file: rule.source, sha256: sha256(Buffer.from(code)), verified: !!lines.length, lines });
  }
  report.checkpoint_source = { file: CHECKPOINT_SOURCE, sha256: sha256(Buffer.from(sourceCache.get(CHECKPOINT_SOURCE)!)),
    identities: identities.map(({ keys, lines }) => ({ keys, lines })) };
  const patterns = [...privacy.patterns, { label: "users_prefix", value: "/Users/" }];
  for (const p of patterns) report.patterns[p.label] = { matching_files: [], path_hits: [], symlink_hits: [], occurrences: 0 };
  const extendInfo = await readBaselineExtendInfo(source);
  const extendKeys = extendInfo.expected;
  const baselineLicense = (await command("baseline-license", "git", ["-C", upstreamRepo, "show", `${baseline}:LICENSE`])).output;
  await command("dmg-verify", "hdiutil", ["verify", dmg]);
  check("dmg-integrity", true, { sha256: await shaFile(dmg), bytes: fs.statSync(dmg).size });
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "t3zh-hygiene-"));
  let cleanup = true;
  try {
    await withMount(dmg, path.join(temporary, "mount"), true, out, privacy.patterns, async (mount) => {
      const app = findApp(mount);
      const asar = path.join(app, "Contents/Resources/app.asar");
      const asarRel = path.relative(mount, asar);
      report.app_asar_sha256 = await shaFile(asar);
      const signature = await command("signature", "codesign", ["--verify", "--deep", "--strict", "--verbose=2", app], true);
      check("strict-signature", signature.exit_code === 0, { log: signature.log });
      const plist = async (name: string, file: string) => parsePlist((await command(name, "plutil", ["-convert", "xml1", "-o", "-", file])).output);
      const info = await plist("info-plist", path.join(app, "Contents/Info.plist"));
      const seal = await plist("code-resources", path.join(app, "Contents/_CodeSignature/CodeResources"));
      const license = fs.readFileSync(path.join(app, "Contents/Resources/T3-Code-LICENSE.txt"));
      check("license-matches-baseline", license.equals(Buffer.from(baselineLicense)), { sha256: sha256(license) });
      const hash2 = seal.files2?.["Resources/T3-Code-LICENSE.txt"]?.hash2;
      check("license-signature-hash2", Buffer.isBuffer(hash2) && hash2.toString("hex") === sha256(license), { sealed: Buffer.isBuffer(hash2) });
      check("bundle-version", info.CFBundleVersion === options.version && info.CFBundleShortVersionString === options.version,
        { version: info.CFBundleVersion, short_version: info.CFBundleShortVersionString });
      check("localizations", Array.isArray(info.CFBundleLocalizations) && info.CFBundleLocalizations.includes("zh-Hans"), info.CFBundleLocalizations ?? []);
      const schemes = new Set((info.CFBundleURLTypes ?? []).flatMap((row: any) => row.CFBundleURLSchemes ?? []));
      check("url-types", ["t3code", "t3code-dev", "http", "https"].every((value) => schemes.has(value)), [...schemes]);
      const documentTypes = new Set((info.CFBundleDocumentTypes ?? []).flatMap((row: any) => row.LSItemContentTypes ?? []));
      check("document-types", ["public.html", "public.xhtml"].every((value) => documentTypes.has(value)), [...documentTypes]);
      check("extend-info-keys", extendKeys.every((key) => Object.hasOwn(info, key)),
        { ...extendInfo, baseline, missing: extendKeys.filter((key) => !Object.hasOwn(info, key)) });
      // codesign 将诊断写到 stderr；使用 -o 指定私有临时文件，避免把混合输出误当 XML。
      const entitlementsFile = path.join(temporary, "entitlements.plist");
      await command("entitlements", "codesign", ["-d", "--entitlements", entitlementsFile, app]);
      const entitlements = fs.existsSync(entitlementsFile) && fs.statSync(entitlementsFile).size
        ? await plist("entitlements-plist", entitlementsFile) : {};
      const prohibited = ["keychain-access-groups", "com.apple.developer.web-browser.public-key-credential"];
      check("entitlements", prohibited.every((key) => !Object.hasOwn(entitlements, key)), { keys: Object.keys(entitlements) });
      const electronInfo = await plist("electron-info", path.join(app, "Contents/Frameworks/Electron Framework.framework/Resources/Info.plist"));
      report.electron_version = electronInfo.CFBundleVersion;
      const files = walkFiles(mount);
      report.files_scanned = files.files.length;
      report.bytes_scanned_per_pattern = 0;
      report.symlinks = files.links.map(({ file, target }) => ({ file: path.relative(mount, file), target }));
      for (const file of files.paths) for (const p of patterns) {
        const rel = path.relative(mount, file);
        if (rel.includes(p.value)) report.patterns[p.label].path_hits.push(rel);
      }
      for (const { file, target } of files.links) for (const p of patterns) {
        const rel = path.relative(mount, file);
        if (rel.includes(p.value) || target.includes(p.value)) report.patterns[p.label].symlink_hits.push({ file: rel, target });
      }
      const contentOffsets = new Map<string, Map<string, number[]>>();
      for (const file of files.files) {
        const data = fs.readFileSync(file), rel = path.relative(mount, file);
        report.bytes_scanned_per_pattern += data.length;
        for (const p of patterns) {
          const positions = offsets(data, Buffer.from(p.value));
          if (!positions.length) continue;
          report.patterns[p.label].matching_files.push({ file: rel, count: positions.length, offsets: positions });
          report.patterns[p.label].occurrences += positions.length;
          if (!contentOffsets.has(p.label)) contentOffsets.set(p.label, new Map());
          contentOffsets.get(p.label)!.set(rel, positions);
        }
      }
      // 独立 grep 复核每个检索值；分批限制 argv 长度，同时覆盖每个常规文件。
      for (const p of patterns) {
        const actual = new Set<string>();
        for (let i = 0; i < files.files.length; i += 100) {
          const result = await runCommand("grep", ["-aFl", "--", p.value, ...files.files.slice(i, i + 100)],
            path.join(out!, `grep-${p.label}-${i / 100}.log`), privacy.patterns, { allowFailure: true, env: { ...process.env, LC_ALL: "C" } });
          assert.ok([0, 1].includes(result.exit_code), `grep 复核失败；日志 ${result.log}`);
          for (const file of result.output.trim().split("\n").filter(Boolean)) actual.add(path.relative(mount, file));
        }
        const expected = report.patterns[p.label].matching_files.map((row: any) => row.file).sort();
        check(`grep-${p.label}`, JSON.stringify([...actual].sort()) === JSON.stringify(expected), { files: actual.size });
      }
      const packed = listPackage(asar).map((entry) => entry.replace(/^\//, "")).filter((entry) => {
        const stat = statFile(asar, entry, false) as any;
        return !stat.files && !stat.link && !stat.unpacked;
      });
      const asarEntries: any[] = [];
      const checkpointHits: any[] = [];
      for (const entry of packed) {
        const data = extractFile(asar, entry);
        const positions = offsets(data, Buffer.from("/Users/"));
        if (positions.length) {
          const buildFile = path.join(buildSrc, entry);
          const safeEntry = entry.startsWith("apps/") && !entry.split("/").includes("..");
          const exists = safeEntry && fs.existsSync(buildFile) && fs.lstatSync(buildFile).isFile();
          const row = { entry, sha256: sha256(data), build_src_exists: !!exists,
            matches_build_src: !!exists && fs.readFileSync(buildFile).equals(data),
            occurrences: positions.map((offset) => {
              const rule = allowlistMatch(data, offset);
              return { offset, context: data.subarray(Math.max(0, offset - 96), offset + 180).toString("utf8"),
                rule: rule?.id ?? null, source: rule?.source ?? null,
                source_verified: !!rule && verifiedRules.has(rule.id) };
            }) };
          asarEntries.push(row);
        }
        for (const identity of identities) for (const offset of offsets(data, Buffer.from(identity.value))) {
          checkpointHits.push({ entry, offset, identity: identities.indexOf(identity),
            allowed: entry.startsWith("apps/server/dist/") && isCheckpointOccurrence(data, offset, identity.value) });
        }
      }
      report.asar_entries = asarEntries;
      report.checkpoint_hits = checkpointHits;
      const supplierIndex = new Map<string, string[]>();
      const pnpm = path.join(buildSrc, "node_modules/.pnpm");
      for (const file of walkFiles(pnpm).files) {
        const basename = path.basename(file);
        const matches = supplierIndex.get(basename) ?? [];
        matches.push(file);
        supplierIndex.set(basename, matches);
      }
      let originalElectron: Buffer | undefined;
      let originalElectronSource: string | undefined;
      const getOriginalElectron = async (installed: string) => {
        if (originalElectron) return originalElectron;
        const cache = path.join(os.homedir(), "Library/Caches/electron");
        if (!fs.existsSync(cache)) return;
        // 版本和架构取自当前卷及其二进制；不默认验证机器的架构。
        const archResult = await command("electron-arch", "lipo", ["-archs", installed]);
        const arch = archResult.output.trim() === "arm64" ? "arm64" : archResult.output.trim() === "x86_64" ? "x64" : undefined;
        if (!arch) return;
        const basename = `electron-v${report.electron_version}-darwin-${arch}.zip`;
        const candidates = walkFiles(cache).files.filter((file) => path.basename(file) === basename);
        const member = "Electron.app/Contents/Frameworks/Electron Framework.framework/Versions/A/Electron Framework";
        for (const [i, zip] of candidates.entries()) {
          const target = path.join(temporary, "original-electron");
          const fd = fs.openSync(target, "w");
          const result = await new Promise<{ exit: number; diagnostic: string }>((resolve) => {
            const child = spawn("unzip", ["-p", zip, member], { stdio: ["ignore", fd, "pipe"] });
            let diagnostic = "";
            child.stderr.on("data", (chunk) => { diagnostic += chunk.toString(); });
            child.on("error", (error) => { diagnostic += String(error); });
            child.on("close", (exit) => resolve({ exit: exit ?? 1, diagnostic }));
          });
          fs.closeSync(fd);
          fs.writeFileSync(path.join(out!, `electron-unzip-${i}.log`), redact(`exit=${result.exit}\n${result.diagnostic}`, privacy.patterns));
          if (result.exit === 0) {
            originalElectron = fs.readFileSync(target);
            originalElectronSource = zip + ":" + member;
            return originalElectron;
          }
        }
      };
      const userHits = contentOffsets.get("users_prefix") ?? new Map();
      for (const [rel, positions] of userHits) {
        const file = path.join(mount, rel), data = fs.readFileSync(file);
        const row: any = { file: rel, sha256: sha256(data), occurrences: positions.map((offset) => ({ offset,
          context: data.subarray(Math.max(0, offset - 96), offset + 180).toString("utf8") })) };
        if (rel === asarRel) {
          const accounted = asarEntries.reduce((sum, entry) => sum + entry.occurrences.length, 0) === positions.length;
          row.evidence = { kind: "asar", accounted,
            contextsAllowed: asarEntries.every((entry) => entry.occurrences.every((hit: any) => !!hit.rule)),
            sourcesVerified: asarEntries.every((entry) => entry.occurrences.every((hit: any) => hit.source_verified)) };
          row.entries = asarEntries;
        } else if (file === path.join(app, "Contents/Frameworks/Electron Framework.framework/Versions/A/Electron Framework")) {
          const original = await getOriginalElectron(file);
          const contexts = positions.map((offset) => ({ offset, matches: !!original && original.includes(data.subarray(Math.max(0, offset - 96), offset + 96)) }));
          row.evidence = { kind: "electron", electronContextsMatch: contexts.every((hit) => hit.matches), contexts,
            source: originalElectronSource, original_sha256: original ? sha256(original) : null,
            byte_identical: !!original && original.equals(data) };
        } else {
          let supplier: string | undefined;
          for (const candidate of supplierIndex.get(path.basename(file)) ?? []) {
            if (fs.statSync(candidate).size === data.length && fs.readFileSync(candidate).equals(data)) { supplier = candidate; break; }
          }
          row.evidence = { kind: "supplier", supplierIdentical: !!supplier, source: supplier ?? null,
            source_sha256: supplier ? await shaFile(supplier) : null };
        }
        row.classification = classifyUsers(row.evidence);
        report.users_files.push(row);
        if (row.classification === "需人工审查") report.manual_review.push({ file: rel, reason: "无法满足已登记的来源与上下文证据", evidence: row.evidence });
      }
      for (const p of patterns) {
        const hits = report.patterns[p.label];
        for (const file of hits.path_hits) report.manual_review.push({ file, label: p.label, reason: "路径命中" });
        for (const link of hits.symlink_hits) report.manual_review.push({ file: link.file, label: p.label, reason: "符号链接命中" });
        if (p.label === "users_prefix") continue;
        const identity = identities.findIndex((row) => row.value === p.value);
        for (const hit of hits.matching_files) {
          const evidence = checkpointHits.filter((row) => row.identity === identity);
          const allowed = identity >= 0 && !["HOME", "hostname_short", "git_user_email"].includes(p.label) &&
            hit.file === asarRel && evidence.length === hit.count && evidence.every((row) => row.allowed);
          hit.classification = allowed ? "上游固定检查点身份" : "个人信息命中";
          if (!allowed) report.manual_review.push({ file: hit.file, label: p.label, reason: "个人信息内容命中", count: hit.count });
        }
      }
      check("users-classification", report.users_files.every((row: any) => row.classification !== "需人工审查"), { files: report.users_files.length });
      check("personal-information", report.manual_review.length === 0, { manual_review: report.manual_review.length });
    });
  } catch (error) {
    if (error instanceof MountCleanupError) cleanup = false;
    throw error;
  } finally {
    if (cleanup) fs.rmSync(temporary, { recursive: true, force: true });
  }
} catch (error) {
  report.error = String(error);
}

if (out && ready) {
  const finish = () => {
    report.passed = !report.error && report.checks.length > 0 && report.checks.every((row: any) => row.passed) && report.manual_review.length === 0;
    report.seconds = Number(((performance.now() - started) / 1000).toFixed(3));
    writeJson(path.join(out!, "hygiene.json"), report, privacy.patterns);
    const lines = ["# 发布卫生检查", "", `结论：${report.passed ? "通过" : "失败"}；版本 ${report.version ?? "未读取"}。`, "",
      `常规文件 ${report.files_scanned ?? "未扫描"}；${report.bytes_scanned_per_pattern ?? "未扫描"} 字节 / 检索值。`,
      `Git user.email：${report.git_user_email?.status ?? "未读取"}。`, "", "| 检索标签 | 内容文件 | 内容次数 | 路径 | 链接 |", "|---|---:|---:|---:|---:|"];
    for (const [label, hits] of Object.entries(report.patterns) as [string, any][]) lines.push(`| ${label} | ${hits.matching_files.length} | ${hits.occurrences} | ${hits.path_hits.length} | ${hits.symlink_hits.length} |`);
    lines.push("", "| 分类 | 文件数 | 次数 |", "|---|---:|---:|");
    for (const category of ["上游通用写法", "供应商预编译文件", "Electron 原包上下文", "需人工审查"]) {
      const rows = report.users_files.filter((row: any) => row.classification === category);
      lines.push(`| ${category} | ${rows.length} | ${rows.reduce((sum: number, row: any) => sum + row.occurrences.length, 0)} |`);
    }
    lines.push("", `需人工审查：${report.manual_review.length}。`, "");
    for (const row of report.manual_review) lines.push(`- ${row.file}：${row.reason}（${row.label ?? "users_prefix"}）`);
    for (const row of report.checks) if (!row.passed) lines.push(`- 失败检查：${row.name}`);
    if (report.error) lines.push(`- 错误：${report.error}`);
    lines.push("", "extendInfo 预期键读取指定基线源码；zh-Hans 单独检查。", "ASAR 主要证据为通用写法与指定基线源码；matches_build_src 只记补充字节比对。", "完整偏移、上下文、来源摘要、检查结果与耗时见 hygiene.json；外部命令见同目录日志。", "");
    fs.writeFileSync(path.join(out!, "hygiene.md"), redact(lines.join("\n"), privacy.patterns));
  };
  finish();
  // 收尾检查全部输出，包括失败日志、JSON 和 Markdown；仅记录标签与命中数。
  report.output_audit = auditOutputs(out, privacy.patterns);
  if (!report.output_audit.passed) report.error = "输出文件含未过滤的个人信息";
  finish();
  const finalAudit = auditOutputs(out, privacy.patterns);
  if (!finalAudit.passed) { report.passed = false; process.exitCode = 1; }
  for (const check of report.checks.filter((row: any) => !row.name.startsWith("grep-"))) console.log(`${check.name}：${check.passed ? "通过" : "失败"}`);
  console.log(`整卷：${report.files_scanned ?? "未扫描"} 文件；/Users/ ${report.users_files.length} 文件 / ${report.patterns.users_prefix?.occurrences ?? "未扫描"} 处`);
  console.log(`需人工审查：${report.manual_review.length}；输出过滤：${finalAudit.passed ? "通过" : "失败"}`);
  console.log(redact(`发布卫生：${report.passed ? "通过" : "失败"}；报告 ${path.join(out, "hygiene.json")}`, privacy.patterns));
  if (report.error) console.error(redact(report.error, privacy.patterns));
  process.exitCode = report.passed && finalAudit.passed ? 0 : 1;
} else {
  console.error(redact(`发布卫生：失败；${report.error ?? "参数错误"}`, privacy.patterns));
  process.exitCode = 1;
}
