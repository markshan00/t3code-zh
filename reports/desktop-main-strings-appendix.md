# 桌面主进程字符串归类明细（附录）

由 `node plugin/desktop/survey-strings.ts > survey.tsv && node plugin/desktop/classify-strings.ts survey.tsv` 生成，不要手改。
输入是 `upstream/apps/desktop/src` 下全部非测试 `.ts` 里「含空白、至少两个单词」的字符串和模板字面量（插值写成 `{0}`）；
单词标签（`File`、`Edit` 等菜单名）不在这个口径里，见报告第 1 节。行号是基线原文件的行号。

## 类别与条数

| 类别 | 含义 | 条数 |
|---|---|---:|
| N1 | 原生界面，已翻译（patches/0003，dict/zh-CN.desktop.json） | 28 |
| N0 | 原生窗口标题，但窗口不可见 | 1 |
| N2 | 原生界面，只在 Windows / Linux 出现（未翻译） | 3 |
| I1 | 经 IPC 在 web 显示，已在 web 显示处翻译（patches/0006，dict/zh-CN.json） | 30 |
| I2 | 经 IPC 在 web 显示，未处理（原因见说明） | 15 |
| I3 | 经 IPC 传给 web，但 web 不显示，或是数据 | 9 |
| W | 经 IPC 在 web 显示，只在 Windows / Linux 出现（未翻译） | 84 |
| C | 命令行输出：经控制 socket 回给 `t3` 命令行，不在图形界面 | 10 |
| P | 预览注释工具（注入被预览页面，报告第 5 节，未翻译） | 31 |
| E | 错误消息：Error / TaggedError 的 message 及其参数（§4「从不转换」位置） | 264 |
| L | 日志与观测 | 129 |
| S | 脚本、命令、SQL、HTML/CSS 模板、样式类名、SVG | 172 |
| D | 数据：路径片段、应用 / 浏览器名、给 AI 或 MCP 的内容、协议载荷等 | 26 |
| 合计 | | 802 |

## N1：原生界面，已翻译（patches/0003，dict/zh-CN.desktop.json）（28）

| file:line | 文字 | 说明 |
|---|---|---|
| `permissions/MacPermission.ts:12` | "Screen Recording" |  |
| `permissions/MacPermission.ts:14` | "Full Disk Access" |  |
| `permissions/MacPermissionHelper.ts:44` | "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\">\n<meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; img-src …" | 权限助手面板的 HTML；其中 3 处界面文字已翻译（报告 1.5） |
| `permissions/MacPermissionHelper.ts:115` | "Set up {0}" | 窗口标题 |
| `preview/Manager.ts:168` | "<!doctype html>\n<html>\n  <head>\n    <meta charset=\"utf-8\">\n    <meta\n      http-equiv=\"Content-Security-Policy\"\n      content=\"default-src '…" | 画中画窗口的 HTML；alt 文字已翻译（报告 1.6，fix2） |
| `preview/Manager.ts:2843` | "Browser preview" | 窗口标题 |
| `snapShot/SnapShotTransition.ts:142` | "<!doctype html><style>\nhtml,body{margin:0;width:100%;height:100%;overflow:hidden;background:transparent}\n#card{position:absolute;left:{0}px;…" | 截图动画遮罩的 HTML；回退标题 Captured window 已翻译（报告 1.7，fix2） |
| `updates/DesktopUpdates.ts:258` | "Automatic updates are not available because no update feed is configured." | 原生对话框 detail（0003）；也进远程更新失败原因（0006） |
| `updates/DesktopUpdates.ts:261` | "Automatic updates are only available in packaged production builds." | 同上 |
| `updates/DesktopUpdates.ts:264` | "Automatic updates are disabled by the T3CODE_DISABLE_AUTO_UPDATE setting." | 同上 |
| `updates/DesktopUpdates.ts:267` | "Automatic updates on Linux require the AppImage or the .deb package." | 同上 |
| `window/DesktopApplicationMenu.ts:70` | "You're up to date!" |  |
| `window/DesktopApplicationMenu.ts:71` | "T3 Code {0} is currently the newest version available." |  |
| `window/DesktopApplicationMenu.ts:77` | "Update check failed" |  |
| `window/DesktopApplicationMenu.ts:78` | "Could not check for updates." |  |
| `window/DesktopApplicationMenu.ts:79` | "An unknown error occurred. Please try again later." |  |
| `window/DesktopApplicationMenu.ts:95` | "Updates unavailable" |  |
| `window/DesktopApplicationMenu.ts:96` | "Automatic updates are not available right now." |  |
| `window/DesktopApplicationMenu.ts:164` | "Check for Updates..." |  |
| `window/DesktopApplicationMenu.ts:212` | "Paste as Text" |  |
| `window/DesktopApplicationMenu.ts:243` | "Actual Size" |  |
| `window/DesktopApplicationMenu.ts:244` | "Zoom In" |  |
| `window/DesktopApplicationMenu.ts:246` | "Zoom In" |  |
| `window/DesktopApplicationMenu.ts:251` | "Zoom Out" |  |
| `window/DesktopApplicationMenu.ts:261` | "Check for Updates..." |  |
| `window/DesktopWindow.ts:558` | "No suggestions" |  |
| `window/DesktopWindow.ts:566` | "Copy Link" |  |
| `window/DesktopWindow.ts:577` | "Copy Image" |  |

## N0：原生窗口标题，但窗口不可见（1）

| file:line | 文字 | 说明 |
|---|---|---|
| `snapShot/SnapShotTransition.ts:117` | "T3 Code Snapshot Animation" | 截图动画遮罩：无边框、透明、不可聚焦，只存在约 1 秒 |

## N2：原生界面，只在 Windows / Linux 出现（未翻译）（3）

| file:line | 文字 | 说明 |
|---|---|---|
| `ipc/methods/notificationBadge.ts:32` | "{0} threads with new notifications" | Windows 任务栏 overlay 图标说明 |
| `ipc/methods/snapShot.ts:121` | "Desktop config" | Linux（Niri / Hyprland）打开文件对话框的过滤器名 |
| `window/DesktopWindow.ts:210` | "<!doctype html><html><head><meta charset=\"utf-8\"><meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; style-src 'unsafe-i…" | WSL 启动画面的 HTML（Connecting to WSL…），只在 Windows |

## I1：经 IPC 在 web 显示，已在 web 显示处翻译（patches/0006，dict/zh-CN.json）（30）

| file:line | 文字 | 说明 |
|---|---|---|
| `backend/DesktopServerExposure.ts:163` | "This machine" | 端点名；沿用主词库已有的「此设备」 |
| `backend/DesktopServerExposure.ts:175` | "Local network" | 端点名 |
| `backend/DesktopServerExposure.ts:191` | "Custom HTTPS" | 端点名 |
| `backend/DesktopServerExposure.ts:191` | "Custom endpoint" | 端点名 |
| `snapShot/DesktopSnapShot.ts:103` | "Allow Screen Recording in System Settings, then restart T3 Code." | macOS 权限提示 |
| `snapShot/DesktopSnapShot.ts:105` | "Allow Accessibility in System Settings, then restart T3 Code." | macOS 权限提示 |
| `snapShot/DesktopSnapShot.ts:107` | "Allow Accessibility and Screen Recording in System Settings, then restart T3 Code." | macOS 权限提示 |
| `snapShot/DesktopSnapShot.ts:696` | "This shortcut is already used by the system or another app." | 快捷键检测 |
| `snapShot/DesktopSnapShot.ts:702` | "The system could not register this shortcut." | 快捷键检测 |
| `snapShot/snapShot.ts:44` | "{0} is not available on this system." | 快捷键检测；macOS 的 4 种修饰键逐条进名单 |
| `snapShot/snapShot.ts:48` | "This shortcut is already used by the system or another app." | 快捷键检测 |
| `snapShot/snapShot.ts:52` | "Select All" | COMMON_MOD_ACTIONS 的值，同上 |
| `snapShot/snapShot.ts:60` | "New Tab" | COMMON_MOD_ACTIONS 的值，拼进 This shortcut is … in most apps. |
| `snapShot/snapShot.ts:62` | "Close Window" | COMMON_MOD_ACTIONS 的值，同上 |
| `snapShot/snapShot.ts:77` | "Shift combinations are used for typing and text selection. Add another modifier." | 快捷键检测 |
| `snapShot/snapShot.ts:82` | "This shortcut is {0} in most apps." | 快捷键检测；13 种动作逐条进名单 |
| `snapShot/snapShot.ts:85` | "This shortcut controls running commands in terminals." | 快捷键检测 |
| `snapShot/snapShot.ts:87` | "The system uses Alt+Tab to switch apps." | 快捷键检测 |
| `snapShot/snapShot.ts:89` | "The system already uses this shortcut." | 快捷键检测 |
| `updates/DesktopRemoteUpdates.ts:124` | "The desktop app failed to install the update." | 远程更新失败原因 |
| `updates/DesktopRemoteUpdates.ts:173` | "A prepared desktop update is already in progress." | 远程更新失败原因 |
| `updates/DesktopRemoteUpdates.ts:243` | "The desktop app lost the downloaded update." | 远程更新失败原因 |
| `updates/DesktopRemoteUpdates.ts:397` | "This desktop update is no longer prepared." | 远程更新失败原因 |
| `updates/DesktopRemoteUpdates.ts:408` | "The desktop app failed to install the update." | 远程更新失败原因 |
| `updates/DesktopRemoteUpdates.ts:419` | "This desktop update is no longer prepared." | 远程更新失败原因 |
| `updates/DesktopRemoteUpdates.ts:442` | "The desktop app could not start the install." | 远程更新失败原因 |
| `updates/remoteUpdateFlow.ts:52` | "Automatic updates are disabled on this machine." | 远程更新失败原因 |
| `updates/remoteUpdateFlow.ts:71` | "The desktop app failed to download the update." | 远程更新失败原因 |
| `updates/remoteUpdateFlow.ts:92` | "The desktop app update failed." | 远程更新失败原因 |
| `updates/remoteUpdateFlow.ts:100` | "The desktop app did not report an update result." | 远程更新失败原因 |

## I2：经 IPC 在 web 显示，未处理（原因见说明）（15）

| file:line | 文字 | 说明 |
|---|---|---|
| `app/DesktopClerk.ts:158` | "Could not receive hosted web ChatGPT sign-in. Retry or use the redirect URL in the web app." | 登录错误：经 IPC 抛错（Electron 加前缀）后以 failure.message 通用显示，见报告 4.2 |
| `backend/tailscaleEndpointProvider.ts:48` | "Tailscale IP" | 端点名，产品名 + 缩写，不译 |
| `backend/tailscaleEndpointProvider.ts:89` | "Tailscale HTTPS" | 端点名，产品名 + 缩写，不译 |
| `ipc/methods/providerAuth.ts:31` | "Could not receive ChatGPT sign-in on this computer. Try again or paste the redirect URL." | 登录错误，同上 |
| `ipc/methods/providerAuth.ts:47` | "Invalid ChatGPT sign-in request." | 登录错误，同上 |
| `preload.ts:72` | "SSH authentication cancelled." | SSH 错误：经通用连接错误通道显示，见报告 4.2 |
| `snapShot/DesktopSnapShot.ts:681` | "{0} is observed and cannot be reserved exclusively." | 快捷键可用时才返回；web 只在不可用时显示 message，不会出现 |
| `snapShot/DesktopSnapShot.ts:683` | "{0} This key can also open the system's own menu." | 同上，且只在非 macOS |
| `snapShot/DesktopSnapShot.ts:686` | "{0} This key can also activate app menu bars." | 同上，且只在 Windows |
| `ssh/DesktopSshEnvironment.ts:96` | "Secure randomness is unavailable." | SSH 错误：经 IPC 抛错（Electron 加前缀）后走通用连接错误通道 |
| `ssh/DesktopSshEnvironment.ts:100` | "T3 Code window is not available for SSH authentication." | SSH 错误，同上 |
| `ssh/DesktopSshEnvironment.ts:103` | "SSH authentication timed out for {0}." | SSH 错误，同上 |
| `ssh/DesktopSshEnvironment.ts:106` | "SSH authentication cancelled for {0}." | SSH 错误，同上（取消类走 ConnectionBlockedError 的 detail） |
| `ssh/DesktopSshEnvironment.ts:109` | "SSH authentication was cancelled because the app window closed." | SSH 错误，同上 |
| `ssh/DesktopSshEnvironment.ts:112` | "SSH password prompt service stopped." | SSH 错误，同上 |

## I3：经 IPC 传给 web，但 web 不显示，或是数据（9）

