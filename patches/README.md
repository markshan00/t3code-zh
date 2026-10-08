# 补丁清单

上游源码保持原样是本项目的路线，只有少数「必须改上游文件」的地方才做成补丁。补丁按文件名里的编号顺序，由 `scripts/build-zh.sh` 在干净的基线工作树里逐个 `git apply`。补丁打不上时构建会立即报错，不会悄悄产出半成品。

所有补丁都在基线 tag `v0.0.46-nightly.20261007.2774`（commit `611132c171f3a821bd2e32f22261135cef6330ac`）上验证过。

每个补丁文件开头有若干行 `#` 说明用途——`git apply` 会忽略 diff 之前的文字，所以那些行不会进源码。

| 编号 | 文件 | 用途 | 涉及的上游文件 |
|---|---|---|---|
| 0001 | `0001-language-setting.patch` | 在设置「常规」页加一行语言选择（System / English / 简体中文） | `apps/web/src/components/settings/SettingsPanels.tsx`、`apps/web/src/components/settings/settingsSearch.ts`、`apps/web/src/vite-env.d.ts` |
| 0003 | `0003-desktop-main-zh.patch` | 桌面主进程的界面文字（菜单栏、右键菜单、原生对话框等）；把系统语言暴露给 web 运行时（T07） | `apps/desktop/src/window/DesktopApplicationMenu.ts`、`apps/desktop/src/window/DesktopWindow.ts`、`apps/desktop/src/preload.ts`、`apps/desktop/src/app/DesktopApp.ts`、`apps/desktop/src/permissions/MacPermissionHelper.ts`、`apps/desktop/src/preview/Manager.ts`、`apps/desktop/src/snapShot/SnapShotTransition.ts` |
| 0004 | `0004-display-site-translation.patch` | 显示位置补译：同时被代码当作值比较的界面文字，只在渲染处翻译（T06，说明见补丁头和 `handoff/T06.md`「追加任务：0004」） | 19 个 `apps/web/src/…` 文件，见补丁头 |
| 0005 | `0005-desktop-zh-hans-localization.patch` | 给 app 声明简体中文本地化，macOS 自动插入的菜单项跟随简体中文系统（T07-fix1） | `scripts/build-desktop-artifact.ts` |
| 0006 | `0006-desktop-ipc-display-strings.patch` | 桌面主进程经 IPC 传给 web 显示的文字，在 web 显示处只按已知名单翻译（T07-fix1） | `apps/web/src/desktopIpcStrings.ts`（新文件）、`apps/web/src/components/settings/ConnectionsSettings.tsx`、`apps/web/src/components/settings/SnapShotSettings.tsx`、`apps/web/src/components/settings/SnapShotSetupDialog.tsx`、`apps/web/src/components/desktop/SnapShotCoordinator.tsx`、`apps/web/src/components/ServerUpdateAction.tsx` |
| 0007 | `0007-new-thread-display-strings.patch` | 新建任务页面上插件包不到的英文（默认名 `No project` / `New thread`、大标题混排句、断开阶段的输入框提示），在显示处翻译（T09） | `apps/web/src/newThreadDisplayStrings.ts`（新文件）、`apps/web/src/components/chat/ChatHeader.tsx`、`apps/web/src/components/chat/DraftHeroHeadline.tsx`、`apps/web/src/components/Sidebar.tsx`、`apps/web/src/components/chat/ChatComposer.tsx`、`apps/web/src/components/settings/SettingsFontPreviews.tsx`、`apps/web/src/hooks/useThreadActionMenu.ts`、`apps/web/src/hooks/useThreadActions.ts` |
| 0008 | `0008-inline-value-display-strings.patch` | 2702 新增的七处「英文句子中间嵌运行时值」的显示文字（Webhook 投递记录、工具输出失败与退出码、HTML 预览失败、附件截断提示），在显示处整句翻译（T10-fix1） | `apps/web/src/components/settings/ScheduledTasksSettings.tsx`、`apps/web/src/components/chat/V2ItemInspector.tsx`、`apps/web/src/components/chat/HtmlRenderFrame.tsx`、`apps/web/src/components/files/AttachmentFilePreview.tsx` |
| 0009 | `0009-acceptance-display-strings.patch` | Codex 实机验收发现的显示漏译：设置、模型、快捷键、命令面板、Diff、工具汇总与辅助功能 | 21 个显示文件及新增 `apps/web/src/acceptanceDisplayStrings.ts`，完整清单见补丁与 `handoff/T10-acceptance-fix.md` |
| 0010 | `0010-desktop-recheck-display.patch` | zh.3 复验漏项：用量汇总行、提供方状态、运行中命令、轮次导航、星期辅助标签、侧栏时间 | 8 个文件，完整清单见补丁与 `handoff/T10-zh4-fix.md` |
| 0011 | `0011-minor-display-fixes.patch` | zh.5 小修：侧栏任务行读屏名称里的状态、提供方提示关闭按钮的读屏名称、「运行命令 + 更改文件」汇总句 | `apps/web/src/acceptanceDisplayStrings.ts`、`apps/web/src/components/Sidebar.tsx`、`apps/web/src/components/chat/ProviderStatusBanner.tsx` |
| 0012 | `0012-file-reveal-menu-labels.patch` | zh.6：文件芯片与工作区文件菜单中动态平台标签 `Reveal in Finder` 等补译；原生菜单和浏览器入口共用精确名单 | `apps/desktop/src/electron/ElectronMenu.ts`、`apps/web/src/contextMenuFallback.ts` |
| 0013 | `0013-n2761-display-strings.patch` | n2761 新增混排与权限提示的显示翻译 | 17 个 web 显示组件 / hooks 和 1 个精确名单 helper，见补丁 |
| 0014 | `0014-bootstrap-sqlite-boolean.patch` | 维护者授权的配对 SQLite 布尔参数修复 | `apps/server/src/persistence/AuthPairingLinks.ts` |
| 0015 | `0015-connect-auth-recovery.patch` | 维护者授权的 T3 Connect 加载 / 失败 / 超时入口和手动重载 | `apps/web/src/components/clerk/T3ConnectSidebarSignIn.tsx` 及其行为测试 |
| 0016 | `0016-n2774-display-strings.patch` | n2774 新增的混排显示文字：「压缩并发送」提示与菜单项、拉取请求检查失败计数、项目动作菜单名的角色后缀、移动端收起输入框的压缩发送读屏名 | `apps/web/src/components/chat/ComposerPrimaryActions.tsx`、`apps/web/src/components/pullRequest/PullRequestChecksPopover.tsx`、`apps/web/src/components/ProjectScriptsControl.tsx`、`apps/web/src/components/chat/ChatComposer.tsx` |
| 0017 | `0017-native-residual-display-strings.patch` | T14 原生检查的旧残留：推理档位、分页、Clerk 读屏名、连接计数、设置选值与说明、发送状态、Agent 失败数 | 13 个 web 文件；见补丁和 T14 交接 |
| 0018 | `0018-usage-account-columns.patch` | T15 额度面板按账号分列 | `apps/web/src/components/usage/UsageLimitsPooled.tsx` |
| 0019 | `0019-bundle-t3-code-license.patch` | T16 在签名前打进基线 T3 Code MIT 许可证 | `scripts/build-desktop-artifact.ts` |

