/**
 * 基线异形调用形态扫描（CONVENTIONS §4 收敛标准配套，2026-10-05 定案；
 * 形态清单合并自 T03 审核 r3–r8 与 Kimi 设计评审各自的基线扫描，原脚本散在 /tmp，此处固化）。
 *
 * 用法：node scripts/check-exotic-forms.ts [源码根目录，默认 ./upstream]
 *
 * 「构造反例进已知限制、只有基线可复现才阻断」的前提是基线里确实没有这些形态。
 * 升级基线时重跑本脚本：某类形态从 0 变非 0，它就不再是纯理论构造，
 * 要按 §4 收敛标准重新评估 matcher 对该类的保护（T04 升级报告引用本脚本输出）。
 *
 * 退出码：
 * - 报警类（ALARM_KINDS：regexConstructor、constructorAny、bindInvokeSpread、
 *   applyArraySpread、methodChains、bindResultInvoke、dSpreadArguments、keySpreadArguments）
 *   任一有命中时 1，否则 0；commaConditionalCallee、applyNonArray 是报告类，命中不影响退出码
 *   （applyNonArray（X.apply(T, 非数组字面量)）在基线有已知良性命中——store.apply(event) 这类
 *   普通同名业务方法，不是 Function.prototype.apply——只报告明细，升级时计数变化需人工核对新命中）。
 * - 有文件解析失败时同样 1：失败文件未纳入扫描，此时无论报警类计数多少都不能下零命中结论。
 */
import fs from "node:fs";
import path from "node:path";
import babelTypes from "@babel/types";
import { D_FUNCTIONS, listPrescanFiles, parseModule } from "../plugin/matcher.ts";

const WRAPPERS = new Set([
  "TSAsExpression",
  "TSSatisfiesExpression",
  "TSTypeAssertion",
  "TSNonNullExpression",
  "ParenthesizedExpression",
  "TSInstantiationExpression",
]);

type AnyNode = any;

interface Hit {
  file: string;
  line: number;
  source: string;
}

interface ParseFailure {
  file: string;
  message: string;
}

const unwrap = (node: AnyNode): AnyNode => {
  while (WRAPPERS.has(node?.type)) node = node.expression;
  return node;
};
const isMember = (node: AnyNode): boolean => node?.type === "MemberExpression" || node?.type === "OptionalMemberExpression";
const isCall = (node: AnyNode): boolean => node?.type === "CallExpression" || node?.type === "OptionalCallExpression";
const isInvocation = (node: AnyNode): boolean => isCall(node) || node?.type === "NewExpression";
const keyOf = (node: AnyNode): string | undefined =>
  !node?.computed ? node?.property?.name : node?.property?.type === "StringLiteral" ? node.property.value : undefined;
const hasSpreadInside = (node: AnyNode): boolean =>
  node?.type === "ArrayExpression" && node.elements.some((element: AnyNode) => element?.type === "SpreadElement");
const INVOKE_METHODS = new Set(["call", "apply", "bind"]);
/** 与 plugin/matcher.ts 的 KEY_METHODS 保持一致（键访问方法：首个参数是键，不能翻译）。 */
const KEY_METHODS = new Set(["get", "set", "delete", "has", "getItem", "setItem", "removeItem", "hasOwnProperty"]);
/** 与 plugin/matcher.ts 的 GLOBAL_OBJECTS 保持一致（模式带前缀时目标也必须带）。 */
const GLOBAL_OBJECTS = new Set(["globalThis", "window", "self", "global"]);

/**
 * callee 的可能路径（与 plugin/matcher.ts 的 calleeTargets 同语义的静态近似）：
 * 标识符、成员访问、静态计算成员；逗号表达式取末项，条件/逻辑表达式取各分支。
 * 调用返回值、动态成员等静态不可知的形态返回空，不计入。
 */
const calleePaths = (node: AnyNode): string[] => {
  node = unwrap(node);
  if (!node) return [];
  if (node.type === "Identifier") return [node.name];
  if (isMember(node)) {
    const key = keyOf(node);
    return key === undefined ? [] : calleePaths(node.object).map((prefix) => `${prefix}.${key}`);
  }
  if (node.type === "SequenceExpression") return calleePaths(node.expressions[node.expressions.length - 1]);
  if (node.type === "ConditionalExpression") return [...calleePaths(node.consequent), ...calleePaths(node.alternate)];
  if (node.type === "LogicalExpression") return [...calleePaths(node.left), ...calleePaths(node.right)];
  return [];
};