| file:line | 文字 | 说明 |
|---|---|---|
| `backend/DesktopBackendConfiguration.ts:963` | "Local environment" | 本机环境的默认名（数据） |
| `backend/DesktopLocalEnvironmentAuth.ts:107` | "T3 Code Desktop" | 客户端名，发给服务端保存（数据） |
| `backend/DesktopServerExposure.ts:167` | "Loopback endpoint for this desktop app." | 端点说明，web 不显示 endpoint.description |
| `backend/DesktopServerExposure.ts:180` | "Reachable from devices on the same network." | 端点说明，web 不显示 |
| `backend/DesktopServerExposure.ts:197` | "User-configured HTTPS endpoint for this desktop backend." | 端点说明，web 不显示 |
| `backend/DesktopServerExposure.ts:198` | "User-configured endpoint for this desktop backend." | 端点说明，web 不显示 |
| `backend/tailscaleEndpointProvider.ts:52` | "Reachable from devices on the same Tailnet." | 端点说明，web 不显示 |
| `backend/tailscaleEndpointProvider.ts:95` | "HTTPS endpoint served by Tailscale Serve." | 端点说明，web 不显示 |
| `backend/tailscaleEndpointProvider.ts:96` | "MagicDNS hostname. Configure Tailscale Serve for HTTPS access." | 端点说明，web 不显示 |

## W：经 IPC 在 web 显示，只在 Windows / Linux 出现（未翻译）（84）

| file:line | 文字 | 说明 |
|---|---|---|
| `backend/DesktopBackendConfiguration.ts:349` | "WSL is not available on this system" | WSL 预检原因 |
| `backend/DesktopBackendConfiguration.ts:361` | "Unable to list WSL distributions: {0}" | WSL 预检原因 |
| `backend/DesktopBackendConfiguration.ts:376` | "WSL distro is not installed: {0}" | WSL 预检原因 |
| `backend/DesktopBackendConfiguration.ts:378` | "WSL has no installed distributions" | WSL 预检原因 |
| `backend/DesktopBackendConfiguration.ts:379` | "WSL has no default distribution" | WSL 预检原因 |
| `backend/DesktopBackendConfiguration.ts:391` | "WSL node-pty unavailable: {0}" | WSL 预检原因 |
| `backend/DesktopBackendConfiguration.ts:410` | "missing server entry at {0}" | WSL 预检原因 |
| `backend/DesktopBackendConfiguration.ts:418` | "wslpath conversion failed for {0}" | WSL 预检原因 |
| `backend/DesktopBackendConfiguration.ts:434` | "WSL runtime unavailable: {0}" | WSL 预检原因 |
| `snapShot/CaptureShortcutConfig.ts:294` | "Config saved, but Hyprland couldn't reload it cleanly. Check hyprctl configerrors, then run hyprctl reload." | 只在 Windows / Linux 的文件 |
| `snapShot/DesktopSnapShot.ts:96` | "Modifier-pair shortcuts aren't available in this Wayland session. Choose another shortcut or use Take snapshot from the command palette." | Wayland |
| `snapShot/DesktopSnapShot.ts:478` | "Active window" | Linux 截图来源名的回退值 |
| `snapShot/DesktopSnapShot.ts:1014` | "SnapShots are not supported on this platform." | 只在不支持截图的平台 |
| `snapShot/DesktopSnapShot.ts:1019` | "Configure the capture shortcut in your Niri config, not in T3 Code." | Linux（Niri） |
| `snapShot/DesktopSnapShot.ts:1025` | "Change the capture binding in your Hyprland config, then save it." | Linux（Hyprland） |
| `snapShot/DesktopSnapShot.ts:1057` | "Your desktop will confirm this shortcut when you save it." | Linux（portal） |
| `snapShot/DesktopSnapShot.ts:1061` | "Unsupported shortcut." | Linux（portal） |
| `snapShot/DesktopSnapShot.ts:1142` | "SnapShots require a Wayland session. X11 capture is not supported." | Linux（X11） |
| `snapShot/DesktopSnapShot.ts:1143` | "SnapShots are not supported on this platform." | 只在不支持截图的平台 |
| `snapShot/DesktopSnapShot.ts:1169` | "The Niri capture endpoint disconnected. Restart T3 Code." | Linux（Niri） |
| `snapShot/DesktopSnapShot.ts:1190` | "Set up the shortcut to add it to your Niri config." | Linux（Niri） |
| `snapShot/DesktopSnapShot.ts:1191` | "Could not start the Niri capture endpoint. Another T3 Code instance may be using it." | Linux（Niri） |
| `snapShot/DesktopSnapShot.ts:1250` | "Could not connect to your desktop's shortcut service." | Linux（portal） |
| `snapShot/DesktopSnapShot.ts:1535` | "Could not check desktop capture support. Check your desktop session and try again." | Linux（portal 模式） |
| `snapShot/GnomeCaptureSetup.ts:175` | "The bundled extension supports GNOME {0}. This session runs GNOME {1}." | 只在 Windows / Linux 的文件 |
| `snapShot/GnomeCaptureSetup.ts:181` | "Install the bundled extension to capture the active window without a picker. No download or administrator password is needed." | 只在 Windows / Linux 的文件 |
| `snapShot/GnomeCaptureSetup.ts:187` | "Installed. Save your work, sign out of GNOME and sign back in, then return here to enable the extension. Restarting T3 Code alone is not eno…" | 只在 Windows / Linux 的文件 |
| `snapShot/GnomeCaptureSetup.ts:193` | "A newer extension is bundled with this app. Install it, then sign out and back in to load the update." | 只在 Windows / Linux 的文件 |
| `snapShot/GnomeCaptureSetup.ts:199` | "GNOME has disabled user extensions. Turn on Extensions in the GNOME Extensions app, then check again. T3 Code will not enable your other ext…" | 只在 Windows / Linux 的文件 |
| `snapShot/GnomeCaptureSetup.ts:204` | "The T3 Code extension is running. Active-window snapshots are available." | 只在 Windows / Linux 的文件 |
| `snapShot/GnomeCaptureSetup.ts:211` | "GNOME could not load the extension. Check GNOME Extensions for details, or sign out and back in." | 只在 Windows / Linux 的文件 |
| `snapShot/GnomeCaptureSetup.ts:216` | "Enable the T3 Code extension to allow active-window snapshots. You can disable it here at any time." | 只在 Windows / Linux 的文件 |
| `snapShot/GnomeCaptureSetup.ts:221` | "Could not check GNOME extension setup." | 只在 Windows / Linux 的文件 |
| `snapShot/HyprlandSnapShot.ts:93` | "Install the bundled helper to capture the window you're using." | 只在 Windows / Linux 的文件 |
| `snapShot/HyprlandSnapShot.ts:103` | "Update the bundled capture helper to continue." | 只在 Windows / Linux 的文件 |
| `snapShot/HyprlandSnapShot.ts:108` | "Helper ready. Hyprland may ask for screen-sharing permission on your first capture." | 只在 Windows / Linux 的文件 |
| `snapShot/HyprlandSnapShot.ts:114` | "Couldn't check Hyprland capture access." | 只在 Windows / Linux 的文件 |
| `snapShot/KdeSnapShot.ts:113` | "Install the bundled helper to capture the window you're using without a picker." | 只在 Windows / Linux 的文件 |
| `snapShot/KdeSnapShot.ts:119` | "The capture helper is missing from this build. Update or reinstall T3 Code." | 只在 Windows / Linux 的文件 |
| `snapShot/KdeSnapShot.ts:124` | "Update the bundled capture helper to continue." | 只在 Windows / Linux 的文件 |
| `snapShot/KdeSnapShot.ts:129` | "KDE capture access is ready. Next, choose your shortcut." | 只在 Windows / Linux 的文件 |
| `snapShot/KdeSnapShot.ts:135` | "Couldn't check KDE capture access." | 只在 Windows / Linux 的文件 |
| `snapShot/NiriCaptureShortcut.ts:35` | "Capture takes no arguments." | 只在 Windows / Linux 的文件 |
| `snapShot/PortalCaptureShortcut.ts:68` | "Waiting for shortcut permission. Approve the desktop prompt if one appears." | 只在 Windows / Linux 的文件 |
| `snapShot/PortalCaptureShortcut.ts:102` | "Connecting to Hyprland shortcuts…" | 只在 Windows / Linux 的文件 |
| `snapShot/PortalCaptureShortcut.ts:167` | "Couldn't connect to Hyprland shortcuts. Make sure xdg-desktop-portal-hyprland is running, then restart T3 Code." | 只在 Windows / Linux 的文件 |
| `snapShot/PortalCaptureShortcut.ts:170` | "Could not register the capture shortcut." | 只在 Windows / Linux 的文件 |
| `snapShot/PortalCaptureShortcut.ts:306` | "Shortcut permission wasn't granted. Open shortcut permissions to allow it." | 只在 Windows / Linux 的文件 |
| `snapShot/PortalCaptureShortcut.ts:307` | "Shortcut permission wasn't granted. Allow T3 Code in your desktop's shortcut settings." | 只在 Windows / Linux 的文件 |
| `snapShot/PortalCaptureShortcut.ts:329` | "Managed by Hyprland. Add the binding to your config and save it." | 只在 Windows / Linux 的文件 |
| `snapShot/PortalCaptureShortcut.ts:330` | "Hyprland did not register the capture action. Check that xdg-desktop-portal-hyprland is running, then restart T3 Code." | 只在 Windows / Linux 的文件 |
| `snapShot/PortalCaptureShortcut.ts:340` | "Desktop shortcut: {0}" | 只在 Windows / Linux 的文件 |
| `snapShot/PortalCaptureShortcut.ts:342` | "No shortcut is assigned. Open shortcut permissions to choose one." | 只在 Windows / Linux 的文件 |
| `snapShot/PortalCaptureShortcut.ts:343` | "No shortcut is assigned. Choose one in your desktop's shortcut settings." | 只在 Windows / Linux 的文件 |
| `snapShot/RegionSnapShotWorker.ts:27` | "Windows window capture failed." | 只在 Windows / Linux 的文件 |
| `wsl/DesktopWslBackend.ts:75` | "WSL (default distro)" | 只在 Windows / Linux 的文件 |
| `wsl/DesktopWslEnvironment.ts:176` | "WSL backend preflight timed out while probing for {0}. WSL may be slow to start; retry, or check that the distro is healthy." | 只在 Windows / Linux 的文件 |
| `wsl/DesktopWslEnvironment.ts:178` | "WSL backend preflight could not start wsl.exe to probe for {0}. Check that WSL is installed and the distro is accessible." | 只在 Windows / Linux 的文件 |
| `wsl/DesktopWslEnvironment.ts:180` | "WSL backend preflight lost communication with wsl.exe while probing for {0}. Retry, or check that the distro is healthy." | 只在 Windows / Linux 的文件 |
| `wsl/DesktopWslEnvironment.ts:508` | "WSL support is missing from this T3 Code build: the packaged Linux node-pty binary was not included. Install a build that includes WSL suppo…" | 只在 Windows / Linux 的文件 |
| `wsl/DesktopWslEnvironment.ts:654` | "Node.js{0} (e.g. via nvm)" | 只在 Windows / Linux 的文件 |
| `wsl/DesktopWslEnvironment.ts:657` | "node {0} (requires {1})" | 只在 Windows / Linux 的文件 |
| `wsl/DesktopWslEnvironment.ts:659` | "a newer Node.js satisfying `{0}` (e.g. `nvm install 24 && nvm alias default 24`)" | 只在 Windows / Linux 的文件 |
| `wsl/DesktopWslEnvironment.ts:666` | "the build toolchain (e.g. `sudo apt install -y build-essential python3` on Ubuntu/Debian)" | 只在 Windows / Linux 的文件 |
| `wsl/DesktopWslEnvironment.ts:670` | "WSL distro is missing required tools: {0}. Install {1}, then retry." | 只在 Windows / Linux 的文件 |
| `wsl/DesktopWslEnvironment.ts:688` | "the staged runtime" | 只在 Windows / Linux 的文件 |
| `wsl/DesktopWslEnvironment.ts:697` | "{0}/t3 --version failed (exit {1}){2}" | 只在 Windows / Linux 的文件 |
| `wsl/DesktopWslEnvironment.ts:704` | "WSL login-shell PATH could not be resolved during backend preflight." | 只在 Windows / Linux 的文件 |
| `wsl/DesktopWslEnvironment.ts:762` | "Node.js was not found in the WSL distro. Install it (e.g. via nvm) and restart the desktop app." | 只在 Windows / Linux 的文件 |
| `wsl/DesktopWslEnvironment.ts:769` | "WSL login-shell PATH could not be resolved during backend preflight." | 只在 Windows / Linux 的文件 |
| `wsl/DesktopWslEnvironment.ts:784` | "WSL server dependencies could not be loaded (for example \"node-pty\"). The native packages the server needs are not unpacked where the WSL di…" | 只在 Windows / Linux 的文件 |
| `wsl/DesktopWslEnvironment.ts:799` | "WSL Node.js {0} does not satisfy the server's required engine range ({1}). Install a compatible version, and restart the desktop app." | 只在 Windows / Linux 的文件 |
| `wsl/DesktopWslEnvironment.ts:855` | "The bundled WSL backend binary (node-pty) could not be loaded in this distro. This usually means an unsupported CPU architecture or incompat…" | 只在 Windows / Linux 的文件 |
| `wsl/DesktopWslEnvironment.ts:888` | "node-pty Linux build failed (exit {0}): {1}" | 只在 Windows / Linux 的文件 |
| `wsl/DesktopWslEnvironment.ts:888` | "no stderr captured" | 只在 Windows / Linux 的文件 |
| `wsl/DesktopWslEnvironment.ts:905` | "wslpath conversion failed for {0}" | 只在 Windows / Linux 的文件 |
| `wsl/DesktopWslEnvironment.ts:920` | "WSL runtime installation timed out. Check that the distro has free disk space, then retry." | 只在 Windows / Linux 的文件 |
| `wsl/DesktopWslEnvironment.ts:921` | "WSL runtime installation lost communication with wsl.exe. Retry, or check that the distro is healthy." | 只在 Windows / Linux 的文件 |
| `wsl/DesktopWslEnvironment.ts:928` | "WSL runtime installation failed (exit {0}): {1}" | 只在 Windows / Linux 的文件 |
| `wsl/DesktopWslEnvironment.ts:928` | "no stderr captured" | 只在 Windows / Linux 的文件 |
| `wsl/DesktopWslEnvironment.ts:936` | "WSL runtime installation completed without reporting its cache path." | 只在 Windows / Linux 的文件 |
| `wsl/DesktopWslEnvironment.ts:1207` | "prepareRuntime stub not configured" | 只在 Windows / Linux 的文件 |
| `wsl/DesktopWslEnvironment.ts:1221` | "ensureNodePty stub not configured" | 只在 Windows / Linux 的文件 |
| `wsl/DesktopWslServerTree.ts:219` | "WSL server files could not be extracted to {0}: {1}" | 只在 Windows / Linux 的文件 |

