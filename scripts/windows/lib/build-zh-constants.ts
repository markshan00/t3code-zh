/**
 * 从 scripts/build-zh.sh 读取构建常量（T21-W）。
 *
 * Windows CI 复用 Mac 交付构建的同一套汉化输入和守卫阈值，不在 scripts/windows/ 里复制一份数值：
 * 基线 commit、桌面汉化文件清单、包装配置名、构建链预期、产物守卫文字和转换阈值都以 build-zh.sh 为准。
 *
 * 只认三种顶格写法，其他写法（含变量展开、续行、命令替换）在读取该变量时报错，宁可失败也不猜：
 *   NAME='字面量'      NAME="不含 $ ` \ 的字面量"      NAME=12345
 *   NAME=(             每行一个 '…' 或 "…" 元素，最后一行顶格写 )
 * 读取的变量若顶格赋值多次也报错（不读取的变量不管，如 STEP_NO）。
 */
import fs from "node:fs";

export interface BuildZhConstants {
  readonly baselineCommit: string;
  readonly wrapperName: string;
  readonly desktopI18nDir: string;
  /** [仓库内源路径, 复制后的文件名] */
  readonly desktopI18nFiles: ReadonlyArray<readonly [string, string]>;
  readonly desktopMainGuardText: string;
  readonly desktopArgumentGuardText: string;
  readonly desktopPreloadGuardText: string;
  readonly appLicenseName: string;
  readonly upstreamGeneratedFiles: ReadonlyArray<string>;
  readonly expectedServerBuildCommand: string;
  readonly expectedServerBuildDependsOn: string;
  readonly expectedDesktopBuildCommand: string;
  readonly expectedDesktopBuildDependsOn: string;
  readonly expectedWebBuildScript: string;
  readonly expectedRootBuildDesktopScript: string;
  readonly minTranslate: number;
  readonly guardText: string;
}

type RawValue =
  | { readonly kind: "scalar"; readonly value: string; readonly line: number }
  | { readonly kind: "array"; readonly value: string[]; readonly line: number }
  | { readonly kind: "invalid"; readonly reason: string; readonly line: number };

function unquote(token: string): string {
  const single = /^'([^']*)'$/.exec(token);
  if (single) return single[1]!;
  const double = /^"([^"]*)"$/.exec(token);
  if (double) {
    if (/[$`\\]/.test(double[1]!)) throw new Error("双引号值含 $ ` \\，不支持展开");
    return double[1]!;
  }
  if (/^[0-9]+$/.test(token)) return token;
  throw new Error(`不是单引号、双引号或纯数字字面量：${token}`);
}

export function parseShellAssignments(text: string): Map<string, RawValue> {
  const result = new Map<string, RawValue>();
  const lines = text.split(/\r?\n/);
  const set = (name: string, value: RawValue) => {
    result.set(name, result.has(name) ? { kind: "invalid", reason: "顶格赋值多次", line: value.line } : value);
  };
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]!;
    const arrayStart = /^([A-Z][A-Z0-9_]*)=\($/.exec(line);
    if (arrayStart) {
      const name = arrayStart[1]!;
      const startLine = i + 1;
      const items: string[] = [];
      let closed = false;
      let invalid: string | undefined;
      for (i += 1; i < lines.length; i += 1) {
        if (lines[i] === ")") {
          closed = true;
          break;
        }
        const item = lines[i]!.trim();
        if (item === "" || item.startsWith("#")) continue;
        try {
          items.push(unquote(item));
        } catch (error) {
          invalid ??= `第 ${i + 1} 行元素${(error as Error).message}`;
        }
      }
      if (!closed) throw new Error(`build-zh.sh 第 ${startLine} 行：数组 ${name} 没有顶格的 ) 结尾`);
      set(name, invalid ? { kind: "invalid", reason: invalid, line: startLine } : { kind: "array", value: items, line: startLine });
      continue;
    }
    const scalar = /^([A-Z][A-Z0-9_]*)=(.*)$/.exec(line);
    if (scalar) {
      const name = scalar[1]!;
      try {
        set(name, { kind: "scalar", value: unquote(scalar[2]!), line: i + 1 });
      } catch (error) {
        set(name, { kind: "invalid", reason: (error as Error).message, line: i + 1 });
      }
    }
  }
  return result;
}

