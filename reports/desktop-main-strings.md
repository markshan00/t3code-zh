# 桌面主进程用户可见字符串（T07 调研）

> 2026-10-06 升级到 v0.0.46-nightly.20261005.2702（T10）后：附录合计 837 条；新增 27 条全是错误消息 / 日志 / 脚本 / 数据（旧版 localStorage 迁移读取 LevelDB 的代码等），没有新增需要翻译的原生界面文字；8 条旧条目只是行号漂移，归类不变。以下正文是基线 2644 时的调研记录。

- 基线：`v0.0.46-nightly.20261004.2644`；行号均为 `upstream/apps/desktop/src/` 下的原文件行号。
- 范围：`apps/desktop/src` 下全部非测试 `.ts`（136 个文件，排除 `*.test.ts`、`__tests__/`、`updatesTestHarness.ts`、生成的 `AnnotationStyles.generated.ts`）。
- 方法：
  1. 用 Babel 解析全部 136 个文件，列出所有「含空格、至少两个单词」的字符串和模板字面量（810 条），按所在位置（属性键、调用对象、return 等）分类后逐条看。复现：`node plugin/desktop/survey-strings.ts > out.tsv`（上游升级后用同一脚本重扫，对比新增条目）；
  2. 单词标签（`File`、`Edit` 等）不在第 1 步的口径里，另外 grep `label:`、`title:`、`message:`、`detail:`、`buttons:`、`showMessageBox`、`showErrorBox`、`showOpenDialog`、`Notification`、`Tray`、`setToolTip`、`setTitle`、`new BrowserWindow`、`loadURL(data:…)`，并逐个读了菜单、对话框、窗口相关文件；
  3. role 菜单项的文字不在源码里，由 Electron 44 内置；按原版构建（`release/base`）实际运行时用 System Events 读到的菜单逐项列出（见 `release/T07-evidence/menus-base-applelanguages-en.txt`）。
  4. （fix2 补）主进程自己拼的 HTML / 内联脚本：grep `data:text/html`、`loadURL`、`executeJavaScript`、`<title>`、`textContent`、`innerText`、`innerHTML`、`alt=`、`aria-label`、`title=`、`placeholder`，逐个读出 4 个主进程生成的页面（权限助手面板、画中画窗口、截图动画遮罩、WSL 启动画面），其中的界面文字列在 1.5–1.7 和第 2 节；`executeJavaScript` 的其余调用是预览自动化脚本，不含界面文字。
- 第 1 步 810 条的逐条归类结论见附录 `reports/desktop-main-strings-appendix.md`（由 `plugin/desktop/classify-strings.ts` 生成：规则自动归类，规则覆盖不到的逐条人工判定，没有归类的条目会让生成器报错）。
- 结论：主进程原生界面里 macOS 上可见的文字共 64 条词条（57 条精确 + 7 条模板，`dict/zh-CN.desktop.json`），全部翻译，位置见第 1 节；T07 r0 漏了主进程 HTML 里的 2 条（截图动画遮罩的回退标题、画中画图片 alt），fix2 补上。其余类别及不翻译的理由见第 2–6 节和附录。
- 没有 `new Notification`（系统通知由 web 用浏览器 Notification API 发，文字走 web 词库）、没有托盘（0.0.46 已无 Tray）、没有 Dock 菜单。

## 1. 主进程原生界面（已翻译，patches/0003，词条在 `dict/zh-CN.desktop.json`）

### 1.1 菜单栏 `window/DesktopApplicationMenu.ts`