## C：命令行输出：经控制 socket 回给 `t3` 命令行，不在图形界面（10）

| file:line | 文字 | 说明 |
|---|---|---|
| `app/DesktopAppActivation.ts:148` | "The desktop app request is too large." |  |
| `app/DesktopAppActivation.ts:161` | "The desktop app request is not valid JSON." |  |
| `app/DesktopAppActivation.ts:167` | "The desktop app request is invalid." |  |
| `app/DesktopAppActivation.ts:174` | "T3 Code could not process the desktop app request." |  |
| `app/DesktopAppActivationBroker.ts:48` | "T3 Code is shutting down." |  |
| `app/DesktopAppActivationBroker.ts:53` | "The request id is already in use." |  |
| `app/DesktopAppActivationBroker.ts:63` | "The desktop app did not finish opening the project in time." |  |
| `app/DesktopAppActivationBroker.ts:93` | "The T3 Code window closed before it opened the project." |  |
| `app/DesktopAppActivationBroker.ts:106` | "The command closed before T3 Code was ready." |  |
| `app/DesktopAppActivationBroker.ts:115` | "T3 Code is shutting down." |  |

## P：预览注释工具（注入被预览页面，报告第 5 节，未翻译）（31）

| file:line | 文字 | 说明 |
|---|---|---|
| `preview/PickPreload.ts:39` | "color-mix(in srgb, var(--t3-primary) 10%, transparent)" |  |
| `preview/PickPreload.ts:320` | "translate({0}px, {1}px)" |  |
| `preview/PickPreload.ts:350` | "translate({0}px, {1}px)" |  |
| `preview/PickPreload.ts:441` | "Style value" |  |
| `preview/PickPreload.ts:463` | "grid min-h-7 grid-cols-[82px_minmax(0,1fr)] items-center gap-2 font-sans text-xs font-medium text-muted-foreground" |  |
| `preview/PickPreload.ts:562` | "pointer-events-auto fixed hidden max-h-[calc(100vh-16px)] w-[min(360px,calc(100vw-16px))] flex-col overflow-hidden rounded-xl border border-…" |  |
| `preview/PickPreload.ts:569` | "Expand annotation editor" |  |
| `preview/PickPreload.ts:570` | "Expand annotation editor" |  |
| `preview/PickPreload.ts:579` | "Describe the change…" |  |
| `preview/PickPreload.ts:588` | "Drag annotation editor" |  |
| `preview/PickPreload.ts:593` | "Attach annotation and screenshot (Enter)" |  |
| `preview/PickPreload.ts:596` | "Attach annotation and screenshot (Enter). Send with Cmd/Ctrl+Enter." | 注入被预览页面的注释工具按钮提示，沿用报告第 5 节的未翻译范围 |
| `preview/PickPreload.ts:597` | "Attach annotation and screenshot (Enter)" | 同一注释按钮在不可发送时的提示，沿用报告第 5 节的未翻译范围 |
| `preview/PickPreload.ts:607` | "hidden max-h-[min(176px,calc(100vh-180px))] overflow-auto border-t border-border bg-muted/40 px-3" |  |
| `preview/PickPreload.ts:753` | "Font size" |  |
| `preview/PickPreload.ts:763` | "Font weight" |  |
| `preview/PickPreload.ts:771` | "Line height" |  |
| `preview/PickPreload.ts:780` | "grid min-h-7 grid-cols-[82px_minmax(0,1fr)] items-center gap-2 font-sans text-xs font-medium text-muted-foreground" |  |
| `preview/PickPreload.ts:785` | "grid h-7 grid-cols-[22px_minmax(0,1fr)] items-center gap-1 rounded-md border border-input bg-background px-1 shadow-xs" |  |
| `preview/PickPreload.ts:812` | "Text color" |  |
| `preview/PickPreload.ts:833` | "Border color" |  |
| `preview/PickPreload.ts:844` | "Border width" |  |
| `preview/PickPreload.ts:858` | "Lock aspect ratio" |  |
| `preview/PickPreload.ts:955` | "Select elements (V)" |  |
| `preview/PickPreload.ts:957` | "Draw freehand (D)" |  |
| `preview/PickPreload.ts:958` | "Remove an annotation target (E)" |  |
| `preview/PickPreload.ts:1054` | "Collapse annotation editor" |  |
| `preview/PickPreload.ts:1055` | "Collapse annotation editor" |  |
| `preview/PickPreload.ts:1063` | "Expand annotation editor" |  |
| `preview/PickPreload.ts:1064` | "Expand annotation editor" |  |
| `preview/PickPreload.ts:1269` | "color-mix(in srgb, var(--t3-primary) 6%, transparent)" |  |

## E：错误消息：Error / TaggedError 的 message 及其参数（§4「从不转换」位置）（264）

