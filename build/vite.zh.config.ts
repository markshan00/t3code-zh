/**
 * t3code-zh 的 web 包装配置。由 scripts/build-zh.sh 复制到 .build/src/apps/web/ 后，以
 * `vp build -c vite.zh.config.ts` 使用（在 apps/web 目录下运行）。
 *
 * - 原样使用上游 ./vite.config.ts 的默认导出：现在是 defineConfig(() => ({...})) 函数形式，也兼容对象形式；
 * - 只把 t3zh 插件插到 plugins 最前面，其余配置不动。
 *
 * t3code-zh 仓库位置：环境变量 T3ZH_ROOT（build-zh.sh 会设置），否则按
 * .build/src/apps/web/ → 仓库根 的相对位置推算。插件用 Node 原生 import 加载（.ts 类型擦除），
 * 依赖从 t3code-zh/node_modules 解析，不进上游的依赖树。
 */
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { defineConfig, type ConfigEnv, type UserConfig } from "vite-plus";

import upstreamConfig from "./vite.config.ts";

const webDir = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(webDir, "../..");
const zhRoot = process.env.T3ZH_ROOT?.trim() || path.resolve(webDir, "../../../..");

type UpstreamConfig = UserConfig | Promise<UserConfig> | ((env: ConfigEnv) => UserConfig | Promise<UserConfig>);

export default defineConfig(async (env: ConfigEnv) => {
  const upstream = upstreamConfig as unknown as UpstreamConfig;
  const base: UserConfig = typeof upstream === "function" ? await upstream(env) : await upstream;
  const releaseVersion = process.env.APP_VERSION?.trim();
  if (releaseVersion && base.define?.["import.meta.env.APP_VERSION"] !== JSON.stringify(releaseVersion)) {
    throw new Error("Upstream Vite APP_VERSION does not match the requested release version");
  }
  const { readT3ConnectConfig } = await import(pathToFileURL(path.join(zhRoot, "scripts/lib/t3-connect-config.ts")).href);
  const connect = readT3ConnectConfig(path.join(monorepoRoot, ".env.example"));
  for (const [viteKey, sourceKey] of [
    ["VITE_CLERK_PUBLISHABLE_KEY", "T3CODE_CLERK_PUBLISHABLE_KEY"],
    ["VITE_CLERK_JWT_TEMPLATE", "T3CODE_CLERK_JWT_TEMPLATE"],
    ["VITE_CLERK_CLI_OAUTH_CLIENT_ID", "T3CODE_CLERK_CLI_OAUTH_CLIENT_ID"],
    ["VITE_T3CODE_RELAY_URL", "T3CODE_RELAY_URL"],
  ]) {
    if (base.define?.[`import.meta.env.${viteKey}`] !== JSON.stringify(connect[sourceKey])) {
      throw new Error(`Upstream Vite is missing the expected T3 Connect public config: ${viteKey}`);
    }
  }
  const pluginModule = await import(pathToFileURL(path.join(zhRoot, "plugin/vite-plugin-t3zh.ts")).href);
  const t3zh = pluginModule.t3zhPlugin({ monorepoRoot });
  return {
    ...base,
    plugins: [t3zh, ...(base.plugins ?? [])],
  };
});