const splitGlobal = (segments: readonly string[]): { path: string; global: boolean } => {
  let i = 0;
  while (i < segments.length - 1 && GLOBAL_OBJECTS.has(segments[i] as string)) i++;
  return { path: segments.slice(i).join("."), global: i > 0 };
};

/** 名单模式（"setError"、"*.setError"、"window.confirm"）是否匹配路径；与 plugin/matcher.ts 的 calleeMatches 一致。 */
const matchesCallee = (targetPath: string, pattern: string): boolean => {
  const wanted = splitGlobal(pattern.split("."));
  const got = splitGlobal(targetPath.split("."));
  if (wanted.global && !got.global) return false;
  if (wanted.path.startsWith("*.")) return got.path.endsWith(wanted.path.slice(1)) && got.path.length > wanted.path.length - 1;
  return got.path === wanted.path;
};

/** 报警类：基线必须保持 0 命中。 */
const ALARM_KINDS = [
  "regexConstructor",
  "constructorAny",
  "bindInvokeSpread",
  "applyArraySpread",
  "methodChains",
  "bindResultInvoke",
  "dSpreadArguments",
  "keySpreadArguments",
] as const;

const KIND_NOTES: Record<string, string> = {
  regexConstructor: "(/x/).constructor（r7 问题 1；matcher 现按 *.constructor 整体保护）",
  constructorAny: "任何 .constructor 成员引用（Kimi：基线运行时代码 0 处）",
  bindInvokeSpread: "X.bind.call/apply(...xs)（r7 问题 2；现按 mentionedTargets 保守处理）",
  applyArraySpread: "X.apply(T, [...xs, ...])（r7 问题 3；现参数映射记 unknown）",
  methodChains: ".bind.call/.call.apply 等两层以上 invoke 链（r6；现按 mentionedTargets 保守处理）",
  bindResultInvoke: "X.bind(...).call/apply/bind(...)（r4 返回值链，穿透 bind 调用返回值这一层；按 §4 深度上限属保守处理范围，仅报警不修 matcher）",
  dSpreadArguments: "D 类白名单函数的实参含展开（r6；matcher 实参含展开时参数映射记 unknown，D 类不转）",
  keySpreadArguments: "key 方法（Map/Storage/对象键访问）的实参含展开（r6；同上记 unknown，预扫描收全部实参）",
  commaConditionalCallee: "(0, f)(...) / (c ? f : g)(...) / (f || g)(...) / new (0, f)(...) 作 callee（resultBranches 规范内覆盖；计数变化时人工核对新命中不含受保护目标，仅报告）",
  applyNonArray: "X.apply(T, 非数组字面量)（已知良性同名业务方法；仅报告）",
};