| file:line | 文字 | 说明 |
|---|---|---|
| `app/DesktopApp.ts:56` | "No desktop backend port is available on hosts {0} between {1} and {2}." |  |
| `app/DesktopApp.ts:65` | "T3CODE_PORT is required in desktop development." |  |
| `app/DesktopAppActivation.ts:45` | "Could not start the desktop app control socket at {0}." |  |
| `app/DesktopAppActivation.ts:86` | "{0} is not a directory." |  |
| `app/DesktopAppActivation.ts:89` | "{0} is owned by another user." |  |
| `app/DesktopAssets.ts:25` | "Failed to probe desktop asset \"{0}\" at {1}." |  |
| `app/DesktopClerk.ts:33` | "Failed to initialize the desktop Clerk bridge for state directory \"{0}\" (development: {1})." |  |
| `app/DesktopClerk.ts:46` | "Failed to clean up the desktop Clerk bridge for state directory \"{0}\" (development: {1})." |  |
| `app/DesktopConnectionCatalogStore.ts:79` | "Desktop connection catalog write failed during {0} at {1}." |  |
| `app/DesktopConnectionCatalogStore.ts:92` | "Failed to decode {0} for the desktop connection catalog at {1}." |  |
| `app/DesktopConnectionCatalogStore.ts:104` | "Failed to read the desktop connection catalog at {0}." |  |
| `app/DesktopConnectionCatalogStore.ts:116` | "Failed to decode the desktop connection catalog document at {0}." |  |
| `app/DesktopConnectionCatalogStore.ts:131` | " for environment {0}" |  |
| `app/DesktopConnectionCatalogStore.ts:132` | "Legacy desktop saved-environment migration failed during {0}{1} into {2}." |  |
| `app/DesktopConnectionCatalogStore.ts:145` | "Desktop connection catalog protection failed during {0} at {1}." |  |
| `app/DesktopLifecycle.ts:27` | "Desktop relaunch failed for reason \"{0}\"." |  |
| `app/DesktopLinuxUrlHandler.ts:37` | ", xdg-mime exit code {0}" |  |
| `app/DesktopLinuxUrlHandler.ts:38` | "Failed to register the {0}:// URL handler (step: {1}{2})." |  |
| `app/DesktopLinuxUrlHandler.ts:54` | ", update-desktop-database exit code {0}" |  |
| `app/DesktopLinuxUrlHandler.ts:55` | "Failed to refresh the desktop MIME cache at {0}{1}." |  |
| `app/DesktopObservability.ts:117` | "{0} must be >= 1 (received {1})" |  |
| `app/DesktopUserData.ts:17` | "Could not initialize Electron user data during {0} at {1} ({2})." |  |
| `app/chromiumLocalStorage.ts:55` | "unexpected end of data" | LevelDB / Snappy 解析错误：读取旧版 localStorage 时的内部失败原因，不在界面显示 |
| `app/chromiumLocalStorage.ts:67` | "varint too long" | LevelDB / Snappy 解析错误：读取旧版 localStorage 时的内部失败原因，不在界面显示 |
| `app/chromiumLocalStorage.ts:70` | "length out of range" | LevelDB / Snappy 解析错误：读取旧版 localStorage 时的内部失败原因，不在界面显示 |
| `app/chromiumLocalStorage.ts:121` | "snappy literal overflows output" | LevelDB / Snappy 解析错误：读取旧版 localStorage 时的内部失败原因，不在界面显示（自动规则会误判为样式类名） |
| `app/chromiumLocalStorage.ts:139` | "snappy copy out of range" | LevelDB / Snappy 解析错误：读取旧版 localStorage 时的内部失败原因，不在界面显示 |
| `app/chromiumLocalStorage.ts:147` | "snappy output length mismatch" | LevelDB / Snappy 解析错误：读取旧版 localStorage 时的内部失败原因，不在界面显示 |
| `app/chromiumLocalStorage.ts:258` | "unknown manifest tag {0}" | LevelDB / Snappy 解析错误：读取旧版 localStorage 时的内部失败原因，不在界面显示 |
| `app/chromiumLocalStorage.ts:262` | "incomplete manifest" | LevelDB / Snappy 解析错误：读取旧版 localStorage 时的内部失败原因，不在界面显示 |
| `app/chromiumLocalStorage.ts:284` | "write batch too short" | LevelDB / Snappy 解析错误：读取旧版 localStorage 时的内部失败原因，不在界面显示 |
| `app/chromiumLocalStorage.ts:297` | "unknown write batch record type {0}" | LevelDB / Snappy 解析错误：读取旧版 localStorage 时的内部失败原因，不在界面显示 |
| `app/chromiumLocalStorage.ts:305` | "block handle out of range" | LevelDB / Snappy 解析错误：读取旧版 localStorage 时的内部失败原因，不在界面显示 |
| `app/chromiumLocalStorage.ts:309` | "block checksum" | LevelDB / Snappy 解析错误：读取旧版 localStorage 时的内部失败原因，不在界面显示 |
| `app/chromiumLocalStorage.ts:312` | "unsupported block compression {0}" | LevelDB / Snappy 解析错误：读取旧版 localStorage 时的内部失败原因，不在界面显示 |
| `app/chromiumLocalStorage.ts:316` | "block too short" | LevelDB / Snappy 解析错误：读取旧版 localStorage 时的内部失败原因，不在界面显示 |
| `app/chromiumLocalStorage.ts:319` | "restart array out of range" | LevelDB / Snappy 解析错误：读取旧版 localStorage 时的内部失败原因，不在界面显示 |
| `app/chromiumLocalStorage.ts:326` | "block key prefix out of range" | LevelDB / Snappy 解析错误：读取旧版 localStorage 时的内部失败原因，不在界面显示 |
| `app/chromiumLocalStorage.ts:337` | "table too short" | LevelDB / Snappy 解析错误：读取旧版 localStorage 时的内部失败原因，不在界面显示 |
| `app/chromiumLocalStorage.ts:345` | "internal key too short" | LevelDB / Snappy 解析错误：读取旧版 localStorage 时的内部失败原因，不在界面显示 |
| `app/chromiumLocalStorage.ts:375` | "Could not read Chromium Local Storage at {0}." |  |
| `app/chromiumLocalStorage.ts:405` | "bad CURRENT" |  |
| `app/chromiumLocalStorage.ts:447` | "database changed while reading" |  |
| `backend/DesktopBackendConfiguration.ts:34` | "Failed to read persisted backend observability settings at {0}." |  |
| `backend/DesktopBackendManager.ts:143` | "Timed out after {0}ms waiting for desktop backend readiness at {1}." |  |
| `backend/DesktopBackendManager.ts:155` | "Failed to encode the desktop backend bootstrap payload for {0}." |  |
| `backend/DesktopBackendManager.ts:167` | "Failed to spawn desktop backend entry {0} with {1}." |  |
| `backend/DesktopBackendManager.ts:181` | "Failed to read {0} from desktop backend process {1}." |  |
| `backend/DesktopBackendManager.ts:196` | "Failed to handle {0} bytes from {1} of desktop backend process {2}." |  |
| `backend/DesktopBackendManager.ts:213` | "Failed to read the exit status of desktop backend process {0}." |  |
| `backend/DesktopBackendPool.ts:125` | "Backend instance \"{0}\" is already registered in the pool." |  |
| `backend/DesktopBackendPool.ts:137` | "Refusing to unregister the primary backend from the pool." |  |
| `backend/DesktopLocalEnvironmentAuth.ts:44` | "Local backend is not configured." |  |
| `backend/DesktopLocalEnvironmentAuth.ts:53` | "Failed to create the local desktop bearer session." |  |
| `backend/DesktopNetworkInterfaces.ts:31` | "Failed to read desktop network interfaces on {0}." |  |
| `backend/DesktopServerExposure.ts:216` | "No reachable network address is available for desktop network access on port {0}." |  |
| `backend/DesktopServerExposure.ts:228` | "Failed to persist desktop server exposure mode {0}." |  |
| `backend/DesktopServerExposure.ts:241` | "Failed to persist desktop Tailscale Serve settings (enabled: {0}, port: {1})." |  |
| `electron/ElectronApp.ts:25` | "Failed to read Electron app metadata property \"{0}\"." |  |
| `electron/ElectronApp.ts:37` | "Failed to wait for the Electron app to become ready (packaged: {0})." |  |
| `electron/ElectronDialog.ts:18` | "the application" |  |
| `electron/ElectronDialog.ts:19` | "no default path" |  |
| `electron/ElectronDialog.ts:20` | "Failed to open the Electron folder picker for {0} with {1}." |  |
| `electron/ElectronDialog.ts:33` | "the application" |  |
| `electron/ElectronDialog.ts:34` | "no default path" |  |
| `electron/ElectronDialog.ts:35` | "Failed to open the Electron file picker for {0} with {1}." |  |
| `electron/ElectronDialog.ts:52` | "Failed to show the Electron {0} message box with {1} buttons." |  |
| `electron/ElectronDialog.ts:65` | "Failed to show the Electron error box with a {0}-character title and {1}-character content." |  |
| `electron/ElectronMenu.ts:45` | " for window {0}" |  |
| `electron/ElectronMenu.ts:46` | "Electron menu operation {0} failed{1} with {2} items on {3}." |  |
| `electron/ElectronProtocol.ts:39` | "Failed to register Electron protocol scheme \"{0}\"." |  |
| `electron/ElectronProtocol.ts:51` | "Failed to unregister Electron protocol scheme \"{0}\"." |  |
| `electron/ElectronSafeStorage.ts:21` | "Electron safe storage failed to check encryption availability." |  |
| `electron/ElectronSafeStorage.ts:32` | "Electron safe storage failed to encrypt a string." |  |
| `electron/ElectronSafeStorage.ts:43` | "Electron safe storage failed to decrypt a string." |  |
| `electron/ElectronTheme.ts:18` | "Failed to set the Electron theme source to {0}." |  |
| `electron/ElectronUpdater.ts:21` | "Electron updater failed to check for updates on channel {0}." |  |
| `electron/ElectronUpdater.ts:33` | "Electron updater failed to download the update on channel {0}." |  |
| `electron/ElectronUpdater.ts:47` | "Electron updater failed to quit and install the update on channel {0} (silent: {1}, force run after: {2})." |  |
| `electron/ElectronWindow.ts:88` | "Failed to create Electron BrowserWindow{0}{1}." |  |
| `electron/ElectronWindow.ts:103` | " for window {0}" |  |
| `electron/ElectronWindow.ts:104` | " on channel {0}" |  |
| `electron/ElectronWindow.ts:105` | "Electron window operation {0} failed{1}{2} on {3}." |  |
| `electron/WindowsForeground.ts:32` | "Unsupported Windows window handle size: {0} bytes." |  |
| `electron/WindowsForeground.ts:219` | "Windows refused to activate the T3 Code window." |  |
| `ipc/DesktopIpc.ts:38` | "Failed to register the {0} IPC handler for {1}." |  |
| `ipc/DesktopIpc.ts:51` | "Failed to unregister the {0} IPC handler for {1}." |  |
| `ipc/methods/snapShot.ts:30` | "Snapshot request was rejected." |  |
| `ipc/methods/sshEnvironment.ts:87` | "[ssh_http:{0}] " |  |
| `ipc/methods/sshEnvironment.ts:88` | "{0}SSH remote API request failed during {1}." |  |
| `permissions/MacPermissionHelper.ts:98` | "The packaged T3 Code icon is missing." |  |
| `preview/BrowserImport/BrowserImport.ts:54` | "Importing cookies from {0} failed: {1}." |  |
| `preview/BrowserImport/BrowserImport.ts:67` | "Could not write imported cookie {0} for {1}." |  |
| `preview/BrowserImport/ChromiumCookies.ts:74` | "Could not read Chromium cookies at {0}: {1}." |  |
| `preview/BrowserImport/ChromiumKeys.ts:56` | "Could not obtain the Chromium cookie key: {0}." |  |
| `preview/BrowserImport/FirefoxCookies.ts:42` | "Could not read Firefox cookies at {0}." |  |
| `preview/BrowserImport/SafariCookies.ts:58` | "Could not read Safari cookies: {0}." |  |
| `preview/BrowserImport/SafariCookies.ts:59` | "Could not read Safari cookies at {0}: {1}." |  |
| `preview/BrowserSession.ts:50` | "Failed to derive a desktop preview browser partition for scope {0}." |  |
| `preview/BrowserSession.ts:63` | "Failed to create a desktop preview browser session for scope {0} (partition {1})." |  |
| `preview/BrowserSession.ts:75` | "Failed to clear desktop preview browser storage for partition {0}." |  |
| `preview/BrowserSession.ts:87` | "Failed to clear the desktop preview browser cache for partition {0}." |  |
| `preview/CdpRelay.ts:134` | "Only this preview tab's page can be attached." | CDP 命令协议校验错误，Error 消息保持原文 |
| `preview/CdpRelay.ts:156` | "Not supported for a desktop preview tab: {0}" | 不受支持的 CDP 命令错误，Error 消息保持原文 |
| `preview/Manager.ts:1075` | "WebContents was destroyed" |  |
| `preview/Manager.ts:2954` | "Picture-in-picture session closed before it became visible." |  |
| `preview/Manager.ts:2987` | "Preview webview changed while picture-in-picture was opening." |  |
| `preview/Manager.ts:3404` | "Preview tab not found: {0}" |  |
| `preview/Manager.ts:3413` | "WebContents {0} not found for preview tab {1}" |  |
| `preview/Manager.ts:3422` | "Preview tab \"{0}\" has no webview registered" |  |
| `preview/Manager.ts:3431` | "Cannot start preview frame capture while the main window is closed: {0}" |  |
| `preview/Manager.ts:3444` | "Preview tab {0} is still claiming the capture stream, so recording could not start for tab {1}" |  |
| `preview/Manager.ts:3456` | "Preview recording capture is unavailable for tab {0} in WebContents {1}" |  |
| `preview/Manager.ts:3480` | "Desktop preview operation failed: {0}{1}" |  |
| `preview/Manager.ts:3494` | "Preview artifact path {0} is outside {1}" |  |
| `preview/Manager.ts:3503` | "Preview artifact could not be loaded as an image: {0}" |  |
| `preview/Manager.ts:3512` | "Close preview DevTools before using agent browser control for WebContents {0}" |  |
| `preview/Manager.ts:3521` | "Preview control cannot attach to WebContents {0} because another debugger owns it" |  |
| `settings/DesktopAppSettings.ts:151` | "Desktop settings write failed during {0} at {1}." |  |
| `settings/DesktopClientSettings.ts:39` | "Desktop client settings read failed during {0} at {1}." |  |
| `settings/DesktopClientSettings.ts:61` | "Desktop client settings write failed during {0} at {1}." |  |
| `settings/DesktopSavedEnvironments.ts:80` | "Failed to read desktop saved environments at {0}." |  |
| `settings/DesktopSavedEnvironments.ts:92` | "Failed to decode desktop saved environments at {0}." |  |
| `settings/DesktopSavedEnvironments.ts:106` | "Failed to decode {0} for environment {1} at {2}." |  |
| `settings/DesktopSavedEnvironments.ts:120` | "Desktop saved-environment secret protection failed during {0} for environment {1} at {2}." |  |
| `shell/DesktopShellEnvironment.ts:47` | "Desktop shell environment {0} probe ({1}) failed." |  |
| `shell/DesktopShellEnvironment.ts:59` | "Desktop shell environment {0} probe ({1}) timed out after {2}ms." |  |
| `snapShot/CaptureShortcutConfig.ts:58` | "Choose a config file smaller than 1 MB." |  |
| `snapShot/CaptureShortcutConfig.ts:60` | "Choose a config file smaller than 1 MB." |  |
| `snapShot/CaptureShortcutConfig.ts:62` | "Choose a text config file." |  |
| `snapShot/CaptureShortcutConfig.ts:78` | "Niri couldn't validate the proposed config. Nothing was changed. Check your config in Advanced." |  |
| `snapShot/CaptureShortcutConfig.ts:92` | "Hyprland reported config errors." |  |
| `snapShot/CaptureShortcutConfig.ts:111` | "Couldn't check Hyprland's current shortcuts. Try again from your Hyprland session." |  |
| `snapShot/CaptureShortcutConfig.ts:122` | "{0} is already used by Hyprland. Choose another shortcut." |  |
| `snapShot/CaptureShortcutConfig.ts:129` | "Wait for the current config change to finish." |  |
| `snapShot/CaptureShortcutConfig.ts:132` | "Couldn't read your settings file. Choose a different file in Advanced." |  |
| `snapShot/CaptureShortcutConfig.ts:135` | "Choose your own config, not system or Omarchy defaults." |  |
| `snapShot/CaptureShortcutConfig.ts:147` | "Choose a .kdl Niri config or a .conf/.lua Hyprland config." |  |
| `snapShot/CaptureShortcutConfig.ts:164` | "This config has too many included files. Use manual setup in Advanced." |  |
| `snapShot/CaptureShortcutConfig.ts:167` | "This config uses a dynamic include. Use manual setup in Advanced." |  |
| `snapShot/CaptureShortcutConfig.ts:180` | "Couldn't read an included Niri config. Check its location in Advanced." |  |
| `snapShot/CaptureShortcutConfig.ts:191` | "{0} is already used in {1}. Choose another shortcut." |  |
| `snapShot/CaptureShortcutConfig.ts:221` | "This preview expired. Review changes again before saving." |  |
| `snapShot/CaptureShortcutConfig.ts:239` | "Your config changed since this preview. Review changes again before saving." |  |
| `snapShot/CaptureShortcutConfig.ts:252` | "Your config changed since this preview. Nothing was saved. Review changes again before saving." |  |
| `snapShot/DesktopSnapShot.ts:141` | "Could not list pending snapshots." |  |
| `snapShot/DesktopSnapShot.ts:143` | "Could not read the snapshot." |  |
| `snapShot/DesktopSnapShot.ts:145` | "Could not remove the snapshot." |  |
| `snapShot/DesktopSnapShot.ts:147` | "SnapShots are not supported here." |  |
| `snapShot/DesktopSnapShot.ts:149` | "Enable SnapShots in Settings first." |  |
| `snapShot/DesktopSnapShot.ts:151` | "No window was selected." |  |
| `snapShot/DesktopSnapShot.ts:153` | "The active window is not available for capture." |  |
| `snapShot/DesktopSnapShot.ts:155` | "Could not capture the active window." |  |
| `snapShot/DesktopSnapShot.ts:219` | "Config setup requires a Niri or Hyprland session." |  |
| `snapShot/DesktopSnapShot.ts:221` | "Couldn't prepare your capture shortcut changes." |  |
| `snapShot/DesktopSnapShot.ts:222` | "Couldn't save your capture shortcut." |  |
| `snapShot/DesktopSnapShot.ts:229` | "Helper setup requires a Hyprland Wayland session outside a sandbox." |  |
| `snapShot/DesktopSnapShot.ts:231` | "Helper setup requires a KDE Plasma Wayland session outside a sandbox." |  |
| `snapShot/DesktopSnapShot.ts:232` | "Extension setup requires a GNOME Wayland session outside a sandbox." |  |
| `snapShot/DesktopSnapShot.ts:233` | "Could not open shortcut permissions." |  |
| `snapShot/DesktopSnapShot.ts:235` | "Could not set up Hyprland capture." |  |
| `snapShot/DesktopSnapShot.ts:237` | "Could not set up KDE capture." |  |
| `snapShot/DesktopSnapShot.ts:238` | "Could not set up the GNOME extension." |  |
| `snapShot/DesktopSnapShot.ts:1338` | "No window is available to test capture." |  |
| `snapShot/GlobalShiftShortcutProcess.ts:58` | "Snapshot shortcut helper exited with code {0}" |  |
| `snapShot/GnomeCaptureSetup.ts:52` | "The extension installation is not a regular directory. Manage it in GNOME Extensions instead." |  |
| `snapShot/GnomeCaptureSetup.ts:59` | "A newer extension is installed. Update T3 Code instead of replacing it." |  |
| `snapShot/GnomeCaptureSetup.ts:123` | "GNOME did not respond. Sign in to a GNOME Wayland session and try again." |  |
| `snapShot/GnomeCaptureSetup.ts:130` | "GNOME returned no setup information." |  |
| `snapShot/GnomeCaptureSetup.ts:244` | "GNOME has not loaded the extension. Sign out and back in, then try again." |  |
| `snapShot/HyprlandSnapShot.ts:22` | "Invalid capture application ID." |  |
| `snapShot/HyprlandSnapShot.ts:60` | "Hyprland capture did not respond. Check capture setup and try again." |  |
| `snapShot/HyprlandSnapShot.ts:75` | "The capture helper must be a regular file, not a link." |  |
| `snapShot/HyprlandSnapShot.ts:98` | "The Hyprland capture helper is missing from this build. Update or reinstall T3 Code." |  |
| `snapShot/HyprlandSnapShot.ts:126` | "The capture helper directory must not be a link." |  |
| `snapShot/HyprlandSnapShot.ts:133` | "The Hyprland capture helper is missing from this build." |  |
| `snapShot/HyprlandSnapShot.ts:171` | "{0} Open Settings → SnapShots to continue setup." |  |
| `snapShot/KdeSnapShot.ts:62` | "KDE couldn't register the capture helper. Make sure KDE's service tools (kbuildsycoca6) are installed, then reinstall the helper." |  |
| `snapShot/KdeSnapShot.ts:70` | "KDE hasn't granted capture access. Reinstall the capture helper in setup, then try again." |  |
| `snapShot/KdeSnapShot.ts:77` | "The KDE capture helper did not respond. Reopen capture setup and check access." |  |
| `snapShot/KdeSnapShot.ts:93` | "Capture helper files must be regular files. Remove the conflicting link before trying again." |  |
| `snapShot/KdeSnapShot.ts:145` | "Another desktop entry uses the capture helper's name. Rename it before continuing." |  |
| `snapShot/KdeSnapShot.ts:154` | "The capture helper directory is not a regular directory." |  |
| `snapShot/KdeSnapShot.ts:165` | "The capture helper is missing from this build. Update or reinstall T3 Code." |  |
| `snapShot/KdeSnapShot.ts:223` | "{0} Open Settings → SnapShots to continue setup." |  |
| `snapShot/LinuxSnapShot.ts:136` | "Snapshot timed out." |  |
| `snapShot/LinuxSnapShot.ts:146` | "Missing D-Bus reply." |  |
| `snapShot/LinuxSnapShot.ts:273` | "Invalid screenshot request handle." |  |
| `snapShot/LinuxSnapShot.ts:283` | "Snapshot was cancelled." |  |
| `snapShot/LinuxSnapShot.ts:284` | "Your desktop did not allow the snapshot." |  |
| `snapShot/LinuxSnapShot.ts:309` | "Another T3 Code instance is capturing a window. Try again." |  |
| `snapShot/LinuxSnapShot.ts:320` | "Invalid extension screenshot." |  |
| `snapShot/LinuxSnapShot.ts:393` | "Hyprland capture setup is unavailable in this build." |  |
| `snapShot/LinuxSnapShot.ts:405` | "KDE capture setup is unavailable in this build." |  |
| `snapShot/MacModifierPairShortcutProcess.ts:90` | "Snapshot shortcut helper exited with code {0}" |  |
| `snapShot/MacSnapShot.ts:47` | "macOS returned an invalid snapshot." |  |
| `snapShot/MacSnapShot.ts:50` | "macOS returned an invalid snapshot." |  |
| `snapShot/NiriCaptureShortcut.ts:52` | "Niri capture shortcut registration timed out." |  |
| `snapShot/NiriCaptureShortcut.ts:58` | "Another T3 Code instance already owns the capture shortcut." |  |
| `snapShot/NiriSnapShot.ts:74` | "Niri returned an oversized message." |  |
| `snapShot/NiriSnapShot.ts:85` | "Niri returned an invalid message." |  |
| `snapShot/NiriSnapShot.ts:91` | "Niri disconnected." |  |
| `snapShot/NiriSnapShot.ts:114` | "Invalid Niri response." |  |
| `snapShot/NiriSnapShot.ts:117` | "Niri snapshot timed out." |  |
| `snapShot/NiriSnapShot.ts:127` | "Niri connection closed." |  |
| `snapShot/NiriSnapShot.ts:153` | "SnapShots require Niri 25.11 or newer." |  |
| `snapShot/NiriSnapShot.ts:159` | "Niri activation cancelled." |  |
| `snapShot/NiriSnapShot.ts:178` | "More than one T3 Code window matches the capture destination." |  |
| `snapShot/NiriSnapShot.ts:201` | "Niri has no focused window to capture." |  |
| `snapShot/PortalCaptureShortcut.ts:116` | "Capture shortcut registration closed." |  |
| `snapShot/PortalCaptureShortcut.ts:135` | "Change the capture binding in your Hyprland config, then save it." |  |
| `snapShot/PortalCaptureShortcut.ts:138` | "Open your desktop's shortcut settings and allow T3 Code's capture shortcut." |  |
| `snapShot/PortalCaptureShortcut.ts:183` | "Shortcut permission request timed out. Try again." |  |
| `snapShot/PortalCaptureShortcut.ts:194` | "Capture shortcut registration closed." |  |
| `snapShot/PortalCaptureShortcut.ts:196` | "Missing shortcut portal reply." |  |
| `snapShot/PortalCaptureShortcut.ts:221` | "The desktop shortcut service restarted. Retry the shortcut request." |  |
| `snapShot/PortalCaptureShortcut.ts:241` | "Your desktop closed the capture shortcut. Retry the shortcut request." |  |
| `snapShot/PortalCaptureShortcut.ts:292` | "Invalid shortcut request handle." |  |
| `snapShot/PortalCaptureShortcut.ts:311` | "Your desktop could not create a capture shortcut session." |  |
| `snapShot/PortalCaptureShortcut.ts:408` | "Invalid shortcut session handle." |  |
| `snapShot/RegionSnapShot.ts:72` | "Windows window capture is unavailable." |  |
| `snapShot/RegionSnapShot.ts:84` | "Windows window capture failed." |  |
| `snapShot/RegionSnapShot.ts:102` | "Windows window capture helper exited." |  |
| `snapShot/RegionSnapShot.ts:110` | "Windows window capture helper already used." |  |
| `snapShot/RegionSnapShot.ts:112` | "Windows window capture timed out. Try again." |  |
| `snapShot/RegionSnapShot.ts:125` | "Windows window capture cancelled." |  |
| `snapShot/RegionSnapShot.ts:157` | "Windows window capture is unavailable." |  |
| `snapShot/RegionSnapShot.ts:159` | "Windows window capture is still in progress. Try again." |  |
| `snapShot/captureConfigEdit.ts:15` | "Choose a letter, number, or function key with Ctrl, Alt, or Super." |  |
| `snapShot/captureConfigEdit.ts:43` | "Invalid capture application ID." |  |
| `snapShot/captureConfigEdit.ts:55` | "This Niri config has an unexpected binds section. Check it in Advanced." |  |
| `snapShot/captureConfigEdit.ts:106` | "Couldn't resolve a Niri include. Choose the config in Advanced." |  |
| `snapShot/captureConfigEdit.ts:149` | "This Lua config needs a manual edit. Choose your bindings file or use manual setup in Advanced." |  |
| `snapShot/captureConfigEdit.ts:167` | "{0} is already used in this config. Choose another shortcut." |  |
| `snapShot/captureConfigKdl.ts:20` | "Couldn't read this Niri config. Use Advanced to configure it manually." |  |
| `snapShot/linuxCaptureSession.ts:99` | "This key isn't supported as a Wayland capture shortcut. Choose another key." |  |
| `snapShot/linuxCaptureSession.ts:116` | "Invalid or oversized window screenshot." |  |
| `snapShot/linuxCaptureSession.ts:119` | "The window screenshot is empty." |  |
| `snapShot/linuxCaptureSession.ts:138` | "Invalid screenshot file." |  |
| `snapShot/linuxCaptureSession.ts:143` | "Incomplete screenshot file." |  |
| `snapShot/snapShot.ts:450` | "Timed out waiting for T3 Code to lose focus." |  |
| `ssh/DesktopSshEnvironment.ts:87` | "Unhandled desktop SSH password prompt error: {0}" |  |
| `ssh/DesktopSshPasswordPrompts.ts:52` | "Secure randomness is unavailable." |  |
| `ssh/DesktopSshPasswordPrompts.ts:65` | "before a request id was assigned" |  |
| `ssh/DesktopSshPasswordPrompts.ts:66` | "T3 Code window is unavailable during {0} for SSH authentication to {1} (request: {2})." |  |
| `ssh/DesktopSshPasswordPrompts.ts:80` | "Failed to present SSH password prompt for {0}." |  |
| `ssh/DesktopSshPasswordPrompts.ts:92` | "SSH authentication timed out for {0}." |  |
| `ssh/DesktopSshPasswordPrompts.ts:104` | "SSH authentication cancelled for {0}." |  |
| `ssh/DesktopSshPasswordPrompts.ts:116` | "SSH authentication was cancelled because the app window closed." |  |
| `ssh/DesktopSshPasswordPrompts.ts:128` | "SSH password prompt service stopped." |  |
| `ssh/DesktopSshPasswordPrompts.ts:139` | "Invalid SSH password prompt id." |  |
| `ssh/DesktopSshPasswordPrompts.ts:150` | "SSH password prompt expired. Try connecting again." |  |
| `updates/DesktopUpdates.ts:88` | "Cannot change the desktop update channel to {0} while an update {1} action is in progress." |  |
| `updates/DesktopUpdates.ts:100` | "Failed to persist the {0} desktop update channel." |  |
| `updates/DesktopUpdates.ts:112` | "Desktop update {0} poller failed." |  |
| `updates/DesktopUpdates.ts:124` | "Failed to handle desktop update {0} event." |  |
| `updates/DesktopUpdates.ts:136` | "Desktop updater {0} operation reported an error." |  |
| `updates/DesktopUpdates.ts:148` | "Desktop update {0} action failed unexpectedly." |  |
| `window/DesktopApplicationMenu.ts:25` | "Desktop menu action \"{0}\" failed." |  |
| `wsl/DesktopWslBackend.ts:90` | "No loopback port available for WSL backend between {0} and {1}." |  |
| `wsl/DesktopWslEnvironment.ts:1002` | "wsl.exe --list --verbose exited with code {0}" |  |
| `wsl/DesktopWslEnvironment.ts:1012` | "Failed to run wsl.exe --list --verbose: {0}" |  |
| `wsl/DesktopWslEnvironment.ts:1020` | "wsl.exe --list --verbose timed out" |  |
| `wsl/DesktopWslServerTree.ts:42` | "Failed to extract the WSL server tree to {0}." |  |