## 0011 minor-display-fixes

- 在 0010 之后应用。侧栏任务行的读屏名称由 `resolveSidebarRowAccessibility` 拼成「标题, 状态, 项目」，状态部分原来直接用 `topStatus.label`（英文，因为它同时用于排序和图标，插件判为可疑不转换）。现在只在传给读屏名称时经精确名单翻译；`topStatus` 对象本身不变。草稿行的「Unsent draft」同样走名单。
- 提供方提示的关闭按钮原来是 `Dismiss ${providerName} provider ${status.status}`，宽模板只能翻前半句，状态值 `warning` 等留英文。现在按 `ready` / `warning` / `error` 三个状态各用一条固定骨架，provider 名称在翻译后插入；其他状态保持原英文整句，不送进 `t()`。
- 工具汇总「已运行 N 条命令 and 已更改 N 个文件」改用两条专用双槽位模板（两种顺序各一条），输出「已运行 N 条命令，已更改 N 个文件」。只认这两个计数分句，含工具名、集成名或用户内容的汇总原样不动；不再查通用的 `and` 词条。
- 同一版本里只改词库、不改代码的两处：`Checked {time}` 译为「{time}检查」（「刚刚检查」），`Press {0} + Enter to do the opposite for one message.` 与另外两条同类句子统一用「回车」。
- 0010 顺带修正：`ProviderInstanceCard.tsx` 的 import 原来插在 `"use client"` 指令前面，改到指令之后。
- 测试：`acceptance-display-strings.test.ts` 新增三项，并更新汇总句、快捷键说明和检查时间的预期。

