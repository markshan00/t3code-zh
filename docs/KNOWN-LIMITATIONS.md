# 已知限制

以下内容保持英文或有已知差异：

- 账号弹层（`Manage account`、`Sign out` 等）由 Clerk SDK 生成，保持英文；只翻译了账号按钮的读屏名称。
- `Ultrathink`、`Ultracode` 保持英文，与输入框里的 `Ultrathink:` 前缀一致。推理档位和服务端下发的其他选项只按固定名单翻译，名单外的说明（如 Ultracode 的档位说明）保持英文。
- 源代码管理设置里的部分说明（Jujutsu、Bitbucket、「Not available on this server: …」）保持英文。
- 旧版侧栏、命令面板、通知里的默认名 `New thread` / `No project` 保持英文。
- 定时任务 Webhook 里含 `{{body.path}}` 的说明句，以及 Webhook 默认提示词（会保存并发给 agent）保持英文。
- 文件预览面板（不是附件预览）超过 1 MB 的提示保持英文。
- 额度面板账号详情弹层里的额度券说明（`banked`、`expires in`）保持英文，`Plan` 目前误译为「规划」。
- 系统语言是简体中文的 Mac 上，界面切到 English 时，日期、数字格式可能跟着系统变成中文格式（app 声明了简体中文本地化，见 CONVENTIONS §5）。
- web 和 server 的版本号是汉化版版本号。连接比它旧的远程 server 时，界面给出的升级命令会指向 `t3@0.0.46-n…zh.…`，npm 上没有这个版本，需要自己改成官方版本号。
- 以下界面还没在实机上验证过：Agents / 派活入口、远程路由、Webhook 投递记录、空占位符提示、工具输出或 HTML 预览加载失败、大附件预览。