## L：日志与观测（129）

| file:line | 文字 | 说明 |
|---|---|---|
| `app/DesktopApp.ts:129` | "fatal startup error" |  |
| `app/DesktopApp.ts:137` | "T3 Code failed to start" |  |
| `app/DesktopApp.ts:169` | "bootstrap start" |  |
| `app/DesktopApp.ts:183` | "bootstrap ipc handlers registered" |  |
| `app/DesktopApp.ts:192` | "bootstrap skipping local environment (disabled in settings)" |  |
| `app/DesktopApp.ts:212` | "selected backend port via sequential scan" |  |
| `app/DesktopApp.ts:213` | "using configured backend port" |  |
| `app/DesktopApp.ts:221` | "bootstrap restoring persisted server exposure mode" |  |
| `app/DesktopApp.ts:227` | "bootstrap resolved backend endpoint" |  |
| `app/DesktopApp.ts:231` | "bootstrap enabled network access" |  |
| `app/DesktopApp.ts:239` | "bootstrap fell back to local-only because no advertised network host was available" |  |
| `app/DesktopApp.ts:253` | "bootstrap backend start requested" |  |
| `app/DesktopApp.ts:255` | "desktop app control socket ready" |  |
| `app/DesktopApp.ts:256` | "desktop app control socket unavailable" |  |
| `app/DesktopApp.ts:303` | "runtime logging configured" |  |
| `app/DesktopApp.ts:307` | "linux password store configured" |  |
| `app/DesktopApp.ts:324` | "app ready" |  |
| `app/DesktopApp.ts:327` | "safe storage ready" |  |
| `app/DesktopAppActivation.ts:335` | "failed to focus the desktop window" |  |
| `app/DesktopAppActivation.ts:359` | "failed to restore the desktop app control socket" |  |
| `app/DesktopAppActivation.ts:367` | "failed to close the desktop app control socket" |  |
| `app/DesktopClerk.ts:162` | "Could not complete ChatGPT desktop handoff." |  |
| `app/DesktopClerk.ts:179` | "Could not return to provider setup" |  |
| `app/DesktopConnectionCatalogStore.ts:274` | "Could not remove a temporary connection catalog file." |  |
| `app/DesktopConnectionCatalogStore.ts:508` | "Could not clear the desktop connection catalog." |  |
| `app/DesktopLegacyLocalStorage.ts:79` | "Could not record the V1 Local Storage import" |  |
| `app/DesktopLegacyLocalStorage.ts:97` | "Could not read V1 Local Storage; will retry next launch" |  |
| `app/DesktopLegacyLocalStorage.ts:102` | "V1 Local Storage ready to import" |  |
| `app/DesktopLifecycle.ts:110` | "before-quit received" |  |
| `app/DesktopLifecycle.ts:122` | "before-quit received" |  |
| `app/DesktopLifecycle.ts:126` | "failed to destroy windows before shutdown" |  |
| `app/DesktopLifecycle.ts:155` | "process signal received" |  |
| `app/DesktopLifecycle.ts:168` | "desktop relaunch requested" |  |
| `app/DesktopLifecycle.ts:217` | "allowing updater-controlled quit" |  |
| `app/DesktopLifecycle.ts:219` | "failed to destroy windows before updater quit" |  |
| `app/DesktopLinuxUrlHandler.ts:237` | "URL handler icon copy failed" |  |
| `app/DesktopLinuxUrlHandler.ts:247` | "desktop MIME cache refresh failed" |  |
| `app/DesktopLinuxUrlHandler.ts:256` | "registered URL scheme handler" |  |
| `app/DesktopLinuxUrlHandler.ts:261` | "URL scheme handler registration failed" |  |
| `app/DesktopObservability.ts:482` | "backend child process failure output start" |  |
| `app/DesktopObservability.ts:494` | "backend child process output" |  |
| `app/DesktopObservability.ts:506` | "backend child process failure output end" |  |
| `backend/DesktopBackendConfiguration.ts:456` | "The staged WSL runtime did not start; retrying from the mounted server tree." |  |
| `backend/DesktopBackendConfiguration.ts:462` | "Could not stage the WSL runtime; launching from the mounted server tree instead." |  |
| `backend/DesktopBackendConfiguration.ts:683` | "Ignoring the WSL runtime archive because its SHA-256 identity is missing or invalid; launching from the mounted server tree instead." |  |
| `backend/DesktopBackendConfiguration.ts:955` | "WSL-only backend requested but WSL is unavailable; starting the Windows primary instead." |  |
| `backend/DesktopBackendManager.ts:539` | "ignored invalid desktop telemetry control message" |  |
| `backend/DesktopBackendManager.ts:547` | "desktop telemetry control stream stopped" |  |
| `backend/DesktopBackendManager.ts:574` | "desktop browser command stream stopped" | 浏览器控制流结束后的后台告警，不在界面显示 |
| `backend/DesktopBackendManager.ts:752` | "failed to generate desktop backend configuration" |  |
| `backend/DesktopBackendManager.ts:760` | "failed to generate desktop backend configuration" | scheduleRestart 的原因，只进日志 |
| `backend/DesktopBackendManager.ts:803` | "backend preflight still failing after fallback; stopping" |  |
| `backend/DesktopBackendManager.ts:820` | "backend preflight failed repeatedly; surfacing and falling back" |  |
| `backend/DesktopBackendManager.ts:847` | "missing server entry at {0}" | scheduleRestart 的原因，只进日志 |
| `backend/DesktopBackendManager.ts:960` | "pid={0} port={1} cwd={2}" |  |
| `backend/DesktopBackendManager.ts:1001` | "backend readiness check failed during bootstrap" |  |
| `backend/DesktopBackendManager.ts:1051` | "backend exited unexpectedly; restart scheduled" |  |
| `backend/DesktopBackendManager.ts:1071` | "desktop backend restart fiber failed" |  |
| `backend/DesktopBackendPool.ts:243` | "primary WSL preflight retry window exhausted; using Windows for this launch" |  |
| `backend/DesktopBackendPool.ts:247` | "WSL backend is still unavailable" |  |
| `backend/DesktopBackendPool.ts:248` | "{0}\n\nT3 Code will use the Windows backend for this launch and retry WSL the next time the app starts." |  |
| `backend/DesktopBackendPool.ts:254` | "primary WSL preflight failed; falling back to Windows" |  |
| `backend/DesktopBackendPool.ts:258` | "WSL backend couldn't start" |  |
| `backend/DesktopBackendPool.ts:259` | "{0}\n\nFalling back to the Windows backend so T3 Code can open. Re-enable the WSL backend from Settings > Connections once the WSL distro is f…" |  |
| `backend/DesktopBackendPool.ts:271` | "failed to persist Windows fallback after WSL preflight failure" |  |
| `backend/DesktopBackendPool.ts:299` | "failed to open main window after backend readiness" |  |
| `backend/DesktopBackendPool.ts:462` | "DesktopBackendPool.layerTest requires at least one instance" |  |
| `backend/DesktopBackendPool.ts:472` | "DesktopBackendPool.layerTest does not support register" |  |
| `backend/DesktopBackendPool.ts:473` | "DesktopBackendPool.layerTest does not support unregister" |  |
| `ipc/methods/notificationBadge.ts:40` | "Could not update notification badge" |  |
| `permissions/MacPermissions.ts:40` | "Could not show permission helper" |  |
| `preview/BrowserImport/BrowserImport.ts:161` | "Imported cookies could not be flushed to disk" |  |
| `preview/BrowserImport/BrowserImport.ts:224` | "Reading browser cookie key from the keychain" |  |
| `preview/Manager.ts:336` | "preview annotation screenshot timed out" |  |
| `preview/Manager.ts:721` | "Failed to restore preview webview frame capture throttling." |  |
| `preview/Manager.ts:815` | "Failed to restore preview frame capture throttling." |  |
| `preview/Manager.ts:847` | "Desktop preview event listener failed." |  |
| `preview/Manager.ts:1424` | "Favicon capture failed." |  |
| `preview/Manager.ts:1977` | "Preview webview control session was not opened on attach." |  |
| `preview/Manager.ts:2636` | "Picture-in-picture frame delivery failed." |  |
| `preview/Manager.ts:2657` | "Background preview frame capture failed." |  |
| `preview/Manager.ts:2732` | "Initial background preview frame was not ready; capture will retry." |  |
| `settings/DesktopClientSettings.ts:85` | "Could not read desktop client settings." |  |
| `settings/DesktopClientSettings.ts:106` | "Could not decode desktop client settings." |  |
| `snapShot/DesktopSnapShot.ts:899` | "The compositor could not activate T3 Code after the snapshot" |  |
| `telemetry/DesktopRendererHistory.ts:92` | "Renderer incident history could not be opened." |  |
| `telemetry/DesktopTelemetryPublisher.ts:300` | "Failed to sample Electron telemetry" |  |
| `updates/DesktopRemoteUpdates.ts:180` | "remote update requested" |  |
| `updates/DesktopRemoteUpdates.ts:260` | "remote update prepared" |  |
| `updates/DesktopRemoteUpdates.ts:272` | "remote update finished" |  |
| `updates/DesktopRemoteUpdates.ts:311` | "remote update request failed unexpectedly" |  |
| `updates/DesktopRemoteUpdates.ts:436` | "remote update commit joining an in-progress install" |  |
| `updates/DesktopRemoteUpdates.ts:454` | "remote update commit failed unexpectedly" |  |
| `updates/DesktopUpdates.ts:399` | "using update channel" |  |
| `updates/DesktopUpdates.ts:419` | "skipping update check while update is active" |  |
| `updates/DesktopUpdates.ts:431` | "checking for updates" |  |
| `updates/DesktopUpdates.ts:476` | "downloading update" |  |
| `updates/DesktopUpdates.ts:532` | "Could not write the update restart marker." |  |
| `updates/DesktopUpdates.ts:571` | "Desktop update install recovery could not restart every backend." |  |
| `updates/DesktopUpdates.ts:575` | "Desktop update install recovery failed unexpectedly." |  |
| `updates/DesktopUpdates.ts:745` | "ignoring update that does not match selected channel" |  |
| `updates/DesktopUpdates.ts:771` | "update available" |  |
| `updates/DesktopUpdates.ts:796` | "no updates available" |  |
| `updates/DesktopUpdates.ts:853` | "download progress" |  |
| `updates/DesktopUpdates.ts:878` | "update downloaded" |  |
| `updates/DesktopUpdates.ts:942` | "Apple Silicon host detected while running Intel build; updates will switch to arm64 packages" |  |
| `updates/DesktopUpdates.ts:948` | "looking for updates" |  |
| `window/DesktopApplicationMenu.ts:90` | "manual update check requested, but updates are disabled" |  |
| `window/DesktopWindow.ts:392` | "failed to read connected displays; using defaults" |  |
| `window/DesktopWindow.ts:398` | "saved main window bounds could not be restored; using defaults" |  |
| `window/DesktopWindow.ts:462` | "failed to persist main window bounds" |  |
| `window/DesktopWindow.ts:771` | "main window failed to load" |  |
| `window/DesktopWindow.ts:801` | "main window render process gone" |  |
| `window/DesktopWindow.ts:853` | "main window created" |  |
| `window/DesktopWindow.ts:923` | "connecting splash shown" |  |
| `window/DesktopWindow.ts:927` | "failed to show connecting splash" |  |
| `window/DesktopWindow.ts:991` | "backend ready" |  |
| `wsl/DesktopWslBackend.ts:128` | "refusing to unregister primary as wsl instance" |  |
| `wsl/DesktopWslBackend.ts:143` | "could not allocate port for WSL backend" |  |
| `wsl/DesktopWslBackend.ts:155` | "registering WSL backend with pool" |  |
| `wsl/DesktopWslBackend.ts:176` | "WSL backend already registered, skipping start" |  |
| `wsl/DesktopWslBackend.ts:220` | "retrying idle WSL backend" |  |
| `wsl/DesktopWslBackend.ts:233` | "tearing down WSL backend" |  |
| `wsl/DesktopWslBackend.ts:259` | "reconcile failed" |  |
| `wsl/DesktopWslEnvironment.ts:954` | "Could not prune old WSL runtime caches." |  |
| `wsl/DesktopWslEnvironment.ts:976` | "Could not invalidate the staged WSL runtime cache." |  |
| `wsl/DesktopWslServerTree.ts:149` | "[wsl-server-tree] Extracting {0} to {1}..." |  |
| `wsl/DesktopWslServerTree.ts:169` | "[wsl-server-tree] Extraction complete at {0}." |  |
| `wsl/DesktopWslServerTree.ts:192` | "[wsl-server-tree] Could not remove the legacy extraction cache." |  |