## 0010 desktop-recheck-display

- 在 0009 之后应用。用量当前走 `UsageLimitsPooled`，此次在实际汇总卡片调用精确名单翻译；自定义覆盖标签保持原文。
- 运行中命令只在 `liveWorkEntryLabel` 的内置命令分支通过显示回调翻译动词，程序名、推理内容、工具自定义标题原样。默认回调保持原函数行为。
- 提供方初始状态仅翻译 Codex / Claude / OpenCode 三条已核对的完整原文；其他错误不送入模板。动态 provider 名经槽位隔离后插入标题。
- 星期、轮次导航与侧栏时间只改显示值。Webhook 的 `DEFAULT_WEBHOOK_PROMPT` 是会保存和发送给 Agent 的提示词，不作界面翻译。
- `acceptance-display-strings.test.ts` 除 helper 还读取实际汇总组件的 JSX 表达式求值，覆盖中英文、无运行时、自定义标签及动态值隔离。

## 0001 language-setting

- 只加 UI 入口，不引入自己的状态：读写都走运行时注入的 `window.__t3zh`（CONVENTIONS §5）。
- `window.__t3zh` 不存在时整行不渲染（`typeof window !== "undefined" && window.__t3zh ? … : null`），所以脱离汉化运行时构建的原版也不会报错。
- 文案 `Language` / `System` 由词库翻译（`dict/zh-CN.json` 里已有）；`English` 和 `简体中文` 是语言本名，**固定原样显示、不查表**，这样中文界面下也能一眼找到切回英文的选项。补丁新增的英文字符串不在 `upstream/` 里，T04 的覆盖率报告看不到，需要的词条由 T06 直接补进 `dict/zh-CN.json`。
- `settingsSearch.ts` 的目录项是为了让设置搜索能搜到这一行，并让 `searchableSetting("language")` 拿得到锚点 id。不想要这个入口时可以整段删掉，行为不受影响。

## 已停用：0002 composer-resting-tween

- zh.9 起按维护者要求恢复原版输入面板的动画、外观与收起／展开行为，停用全部自定义动画调度。旧补丁保存在 `disabled/0002-composer-resting-tween.patch`，构建脚本只读取本目录顶层的 `.patch`，不会应用它。
- `ChatComposer.tsx` 仅保留 0007 的翻译改动；`useComposerFocusState.ts`、`index.css` 和输入面板样式使用当前基线原始内容。0007 可直接应用到原版 ChatComposer，不依赖停用补丁。
- 维护者本地上游克隆中的未提交改动保持原样；恢复仅作用于本汉化仓库的构建。

## 0003 desktop-main-zh