| file:line | 文字 | 类型 | 中文 |
|---|---|---|---|
| :162 | `About ${appName}`（role about 默认标签） | Menu role label | 关于 {0} |
| :164、:261 | `Check for Updates...` | Menu label（应用菜单、帮助菜单） | 检查更新... |
| :169、:193 | `Settings...` | Menu label（:193 只在非 macOS） | 设置... |
| :174 | `Services`（role services） | Menu role label | 服务 |
| :176 | `Hide ${appName}`（role hide） | Menu role label | 隐藏 {0} |
| :177 | `Hide Others`（role hideOthers） | Menu role label | 隐藏其他 |
| :178 | `Show All`（role unhide） | Menu role label | 全部显示 |
| :180 | `Quit ${appName}`（role quit） | Menu role label | 退出 {0} |
| :187 | `File` | Menu label | 文件 |
| :199 | `Close Window`（role close，macOS） | Menu role label | 关闭窗口 |
| :203 | `Edit` | Menu label | 编辑 |
| :205 | `Undo`（role undo） | Menu role label | 撤销 |
| :206 | `Redo`（role redo） | Menu role label | 重做 |
| :208 | `Cut`（role cut） | Menu role label | 剪切 |
| :209 | `Copy`（role copy） | Menu role label | 复制 |
| :210 | `Paste`（role paste） | Menu role label | 粘贴 |
| :212 | `Paste as Text` | Menu label | 粘贴为纯文本 |
| :216 | `Delete`（role delete） | Menu role label | 删除 |
| :218 | `Select All`（role selectAll） | Menu role label | 全选 |
| :223 | `Speech` | Menu label（macOS） | 语音 |
| :224 | `Start Speaking` / `Stop Speaking`（role startSpeaking / stopSpeaking） | Menu role label | 开始朗读 / 停止朗读 |
| :231 | `View` | Menu label | 查看 |
| :233 | `Reload`（role reload） | Menu role label | 重新加载 |
| :234 | `Force Reload`（role forceReload） | Menu role label | 强制重新加载 |
| :235 | `Toggle Developer Tools`（role toggleDevTools） | Menu role label | 切换开发者工具 |
| :243 | `Actual Size` | Menu label | 实际大小 |
| :244、:246 | `Zoom In`（:246 是不可见的 `CmdOrCtrl+Plus` 别名项） | Menu label | 放大 |
| :251 | `Zoom Out` | Menu label | 缩小 |
| :253 | `Toggle Full Screen`（role togglefullscreen） | Menu role label | 切换全屏 |
| :256 | `Window`（role windowMenu 的标题） | Menu role label | 窗口 |
| :256 | `Minimize`、`Zoom`、`Bring All to Front`（windowMenu 默认子菜单的 role minimize / zoom / front；非 macOS 是 minimize / zoom / close→`Close`） | Menu role label | 最小化、缩放、前置全部窗口（`Close` → 关闭） |
| :258 | `Help`（role help 的标题） | Menu role label | 帮助 |
| :160 | `appName`（应用菜单标题，产品名） | Menu label | 不翻译 |

改法说明：role 项保留 `role`（以及原有的 `accelerator`、`enabled`），只加 `label: __t3zh_t("<Electron 默认标签>")`；`about`/`hide`/`quit` 的默认标签含 `app.name`，补丁在构建模板时读同一个 `app.name`。`{ role: "windowMenu" }` 改写为带 `label` 和显式 `submenu` 的同一 role，子菜单与 Electron 默认子菜单相同（macOS：minimize、zoom、separator、front），实测窗口列表照常出现在「窗口」菜单末尾。非 macOS 的 `{ role: "quit" }`（Windows 默认是 `Exit`）没有加标签——本构建只出 macOS arm64。

### 1.2 检查更新的对话框 `window/DesktopApplicationMenu.ts`（`dialog.showMessageBox`）

