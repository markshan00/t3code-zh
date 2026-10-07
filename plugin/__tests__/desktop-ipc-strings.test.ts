/**
 * patches/0006（桌面主进程经 IPC 传给 web 显示的英文）测试，T07-fix1。
 * 运行：node --test "plugin/__tests__/*.test.ts"（或 npm run test:plugin）
 *
 * - 把 0006 打到 upstream/ 里相关文件的副本上，加载新增的 apps/web/src/desktopIpcStrings.ts：
 *   名单里的文字用主词库查到精确译文，名单外的任意英文原样返回（不让宽模板误配）。
 * - 名单与上游源码一致：每条文字（或拼出它的片段与列表）都还在桌面 / contracts 源码里。
 * - 补丁没有改变这些文件的转换判定：前后 scanModule 的候选逐条相同，新文件不产生候选、不引入值用途。
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { parse } from "@babel/parser";
import babelTraverse from "@babel/traverse";
import babelGenerator from "@babel/generator";

import { collectValueUse, createScanContext, scanModule, type ValueUseInfo } from "../matcher.ts";
import {
  createTranslator,
  installT3zhRuntime,
  type T3zhDict,
} from "../../runtime/t3zh-runtime.ts";

const traverse = ((babelTraverse as any).default ?? babelTraverse) as typeof import("@babel/traverse").default;
const generate = ((babelGenerator as any).default ?? babelGenerator) as typeof import("@babel/generator").default;

const ZH_ROOT = path.resolve(import.meta.dirname, "../..");
// 默认 upstream/（当前基线）；升级时可用 T3ZH_UPSTREAM 指向新 tag 的源码（scripts/upgrade-check.sh）。
const UPSTREAM = process.env.T3ZH_UPSTREAM ? path.resolve(process.env.T3ZH_UPSTREAM) : path.join(ZH_ROOT, "upstream");
const PATCH = path.join(ZH_ROOT, "patches/0006-desktop-ipc-display-strings.patch");
const MAIN_DICT: T3zhDict = JSON.parse(fs.readFileSync(path.join(ZH_ROOT, "dict/zh-CN.json"), "utf8"));
const HELPER = "apps/web/src/desktopIpcStrings.ts";
const PATCHED_COMPONENT = "apps/web/src/components/settings/SnapShotSetupDialog.tsx";
const PATCHED_FILES = [
  "apps/web/src/components/ServerUpdateAction.tsx",
  "apps/web/src/components/desktop/SnapShotCoordinator.tsx",
  "apps/web/src/components/settings/ConnectionsSettings.tsx",
  "apps/web/src/components/settings/SnapShotSettings.tsx",
  "apps/web/src/components/settings/SnapShotSetupDialog.tsx",
];

function applyPatch(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "t3zh-0006-"));
  for (const file of PATCHED_FILES) {
    fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
    fs.copyFileSync(path.join(UPSTREAM, file), path.join(dir, file));
  }
  execFileSync("git", ["apply", PATCH], { cwd: dir });
  return dir;
}

const PATCHED = applyPatch();
const helperCode = fs.readFileSync(path.join(PATCHED, HELPER), "utf8");

type Node = any;

/** 新文件里各个 `const NAME: readonly string[] = [...]` 的字符串元素。 */
function arrayConstants(code: string): Map<string, string[]> {
  const result = new Map<string, string[]>();
  const ast = parse(code, { sourceType: "module", plugins: ["typescript"] });
  for (const statement of ast.program.body) {
    if (statement.type !== "VariableDeclaration") continue;
    for (const declarator of statement.declarations as Node[]) {
      if (declarator.init?.type !== "ArrayExpression") continue;
      result.set(
        declarator.id.name,
        declarator.init.elements.map((element: Node) => {
          assert.equal(element.type, "StringLiteral", `${declarator.id.name} 只能放字符串字面量`);
          return element.value as string;
        }),
      );
    }
  }
  return result;
}

const LISTS = arrayConstants(helperCode);
const list = (name: string): string[] => {
  const value = LISTS.get(name);
  assert.ok(value, `新文件里找不到 ${name}`);
  return value;
};

