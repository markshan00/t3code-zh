/**
 * scripts/windows/ 各脚本共用的小工具（T21-W）。只用 Node 内置模块，CI 上不需要先装依赖。
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync, type SpawnSyncOptions } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

/** t3code-zh 仓库根目录（本文件在 scripts/windows/lib/）。 */
export const ZH_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

let logPrefix = "t3zh-ci";
export function setLogPrefix(prefix: string): void {
  logPrefix = prefix;
}
export function log(message: string): void {
  console.log(`[${logPrefix}] ${message}`);
}
export class CheckError extends Error {}
export function fail(message: string): never {
  throw new CheckError(message);
}
export function check(condition: unknown, message: string): asserts condition {
  if (!condition) fail(message);
}

/** 与 scripts/lib/t3-connect-config.ts 相同的「直接运行」判断。 */
export function isMainModule(moduleUrl: string): boolean {
  return Boolean(process.argv[1]) && moduleUrl === pathToFileURL(path.resolve(process.argv[1]!)).href;
}

/** 运行入口：CheckError 打印一行原因、退出码 1；其他异常保留堆栈。 */
export async function main(prefix: string, body: () => void | Promise<void>): Promise<void> {
  setLogPrefix(prefix);
  try {
    await body();
  } catch (error) {
    if (error instanceof CheckError) {
      console.error(`[${prefix}] 失败：${error.message}`);
      process.exit(1);
    }
    throw error;
  }
}

/**
 * 解析 `--name value` / `--flag` 形式的参数。未知参数报错，避免拼错的选项被静默忽略。
 */
export function parseArgs(
  argv: ReadonlyArray<string>,
  spec: { readonly values?: ReadonlyArray<string>; readonly flags?: ReadonlyArray<string> },
): { readonly positionals: string[]; readonly values: Map<string, string>; readonly flags: Set<string> } {
  const values = new Map<string, string>();
  const flags = new Set<string>();
  const positionals: string[] = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]!;
    if (!arg.startsWith("--")) {
      positionals.push(arg);
      continue;
    }
    const name = arg.slice(2);
    if (spec.flags?.includes(name)) {
      flags.add(name);
      continue;
    }
    if (spec.values?.includes(name)) {
      const value = argv[i + 1];
      if (value === undefined || value.startsWith("--")) fail(`参数 --${name} 缺少值`);
      if (values.has(name)) fail(`参数 --${name} 重复`);
      values.set(name, value);
      i += 1;
      continue;
    }
    fail(`未知参数 ${arg}`);
  }
  return { positionals, values, flags };
}

export function requireValue(values: Map<string, string>, name: string): string {
  const value = values.get(name)?.trim();
  if (!value) fail(`缺少参数 --${name}`);
  return value;
}

/** 交付版本号：与 build-zh.sh 同一正则，且不能是 -nightly.YYYYMMDD.N（产品名会变成官方 Nightly）。 */
export function validateVersion(version: string): string {
  check(
    /^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z]+([.-][0-9A-Za-z]+)*)?$/.test(version),
    `版本号格式不对：${version}`,
  );
  check(!/-nightly\.[0-9]{8}\.[0-9]+$/.test(version), `版本号不能是 -nightly.YYYYMMDD.N 形式：${version}`);
  // 上游把 -pr.N. / -preview.YYYYMMDD.N 当作不发布的预览版，会改变更新源与图标判定，汉化交付不用这两种。
  check(!/-pr\./.test(version) && !/-preview\.[0-9]{8}\.[0-9]+$/.test(version), `版本号不能是上游预览版形式：${version}`);
  return version;
}

export interface RunOptions {
  readonly cwd?: string;
  readonly env?: NodeJS.ProcessEnv;
  /** 捕获 stdout 并返回（stderr 照常输出）。 */
  readonly capture?: boolean;
  /** Windows 上 .cmd/.bat 需要经 cmd.exe 运行。 */
  readonly shell?: boolean;
  readonly allowFailure?: boolean;
}

export function run(command: string, args: ReadonlyArray<string>, options: RunOptions = {}): { status: number; stdout: string } {
  log(`$ ${[command, ...args].map(quoteForLog).join(" ")}${options.cwd ? `   (cwd ${options.cwd})` : ""}`);
  const spawnOptions: SpawnSyncOptions = {
    cwd: options.cwd,
    env: options.env ?? process.env,
    stdio: options.capture ? ["ignore", "pipe", "inherit"] : "inherit",
    encoding: "utf8",
    shell: options.shell ?? false,
    maxBuffer: 256 * 1024 * 1024,
  };
  // shell 模式（Windows 的 .cmd）下 Node 不替参数加引号，这里按 cmd.exe 规则自己加。
  const useWinShell = Boolean(options.shell) && process.platform === "win32";
  const result = spawnSync(
    useWinShell ? quoteForCmd(command) : command,
    (useWinShell ? args.map(quoteForCmd) : args) as string[],
    spawnOptions,
  );
  if (result.error) fail(`无法启动 ${command}：${result.error.message}`);
  const status = result.status ?? 1;
  if (status !== 0 && !options.allowFailure) fail(`${command} 退出码 ${status}${result.signal ? `（信号 ${result.signal}）` : ""}`);
  return { status, stdout: typeof result.stdout === "string" ? result.stdout : "" };
}