function main(): void {
  const root = path.resolve(process.argv[2] ?? "upstream");
  const files = listPrescanFiles(root);
  const hits = new Map<string, Hit[]>([...Object.keys(KIND_NOTES)].map((kind) => [kind, []]));
  const parseFailures: ParseFailure[] = [];
  let parsed = 0;
  for (const file of files) {
    const rel = path.relative(root, file);
    let code = "";
    let ast: AnyNode = null;
    try {
      code = fs.readFileSync(file, "utf8");
      ast = parseModule(code, file);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      parseFailures.push({ file: rel, message: message.split("\n")[0] ?? "" });
      continue;
    }
    parsed++;
    const hit = (kind: string, node: AnyNode): void => {
      hits.get(kind)?.push({ file: rel, line: node.loc?.start?.line ?? 0, source: code.slice(node.start, node.end).slice(0, 200) });
    };
    const walk = (node: AnyNode): void => {
      if (!node?.type) return;
      if (isMember(node) && keyOf(node) === "constructor") {
        hit("constructorAny", node);
        if (unwrap(node.object)?.type === "RegExpLiteral") hit("regexConstructor", node);
      }
      if (isInvocation(node)) {
        const callee = unwrap(node.callee);
        const args: AnyNode[] = node.arguments ?? [];
        // 逗号/条件/逻辑 callee：调用和 new 都算（复合 new 与逻辑 callee 是 r8 补齐项）。
        if (callee?.type === "SequenceExpression" || callee?.type === "ConditionalExpression" || callee?.type === "LogicalExpression") {
          hit("commaConditionalCallee", node);
        }
        if (isMember(callee)) {
          const method = keyOf(callee);
          const inner = unwrap(callee.object);
          const innerKey = isMember(inner) ? keyOf(inner) : undefined;
          if (isCall(node)) {
            if ((method === "call" || method === "apply") && innerKey === "bind" && args.some((arg) => arg?.type === "SpreadElement")) {
              hit("bindInvokeSpread", node);
            }
            if (method === "apply") {
              if (hasSpreadInside(unwrap(args[1]))) hit("applyArraySpread", node);
              else if (args[1] && unwrap(args[1])?.type !== "ArrayExpression") hit("applyNonArray", node);
            }
            if (method !== undefined && INVOKE_METHODS.has(method) && innerKey !== undefined && INVOKE_METHODS.has(innerKey)) {
              hit("methodChains", node);
            }
          }
          // bind 返回值链：callee 是 .call/.apply/.bind，且它的对象是「某次 .bind(...) 调用的返回值」。
          // methodChains 只看紧邻的成员（.bind.call），这里穿透 `X.bind(...)` 返回值这一层。
          if (
            method !== undefined &&
            INVOKE_METHODS.has(method) &&
            isCall(inner) &&
            isMember(unwrap(inner.callee)) &&
            keyOf(unwrap(inner.callee)) === "bind"
          ) {
            hit("bindResultInvoke", node);
          }
        }
        // 实参含展开：剥掉尾部 .call/.apply/.bind 后，callee 路径命中 D 类名单或 key 方法（覆盖直接调用和间接调用）。
        if (args.some((arg) => arg?.type === "SpreadElement")) {
          for (const rawPath of calleePaths(callee)) {
            const target = rawPath.replace(/\.(call|apply|bind)$/, "");
            if (D_FUNCTIONS.some((spec) => matchesCallee(target, spec.callee))) hit("dSpreadArguments", node);
            const last = target.slice(target.lastIndexOf(".") + 1);
            // 与 matcher 的键用途收集一致：裸方法名（路径不含点）不算，Object.hasOwn 单独处理。
            if ((target.includes(".") && KEY_METHODS.has(last)) || target === "Object.hasOwn") hit("keySpreadArguments", node);
          }
        }
      }
      for (const key of (babelTypes.VISITOR_KEYS as Record<string, readonly string[]>)[node.type as string] ?? []) {
        const value = node[key];
        if (Array.isArray(value)) for (const child of value) walk(child);
        else walk(value);
      }
    };
    walk(ast);
  }

  console.log(`扫描根目录：${root}`);
  console.log(`预扫描文件 ${files.length} 个，解析成功 ${parsed}，解析失败 ${parseFailures.length}`);
  let alarm = 0;
  for (const kind of Object.keys(KIND_NOTES)) {
    const list = hits.get(kind) ?? [];
    const mark = (ALARM_KINDS as readonly string[]).includes(kind) ? (list.length === 0 ? "OK" : "命中!") : "报告";
    console.log(`\n[${mark}] ${kind}: ${list.length} 处——${KIND_NOTES[kind]}`);
    for (const item of list.slice(0, 20)) console.log(`  ${item.file}:${item.line}  ${item.source.replace(/\s+/g, " ").slice(0, 120)}`);
    if (list.length > 20) console.log(`  …另有 ${list.length - 20} 处`);
    if ((ALARM_KINDS as readonly string[]).includes(kind)) alarm += list.length;
  }
  if (alarm > 0) {
    console.log(`\n报警类合计 ${alarm} 处命中：该形态已进入基线，按 §4 收敛标准重新评估 matcher 保护。`);
  }
  if (parseFailures.length > 0) {
    console.log(`\n解析失败的文件（${parseFailures.length} 个，未纳入扫描）：`);
    for (const item of parseFailures.slice(0, 20)) console.log(`  ${item.file}  ${item.message}`);
    if (parseFailures.length > 20) console.log(`  …另有 ${parseFailures.length - 20} 个`);
    console.log(`\n扫描不完整，不能下零命中结论：${parseFailures.length} 个文件解析失败，可能藏有未扫描的形态。修正或排除后再重跑。`);
    process.exit(1);
  }
  if (alarm > 0) process.exit(1);
  console.log("\n报警类全部 0 命中：构造反例仍属理论形态，按 §4 收敛标准进已知限制。");
}

main();
