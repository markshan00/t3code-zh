import assert from "node:assert/strict";
import { test } from "node:test";
import { offsets, allowlistMatch, classifyUsers, readExtendInfoKeys, readBaselineExtendInfo, checkpointIdentities,
  isCheckpointOccurrence, parsePlist } from "./release-hygiene.ts";
import { sha256 } from "./iteration-tooling.ts";

test("ASAR 每处匹配以真实偏移为锚，通用模板允许压缩变量名", () => {
  const cases = [
    ["* `/Users/<user>/.claude`, so two machines", "transcript-directory-comment"],
    ["return `/Users/${posixUser[1]}`;", "infer-posix-home"],
    ["if(t?.[1])return`/Users/${t[1]}`;", "infer-posix-home"],
    ['const roots = [\n"/Users/",\n"/home/",', "markdown-posix-roots"],
    ["const x=[`/Users/`,`/home/`,`/tmp/`];", "markdown-posix-roots"],
    ["const p=`/Users/unknown/private`;", undefined],
    ['const x="/Users/";', undefined],
    ["return `/Users/${user}`;", undefined],
  ] as const;
  for (const [text, rule] of cases) {
    const data = Buffer.from(text);
    assert.equal(allowlistMatch(data, data.indexOf("/Users/"))?.id, rule, text);
  }
  const data = Buffer.from('const roots=["/Users/","/home/"]; const bad="/Users/private/";');
  const positions = offsets(data, Buffer.from("/Users/"));
  assert.equal(allowlistMatch(data, positions[0]!)?.id, "markdown-posix-roots");
  assert.equal(allowlistMatch(data, positions[1]!), undefined);
  assert.throws(() => offsets(data, Buffer.alloc(0)));
});

test("放行必须有双重 ASAR 主要证据，不依赖可选构建比对", () => {
  assert.equal(classifyUsers({ kind: "asar", contextsAllowed: true, sourcesVerified: true, accounted: true }), "上游通用写法");
  for (const missing of ["contextsAllowed", "sourcesVerified", "accounted"] as const) {
    assert.equal(classifyUsers({ kind: "asar", contextsAllowed: true, sourcesVerified: true, accounted: true, [missing]: false }), "需人工审查");
  }
  assert.equal(classifyUsers({ kind: "supplier", supplierIdentical: true }), "供应商预编译文件");
  assert.equal(classifyUsers({ kind: "supplier", supplierIdentical: false }), "需人工审查");
  assert.equal(classifyUsers({ kind: "electron", electronContextsMatch: true }), "Electron 原包上下文");
  assert.equal(classifyUsers({ kind: "electron", electronContextsMatch: false }), "需人工审查");
  assert.equal(classifyUsers({ kind: "other" }), "需人工审查");
});

test("extendInfo 使用 AST 读取全部直接键，跳过注释、保留未知新键", () => {
  assert.deepEqual(readExtendInfoKeys('const config = { extendInfo: { NewUpstreamKey: "v", "Other": [], Nested: { Child: 1 } } };'),
    ["Nested", "NewUpstreamKey", "Other"]);
  for (const code of ["const x={};", "const x={extendInfo: dynamic};", "const x={extendInfo:{...other}};", "const x={extendInfo:{[key]:1}};"]) {
    assert.throws(() => readExtendInfoKeys(code));
  }
});

test("extendInfo 只使用指定基线的源码，旧基线不继承新基线键并记录源码摘要", async () => {
  const sources = {
    old: 'const config={extendInfo:{NSScreenCaptureUsageDescription:"screen",CFBundleDocumentTypes:[]}};',
    next: 'const config={extendInfo:{NSScreenCaptureUsageDescription:"screen",CFBundleDocumentTypes:[],NSLocalNetworkUsageDescription:"network",FutureUpstreamKey:true}};',
  };
  const packaged = { CFBundleDocumentTypes: [], NSScreenCaptureUsageDescription: "screen" };
  for (const baseline of ["old", "next"] as const) {
    const reads: string[] = [];
    const proof = await readBaselineExtendInfo(async (file) => {
      reads.push(file);
      return sources[baseline];
    });
    assert.deepEqual(reads, ["scripts/build-desktop-artifact.ts"]);
    assert.equal(proof.source, reads[0]);
    assert.equal(proof.sha256, sha256(Buffer.from(sources[baseline])));
    assert.deepEqual(proof.expected.filter((key) => !Object.hasOwn(packaged, key)),
      baseline === "old" ? [] : ["FutureUpstreamKey", "NSLocalNetworkUsageDescription"]);
    assert.equal(proof.expected.includes("CFBundleLocalizations"), false);
  }
});

test("基线源码读取或解析失败时 extendInfo 拒绝回退到构建树", async () => {
  await assert.rejects(readBaselineExtendInfo(async () => { throw new Error("git show failed"); }), /git show failed/);
  for (const code of ["const config={};", "const config={extendInfo:dynamic};", "const config={extendInfo:{...other}};"]) {
    await assert.rejects(readBaselineExtendInfo(async () => code));
  }
});

test("固定身份只从基线两个环境字段读取，普通邮箱出现不能放行", () => {
  const value = "checkpoint@example.invalid";
  const code = `const env={\n GIT_AUTHOR_EMAIL: "${value}",\n GIT_COMMITTER_EMAIL: "${value}"\n};`;
  assert.deepEqual(checkpointIdentities(code), [{ value, keys: ["GIT_AUTHOR_EMAIL", "GIT_COMMITTER_EMAIL"], lines: [2, 3] }]);
  const data = Buffer.from(code + ` const arbitrary="${value}";`);
  const positions = offsets(data, Buffer.from(value));
  assert.deepEqual(positions.map((offset) => isCheckpointOccurrence(data, offset, value)), [true, true, false]);
  assert.deepEqual(checkpointIdentities(`GIT_AUTHOR_EMAIL: "${value}"`), []);
});

test("plist data 保留字节以核对许可证封存，数组、实体与空字典正确读取", () => {
  const p = parsePlist('<?xml version="1.0"?><!DOCTYPE plist PUBLIC "fixture"><plist version="1.0"><dict><key>hash2</key><data>AQID</data><key>title</key><string>A &amp; B &#x4e2d;</string><key>list</key><array><true/><false/><integer>3</integer><dict/></array></dict></plist>');
  assert.ok(p.hash2.equals(Buffer.from([1, 2, 3])));
  assert.equal(p.title, "A & B 中");
  assert.deepEqual(p.list, [true, false, 3, {}]);
  assert.throws(() => parsePlist("<plist><dict><key>x</key></dict></plist>"));
});