| file:line | 文字 | 类型 | 中文 |
|---|---|---|---|
| :70 | `You're up to date!` | dialog title | 已是最新版本 |
| :71 | `T3 Code ${updateState.currentVersion} is currently the newest version available.` | dialog message | T3 Code {0} 当前已是最新版本。 |
| :72、:80、:98 | `OK` | dialog buttons | 确定 |
| :77 | `Update check failed` | dialog title | 检查更新失败 |
| :78 | `Could not check for updates.` | dialog message | 无法检查更新。 |
| :79 | `An unknown error occurred. Please try again later.`（`updateState.message ??` 的回退值；`updateState.message` 本身是更新器的英文报错，不翻译） | dialog detail | 发生未知错误，请稍后重试。 |
| :95 | `Updates unavailable` | dialog title | 暂时无法更新 |
| :96 | `Automatic updates are not available right now.` | dialog message | 目前无法使用自动更新。 |
| :97 → `updates/DesktopUpdates.ts:258` | `Automatic updates are not available because no update feed is configured.` | dialog detail（`disabledReason.value`） | 未配置更新源，无法使用自动更新。 |
| :97 → `updates/DesktopUpdates.ts:261` | `Automatic updates are only available in packaged production builds.` | 同上 | 自动更新仅适用于打包后的正式版本。 |
| :97 → `updates/DesktopUpdates.ts:264` | `Automatic updates are disabled by the T3CODE_DISABLE_AUTO_UPDATE setting.` | 同上 | 自动更新已被 T3CODE_DISABLE_AUTO_UPDATE 设置停用。 |
| :97 → `updates/DesktopUpdates.ts:267` | `Automatic updates on Linux require the AppImage or the .deb package.` | 同上 | 在 Linux 上使用自动更新需要 AppImage 或 .deb 安装包。 |

- macOS 的 NSAlert 不显示 `title`，实际可见的是 message、detail 和按钮。
- `disabledReason` 只在对话框这一处包裹（`detail: __t3zh_t(disabledReason.value)`）；同一组文字也经 IPC 进 web 的更新状态（第 4 节），那条路径不动。
- 按钮只有 `OK`。Electron 在没给 `cancelId` 时会按按钮文字（cancel / no）推断取消按钮，翻译 `OK` 不受影响。

### 1.3 右键菜单 `window/DesktopWindow.ts`（`context-menu` 事件 → `popupTemplate`）

| file:line | 文字 | 类型 | 中文 |
|---|---|---|---|
| :547 | 拼写建议 `suggestion` | Menu label（动态单词） | 不翻译 |
| :554 | `No suggestions` | Menu label | 没有拼写建议 |
| :562 | `Copy Link` | Menu label | 复制链接 |
| :573 | `Copy Image` | Menu label | 复制图片 |
| :582–585 | `Cut`、`Copy`、`Paste`、`Select All`（role cut / copy / paste / selectAll） | Menu role label | 剪切、复制、粘贴、全选 |

web 自己的右键菜单（`ElectronMenu.showContextMenu`，项目来自渲染进程）文字已由 web 词库按 web 的语言偏好翻译，主进程不再处理。

### 1.4 启动失败错误框 `app/DesktopApp.ts`（`dialog.showErrorBox`）

| file:line | 文字 | 类型 | 中文 |
|---|---|---|---|
| :135 | `T3 Code failed to start` | error box title | T3 Code 启动失败 |
| :136 | `Stage: ${stage}`（第一行；其后的错误消息和堆栈是动态英文，不翻译） | error box content | 阶段：{0} |

### 1.5 权限助手面板 `permissions/MacPermissionHelper.ts`（系统设置旁的浮动小窗，`data:` HTML）

| file:line | 文字 | 类型 | 中文 |
|---|---|---|---|
| :46、:115 | `Set up ${MAC_PERMISSION_TITLES[permission]}` | HTML `<title>`、BrowserWindow title | 设置{0} |
| `permissions/MacPermission.ts:12–14` | `Screen Recording`、`Accessibility`、`Full Disk Access` | 上面标题里的权限名 | 屏幕录制、辅助功能、完全磁盘访问权限（与主词库一致） |
| :62 | `Close permission helper` | aria-label | 关闭权限助手 |
| :63 | `↑ Drag T3 Code into the list above` | 面板正文 | ↑ 将 T3 Code 拖到上方列表中 |
| :64 | `Drag T3 Code to System Settings, or click to reveal in Finder` | aria-label | 将 T3 Code 拖到系统设置，或点击以在访达中显示 |
| :64 | 按钮上的 `T3 Code` | 产品名 | 不翻译 |