- 主进程里用户可见的英文原文包成 `__t3zh_t(<原表达式>)`。`__t3zh_t` 从 `apps/desktop/src/t3zh/t3zh-desktop.ts` 导入——这个目录**不在补丁里**，由 `scripts/build-zh.sh` 第 5 步复制进去：`plugin/desktop/t3zh-desktop.ts`、`runtime/t3zh-runtime.ts`（查表和语言解析与 web 共用一份代码）、`dict/zh-CN.desktop.json`。所以单独 `git apply` 这个补丁后的源码不能直接构建，要走 `build-zh.sh`。
- 语言只跟随系统：`app.getPreferredSystemLanguages()` 按 CONVENTIONS §5 的列表检查规则解析，解析为 en 时 `__t3zh_t` 原样返回，菜单、对话框与原版逐字一致（实测见 `handoff/T07.md`）。主进程读不到 web 的 localStorage，所以不看设置里的「语言」。
- role 菜单项保留 `role`、`accelerator`、`enabled`，只加 `label`；`{ role: "windowMenu" }` 写出与 Electron 默认相同的子菜单，好给各项加标签。新增要翻译的文字时，词条加进 `dict/zh-CN.desktop.json`（`plugin/__tests__/desktop.test.ts` 会检查补丁里每个包裹的英文都有词条、词库里每条都有出处）。
- 系统语言：主窗口 `webPreferences.additionalArguments` 传 `--t3zh-system-languages=<JSON 数组>`，preload 从 `process.argv` 读出后 `contextBridge.exposeInMainWorld("__t3zhSystemLanguages", …)`（§5 语言来源第 1 级）。参数缺失或不合法时不暴露，web 运行时退回第 2 级。
- 插进主进程自己拼的 `data:` HTML 时用 `__t3zh_html`（查表后 HTML 转义），插进内联 `<script>` 时用 `__t3zh_js`（查表后写成 JS 字符串字面量，`<` 转 `\u003c`）；被包裹的英文原文不含需要转义的字符，en 时输出与原版逐字相同（测试有源码级比对）。
- 调研清单（包括没翻译的类别和理由）：`reports/desktop-main-strings.md`；810 条扫描结果的逐条归类：`reports/desktop-main-strings-appendix.md`（`plugin/desktop/classify-strings.ts` 生成，`desktop.test.ts` 核对与生成器输出一致）。

## 0005 desktop-zh-hans-localization

- electron-builder 的 `mac.extendInfo` 加 `CFBundleLocalizations: ["en", "zh-Hans"]`。系统语言为简体中文时，AppKit 按应用的本地化语言插入的菜单项（自动填充、开始听写…、移动与调整大小、退出并保留窗口等）显示中文；英文系统不变（实测与原版逐字一致，见 `handoff/T07.md`「修复记录 r0→fix1」）。
- 只声明本地化，不加 `zh-Hans.lproj` 目录：两种做法在同一构建的副本上实测效果相同。`electronLanguages` 仍是 `["en-US"]`。
- 副作用（CONVENTIONS §5 末尾的例外）：简体中文系统上应用 locale 变成 zh-Hans，渲染进程的 `navigator.languages` 第一项和 `Intl` 默认格式随之变化，界面切到 English 时日期等格式与原版不同。
- `build-zh.sh` 第 11 步打包后从 zip 里读 Info.plist，`CFBundleLocalizations` 不含 `zh-Hans` 就停。

## 0006 desktop-ipc-display-strings

- 新文件 `apps/web/src/desktopIpcStrings.ts` 的 `translateKnownDesktopString(x)`：只有名单里的精确文字才交给 `globalThis.__t3zh?.t?.(x)`，其余原样返回。名单外的文字不能交给 `t()`——这些显示位置还会收到任意英文，主词库的宽模板（`{head} to {base}`、`{0}d` 等）会把它们改坏。
- 名单：连接设置的端点名、截图的 macOS 权限提示与快捷键检测结果、远程更新失败原因（`Server update failed: <原因>`）；词条在 `dict/zh-CN.json`。名单写成普通数组再传给 `Set`：写成 `new Set([...字面量])` 会被转换插件的预扫描当成值用途，影响别处同名文字的翻译。
- 类型上依赖 0004 在 `vite-env.d.ts` 补的全局 `var __t3zh`，须在 0004 之后应用。
- 上游升级后：主进程的这些文字改了，`plugin/__tests__/desktop-ipc-strings.test.ts` 会报出来（名单逐条核对上游源码）；新增的 IPC 显示文字要同时加进名单和主词库。

## 0007 new-thread-display-strings

- 新文件 `apps/web/src/newThreadDisplayStrings.ts` 三个入口：
  - `displayDefaultName(x)`：只有名单 `New thread`、`No project` 里的精确值交给 `t()`，其余（用户起的项目名、任务标题）原样。两者都是数据值：`No project` 是服务端临时项目的 title，`New thread` 是新任务默认标题，服务端按 `=== "New thread"` 决定是否重新生成标题——所以只包最终渲染处，数据对象、比较、重命名输入框初值不动。
  - `translateAroundSlot(before, after)` / `fillSlot(before, value, after)`：句子中间嵌组件或项目名时，用 U+E000 占住槽位，把「固定骨架 + 槽位」整句交给 `t()`，命中词库专用模板后在槽位处切开。`t()` 只收到固定骨架，项目名在翻译之后才插入，不会被宽模板改坏；没命中模板或槽位不唯一时返回原样英文两段。
  - `translateFixed(x)`：只用于有精确 messages 词条的固定字面量 / 常量（输入框提示、h1 aria-label 的固定分支）。
