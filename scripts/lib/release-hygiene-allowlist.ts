// 每条仅登记上游通用写法；来源必须在 --baseline 中重新读取并验证。
// 不登记具体用户名、供应商文件摘要、版本号或个人邮箱。
export const USERS_ALLOWLIST = [
  {
    id: "transcript-directory-comment",
    source: "packages/contracts/src/usage.ts",
    sourceText: "`/Users/<user>/.claude`",
    matches: (before: string, after: string) => before.endsWith("`") && after.startsWith("/Users/<user>/.claude`"),
  },
  {
    id: "infer-posix-home",
    source: "packages/shared/src/fileLinks.ts",
    sourceText: "return `/Users/${posixUser[1]}`;",
    // 压缩器可改变量名；索引和完整 return 模板保持固定。
    matches: (before: string, after: string) => /\breturn\s*`$/.test(before) &&
      /^\/Users\/\$\{[A-Za-z_$][\w$]*\[1\]\}`[;,}]/.test(after),
  },
  {
    id: "markdown-posix-roots",
    source: "packages/shared/src/markdownLinks.ts",
    sourceText: '"/Users/",',
    // 只认可根前缀数组的相邻 /home/，不是任意位置的字符串。
    matches: (before: string, after: string) => /\[\s*["'`]$/.test(before) &&
      /^\/Users\/["'`],\s*["'`]\/home\/["'`]/.test(after),
  },
] as const;

export const CHECKPOINT_SOURCE = "apps/server/src/vcs/GitVcsDriver.ts";
