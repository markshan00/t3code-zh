/**
 * t3code-zh 转换边界判定（CONVENTIONS §4）。
 *
 * 判定逻辑只写在这里一份：构建插件（plugin/vite-plugin-t3zh.ts）和覆盖率报告
 * （scripts/report.ts，T04）都调用本文件的 `prescan` / `scanModule`，别处不得另写判定。
 *
 * 用法（插件和报告应保持一致）：
 *   const ctx = createScanContext({ root: "<monorepo 根>" });   // 含全仓库预扫描、放行表、词库
 *   const { candidates } = scanModule(code, absFile, ctx);
 *
 * 每个候选项的 decision：
 *   translate  ——包成 `__t3zh_t(...)`（edit 给出改法）
 *   skip       ——不动（reason 说明原因，如 mixed-jsx、console、no-letters）
 *   suspicious ——默认不动，等人工确认；key 加进 dict/allow-suspicious.json 后改为 translate（allow-listed）
 *
 * 只用可擦除的 TS 语法（Node 直接运行）。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import babelParser from "@babel/parser";
import babelTypes from "@babel/types";
import { createTranslator, type T3zhDict, type Translator } from "../runtime/t3zh-runtime.ts";

// ---------------------------------------------------------------------------
// 常量与白名单（最终内容写进 handoff/T03.md）
// ---------------------------------------------------------------------------

export const RUNTIME_MODULE_ID = "virtual:t3zh-runtime";
export const RUNTIME_FN = "__t3zh_t";
export const SKIP_MARKER = "t3zh-skip";

/** t3code-zh 仓库根目录（本文件在 plugin/ 下）。 */
export const ZH_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** B 类：§4 规定的 JSX 属性白名单。值即使和值用途字面量相同也照常转换（只用于显示）。 */
export const B_ATTRIBUTES_BASE: readonly string[] = [
  "placeholder",
  "title",
  "aria-label",
  "aria-description",
  "aria-placeholder",
  "alt",
  "label",
  "description",
  "tooltip",
];

/** C 类：§4 规定的对象字面量键名白名单。值和值用途字面量相同时记 suspicious。 */
export const C_KEYS_BASE: readonly string[] = [
  "label",
  "description",
  "title",
  "placeholder",
  "tooltip",
  "emptyText",
  "confirmLabel",
  "cancelLabel",
];

/**
 * T03 调研后扩充的显示文字名（同时用于 JSX 属性和对象键）。逐个核对过上游用法，只收纯显示用途。
 * 扩充项一律按 C 类口径做可疑判定：和值用途字面量相同就记 suspicious，不转换。
 * 作 JSX 属性时类别记 B，作对象键或解构默认值时类别记 C。
 */
export const DISPLAY_NAMES_EXT: readonly string[] = [
  // ARIA 显示文字
  "aria-roledescription",
  "aria-valuetext",
  // 组件自定义的 aria/提示类 prop
  "ariaLabel",
  "accessibleLabel",
  "accessibilityLabel",
  "triggerAriaLabel",
  "tooltipText",
  "revealTooltip",
  "hideTooltip",
  // 各类按钮、标签、状态文字
  "actionLabel",
  "buttonLabel",
  "buttonText",
  "continueLabel",
  "copiedLabel",
  "copyLabel",
  "currentLabel",
  "dismissLabel",
  "emptyLabel",
  "errorLabel",
  "escapeLabel",
  "expandLabel",
  "fixCheckLabel",
  "fixFindingLabel",
  "fixLabel",
  "footerActionLabel",
  "kindLabel",
  "linkLabel",
  "noMatchLabel",
  "pendingLabel",
  "rightPanelUnavailableLabel",
  "searchLabel",
  "serverLabel",
  "shortLabel",
  "statusLabel",
  "submitLabel",
  "terminalLabel",
  "triggerLabel",
  "truncatedLabel",
  // 标题、说明类
  "caption",
  "disabledReason",
  "emptyStateMessage",
  "eyebrow",
  "failureTitle",
  "headline",
  "hint",
  "subtitle",
  "successTitle",
  "summary",
  "detail",
  // toast/通知动作按钮 `{ children: "Open thread", onClick }`
  "children",
];

/**
 * D 类：白名单函数的字符串参数。callee 写法：
 *   "setError"           —— 直接调用该标识符
 *   "*.setError"         —— 任意对象上的同名方法（a.setError、x.y.setError）
 *   "window.confirm"     —— 完整路径精确匹配
 * 可疑判定口径同 C 类。
 */
export interface DFunctionSpec {
  callee: string;
  args: readonly number[];
  note: string;
}
export const D_FUNCTIONS: readonly DFunctionSpec[] = [
  { callee: "window.confirm", args: [0], note: "浏览器原生确认框文字" },
  { callee: "*.dialogs.confirm", args: [0], note: "桌面端/本地 API 确认框文字（api.dialogs.confirm 等）" },
  { callee: "requestConfirmDialog", args: [0], note: "应用内确认框文字" },
  { callee: "setError", args: [0], note: "组件内错误提示 state" },
  { callee: "*.setError", args: [0], note: "控制器上的错误提示（voice-input 等）" },
  { callee: "setThreadError", args: [1], note: "线程错误提示（本地 state）" },
  { callee: "setValidationError", args: [0], note: "表单校验提示" },
  { callee: "setMessage", args: [0], note: "配对页提示文字" },
  { callee: "setPermissionMessage", args: [0], note: "通知权限提示" },
  { callee: "setOpenLogsDirectoryError", args: [0], note: "诊断页错误提示" },
  { callee: "setProfileRemovalError", args: [0], note: "集成设置错误提示" },
  { callee: "reportFailure", args: [0], note: "失败 toast 标题" },
  { callee: "failureToast", args: [0], note: "失败 toast 标题" },
  { callee: "captureSettingsError", args: [0], note: "截图设置失败 toast 标题" },
];

/** §4「从不转换」的属性。白名单不得包含它们（下方自检）。 */
export const NEVER_ATTRIBUTES: readonly string[] = [
  "className",
  "class",
  "style",
  "id",
  "key",
  "href",
  "src",
  "type",
  "role",
  "name",
  "value",
  "for",
  "htmlFor",
  "target",
  "rel",
];

/**
 * 参数里的对象/字符串是配置或调试标签、不是界面文字的调用（T03 调研补充，reason=non-display-call）：
 * - 样式工具：cva/cn/clsx/twMerge 的参数是 className；
 * - atom/RPC 基础设施：label 只用于日志（reportAtomCommandResult 默认 reporter 是 console）和 Atom.withLabel 调试名。
 */
export const NON_DISPLAY_CALLEES: readonly string[] = [
  "cva",
  "cn",
  "clsx",
  "twMerge",
  "useAtomCommand",
  "executeAtomQuery",
  "runAtomCommand",
  "reportAtomCommandResult",
  "createRuntimeCommand",
  "createEnvironmentCommand",
  "createEnvironmentRpcCommand",
  "createEnvironmentQueryAtomFamily",
  "createEnvironmentRpcQueryAtomFamily",
  "createEnvironmentSubscriptionAtomFamily",
  "createEnvironmentRpcSubscriptionAtomFamily",
  "*.withLabel",
];

/**
 * 发给服务端的命令输入（`{ environmentId, input: { title } }`）是数据，不是界面文字（reason=rpc-input）。
 * 例：ChatView 分支线程时的 `input.title`，翻译后会把中文标题写进服务端数据。
 */
export const DATA_PAYLOAD_KEYS: readonly string[] = ["input"];

/**
 * E2（§4 位置扩充，2026-10-05 定案）：赋给名字以这些结尾的变量的对象字面量，其所有字符串值按 C 类处理。区分大小写。
 * 例：SETTINGS_SECTION_LABELS、WORKTREE_SUBMODULES_LABELS、summaryLabels、accessCopy。
 */
export const LABEL_MAP_VARIABLE = /(LABEL|LABELS|_TITLE|_TITLES|Labels|Copy)$/;

/**
 * E3（§4 位置扩充，2026-10-05 定案）：名字以 Label/Title/Text/Description/Message 结尾、或以 format/describe 开头的函数，
 * 其 return 的字符串或模板字面量按 C 类处理。例：resolveEnvModeLabel、formatRelativeTime、describeModelCapabilities。
 */
export const LABEL_FUNCTION_NAME = /(Label|Title|Text|Description|Message)$|^(format|describe)/;

/**
 * E3 的例外：名字符合 LABEL_FUNCTION_NAME、但返回值是数据而不是界面文字的函数（T03 逐个核对上游用法后列出，
 * reason=data-function，不转换）。翻译它们会改掉发给 AI 的提示词、CSS 值或编辑器内容。
 */
export const E3_DATA_FUNCTIONS: readonly { name: string; note: string }[] = [
  { name: "formatComposerContextProviderMarker", note: "packages/shared composerContextReferences：发给 AI 的提示词里的上下文标记 [kind: label; ref=…]" },
  { name: "formatComposerContextProviderPayload", note: "同上：提示词里的上下文正文（path: / name: …）" },
  { name: "formatEnvelopeEntry", note: "同上：提示词里的 <context_entry …> 信封" },
  { name: "formatDiffReviewRangeLabel", note: "apps/web reviewCommentContext：生成的 rangeLabel 会被序列化进提示词（range: … / rangeLabel=\"…\"）" },
  { name: "formatOklchThemeColor", note: "apps/web themePalette：返回 CSS 颜色值 oklch(…)" },
  { name: "nextMarkerText", note: "apps/web composer-list-continuation：插入编辑器的 Markdown 列表标记" },
  { name: "formatClaudeResumeCompactionQuestion", note: "packages/shared claudeCompaction：压缩提问双端约定（服务端生成、web 端正则识别）；当前 web 不生成，预防性排除（Kimi 设计评审第 5 节）" },
];
const E3_DATA_FUNCTION_SET = new Set(E3_DATA_FUNCTIONS.map((entry) => entry.name));

const B_BASE_SET = new Set(B_ATTRIBUTES_BASE);
const C_BASE_SET = new Set(C_KEYS_BASE);
const EXT_SET = new Set(DISPLAY_NAMES_EXT);
/** C 类白名单（§4 原始 + T03 扩充），E1 用。 */
const C_KEY_SET = new Set([...C_KEYS_BASE, ...DISPLAY_NAMES_EXT]);
for (const name of [...B_ATTRIBUTES_BASE, ...C_KEYS_BASE, ...DISPLAY_NAMES_EXT]) {
  if (NEVER_ATTRIBUTES.includes(name) || name.startsWith("data-")) {
    throw new Error(`t3zh matcher: whitelist contains never-translate name ${name}`);
  }
}

// ---------------------------------------------------------------------------
// 类型
// ---------------------------------------------------------------------------

