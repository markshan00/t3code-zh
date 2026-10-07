# 公共约定（所有执行模型和审核模型必读）

本项目给 T3 Code 做中文界面。做法：上游源码保持原样，构建时用插件把界面文字包成运行时查表调用，词库单独维护。少数必须改上游文件的地方做成补丁，由构建脚本应用。

> 公开版说明：本文最初写给参与开发的 AI 执行模型和审核模型，§3–§6 是词库、转换边界、运行时和版本号的技术约定，对人类贡献者同样适用。§2 已去掉只针对维护者本机的内容。文中提到的 `tasks/`、`reviews/`、`handoff/` 是开发过程记录，没有放进公开仓库。

## 1. 基线与目录

- 基线 tag：`v0.0.46-nightly.20261007.2774`
- 基线 commit：`611132c171f3a821bd2e32f22261135cef6330ac`
- 上游仓库：`~/Projects/t3code`（远端 `pingdotgg/t3code`，blobless 部分克隆）

```
~/Projects/t3code-zh/          本仓库（git，main 分支）
├── upstream/                  基线 tag 的 git worktree，只读参考（git 忽略）
├── .build/src/                基线 tag 的 git worktree，专供构建（git 忽略）
├── release/                   构建产物（git 忽略）
├── dict/zh-CN.json            词库
├── plugin/ runtime/ build/    转换插件、运行时、web 包装配置
├── scripts/                   build-zh.sh、extract-dict.ts、check-dict.ts、report.ts
├── patches/                   必须改上游文件的补丁，按编号顺序应用
├── reports/<tag>/             覆盖率报告
├── docs/                      构建手册、升级手册
└── handoff/ reviews/ tasks/   开发过程记录（未放进公开仓库）
```

上游仓库位置可以用环境变量 `T3ZH_UPSTREAM_REPO` 改（`scripts/upgrade-check.sh`、`scripts/switch-baseline.sh` 读取），默认 `~/Projects/t3code`。

TypeScript 脚本直接用 `node scripts/xxx.ts` 运行（本机 Node v24.14.0，支持类型擦除），只写可擦除的 TS 语法（不用 enum、namespace、参数属性）。依赖装在本仓库根目录的 `package.json`。

## 2. 硬规则（违反任何一条，审核结论直接是"不通过"）

1. **不读写 `~/.t3/userdata`**（正在使用的真实数据）。测试一律用沙盒目录；需要真实数据快照时，只用 `sqlite3 .backup` 和 `rsync` 往沙盒单向复制。
2. **不改 `/Applications` 下的任何 app，不往 `/Applications` 安装。** 正式安装由维护者手动完成。
3. **不改上游克隆（默认 `~/Projects/t3code`）的工作区文件和当前分支**，那里可能有维护者自己的未提交改动。只允许以下操作：`git fetch`、`git worktree add/remove/prune`，以及 `git show/diff/log/rev-parse` 等只读命令。
4. **`upstream/` 只读。** 任何任务结束时，`git -C upstream status --porcelain` 必须为空。
5. **`.build/src` 只能由 `scripts/build-zh.sh` 修改**（T01 建立工作树、做原版构建时除外）。
6. **启动任何构建产物：**
   - 必须用 `open -n --env T3CODE_HOME=<沙盒> --env T3CODE_DISABLE_AUTO_UPDATE=1 "<app>"`，沙盒目录用 `~/.t3-zh-test*`
   - 启动前用 `pgrep -fl "T3 Code"` 确认没有其他 0.0.46 实例在运行：官方 Nightly，以及已经装进 `/Applications` 的 0.0.46 汉化版。所有 0.0.46 正式包的 Electron 配置目录都固定是 `~/Library/Application Support/t3code-v2`，不受 `T3CODE_HOME` 影响，两个实例同时开会互相覆盖配置。有就停下来，先退出它
   - 结束测试实例时只能按 PID 结束自己启动的进程，禁止 `pkill`、`killall`，以及任何按名字匹配 "T3 Code" 结束进程的命令（执行者本身可能就运行在某个 T3 Code 里）