- 依赖 0004（Sidebar.tsx、`vite-env.d.ts` 的全局 `var __t3zh`），须在其之后应用；ChatComposer 的翻译改动直接基于原版。
- 词库：`{project} to start` 译文为「{project}后开始」（槽位里是项目选择器，未选项目时显示「选择项目」）。
- 测试 `plugin/__tests__/new-thread-display-strings.test.ts`：真实主词库逐条断言、查表次数 0/1 锁定、h1 aria-label 补丁前后在 en 模式逐个相同、转换判定只少预期的跳过项、新文件不产生候选与值用途。
- 上游升级后：默认名或这几句文案改了，测试的「默认名与上游源码一致」和模板命中断言会报出来；新的显示位置（例如上游新增列出任务标题的地方）要另行补 `displayDefaultName`。

## 0008 inline-value-display-strings

- 复用 0007 的 `fillSlot` / `translateFixed`（`apps/web/src/newThreadDisplayStrings.ts`），须在 0007 之后应用。
- 七处都是文字与表达式混排的 JSX，插件按 mixed-jsx 跳过：`Deliveries · <任务名>`、`Empty placeholders: <字段>`、`<n> empty placeholder(s)`（复数后缀）、`Couldn't load output: <错误>`、`exit <退出码>`、`Unable to load <HTML 标题>`、附件超过 1 MB 的截断提示。整句改成 `fillSlot(前段, 值, 后段)`，`t()` 只收到「固定骨架 + U+E000」，值在翻译之后插入；复数后缀拆成单 / 复数两条骨架；截断提示没有文件大小的一支走 `translateFixed`。
- 词库：8 条专用模板 + 1 条 messages，登记在 `dict/todo/v0.0.46-nightly.20261005.2702.extra.json`。`exit {0}`、`Unable to load {0}` 字面部分较短，测试对源码全部 translate 候选查表，证明没有被它们截走的文字。
- 测试 `plugin/__tests__/inline-value-display-strings.test.ts`：从补丁前后源码各取出那个 JSX 元素按 React 规则求值，en / 无运行时与原版逐字相同、zh 为整句中文且 `t()` 只收到骨架；转换判定只少这几处跳过项；调用点清单锁定。
- 上游升级后：这几句文案改了，测试的元素定位或骨架命中会报出来；上游再新增同类混排句，照这个写法补。

## 0009 acceptance-display-strings

- 对应 `reviews/T10-acceptance-codex.md` 已确认的文字问题，接在 0008 后应用；不改变 matcher 的通用转换边界。
- 有限显示名称按精确名单查表；计数、时长、错误标签、快捷键说明使用固定骨架，动态内容在翻译后插入。快捷键命令、模型选项 ID、项目／任务数据不变。
- 命令面板仅处理添加项目来源项的固定标题／描述；自定义项目名、外部描述以及 React 元素原样通过。快捷键脚本名不在固定命令名单中，不翻译。
- `SettingsFontPreviews` 的固定示例在本地初始化时查表，不涉及发给 Agent 的提示词。
- 测试：`node --test plugin/__tests__/acceptance-display-strings.test.ts`；包含全补丁应用、有限词条、动态值隔离、英文／无运行时输出及语法检查。
- 版本不一致单独由 `build-zh.sh` 修复：仅在构建工作树内同步 server package 版本，构建后检查 CLI 的 `t3 v<交付版本>`，结束时核对 package 除版本外逐字段未变。

## 上游变化后怎么重做

补丁是「按文本打」的，上游改到补丁碰过的行就会失败。失败的处理步骤：

1. 先看构建报错里是哪个补丁、哪个文件、哪个 hunk。
2. 建一个**待升级基线**的临时工作树（下面的 `v0.0.46-…` 换成新 tag），把补丁**按顺序真实应用**（`--check` 只做检查、不打改动），看看冲突在哪：
   ```sh
   NEW=v0.0.46-nightly.<新版本>
   git -C ~/Projects/t3code worktree add --detach /tmp/t3zh-patchcheck "$NEW"
   for p in ~/Projects/t3code-zh/patches/*.patch; do
     git -C /tmp/t3zh-patchcheck apply "$p" || { echo "FAIL $p"; break; }
   done
   ```