插入 HTML 的译文都经过文件里已有的 `escapeHtml`（en 时这些英文不含需转义的字符，输出与原版相同）。

### 1.6 画中画预览窗口 `preview/Manager.ts`

| file:line | 文字 | 类型 | 中文 |
|---|---|---|---|
| :3297 | `Preview · ${title}` / `Browser preview` | BrowserWindow title（macOS `type: "panel"`，有标题栏） | 预览 · {0} / 浏览器预览 |
| :202 | `Live browser preview`（fix2 补） | 窗口内 `data:` HTML 里预览图片的 `alt`（读屏软件朗读） | 实时浏览器预览 |

`:202` 插入 HTML 时用 `__t3zh_html`（查表后做 HTML 转义）；英文原文不含需转义的字符，en 时与原版逐字相同（`plugin/__tests__/desktop.test.ts` 有源码级比对）。

### 1.7 截图动画遮罩 `snapShot/SnapShotTransition.ts`（fix2 补）

| file:line | 文字 | 类型 | 中文 |
|---|---|---|---|
| :166 | `Captured window`（`value.windowTitle \|\| "Captured window"`） | 遮罩 HTML 内联脚本写进卡片的窗口标题；被截窗口没有标题时显示，位于缩略图下方应用名的下一行，动画期间约 1 秒可见 | 已截取的窗口 |
| :165、:167 | `value.appName`、其首字母 | 同上，应用名（动态） | 不翻译 |
| :117 | `T3 Code Snapshot Animation` | 遮罩窗口的 BrowserWindow title：无边框、透明、不可聚焦，标题不可见 | 不翻译 |

`:166` 在内联 `<script>` 里，用 `__t3zh_js`（查表后写成 JS 字符串字面量，`<` 转成 `\u003c`，译文含 `</script>` 也不会提前结束脚本）；en 时生成的脚本文本与原版逐字相同。

主进程生成的 4 个 HTML 页面里的界面文字汇总：权限助手面板（1.5，3 条）、画中画窗口（1.6，1 条 alt）、截图动画遮罩（1.7，1 条）、WSL 启动画面（第 2 节，只在 Windows）。

## 2. 主进程原生界面，只在 Windows / Linux 出现（未翻译）

本构建只出 macOS arm64（`dist:desktop:dmg:arm64`），这些位置在 macOS 上不会执行，补丁不碰，减少随上游重做的面积。

| file:line | 文字 | 类型 | 平台 |
|---|---|---|---|
| `backend/DesktopBackendPool.ts:245–246` | `WSL backend is still unavailable` / `${reason}\n\nT3 Code will use the Windows backend for this launch and retry WSL the next time the app starts.` | error box | Windows |
| `backend/DesktopBackendPool.ts:256–257` | `WSL backend couldn't start` / `${reason}\n\nFalling back to the Windows backend so T3 Code can open. Re-enable the WSL backend from Settings > Connections once the WSL distro is fixed.` | error box | Windows |
| `window/DesktopWindow.ts:208` | `Connecting to WSL…` | 启动画面（data: HTML） | Windows（wsl-only 模式） |
| `ipc/methods/notificationBadge.ts:32` | `${count} threads with new notifications` | 任务栏 overlay 图标说明 | Windows |
| `ipc/methods/snapShot.ts:121` | `Desktop config` | 打开文件对话框的过滤器名 | Linux（Niri / Hyprland） |
| `window/DesktopApplicationMenu.ts:199` | role quit 的默认标签（`Exit` / `Quit`） | Menu role label | Windows / Linux |