## S：脚本、命令、SQL、HTML/CSS 模板、样式类名、SVG（172）

| file:line | 文字 | 说明 |
|---|---|---|
| `app/DesktopLinuxUrlHandler.ts:93` | "[Desktop Entry]" |  |
| `electron/ElectronProtocol.ts:91` | "default-src 'self'" |  |
| `electron/ElectronProtocol.ts:92` | "script-src {0}" |  |
| `electron/ElectronProtocol.ts:93` | "connect-src {0}" |  |
| `electron/ElectronProtocol.ts:94` | "img-src 'self' {0}: blob: data: http: https:" |  |
| `electron/ElectronProtocol.ts:95` | "media-src 'self' {0}: blob: http: https:" |  |
| `electron/ElectronProtocol.ts:96` | "style-src 'self' 'unsafe-inline'" |  |
| `electron/ElectronProtocol.ts:97` | "font-src 'self' {0}: data:" |  |
| `electron/ElectronProtocol.ts:98` | "worker-src 'self' blob:" |  |
| `electron/ElectronProtocol.ts:101` | "frame-src 'self' blob: http: https:" |  |
| `electron/ElectronProtocol.ts:102` | "form-action 'self'" |  |
| `permissions/MacSettingsWindow.ts:21` | "\nObjC.import(\"CoreGraphics\");\nObjC.import(\"AppKit\");\nfunction run() {\n  let previous = \"\";\n  while (true) {\n    const apps = $.NSRunningAppl…" |  |
| `preview/BrowserImport/ChromiumCookies.ts:238` | "select value from meta where key = 'version' limit 1" |  |
| `preview/BrowserImport/ChromiumCookies.ts:244` | "select host_key, name, value, encrypted_value, path,\n                expires_utc / 1000000 as expires_seconds, is_secure, is_httponly,\n     …" |  |
| `preview/BrowserImport/ChromiumCookies.ts:247` | "select host_key, name, value, encrypted_value, path,\n                expires_utc / 1000000 as expires_seconds, is_secure, is_httponly,\n     …" |  |
| `preview/BrowserImport/ChromiumKeys.ts:193` | "Add-Type -AssemblyName System.Security;" |  |
| `preview/BrowserImport/CookieDatabase.ts:97` | "VACUUM INTO {0}" |  |
| `preview/BrowserImport/FirefoxCookies.ts:123` | "pragma user_version" |  |
| `preview/BrowserImport/FirefoxCookies.ts:134` | "\n          select host, name, value, path, expiry, isSecure, isHttpOnly, sameSite, rawSameSite\n            from moz_cookies\n           where…" |  |
| `preview/BrowserImport/FirefoxCookies.ts:139` | "\n          select host, name, value, path, expiry, isSecure, isHttpOnly, sameSite,\n                 null as rawSameSite\n            from moz…" |  |
| `preview/BrowserImport/Sources.ts:390` | "select count(*) as count from moz_cookies where originAttributes = ''" |  |
| `preview/BrowserImport/Sources.ts:391` | "select count(*) as count from cookies" |  |
| `preview/BrowserImport/Sources.ts:430` | "\n      select title, external_uuid from bookmarks\n      where parent = 0 and type = 1 and subtype = 2 and deleted = 0\n      order by order_i…" |  |
| `preview/BrowserImport/Sources.ts:754` | "import fcntl,os,sys\n" |  |
| `preview/BrowserImport/Sources.ts:755` | "fd=os.open(sys.argv[1],os.O_WRONLY)\n" |  |
| `preview/BrowserImport/Sources.ts:757` | "  fcntl.lockf(fd,fcntl.LOCK_EX\|fcntl.LOCK_NB)\n" |  |
| `preview/BrowserImport/Sources.ts:758` | "except BlockingIOError:\n" |  |
| `preview/BrowserImport/Sources.ts:759` | "  print('held')\n" |  |
| `preview/BrowserImport/Sources.ts:761` | "  print('free')" |  |
| `preview/FaviconCapture.ts:600` | "\n    (() => {\n      const rasterize = async () => {\n        try {\n          const source = Uint8Array.from(atob(\"{0}\"), (char) => char.charC…" |  |
| `preview/Manager.ts:146` | "globalThis[{0}]?.({1}) === true" |  |
| `preview/Manager.ts:163` | "system-ui, sans-serif" | 字体栈 |
| `preview/Manager.ts:164` | "ui-monospace, monospace" | 字体栈 |
| `preview/PickPreload.ts:308` | "border:2px solid {0}" |  |
| `preview/PickPreload.ts:329` | "fixed z-1 max-w-70 overflow-hidden rounded-md bg-primary px-2 py-1 font-sans text-xs font-semibold text-primary-foreground shadow-md" | 样式类名 |
| `preview/PickPreload.ts:436` | "inline-flex h-7 cursor-pointer items-center justify-center rounded-md border border-transparent px-2 font-sans text-xs font-medium text-fore…" | 样式类名 |
| `preview/PickPreload.ts:443` | "h-7 min-w-0 w-full appearance-none rounded-md border border-input bg-background px-2 font-mono text-xs text-foreground shadow-xs outline-non…" | 样式类名 |
| `preview/PickPreload.ts:452` | "pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 font-mono text-xs text-muted-foreground" | 样式类名 |
| `preview/PickPreload.ts:476` | "grid gap-1 border-t border-border py-2" | 样式类名 |
| `preview/PickPreload.ts:531` | "fixed inset-0 font-sans text-foreground" | 样式类名 |
| `preview/PickPreload.ts:535` | "html[data-t3code-annotation-tool] body, html[data-t3code-annotation-tool] body * { cursor: crosshair !important; } [{0}], [{1}] * { cursor: …" |  |
| `preview/PickPreload.ts:555` | "pointer-events-auto fixed top-2.5 left-1/2 flex -translate-x-1/2 gap-0.5 rounded-lg border border-border bg-popover/95 p-1 text-popover-fore…" | 样式类名 |
| `preview/PickPreload.ts:567` | "flex items-start gap-2 p-2" | 样式类名 |
| `preview/PickPreload.ts:573` | " h-8 w-8 shrink-0 bg-muted p-0 text-muted-foreground hover:bg-accent hover:text-accent-foreground" | 样式类名 |
| `preview/PickPreload.ts:575` | "<svg viewBox=\"0 0 20 20\" width=\"15\" height=\"15\" aria-hidden=\"true\"><path d=\"M4 5h12M4 10h12M4 15h12M7 3v4M13 8v4M9 13v4\" fill=\"none\" stroke=…" |  |
| `preview/PickPreload.ts:582` | "min-h-8 max-h-24 min-w-0 flex-1 resize-none overflow-y-hidden border-0 border-b border-b-transparent bg-transparent px-0 py-1.5 font-sans te…" | 样式类名 |
| `preview/PickPreload.ts:590` | "hidden h-8 w-6 shrink-0 cursor-grab select-none border-0 bg-transparent p-0 font-sans text-lg font-bold leading-5 text-muted-foreground" | 样式类名 |
| `preview/PickPreload.ts:601` | " h-8 shrink-0 border-primary bg-primary px-3 text-primary-foreground shadow-sm hover:bg-primary/90" | 样式类名 |
| `preview/PickPreload.ts:795` | "min-w-0 w-full border-0 bg-transparent font-mono text-xs text-foreground outline-none" | 样式类名 |
| `preview/PickPreload.ts:848` | "display:grid;grid-template-columns:82px minmax(0,1fr);gap:8px;align-items:center" | 内联样式 |
| `preview/PickPreload.ts:850` | "grid gap-2 font-sans text-xs font-medium text-muted-foreground" | 样式类名 |
| `preview/PickPreload.ts:862` | " bg-primary/10 text-primary" | 样式类名 |
| `preview/PickPreload.ts:875` | "<svg viewBox=\"0 0 20 20\" width=\"14\" height=\"14\" aria-hidden=\"true\"><path d=\"M8 6.5 9.5 5A3.5 3.5 0 0 1 14.5 10l-1.5 1.5M12 13.5 10.5 15A3.5 …" |  |
| `preview/PickPreload.ts:876` | "<svg viewBox=\"0 0 20 20\" width=\"14\" height=\"14\" aria-hidden=\"true\"><path d=\"m6 6 8 8M8 6.5 9.5 5A3.5 3.5 0 0 1 14 9M12 13.5 10.5 15A3.5 3.5 …" |  |
| `preview/PickPreload.ts:956` | "Draw a region or marquee-select elements (R)" |  |
| `preview/PickPreload.ts:962` | " h-8 px-2.5 text-sm" | 样式类名 |
| `preview/RecordingCursor.ts:27` | "html, html * { cursor: none !important; } @media (prefers-reduced-motion: reduce) { [data-t3code-recording-agent-cursor] { transition: none …" |  |
| `preview/RecordingCursor.ts:34` | "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"24\" viewBox=\"0 0 16 24\"><path d=\"M1 1v18l4-4 4 8 3-1.5-4-8H15Z\" fill=\"black\" stro…" |  |
| `preview/RecordingCursor.ts:39` | "position:fixed;left:0;top:0;width:20px;height:20px;pointer-events:none;z-index:2147483647;display:none;filter:drop-shadow(0 1px 2px #0003);t…" | 内联样式 |
| `preview/RecordingCursor.ts:42` | "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"var(--recording-cursor-background,white)\" stroke=\"v…" |  |
| `preview/RecordingCursor.ts:48` | "translate({0}px, {1}px)" |  |
| `preview/RecordingCursor.ts:116` | "translate({0}px, {1}px)" |  |
| `shell/DesktopShellEnvironment.ts:220` | "printenv {0} \|\| true" |  |
| `shell/DesktopShellEnvironment.ts:228` | "$ErrorActionPreference = 'Stop'" |  |
| `shell/DesktopShellEnvironment.ts:231` | "Write-Output '{0}'" |  |
| `shell/DesktopShellEnvironment.ts:232` | "$value = [Environment]::GetEnvironmentVariable('{0}')" |  |
| `shell/DesktopShellEnvironment.ts:233` | "if ($null -ne $value -and $value.Length -gt 0) { Write-Output $value }" |  |
| `shell/DesktopShellEnvironment.ts:234` | "Write-Output '{0}'" |  |
| `snapShot/ActiveWindow.ts:55` | "\nObjC.import(\"CoreGraphics\");\nObjC.import(\"AppKit\");\nfunction run() {\n  const app = $.NSWorkspace.sharedWorkspace.frontmostApplication;\n  if…" |  |
| `snapShot/HyprlandSnapShot.ts:25` | "hl.bind(\"CTRL + SHIFT + 2\", hl.dsp.global(\"{0}\"))" |  |
| `snapShot/HyprlandSnapShot.ts:26` | "bind = CTRL SHIFT, 2, global, {0}" |  |
| `snapShot/KdeSnapShot.ts:34` | "[Desktop Entry]" |  |
| `snapShot/KdeSnapShot.ts:36` | "Name=T3 Code SnapShots" |  |
| `snapShot/KdeSnapShot.ts:38` | "Exec={0} check" |  |
| `snapShot/MacModifierPairShortcutProcess.ts:16` | "\nObjC.import(\"AppKit\");\n$.NSApplication.sharedApplication.setActivationPolicy($.NSApplicationActivationPolicyProhibited);\nObjC.import(\"CoreG…" |  |
| `snapShot/NativeCaptureFeedback.ts:42` | "{\"command\":\"close\"}\n" | 子进程协议 |
| `snapShot/captureConfigEdit.ts:48` | "hl.bind(\"{0}\", hl.dsp.global(\"{1}\"))" |  |
| `snapShot/captureConfigEdit.ts:49` | "bind = {0}, {1}, global, {2}" |  |
| `snapShot/linuxCaptureSession.ts:35` | "Ctrl+Shift+2 repeat=false { spawn \"gdbus\" \"call\" \"--session\" \"--dest\" \"{0}.SnapShot\" \"--object-path\" \"{1}\" \"--method\" \"{2}.Capture\"; }" |  |
| `wsl/DesktopWslEnvironment.ts:191` | "{0}\nensure_remote_node_path \|\| true\n" |  |
| `wsl/DesktopWslEnvironment.ts:299` | "set -eu" |  |
| `wsl/DesktopWslEnvironment.ts:307` | "runtime_entry_runs() {" |  |
| `wsl/DesktopWslEnvironment.ts:308` | "  [ -x \"$1/t3\" ] && \"$1/t3\" --version >/dev/null 2>&1" |  |
| `wsl/DesktopWslEnvironment.ts:316` | "runtime_server_entry_digest() {" |  |
| `wsl/DesktopWslEnvironment.ts:317` | "  sha256sum \"$1/t3\" 2>/dev/null \| cut -d ' ' -f 1" |  |
| `wsl/DesktopWslEnvironment.ts:319` | "runtime_is_ready() {" |  |
| `wsl/DesktopWslEnvironment.ts:320` | "  [ -f \"$ready_marker\" ] &&" |  |
| `wsl/DesktopWslEnvironment.ts:321` | "    runtime_entry_runs \"$runtime_root\" &&" |  |
| `wsl/DesktopWslEnvironment.ts:325` | "    recorded_entry_digest=$(tr -d '[:space:]' < \"$ready_marker\" 2>/dev/null) &&" |  |
| `wsl/DesktopWslEnvironment.ts:326` | "    [ -n \"$recorded_entry_digest\" ] &&" |  |
| `wsl/DesktopWslEnvironment.ts:327` | "    [ \"$recorded_entry_digest\" = \"$(runtime_server_entry_digest \"$runtime_root\")\" ]" |  |
| `wsl/DesktopWslEnvironment.ts:329` | "mkdir -p \"$runtime_parent\"" |  |
| `wsl/DesktopWslEnvironment.ts:331` | "trap 'exit 1' HUP INT TERM" |  |
| `wsl/DesktopWslEnvironment.ts:332` | "exec 9> \"$runtime_lock\"" |  |
| `wsl/DesktopWslEnvironment.ts:334` | "if runtime_is_ready; then" |  |
| `wsl/DesktopWslEnvironment.ts:335` | "  touch \"$runtime_root/{0}\"" |  |
| `wsl/DesktopWslEnvironment.ts:336` | "  printf 'runtimeRoot:%s\\n' \"$runtime_root\"" |  |
| `wsl/DesktopWslEnvironment.ts:343` | "archive_sha=$(sha256sum {0} \| cut -d ' ' -f 1)" |  |
| `wsl/DesktopWslEnvironment.ts:344` | "if [ \"$archive_sha\" != {0} ]; then" |  |
| `wsl/DesktopWslEnvironment.ts:345` | "  printf 'WSL runtime archive does not match its recorded SHA-256 (expected %s, got %s)\\n' {0} \"$archive_sha\" >&2" |  |
| `wsl/DesktopWslEnvironment.ts:358` | "runtime_in_use() {" |  |
| `wsl/DesktopWslEnvironment.ts:361` | "  [ -d /proc/1 ] \|\| return 0" |  |
| `wsl/DesktopWslEnvironment.ts:362` | "  grep -qF -- \"$1/\" /proc/[0-9]*/cmdline 2>/dev/null" |  |
| `wsl/DesktopWslEnvironment.ts:364` | "if [ -e \"$runtime_root\" ]; then" |  |
| `wsl/DesktopWslEnvironment.ts:365` | "  if runtime_in_use \"$runtime_root\"; then" |  |
| `wsl/DesktopWslEnvironment.ts:366` | "    runtime_root_in_use=1" |  |
| `wsl/DesktopWslEnvironment.ts:368` | "    runtime_root_in_use=0" |  |
| `wsl/DesktopWslEnvironment.ts:370` | "  runtime_stale=$(mktemp -d \"$runtime_parent/.{0}.stale.XXXXXX\")" |  |
| `wsl/DesktopWslEnvironment.ts:371` | "  rmdir \"$runtime_stale\"" |  |
| `wsl/DesktopWslEnvironment.ts:372` | "  if mv -T \"$runtime_root\" \"$runtime_stale\" 2>/dev/null; then" |  |
| `wsl/DesktopWslEnvironment.ts:373` | "    if [ \"$runtime_root_in_use\" = 1 ]; then" |  |
| `wsl/DesktopWslEnvironment.ts:375` | "      touch \"$runtime_stale\"" |  |
| `wsl/DesktopWslEnvironment.ts:377` | "      rm -rf \"$runtime_stale\"" |  |
| `wsl/DesktopWslEnvironment.ts:381` | "runtime_tmp=$(mktemp -d \"$runtime_parent/.{0}.tmp.XXXXXX\")" |  |
| `wsl/DesktopWslEnvironment.ts:382` | "cleanup_runtime_install() { rm -rf \"$runtime_tmp\"; }" |  |
| `wsl/DesktopWslEnvironment.ts:383` | "trap cleanup_runtime_install EXIT" |  |
| `wsl/DesktopWslEnvironment.ts:386` | "tar -xzf {0} -C \"$runtime_tmp\" --strip-components=1" |  |
| `wsl/DesktopWslEnvironment.ts:390` | "if ! runtime_entry_runs \"$runtime_tmp\"; then" |  |
| `wsl/DesktopWslEnvironment.ts:391` | "  printf 'WSL runtime archive does not contain a working t3 executable\\n' >&2" |  |
| `wsl/DesktopWslEnvironment.ts:397` | "installed_entry_digest=$(runtime_server_entry_digest \"$runtime_tmp\")" |  |
| `wsl/DesktopWslEnvironment.ts:398` | "if [ -z \"$installed_entry_digest\" ]; then" |  |
| `wsl/DesktopWslEnvironment.ts:399` | "  printf 'Could not hash the WSL runtime server entry\\n' >&2" |  |
| `wsl/DesktopWslEnvironment.ts:402` | "printf '%s\\n' \"$installed_entry_digest\" > \"$runtime_tmp/{0}\"" |  |
| `wsl/DesktopWslEnvironment.ts:403` | "if mv -T \"$runtime_tmp\" \"$runtime_root\" 2>/dev/null; then" |  |
| `wsl/DesktopWslEnvironment.ts:405` | "elif runtime_is_ready; then" |  |
| `wsl/DesktopWslEnvironment.ts:406` | "  rm -rf \"$runtime_tmp\"" |  |
| `wsl/DesktopWslEnvironment.ts:408` | "  printf 'Could not promote WSL runtime cache at %s\\n' \"$runtime_root\" >&2" |  |
| `wsl/DesktopWslEnvironment.ts:411` | "touch \"$runtime_root/{0}\"" |  |
| `wsl/DesktopWslEnvironment.ts:412` | "printf 'runtimeRoot:%s\\n' \"$runtime_root\"" |  |
| `wsl/DesktopWslEnvironment.ts:424` | "set -eu" |  |
| `wsl/DesktopWslEnvironment.ts:427` | "[ -d \"$runtime_parent\" ] \|\| exit 0" |  |
| `wsl/DesktopWslEnvironment.ts:431` | "exec 8> \"$prune_lock\"" |  |
| `wsl/DesktopWslEnvironment.ts:435` | "[ -d /proc/1 ] \|\| exit 0" |  |
| `wsl/DesktopWslEnvironment.ts:436` | "runtime_in_use() {" |  |
| `wsl/DesktopWslEnvironment.ts:437` | "  grep -qF -- \"$1/\" /proc/[0-9]*/cmdline 2>/dev/null" |  |
| `wsl/DesktopWslEnvironment.ts:440` | "for candidate in \"$runtime_parent\"/sha256-*; do" |  |
| `wsl/DesktopWslEnvironment.ts:441` | "  [ -d \"$candidate\" ] \|\| continue" |  |
| `wsl/DesktopWslEnvironment.ts:442` | "  [ \"$candidate\" != \"$current_runtime\" ] \|\| continue" |  |
| `wsl/DesktopWslEnvironment.ts:443` | "  [ -f \"$candidate/{0}\" ] \|\| continue" |  |
| `wsl/DesktopWslEnvironment.ts:444` | "  if [ -z \"$previous_runtime\" ] \|\| [ \"$candidate\" -nt \"$previous_runtime\" ]; then" |  |
| `wsl/DesktopWslEnvironment.ts:445` | "    previous_runtime=\"$candidate\"" |  |
| `wsl/DesktopWslEnvironment.ts:450` | "for candidate in \"$runtime_parent\"/sha256-*; do" |  |
| `wsl/DesktopWslEnvironment.ts:451` | "  [ -d \"$candidate\" ] \|\| continue" |  |
| `wsl/DesktopWslEnvironment.ts:452` | "  [ \"$candidate\" != \"$current_runtime\" ] \|\| continue" |  |
| `wsl/DesktopWslEnvironment.ts:453` | "  [ \"$candidate\" != \"$previous_runtime\" ] \|\| continue" |  |
| `wsl/DesktopWslEnvironment.ts:454` | "  ! runtime_in_use \"$candidate\" \|\| continue" |  |
| `wsl/DesktopWslEnvironment.ts:455` | "  candidate_name=${candidate##*/}" |  |
| `wsl/DesktopWslEnvironment.ts:456` | "  candidate_lock=\"$runtime_parent/.${candidate_name}.install.lock\"" |  |
| `wsl/DesktopWslEnvironment.ts:457` | "  exec 9> \"$candidate_lock\"" |  |
| `wsl/DesktopWslEnvironment.ts:461` | "  selected_marker=\"$candidate/{0}\"" |  |
| `wsl/DesktopWslEnvironment.ts:462` | "  if [ -f \"$selected_marker\" ] && find \"$selected_marker\" -maxdepth 0 -mmin -{0} -print -quit \| grep -q .; then" |  |
| `wsl/DesktopWslEnvironment.ts:466` | "  rm -rf -- \"$candidate\"" |  |
| `wsl/DesktopWslEnvironment.ts:470` | "for scratch in \"$runtime_parent\"/.*.tmp.* \"$runtime_parent\"/.*.stale.*; do" |  |
| `wsl/DesktopWslEnvironment.ts:471` | "  [ -d \"$scratch\" ] \|\| continue" |  |
| `wsl/DesktopWslEnvironment.ts:472` | "  find \"$scratch\" -maxdepth 0 -mmin +{0} -print -quit \| grep -q . \|\| continue" |  |
| `wsl/DesktopWslEnvironment.ts:473` | "  rm -rf -- \"$scratch\"" |  |
| `wsl/DesktopWslEnvironment.ts:488` | "set -eu" |  |
| `wsl/DesktopWslEnvironment.ts:489` | "rm -f \"$HOME/.t3/wsl-runtime/{0}/{1}\"" |  |
| `wsl/DesktopWslEnvironment.ts:513` | "printf 'resolvedPath:%s\\n' \"$PATH\"" |  |
| `wsl/DesktopWslEnvironment.ts:517` | "printf 'nodePath:%s\\n' \"$(command -v node 2>/dev/null)\"\nprintf 'nodeVersion:%s\\n' \"$(node -p 'process.versions.node' 2>/dev/null)\"\n{0}\ncd {1…" |  |
| `wsl/DesktopWslEnvironment.ts:553` | "bash -lc {0} 2>/dev/null \|\| {1}" |  |
| `wsl/DesktopWslEnvironment.ts:554` | "{0} --version >/dev/null 2>&1" |  |
| `wsl/DesktopWslEnvironment.ts:558` | "for tool in node make g++ python3; do" |  |
| `wsl/DesktopWslEnvironment.ts:559` | "  command -v \"$tool\" >/dev/null 2>&1 \|\| echo \"missing:$tool\"" |  |
| `wsl/DesktopWslEnvironment.ts:561` | "if command -v node >/dev/null 2>&1; then" |  |
| `wsl/DesktopWslEnvironment.ts:562` | "  ver=\"$(node -p 'process.versions.node' 2>/dev/null)\"" |  |
| `wsl/DesktopWslEnvironment.ts:563` | "  if [ -n \"$ver\" ]; then printf \"nodeVersion:%s\\n\" \"$ver\"; fi" |  |
| `wsl/DesktopWslEnvironment.ts:571` | "pkg_dir=$(node -p \"require('node:path').dirname(require.resolve('node-pty/package.json'))\")" |  |
| `wsl/DesktopWslEnvironment.ts:572` | "cd \"$pkg_dir\"" |  |
| `wsl/DesktopWslEnvironment.ts:573` | "npx --yes node-gyp rebuild" |  |
| `wsl/DesktopWslEnvironment.ts:574` | "node -e 'require(\"node-pty\")'" |  |
| `wsl/DesktopWslEnvironment.ts:1131` | "printf \"%s\" \"$(getent passwd \"$(id -un)\" \| cut -d: -f6)\"" |  |

