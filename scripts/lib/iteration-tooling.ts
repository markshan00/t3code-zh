import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export type PrivatePattern = { label: string; value: string };

// 原始值只留在内存。命令、日志、报告、错误和标准输出均使用相同的过滤器。
export function privatePatterns(): { patterns: PrivatePattern[]; emailConfigured: boolean } {
  const read = (command: string, args: string[], optional = false) => {
    const result = spawnSync(command, args, { cwd: ROOT, encoding: "utf8" });
    if (optional && result.status === 1) return "";
    assert.equal(result.status, 0, `${command} 读取失败`);
    return result.stdout.trim();
  };
  const email = read("git", ["config", "user.email"], true);
  const history = [...new Set(read("git", ["log", "--all", "--format=%ae%n%ce"]).split(/\r?\n/).filter(Boolean))].sort();
  const patterns = [
    { label: "HOME", value: process.env.HOME || os.homedir() },
    { label: "hostname_short", value: read("hostname", ["-s"]) },
    ...(email ? [{ label: "git_user_email", value: email }] : []),
    ...history.map((value, i) => ({ label: `git_history_email_${i + 1}`, value })),
  ];
  assert.ok(patterns.every((p) => p.value), "检索值不能为空");
  return { patterns, emailConfigured: !!email };
}

export function redact(text: string, patterns: PrivatePattern[]): string {
  for (const { label, value } of [...patterns].sort((a, b) => b.value.length - a.value.length)) {
    if (value) text = text.split(value).join(label === "HOME" ? "~" : `[${label}]`);
  }
  return text;
}

function redactObject(value: unknown, patterns: PrivatePattern[]): unknown {
  if (typeof value === "string") return redact(value, patterns);
  if (Array.isArray(value)) return value.map((item) => redactObject(item, patterns));
  if (value && typeof value === "object") return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [redact(key, patterns), redactObject(item, patterns)]),
  );
  return value;
}

export function writeJson(file: string, value: unknown, patterns: PrivatePattern[]) {
  fs.writeFileSync(file, JSON.stringify(redactObject(value, patterns), null, 2) + "\n");
}

export function parseArgs(argv: string[], allowed: string[]) {
  const options: Record<string, string> = {};
  const positional: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (!arg.startsWith("--")) { positional.push(arg); continue; }
    const [name, ...parts] = arg.slice(2).split("=");
    assert.ok(allowed.includes(name!), `未知参数 --${name}`);
    assert.ok(!(name! in options), `重复参数 --${name}`);
    const value = parts.length ? parts.join("=") : argv[++i];
    assert.ok(value && !value.startsWith("--"), `--${name} 缺少值`);
    options[name!] = value;
  }
  return { options, positional };
}

export function validateVersion(version: string | undefined): asserts version is string {
  assert.ok(version && /^[0-9A-Za-z][0-9A-Za-z.+-]*$/.test(version), "需要有效版本号（不能含路径分隔符）");
}

// 不跟随输出目录中的链接，也不允许参数将输出导向受保护的源码或真实配置。
export function assertSafePath(target: string, output = false) {
  target = path.resolve(target);
  let ancestor = target;
  while (!fs.existsSync(ancestor)) ancestor = path.dirname(ancestor);
  const resolved = path.join(fs.realpathSync(ancestor), path.relative(ancestor, target));
  const forbidden = [
    path.join(os.homedir(), ".t3/userdata"),
    path.join(os.homedir(), "Library/Application Support/t3code-v2"),
    ...(output ? ["/Applications", path.join(ROOT, "upstream"), path.join(ROOT, ".build/src"),
      path.join(path.dirname(ROOT), "t3code"), path.join(path.dirname(ROOT), "t3code-zh-github")] : []),
  ];
  for (const base of forbidden) {
    assert.ok(resolved !== base && !resolved.startsWith(base + path.sep), "参数指向受保护目录");
  }
}

export function prepareOut(out: string) {
  assertSafePath(out, true);
  fs.mkdirSync(out, { recursive: true });
  assert.ok(fs.readdirSync(out).length === 0, "输出目录必须为空，避免覆盖已有产物或混入旧证据");
}

export type CommandResult = {
  command: string[]; exit_code: number; signal: string | null; seconds: number;
  log: string; output: string;
};

export async function runCommand(command: string, args: string[], log: string, patterns: PrivatePattern[],
  options: { cwd?: string; env?: NodeJS.ProcessEnv; allowFailure?: boolean; input?: string } = {}): Promise<CommandResult> {
  const started = performance.now();
  const result = await new Promise<{ output: string; exit: number; signal: string | null }>((resolve) => {
    const child = spawn(command, args, {
      cwd: options.cwd ?? ROOT, env: options.env ?? process.env, stdio: ["pipe", "pipe", "pipe"],
    });
    const chunks: Buffer[] = [];
    child.stdout.on("data", (chunk) => chunks.push(chunk));
    child.stderr.on("data", (chunk) => chunks.push(chunk));
    child.on("error", (error) => chunks.push(Buffer.from(String(error))));
    child.on("close", (exit, signal) => resolve({ output: Buffer.concat(chunks).toString("utf8"), exit: exit ?? 1, signal }));
    child.stdin.on("error", () => {});
    child.stdin.end(options.input);
  });
  const row = { command: [command, ...args], exit_code: result.exit, signal: result.signal,
    seconds: Number(((performance.now() - started) / 1000).toFixed(3)), log, output: result.output };
  fs.writeFileSync(log, redact(row.output, patterns));
  if (!options.allowFailure) assert.equal(row.exit_code, 0, `${path.basename(command)} 失败，日志：${log}`);
  return row;
}