## 3. macOS 系统提供的文字（不在源码里；T07-fix1 用 patches/0005 让它们跟随简体中文系统）

T07 r0 实测（`release/T07-evidence/menus-zh.txt`）系统语言为简体中文时这些项仍是英文：

- 应用菜单：`Quit and Keep Windows`（按住 Option 的替换项）；`服务` 子菜单里的 `Services Settings…`（各个服务名由提供服务的应用决定）。
- 文件菜单：`Close All`（Option 替换项）。
- 编辑菜单：`AutoFill`（`Contact…`、`Passwords…`、`Credit Card…`）、`Start Dictation…`、`Emoji & Symbols`。
- 窗口菜单：`Minimize All`、`Zoom All`、`Arrange in Front`（Option 替换项）、`Fill`、`Center`、`Move & Resize`（及子菜单）、`Full Screen Tile`（及子菜单）、`Remove Window from Set`。
- 其他：「关于」面板里 AppKit 的 `Version` 字样；打开文件夹 / 文件对话框（NSOpenPanel）的按钮。

原因：这些项由 AppKit 按应用自身的本地化语言插入，而打包配置 `electronLanguages: ["en-US"]` 只留了 `en.lproj`。调度方定案（CONVENTIONS §5 末尾的例外，87965bd）后，T07-fix1 用 `patches/0005` 在 Info.plist 声明 `CFBundleLocalizations: ["en", "zh-Hans"]`：简体中文系统上上面这些菜单项全部变成中文（自动填充、开始听写…、表情与符号、填充、居中、移动与调整大小、全屏幕平铺、从组中移除窗口、退出并保留窗口、全部关闭、服务设置… 等，`release/T07-evidence/fix1-menus-zh.txt`）；英文系统下菜单与原版逐字一致。代价：简体中文系统上渲染进程的 `navigator.languages` 第一项和 `Intl` 默认 locale 变成 `zh-Hans`，web 选 English 时日期等格式与原版不同（实测值见 handoff「修复记录 r0→fix1」）。

## 4. 主进程生成、经 IPC 在 web 界面显示的文字（T07-fix1 用 patches/0006 处理其中可精确匹配的部分）

这些字符串是主进程返回给渲染进程的数据，由 web 界面显示。不在主进程翻译它们，理由：

1. 主进程的语言只跟随系统，web 跟随 `localStorage` 偏好。若在主进程翻译，用户在设置里选英文、系统是中文时，web 里会混进中文，违反「en 模式下与原版完全一致」。
2. 其中一部分是数据而不只是显示：例如 `T3 Code Desktop` 是发给服务端保存的客户端名，`Local environment` 是环境的默认名，端点名 `endpoint.label` 还拼进存储的默认端点偏好键。

T07-fix1 改在 web 的显示位置翻译（`patches/0006`，`apps/web/src/desktopIpcStrings.ts` 的 `translateKnownDesktopString`）。这些显示位置还会收到任意英文（截图失败的 `error.message`、服务器报错等），而运行时的模板匹配用在任意英文上会误配：用主词库对服务端、client-runtime、ssh、desktop 源码里 2921 条错误文字实测，1669 条会被 `{head} to {base}`、`{0}d` 之类的宽模板改坏（例如 `Failed to resolve canonical asset path.` → `Failed 到 resolve canonical asset path.`）。所以只对名单里的精确文字查表，其余原样显示。

### 4.1 已处理（`patches/0006`，词条在 `dict/zh-CN.json`）

逐条明细（含下表「等」所指的每一条）见附录 I1 类（30 条）；0006 名单展开后的 43 条精确文字见 `apps/web/src/desktopIpcStrings.ts`（patches/0006）。

