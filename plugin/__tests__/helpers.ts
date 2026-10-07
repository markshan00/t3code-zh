/** 测试公用：构造扫描上下文、转换并执行小段代码。 */
import { collectValueUse, type ScanContext, type ValueUseInfo } from "../matcher.ts";
import { transformCode } from "../vite-plugin-t3zh.ts";
import type { T3zhDict } from "../../runtime/t3zh-runtime.ts";

export const SAMPLE_DICT: T3zhDict = {
  messages: {
    Default: "默认",
    "Inherit defaults": "继承默认设置",
    Settings: "设置",
    "Hello world": "你好，世界",
    "Save changes": "保存更改",
    "Search…": "搜索…",
    Archive: "归档",
    Close: "关闭",
  },
  templates: {
    "Delete {name}?": "删除 {name}？",
    "{count} files changed": "已更改 {count} 个文件",
    "{0} active · {1} done": "{0} 个进行中 · {1} 个已完成",
    "{minutes}m": "{minutes} 分钟",
    "{head} to {base}": "{head} 到 {base}",
  },
};

/**
 * 用一组「其他模块」的源码做预扫描，构造上下文。
 * prescanSources 的 key 是文件名（决定 .ts/.tsx 解析方式）。
 */
export function makeContext(
  options: { prescanSources?: Record<string, string>; allow?: string[]; dict?: T3zhDict | null } = {},
): ScanContext {
  const valueUse = new Map<string, ValueUseInfo>();
  for (const [file, code] of Object.entries(options.prescanSources ?? {})) {
    collectValueUse(code, file, file, valueUse);
  }
  const ctx: ScanContext = { valueUse, allowSuspicious: new Set(options.allow ?? []) };
  if (options.dict !== null) ctx.dict = options.dict ?? SAMPLE_DICT;
  return ctx;
}

export function transform(code: string, filename = "apps/web/src/Example.tsx", ctx: ScanContext = makeContext()) {
  return transformCode(code, filename, ctx);
}

/** 转换后的输出（没有改动时返回原文），去掉注入的 import，便于断言。 */
export function transformed(code: string, filename = "apps/web/src/Example.tsx", ctx?: ScanContext): string {
  const result = transform(code, filename, ctx);
  if (!result.output) return code;
  return result.output.code.replace(`import { __t3zh_t } from "virtual:t3zh-runtime";`, "");
}

/** 执行一段（转换后的）纯 JS：注入 __t3zh_t 和参数，返回 `result` 变量。 */
export function run(js: string, t: (value: unknown) => unknown, params: Record<string, unknown> = {}): unknown {
  const body = js.replace(/^import .*?;/m, "").replace(/export /g, "");
  const names = Object.keys(params);
  // eslint-disable-next-line no-new-func
  const fn = new Function("__t3zh_t", ...names, `${body}\nreturn result;`);
  return fn(t, ...names.map((name) => params[name]));
}