export type Category = "A" | "B" | "C" | "D";
export type Decision = "translate" | "skip" | "suspicious";

export type Edit =
  /** 在 [start, end) 两侧插入 `__t3zh_t(` 和 `)`。 */
  | { type: "wrap"; start: number; end: number }
  /** 把 [start, end) 整段替换成 code（JSX 文本、JSX 属性字符串用）。 */
  | { type: "replace"; start: number; end: number; code: string };

export interface Candidate {
  /** 传给 scanModule 的文件名。 */
  file: string;
  /** 文字所在行（1 起）、列（0 起）。JSX 文本取第一个非空白字符的位置。 */
  line: number;
  column: number;
  /** 被包裹/替换的源码区间。 */
  start: number;
  end: number;
  /** 运行时实际收到的文本：JSX 文本是折叠空白后的渲染文本；模板字面量是把表达式换成 {0}{1}… 的形式。 */
  text: string;
  /** 词库 key：text 去首尾空白。 */
  key: string;
  kind: "message" | "template";
  category: Category;
  decision: Decision;
  /**
   * 原因代码。
   * translate：jsx-text、jsx-text-fragment、jsx-expression、attribute、property、destructuring-default、call-arg、
   *            as-const-property（E1）、label-map（E2）、label-function-return（E3）、allow-listed
   * skip：skip-comment、brand-name、data-function（E3 例外）、rpc-input、mixed-jsx、no-letters、identifier-like，
   *       以及受保护位置（ProtectedReason，见 protectedContext）：condition、comparison、switch-case、computed-key、enum、
   *       ts-type、never-attribute、console、error-constructor、non-display-call、regex、throw、tagged-template、as-const
   * suspicious：value-use、template-collision
   */
  reason: string;
  /** 属性名 / 键名 / 函数名（JSX 文本是父元素名）。 */
  context: string;
  /** 所在组件或函数名（找不到时为空串）。 */
  component: string;
  /** text/key 和值用途字面量相同（A、B 类照常转换，但报告要列出）。 */
  valueUse: boolean;
  /** suspicious 且 reason=template-collision 时，命中的模板 key。 */
  collidingTemplate?: string;
  /** 由 §4 位置扩充 E1/E2/E3 产生的候选项（不论最终决定），便于统计各规则的影响。 */
  rule?: "E1" | "E2" | "E3";
  /** decision=translate 时的改法。 */
  edit?: Edit;
}

export interface ScanResult {
  file: string;
  candidates: Candidate[];
  /** 注入 import 的位置：指令序言（"use ..."）之后，否则文件开头。 */
  importInsertPos: number;
  /** 在 importInsertPos 插入的文字（不含换行，不改变行号；只有 hashbang 文件会多一行）。 */
  importCode: string;
}

/** §4「从不转换」的位置（protectedContext 的返回值）。整个子树禁转，子树里的字符串在预扫描里都记为值用途。 */
export type ProtectedReason =
  | "condition"
  | "comparison"
  | "switch-case"
  | "computed-key"
  | "enum"
  | "ts-type"
  | "never-attribute"
  | "console"
  | "error-constructor"
  | "non-display-call"
  | "regex"
  | "constructor-call"
  | "throw"
  | "tagged-template"
  | "as-const";

/** 值用途的来源：受保护位置（同 ProtectedReason），或预扫描额外收集的位置。 */
export type ValueUseKind =
  | ProtectedReason
  | "object-key"
  | "schema-literal"
  | "membership"
  | "in-operator"
  | "key-argument"
  | "string-method";

export interface ValueUseLocation {
  file: string;
  line: number;
  kind: ValueUseKind;
}

export interface ValueUseInfo {
  count: number;
  /** 最多保留 VALUE_USE_LOCATION_LIMIT 个位置。 */
  locations: ValueUseLocation[];
}

export const VALUE_USE_LOCATION_LIMIT = 10;

export interface PrescanResult {
  valueUse: Map<string, ValueUseInfo>;
  fileCount: number;
  errors: Array<{ file: string; message: string }>;
}

export interface ScanContext {
  /** 值用途字面量（prescan 结果）。 */
  valueUse: ReadonlyMap<string, ValueUseInfo> | ReadonlySet<string>;
  /** dict/allow-suspicious.json 的放行 key。 */
  allowSuspicious: ReadonlySet<string>;
  /**
   * 词库（可选）。提供时，对静态文本做「模板误配」检查：不在 messages 里、却会被某条模板匹配的静态文本
   * 记为 suspicious（template-collision），避免运行时把它改成半中半英。构建和报告都应提供。
   */
  dict?: T3zhDict;
}

// ---------------------------------------------------------------------------
// 文件范围
// ---------------------------------------------------------------------------

const EXCLUDE_PATTERNS: readonly RegExp[] = [
  /(^|\/)node_modules\//,
  /(^|\/)__tests__\//,
  /\.test\.[^/]+$/,
  /\.spec\.[^/]+$/,
  /\.stories\.[^/]+$/,
  /\.bench\.[^/]+$/,
  /\.d\.ts$/,
];

function toPosix(p: string): string {
  return p.split(path.sep).join("/");
}

function isExcluded(rel: string): boolean {
  return EXCLUDE_PATTERNS.some((pattern) => pattern.test(rel));
}

/**
 * §4 处理范围：`apps/web/src/**\/*.{ts,tsx}` 和 `packages/*\/src/**\/*.{ts,tsx}`，
 * 排除测试、stories、bench、声明文件和 node_modules。rel 是相对 monorepo 根的路径。
 * （插件只会遇到 web 构建模块图里的文件，所以 packages 实际只包含被 web 引入的。）
 */
export function isInScope(rel: string): boolean {
  const p = toPosix(rel);
  if (!/^(apps\/web\/src\/|packages\/[^/]+\/src\/).+\.(ts|tsx)$/.test(p)) return false;
  return !isExcluded(p);
}

function walkFiles(dir: string, accept: (file: string) => boolean, out: string[]): void {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === "dist" || entry.name === "dist-electron") continue;
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, accept, out);
    else if (entry.isFile() && accept(full)) out.push(full);
  }
}