| 来源 file:line | 文字 | web 显示位置 |
|---|---|---|
| `backend/DesktopServerExposure.ts:162`、`:174`、`:190` | `This machine`、`Local network`、`Custom HTTPS`、`Custom endpoint`（端点名；Tailscale 两项是产品名，不译） | `ConnectionsSettings.tsx` 端点列表行标题（`:1327`）、配对二维码的端点切换按钮（`:912`） |
| `snapShot/DesktopSnapShot.ts:103`、`:105`、`:107` | 3 条 macOS 权限提示（`Allow Screen Recording in System Settings, then restart T3 Code.` 等） | `SnapShotSetupDialog.tsx` 权限步骤的提示（`:217`）、`SnapShotCoordinator.tsx` 截图失败 toast（`:380`） |
| `snapShot/DesktopSnapShot.ts:696`、`:702`；`snapShot/snapShot.ts:44–89` | 快捷键检测：`This shortcut is already used by the system or another app.`、`The system could not register this shortcut.`、`Shift combinations …`、`This shortcut controls running commands in terminals.`、`The system uses Alt+Tab to switch apps.`、`The system already uses this shortcut.`；`This shortcut is ${action} in most apps.`（`COMMON_MOD_ACTIONS` 的 13 种）；`${modifier} + ${modifier} is not available on this system.`（macOS 的 4 种修饰键） | `SnapShotSettings.tsx` 的快捷键状态（`:272` 那一支） |
| `updates/remoteUpdateFlow.ts:52`、`:71`、`:92`、`:100`；`updates/DesktopRemoteUpdates.ts:124`、`:173`、`:243`、`:397`、`:408`、`:442`；`updates/DesktopUpdates.ts:258–267` | 13 条远程更新失败原因，经服务端 `ServerSelfUpdateError` 变成 `Server update failed: ${reason}` | `ServerUpdateAction.tsx` 的失败 toast（`updateFailureMessage`）和进度行（`ServerUpdateProgress`） |

### 4.2 不处理

逐条明细见附录 I2（15 条）、I3（9 条）、W（84 条，Windows / Linux）、D 类里进 MCP 的 3 条。

| 来源 file:line | 文字 | 原因 |
|---|---|---|
| `backend/DesktopServerExposure.ts:166`、`:179`、`:196`、`:197`；`backend/tailscaleEndpointProvider.ts:52`、`:95`、`:96` | 端点说明（`Loopback endpoint for this desktop app.` 等） | web 不显示 `endpoint.description`（全仓库 grep 无使用处） |
| `backend/DesktopServerExposure.ts:50`、`:57` | 端点提供方名 `Desktop`、`Manual` | web 不显示 `endpoint.provider.label` |
| `backend/DesktopBackendConfiguration.ts:937`、`backend/DesktopLocalEnvironmentAuth.ts:75` | `Local environment`、`T3 Code Desktop` | 数据（环境默认名、发给服务端保存的客户端名） |
| `ssh/DesktopSshEnvironment.ts:94–110`、`preload.ts:59` | SSH 连接错误 | 非取消类错误经 `ipcRenderer.invoke` 抛出时，Electron 会加上 `Error invoking remote method '<channel>': ` 前缀；随后 web 的 `connection/platform.ts` 再拼成 `Could not prepare the SSH environment: …`，经 client-runtime 的通用连接错误显示，和任意服务器错误共用一个显示通道。精确匹配做不到，对通道整体调用 `t()` 会误配别的错误 |
| `ipc/methods/providerAuth.ts:31`、`:47`；`app/DesktopClerk.ts:158` | ChatGPT 登录错误详情 | 同样经 IPC 抛错（带 Electron 前缀），在设置页以 `failure.message` 通用显示 |
| `preview/Manager.ts:307`、`:1184`、`:1251` | `the focused element`、`Uncaught exception`、`Network request failed` | 进 MCP 工具结果（`apps/server/src/mcp/McpHttpServer.ts` 的 consoleEntries / networkEntries），是给 AI 的数据，不是界面文字 |
| `snapShot/DesktopSnapShot.ts:478`、`:681–686`、`:1014`、`:1019`、`:1025`、`:1057`、`:1061`、`:1142–1250`、`:1535` 及 `GnomeCaptureSetup.ts`、`KdeSnapShot.ts`、`HyprlandSnapShot.ts`、`PortalCaptureShortcut.ts`、`NiriCaptureShortcut.ts`、`CaptureShortcutConfig.ts:294`、`RegionSnapShotWorker.ts:27` | Linux / Windows 的截图提示；`observedPairMessage`（快捷键可用时才返回，web 只在不可用时显示 message） | 本构建只出 macOS arm64；`observedPairMessage` 不会显示 |
| `wsl/*`、`backend/DesktopBackendConfiguration.ts:341–426`、`ipc/methods/window.ts:141` | WSL 相关 | 只在 Windows |