7. **只提交自己任务范围内的文件。** 用 `git add <具体路径>`，禁止 `git add -A`、`git add .`。不改写历史（不用 rebase、amend、force push）。
8. **遇到说明书没覆盖的情况，或需要越过以上规则时，停下来问维护者。**
9. **handoff 里只写实际跑过的结果。** 没跑的写"未验证"，并说明原因。

## 3. 词库格式 `dict/zh-CN.json`

```json
{
  "baseline": "v0.0.46-nightly.20261004.2644",
  "messages": {
    "Inherit defaults": "继承默认设置"
  },
  "templates": {
    "{0} active · {1} done": "{0} 个进行中 · {1} 个已完成",
    "{count} files changed": "已更改 {count} 个文件"
  }
}
```

- key 是英文原文去掉首尾空白后的精确文本，value 是中文。
- 占位符写成 `{name}`（字母开头）或 `{0}`。中英两侧的占位符集合必须相同，顺序可以调整。含占位符的条目放 `templates`，其余放 `messages`。
- key 按 Unicode 码点排序，2 空格缩进，文件以换行结尾，UTF-8 编码。`scripts/check-dict.ts` 负责校验以上各项。
- 术语以 `dict/glossary.md` 的"定稿"一节为准。产品名、模型名、命令、代码标识不翻译。
- `dict/allow-suspicious.json`：放行的 C 类可疑项，JSON 数组，元素是精确 key（见 §4）。
- T07 的主进程词条单独放 `dict/zh-CN.desktop.json`，格式同本文件，由 T07 维护——避免与 T05 并行改同一个文件。

## 4. 转换边界（插件和报告共用，判定逻辑只写在 `plugin/matcher.ts`）

**处理范围：** web 构建用到的 `apps/web/src/**/*.{ts,tsx}`，以及 web 引入的 `packages/**/src/**/*.{ts,tsx}`。排除 `*.test.*`、`*.spec.*`、`__tests__/`、`*.stories.*`、`*.d.ts`、`node_modules`。

**转换方式：** 一律包成运行时调用 `__t3zh_t(<原表达式>)`，不在编译期直接替换成中文。这样能保留语言切换，英文模式下的输出也和原版一致。

**会转换的位置：**

| 类别 | 位置 | 说明 |
|---|---|---|
| A | JSX 文本 | 非纯空白的 JSXText。按 JSX 空白规则算出实际渲染文本再查表 |
| B | JSX 属性值 | 属性名在白名单：`placeholder` `title` `aria-label` `aria-description` `aria-placeholder` `alt` `label` `description` `tooltip`。值可以是字符串、模板字面量（带表达式的整体包裹，运行时按模板匹配） |
| C | 对象字面量属性值 | 键名在白名单：`label` `description` `title` `placeholder` `tooltip` `emptyText` `confirmLabel` `cancelLabel`。值是字符串或模板字面量 |
| D | 白名单函数的字符串参数 | 初始为空，T03 调研后补充，每一项都要在 handoff 里列出 |

A、B、C 的属性名、键名白名单，T03 可以根据调研扩充，扩充项必须写进 handoff 并附理由。