3. 在临时工作树里手工把冲突的改动移植到新代码上（改动本身很小：0001 三处文件、0003 七处文件、0005 一处、0006 六处；0004 见其补丁头）。
4. **按补丁逐份导出**，不要把整棵树的 diff 一股脑导出——那样多份补丁会混在一起。只对出问题的那份补丁涉及的文件导出，例如重做 0001：
   ```sh
   git -C /tmp/t3zh-patchcheck diff -- \
     apps/web/src/components/settings/SettingsPanels.tsx \
     apps/web/src/components/settings/settingsSearch.ts \
     apps/web/src/vite-env.d.ts > /tmp/new-0001.patch
   ```
   （0003 用上表列的七个 `apps/desktop/src/…` 文件。重做 0003 后跑 `node --test plugin/__tests__/desktop.test.ts`；0005 用 `scripts/build-desktop-artifact.ts`；0006 用上表列的五个组件文件，新文件 `apps/web/src/desktopIpcStrings.ts` 用 `git diff --no-index /dev/null <文件>` 导出，重做后跑 `node --test plugin/__tests__/desktop-ipc-strings.test.ts`；0008 用上表列的四个文件，重做后跑 `node --test plugin/__tests__/inline-value-display-strings.test.ts`。）
   导出的是纯 diff，把它接回对应补丁开头那段 `#` 说明文字之后即可。
5. **把补丁开头说明里的基线 tag 也一起更新**（现在是 v0.0.46-nightly.20261007.2774），并同步 CONVENTIONS.md 的基线和 `dict/zh-CN.json` 的 `baseline`。
6. 在**全新的**干净临时工作树里按顺序把整组补丁重新 `apply` 一遍，确认都能打上、改动的文件就是清单里的那些，再跑 `scripts/build-zh.sh` 验证；把重做经过写进当次的 handoff。

`/tmp/t3zh-patchcheck` 用完记得删：
```sh
git -C ~/Projects/t3code worktree remove /tmp/t3zh-patchcheck
```

## 注意

- 补丁只允许改「必须在源码里改」的东西。能靠转换插件或词库解决的一律不要做成补丁。
- 不要用 `git apply -3`／`--reject` 之类的容错参数兜底：打不上就应该报错，让构建停下。
- 补丁的改动要尽量小、尽量贴着现有代码风格写，方便随上游重做。

## 0013 n2761-display-strings

- n2761 新增显示路径：网页文件选择、外部 Agent 回调说明、GitHub 账户与环境变量说明、浏览器资料清理，以及连接权限错误（任务、导入、设置、目录、文件搜索 / 读取、附件上传等新增路径）。
- 固定文字在显示处调用 `translateFixed`；任意动态值通过 0007 的 U+E000 骨架翻译后原样插回。权限错误只翻译精确名单，数据定义、判断和服务端错误保持原样；源代码管理权限提示沿用 0004 的显示 helper。
- 实际源码表达式求值、英文原样、动态值隔离和模板干扰检查：`plugin/__tests__/n2761-display-strings.test.ts`。
- n2774 移植（T13）：上游删掉了 ChatView 的「Resume with less context」横幅，原补丁包在其提示里的 `compactDisabledReason` 这一处随之去掉，其余改动逐行不变（「+」行只少这 1 行）；`compactDisabledReason` 仍在 ContextWindowMeter 的显示处翻译。测试名单同步去掉 ChatView 这一项，并改为断言 ChatView 不再直接渲染该变量。

## 0014 bootstrap-sqlite-boolean

- 维护者于 2026-10-07 明确授权的上游功能修复：`AuthPairingLinks.ts` 的 SQLite 作用域条件参数由布尔值改为等价 `1/0`，避免原生 SQLite 驱动 `ERR_INVALID_ARG_TYPE`。权限检查和令牌消费条件保持原样。
- 上游真实 `PairingGrantStore.test.ts` 包括单次消费、过期、撤销和作用域拒绝等：原版 4/10，修复副本 10/10。最终构建及运行结果见 `handoff/T11.md`。