## D：数据：路径片段、应用 / 浏览器名、给 AI 或 MCP 的内容、协议载荷等（26）

| file:line | 文字 | 说明 |
|---|---|---|
| `app/DesktopEnvironment.ts:165` | "Application Support" | 路径片段 |
| `app/DesktopLegacyLocalStorage.ts:35` | "T3 Code (Alpha)" | 遗留 V1 userData 目录名 |
| `app/DesktopLegacyLocalStorage.ts:64` | "Local Storage" | Chromium 目录名 |
| `app/DesktopUserData.ts:44` | "T3 Code (Dev)" | 遗留 userData 目录名 |
| `app/DesktopUserData.ts:45` | "T3 Code (Alpha)" | 遗留 userData 目录名 |
| `app/DesktopUserData.ts:61` | "Local State" | Chromium 文件名 |
| `app/DesktopUserData.ts:63` | "Local State" | Chromium 文件名 |
| `app/DesktopUserData.ts:66` | "Local State" | Chromium 文件名 |
| `preview/BrowserImport/BrowserImport.ts:286` | "Local State" | Chromium 文件名 |
| `preview/BrowserImport/Sources.ts:69` | "Application Support" | 路径片段 |
| `preview/BrowserImport/Sources.ts:120` | "Chrome Safe Storage" | 钥匙串服务名 |
| `preview/BrowserImport/Sources.ts:128` | "Microsoft Edge" | 浏览器名（产品名） |
| `preview/BrowserImport/Sources.ts:129` | "Microsoft Edge Safe Storage" | 钥匙串服务名 |
| `preview/BrowserImport/Sources.ts:130` | "Microsoft Edge" | 钥匙串账户名 |
| `preview/BrowserImport/Sources.ts:131` | "Microsoft Edge" | 路径片段 |
| `preview/BrowserImport/Sources.ts:138` | "Brave Safe Storage" | 钥匙串服务名 |
| `preview/BrowserImport/Sources.ts:147` | "Vivaldi Safe Storage" | 钥匙串服务名 |
| `preview/BrowserImport/Sources.ts:156` | "Opera Safe Storage" | 钥匙串服务名 |
| `preview/BrowserImport/Sources.ts:166` | "Arc Safe Storage" | 钥匙串服务名 |
| `preview/BrowserImport/Sources.ts:168` | "User Data" | 路径片段 |
| `preview/BrowserImport/Sources.ts:173` | "Helium Storage Key" | 钥匙串服务名 |
| `preview/BrowserImport/Sources.ts:177` | "User Data" | 路径片段 |
| `preview/BrowserImport/Sources.ts:538` | "Local State" | Chromium 文件名 |
| `updates/releaseNotes.ts:89` | "whats changed" | 解析 release notes 用的小写标题标记 |
| `updates/releaseNotes.ts:112` | "new contributors" | 同上 |
| `updates/releaseNotes.ts:112` | "full changelog" | 同上 |