**位置扩充（2026-10-05 调度方复核 T03 后定案）：**
- 已接受（T03 偏离第 2 条）：JSX 子表达式里直接渲染的字符串（条件分支、`&&` 右侧、`||`/`??` 两侧）计入 A；B/C/D 的值同样覆盖条件分支、`&&` 右侧、`||`/`??` 两侧；解构默认值 `({ label = "…" })` 计入 C。条件本身（比较、`&&` 左侧）照旧不动。
- E1：`as const` 数组或对象里，键名在 C 类白名单的属性值按 C 类处理（照常做值用途检查）；预扫描不再把这些键的值记为值用途字面量。`as const` 里的其他元素（无键名的数组元素、非白名单键的值）仍然从不转换。
- E2：赋给名字以 `LABEL`/`LABELS`/`_TITLE`/`_TITLES`/`Labels`/`Copy` 结尾的变量的对象字面量，其所有字符串值按 C 类处理（照常做值用途检查）。该对象字面量带 `as const` 时同样适用（2026-10-05 复核 T03-r1 后追加，这是 `as const` 禁转的第二个例外）：预扫描不把这个映射对象自身的字符串值记为值用途，但同一字符串在其他任何值用途位置出现时照常判 suspicious；映射对象里非字符串字面量的子表达式（调用参数、模板插值、条件 test 等）仍按原规则收集值用途。T03 须在 handoff 列出基线里全部 E2×`as const` 命中及逐条核对结论。
- E3：名字以 `Label`/`Title`/`Text`/`Description`/`Message` 结尾、或以 `format`/`describe` 开头的函数，其 `return` 的字符串或模板字面量按 C 类处理（照常做值用途检查）。
- 模板误配（T03 偏离第 4 条）：静态文本不在 `messages` 却会被某条模板匹配、或带表达式的模板字面量会被骨架不同的模板匹配时，记为 suspicious（reason `template-collision`），不包裹。补上精确的 `messages` 词条或加进 `dict/allow-suspicious.json` 后才转换。

**从不转换：**
- 比较运算（`===` `!==` `==` `!=`）两侧、`switch` 的 `case`
- 对象键名、计算属性键、import/export 来源、TS 类型位置（含字面量类型）、enum
- `as const` 断言的数组或对象里的元素（E1 规定的白名单键的值除外）
- 属性 `className` `class` `style` `id` `key` `href` `src` `type` `role` `name` `value` `for` `htmlFor` `target` `rel` `data-*`
- `console.*` 的参数、`new Error(...)`、`throw`、正则、带标签的模板字面量
- 带有 `/* t3zh-skip */` 注释的节点（逃生口）
- 文本和表达式混排的 JSX 子节点（如 `<span>{count} files</span>`），v1 记为 skip，原因写 `mixed-jsx`

**受保护的语法形式与已知限制（2026-10-05 复核 T03-r3 后定案；r7 后修订，见收敛标准）：**

上面"从不转换"里凡是按调用对象识别的位置（`console.*`、`new Error`/`Error(...)` 及 `*Error`/`*Exception`、`RegExp`、`*.constructor(...)`、非显示调用、D 类白名单函数），调用对象按以下语法形式解析，任一可能指向受保护目标就按受保护处理（保守）：
- 标识符、成员访问、静态计算成员（`a["b"]`）、可选链（`a?.b`、`a?.()`）；
- 运行时无影响的包装：括号、`as`、`satisfies`、`<T>x`、非空断言 `!`；
- 逗号表达式取末项；条件表达式、`&&`/`||`/`??` 取所有可能的结果分支；
- `.call(...)`、`.apply(...)`、`.bind(...)(...)` 作用在受保护目标上。**组合识别深度上限 2 层**（如 `X.bind(…)(…)`、`X.bind.call(T, …)`）：更深的组合、以及 `X.bind.call/apply` 的实参含展开时，不再精确求值，按「子树里点到的任何函数都可能被调用」保守处理（matcher 的 mentionedTargets）；
- `*.constructor(...)`：任何对象的原生 constructor 不写出受保护目标的名字就能拿到它（`(/x/).constructor === RegExp`），接收者类型静态不可知，整个类别受保护；
- 全局对象前缀：`globalThis.`、`window.`、`self.`；
- `Error`、`RegExp` 不带 `new` 的直接调用。

另外，以下位置的字符串参数或操作数记为值用途（预扫描收集，同文本的 C/E 类候选判 suspicious）：`in` 运算符左侧；`.get/.set/.delete/.has/.getItem/.setItem/.removeItem/.hasOwnProperty` 的首个参数；`Object.hasOwn` 的第二个参数；字符串方法 `.startsWith/.endsWith/.replace/.replaceAll/.match/.matchAll/.search/.split/.localeCompare` 的字符串参数。