function readJson(file: string): any {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

/** web 依赖的 workspace 包（传递闭包）的目录名，例如 ["client-runtime","contracts","shared"]。 */
export function listWebWorkspacePackages(root: string): string[] {
  const byName = new Map<string, { dir: string; deps: string[] }>();
  const packagesDir = path.join(root, "packages");
  for (const dir of fs.existsSync(packagesDir) ? fs.readdirSync(packagesDir) : []) {
    const pkgFile = path.join(packagesDir, dir, "package.json");
    if (!fs.existsSync(pkgFile)) continue;
    const pkg = readJson(pkgFile);
    const deps = Object.entries({ ...pkg.dependencies, ...pkg.peerDependencies })
      .filter(([, version]) => typeof version === "string" && version.startsWith("workspace:"))
      .map(([name]) => name);
    byName.set(pkg.name, { dir, deps });
  }
  const web = readJson(path.join(root, "apps/web/package.json"));
  const queue = Object.entries({ ...web.dependencies, ...web.devDependencies })
    .filter(([, version]) => typeof version === "string" && version.startsWith("workspace:"))
    .map(([name]) => name);
  const seen = new Set<string>();
  while (queue.length > 0) {
    const name = queue.shift() as string;
    if (seen.has(name)) continue;
    seen.add(name);
    const info = byName.get(name);
    if (info) queue.push(...info.deps);
  }
  return [...seen]
    .map((name) => byName.get(name)?.dir)
    .filter((dir): dir is string => typeof dir === "string")
    .sort();
}

/** 按文件系统列出 §4 范围内的文件（apps/web/src + web 依赖的 packages/*\/src），绝对路径、排序。 */
export function listScopeFiles(root: string): string[] {
  const out: string[] = [];
  const dirs = ["apps/web/src", ...listWebWorkspacePackages(root).map((dir) => `packages/${dir}/src`)];
  for (const dir of dirs) {
    walkFiles(path.join(root, dir), (file) => isInScope(path.relative(root, file)), out);
  }
  return out.sort();
}

/** 预扫描参与的应用：web 本身，以及和 web 交换数据、可能比较这些字符串的 server、desktop。 */
export const PRESCAN_APPS: readonly string[] = ["web", "server", "desktop"];

/**
 * 「全仓库预扫描」的文件：apps/{web,server,desktop}/src 和全部 packages/*\/src 下的
 * .ts/.tsx/.mts/.cts，排除测试、stories、bench、声明文件。
 * 不含 apps/mobile、apps/marketing（独立产品，运行时不和 web 共享值）和构建脚本。
 */
/** 预扫描额外排除的测试辅助代码（不是运行时逻辑；其中的比较会把界面文字误判成值用途）。 */
const PRESCAN_EXCLUDE_PATTERNS: readonly RegExp[] = [/(^|\/)testkit\//, /\.testkit\.[^/]+$/, /(^|\/)fixtures\//, /(^|\/)testUtils\//, /(^|\/)testing\//];

export function listPrescanFiles(root: string): string[] {
  const out: string[] = [];
  const accept = (file: string) => {
    const rel = toPosix(path.relative(root, file));
    return /\.(ts|tsx|mts|cts)$/.test(rel) && !isExcluded(rel) && !PRESCAN_EXCLUDE_PATTERNS.some((pattern) => pattern.test(rel));
  };
  for (const app of PRESCAN_APPS) walkFiles(path.join(root, "apps", app, "src"), accept, out);
  const packagesDir = path.join(root, "packages");
  for (const dir of fs.existsSync(packagesDir) ? fs.readdirSync(packagesDir).sort() : []) {
    walkFiles(path.join(packagesDir, dir, "src"), accept, out);
  }
  return out.sort();
}

// ---------------------------------------------------------------------------
// 解析与遍历
// ---------------------------------------------------------------------------

type Node = any;

const VISITOR_KEYS: Record<string, readonly string[]> = babelTypes.VISITOR_KEYS;

/** .tsx 用 typescript+jsx；.ts/.mts/.cts 只用 typescript（TS 本身就是按扩展名区分，`<T>x` 断言只在 .ts 合法）。 */
export function parseModule(code: string, filename: string): Node {
  const jsx = /\.(tsx|jsx)$/.test(filename.replace(/[?#].*$/, ""));
  return babelParser.parse(code, {
    sourceType: "module",
    plugins: jsx ? ["typescript", "jsx"] : ["typescript"],
    errorRecovery: false,
  });
}

function isNode(value: unknown): value is Node {
  return typeof value === "object" && value !== null && typeof (value as Node).type === "string";
}

/** 深度优先遍历，visit 收到从根到当前节点的节点栈和键栈（keys[i] 是 nodes[i] 在父节点里的字段名）。 */
function traverse(root: Node, visit: (nodes: Node[], keys: string[]) => void): void {
  const nodes: Node[] = [];
  const keys: string[] = [];
  const walk = (node: Node, key: string) => {
    nodes.push(node);
    keys.push(key);
    visit(nodes, keys);
    for (const childKey of VISITOR_KEYS[node.type] ?? []) {
      const child = node[childKey];
      if (Array.isArray(child)) {
        for (const item of child) if (isNode(item)) walk(item, childKey);
      } else if (isNode(child)) {
        walk(child, childKey);
      }
    }
    nodes.pop();
    keys.pop();
  };
  walk(root, "");
}

const FUNCTION_TYPES = new Set([
  "FunctionDeclaration",
  "FunctionExpression",
  "ArrowFunctionExpression",
  "ObjectMethod",
  "ClassMethod",
  "ClassPrivateMethod",
]);

const COMPARISON_OPERATORS = new Set(["===", "!==", "==", "!="]);

const TS_WRAPPERS = new Set([
  "TSAsExpression",
  "TSSatisfiesExpression",
  "TSNonNullExpression",
  "TSTypeAssertion",
  "ParenthesizedExpression",
]);

/** 值容器：从对象属性往外找 `as const` 时可以穿过的节点。 */
const VALUE_CONTAINERS = new Set([
  "ObjectExpression",
  "ObjectProperty",
  "ArrayExpression",
  "SpreadElement",
  "ConditionalExpression",
  "LogicalExpression",
  "SequenceExpression",
  ...TS_WRAPPERS,
]);

function isAsConst(node: Node): boolean {
  if (node?.type !== "TSAsExpression" && node?.type !== "TSTypeAssertion") return false;
  const annotation = node.typeAnnotation;
  return (
    annotation?.type === "TSTypeReference" &&
    annotation.typeName?.type === "Identifier" &&
    annotation.typeName.name === "const"
  );
}

function hasSkipComment(node: Node): boolean {
  const comments = node?.leadingComments;
  return Array.isArray(comments) && comments.some((comment: Node) => String(comment.value).includes(SKIP_MARKER));
}

function isSkipCommentContainer(node: Node): boolean {
  if (node?.type !== "JSXExpressionContainer" || node.expression?.type !== "JSXEmptyExpression") return false;
  const comments = node.expression.innerComments;
  return Array.isArray(comments) && comments.some((comment: Node) => String(comment.value).includes(SKIP_MARKER));
}

function propertyKeyName(node: Node): string | null {
  if (node.computed) return null;
  const key = node.key;
  if (key?.type === "Identifier") return key.name;
  if (key?.type === "StringLiteral") return key.value;
  return null;
}

/** 运行时没有影响的包装：TS 断言（as、satisfies、`<T>x`、`!`）、括号、实例化表达式 `f<T>`。解析调用对象时一律解开。 */
const CALLEE_WRAPPERS = new Set([...TS_WRAPPERS, "TSInstantiationExpression"]);

/** 调用路径前面可以出现的全局对象：globalThis.console.log、window.RegExp、self.Error 与不带前缀的写法相同。 */
const GLOBAL_OBJECTS = new Set(["globalThis", "window", "self", "global"]);

/**
 * 表达式所有可能的结果（CONVENTIONS §4「受保护的语法形式」）：解开括号和 TS 包装；逗号表达式取末项；
 * 条件表达式取两个分支；`&&`/`||`/`??` 两侧都算（保守：任一侧都可能是结果）；`a = b` 取 b。
 */
function resultBranches(expr: Node, out: Node[] = []): Node[] {
  while (expr && CALLEE_WRAPPERS.has(expr.type)) expr = expr.expression;
  if (!expr) return out;
  switch (expr.type) {
    case "SequenceExpression":
      return resultBranches(expr.expressions[expr.expressions.length - 1], out);
    case "ConditionalExpression":
      resultBranches(expr.consequent, out);
      return resultBranches(expr.alternate, out);
    case "LogicalExpression":
      resultBranches(expr.left, out);
      return resultBranches(expr.right, out);
    case "AssignmentExpression":
      if (expr.operator === "=") return resultBranches(expr.right, out);
      break;
  }
  out.push(expr);
  return out;
}

/** 成员表达式可能的属性名：a.b → b；a["b"]、a[`b`]、a["b" as const]、a[f ? "b" : "c"] → 各个静态名；动态部分记 *。 */
function memberNames(node: Node): string[] {
  if (!node.computed) return [node.property?.type === "Identifier" ? node.property.name : "*"];
  return resultBranches(node.property).map((branch) => {
    if (branch.type === "StringLiteral") return branch.value;
    if (branch.type === "TemplateLiteral" && branch.expressions.length === 0) return branch.quasis[0]?.value.cooked ?? "*";
    return "*";
  });
}

/** 函数对象上不改变"调用的是哪个函数"的方法：X.call/X.apply 调用 X，X.bind(…) 得到绑定了 X 的函数。 */
const INVOKE_METHODS = new Set(["call", "apply", "bind"]);

/**
 * 调用对象解析的小模型（CONVENTIONS §4「受保护的语法形式」）。表达式的每个可能结果是以下之一：
 * - path：静态路径（标识符、this、成员访问、静态计算成员），可能是函数，也可能是对象；
 * - bound：`X.bind(…)` 的结果，确定调用 targets 里的函数，bound 是预先绑定的参数个数（对不上时为 unknown）；
 * - method：函数值上的 call/apply/bind 方法本身（X.call、X.bind(…).apply、X.bind.call）；
 * - unknown：其他（一般调用的返回值、字面量……）。
 */
type FnValue =
  | { kind: "path"; segments: string[] }
  | { kind: "bound"; targets: string[][]; bound: number | "unknown" }
  | { kind: "method"; of: FnValue; method: string }
  | { kind: "unknown" };

/** 函数值实际会调用哪些函数、带几个预先绑定的参数。method 值（X.call 当函数用）一律记 unknown。 */
function functionInfo(value: FnValue): { targets: string[][]; bound: number | "unknown" } {
  switch (value.kind) {
    case "path":
      return { targets: [value.segments], bound: 0 };
    case "bound":
      return { targets: value.targets, bound: value.bound };
    case "method":
      return { targets: functionInfo(value.of).targets, bound: "unknown" };
    default:
      return { targets: [["*"]], bound: "unknown" };
  }
}

function targetsOf(values: readonly FnValue[]): string[][] {
  return values.flatMap((value) => functionInfo(value).targets);
}

function hasSpread(args: readonly Node[]): boolean {
  return args.some((arg) => arg?.type === "SpreadElement");
}

/** AST 子节点（跳过位置信息和注释）。 */
function childNodes(node: Node): Node[] {
  const out: Node[] = [];
  for (const [key, value] of Object.entries(node)) {
    if (key === "loc" || key === "start" || key === "end" || key === "extra" || key.endsWith("Comments")) continue;
    if (Array.isArray(value)) for (const item of value) { if (item && typeof item.type === "string") out.push(item); }
    else if (value && typeof (value as Node).type === "string") out.push(value as Node);
  }
  return out;
}

/**
 * 表达式子树里点到名字的全部静态路径（标识符、成员访问）。call/apply/bind 的多层组合无法精确求值时，
 * 保守地认为其中点到的任何函数都可能被调用：不写出受保护目标的名字时，不经过变量别名（§4 已知限制）
 * 或 `*.constructor(...)`（已单独按受保护处理，见 protectedCallReason）就调用不到它。
 */
function mentionedTargets(node: Node): string[][] {
  const out: string[][] = [];
  const visit = (current: Node): void => {
    if (current.type === "Identifier" || current.type === "MemberExpression" || current.type === "OptionalMemberExpression") {
      for (const value of evaluateCallee(current)) if (value.kind === "path") out.push(value.segments);
    }
    for (const child of childNodes(current)) visit(child);
  };
  visit(node);
  return out.length > 0 ? out : [["*"]];
}

/**
 * 表达式所有可能的值（经 resultBranches 展开：括号、TS 包装、逗号末项、条件/逻辑全部分支）。
 * `X.bind(…)` 的调用结果是绑定了 X 的函数（可连续多层，累计已绑定参数）；`X.bind.call(T, …)`、`X.bind.apply(T, […])`
 * 绑定的是 T（也保守地算上 X），参数个数记 unknown；`X.bind.call/apply` 的实参含展开时（接收者静态不可知）以及
 * 更深的 call/apply/bind 组合按 mentionedTargets 保守处理。
 * 普通函数调用的返回值记 unknown（经函数返回的数据流属于 §4 已知限制）。
 */
function evaluateCallee(expr: Node): FnValue[] {
  const out: FnValue[] = [];
  for (const branch of resultBranches(expr)) {
    if (branch.type === "Identifier") out.push({ kind: "path", segments: [branch.name] });
    else if (branch.type === "ThisExpression") out.push({ kind: "path", segments: ["this"] });
    else if (branch.type === "MemberExpression" || branch.type === "OptionalMemberExpression") {
      const names = memberNames(branch);
      for (const object of evaluateCallee(branch.object)) {
        for (const name of names) {
          if (INVOKE_METHODS.has(name)) out.push({ kind: "method", of: object, method: name });
          else if (object.kind === "path") out.push({ kind: "path", segments: [...object.segments, name] });
          // 调用返回值、绑定函数等非路径对象上的成员：对象记 *，继续拼路径（ensureLocalApi().dialogs.confirm → *.dialogs.confirm）。
          else out.push({ kind: "path", segments: ["*", name] });
        }
      }
    } else if (branch.type === "CallExpression" || branch.type === "OptionalCallExpression") {
      const args: Node[] = branch.arguments ?? [];
      for (const callee of evaluateCallee(branch.callee)) {
        if (callee.kind === "method" && callee.method === "bind") {
          // X.bind(thisArg, a, b)：绑定 X，再加上 a、b 两个参数。
          const base = functionInfo(callee.of);
          const extra = hasSpread(args) ? "unknown" : Math.max(0, args.length - 1);
          const bound = base.bound === "unknown" || extra === "unknown" ? "unknown" : base.bound + extra;
          out.push({ kind: "bound", targets: base.targets, bound });
        } else if (callee.kind === "method" && callee.of.kind === "method" && callee.of.method === "bind" && !hasSpread(args)) {
          // X.bind.call(T, …) / X.bind.apply(T, […])：绑定的是 T；保守地连 X 一起算。
          // 实参含展开时接收者静态不可知（String.bind.call(...[RegExp], null) 实际绑定 RegExp），
          // 不落这个专用分支，走下面的通用分支按 mentionedTargets 保守处理。
          const thisArg = args[0];
          const extraTargets = thisArg ? targetsOf(evaluateCallee(thisArg)) : [["*"]];
          out.push({ kind: "bound", targets: [...functionInfo(callee.of.of).targets, ...extraTargets], bound: "unknown" });
        } else if (callee.kind === "method" || callee.kind === "bound") {
          // 其他 call/apply/bind 组合（X.bind.call.call(…)、X.bind.bind(…)()、绑定函数的返回值……）不再精确求值：
          // 返回值保守地当作绑定了子树里点到的任何函数，参数个数记 unknown。
          out.push({ kind: "bound", targets: mentionedTargets(branch), bound: "unknown" });
        } else out.push({ kind: "unknown" });
      }
    } else out.push({ kind: "unknown" });
  }
  return out;
}

/**
 * 一次调用实际可能调用的函数。
 * path：去掉全局对象前缀后的路径（console.log、Error、*.dialogs.confirm——非标识符部分记 *）；raw：原样路径；global：原路径带全局前缀。
 * args：目标函数的参数怎样对应到这次调用的实参：
 *   positional：目标第 i 个参数是 i < bound ? （预先绑定，不在这次调用里） : 实参[offset + i - bound]；
 *   apply：同上，但实参取第二个实参的数组字面量；unknown：对不上（多层 call/bind 组合、展开参数）。
 * 受保护判定不看 args（受保护调用的整个实参子树都受保护）；D 类只在 positional 时按参数位置转换。
 */
type ArgumentMap = { kind: "positional"; offset: number; bound: number } | { kind: "apply"; bound: number } | { kind: "unknown" };

interface CallTarget {
  path: string;
  raw: string;
  global: boolean;
  args: ArgumentMap;
}

function normalizeSegments(segments: readonly string[]): { path: string; global: boolean } {
  let i = 0;
  while (i < segments.length - 1 && GLOBAL_OBJECTS.has(segments[i] as string)) i++;
  return { path: segments.slice(i).join("."), global: i > 0 };
}

function callTarget(segments: readonly string[], args: ArgumentMap): CallTarget {
  return { ...normalizeSegments(segments), raw: segments.join("."), args };
}

const UNKNOWN_ARGS: ArgumentMap = { kind: "unknown" };

/**
 * 调用对象的统一解析（CONVENTIONS §4「受保护的语法形式」，protectedContext、D 类匹配、预扫描都只用它）：
 * 标识符、成员访问、静态计算成员、可选链；括号、as、satisfies、`<T>x`、`!`；逗号表达式取末项；条件和 `&&`/`||`/`??` 取全部分支；
 * `X.call(…)`、`X.apply(…)`、`X.bind(…)`、`X.bind(…)(…)` 及其任意多层组合都算调用 X；globalThis./window./self. 前缀去掉后比较。
 * 返回全部可能的目标；无法静态确定的部分（`console[method]` 的 method、函数返回值）记 *。
 * args 是这次调用的实参（`X.call.call(T, …)` 这类组合要用第一个实参判断实际目标）。
 */
function calleeTargets(callee: Node, args: readonly Node[] = []): CallTarget[] {
  const targets = resolveCalleeTargets(callee, args);
  // 实参里有展开（...xs）时，展开贡献几个参数静态不可知，参数位置一律对不上：D 类不转，预扫描收集全部实参。
  if (hasSpread(args)) return targets.map((target) => ({ ...target, args: UNKNOWN_ARGS }));
  return targets;
}

function resolveCalleeTargets(callee: Node, args: readonly Node[]): CallTarget[] {
  const targets: CallTarget[] = [];
  for (const value of evaluateCallee(callee)) {
    if (value.kind === "path") {
      targets.push(callTarget(value.segments, { kind: "positional", offset: 0, bound: 0 }));
    } else if (value.kind === "bound") {
      const map: ArgumentMap = value.bound === "unknown" ? UNKNOWN_ARGS : { kind: "positional", offset: 0, bound: value.bound };
      for (const target of value.targets) targets.push(callTarget(target, map));
    } else if (value.kind === "method") {
      if (value.of.kind === "method") {
        // X.call.call(T, …)、X.apply.call(T, …)、X.bind.call(T, …)……：实际调用的是 T 上的方法；保守地连 X 一起算，参数对不上。
        const extra = args.flatMap((arg) => (arg ? mentionedTargets(arg) : []));
        for (const target of [...functionInfo(value.of.of).targets, ...mentionedTargets(callee), ...extra]) targets.push(callTarget(target, UNKNOWN_ARGS));
        continue;
      }
      const info = functionInfo(value.of);
      let map: ArgumentMap;
      if (info.bound === "unknown") map = UNKNOWN_ARGS;
      else if (value.method === "apply") {
        // apply 的参数数组内部有展开（m.set.apply(m, [...xs, key])）时元素下标静态不可知：
        // 参数映射记 unknown，D 类不转，预扫描经 allArgumentNodes 收全部实参（含数组元素和展开的表达式）。
        const arrayArg = args[1];
        map =
          arrayArg?.type === "ArrayExpression" && arrayArg.elements.some((element) => element?.type === "SpreadElement")
            ? UNKNOWN_ARGS
            : { kind: "apply", bound: info.bound };
      }
      // X.call(thisArg, …) 和 X.bind(thisArg, …)：第一个实参是 this，之后依次是目标的参数。
      else map = { kind: "positional", offset: 1, bound: info.bound };
      for (const target of info.targets) targets.push(callTarget(target, map));
    } else {
      targets.push(callTarget(["*"], { kind: "positional", offset: 0, bound: 0 }));
    }
  }
  return targets;
}

/** 调用节点的全部可能目标。 */
function callTargetsOf(node: Node): CallTarget[] {
  return calleeTargets(node.callee, node.arguments ?? []);
}

/** 目标函数的参数（下标 i 是目标的第 i 个参数；预先绑定、对不上的位置为 undefined）。unknown 时返回空数组。 */
function targetArguments(node: Node, target: CallTarget): Array<Node | undefined> {
  const args: Node[] = node.arguments ?? [];
  const map = target.args;
  if (map.kind === "unknown") return [];
  const leading = new Array<undefined>(map.bound).fill(undefined);
  if (map.kind === "apply") return [...leading, ...(args[1]?.type === "ArrayExpression" ? args[1].elements : [])];
  return [...leading, ...args.slice(map.offset)];
}

/** 参数对不上时，预扫描保守地看这次调用的全部实参（含 apply 数组里的元素）。 */
function allArgumentNodes(node: Node): Node[] {
  const out: Node[] = [];
  const add = (arg: Node | null | undefined): void => {
    if (!arg) return;
    // ...xs 展开：收集展开的表达式本身（数组字面量时连同其元素）。
    if (arg.type === "SpreadElement") return add(arg.argument);
    if (arg.type === "ArrayExpression") for (const element of arg.elements) add(element);
    out.push(arg);
  };
  for (const arg of node.arguments ?? []) add(arg);
  return out;
}

/** 名单写法（"setError"、"*.setError"、"window.confirm"）是否匹配目标。名单带全局前缀时，目标也必须带（裸 confirm 可能是局部函数）。 */
function calleeMatches(pattern: string, target: CallTarget): boolean {
  const wanted = normalizeSegments(pattern.split("."));
  if (wanted.global && !target.global) return false;
  if (wanted.path.startsWith("*.")) return target.path.endsWith(wanted.path.slice(1)) && target.path.length > wanted.path.length - 1;
  return target.path === wanted.path;
}

function lastSegment(calleePathValue: string): string {
  const index = calleePathValue.lastIndexOf(".");
  return index === -1 ? calleePathValue : calleePathValue.slice(index + 1);
}

const LETTER = /\p{L}/u;

/**
 * JSX 文本的实际渲染文本（React/Babel `cleanJSXElementLiteralChild` 规则，oxc 相同；
 * plugin/__tests__ 里有对上游全部 JSX 文本与 oxc 编译结果逐条比对的测试）：
 * 按行切分；制表符换成空格；非首行去行首空格，非末行去行尾空格；丢弃空行；行间用一个空格连接。
 */
export function cleanJsxText(value: string): string {
  const lines = value.split(/\r\n|\n|\r/);
  let lastNonEmptyLine = 0;
  for (let i = 0; i < lines.length; i++) {
    if (/[^ \t]/.test(lines[i] as string)) lastNonEmptyLine = i;
  }
  let result = "";
  for (let i = 0; i < lines.length; i++) {
    let line = (lines[i] as string).replace(/\t/g, " ");
    if (i !== 0) line = line.replace(/^[ ]+/, "");
    if (i !== lines.length - 1) line = line.replace(/[ ]+$/, "");
    if (line) {
      if (i !== lastNonEmptyLine) line += " ";
      result += line;
    }
  }
  return result;
}

function countLineBreaks(text: string): number {
  return (text.match(/\r\n|\n|\r/g) ?? []).length;
}

/** 模板字面量的建议 key：表达式依次换成 {0}、{1}…。 */
export function templateLiteralKey(node: Node): string {
  let out = "";
  node.quasis.forEach((quasi: Node, index: number) => {
    out += quasi.value.cooked ?? quasi.value.raw;
    if (index < node.expressions.length) out += `{${index}}`;
  });
  return out;
}

interface Leaf {
  node: Node;
  /** 从「值位置」到叶子之间经过的包装节点（条件、逻辑、TS 断言）。 */
  via: Node[];
}

/**
 * 「结果位置」上的字符串叶子：表达式本身是字符串/模板字面量；
 * 或经过条件表达式的两个分支、`&&` 的右侧、`||`/`??` 的两侧、TS 断言、括号、逗号表达式的最后一项。
 */
function collectLeaves(expr: Node, via: Node[] = []): Leaf[] {
  if (!expr) return [];
  switch (expr.type) {
    case "StringLiteral":
    case "TemplateLiteral":
      return [{ node: expr, via }];
    case "ConditionalExpression":
      return [...collectLeaves(expr.consequent, [...via, expr]), ...collectLeaves(expr.alternate, [...via, expr])];
    case "LogicalExpression":
      return expr.operator === "&&"
        ? collectLeaves(expr.right, [...via, expr])
        : [...collectLeaves(expr.left, [...via, expr]), ...collectLeaves(expr.right, [...via, expr])];
    case "SequenceExpression":
      return collectLeaves(expr.expressions[expr.expressions.length - 1], [...via, expr]);
    default:
      if (TS_WRAPPERS.has(expr.type)) return collectLeaves(expr.expression, [...via, expr]);
      return [];
  }
}

function leafText(node: Node): { text: string; kind: "message" | "template" } {
  if (node.type === "StringLiteral") return { text: node.value, kind: "message" };
  if (node.expressions.length === 0) {
    const quasi = node.quasis[0];
    return { text: quasi ? (quasi.value.cooked ?? quasi.value.raw) : "", kind: "message" };
  }
  return { text: templateLiteralKey(node), kind: "template" };
}

/** 去掉模板 key 里的占位符后是否还有字母。 */
function hasLetters(text: string, kind: "message" | "template"): boolean {
  return LETTER.test(kind === "template" ? text.replace(/\{\d+\}/g, "") : text);
}

function jsxElementName(node: Node): string {
  const name = node?.openingElement?.name;
  if (!name) return "<>";
  if (name.type === "JSXIdentifier") return name.name;
  if (name.type === "JSXMemberExpression") return `${jsxElementName({ openingElement: { name: name.object } })}.${name.property.name}`;
  if (name.type === "JSXNamespacedName") return `${name.namespace.name}:${name.name.name}`;
  return "?";
}

/** 最近的具名函数/组件。 */
function enclosingName(nodes: Node[]): string {
  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i];
    if (node.type === "FunctionDeclaration" || node.type === "ClassDeclaration") {
      if (node.id?.name) return node.id.name;
    }
    if (node.type === "ClassMethod" || node.type === "ObjectMethod") {
      const name = propertyKeyName(node);
      if (name) return name;
    }
    if (node.type === "VariableDeclarator" && node.id?.type === "Identifier") {
      const init = node.init;
      if (init && (FUNCTION_TYPES.has(init.type) || init.type === "CallExpression" || init.type === "ClassExpression")) {
        return node.id.name;
      }
    }
  }
  return "";
}

// ---------------------------------------------------------------------------
// 受保护位置（§4「从不转换」）：scanModule 的禁转判定和 prescan 的值用途收集共用 protectedContext
// ---------------------------------------------------------------------------

/** 类型位置的字段名：这些字段下面是 TS 类型，不是运行时值。 */
const TS_TYPE_FIELDS = new Set([
  "typeAnnotation",
  "typeParameters",
  "typeArguments",
  "returnType",
  "superTypeParameters",
  "superTypeArguments",
  "implements",
  "predicate",
]);
const TS_TYPE_DECLARATIONS = new Set(["TSInterfaceDeclaration", "TSTypeAliasDeclaration", "TSDeclareFunction", "TSDeclareMethod"]);
const KEYED_MEMBERS = new Set([
  "ObjectProperty",
  "ObjectMethod",
  "ClassProperty",
  "ClassMethod",
  "ClassAccessorProperty",
  "TSPropertySignature",
  "TSMethodSignature",
]);
function isNeverAttribute(node: Node): boolean {
  if (node?.name?.type !== "JSXIdentifier") return false;
  const name: string = node.name.name;
  return NEVER_ATTRIBUTES.includes(name) || name.startsWith("data-");
}

/** console.*。路径已由 calleeTargets 解开各种语法形式并去掉全局前缀；`console[method]` 记为 console.*，同样算。 */
function isConsoleCallee(path: string): boolean {
  return path === "console" || path.startsWith("console.");
}

/**
 * 错误类名：以 Error/Exception 结尾、且不是小写字母开头（跳过开头的 `_`、`$`）的标识符——
 * Error、TypeError、FooError、DOMException、Foo_Error、Foo$Exception、Foo中Error、FooΩException 都算；
 * setError、captureSettingsError、reportError 这类小写开头的普通函数不算。名字已经过解析器校验，不再按字符白名单判断。
 */
function isErrorClassName(name: string): boolean {
  return /(?:Error|Exception)$/.test(name) && !/^[_$]*\p{Ll}/u.test(name);
}

/**
 * 「new Error(...)」类位置：
 * - new X(...)，X 的最后一段以 Error/Exception 结尾（new Error、new TypeError、new FooError、new DOMException）；
 * - 直接调用错误类：Error(...)、TypeError(...)、Data.TaggedError(...)、Schema.TaggedError(...)（最后一段是错误类名）；
 * - 错误类的静态工厂：AcpRequestError.internalError(...)（倒数第二段是错误类名）。
 * 小写开头的普通函数（setError、captureSettingsError、reportError）不算。
 */
function isErrorConstruction(type: string, path: string): boolean {
  const segments = path.split(".");
  const last = segments[segments.length - 1] ?? "";
  if (type === "NewExpression") return /(Error|Exception)$/.test(last);
  if (isErrorClassName(last)) return true;
  const owner = segments[segments.length - 2];
  return owner !== undefined && isErrorClassName(owner);
}

/** 调用的参数是否受保护：任一可能的调用目标是 console.*、错误构造、RegExp、*.constructor 或非显示调用（保守）。 */
function protectedCallReason(node: Node): ProtectedReason | null {
  const targets = callTargetsOf(node);
  if (targets.some((target) => isConsoleCallee(target.path))) return "console";
  if (targets.some((target) => isErrorConstruction(node.type, target.path))) return "error-constructor";
  if (targets.some((target) => target.path === "RegExp")) return "regex";
  // *.constructor(...)：任何对象的原生 constructor 不写出受保护目标的名字就能拿到它
  //（(/x/).constructor === RegExp、"".constructor === String、(0).constructor === Number……），
  // 接收者类型静态不可知，整个类别按受保护处理。upstream 基线运行时代码 .constructor 引用 0 处
  //（scripts/check-exotic-forms.ts，T03-r7 问题 1、Kimi 设计评审第 6 节）。
  if (targets.some((target) => lastSegment(target.path) === "constructor")) return "constructor-call";
  if (targets.some((target) => NON_DISPLAY_CALLEES.some((pattern) => calleeMatches(pattern, target)))) return "non-display-call";
  return null;
}

/**
 * 从叶子往上可以穿过的「结果位置」（与 collectLeaves 同口径）：条件的两个分支、`&&` 右侧、`||`/`??` 两侧、
 * 逗号表达式的最后一项、TS 断言——但不含 as const：对值本身的 `"x" as const` 不是显示叶子。
 */
function isResultSlot(parent: Node, key: string, child: Node): boolean {
  switch (parent.type) {
    case "ConditionalExpression":
      return key === "consequent" || key === "alternate";
    case "LogicalExpression":
      return key === "right" || parent.operator !== "&&";
    case "SequenceExpression":
      return parent.expressions[parent.expressions.length - 1] === child;
    default:
      return TS_WRAPPERS.has(parent.type) && key === "expression" && !isAsConst(parent);
  }
}

/** 从 E1 属性所在的对象往外走到 as const 时可以穿过的「值位置」：属性值、数组元素、展开、结果位置、内层 as const。 */
function isValueSlot(parent: Node, key: string, child: Node): boolean {
  switch (parent.type) {
    case "ObjectExpression":
      return key === "properties";
    case "ObjectProperty":
      return key === "value";
    case "ArrayExpression":
      return key === "elements";
    case "SpreadElement":
      return key === "argument";
    default:
      return isResultSlot(parent, key, child) || (isAsConst(parent) && key === "expression");
  }
}

/**
 * nodes 末尾的叶子是不是 nodes[asConstIndex] 这个 as const 的 E1/E2 显示叶子（§4 位置扩充）：
 * - 叶子经「结果位置」到达某个对象属性的值，属性在对象字面量里；
 * - E1：属性键名在 C 类白名单，且这个对象经「值位置」一路到 as const（不穿过调用、成员访问、函数、JSX、模板插值）；
 * - E2：这个对象就是标签映射表本身（labelMapName），as const 是它和变量之间的包装之一。
 * 其他（无键名元素、非白名单键的值、调用参数、模板插值、回调里的对象、JSX……）都不是显示叶子，受 as const 保护。
 */
function isDisplayLeafOf(nodes: Node[], keys: string[], asConstIndex: number): boolean {
  let i = nodes.length - 1;
  while (i - 1 > asConstIndex && isResultSlot(nodes[i - 1], keys[i] as string, nodes[i])) i--;
  const propertyIndex = i - 1;
  const objectIndex = i - 2;
  if (objectIndex <= asConstIndex) return false;
  const property = nodes[propertyIndex];
  if (property.type !== "ObjectProperty" || keys[i] !== "value" || nodes[objectIndex].type !== "ObjectExpression") return false;
  const name = propertyKeyName(property);
  if (name !== null && C_KEY_SET.has(name)) {
    let chain = true;
    for (let j = objectIndex; j > asConstIndex && chain; j--) chain = isValueSlot(nodes[j - 1], keys[j] as string, nodes[j]);
    if (chain) return true;
  }
  let holderIndex = objectIndex - 1;
  while (holderIndex >= 0 && TS_WRAPPERS.has(nodes[holderIndex].type)) holderIndex--;
  return holderIndex < asConstIndex && labelMapName(nodes, objectIndex) !== null;
}

/**
 * §4「从不转换」的位置，作用于整个子树。nodes/keys 是从根到某个节点（候选叶子，或预扫描遇到的字符串）的节点栈和字段名栈；
 * 从末尾一直向上走到根，**不在函数边界停**（立即执行函数、回调都不能绕过），返回最内层的受保护位置，没有则 null。
 * scanModule 对受保护子树里的候选一律 skip；prescan 把受保护子树里的全部字符串记为值用途——两边调用同一个函数，判定对称。
 *
 * 受保护的位置：
 * - 条件：ConditionalExpression 的 test、`&&` 左侧、if/while/do/for 的 test
 * - 比较 `=== !== == !=` 两侧；switch 的 case test，以及 switch(…) 的判别式（它同样参与 === 比较）
 * - 计算对象/类成员键 `{[k]: …}`、计算成员下标 `obj[k]`
 * - enum（成员名和初始化）；TS 类型位置（类型注解、类型参数、返回类型、implements、interface/type 声明……）
 * - NEVER_ATTRIBUTES / data-* 属性的值
 * - 调用参数：console.*、`new *Error/*Exception(…)` 和 `*Error(…)`、`RegExp(…)`、NON_DISPLAY_CALLEES
 *   （调用对象按 §4「受保护的语法形式」解析，见 calleeTargets）
 * - throw 的参数；带标签的模板字面量（标签和全部插值）
 * - as const 断言的内部，E1/E2 显示叶子（isDisplayLeafOf）除外
 */
export function protectedContext(nodes: Node[], keys: string[]): ProtectedReason | null {
  for (let i = nodes.length - 2; i >= 0; i--) {
    const node = nodes[i];
    const childKey = keys[i + 1] ?? "";
    if (TS_TYPE_FIELDS.has(childKey) || TS_TYPE_DECLARATIONS.has(node.type)) return "ts-type";
    switch (node.type) {
      case "ConditionalExpression":
      case "IfStatement":
      case "WhileStatement":
      case "DoWhileStatement":
      case "ForStatement":
        if (childKey === "test") return "condition";
        break;
      case "LogicalExpression":
        if (node.operator === "&&" && childKey === "left") return "condition";
        break;
      case "BinaryExpression":
        if (COMPARISON_OPERATORS.has(node.operator)) return "comparison";
        break;
      case "SwitchCase":
        if (childKey === "test") return "switch-case";
        break;
      case "SwitchStatement":
        if (childKey === "discriminant") return "switch-case";
        break;
      case "MemberExpression":
      case "OptionalMemberExpression":
        if (node.computed && childKey === "property") return "computed-key";
        break;
      case "TSEnumDeclaration":
      case "TSEnumMember":
        return "enum";
      case "JSXAttribute":
        if (childKey === "value" && isNeverAttribute(node)) return "never-attribute";
        break;
      case "CallExpression":
      case "OptionalCallExpression":
      case "NewExpression":
        if (childKey === "arguments") {
          const reason = protectedCallReason(node);
          if (reason) return reason;
        }
        break;
      case "ThrowStatement":
        return "throw";
      case "TaggedTemplateExpression":
        return "tagged-template";
    }
    if (KEYED_MEMBERS.has(node.type) && node.computed && childKey === "key") return "computed-key";
    if (isAsConst(node) && childKey === "expression" && !isDisplayLeafOf(nodes, keys, i)) return "as-const";
  }
  return null;
}

// ---------------------------------------------------------------------------
// 预扫描：值用途字面量
// ---------------------------------------------------------------------------

function addValueUse(map: Map<string, ValueUseInfo>, text: string, location: ValueUseLocation): void {
  let info = map.get(text);
  if (!info) {
    info = { count: 0, locations: [] };
    map.set(text, info);
  }
  info.count += 1;
  if (info.locations.length < VALUE_USE_LOCATION_LIMIT) info.locations.push(location);
}

/** 收集表达式「结果位置」上的静态字符串（不含带表达式的模板字面量）。 */
function staticStrings(expr: Node): Node[] {
  return collectLeaves(expr)
    .map((leaf) => leaf.node)
    .filter((node) => node.type === "StringLiteral" || node.expressions.length === 0);
}

function staticValue(node: Node): string {
  return node.type === "StringLiteral" ? node.value : (node.quasis[0]?.value.cooked ?? "");
}

/** 数组字面量内部（不跨函数）的全部静态字符串（Schema.Literals([...]) 用）。 */
function stringsInside(expr: Node, out: Node[]): void {
  if (!isNode(expr) || FUNCTION_TYPES.has(expr.type)) return;
  if (expr.type === "StringLiteral" || (expr.type === "TemplateLiteral" && expr.expressions.length === 0)) {
    out.push(expr);
    return;
  }
  for (const key of VISITOR_KEYS[expr.type] ?? []) {
    const child = expr[key];
    if (Array.isArray(child)) for (const item of child) stringsInside(item, out);
    else stringsInside(child, out);
  }
}

/** 字符串字面量、无表达式的模板字面量、JSX 文本（按 JSX 规则折叠空白并去首尾空白后非空）的文本；其他节点返回 null。 */
function literalText(node: Node): string | null {
  if (node.type === "StringLiteral") return node.value;
  if (node.type === "TemplateLiteral" && node.expressions.length === 0) return staticValue(node);
  if (node.type === "JSXText") return cleanJsxText(node.value).trim() || null;
  return null;
}

const SCHEMA_LITERAL_CALLEES = new Set(["Literal", "Literals"]);
const MEMBERSHIP_METHODS = new Set(["includes", "indexOf", "lastIndexOf", "has"]);
/** 首个参数是键（§4，2026-10-05 定案）：Map/Set/Storage/对象的键访问。 */
const KEY_METHODS = new Set(["get", "set", "delete", "has", "getItem", "setItem", "removeItem", "hasOwnProperty"]);
/** 字符串参数参与匹配或比较的字符串方法（§4，2026-10-05 定案）。 */
const STRING_METHODS = new Set(["startsWith", "endsWith", "replace", "replaceAll", "match", "matchAll", "search", "split", "localeCompare"]);

/**
 * 收集一个模块里的「值用途字面量」（§4 可疑项第 1 条）：
 * 1. 受保护位置（protectedContext——与 scanModule 的禁转判定是同一个函数）子树里的**全部**字符串字面量、无表达式模板和
 *    JSX 文本，不只是结果位置上的叶子：`({label:"x"}).label === y`、`{[(() => "x")()]: 1}`、`new Error(f({label:"x"}))`
 *    里的 "x" 都算。as const 内部只有 E1/E2 的显示叶子、且不在其他受保护位置里时不算（它们按 C 类转换）。
 * 2. 另外收集：对象/类成员的非计算键（标识符键、字符串键）、enum 成员名；§4（2026-10-05 定案）列出的
 *    `in` 左侧、`.get/.set/.delete/.has/.getItem/.setItem/.removeItem/.hasOwnProperty` 的首个参数、`Object.hasOwn` 的第二个参数、
 *    `.startsWith/.endsWith/.replace/.replaceAll/.match/.matchAll/.search/.split/.localeCompare` 的字符串参数；
 *    T03 补充的 Schema.Literal(s) 参数、includes/indexOf/lastIndexOf/has 的参数及数组字面量接收者、new Set([...]) 的元素。
 *    这些调用的调用对象同样用 calleeTargets 解析（`.call`、逗号、可选链……都认）；参数取结果位置上的静态字符串。
 * 同一个节点只记一次。
 */
export function collectValueUse(code: string, filename: string, rel: string, into: Map<string, ValueUseInfo>): void {
  const ast = parseModule(code, filename);
  const added = new Set<Node>();
  const add = (node: Node, kind: ValueUseKind, text: string = staticValue(node)) => {
    if (added.has(node)) return;
    added.add(node);
    addValueUse(into, text, { file: rel, line: node.loc?.start.line ?? 0, kind });
  };
  traverse(ast, (nodes, keys) => {
    const node = nodes[nodes.length - 1];
    const text = literalText(node);
    if (text !== null) {
      const reason = protectedContext(nodes, keys);
      if (reason) add(node, reason, text);
    }
    switch (node.type) {
      case "TSLiteralType":
        // 字面量类型一定在类型位置，上面已按 ts-type 收集；这里兜底。
        if (node.literal?.type === "StringLiteral" || (node.literal?.type === "TemplateLiteral" && node.literal.expressions.length === 0)) {
          add(node.literal, "ts-type");
        }
        break;
      case "TSEnumMember":
        if (node.id?.type === "Identifier") add(node.id, "enum", node.id.name);
        break;
      case "ObjectProperty":
      case "ObjectMethod":
      case "ClassProperty":
      case "ClassMethod":
      case "ClassAccessorProperty":
      case "TSPropertySignature":
      case "TSMethodSignature": {
        // 计算键已由 protectedContext（computed-key）收集整个子树。
        const key = node.key;
        if (!node.computed && key?.type === "Identifier") add(key, "object-key", key.name);
        else if (!node.computed && key?.type === "StringLiteral") add(key, "object-key");
        break;
      }
      case "BinaryExpression":
        if (node.operator === "in") for (const s of staticStrings(node.left)) add(s, "in-operator");
        break;
      case "CallExpression":
      case "OptionalCallExpression": {
        const strings = (arg: Node | undefined): Node[] => (arg && arg.type !== "SpreadElement" ? staticStrings(arg) : []);
        for (const target of callTargetsOf(node)) {
          // 参数对不上（多层 call/bind 组合）时保守地看全部实参。
          const unknownArgs = target.args.kind === "unknown";
          const args: Array<Node | undefined> = unknownArgs ? allArgumentNodes(node) : targetArguments(node, target);
          const method = lastSegment(target.path);
          if (SCHEMA_LITERAL_CALLEES.has(method)) {
            for (const arg of args) {
              if (!arg) continue;
              const found: Node[] = [];
              if (arg.type === "ArrayExpression") stringsInside(arg, found);
              else found.push(...strings(arg));
              for (const s of found) add(s, "schema-literal");
            }
          }
          if (target.path === "Object.hasOwn") for (const arg of unknownArgs ? args : [args[1]]) for (const s of strings(arg)) add(s, "key-argument");
          if (!target.path.includes(".")) continue; // 以下都是方法调用
          if (MEMBERSHIP_METHODS.has(method)) for (const arg of args) for (const s of strings(arg)) add(s, "membership");
          if (KEY_METHODS.has(method)) for (const arg of unknownArgs ? args : [args[0]]) for (const s of strings(arg)) add(s, "key-argument");
          if (STRING_METHODS.has(method)) for (const arg of args) for (const s of strings(arg)) add(s, "string-method");
        }
        // ["a", "b"].includes(x)：数组字面量接收者的元素。
        for (const branch of resultBranches(node.callee)) {
          if (branch.type !== "MemberExpression" && branch.type !== "OptionalMemberExpression") continue;
          if (!memberNames(branch).some((name) => MEMBERSHIP_METHODS.has(name))) continue;
          for (const object of resultBranches(branch.object)) {
            if (object.type === "ArrayExpression") for (const element of object.elements) for (const s of strings(element)) add(s, "membership");
          }
        }
        break;
      }
      case "NewExpression":
        if (callTargetsOf(node).some((target) => target.path === "Set")) {
          const first = node.arguments[0];
          if (first?.type === "ArrayExpression") {
            for (const element of first.elements) for (const s of staticStrings(element)) add(s, "membership");
          }
        }
        break;
    }
  });
}

/**
 * 全仓库预扫描（§4）。files 是绝对路径；root 用来把位置记成相对路径。
 * 解析失败的文件记进 errors，不中断（调用方决定是否当作错误）。
 */
export function prescan(files: readonly string[], options: { root?: string } = {}): PrescanResult {
  const valueUse = new Map<string, ValueUseInfo>();
  const errors: PrescanResult["errors"] = [];
  for (const file of files) {
    const rel = options.root ? toPosix(path.relative(options.root, file)) : file;
    try {
      collectValueUse(fs.readFileSync(file, "utf8"), file, rel, valueUse);
    } catch (error) {
      errors.push({ file: rel, message: error instanceof Error ? error.message : String(error) });
    }
  }
  return { valueUse, fileCount: files.length, errors };
}

// ---------------------------------------------------------------------------
// 放行表、词库、上下文
// ---------------------------------------------------------------------------

/** 读 dict/allow-suspicious.json（JSON 数组，元素是精确 key）；文件不存在视为空。格式不对直接报错。 */
export function loadAllowSuspicious(file: string = path.join(ZH_ROOT, "dict/allow-suspicious.json")): Set<string> {
  if (!fs.existsSync(file)) return new Set();
  const data = readJson(file);
  if (!Array.isArray(data) || data.some((item) => typeof item !== "string")) {
    throw new Error(`${file}: expected a JSON array of strings`);
  }
  return new Set(data as string[]);
}

export function loadDict(file: string = path.join(ZH_ROOT, "dict/zh-CN.json")): T3zhDict & { baseline?: string } {
  const data = readJson(file);
  if (typeof data !== "object" || data === null || typeof data.messages !== "object" || typeof data.templates !== "object") {
    throw new Error(`${file}: expected { messages, templates }`);
  }
  return data;
}

export interface CreateScanContextOptions {
  /** monorepo 根（upstream/ 或 .build/src）。 */
  root: string;
  dictPath?: string;
  allowSuspiciousPath?: string;
  /** 覆盖预扫描文件列表（默认 listPrescanFiles(root)）。 */
  prescanFiles?: readonly string[];
}

export interface CreatedScanContext extends ScanContext {
  prescan: PrescanResult;
  dictPath: string;
}

/** 插件和报告共用的上下文构造：全仓库预扫描 + 放行表 + 词库。 */
export function createScanContext(options: CreateScanContextOptions): CreatedScanContext {
  const dictPath = options.dictPath ?? path.join(ZH_ROOT, "dict/zh-CN.json");
  const result = prescan(options.prescanFiles ?? listPrescanFiles(options.root), { root: options.root });
  return {
    valueUse: result.valueUse,
    allowSuspicious: loadAllowSuspicious(options.allowSuspiciousPath),
    dict: loadDict(dictPath),
    prescan: result,
    dictPath,
  };
}

const translatorCache = new WeakMap<object, Translator>();
function translatorFor(ctx: ScanContext): Translator | null {
  if (!ctx.dict) return null;
  let translator = translatorCache.get(ctx.dict);
  if (!translator) {
    translator = createTranslator(ctx.dict);
    translatorCache.set(ctx.dict, translator);
  }
  return translator;
}

function isValueUse(ctx: ScanContext, text: string): boolean {
  return ctx.valueUse.has(text);
}

// ---------------------------------------------------------------------------
// 模块扫描
// ---------------------------------------------------------------------------

interface Owner {
  category: Category;
  /** 白名单名是否属于 §4 原始白名单（B 原始白名单照常转换）。 */
  base: boolean;
  context: string;
  /** translate 时的原因代码。 */
  reason: string;
  /** 从根到 owner 的节点栈（含 owner 自身；JSX 属性的表达式容器、解构默认值的 AssignmentPattern 也压进来），以叶子的直接祖先结尾。 */
  nodes: Node[];
  keys: string[];
  /** A 类：父元素是文本和表达式混排。 */
  mixed?: boolean;
  /** C 类对象属性：从 owner 向外穿过值容器检查数据键（rpc-input）。as const 外层不再阻止转换（E1）。 */
  outward: "none" | "c-property";
  rule?: "E1" | "E2" | "E3";
  /** 直接按这个原因跳过（E3 的数据函数）。 */
  forcedSkip?: string;
}

/** parent 的哪个字段里有 child（VISITOR_KEYS 顺序）。找不到说明节点栈拼错了，直接报错。 */
function childKeyOf(parent: Node, child: Node): string {
  for (const key of VISITOR_KEYS[parent.type] ?? []) {
    const value = parent[key];
    if (value === child || (Array.isArray(value) && value.includes(child))) return key;
  }
  throw new Error(`t3zh matcher: ${child?.type} is not a child of ${parent?.type}`);
}

/** 从根到候选叶子的完整节点栈和字段名栈：owner 的栈（以叶子的直接祖先结尾），接上 collectLeaves 经过的包装节点和叶子。 */
function leafPath(owner: Owner, leaf: Leaf): { nodes: Node[]; keys: string[] } {
  const nodes = [...owner.nodes];
  const keys = [...owner.keys];
  for (const node of [...leaf.via, leaf.node]) {
    const parent = nodes[nodes.length - 1];
    if (parent === node) continue; // JSX 文本：owner 的栈已经以叶子本身结尾
    keys.push(childKeyOf(parent, node));
    nodes.push(node);
  }
  return { nodes, keys };
}

/** 「从不转换」的判定（§4）。返回原因代码或 null。 */
function neverReason(owner: Owner, leaf: Leaf, jsxSkip: Set<Node>, brandSkip: Set<Node>): string | null {
  const chain = [...owner.nodes, ...leaf.via, leaf.node];
  if (chain.some((node) => hasSkipComment(node) || jsxSkip.has(node))) return "skip-comment";
  if (owner.forcedSkip) return owner.forcedSkip;
  if (chain.some((node) => brandSkip.has(node))) return "brand-name";
  if (owner.outward === "c-property") {
    for (let i = owner.nodes.length - 1; i >= 0; i--) {
      const node = owner.nodes[i];
      if (!VALUE_CONTAINERS.has(node.type)) break;
      if (i < owner.nodes.length - 1 && node.type === "ObjectProperty" && DATA_PAYLOAD_KEYS.includes(propertyKeyName(node) ?? "")) {
        return "rpc-input";
      }
    }
  }
  // 受保护的位置：整个子树禁转，从叶子一直查到根，不在函数边界停（与预扫描收集值用途是同一个判定）。
  const path = leafPath(owner, leaf);
  return protectedContext(path.nodes, path.keys);
}

/** 产品名字标组件（如 T3Wordmark）。紧跟其后的兄弟节点里的文字是产品名的后半段。 */
const WORDMARK_ELEMENT = /Wordmark$/;

/**
 * 像标识符/路径/URL 的文本（不是界面文字，翻译只会改坏它）：没有空白、没有大写字母，并且
 * 含 `: / _ # @ = ~` 之一，或以 `-`/`.` 开头，或有「. 后接字母」（文件扩展名、域名）。
 * 例：environment-data:device:list、/model、--tailscale、t3.json、https://…、#71717b。
 * 只有连字符的小写词（auto-settle、12-hour）不算，它们可能是界面文字。
 */
export function isIdentifierLike(key: string): boolean {
  if (key === "" || /\s/.test(key) || /[A-Z]/.test(key)) return false;
  return /[:/_#@=~]/.test(key) || /^[-.]/.test(key) || /\.\p{L}/u.test(key);
}

/** 模板骨架：占位符统一成 {}，用来判断模板匹配是不是「同一句话」。 */
function templateSkeleton(text: string): string {
  return text.replace(/\{([A-Za-z][A-Za-z0-9_]*|\d+)\}/g, "{}");
}

/** 节点栈末尾（对象属性）是否在 `as const` 断言的数组/对象里（只穿过值容器，不跨函数、调用、JSX）。 */
function isInsideAsConst(nodes: Node[]): boolean {
  for (let i = nodes.length - 2; i >= 0; i--) {
    const node = nodes[i];
    if (isAsConst(node)) return true;
    if (!VALUE_CONTAINERS.has(node.type)) return false;
  }
  return false;
}

/**
 * E2：nodes[index] 是对象字面量，且（穿过 TS 断言、satisfies、as const 后）直接赋给名字匹配 LABEL_MAP_VARIABLE 的变量时，
 * 返回变量名，否则 null。只认对象字面量本身，不认嵌套在里面的对象。
 */
function labelMapName(nodes: Node[], index: number): string | null {
  if (nodes[index]?.type !== "ObjectExpression") return null;
  let i = index - 1;
  while (i >= 0 && TS_WRAPPERS.has(nodes[i].type)) i--;
  const holder = nodes[i];
  let name: string | null = null;
  if (holder?.type === "VariableDeclarator" && holder.id?.type === "Identifier") name = holder.id.name;
  if (holder?.type === "AssignmentExpression" && holder.left?.type === "Identifier") name = holder.left.name;
  return name !== null && LABEL_MAP_VARIABLE.test(name) ? name : null;
}

/** E3：nodes[index] 这个函数的名字（函数声明/表达式的 id、赋给的变量、对象属性/方法键、useCallback 包裹的变量）。 */
function functionName(nodes: Node[], index: number): string {
  const fn = nodes[index];
  if (!fn) return "";
  if ((fn.type === "FunctionDeclaration" || fn.type === "FunctionExpression") && fn.id?.name) return fn.id.name;
  if (fn.type === "ObjectMethod" || fn.type === "ClassMethod" || fn.type === "ClassPrivateMethod") return propertyKeyName(fn) ?? "";
  let parent = nodes[index - 1];
  let parentIndex = index - 1;
  while (parent && TS_WRAPPERS.has(parent.type)) parent = nodes[--parentIndex];
  if (parent?.type === "CallExpression" && callTargetsOf(parent).some((target) => target.path.endsWith("useCallback"))) {
    parent = nodes[--parentIndex];
  }
  if (parent?.type === "VariableDeclarator" && parent.id?.type === "Identifier") return parent.id.name;
  if (parent?.type === "ObjectProperty" || parent?.type === "ClassProperty") return propertyKeyName(parent) ?? "";
  if (parent?.type === "AssignmentExpression") {
    const left = parent.left;
    if (left?.type === "Identifier") return left.name;
    if (left?.type === "MemberExpression" && !left.computed && left.property?.type === "Identifier") return left.property.name;
  }
  return "";
}

/**
 * D 类：调用的所有可能目标（calleeTargets）都是白名单函数时，返回各目标共同指向的那些实参节点；
 * 任一目标不在名单、经 `.apply` 或参数对不上时返回 null（保守：不转换）。受保护的调用目标由 protectedContext 另行判 skip。
 */
function dFunctionArguments(node: Node): { context: string; args: Node[] } | null {
  const targets = callTargetsOf(node);
  let common: Node[] | null = null;
  for (const target of targets) {
    // 只在参数位置对得上时按 D 类转换；apply、多层组合、展开参数一律不转（保守）。
    if (target.args.kind !== "positional") return null;
    const spec = D_FUNCTIONS.find((candidate) => calleeMatches(candidate.callee, target));
    if (!spec) return null;
    const all = targetArguments(node, target);
    const args = spec.args.map((index) => all[index]).filter((arg): arg is Node => arg !== undefined && arg !== null && arg.type !== "SpreadElement");
    common = common === null ? args : common.filter((arg) => args.includes(arg));
  }
  if (common === null || common.length === 0) return null;
  return { context: [...new Set(targets.map((target) => target.raw))].join(" | "), args: common };
}

/** JSX 文本：第一个非空白字符的行列。 */
function jsxTextPosition(node: Node): { line: number; column: number } {
  const raw: string = node.extra?.raw ?? node.value;
  const firstIndex = raw.search(/\S/);
  if (firstIndex <= 0) return { line: node.loc.start.line, column: node.loc.start.column };
  const before = raw.slice(0, firstIndex);
  const breaks = countLineBreaks(before);
  if (breaks === 0) return { line: node.loc.start.line, column: node.loc.start.column + firstIndex };
  const lastBreak = Math.max(before.lastIndexOf("\n"), before.lastIndexOf("\r"));
  return { line: node.loc.start.line + breaks, column: firstIndex - lastBreak - 1 };
}

function isDynamicJsxChild(child: Node): boolean {
  if (child.type !== "JSXExpressionContainer") return false;
  const expr = child.expression;
  if (expr.type === "JSXEmptyExpression" || expr.type === "StringLiteral") return false;
  if (expr.type === "TemplateLiteral" && expr.expressions.length === 0) return false;
  return true;
}

/**
 * 扫描一个模块，返回全部候选项（§4 的 A/B/C/D 位置）。纯函数：只读 code 和 ctx。
 * 解析失败时抛出（Babel 的 SyntaxError）。
 */
export function scanModule(code: string, filename: string, ctx: ScanContext): ScanResult {
  const ast = parseModule(code, filename);
  const candidates: Candidate[] = [];
  const seen = new Set<number>();
  const jsxSkip = new Set<Node>();
  // 产品名字标：<T3Wordmark /> 后面紧跟的文字是产品名的一部分（"T3" + "Code"），不翻译（§3：产品名不翻译）。
  const brandSkip = new Set<Node>();
  const translator = translatorFor(ctx);

  const emit = (owner: Owner, leaf: Leaf, replaceCode?: (text: string) => string) => {
    const node = leaf.node;
    if (seen.has(node.start)) return;
    seen.add(node.start);
    let text: string;
    let kind: "message" | "template";
    let position = { line: node.loc.start.line, column: node.loc.start.column };
    if (node.type === "JSXText") {
      text = cleanJsxText(node.value);
      kind = "message";
      position = jsxTextPosition(node);
    } else {
      ({ text, kind } = leafText(node));
    }
    const key = text.trim();
    const valueUse = kind === "message" && (isValueUse(ctx, text) || isValueUse(ctx, key));

    let decision: Decision = "translate";
    let reason = owner.reason;
    let collidingTemplate: string | undefined;
    const never = neverReason(owner, leaf, jsxSkip, brandSkip);
    if (never) {
      decision = "skip";
      reason = never;
    } else if (!hasLetters(text, kind)) {
      decision = "skip";
      reason = "no-letters";
    } else if (isIdentifierLike(key)) {
      decision = "skip";
      reason = "identifier-like";
    } else if (owner.category === "A" && owner.mixed) {
      decision = "skip";
      reason = "mixed-jsx";
    } else {
      const checkValueUse = !(owner.category === "A" || (owner.category === "B" && owner.base));
      if (checkValueUse && valueUse) {
        decision = "suspicious";
        reason = "value-use";
      } else if (translator && (kind === "template" || translator.lookupMessage(text) === undefined)) {
        // 模板误配：静态文本不在 messages 里却能被某条模板匹配；或带表达式的模板字面量会被「骨架不同」的模板匹配。
        // 运行时会把这类文本改成半中半英（如 "Push to {0}" 被 "{head} to {base}" 匹配），默认不转换，等补词条或放行。
        const hit = translator.matchTemplate(text);
        if (hit && (kind === "message" || templateSkeleton(hit.key) !== templateSkeleton(key))) {
          decision = "suspicious";
          reason = "template-collision";
          collidingTemplate = hit.key;
        }
      }
      if (decision === "suspicious" && ctx.allowSuspicious.has(key)) {
        decision = "translate";
        reason = "allow-listed";
      }
    }

    const candidate: Candidate = {
      file: filename,
      line: position.line,
      column: position.column,
      start: node.start,
      end: node.end,
      text,
      key,
      kind,
      category: owner.category,
      decision,
      reason,
      context: owner.context,
      component: enclosingName(owner.nodes),
      valueUse,
    };
    if (collidingTemplate) candidate.collidingTemplate = collidingTemplate;
    if (owner.rule) candidate.rule = owner.rule;
    if (decision === "translate") {
      candidate.edit = replaceCode
        ? { type: "replace", start: node.start, end: node.end, code: replaceCode(text) }
        : { type: "wrap", start: node.start, end: node.end };
    }
    candidates.push(candidate);
  };

  /** JSX 文本、JSX 属性字符串：整段替换成表达式容器，保留原有换行数，后续代码行号不变。 */
  const jsxReplacement = (node: Node) => (text: string) =>
    `{${RUNTIME_FN}(${JSON.stringify(text)})${"\n".repeat(countLineBreaks(code.slice(node.start, node.end)))}}`;

  traverse(ast, (nodes, keys) => {
    const node = nodes[nodes.length - 1];
    const parent = nodes[nodes.length - 2];
    switch (node.type) {
      // A：JSX 子节点
      case "JSXElement":
      case "JSXFragment": {
        const children: Node[] = node.children ?? [];
        const hasLetterText = children.some((child) => child.type === "JSXText" && LETTER.test(cleanJsxText(child.value)));
        const mixed = hasLetterText && children.some(isDynamicJsxChild);
        const hasElementSibling = children.some((child) => child.type === "JSXElement" || child.type === "JSXFragment");
        let pendingSkip = false;
        let previous: Node = null;
        for (const child of children) {
          if (isSkipCommentContainer(child)) {
            pendingSkip = true;
            continue;
          }
          if (child.type === "JSXText" && cleanJsxText(child.value) === "") continue;
          if (pendingSkip) {
            jsxSkip.add(child);
            pendingSkip = false;
          }
          if (previous?.type === "JSXElement" && WORDMARK_ELEMENT.test(jsxElementName(previous))) brandSkip.add(child);
          previous = child;
          const owner: Owner = {
            category: "A",
            base: true,
            context: jsxElementName(node),
            reason: "jsx-text",
            nodes: [...nodes, child],
            keys: [...keys, "children"],
            mixed,
            outward: "none",
          };
          if (child.type === "JSXText") {
            emit({ ...owner, reason: hasElementSibling ? "jsx-text-fragment" : "jsx-text" }, { node: child, via: [] }, jsxReplacement(child));
          } else if (child.type === "JSXExpressionContainer" && child.expression.type !== "JSXEmptyExpression") {
            for (const leaf of collectLeaves(child.expression)) emit({ ...owner, reason: "jsx-expression" }, leaf);
          }
        }
        break;
      }
      // B：JSX 属性
      case "JSXAttribute": {
        if (node.name?.type !== "JSXIdentifier") break;
        const name: string = node.name.name;
        const base = B_BASE_SET.has(name);
        if (!base && !EXT_SET.has(name)) break;
        const owner: Owner = {
          category: "B",
          base,
          context: name,
          reason: "attribute",
          nodes,
          keys,
          outward: "none",
        };
        const value = node.value;
        if (value?.type === "StringLiteral") {
          // JSX 属性字符串不折叠空白（oxc 原样保留换行），babel 解析出的 value 已解码 HTML 实体，与 oxc 一致。
          emit(owner, { node: value, via: [] }, jsxReplacement(value));
        } else if (value?.type === "JSXExpressionContainer") {
          const inContainer: Owner = { ...owner, nodes: [...nodes, value], keys: [...keys, "value"] };
          for (const leaf of collectLeaves(value.expression)) emit(inContainer, leaf);
        }
        break;
      }
      // C：对象字面量属性值（含 E1：as const 内白名单键的值；E2：标签映射表的值）；以及解构默认值 `{ label = "..." }`
      case "ObjectProperty": {
        const name = propertyKeyName(node);
        if (parent?.type === "ObjectExpression") {
          if (name !== null && C_KEY_SET.has(name)) {
            const inAsConst = isInsideAsConst(nodes);
            const owner: Owner = {
              category: "C",
              base: C_BASE_SET.has(name),
              context: name,
              reason: inAsConst ? "as-const-property" : "property",
              nodes,
              keys,
              outward: "c-property",
              ...(inAsConst ? { rule: "E1" as const } : {}),
            };
            for (const leaf of collectLeaves(node.value)) emit(owner, leaf);
            break;
          }
          const mapName = labelMapName(nodes, nodes.length - 2);
          if (mapName !== null) {
            const owner: Owner = {
              category: "C",
              base: false,
              context: mapName,
              reason: "label-map",
              nodes,
              keys,
              outward: "c-property",
              rule: "E2",
            };
            for (const leaf of collectLeaves(node.value)) emit(owner, leaf);
          }
        } else if (name !== null && parent?.type === "ObjectPattern" && node.value?.type === "AssignmentPattern") {
          if (!C_KEY_SET.has(name) && !B_BASE_SET.has(name)) break;
          const owner: Owner = {
            category: "C",
            base: false,
            context: name,
            reason: "destructuring-default",
            nodes: [...nodes, node.value],
            keys: [...keys, "value"],
            outward: "none",
          };
          for (const leaf of collectLeaves(node.value.right)) emit(owner, leaf);
        }
        break;
      }
      // E3：标签类函数的返回值
      case "ReturnStatement":
      case "ArrowFunctionExpression": {
        let expr: Node;
        let fnIndex: number;
        if (node.type === "ReturnStatement") {
          expr = node.argument;
          fnIndex = nodes.length - 2;
          while (fnIndex >= 0 && !FUNCTION_TYPES.has(nodes[fnIndex].type)) fnIndex--;
        } else {
          if (node.body?.type === "BlockStatement") break;
          expr = node.body;
          fnIndex = nodes.length - 1;
        }
        if (!expr || fnIndex < 0) break;
        const fnName = functionName(nodes, fnIndex);
        if (!LABEL_FUNCTION_NAME.test(fnName)) break;
        const owner: Owner = {
          category: "C",
          base: false,
          context: fnName,
          reason: "label-function-return",
          nodes,
          keys,
          outward: "none",
          rule: "E3",
          ...(E3_DATA_FUNCTION_SET.has(fnName) ? { forcedSkip: "data-function" } : {}),
        };
        for (const leaf of collectLeaves(expr)) emit(owner, leaf);
        break;
      }
      // D：白名单函数的字符串参数
      case "CallExpression":
      case "OptionalCallExpression": {
        const match = dFunctionArguments(node);
        if (!match) break;
        const owner: Owner = {
          category: "D",
          base: false,
          context: match.context,
          reason: "call-arg",
          nodes,
          keys,
          outward: "none",
        };
        for (const arg of match.args) for (const leaf of collectLeaves(arg)) emit(owner, leaf);
        break;
      }
    }
  });

  candidates.sort((a, b) => a.start - b.start || b.end - a.end);

  // import 插在指令序言（"use client" 等）之后、与它同一行，不改变任何行号；
  // 指令没写分号时补一个，保证它仍是独立的指令语句。hashbang 行之后只能换行。
  const directives: Node[] = ast.program.directives ?? [];
  const lastDirective = directives[directives.length - 1];
  const importStatement = `import { ${RUNTIME_FN} } from ${JSON.stringify(RUNTIME_MODULE_ID)};`;
  let importInsertPos = 0;
  let importCode = importStatement;
  if (lastDirective) {
    importInsertPos = lastDirective.end;
    if (code[lastDirective.end - 1] !== ";") importCode = `;${importStatement}`;
  } else if (ast.program.interpreter) {
    importInsertPos = ast.program.interpreter.end;
    importCode = `\n${importStatement}`;
  }
  return { file: filename, candidates, importInsertPos, importCode };
}