## 0015 connect-auth-recovery

- 向维护者说明加载失败入口隐藏的原因及拟修复行为后，维护者明确要求「修复」。采用已有 ClerkLoading / ClerkFailed / ClerkLoaded；加载和认证信息等待时保留状态，失败或加载超过 15 秒后提供手动「重新加载应用」。
- 重载前提醒保存未完成输入；不自动刷新。正常登录按钮、已登录头像及无云配置路径保持。SDK、会话、权限、网络设置和输入框行为均未更改。
- 新增 4 条精确 messages，配套 9 项行为测试。真实 SDK 故障夹具及最终 web 产物的失败/重载验证边界见 [T12 交接](../handoff/T12-connect-auth-recovery.md)。

## 0016 n2774-display-strings

- 在 0015 之后应用，复用 0007 的 `fillSlot` / `translateFixed`（ChatComposer 已由 0007 导入），兼容更早补丁对 ChatComposer 的修改。三处都是 n2774 新增、插件按 mixed-jsx 跳过或无法包裹的显示文字：
  - 旧 Claude 任务的「压缩并发送」按钮：提示 `Summarize <n> tokens of history, then send` 与菜单项 `Send with full history (<n> tokens)`。Token 数在翻译后插入。按钮文字 `Compact and send` 与菜单按钮读屏名 `Send options` 靠词库精确词条解决，不在补丁里。
  - 拉取请求检查的失败计数 `<n> failed`（任务详情 PR 行第二行）。
  - 项目动作菜单名：上游把 `${name} (setup)` 挪进 `packages/shared` 的 `projectScriptMenuLabel`，返回 `${name} (${roles})`，插件判为 no-letters 不包，原先已翻译的「（初始化）」会退回英文。`displayScriptMenuName` 只把有限的角色后缀（` (setup)` / ` (on settle)` / ` (setup, on settle)`）连同槽位交给 `t()`，脚本名在翻译后插入；没有角色时原样返回、不查表。
- T13-fix1 I1：移动端输入框收起时，最终 `aria-label` 改为 `translateFixed(collapsedComposerPrimaryActionLabel)`。变量定义、判断和发送行为保持原样；三个固定取值都有精确 messages 词条，新增 `Open composer to compact and send` →「打开输入框以压缩并发送」，避免被 `{first} and {second}` 宽模板误配。
- 词库：5 条专用模板及 fix1 新增的 1 条精确 messages，登记在 `dict/todo/v0.0.46-nightly.20261007.2774.extra.json`；`{0} failed` 字面较短，测试对源码全部 translate 候选查表，证明没有被截走的文字。
- 测试 `plugin/__tests__/n2774-display-strings.test.ts`：补丁前后真实 JSX 元素按 React 规则求值（en / 无运行时与原版逐字相同，zh 整句中文，`t()` 只收到骨架）；菜单名函数用真实 `projectScriptMenuLabel` 求值；转换判定只少 5 个 mixed-jsx 跳过项、不新增候选与值用途；同时覆盖任务状态行（暂缓 / 收起 / 已唤醒）的插件包裹与各时间形态的整句中文。fix1 读取真实 ChatComposer 初始化表达式及最终属性，对全部三个分支在补丁后 / 插件转换后求值，验证 zh-CN 整句中文、en / 无运行时逐字一致，`t()` 只收到固定文字。


## 0017 native-residual-display-strings