**已知限制，不在保护范围内**：变量或参数别名（`const log = console.log; log(x)`）、跨变量、跨函数、跨模块的数据流（值用途字面量集合之外）、动态计算成员（`console[method]`）、`Reflect.apply`、`eval`/`new Function`、字符串拼接生成的键。静态语法分析做不到这些，靠以下两点兜底：值用途预扫描；T04 报告里的 A/B 值用途重名清单和 suspicious 清单供人工核对。

**收敛标准**（审核据此定级；2026-10-05 Kimi 设计评审后修订，见 reviews/T03-design-kimi.md）：
- 阻断只有一种：问题能在 upstream 基线真实代码里复现。`scripts/check-exotic-forms.ts` 固化各轮攻防涉及的异形调用形态的基线扫描，升级基线时重跑并写进 T04 报告；某类形态从 0 变非 0，它就不再是理论构造，按本条重新评估。
- 例外（一次性类别封闭）：构造反例揭示一个**新类别**（不是已知类别、也不是已封闭类别的更深实例），且修复通用、对基线判定零影响时，值得做最后一轮封闭；封闭完成后，该类别的更深变体一律进已知限制，不再修。T03 的 `*.constructor(...)` 整体保护和 `X.bind.call/apply` 含展开（r7）是按本条做的最后一次封闭。
- 其他只能靠已知限制、或超出上面深度上限构造的反例：记为次要，写进 handoff 的已知限制，不阻断、不修复。

**可疑项：**
- 先全仓库预扫描，收集出现在"从不转换"位置的字符串（比较、case、`as const`、字面量类型、对象键），记为"值用途字面量"。
- A、B 位置的文本即使和值用途字面量相同，也照常转换（它们只用于显示），但要在报告里列出。
- C 类位置的文本如果和值用途字面量相同，默认**不转换**，记为 suspicious。人工确认安全后，可以加进 `dict/allow-suspicious.json` 放行。

例子：`KeybindingsSettings.tsx` 里有 `row.source !== "Default"`，`SettingInheritance.tsx` 里又有 `label: "Default"`。前者属于值用途，绝不能动；后者是 C 类可疑项，默认跳过。

## 5. 运行时约定 `runtime/t3zh-runtime.ts`

- 插件通过虚拟模块 `virtual:t3zh-runtime` 注入 `import { __t3zh_t } from "virtual:t3zh-runtime"`。
- `__t3zh_t(value)` 的查表顺序：
  1. 参数不是字符串时原样返回；当前语言是 `en` 时原样返回。
  2. 用去掉首尾空白的文本查 `messages`，命中后把原有的首尾空白拼回去。
  3. 按 `templates` 匹配：模板编译成正则，长模板优先，占位符匹配 `(.+?)`，命中后把捕获值代入中文模板。
  4. 都没命中，原样返回。
- **语言偏好：**
  - 存在 `localStorage["t3code-zh.locale"]`，取值 `system`、`en`、`zh-CN`，默认 `system`。
  - `system` 时的语言来源（2026-10-05 定案，原因：打包配置 `electronLanguages: ["en-US"]` 让 Electron 的 `navigator.languages` 第一项固定为 `en-US`，实测本机为 `["en-US","zh-Hans-CN"]`）：
    1. `globalThis.__t3zhSystemLanguages` 是非空字符串数组时用它（由 T07 在桌面版 preload 里通过 `contextBridge.exposeInMainWorld` 暴露，内容是主进程的 `app.getPreferredSystemLanguages()`）；
    2. 否则在 Electron 里（`navigator.userAgent` 含 `Electron/`）用 `navigator.languages` 去掉第一项后的列表（去掉后为空就用原列表）；
    3. 否则用 `navigator.languages`（为空就用 `navigator.language`）。
  - 对上面得到的列表依次检查，取第一个可识别的：语言是 `en` 返回 `en`；语言是 `zh` 且 `new Intl.Locale(x).maximize().script === "Hans"` 返回 `zh-CN`；`zh-Hant` 返回 `en`；其他语言跳过看下一项。都不符合返回 `en`。