export function quoteForCmd(value: string): string {
  if (/^[A-Za-z0-9_./:=@\\+,-]+$/.test(value)) return value;
  if (/["%!^&|<>]/.test(value)) fail(`参数含 cmd.exe 特殊字符，拒绝经 shell 传递：${value}`);
  return `"${value}"`;
}

function quoteForLog(value: string): string {
  return /^[A-Za-z0-9_./:=@%+,-]+$/.test(value) ? value : JSON.stringify(value);
}

export function git(src: string, args: ReadonlyArray<string>, options: Omit<RunOptions, "cwd"> = {}) {
  return run("git", ["-C", src, ...args], options);
}

export function sha256File(file: string): string {
  const hash = crypto.createHash("sha256");
  const fd = fs.openSync(file, "r");
  try {
    const buffer = Buffer.allocUnsafe(1024 * 1024);
    let bytes: number;
    while ((bytes = fs.readSync(fd, buffer, 0, buffer.length, null)) > 0) hash.update(buffer.subarray(0, bytes));
  } finally {
    fs.closeSync(fd);
  }
  return hash.digest("hex");
}

/** 递归列出目录下的普通文件（相对路径，用 / 分隔）。 */
export function listFiles(root: string): string[] {
  const out: string[] = [];
  const walk = (dir: string, rel: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const childRel = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) walk(path.join(dir, entry.name), childRel);
      else if (entry.isFile()) out.push(childRel);
    }
  };
  walk(root, "");
  return out.sort();
}

/** 在目录的 .js/.mjs/.cjs 文件里找一段文字，返回第一个命中的相对路径。 */
export function findTextInJs(root: string, text: string, exclude?: (rel: string) => boolean): string | undefined {
  for (const rel of listFiles(root)) {
    if (!/\.(?:js|mjs|cjs)$/.test(rel) || exclude?.(rel)) continue;
    if (fs.readFileSync(path.join(root, rel), "utf8").includes(text)) return rel;
  }
  return undefined;
}

/** 写 JSON 证据文件（2 空格缩进，结尾换行）。 */
export function writeJson(file: string, value: unknown): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

/**
 * 打包用的子进程环境：去掉会让 electron-builder 生成更新源或尝试签名的变量。
 *
 * - GITHUB_REPOSITORY：GitHub runner 自动注入；上游 resolveGitHubPublishConfig 读到它就给包写
 *   publish 配置（app-update.yml + latest.yml），汉化版会去公开仓库找更新。必须删除。
 * - T3CODE_DESKTOP_UPDATE_REPOSITORY / T3CODE_DESKTOP_MOCK_UPDATES*：同上，另两条更新源入口。
 * - 签名相关（CSC_* / WIN_CSC_* / AZURE_* / APPLE_* / T3CODE_DESKTOP_SIGNED）：unsigned 构建不继承。
 * - ELECTRON_RUN_AS_NODE：终端可能带着，打包和启动产物都不需要。
 */
export const PACKAGING_ENV_DENYLIST = [
  /^GITHUB_REPOSITORY$/,
  /^GITHUB_REPOSITORY_OWNER$/,
  /^T3CODE_DESKTOP_UPDATE_REPOSITORY$/,
  /^T3CODE_DESKTOP_MOCK_UPDATES$/,
  /^T3CODE_DESKTOP_MOCK_UPDATE_SERVER_PORT$/,
  /^T3CODE_DESKTOP_SIGNED$/,
  /^CSC_/,
  /^WIN_CSC_/,
  /^AZURE_/,
  /^APPLE_/,
  /^GH_TOKEN$/,
  /^GITHUB_TOKEN$/,
  /^ELECTRON_RUN_AS_NODE$/,
] as const;

export function sanitizedPackagingEnv(base: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {};
  for (const [key, value] of Object.entries(base)) {
    // Windows 环境变量名不区分大小写，按大写比较。
    if (PACKAGING_ENV_DENYLIST.some((pattern) => pattern.test(key.toUpperCase()))) continue;
    env[key] = value;
  }
  return env;
}