- 基线保持 2774，在 0016 后应用。只改最终显示路径，不改 matcher、服务端、选项 ID、比较和存储值。
- `TraitsPicker` 菜单和组合按钮使用专用 `displayTraitLabel` 精确名单。`buildTraitsTriggerDisplay` 的可选显示回调仅由最终渲染调用传入，默认调用保持上游输出；每段先翻译再组合。`1M` / `200k` 等上下文容量标签原样；未知 provider 标签保持原样、不送入 `t()`。通用 `displayKnown` 仍不翻译 `Extra High`，防止它在其他位置被当作模型名等内容处理。
- 侧栏和子 Agent 分页复用 `Show {count} more`；Agent 失败计数复用 0016 的 `{0} failed`。连接摘要覆盖客户端与配对链接单 / 复数，均经 U+E000 骨架翻译后插入计数。
- Clerk 的账号按钮由 SDK 输出。仅在中文 locale 时，两种 managed-auth shell 使用官方 `localization.userButton.action__openUserMenu` / `action__closeUserMenu`，仅覆盖固定读屏文字；不更改认证或交互。实际读屏软件及已登录 SDK DOM 待维护者原生复验。
- 分支命名和合并方式的有限选值、设备的两条固定说明使用 `translateFixed`；截图状态及发送禁用状态使用精确名单。任意后端说明、错误和服务端标签不进翻译器。
- T14 原增量为 29 个 messages + 4 个 templates；T14-fix1 再新增 27 个 messages + 3 个 templates，删除 `Ultrathink` / `Ultracode` 两条并登记 skip，修改 4 条已定措辞。通用 `Max` →「最大值」不改，推理位置用专用 `Reasoning tier: Max` / `Reasoning tier: Ultra` 显示「最大 / 极限」。词条清单见 T14。
- 测试 `native-residual-display-strings.test.ts`：真实源码和插件转换后表达式，中英文 / 无运行时输出、动态值隔离、原始数据保持英文及模板误配扫描。旧 0009 / 0013 测试仅更新显示调用点与真实 helper 导入，仍验证原有权限和动态值保护。T14-fix1 按 UPGRADE 收敛规则第 5 条不做变异测试。

### T14-fix1（r1 修复，仍使用 0017）

- 分组标题与档位值先查推理名单，再回落到原有 `displayKnown`，恢复 ACP `Default` / `Custom`。T3 固定分组及 Codex 极速说明均有精确词条；任意 provider 文字仍保持原样。
- 运行中发送提示只在 Tooltip 显示处处理：两个方向 × 有无快捷键，带快捷键使用专用 `fillSlot` 骨架，快捷键在翻译后插入。克隆、附件和 Antigravity 固定禁用原因全部纳入精确名单；带文件名 / 大小的任意原因不进 `t()`。
- 截图设置的保存状态也按名单翻译。设备向导在显示处通过可选回调处理步骤及读屏名，React key 和步骤数组不改；平台检测说明按精确名单处理，任意 `availability.reason` 不翻译。
- PR 的 `Show N older comment(s) (N hidden)` 用两个独立私有区槽位先翻译骨架再插入计数，复数复用已有模板，单数补专用模板。
- Clerk 英文 / 无运行时不传 localization，未引入官方中文资源包。合并方式映射已由 E2 转换，0017 不再重复查表，测试按真实依赖模块转换后的值求值。
- 继续修改 0017，因为同一基线、同一轮未提交增量，修复均属于 r1 范围，无需叠加 0018。

## 0018 usage-account-columns

- 基线保持 n2774，在 0017 后应用。按维护者的明确要求调整额度面板布局，中英文均采用新布局。
- Codex、Claude 及其他支持额度查询的提供商按账号分列。每张卡片包含该账号自己的各额度窗口、剩余百分比和重置时间；不再显示跨账号平均值、编号条和另列图例。
- 保留共享层的账号去重、环境过滤、数据快照及 Cursor 窗口选择。每张卡片用单账号窗口数据；同一账号经多个来源报告仍只显示一次。
- 进度条保留原账号详情弹层和重置确认流程，点击区域高 24px。重置恢复值改为该账号自己的百分比，额度券用图标和数量显示。
- 列宽按容器自动适配，最小 18rem；窄屏降为单列。补丁只修改 `UsageLimitsPooled.tsx`，不修改查询、账号配置、请求或共享计算代码。
- 构建、浏览器模拟数据检查及安装包记录见 [T15 交接](../handoff/T15-usage-account-columns.md)。

## 0019 bundle-t3-code-license

- 在 0018 后应用，只修改打包脚本。staging 时将基线 `LICENSE` 逐字节复制为 `T3-Code-LICENSE.txt`，`extraResources` 将它放进 App 的 `Contents/Resources/`，发生在签名之前。
- `build-zh.sh` 第 13 步从实际 ZIP 内的 App 读取许可证并与 `.build/src/LICENSE` 比对；最终 installer DMG 再核对同一文件和签名封存记录。
- Rust 编译路径映射由 `build-zh.sh` 第 11 步注入，见 [T16 交接](../handoff/T16-release-hygiene.md)。