/** 名单展开后的全部文字，拼法与新文件里 KNOWN_DESKTOP_IPC_STRINGS 相同。 */
const KNOWN = [
  ...list("ENDPOINT_NAMES"),
  ...list("SNAP_SHOT_MESSAGES"),
  ...list("SNAP_SHOT_COMMON_ACTIONS").map((action) => `This shortcut is ${action} in most apps.`),
  ...list("SNAP_SHOT_APPLE_MODIFIERS").map((modifier) => `${modifier} + ${modifier} is not available on this system.`),
  ...list("DESKTOP_UPDATE_FAILURE_REASONS").map((reason) => `Server update failed: ${reason}`),
];

interface HelperModule {
  translateKnownDesktopString(value: string | null | undefined): string | null | undefined;
}

async function loadHelper(): Promise<HelperModule> {
  const url = pathToFileURL(path.join(PATCHED, HELPER)).href;
  return import(url);
}

test("名单里的文字查到主词库的精确译文，名单外的任意英文原样返回", async () => {
  const { translateKnownDesktopString } = await loadHelper();
  const translate = createTranslator(MAIN_DICT);
  const g = globalThis as Record<string, unknown>;
  const previous = g.__t3zh;
  g.__t3zh = { t: (value: unknown) => (typeof value === "string" ? translate(value) : value) };
  try {
    assert.equal(KNOWN.length, 4 + 9 + 13 + 4 + 13);
    for (const text of KNOWN) {
      assert.ok(text in MAIN_DICT.messages, `${text} 没有精确词条`);
      assert.equal(translateKnownDesktopString(text), MAIN_DICT.messages[text], text);
      assert.notEqual(translateKnownDesktopString(text), text, `${text} 没有被翻译`);
    }
    // 名单外：真实源码里会经过这些显示位置的其他英文，用主词库的模板会被改坏，必须原样返回。
    const unknown = [
      "Failed to resolve canonical asset path.",
      "invalid attachment id",
      "SSH authentication cancelled.",
      "Server update failed: The server is already up to date on 0.0.46.",
      "Could not check this shortcut.",
      "Tailscale HTTPS",
      "Tailscale IP",
    ];
    for (const text of unknown) assert.equal(translateKnownDesktopString(text), text, text);
    assert.notEqual(translate("Failed to resolve canonical asset path."), "Failed to resolve canonical asset path.", "反证：直接 t() 会误配");
    assert.equal(translateKnownDesktopString(null), null);
    assert.equal(translateKnownDesktopString(undefined), undefined);
    // 没有汉化运行时（或 t 不存在）时原样返回。
    g.__t3zh = undefined;
    assert.equal(translateKnownDesktopString("Local network"), "Local network");
    g.__t3zh = {};
    assert.equal(translateKnownDesktopString("Local network"), "Local network");
  } finally {
    g.__t3zh = previous;
  }
});

function upstream(file: string): string {
  return fs.readFileSync(path.join(UPSTREAM, file), "utf8");
}

