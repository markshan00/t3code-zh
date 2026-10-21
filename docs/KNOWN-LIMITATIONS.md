# 已知限制

以下内容保持英文或有已知差异：

- 账号弹层（`Manage account`、`Sign out` 等）由 Clerk SDK 生成，保持英文；只翻译了账号按钮的读屏名称。
- `Ultrathink`、`Ultracode` 保持英文，与输入框里的 `Ultrathink:` 前缀一致。推理档位和服务端下发的其他选项只按固定名单翻译，名单外的说明（如 Ultracode 的档位说明）保持英文。
- 源代码管理设置里的部分说明（Jujutsu、Bitbucket、「Not available on this server: …」）保持英文。
- 旧版侧栏、命令面板、通知里的默认名 `New thread` / `No project` 保持英文。
- 定时任务 Webhook 里含 `{{body.path}}` 的说明句，以及 Webhook 默认提示词（会保存并发给 agent）保持英文。未知的 Webhook 投递状态、账户 / 设备 / 项目名称和协议值保持原样。
- 文件预览面板（不是附件预览）超过 1 MB 的提示保持英文。
- 额度面板账号详情里的 `Plan` 目前误译为「规划」。
- 部分动态诊断信息和 Windows 安装器少量罕见的错误提示保持英文。
- 原生菜单跟随系统语言，不跟随应用内的语言设置。系统语言是简体中文的 Mac 上，界面切到 English 时，日期、数字格式可能跟着系统变成中文格式（app 声明了简体中文本地化，见 CONVENTIONS §5）。
- macOS 首次弹出的本地网络、屏幕录制权限请求，说明文字是英文（安装包没有 `zh-Hans.lproj`，只靠 `CFBundleLocalizations` 声明中文）。

签名与更新：

- macOS 安装包是本地 ad-hoc 签名，未经苹果公证，没有描述文件（provisioning profile），内置浏览器里不能用 Touch ID 通行密钥登录网站。
- Windows 安装包没有发布者签名。
- macOS 每个版本的 ad-hoc 签名都不同。升级后，之前给 T3 Code 的「访问其他 App 的数据」等隐私授权可能失效：系统设置里开关仍显示开启，实际访问被拒（例如从其他 App 拖进来的图片上传失败）。可在终端运行 `tccutil reset SystemPolicyAppDataDetailed com.t3tools.t3code` 清掉这一项的旧记录，再到「系统设置 → 隐私与安全性」重新授权。
- 没有配置官方自动更新源，新版本需要到 Releases 下载汉化安装包。
- web 和 server 的版本号是汉化版版本号。连接比它旧的远程 server 时，界面给出的升级命令会指向 `t3@<版本>-zh.<N>`，npm 上没有这个版本，需要自己改成官方版本号（如 `0.1.1`）。

验证范围：

- `0.1.1-zh.1` 的 macOS 版完成了完整构建、签名与发布卫生检查，以及 70 项中英文网页检查（26 项真实页面、44 项模拟数据）；`0.1.1-zh.2` 只修了服务端的 Antigravity 额度查询，重跑了相关测试、真实账号额度查询和构建检查。没有用真实账号在桌面版里完整测试模型对话、跨 Agent 调度、额度兑换和远程登录。
- Windows 版在 GitHub Actions 上完成了实际静默安装、窗口启动、原生后端和前端 HTTP 检查。内置的 WSL 后端运行包只在 Linux 上做过启动测试，没有在 Windows 的真实 WSL 发行版里运行过。