- **全局 API**（给补丁用）：`window.__t3zh = { getLocale(), getResolvedLocale(), setLocale(v), t(value) }`。`setLocale` 写入 localStorage 后调用 `location.reload()`。`t` 与插件注入的 `__t3zh_t` 是同一个函数（2026-10-05 追加），供补丁在"显示位置"翻译那些同时被代码当作值比较、因而插件不能转换的文字：比较逻辑保持英文，只在渲染处调用 `globalThis.__t3zh?.t?.(x) ?? x`。
- **补丁调用 `t()` 的规则**（2026-10-05 定案，依据 T07 实测：运行时对不在 messages 里的文字照样做模板匹配，任意英文直接传给 `t()` 时，2921 条错误文字里有 1668 条会被 `{head} to {base}`、`{0}d` 等宽模板改坏）：
  1. 只对取值可以穷举的表达式调用 `t()`：字面量、有限的标签/状态集合，并且每个可能取值都有精确的 messages 词条。不对 `error.message`、服务端或主进程返回的任意文字、用户内容调用 `t()`。
  2. 显示位置混有已知值和任意值时，用精确名单门控（只翻名单内的值），或只包裹已知值那一支子表达式。
  3. 只在最终渲染处调用。比较、查表、存储、作键、发给服务端或 AI 的值保持英文，不在值的定义处或数据对象里翻译。
  4. 拼接出来的文字：为每种组合补精确词条，或者用骨架唯一的专用模板，并用测试证明它不会截走别的文字。
  5. 名单不要写成 `new Set([...字面量])` 或 `[...].includes(x)`，否则预扫描会把这些元素记为值用途。写成普通数组再传给 `Set`。
  6. 每个调用 `t()` 的补丁都配运行时测试：用真实主词库的 `createTranslator`，对每个可能取值断言译文，并对有代表性的名单外文字断言原样返回。
- 语言只在页面加载时确定一次，切换语言必须刷新页面。原因：React Compiler 会缓存渲染结果，全局函数的返回值变了不会触发重渲染。
- 设置 `document.documentElement.lang` 为解析后的语言。
- `en` 模式下，界面输出必须和原版完全一致。例外（2026-10-05 定案）：桌面版 app 带 `zh-Hans.lproj` 本地化（让 macOS 自动插入的菜单项显示中文，与 0.0.45 中文版相同）。在系统语言为简体中文的 Mac 上，Electron 的应用 locale 因此变成 zh-Hans，日期、数字等 `Intl` 默认格式随之变化；在这类机器上把界面切到 English 时，这些格式与原版不同，这在允许范围内。英文系统不受影响。

## 6. 构建产物命名

- 汉化版版本号：`0.0.46-n<nightly 号>.zh.<N>`（nightly 号取基线 tag 末段，如 `v0.0.46-nightly.20261007.2761` → `n2702`；基线 2644 时为 `0.0.46-n2644.zh.<N>`）。对外交付的构建同一基线每打一次 N 加 1；任务内部的验证性构建（如 T03 的幂等测试、审核复跑）可复用已有版本号或加 `-review` 后缀，不算交付。基线原版构建用 `0.0.46-n2644.base`。
- 版本号里不能出现 `-nightly.YYYYMMDD.N` 形式，否则产品名会变成 `T3 Code (Nightly)`，和官方版重名（依据：`scripts/build-desktop-artifact.ts` 的 `resolveDesktopProductName`）。
- 产物输出到 `~/Projects/t3code-zh/release/`。

## 7. 交接格式 `handoff/Txx.md`

```markdown
# Txx 交接
- 执行模型：
- 提交：<hash 列表>
- 改动文件：

## 做了什么
## 验收命令与结果
（逐条：命令 → 实际输出摘要 → 是否达标）
## 偏离说明书的地方及原因
## 已知问题 / 未完成
## 给下一个任务的提示
```

## 8. 提交规范

- 任务提交：`T0X: <一句话>`；修复提交：`T0X-fix<N>: <一句话>`；审核报告提交：`T0X-review-r<N>`。
- 同一轮里并行的任务改的是不同目录，提交时只 add 自己的文件。