test("名单与上游源码一致", () => {
  const exposure = upstream("apps/desktop/src/backend/DesktopServerExposure.ts");
  for (const name of list("ENDPOINT_NAMES")) assert.ok(exposure.includes(JSON.stringify(name)), name);

  const snapShotSources = upstream("apps/desktop/src/snapShot/DesktopSnapShot.ts") + upstream("apps/desktop/src/snapShot/snapShot.ts");
  for (const message of list("SNAP_SHOT_MESSAGES")) assert.ok(snapShotSources.includes(JSON.stringify(message)), message);

  const snapShot = upstream("apps/desktop/src/snapShot/snapShot.ts");
  assert.ok(snapShot.includes("`This shortcut is ${action} in most apps.`"));
  const actions = /const COMMON_MOD_ACTIONS[^{]*\{([^}]*)\}/.exec(snapShot)?.[1] ?? "";
  assert.deepEqual([...actions.matchAll(/:\s*"([^"]+)"/g)].map((m) => m[1]), list("SNAP_SHOT_COMMON_ACTIONS"));
  assert.ok(snapShot.includes(")} is not available on this system.`"));

  const settings = upstream("packages/contracts/src/settings.ts");
  const apple = /const APPLE_MODIFIER_LABELS[^{]*\{([^}]*)\}/.exec(settings)?.[1] ?? "";
  assert.deepEqual([...apple.matchAll(/:\s*"([^"]+)"/g)].map((m) => m[1]).sort(), [...list("SNAP_SHOT_APPLE_MODIFIERS")].sort());
  assert.ok(settings.includes("return `${label} + ${label}`;"));

  const updates = ["remoteUpdateFlow.ts", "DesktopRemoteUpdates.ts", "DesktopUpdates.ts"]
    .map((file) => upstream(`apps/desktop/src/updates/${file}`))
    .join("\n");
  for (const reason of list("DESKTOP_UPDATE_FAILURE_REASONS")) assert.ok(updates.includes(JSON.stringify(reason)), reason);
  assert.ok(upstream("packages/contracts/src/server.ts").includes("return `Server update failed: ${this.reason}`;"));
});

test("补丁不改变转换判定：候选逐条相同，新文件不产生候选、不引入值用途", () => {
  const ctx = createScanContext({ root: UPSTREAM });
  const summary = (code: string, file: string) =>
    scanModule(code, file, ctx)
      .candidates.map((c) => `${c.text}|${c.category}|${c.decision}|${c.reason}`)
      .sort();
  for (const file of PATCHED_FILES) {
    assert.deepEqual(summary(fs.readFileSync(path.join(PATCHED, file), "utf8"), file), summary(upstream(file), file), file);
  }
  assert.deepEqual(scanModule(helperCode, HELPER, ctx).candidates, []);
  const valueUse = new Map<string, ValueUseInfo>();
  collectValueUse(helperCode, HELPER, HELPER, valueUse);
  for (const text of KNOWN) assert.ok(!valueUse.has(text), `${text} 不应成为值用途字面量`);
  for (const name of LISTS.values()) for (const text of name) assert.ok(!valueUse.has(text), `${text} 不应成为值用途字面量`);
});

test("0004 需要的词条都在主词库里", () => {
  for (const key of ["Awaiting Input", "Pending Approval", "Completed", "Running source control action", "Starting source control action...", "pull requests"]) {
    assert.ok(key in MAIN_DICT.messages, key);
  }
});

/** 用真实主词库给 globalThis.__t3zh 装中文或英文运行时，返回恢复函数。 */
function installRuntime(locale: "zh-CN" | "en"): () => void {
  const g = globalThis as Record<string, any>;
  const previous = g.__t3zh;
  const installed = installT3zhRuntime(MAIN_DICT, {
    localStorage: { getItem: () => locale, setItem: () => {} },
    navigator: null,
    systemLanguages: null,
    document: null,
    location: null,
    target: null,
  });
  assert.equal(installed.locale, locale);
  g.__t3zh = installed.api;
  return () => {
    g.__t3zh = previous;
  };
}

/** 从补丁后的 SnapShotSetupDialog 源码里取出 `const details = [...]` 初始化的表达式，用 t 求值。 */
function detailsEvaluator(t: (text: string) => string): (error: string | null, stateMessage: string | null) => string[] {
  const code = fs.readFileSync(path.join(PATCHED, PATCHED_COMPONENT), "utf8");
  const ast = parse(code, { sourceType: "module", plugins: ["typescript", "jsx"] });
  let source: string | null = null;
  traverse(ast, {
    VariableDeclarator(pathNode) {
      const node = pathNode.node as Node;
      if (node.id?.type === "Identifier" && node.id.name === "details" && node.init) {
        source = generate(node.init).code;
        pathNode.stop();
      }
    },
  });
  assert.ok(source, `没能在补丁后的 ${PATCHED_COMPONENT} 里找到 const details 初始化表达式`);
  // 只把补丁 helper 换成翻译函数，其余（state.message、Set 去重、filter）保持源码原样。
  for (const name of ["state.message", "new Set"]) {
    assert.ok(source.includes(name), `details 表达式里少了 ${name}`);
  }
  assert.ok(
    !source.includes("translateKnownDesktopString"),
    "details 构造处不应出现翻译：翻译在最终 JSX 文本处",
  );
  const build = new Function(
    "translateKnownDesktopString",
    "state",
    "error",
    "step",
    "backend",
    "extension",
    "helper",
    "helperBackend",
    `return (${source});`,
  );
  return (errorValue, stateMessage) =>
    build(
      (text: string) => (typeof text === "string" ? t(text) : text),
      { message: stateMessage },
      errorValue,
      "access",
      "direct",
      undefined,
      undefined,
      false,
    ) as string[];
}

/** 从补丁后的 SnapShotSetupDialog 源码里取出 `<p key={...}>` 的 key 表达式和正文表达式。 */
function detailsRenderExpressions(): { key: string; child: string } {
  const code = fs.readFileSync(path.join(PATCHED, PATCHED_COMPONENT), "utf8");
  const ast = parse(code, { sourceType: "module", plugins: ["typescript", "jsx"] });
  let key: string | null = null;
  let child: string | null = null;
  traverse(ast, {
    JSXAttribute(pathNode) {
      const node = pathNode.node as Node;
      if (node.name?.name !== "key" || node.value?.type !== "JSXExpressionContainer") return;
      key = generate(node.value.expression).code;
      const element = pathNode.parentPath?.parentPath?.node as Node | undefined;
      const text = (element?.children ?? []).find(
        (child: Node) => child.type === "JSXExpressionContainer",
      );
      if (text) child = generate(text.expression).code;
    },
  });
  assert.ok(key, "没找到 details 的 key 表达式");
  assert.ok(child, "没找到 details 的正文表达式");
  return { key, child };
}

test("权限向导 details：英文原值去重、英文作 React key、只有正文翻译", async () => {
  const { translateKnownDesktopString } = await loadHelper();
  const component = fs.readFileSync(path.join(PATCHED, PATCHED_COMPONENT), "utf8");
  const { key, child } = detailsRenderExpressions();
  // 补丁后：state.message 保持英文进 Set 与 filter，正文才包 translateKnownDesktopString。
  assert.equal(key, "detail");
  assert.equal(child, "translateKnownDesktopString(detail)");
  assert.ok(
    component.includes("translateKnownDesktopString(state.message)") === false,
    "state.message 不应在 details 构造处翻译",
  );

  // 真实 DesktopSnapShot.ts 的权限提示（基线源码里的 message 原文）。
  const message = "Allow Screen Recording in System Settings, then restart T3 Code.";
  const zh = MAIN_DICT.messages[message];
  assert.ok(zh, `${message} 没有精确词条`);

  const restoreZh = installRuntime("zh-CN");
  try {
    const detailsFor = detailsEvaluator((text) => translateKnownDesktopString(text));
    // error 为 null：正常权限提示，details 是英文原值，只有正文是中文。
    const normal = detailsFor(null, message);
    assert.deepEqual(normal, [message]);
    const renderKey = new Function("detail", `return (${key});`)(normal[0]);
    const renderChild = new Function("detail", "translateKnownDesktopString", `return (${child});`)(
      normal[0],
      translateKnownDesktopString,
    );
    assert.equal(renderKey, message, "React key 必须是英文原值");
    assert.equal(renderChild, zh, "正文必须是中文");
    // error 与 state.message 相同时，英文原值去重后只保留一条。
    assert.deepEqual(detailsFor(message, message), [message]);
    // 名单外的文字作 detail：正文原样返回，key 仍是原值。
    const outside = "Failed to resolve canonical asset path.";
    const outsideDetails = detailsFor(null, outside);
    assert.deepEqual(outsideDetails, [outside]);
    assert.equal(
      new Function("detail", "translateKnownDesktopString", `return (${child});`)(
        outsideDetails[0],
        translateKnownDesktopString,
      ),
      outside,
    );
  } finally {
    restoreZh();
  }

  const restoreEn = installRuntime("en");
  try {
    const detailsFor = detailsEvaluator((text) => translateKnownDesktopString(text));
    const normal = detailsFor(null, message);
    assert.deepEqual(normal, [message]);
    assert.equal(
      new Function("detail", "translateKnownDesktopString", `return (${child});`)(
        normal[0],
        translateKnownDesktopString,
      ),
      message,
      "en 模式下全部原样",
    );
    assert.deepEqual(detailsFor(message, message), [message]);
    const outside = "Failed to resolve canonical asset path.";
    assert.deepEqual(detailsFor(null, outside), [outside]);
  } finally {
    restoreEn();
  }
});
