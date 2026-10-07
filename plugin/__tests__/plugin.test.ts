/**
 * Vite 插件钩子测试：范围过滤、查询参数、虚拟模块、插件顺序检查、统计输出。
 * 运行：node --test "plugin/__tests__/*.test.ts"（或 npm run test:plugin）
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { t3zhPlugin } from "../vite-plugin-t3zh.ts";
import { SAMPLE_DICT } from "./helpers.ts";

function makeMonorepo(): { root: string; zhDir: string; cleanup(): void } {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "t3zh-plugin-"));
  const write = (rel: string, content: string) => {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), content);
  };
  write("apps/web/package.json", JSON.stringify({ name: "@t3tools/web", dependencies: { "@t3tools/shared": "workspace:*" } }));
  write("packages/shared/package.json", JSON.stringify({ name: "@t3tools/shared" }));
  write("apps/web/src/App.tsx", `export const App = () => <p title="Default">Settings</p>;`);
  write("apps/server/src/compare.ts", `export const isDefault = (s: string) => s === "Default";`);
  write("apps/server/src/compare.test.ts", `if (x === "Settings") {}`);
  const zhDir = path.join(root, "zh");
  write("zh/dict.json", JSON.stringify({ baseline: "test", ...SAMPLE_DICT }));
  return { root, zhDir, cleanup: () => fs.rmSync(root, { recursive: true, force: true }) };
}

function makePlugin(root: string, zhDir: string) {
  return t3zhPlugin({
    monorepoRoot: root,
    dictPath: path.join(zhDir, "dict.json"),
    allowSuspiciousPath: path.join(zhDir, "allow.json"),
    statsFile: path.join(zhDir, "stats.json"),
  });
}

test("插件：enforce pre；configResolved 检查实际插件顺序", () => {
  const { root, zhDir, cleanup } = makeMonorepo();
  try {
    const plugin = makePlugin(root, zhDir);
    assert.equal(plugin.enforce, "pre");
    plugin.configResolved({ plugins: [{ name: "vite:pre-alias" }, { name: "t3zh" }, { name: "tanstack-router:code-splitter:compile-reference-file" }, { name: "@rolldown/plugin-babel" }, { name: "vite:oxc" }] });
    assert.throws(
      () => plugin.configResolved({ plugins: [{ name: "@rolldown/plugin-babel" }, { name: "t3zh" }] }),
      /runs before t3zh/,
    );
    assert.throws(
      () => plugin.configResolved({ plugins: [{ name: "tanstack:router-generator" }, { name: "t3zh" }] }),
      /runs before t3zh/,
    );
  } finally {
    cleanup();
  }
});

test("插件：预扫描覆盖 server（排除测试文件），虚拟模块打包词库，只转换范围内文件", () => {
  const { root, zhDir, cleanup } = makeMonorepo();
  const log = console.log;
  console.log = () => {};
  try {
    const plugin = makePlugin(root, zhDir);
    plugin.buildStart();

    // 虚拟模块
    assert.equal(plugin.resolveId("virtual:t3zh-runtime"), "\0virtual:t3zh-runtime");
    assert.equal(plugin.resolveId("virtual:t3zh-runtime/impl"), path.resolve(import.meta.dirname, "../../runtime/t3zh-runtime.ts"));
    assert.equal(plugin.resolveId("react"), null);
    const virtual = plugin.load("\0virtual:t3zh-runtime") as string;
    assert.match(virtual, /import \{ installT3zhRuntime \} from "virtual:t3zh-runtime\/impl";/);
    assert.match(virtual, /export const __t3zh_t = installT3zhRuntime\(/);
    assert.ok(virtual.includes("继承默认设置"), "词库打包进虚拟模块");
    assert.equal(plugin.load(path.join(root, "apps/web/src/App.tsx")), null);

    const app = path.join(root, "apps/web/src/App.tsx");
    const code = fs.readFileSync(app, "utf8");
    const out = plugin.transform(code, app);
    assert.ok(out, "范围内文件被转换");
    assert.match(out.code, /^import \{ __t3zh_t \} from "virtual:t3zh-runtime";/);
    assert.match(out.code, /title=\{__t3zh_t\("Default"\)\}/, "B 类原始白名单照常转换");
    assert.match(out.code, /<p[^>]*>\{__t3zh_t\("Settings"\)\}<\/p>/);
    assert.ok(out.map.mappings.length > 0);

    // TanStack Router 代码分割模块同样转换；其他查询不碰
    assert.ok(plugin.transform(code, `${app}?tsr-split=component`));
    assert.ok(plugin.transform(code, `${app}?tsr-shared=1&v=abc`));
    assert.equal(plugin.transform(code, `${app}?raw`), null);
    // 范围外：测试文件、server、node_modules、虚拟模块
    assert.equal(plugin.transform(code, path.join(root, "apps/web/src/App.test.tsx")), null);
    assert.equal(plugin.transform(code, path.join(root, "apps/server/src/compare.ts")), null);
    assert.equal(plugin.transform(code, path.join(root, "node_modules/x/index.tsx")), null);
    assert.equal(plugin.transform(code, "\0virtual:t3zh-runtime"), null);

    // C 类：server 里比较过的 "Default" 记 suspicious；测试文件里的比较不算
    const opts = path.join(root, "packages/shared/src/opts.ts");
    const optsOut = plugin.transform(`export const o = [{ label: "Default" }, { label: "Settings" }];`, opts);
    assert.match(optsOut.code, /label: "Default"/);
    assert.match(optsOut.code, /label: __t3zh_t\("Settings"\)/);

    plugin.buildEnd();
    const stats = JSON.parse(fs.readFileSync(path.join(zhDir, "stats.json"), "utf8"));
    assert.equal(stats.prescan.files, 2, "web 的 App.tsx + server 的 compare.ts（不含 .test）");
    assert.equal(stats.modules.scanned, 2);
    assert.equal(stats.modules.transformCalls, 4);
    assert.deepEqual(stats.modules.skippedQueries, { raw: 1 });
    assert.equal(stats.totals.translate, 3);
    assert.equal(stats.totals.suspicious, 1);
    assert.deepEqual(stats.byCategory.C, { suspicious: 1, translate: 1 });
    assert.equal(stats.suspicious[0].key, "Default");
  } finally {
    console.log = log;
    cleanup();
  }
});

test("插件：解析失败时报出文件名", () => {
  const { root, zhDir, cleanup } = makeMonorepo();
  const log = console.log;
  console.log = () => {};
  try {
    const plugin = makePlugin(root, zhDir);
    plugin.buildStart();
    assert.throws(() => plugin.transform("const x = <p>", path.join(root, "apps/web/src/Broken.tsx")), /apps\/web\/src\/Broken\.tsx/);
  } finally {
    console.log = log;
    cleanup();
  }
});
