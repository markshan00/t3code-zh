/** T21: the server only inspects Undici's class name; no constructor is invoked. */
export function isReviewedDispatcherClassCheck(file: string, node: any, parent: any, grandparent: any): boolean {
  const receiver = node?.object;
  return file.split("\\").join("/") === "apps/server/src/outboundHttp.ts"
    && node?.type === "MemberExpression" && !node.computed && node.property?.name === "constructor"
    && receiver?.type === "CallExpression" && receiver.arguments.length === 0
    && receiver.callee?.type === "MemberExpression" && !receiver.callee.computed
    && receiver.callee.object?.type === "Identifier" && receiver.callee.object.name === "undici"
    && receiver.callee.property?.name === "getGlobalDispatcher"
    && parent?.type === "MemberExpression" && !parent.computed
    && parent.object === node && parent.property?.name === "name"
    && grandparent?.type === "BinaryExpression" && grandparent.operator === "==="
    && grandparent.left === parent && grandparent.right?.type === "StringLiteral"
    && grandparent.right.value === "EnvHttpProxyAgent";
}