export function readBuildZhConstants(buildZhPath: string): BuildZhConstants {
  return buildZhConstantsFromText(fs.readFileSync(buildZhPath, "utf8"));
}

export function buildZhConstantsFromText(text: string): BuildZhConstants {
  const vars = parseShellAssignments(text);
  const get = (name: string, kind: "scalar" | "array") => {
    const value = vars.get(name);
    if (!value) {
      throw new Error(`build-zh.sh 里找不到 ${name}（变量改名或写法变化时同步 scripts/windows/lib/build-zh-constants.ts）`);
    }
    if (value.kind === "invalid") throw new Error(`build-zh.sh 第 ${value.line} 行：${name} ${value.reason}`);
    if (value.kind !== kind) throw new Error(`build-zh.sh 的 ${name} 应是${kind === "scalar" ? "标量" : "数组"}`);
    return value.value;
  };
  const scalar = (name: string): string => {
    const value = get(name, "scalar") as string;
    if (value === "") throw new Error(`build-zh.sh 的 ${name} 为空`);
    return value;
  };
  const array = (name: string): string[] => get(name, "array") as string[];

  const baselineCommit = scalar("BASELINE_COMMIT");
  if (!/^[0-9a-f]{40}$/.test(baselineCommit)) throw new Error(`BASELINE_COMMIT 不是 40 位 commit：${baselineCommit}`);
  const minTranslate = Number(scalar("MIN_TRANSLATE"));
  if (!Number.isSafeInteger(minTranslate) || minTranslate <= 0) throw new Error("MIN_TRANSLATE 不是正整数");
  const desktopI18nFiles = array("DESKTOP_I18N_FILES").map((entry) => {
    const colon = entry.lastIndexOf(":");
    if (colon <= 0 || colon === entry.length - 1) throw new Error(`DESKTOP_I18N_FILES 元素应为 <源路径>:<文件名>：${entry}`);
    const from = entry.slice(0, colon);
    const to = entry.slice(colon + 1);
    if (from.startsWith("/") || from.split("/").includes("..") || /[/\\]/.test(to)) {
      throw new Error(`DESKTOP_I18N_FILES 元素路径异常：${entry}`);
    }
    return [from, to] as const;
  });
  if (desktopI18nFiles.length === 0) throw new Error("DESKTOP_I18N_FILES 为空");
  return {
    baselineCommit,
    wrapperName: scalar("WRAPPER_NAME"),
    desktopI18nDir: scalar("DESKTOP_I18N_DIR"),
    desktopI18nFiles,
    desktopMainGuardText: scalar("DESKTOP_MAIN_GUARD_TEXT"),
    desktopArgumentGuardText: scalar("DESKTOP_ARGUMENT_GUARD_TEXT"),
    desktopPreloadGuardText: scalar("DESKTOP_PRELOAD_GUARD_TEXT"),
    appLicenseName: scalar("APP_LICENSE_NAME"),
    upstreamGeneratedFiles: array("UPSTREAM_GENERATED_FILES"),
    expectedServerBuildCommand: scalar("EXPECTED_SERVER_BUILD_COMMAND"),
    expectedServerBuildDependsOn: scalar("EXPECTED_SERVER_BUILD_DEPENDS_ON"),
    expectedDesktopBuildCommand: scalar("EXPECTED_DESKTOP_BUILD_COMMAND"),
    expectedDesktopBuildDependsOn: scalar("EXPECTED_DESKTOP_BUILD_DEPENDS_ON"),
    expectedWebBuildScript: scalar("EXPECTED_WEB_BUILD_SCRIPT"),
    expectedRootBuildDesktopScript: scalar("EXPECTED_ROOT_BUILD_DESKTOP_SCRIPT"),
    minTranslate,
    guardText: scalar("GUARD_TEXT"),
  };
}