## 5. apps/desktop 里的其他渲染层文字：预览注释工具 `preview/PickPreload.ts`（未翻译）

这是注入到「浏览器预览」被预览页面里的注释编辑器（`preview-pick-preload.cjs`），不在主进程，也读不到 web 的语言偏好（不同的分区）。界面文字：

`:577` `Describe the change…`（placeholder）、`:586` `Drag annotation editor`、`:567–568`、`:1055–1056` `Expand annotation editor`、`:1046–1047` `Collapse annotation editor`、`:591` `Attach` / `Attach annotation and screenshot (Enter)`、`:737` `Font`、`:745` `Font size`、`:755` `Font weight`、`:763` `Line height`、`:804` `Text color`、`:805` `Background`、`:815` `Opacity`、`:823` `Radius`、`:825` `Border color`、`:836` `Border width`、`:850` `Lock aspect ratio`、`:439` `Style value`、`:947–950` 工具名 `Select` / `Region` / `Draw` / `Erase` 及提示 `Select elements (V)` 等 4 条、`:1352` `Capturing…`。

要翻译需要另做语言来源（例如经 webview preload 参数传入 web 的解析结果），超出 T07 范围，列入 handoff「已知问题」。

## 6. 不可见或非界面的字符串（不翻译）

第 1 步 810 条的逐条结论见附录。附录各类条数：N1 原生界面已翻译 28、N0 不可见窗口标题 1、N2 原生界面只在 Windows/Linux 3、I1 IPC 显示已翻译 30、I2 IPC 显示未处理 15、I3 IPC 不显示或是数据 9、W IPC 显示只在 Windows/Linux 84、C 命令行输出 10、P 预览注释工具 29、E 错误消息 262、L 日志 124、S 脚本/模板/样式 188、D 数据 27（合计 810；单词标签不在这个口径里，见第 1 节）。其中不可见的几类：

- E（262 条）：错误类的 `message` getter 及其拼接片段、`new XxxError(...)` 的参数。属 §4「从不转换」的 `new Error`/`throw` 类位置；经 IPC 冒到 web 的登录错误详情 3 条单列为 I2。
- L（124 条）：`log*` / `Effect.log*` 日志与观测记录。
- S（188 条）：注入页面或子进程的脚本（`evaluateWithDebugger`、`[...].join("\n")` 拼出的 JXA / PowerShell / shell 脚本）、SQL、样式类名、内联样式、SVG。4 段主进程 HTML 模板按其中界面文字的去向归 N1（3 段）/ N2（WSL 启动画面）。
- D（27 条）：路径片段、钥匙串服务名、浏览器名、遗留目录名、release notes 解析标记、进 MCP 工具结果的预览记录。
- C（10 条）：`t3` 命令行经控制 socket 收到的错误回复，显示在终端，不在图形界面。
- 窗口标题 `environment.displayName`（`window/DesktopWindow.ts:406`、`:672`、`:747`、`:901`）是产品名 `T3 Code (Alpha)`，不翻译；截图动画遮罩窗口标题 `T3 Code Snapshot Animation`（`snapShot/SnapShotTransition.ts:117`）是无边框、不可聚焦的透明窗口，不可见。