export function sha256(data: Buffer): string { return createHash("sha256").update(data).digest("hex"); }
export async function shaFile(file: string): Promise<string> {
  const hash = createHash("sha256");
  for await (const chunk of fs.createReadStream(file)) hash.update(chunk);
  return hash.digest("hex");
}

export function walkFiles(root: string): { files: string[]; links: { file: string; target: string }[]; paths: string[] } {
  const files: string[] = [], links: { file: string; target: string }[] = [], paths: string[] = [];
  const walk = (directory: string) => {
    for (const name of fs.readdirSync(directory).sort()) {
      const file = path.join(directory, name);
      paths.push(file);
      const stat = fs.lstatSync(file);
      if (stat.isSymbolicLink()) links.push({ file, target: fs.readlinkSync(file) });
      else if (stat.isDirectory()) walk(file);
      else if (stat.isFile()) files.push(file);
    }
  };
  walk(root);
  return { files, links, paths };
}

export function auditOutputs(out: string, patterns: PrivatePattern[]) {
  const tree = walkFiles(out);
  const findings: { file: string; label: string; location: string }[] = [];
  for (const file of tree.files) {
    const data = fs.readFileSync(file);
    for (const p of patterns) if (data.includes(Buffer.from(p.value))) findings.push({ file, label: p.label, location: "content" });
  }
  for (const file of tree.paths) for (const p of patterns) {
    if (path.relative(out, file).includes(p.value)) findings.push({ file, label: p.label, location: "path" });
  }
  for (const link of tree.links) for (const p of patterns) {
    if (link.target.includes(p.value)) findings.push({ file: link.file, label: p.label, location: "symlink" });
  }
  return { passed: findings.length === 0, files_checked: tree.files.length, findings };
}

// 挂载点事先登记；attach 中途失败也尝试卸载。卸载不成功时保留目录并报错，不删除挂载内容。
export class MountCleanupError extends Error {}

export async function withMount<T>(dmg: string, mount: string, readonly: boolean, out: string,
  patterns: PrivatePattern[], use: (mount: string) => Promise<T>): Promise<T> {
  fs.mkdirSync(mount);
  let attached = false;
  try {
    await runCommand("hdiutil", ["attach", dmg, ...(readonly ? ["-readonly"] : []),
      "-nobrowse", "-noautoopen", "-mountpoint", mount], path.join(out, "attach.log"), patterns);
    attached = true;
    return await use(mount);
  } finally {
    let detach = await runCommand("hdiutil", ["detach", mount], path.join(out, "detach.log"), patterns, { allowFailure: true });
    if (detach.exit_code !== 0) detach = await runCommand("hdiutil", ["detach", "-force", mount],
      path.join(out, "detach-force.log"), patterns, { allowFailure: true });
    // 未成功 attach 且系统明确报告不存在挂载，才可将 detach 失败视为无需卸载。
    if (!(detach.exit_code === 0 || (!attached && /No such file|not mounted|No mount point/i.test(detach.output)))) {
      throw new MountCleanupError(`卸载失败，保留临时目录：${mount}`);
    }
  }
}

export function findApp(directory: string): string {
  const apps = fs.readdirSync(directory).filter((name) => name.endsWith(".app") && fs.lstatSync(path.join(directory, name)).isDirectory());
  assert.equal(apps.length, 1, "目录必须恰有一个 App");
  return path.join(directory, apps[0]!);
}

export function parseCheckMetrics(kind: string, log: string): Record<string, number | null> {
  const count = (regex: RegExp) => { const match = log.match(regex); return match ? Number(match[1]) : null; };
  if (kind === "tests") return { passed: count(/^# (?:pass|ℹ pass) (\d+)\s*$/m) ?? count(/^ℹ pass (\d+)\s*$/m),
    total: count(/^# tests (\d+)\s*$/m) ?? count(/^ℹ tests (\d+)\s*$/m) };
  if (kind === "dict-tests") {
    const match = log.match(/(\d+)\/(\d+) 通过/);
    return { passed: match ? +match[1]! : null, total: match ? +match[2]! : null };
  }
  if (kind === "dict") return { messages: count(/messages (\d+) \+ templates/),
    templates: count(/templates (\d+) =/), total: count(/templates \d+ = (\d+)/) };
  if (kind === "regress") return { candidates: count(/translate 候选 (\d+)/),
    newly: count(/新译出 (\d+)/), fixed: count(/误配修正 (\d+)/), regressions: count(/回归 (\d+)/) };
  if (kind === "exotic") {
    const rows = [...log.matchAll(/^\[(?:OK|命中!)\] [^:]+: (\d+) 处/gm)];
    return { alarm_classes: rows.length ? rows.filter((match) => +match[1]! > 0).length : null,
      alarm_hits: rows.length ? rows.reduce((sum, match) => sum + +match[1]!, 0) : null };
  }
  if (kind === "tsc") return { errors: [...log.matchAll(/\berror TS\d+:/g)].length };
  throw new Error(`未知检查类别 ${kind}`);
}

export function checksPassed(rows: { exit_code: number }[]) {
  return rows.length > 0 && rows.every((row) => row.exit_code === 0);
}
