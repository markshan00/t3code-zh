# T05 词库改动清单

- 基线：`v0.0.46-nightly.20261004.2644`；词库改动前 4133 条（messages 3465 + templates 668），改动后 5736 条（messages 4714 + templates 1022）。
- 新增 1603 条（其中译文与原文相同、按原文保留的 247 条），修订 148 条（只改 value，key 集合只增不减，见 handoff 的对比结果）。
- `dict/allow-suspicious.json`：新建，67 个 key（值用途放行 62 个、模板误配并列 5 个）。
- 术语以 `dict/glossary.md` 末尾的「定稿」一节为准。
- 说明中的「运行时变体」：源码里 `` `${n} file${n === 1 ? "" : "s"}` `` 这类拼接，构建期的建议 key 是 `{0} file{1}`，中文无法带上 `{1}`（check-dict 要求两侧占位符一致）。做法与 0.0.45 词库相同：按运行时实际产生的字符串补单数、复数两条具体模板（如 `{count} files` / `{count} file`），运行时它们比骨架模板长、优先命中；骨架 key 另补一条只译字面文字、原样保留占位符的条目，保证构建期误配检查通过（见下文「骨架模板」）。

## 1. 新增条目（按界面区域）

### apps/web/src/cloud（1）

| 英文 | 中文 | 备注 |
|---|---|---|
| `Could not update T3 Connect` | 无法更新 T3 Connect | 补精确词条（原模板误配） |

### apps/web/src/components/chat（173）

| 英文 | 中文 | 备注 |
|---|---|---|
| `0s` | 0 秒 |  |
| `Automations` | 自动化 |  |
| `Cancel auto-resume` | 取消自动恢复 |  |
| `Cancel editing queued message` | 取消编辑排队消息 |  |
| `Check the branch out and resolve the conflicts in a new thread` | 在新任务中检出分支并解决冲突 | 补精确词条（原模板误配） |
| `Cite` | 引用 |  |
| `Click the citation to try again.` | 点击引用以重试。 | 补精确词条（原模板误配） |
| `Click to zoom in or return to fit. Scroll to zoom, drag to pan. Use Enter to toggle zoom, plus or minus to zoom, and 0 to fit.` | 点击放大或恢复适应窗口。滚动以缩放，拖动以平移。按 Enter 切换缩放，按加号或减号缩放，按 0 适应窗口。 | 补精确词条（原模板误配） |
| `Client and server versions differ` | 客户端与服务器版本不一致 | 补精确词条（原模板误配） |
| `Closed pull request` | 已关闭的拉取请求 | 运行时变体，对应源码 `Pull request #{0}` |
| `Collapse queued messages` | 收起排队消息 | 补精确词条（原模板误配） |
| `Complete a run in this fork before merging it back` | 请先在此分叉中完成一次运行，再合并回去 |  |
| `Consumed` | 已使用 |  |
| `Context compacted` | 上下文已压缩 |  |
| `Context handoff` | 上下文交接 |  |
| `Context transfer` | 上下文转移 |  |
| `Continues in {0}` | 在 {0} 中继续 |  |
| `Conversation fork` | 对话分叉 |  |
| `Copy Link` | 复制链接 |  |
| `Could not change limit recovery.` | 无法更改限额恢复设置。 |  |
| `Could not open the cited response` | 无法打开引用的回复 |  |
| `Could not run automation` | 无法运行自动化 |  |
| `Could not update automation` | 无法更新自动化 | 补精确词条（原模板误配） |
| `Created thread` | 已创建任务 | 补精确词条（原模板误配） |
| `Created {count} thread` | 已创建 {count} 个任务 | 运行时变体，对应源码 `Created thread` |
| `Disconnect agent session` | 断开 Agent 会话 | 补精确词条（原模板误配） |
| `Dismiss version mismatch warning` | 关闭版本不一致警告 |  |
| `Draft pull request` | 拉取请求草稿 | 运行时变体，对应源码 `Pull request #{0}` |
| `Edit automation` | 编辑自动化 | 补精确词条（原模板误配） |
| `Edit in the composer` | 在输入框中编辑 | 运行时变体，对应源码 `Edit in the composer{0}` |
| `Edit in the composer ({shortcut})` | 在输入框中编辑（{shortcut}） | 运行时变体，对应源码 `Edit in the composer{0}` |
| `Edit in the composer{0}` | 在输入框中编辑{0} | 补精确词条（原模板误配） |
| `Edit queued message` | 编辑排队消息 | 补精确词条（原模板误配） |
| `Editing queued message:` | 正在编辑排队消息： |  |
| `Enter a path relative to` | 输入相对于以下目录的路径： |  |
| `Expand diagram` | 展开图表 | 补精确词条（原模板误配） |
| `Expand queued messages` | 展开排队消息 | 补精确词条（原模板误配） |
| `File attachment, {name}, {size}` | 文件附件，{name}，{size} | 运行时变体，对应源码 `{0} attachment, {1}, {2}` |
| `Finished` | 已完成 |  |
| `Fix` | 修复 |  |
| `Fix the failing checks in a new thread` | 在新任务中修复未通过的检查 |  |
| `Folders can't be dropped into remote environments` | 无法将文件夹拖放到远程环境 |  |
| `Fork` | 分叉 |  |
| `Fork from this response` | 从此回复分叉 |  |
| `Forked from conversation` | 从对话分叉 | 补精确词条（原模板误配） |
| `Idle · resumable` | 空闲 · 可恢复 |  |
| `Inherited` | 已继承 |  |
| `Interrupt` | 中断 |  |
| `Interrupt requested` | 已请求中断 |  |
| `Lineage` | 谱系 |  |
| `Lineage · {0} running` | 谱系 · {0} 个运行中 |  |
| `Linked {count} pull request` | 已关联 {count} 个拉取请求 | 运行时变体，对应源码 `Pull request #{0}` |
| `Manage scheduled tasks` | 管理定时任务 |  |
| `Manual update required` | 需要手动更新 |  |
| `Mark this pull request as ready for review` | 将此拉取请求标记为可供评审 | 补精确词条（原模板误配） |
| `Marking...` | 正在标记... |  |
| `Merge back to source conversation` | 合并回来源对话 | 补精确词条（原模板误配） |
| `Merge back to {0}` | 合并回 {0} | 补精确词条（原模板误配） |
| `Merge this conversation back into its source` | 将此对话合并回来源 |  |
| `Merge this conversation back into {0}` | 将此对话合并回 {0} |  |
| `Merge this pull request ({0})` | 合并此拉取请求（{0}） |  |
| `Merged pull request` | 已合并的拉取请求 | 运行时变体，对应源码 `Pull request #{0}` |
| `More thread actions` | 更多任务操作 |  |
| `No models are available for this provider.` | 此服务提供方没有可用的模型。 | 补精确词条（原模板误配） |
| `Open chat` | 打开对话 |  |
| `Open created thread` | 打开已创建的任务 | 运行时变体，对应源码 `Created thread` |
| `Open fork` | 打开分叉 |  |
| `Open parent` | 打开父任务 |  |
| `Open parent thread` | 打开父任务 |  |
| `Open provider setup to install {0} on this environment.` | 打开服务提供方设置，在此环境中安装 {0}。 | 补精确词条（原模板误配） |
| `Open provider setup to sign in with Google.` | 打开服务提供方设置，使用 Google 登录。 | 补精确词条（原模板误配） |
| `Open provider setup to sign in.` | 打开服务提供方设置以登录。 | 补精确词条（原模板误配） |
| `Open pull request` | 开放的拉取请求 | 运行时变体，对应源码 `Pull request #{0}` |
| `Open sending thread` | 打开发送方任务 |  |
| `Open source conversation` | 打开来源对话 | 补精确词条（原模板误配） |
| `Open subagent` | 打开子 Agent |  |
| `Open subagent thread` | 打开子 Agent 任务 |  |
| `Open {0}` | 打开 {0} |  |
| `Originally queued, then promoted to steer the active turn` | 原为排队消息，后提升为调整当前轮次 | 补精确词条（原模板误配） |
| `Parent agent` | 父 Agent |  |
| `Partial output retained` | 已保留部分输出 |  |
| `Pasted text is too large for this message` | 粘贴的文本过大，无法放入此消息 | 补精确词条（原模板误配） |
| `Pasted text is too large to attach` | 粘贴的文本过大，无法作为附件添加 | 补精确词条（原模板误配） |
| `Pause {0}` | 暂停 {0} |  |
| `Pending` | 待处理 | 值用途放行配套译文 |
| `Plan ready` | 方案已就绪 |  |
| `Plan updated` | 方案已更新 | 补精确词条（原模板误配） |
| `Previous agents` | 之前的 Agent |  |
| `Prompt is {0} {1} over the {2}-character limit. Shorten or split it before sending.` | 提示词超出 {2} 字符上限 {0} {1}，请缩短或拆分后再发送。 | 补精确词条（原模板误配） |
| `Prompt is {count} character over the {limit}-character limit. Shorten or split it before sending.` | 提示词超出 {limit} 字符上限 {count} 个字符，请缩短或拆分后再发送。 | 运行时变体，对应源码 `Prompt is {0} {1} over the {2}-character limit. Shorten or split it before sending.` |
| `Prompt is {count} characters over the {limit}-character limit. Shorten or split it before sending.` | 提示词超出 {limit} 字符上限 {count} 个字符，请缩短或拆分后再发送。 | 运行时变体，对应源码 `Prompt is {0} {1} over the {2}-character limit. Shorten or split it before sending.` |
| `Provider process is gone — interrupt or restart the run to respond.` | 服务提供方进程已退出，请中断或重新开始运行后再响应。 | 补精确词条（原模板误配） |
| `Pull request #{0}` | 拉取请求 #{0} |  |
| `Queued` | 已排队 |  |
| `Queued behind the active turn` | 排在当前轮次之后 |  |
| `Read file` | 已读取文件 | 补精确词条（原模板误配） |
| `Reconnect this machine to update` | 重新连接此设备以更新 | 补精确词条（原模板误配） |
| `Reduce the clipboard contents or save a smaller excerpt as a file.` | 请减少剪贴板内容，或将较小的片段另存为文件。 |  |
| `Related threads` | 相关任务 |  |
| `Remove from queue` | 从队列中移除 | 补精确词条（原模板误配） |
| `Remove queued message` | 移除排队消息 | 补精确词条（原模板误配） |
| `Remove some text or an attachment, then paste again.` | 请删除部分文本或附件，然后重新粘贴。 | 补精确词条（原模板误配） |
| `Remove this image from the message?⏎It is referenced in your text; removing it also removes every reference.` | 要从消息中移除这张图片吗？⏎它在你的文本中被引用；移除后所有引用也会一并移除。 | 运行时变体，对应源码 `Remove {0} from the message?⏎It is referenced in your text; removing it also removes every reference.` |
| `Remove {0} from the message?⏎It is referenced in your text; removing it also removes every reference.` | 要从消息中移除 {0} 吗？⏎它在你的文本中被引用；移除后所有引用也会一并移除。 | 补精确词条（原模板误配） |
| `Reorder queued message (drag, or press the arrow keys)` | 调整排队消息顺序（拖动或按方向键） |  |
| `Reset time unavailable; retry manually` | 重置时间不可用，请手动重试 |  |
| `Resolved (native)` | 已解决（原生） |  |
| `Resolved (portable)` | 已解决（可移植） |  |
| `Resume at reset` | 重置时恢复 |  |
| `Resume {0}` | 恢复 {0} |  |
| `Reverted` | 已还原 |  |
| `Right panel is unavailable` | 右侧面板不可用 | 补精确词条（原模板误配） |
| `Roll back` | 回滚 |  |
| `Run interrupted` | 运行已中断 | 补精确词条（原模板误配） |
| `Run now` | 立即运行 | 补精确词条（原模板误配） |
| `Run {0} now` | 立即运行 {0} | 补精确词条（原模板误配） |
| `Runs on its own` | 独立运行 | 补精确词条（原模板误配） |
| `Saving queued message` | 正在保存排队消息 |  |
| `Search result` | 搜索结果 |  |
| `Send again once its chip resolves.` | 请等标签处理完成后再发送。 | 补精确词条（原模板误配） |
| `Send as a steer instead` | 改为作为调整发送 | 运行时变体，对应源码 `Send as a steer instead{0}` |
| `Send as a steer instead ({shortcut})` | 改为作为调整发送（{shortcut}） | 运行时变体，对应源码 `Send as a steer instead{0}` |
| `Send as a steer instead{0}` | 改为作为调整发送{0} | 补精确词条（原模板误配） |
| `Sent by another agent` | 由另一个 Agent 发送 |  |
| `Sent by automation` | 由自动化发送 |  |
| `Showing the source response. The saved quote is unchanged.` | 正在显示来源回复，已保存的引用内容未更改。 | 补精确词条（原模板误配） |
| `Sign in via the CLI to authenticate again.` | 请通过 CLI 登录以重新认证。 | 补精确词条（原模板误配） |
| `Snooze until reset` | 暂缓至重置 |  |
| `Stash again once its chip resolves.` | 请等标签处理完成后再暂存。 |  |
| `Steered the active turn` | 已调整当前轮次 |  |
| `Still bringing a pasted attachment into this message.` | 粘贴的附件仍在添加到此消息中。 |  |
| `Stopped` | 已停止 |  |
| `Stopped watching {count} pull request` | 已停止关注 {count} 个拉取请求 | 运行时变体，对应源码 `Pull request #{0}` |
| `Subagent` | 子 Agent |  |
| `Subagent of` | 子 Agent 隶属于 |  |
| `Superseded` | 已被取代 |  |
| `Superseded attempt` | 已被取代的尝试 |  |
| `Synthetic` | 合成 |  |
| `That prompt was restored or deleted before {0} image{1} finished saving. Re-attach {2} if you still need {3}.` | 该提示词在 {0} 张图片{1}保存完成前已被恢复或删除。如仍需要{3}，请重新添加{2}。 |  |
| `The agent can only read threads on its own server.` | Agent 只能读取其所在服务器上的任务。 | 补精确词条（原模板误配） |
| `The quoted text has changed` | 引用的文本已更改 |  |
| `The reset time has passed. Retry the thread manually.` | 重置时间已过，请手动重试该任务。 | 值用途放行配套译文 |
| `There is no active run to steer` | 当前没有可调整的运行 | 补精确词条（原模板误配） |
| `This question cannot accept attachments.` | 此问题不接受附件。 |  |
| `Thread details` | 任务详情 | 补精确词条（原模板误配） |
| `Toggle right panel ({shortcut})` | 切换右侧面板（{shortcut}） | 运行时变体，对应源码 `Toggle right panel{0}` |
| `Toggle thread details panel` | 切换任务详情面板 |  |
| `Type the folder path with @ instead.` | 请改用 @ 输入文件夹路径。 |  |
| `Unlinked {count} pull request` | 已取消关联 {count} 个拉取请求 | 运行时变体，对应源码 `Pull request #{0}` |
| `Updated` | 已更新 |  |
| `Use threads from this environment` | 使用此环境中的任务 | 补精确词条（原模板误配） |
| `Video attachment, {name}, {size}` | 视频附件，{name}，{size} | 运行时变体，对应源码 `{0} attachment, {1}, {2}` |
| `Watching {count} pull request` | 正在关注 {count} 个拉取请求 | 运行时变体，对应源码 `Pull request #{0}` |
| `Web search` | 网页搜索 |  |
| `Worktree ready` | 工作树已就绪 |  |
| `Worktree ready, setup script failed` | 工作树已就绪，初始化脚本失败 |  |
| `Worktree setup cancelled` | 工作树初始化已取消 |  |
| `Worktree setup failed` | 工作树初始化失败 |  |
| `files` | 个文件 |  |
| `server` | 服务器 | 值用途放行配套译文 |
| `{0} +{1} more` | {0} 及另外 {1} 个 |  |
| `{0} additions, {1} deletions` | 新增 {0} 行，删除 {1} 行 |  |
| `{0} attachment, {1}, {2}` | {0}附件，{1}，{2} |  |
| `{0} provider has limited availability.` | {0} 服务提供方可用性受限。 |  |
| `{0} provider is unavailable.` | {0} 服务提供方不可用。 | 补精确词条（原模板误配） |
| `{0} queued message{1}` | {0} 条排队消息{1} |  |
| `{0} subagent: {1}` | {0} 子 Agent：{1} |  |
| `{0} — Disabled in settings.` | {0} — 已在设置中停用。 |  |
| `{0}, new` | {0}，新 |  |
| `{count} queued message` | {count} 条排队消息 | 运行时变体，对应源码 `{0} queued message{1}` |
| `{count} queued messages` | {count} 条排队消息 | 运行时变体，对应源码 `Collapse queued messages` |
| `· next {0}` | · 下次 {0} |  |
| `· paused` | · 已暂停 |  |

### apps/web/src/components/clerk（8）

| 英文 | 中文 | 备注 |
|---|---|---|
| `Activity publishing only` | 仅发布动态 |  |
| `Could not deregister server` | 无法注销服务器 |  |
| `Link date unavailable` | 关联日期不可用 |  |
| `Linked {0}` | 关联于 {0} |  |
| `Managed tunnel` | 托管隧道 |  |
| `Server deregistered` | 服务器已注销 |  |
| `T3 Connect access was revoked and a host space is now available.` | T3 Connect 访问权限已撤销，现在多出一个主机名额。 | 补精确词条（原模板误配） |
| `Update time unavailable` | 更新时间不可用 | 补精确词条（原模板误配） |

### apps/web/src/components/cloud（5）

| 英文 | 中文 | 备注 |
|---|---|---|
| `Authorization request` | 授权请求 |  |
| `Browser authorization` | 浏览器授权 |  |
| `Reconnecting…` | 正在重新连接… |  |
| `The link is missing its authorization request. Re-run ˋt3 connectˋ in your terminal and open the freshly printed URL.` | 链接缺少授权请求。请在终端中重新运行 `t3 connect`，并打开新输出的 URL。 | 补精确词条（原模板误配） |
| `This connect link is incomplete` | 此连接链接不完整 | 补精确词条（原模板误配） |

### apps/web/src/components/desktop（6）

| 英文 | 中文 | 备注 |
|---|---|---|
| `. The password is passed to the local SSH process for this connection attempt and is not saved by T3 Code.` | 。密码只会传给本次连接所用的本机 SSH 进程，T3 Code 不会保存。 | 补精确词条（原模板误配） |
| `Add a project, then capture the window again.` | 请先添加项目，然后重新截取窗口。 |  |
| `Snapshot failed` | 截图失败 |  |
| `Snapshot taken, but no project is available` | 已截图，但没有可用的项目 | 补精确词条（原模板误配） |
| `T3 needs your SSH password to connect to` | T3 需要你的 SSH 密码才能连接到 | 补精确词条（原模板误配） |
| `Try the capture again.` | 请重新截取。 |  |

### apps/web/src/components/device（42）

| 英文 | 中文 | 备注 |
|---|---|---|
| `/ bookshelf` | / 书架 |  |
| `Android Emulator screen` | Android 模拟器屏幕 | 运行时变体，对应源码 `{0} screen` |
| `Android Emulators` | Android 模拟器 |  |
| `Blue / yellow (tritanopia)` | 蓝 / 黄（蓝色盲） |  |
| `Calendar` | 日历 |  |
| `Camera` | 相机 |  |
| `Contacts` | 通讯录 |  |
| `Could not change fold posture.` | 无法更改折叠姿态。 |  |
| `Emulator` | 模拟器 |  |
| `Fold command timed out.` | 折叠命令超时。 |  |
| `Grayscale` | 灰度 |  |
| `Green / red (deuteranopia)` | 绿 / 红（绿色盲） |  |
| `Landscape left` | 横屏向左 |  |
| `Landscape right` | 横屏向右 |  |
| `Large` | 大 | 值用途放行配套译文 |
| `London` | 伦敦 |  |
| `Media library` | 媒体库 |  |
| `Microphone` | 麦克风 |  |
| `New York` | 纽约 |  |
| `Notifications` | 通知 |  |
| `Permission` | 权限 |  |
| `Photos` | 照片 |  |
| `Physical activity` | 身体活动 |  |
| `Red / green (protanopia)` | 红 / 绿（红色盲） |  |
| `Reminders` | 提醒事项 |  |
| `San Francisco` | 旧金山 |  |
| `Show 3D phone` | 显示 3D 手机 | 补精确词条（原模板误配） |
| `Simulator` | 模拟器 |  |
| `Small` | 小 | 值用途放行配套译文 |
| `Start` | 启动 |  |
| `Step 1 of 2: open device` | 第 1/2 步：打开设备 | 补精确词条（原模板误配） |
| `Step 2 of 2: connect video` | 第 2/2 步：连接视频 | 补精确词条（原模板误配） |
| `Stockholm` | 斯德哥尔摩 | 补精确词条（原模板误配） |
| `Tokyo` | 东京 |  |
| `Upside down` | 倒置 |  |
| `Versions` | 版本 |  |
| `available` | 可用 |  |
| `iOS Simulator screen` | iOS 模拟器屏幕 | 运行时变体，对应源码 `{0} screen` |
| `iOS Simulators` | iOS 模拟器 |  |
| `iOS available` | iOS 可用 |  |
| `{0} screen` | {0} 屏幕 |  |
| `{0} stand` | {0}姿态 |  |

### apps/web/src/components/diffs（1）

| 英文 | 中文 | 备注 |
|---|---|---|
| `Add a comment…` | 添加评论… |  |

### apps/web/src/components/files（19）

| 英文 | 中文 | 备注 |
|---|---|---|
| `Attachment` | 附件 |  |
| `Copy mention` | 复制提及 |  |
| `Could not save file` | 无法保存文件 | 补精确词条（原模板误配） |
| `Failed to copy mention` | 复制提及失败 | 补精确词条（原模板误配） |
| `Indexing workspace files…` | 正在索引工作区文件… |  |
| `L{0} to L{1}` | L{0} 至 L{1} | 补精确词条（原模板误配） |
| `Mention copied` | 提及已复制 |  |
| `Open a chat for this project and try again.` | 请为此项目打开一个对话，然后重试。 | 补精确词条（原模板误配） |
| `Please try again.` | 请重试。 |  |
| `Search files…` | 搜索文件… |  |
| `Searching workspace files…` | 正在搜索工作区文件… |  |
| `Show HTML source` | 显示 HTML 源码 | 补精确词条（原模板误配） |
| `Show markdown source` | 显示 Markdown 源码 | 补精确词条（原模板误配） |
| `Show rendered markdown` | 显示渲染后的 Markdown | 补精确词条（原模板误配） |
| `Show rendered page` | 显示渲染后的页面 | 补精确词条（原模板误配） |
| `Show source` | 显示源码 | 补精确词条（原模板误配） |
| `Show table` | 显示表格 | 补精确词条（原模板误配） |
| `The chat isn't ready to accept input right now.` | 对话当前还无法接收输入。 | 补精确词条（原模板误配） |
| `Workspace query failed.` | 工作区查询失败。 |  |

### apps/web/src/components/media（8）

| 英文 | 中文 | 备注 |
|---|---|---|
| `Copy URL` | 复制 URL |  |
| `Copy image` | 复制图片 |  |
| `Copying image…` | 正在复制图片… |  |
| `Download started` | 已开始下载 | 补精确词条（原模板误配） |
| `Image copied` | 图片已复制 |  |
| `Open in file viewer` | 在文件查看器中打开 | 补精确词条（原模板误配） |
| `The media action failed.` | 媒体操作失败。 |  |
| `URL copied` | URL 已复制 |  |

### apps/web/src/components/onboarding（5）

| 英文 | 中文 | 备注 |
|---|---|---|
| `. Add` | 。添加 |  |
| `Some history was not imported` | 部分历史记录未导入 |  |
| `folder` | 个文件夹 |  |
| `folders` | 个文件夹 |  |
| `to use your tailnet.` | 即可使用你的 tailnet。 |  |

### apps/web/src/components/permissions（1）

| 英文 | 中文 | 备注 |
|---|---|---|
| `Could not check permissions. We'll try again automatically.` | 无法检查权限，稍后会自动重试。 |  |

### apps/web/src/components/preview（12）

| 英文 | 中文 | 备注 |
|---|---|---|
| `Could not capture the picked element` | 无法截取所选元素 |  |
| `Listening` | 正在监听 |  |
| `Network error` | 网络错误 |  |
| `Open in right panel` | 在右侧面板中打开 | 补精确词条（原模板误配） |
| `Recording saved` | 录制已保存 | 补精确词条（原模板误配） |
| `Screenshot saved` | 截图已保存 | 补精确词条（原模板误配） |
| `The annotation was kept without the screenshot.` | 批注已保留，但未包含截图。 |  |
| `Unable to capture screenshot` | 无法截取屏幕截图 | 补精确词条（原模板误配） |
| `Unable to copy recording path` | 无法复制录制文件路径 | 补精确词条（原模板误配） |
| `Unable to resize browser viewport` | 无法调整浏览器视口大小 | 补精确词条（原模板误配） |
| `Unable to start recording` | 无法开始录制 | 补精确词条（原模板误配） |
| `Unable to stop recording` | 无法停止录制 | 补精确词条（原模板误配） |

### apps/web/src/components/pullRequest（60）

| 英文 | 中文 | 备注 |
|---|---|---|
| `1 conversation` | 1 个对话 | 补精确词条（原模板误配） |
| `Auto-merge disabled` | 已停用自动合并 |  |
| `Auto-merge enabled` | 已启用自动合并 |  |
| `Comments ({0})` | 评论（{0}） |  |
| `Comments unavailable` | 评论不可用 |  |
| `Commit {0}` | 提交 {0} |  |
| `Could not copy the link` | 无法复制链接 | 补精确词条（原模板误配） |
| `Could not disable auto-merge` | 无法停用自动合并 |  |
| `Could not enable auto-merge` | 无法启用自动合并 |  |
| `Could not link the pull request` | 无法关联拉取请求 |  |
| `Could not open the link` | 无法打开链接 |  |
| `Could not unlink the pull request` | 无法取消关联拉取请求 |  |
| `Could not update viewed files` | 无法更新已查看的文件 | 补精确词条（原模板误配） |
| `Created from this thread` | 从此任务创建 | 补精确词条（原模板误配） |
| `Dismissed` | 已忽略 |  |
| `Found in the stack` | 在堆栈中发现 |  |
| `GitHub merged the stack or added it to its merge queue.` | GitHub 已合并该堆栈，或已将其加入合并队列。 | 补精确词条（原模板误配） |
| `Linked by the agent` | 由 Agent 关联 |  |
| `Linked by you` | 由你关联 |  |
| `Open checks: {0}` | 打开检查：{0} |  |
| `Open on Azure DevOps` | 在 Azure DevOps 上打开 | 补精确词条（原模板误配） |
| `Open on Bitbucket` | 在 Bitbucket 上打开 | 补精确词条（原模板误配） |
| `Open on Forgejo` | 在 Forgejo 上打开 | 补精确词条（原模板误配） |
| `Open on GitLab` | 在 GitLab 上打开 | 补精确词条（原模板误配） |
| `Open on host` | 在托管服务上打开 | 补精确词条（原模板误配） |
| `Others` | 其他 |  |
| `Pull request #{0} not found` | 未找到拉取请求 #{0} |  |
| `Rebase and merge` | 变基并合并 | 补精确词条（原模板误配） |
| `Review requested` | 已请求评审 |  |
| `Show all` | 显示全部 | 补精确词条（原模板误配） |
| `Squash and merge` | 压缩并合并 | 补精确词条（原模板误配） |
| `Stack merge request completed` | 堆栈合并请求已完成 |  |
| `Stack operation did not complete` | 堆栈操作未完成 |  |
| `Stack rebased` | 堆栈已变基 |  |
| `Stop watching` | 停止关注 |  |
| `This allows {0} {1} from #{2} to run. Review the code and workflow changes first.` | 这会允许 #{2} 中的 {0} {1} 运行。请先检查代码和工作流更改。 | 补精确词条（原模板误配） |
| `This allows {count} workflow from #{number} to run. Review the code and workflow changes first.` | 这会允许 #{number} 中的 {count} 个工作流运行。请先检查代码和工作流更改。 | 运行时变体，对应源码 `This allows {0} {1} from #{2} to run. Review the code and workflow changes first.` |
| `This allows {count} workflows from #{number} to run. Review the code and workflow changes first.` | 这会允许 #{number} 中的 {count} 个工作流运行。请先检查代码和工作流更改。 | 运行时变体，对应源码 `This allows {0} {1} from #{2} to run. Review the code and workflow changes first.` |
| `Viewed` | 已查看 |  |
| `Watch for changes` | 关注变化 | 补精确词条（原模板误配） |
| `Watching` | 正在关注 |  |
| `Watching: the agent wakes when checks finish, someone comments, or the branch conflicts` | 正在关注：检查完成、有人评论或分支出现冲突时，Agent 会被唤醒 |  |
| `approval` | 次批准 |  |
| `approvals` | 次批准 |  |
| `author` | 位作者 |  |
| `authors` | 位作者 |  |
| `comment` | 条评论 |  |
| `commented` | 发表了评论 |  |
| `comments` | 条评论 |  |
| `opened this pull request` | 创建了此拉取请求 |  |
| `reviewed` | 进行了评审 |  |
| `viewed` | 已查看 |  |
| `{0} bot comment{1}` | {0} 条机器人评论{1} |  |
| `{0} changed {1}` | 已更改 {0} {1} |  |
| `{0} earlier changes` | {0}（较早的更改） |  |
| `{0} resolved or dismissed comment{1}` | {0} 条已解决或已撤销的评论{1} |  |
| `{count} bot comment` | {count} 条机器人评论 | 运行时变体，对应源码 `{0} bot comment{1}` |
| `{count} resolved or dismissed comment` | {count} 条已解决或已撤销的评论 | 运行时变体，对应源码 `{0} resolved or dismissed comment{1}` |
| `· Open comment on host` | · 在托管服务上打开评论 | 补精确词条（原模板误配） |
| `· Open profile` | · 打开个人资料 |  |

### apps/web/src/components/search（1）

| 英文 | 中文 | 备注 |
|---|---|---|
| `Search project contents…` | 搜索项目内容… |  |

### apps/web/src/components/settings（423）

| 英文 | 中文 | 备注 |
|---|---|---|
| `(default)` | （默认） |  |
| `15m` | 15 分钟 | 补精确词条（原模板误配） |
| `1h` | 1 小时 |  |
| `30m` | 30 分钟 | 补精确词条（原模板误配） |
| `5m` | 5 分钟 | 补精确词条（原模板误配） |
| `ACP Registry` | ACP 注册表 |  |
| `ACP provider configured` | ACP 服务提供方已配置 |  |
| `ACP provider disabled` | ACP 服务提供方已停用 |  |
| `ACP session already imported` | ACP 会话已导入过 |  |
| `ACP session deleted` | ACP 会话已删除 |  |
| `ACP session imported` | ACP 会话已导入 |  |
| `About {0}` | 关于 {0} |  |
| `Account` | 账户 |  |
| `Account-specific home sharing the Codex state above.` | 账户专属的主目录，共享上方的 Codex 状态。 |  |
| `Add accent color for {name}` | 为 {name} 添加强调色 | 运行时变体，对应源码 `{0} accent color for {1}` |
| `Add variable` | 添加变量 |  |
| `Added` | 已添加 |  |
| `Agent providers` | Agent 服务提供方 |  |
| `Allow GNOME extensions` | 允许 GNOME 扩展 |  |
| `Allow access when prompted to start capturing windows.` | 出现提示时请允许访问，以开始截取窗口。 | 补精确词条（原模板误配） |
| `Allow each permission, then continue.` | 请逐项授予权限，然后继续。 |  |
| `Allow snapshots` | 允许截图 |  |
| `Appended to the naming prompt. The model returns the complete branch name; no prefix or suffix is added.` | 追加到命名提示词中。模型会返回完整的分支名称，不会再添加前缀或后缀。 | 补精确词条（原模板误配） |
| `Approximate active CPU time for the T3 server root process and its descendants during the selected window. It grows only while sampled processes use CPU and older samples leave as the window moves.` | T3 服务器根进程及其子进程在所选时间窗口内的大致活跃 CPU 时间。仅在被采样的进程使用 CPU 时增长，旧样本会随窗口移动而移出。 | 补精确词条（原模板误配） |
| `At a time` | 定时 |  |
| `Authentication request expired` | 认证请求已过期 |  |
| `Auto-resume limited threads` | 自动恢复受限任务 |  |
| `Automatic capture isn't available` | 无法自动截图 |  |
| `Automatic capture isn't available here. Choose a window instead.` | 此处无法自动截图，请改为选择窗口。 |  |
| `Backend added` | 后端已添加 | 补精确词条（原模板误配） |
| `Base branch` | 基础分支 |  |
| `Bitbucket credentials` | Bitbucket 凭据 |  |
| `Branch naming instructions` | 分支命名说明 |  |
| `Branch prefix` | 分支前缀 |  |
| `Capture a window and attach it to your current draft.` | 截取窗口并附加到当前草稿。 | 补精确词条（原模板误配） |
| `Capture animations` | 截图动画 |  |
| `Capture effects aren't available on Niri.` | Niri 上不支持截图效果。 | 补精确词条（原模板误配） |
| `Capture effects aren't available on this desktop.` | 此桌面环境不支持截图效果。 | 补精确词条（原模板误配） |
| `Capture flash` | 截图闪光 |  |
| `Capture is ready` | 截图已就绪 | 补精确词条（原模板误配） |
| `Capture shortcut` | 截图快捷键 |  |
| `Capture sound` | 截图声音 |  |
| `Change accent color` | 更改强调色 |  |
| `Change accent color for {name}` | 更改 {name} 的强调色 | 运行时变体，对应源码 `{0} accent color for {1}` |
| `Change snapshot shortcut` | 更改截图快捷键 |  |
| `ChatGPT sign-in could not finish. Try again.` | ChatGPT 登录未能完成，请重试。 |  |
| `ChatGPT sign-in couldn't finish` | ChatGPT 登录未能完成 |  |
| `ChatGPT sign-in on the primary environment was interrupted. Try again.` | 主环境上的 ChatGPT 登录已中断，请重试。 | 补精确词条（原模板误配） |
| `Check T3 Code SnapShots in GNOME Extensions, then try again.` | 请在 GNOME 扩展中检查 T3 Code SnapShots，然后重试。 |  |
| `Check capture access` | 检查截图权限 |  |
| `Checkout path` | 检出目录路径 | 补精确词条（原模板误配） |
| `Checkout path is required` | 必须填写检出目录路径 | 补精确词条（原模板误配） |
| `Choose a project icon` | 选择项目图标 |  |
| `Choose a window each time` | 每次选择窗口 |  |
| `Choose an agent` | 选择 Agent |  |
| `Choose how new worktree branches are named from your first message.` | 选择如何根据你的第一条消息为新工作树分支命名。 |  |
| `Choose shortcut` | 选择快捷键 |  |
| `Clear all conditions` | 清除所有条件 |  |
| `Clear {0}` | 清除 {0} |  |
| `Cleared {0}'s cookies and cache` | 已清除 {0} 的 Cookie 和缓存 | 补精确词条（原模板误配） |
| `Clipboard copy unavailable` | 无法复制到剪贴板 |  |
| `Codex setup failed. Try again.` | Codex 设置失败，请重试。 |  |
| `Complete sign-in in your browser.` | 请在浏览器中完成登录。 |  |
| `Composer context` | 输入框上下文 |  |
| `Composer: Opposite Queue or Steer Action` | 输入框：执行相反的排队或调整操作 |  |
| `Composer: Send and Start New Thread` | 输入框：发送并新建任务 | 补精确词条（原模板误配） |
| `Composer: Start in Background` | 输入框：在后台开始 |  |
| `Configure non-secret routing. Headers are write-only.` | 配置非机密的路由信息。请求头只能写入、不可读取。 |  |
| `Configured` | 已配置 |  |
| `Connect an environment to manage scheduled tasks.` | 连接一个环境以管理定时任务。 | 补精确词条（原模板误配） |
| `Continue authentication` | 继续认证 |  |
| `Continue setup` | 继续设置 |  |
| `Continue to sign-in` | 继续登录 | 补精确词条（原模板误配） |
| `Could not add backend` | 无法添加后端 |  |
| `Could not change WSL backend` | 无法更改 WSL 后端 |  |
| `Could not clear {0}'s data` | 无法清除 {0} 的数据 |  |
| `Could not configure ACP provider` | 无法配置 ACP 服务提供方 |  |
| `Could not continue authentication` | 无法继续认证 |  |
| `Could not copy hosted app link` | 无法复制托管应用链接 | 补精确词条（原模板误配） |
| `Could not copy pairing URL` | 无法复制配对 URL | 补精确词条（原模板误配） |
| `Could not copy pairing code` | 无法复制配对码 | 补精确词条（原模板误配） |
| `Could not copy the sign-in link.` | 无法复制登录链接。 | 补精确词条（原模板误配） |
| `Could not copy trace ID` | 无法复制追踪 ID | 补精确词条（原模板误配） |
| `Could not create pairing URL` | 无法创建配对 URL |  |
| `Could not create the theme.` | 无法创建主题。 |  |
| `Could not delete ACP session` | 无法删除 ACP 会话 | 补精确词条（原模板误配） |
| `Could not delete provider instance` | 无法删除服务提供方实例 |  |
| `Could not disable ACP provider` | 无法停用 ACP 服务提供方 |  |
| `Could not disable Tailscale HTTPS` | 无法停用 Tailscale HTTPS |  |
| `Could not finish sign-in on this computer. Try again or paste the redirect URL below.` | 无法在此设备上完成登录。请重试，或在下方粘贴重定向 URL。 | 补精确词条（原模板误配） |
| `Could not import ACP session` | 无法导入 ACP 会话 | 补精确词条（原模板误配） |
| `Could not list ACP providers` | 无法列出 ACP 服务提供方 |  |
| `Could not list ACP sessions` | 无法列出 ACP 会话 | 补精确词条（原模板误配） |
| `Could not load scheduled tasks` | 无法加载定时任务 |  |
| `Could not load the sign-in terminal. Cancel and retry sign-in.` | 无法加载登录终端。请取消后重试登录。 | 补精确词条（原模板误配） |
| `Could not log out of ACP agent` | 无法退出 ACP Agent 登录 | 补精确词条（原模板误配） |
| `Could not open the provider link.` | 无法打开服务提供方链接。 |  |
| `Could not read that file. Paste the JSON below instead.` | 无法读取该文件，请改为在下方粘贴 JSON。 |  |
| `Could not remove backend` | 无法移除后端 |  |
| `Could not reset provider instance` | 无法重置服务提供方实例 |  |
| `Could not restart resource monitor` | 无法重启资源监视器 |  |
| `Could not revoke client access` | 无法撤销客户端访问权限 |  |
| `Could not revoke other clients` | 无法撤销其他客户端 |  |
| `Could not revoke pairing link` | 无法撤销配对链接 |  |
| `Could not save scheduled task` | 无法保存定时任务 |  |
| `Could not save the theme.` | 无法保存主题。 |  |
| `Could not send input to the provider sign-in terminal.` | 无法向服务提供方登录终端发送输入。 | 补精确词条（原模板误配） |
| `Could not set up Tailscale HTTPS` | 无法设置 Tailscale HTTPS |  |
| `Could not update network access` | 无法更新网络访问设置 | 补精确词条（原模板误配） |
| `Could not update provider instance` | 无法更新服务提供方实例 | 补精确词条（原模板误配） |
| `Could not update scheduled task` | 无法更新定时任务 | 补精确词条（原模板误配） |
| `Could not update {0}.{1}` | 无法更新 {0}。{1} | 补精确词条（原模板误配） |
| `Could not update {environments}.` | 无法更新 {environments}。 | 运行时变体，对应源码 `Could not update {0}.{1}` |
| `Could not update {environments}. The other selected environments saved the change.` | 无法更新 {environments}。其他选中的环境已保存此更改。 | 运行时变体，对应源码 `Could not update {0}.{1}` |
| `Couldn't allow app text capture` | 无法允许截取应用文本 |  |
| `Couldn't change this setting.` | 无法更改此设置。 |  |
| `Couldn't check capture setup` | 无法检查截图设置 |  |
| `Couldn't check snapshots. Try again to continue.` | 无法检查截图功能。请重试以继续。 | 补精确词条（原模板误配） |
| `Couldn't close capture setup` | 无法关闭截图设置 |  |
| `Couldn't complete capture setup` | 无法完成截图设置 |  |
| `Couldn't open shortcut permissions` | 无法打开快捷键权限设置 |  |
| `Couldn't save capture settings` | 无法保存截图设置 |  |
| `Couldn't set up the extension` | 无法设置扩展 |  |
| `Couldn't verify capture access` | 无法验证截图权限 |  |
| `Create a new worktree` | 新建工作树 | 补精确词条（原模板误配） |
| `Create an API token` | 创建 API 令牌 | 补精确词条（原模板误配） |
| `Create task` | 创建定时任务 | 补精确词条（原模板误配） |
| `Cursor API key` | Cursor API 密钥 |  |
| `Cursor account` | Cursor 账户 |  |
| `Custom source control writing instructions` | 自定义源代码管理文案说明 |  |
| `Days to run` | 运行日期 | 补精确词条（原模板误配） |
| `Decrease provider health check interval` | 缩短服务提供方健康检查间隔 | 补精确词条（原模板误配） |
| `Default merge method` | 默认合并方式 |  |
| `Default model` | 默认模型 | 补精确词条（原模板误配） |
| `Delete instance {0}` | 删除实例 {0} |  |
| `Deleting` | 正在删除 |  |
| `Device hosts not saved on all environments` | 设备主机未在所有环境中保存 | 补精确词条（原模板误配） |
| `Device settings not saved on all environments` | 设备设置未在所有环境中保存 | 补精确词条（原模板误配） |
| `Disable ACP provider "{0}"?` | 要停用 ACP 服务提供方“{0}”吗？ |  |
| `Disabled tasks stay saved but do not run.` | 已停用的定时任务会保留，但不会运行。 |  |
| `Discovering sign-in methods…` | 正在查找登录方式… |  |
| `Docs` | 文档 |  |
| `Edit task` | 编辑定时任务 | 补精确词条（原模板误配） |
| `Empty` | 空 | 值用途放行配套译文 |
| `Enable T3 Code SnapShots to start capturing windows.` | 启用 T3 Code SnapShots 以开始截取窗口。 | 补精确词条（原模板误配） |
| `Enable T3 Connect` | 启用 T3 Connect | 补精确词条（原模板误配） |
| `Enable the extension` | 启用扩展 | 补精确词条（原模板误配） |
| `Endpoint the pairing QR code and URL use` | 配对二维码和 URL 使用的端点 | 补精确词条（原模板误配） |
| `Enter an official registry ID and any local executable or auth override.` | 输入官方注册表 ID，以及需要覆盖的本地可执行文件或认证设置。 | 补精确词条（原模板误配） |
| `Enter code` | 请在浏览器中输入代码 |  |
| `Enter manually` | 手动输入 |  |
| `Environment connected` | 环境已连接 |  |
| `Every interval` | 按间隔 |  |
| `Every {0} min` | 每 {0} 分钟 |  |
| `Every {0} sec` | 每 {0} 秒 |  |
| `Extension installed` | 扩展已安装 |  |
| `Finish extension setup to enable effects.` | 完成扩展设置以启用效果。 | 补精确词条（原模板误配） |
| `For example, t3code or t3code/ produces t3code/add-search. Leave empty for no prefix.` | 例如，t3code 或 t3code/ 会生成 t3code/add-search。留空则不加前缀。 | 补精确词条（原模板误配） |
| `GitHub sharing` | GitHub 共享 |  |
| `Headers must be valid JSON.` | 请求头必须是有效的 JSON。 |  |
| `Hosted app link copied` | 托管应用链接已复制 |  |
| `Imported` | 已导入 |  |
| `Importing` | 正在导入 |  |
| `Include app text` | 包含应用文本 |  |
| `Increase provider health check interval` | 延长服务提供方健康检查间隔 | 补精确词条（原模板误配） |
| `Indexing project files…` | 正在索引项目文件… |  |
| `Install or update the capture helper to enable effects.` | 安装或更新截图辅助程序以启用效果。 | 补精确词条（原模板误配） |
| `Install the extension` | 安装扩展 | 补精确词条（原模板误配） |
| `Install the update, then sign out and back in.` | 安装更新，然后注销并重新登录。 | 补精确词条（原模板误配） |
| `Installed themes could not be read.` | 无法读取已安装的主题。 |  |
| `Invalid interval` | 间隔无效 |  |
| `Invalid provider headers` | 服务提供方请求头无效 |  |
| `Keep branch and worktree controls below the composer after a thread starts.` | 任务开始后，仍在输入框下方保留分支和工作树控件。 | 补精确词条（原模板误配） |
| `Keep composer context visible in active threads` | 在进行中的任务里保持显示输入框上下文 |  |
| `Known broken version` | 已知有问题的版本 |  |
| `Learn more` | 了解更多 |  |
| `Let's fix capture access` | 修复截图权限 |  |
| `Let's try that again` | 再试一次 |  |
| `Letters, digits, '-', or '_'.` | 字母、数字、“-”或“_”。 |  |
| `Limited support` | 有限支持 |  |
| `List providers` | 列出服务提供方 |  |
| `List sessions` | 列出会话 | 补精确词条（原模板误配） |
| `Load balancing` | 负载均衡 |  |
| `Load more` | 加载更多 |  |
| `Loading scheduled tasks…` | 正在加载定时任务… | 补精确词条（原模板误配） |
| `Loading sign-in terminal…` | 正在加载登录终端… | 补精确词条（原模板误配） |
| `Log out` | 退出登录 |  |
| `Logged out of ACP agent` | 已退出 ACP Agent 登录 | 补精确词条（原模板误配） |
| `Logging out` | 正在退出登录 |  |
| `Manage capture` | 管理截图 |  |
| `Managed binary cleanup failed.` | 托管二进制文件清理失败。 |  |
| `Mixed across selected environments` | 所选环境之间不一致 |  |
| `Mixed. Enter instructions to apply to all selected targets.` | 各项不一致。输入说明以应用到所有选中的目标。 | 补精确词条（原模板误配） |
| `Name your theme first.` | 请先为主题命名。 |  |
| `Native sessions` | 原生会话 | 补精确词条（原模板误配） |
| `New keybinding` | 新建快捷键 |  |
| `New task` | 新建定时任务 |  |
| `Next run {0}` | 下次运行：{0} |  |
| `Next, choose your shortcut.` | 接下来，选择快捷键。 |  |
| `No compatible agents found` | 未找到兼容的 Agent |  |
| `No environments available` | 没有可用的环境 |  |
| `No in-app sign-in advertised. Follow the provider's docs to finish setup.` | 该服务提供方未提供应用内登录。请按照其文档完成设置。 | 补精确词条（原模板误配） |
| `No prefix` | 无前缀 |  |
| `No scheduled tasks` | 没有定时任务 |  |
| `No tasks match this environment and project selection.` | 没有符合所选环境和项目的定时任务。 | 补精确词条（原模板误配） |
| `Not authenticated · {0}` | 未认证 · {0} |  |
| `Not ready yet. Finish the step above.` | 尚未就绪，请先完成上面的步骤。 |  |
| `Not scheduled` | 未安排 |  |
| `Only this machine can connect. Restart with a non-loopback host for remote pairing.` | 只有本机可以连接。如需远程配对，请使用非回环主机地址重新启动。 | 补精确词条（原模板误配） |
| `Open GNOME Extensions and turn on extensions, then check again.` | 打开 GNOME 扩展并开启扩展功能，然后再次检查。 | 补精确词条（原模板误配） |
| `Open VSX search failed.` | Open VSX 搜索失败。 |  |
| `Open all environments` | 打开所有环境 |  |
| `Open browser` | 打开浏览器 |  |
| `Open docs` | 打开文档 |  |
| `Open documentation for {0} ({1})` | 打开 {0}（{1}）的文档 | 补精确词条（原模板误配） |
| `Open it in the browser on the device you want to connect.` | 请在要连接的设备上用浏览器打开。 | 补精确词条（原模板误配） |
| `Open it in the client you want to pair to this environment.` | 请在要与此环境配对的客户端中打开。 | 补精确词条（原模板误配） |
| `Open linked pull requests first. Otherwise, open Changes for edits to at least 3 files or 50 lines.` | 优先打开关联的拉取请求；否则，在编辑至少 3 个文件或 50 行时打开“更改”。 | 补精确词条（原模板误配） |
| `Open source for {0} ({1})` | 打开 {0}（{1}）的源代码 | 补精确词条（原模板误配） |
| `Optional. Overrides browser sign-in for this provider.` | 可选。将替代此服务提供方的浏览器登录。 | 补精确词条（原模板误配） |
| `Or choose from ACP Registry` | 或从 ACP 注册表中选择 |  |
| `Order of projects in the sidebar project picker and command palette.` | 项目在侧栏项目选择器和命令面板中的排列顺序。 | 补精确词条（原模板误配） |
| `Other paired clients will need a new pairing link before reconnecting.` | 其他已配对的客户端需要新的配对链接才能重新连接。 |  |
| `Pairing URL copied` | 配对 URL 已复制 |  |
| `Pairing code copied` | 配对码已复制 |  |
| `Pairing link — scan to open on another device` | 配对链接 — 扫码在另一台设备上打开 | 补精确词条（原模板误配） |
| `Paste API key` | 粘贴 API 密钥 |  |
| `Paste it into another client to finish pairing.` | 将其粘贴到另一个客户端以完成配对。 | 补精确词条（原模板误配） |
| `Paused` | 已暂停 |  |
| `Permanently delete native ACP session "{0}"?` | 要永久删除原生 ACP 会话“{0}”吗？ |  |
| `Press shortcut…` | 请按快捷键… |  |
| `Project defaults and overrides` | 项目默认设置与覆盖 | 补精确词条（原模板误配） |
| `Project for ACP providers` | ACP 服务提供方所属项目 | 补精确词条（原模板误配） |
| `Project for ACP sessions` | ACP 会话所属项目 | 补精确词条（原模板误配） |
| `Project order` | 项目排序 |  |
| `Project overview` | 项目概览 |  |
| `Prompt` | 提示词 |  |
| `Provider default` | 服务提供方默认 |  |
| `Provider deleted, but managed files remain` | 服务提供方已删除，但托管文件仍保留 |  |
| `Provider health check interval in seconds` | 服务提供方健康检查间隔（秒） | 补精确词条（原模板误配） |
| `Provider sign-in failed. Try again.` | 服务提供方登录失败，请重试。 |  |
| `Provider sign-in terminal` | 服务提供方登录终端 |  |
| `Queue: Edit Last Queued Message` | 队列：编辑最后一条排队消息 |  |
| `Queue: Send First Queued Message as Steer` | 队列：将第一条排队消息作为调整发送 |  |
| `Read PRs` | 读取 PR |  |
| `Read and act` | 读取并操作 | 补精确词条（原模板误配） |
| `Reading…` | 正在读取… |  |
| `Ready. Continue to choose your shortcut.` | 已就绪。请继续选择快捷键。 | 补精确词条（原模板误配） |
| `Ready. You'll choose a window each time.` | 已就绪。每次都需要选择窗口。 |  |
| `Reconnect this environment before saving.` | 请先重新连接此环境，再保存。 |  |
| `Reconnect to the environment and try again.` | 请重新连接环境后重试。 | 值用途放行配套译文 |
| `Reconnect {0} to view its scheduled tasks.` | 重新连接 {0} 以查看其定时任务。 | 补精确词条（原模板误配） |
| `Refresh remote branches in the background. Set to 0 to avoid automatic Git prompts.` | 在后台刷新远程分支。设为 0 可避免自动弹出 Git 提示。 | 补精确词条（原模板误配） |
| `Refresh the provider and start the authentication flow again.` | 刷新服务提供方，然后重新开始认证流程。 | 补精确词条（原模板误配） |
| `Refreshing ACP Registry results.` | 正在刷新 ACP 注册表结果。 |  |
| `Refreshing providers` | 正在刷新服务提供方 |  |
| `Remote access is already configured. Change network exposure where the server starts.` | 已配置远程访问。请在服务器启动处更改网络暴露设置。 | 补精确词条（原模板误配） |
| `Remove group and its conditions` | 移除分组及其条件 | 补精确词条（原模板误配） |
| `Remove selected{0}` | 移除所选主题{0} | 补精确词条（原模板误配） |
| `Remove {0} from this device?⏎This forgets its pairing, credentials, and cached threads here. Switch it off instead to keep it saved.` | 要从此设备移除 {0} 吗？⏎这会清除它在此处的配对、凭据和缓存的任务。若想保留，可改为将其关闭。 | 补精确词条（原模板误配） |
| `Repositories` | 仓库 |  |
| `Restart T3 Code to finish connecting your shortcut.` | 重新启动 T3 Code 以完成快捷键的连接。 | 补精确词条（原模板误配） |
| `Resume agent-owned conversations as T3 threads.` | 将 Agent 保存的对话作为 T3 任务继续。 |  |
| `Resume usage-limit stops at the reported reset time. Each thread can cancel its scheduled continuation.` | 因用量限额而停止的任务会在报告的重置时间自动恢复。每个任务都可以取消已安排的继续运行。 |  |
| `Retry sign-in` | 重试登录 |  |
| `Return to the provider and try again.` | 请返回服务提供方后重试。 | 补精确词条（原模板误配） |
| `Revoked 1 other client` | 已撤销另外 1 个客户端 |  |
| `Revoked {count} clients` | 已撤销 {count} 个客户端 | 运行时变体，对应源码 `Revoked 1 other client` |
| `Run a prompt automatically — on an interval or at a fixed time.` | 按间隔或在固定时间自动运行提示词。 | 补精确词条（原模板误配） |
| `Run at` | 运行时间 | 补精确词条（原模板误配） |
| `Run every` | 运行间隔 | 补精确词条（原模板误配） |
| `Run only the WSL backend. T3 Code restarts when this changes.` | 仅运行 WSL 后端。更改此设置后 T3 Code 会重新启动。 | 补精确词条（原模板误配） |
| `Run the selected WSL distro alongside Windows. Projects remain on their current filesystem.` | 与 Windows 同时运行所选的 WSL 发行版。项目仍保留在当前文件系统中。 | 补精确词条（原模板误配） |
| `Runs on` | 运行于 |  |
| `Save task` | 保存定时任务 | 补精确词条（原模板误配） |
| `Save your work, then sign out and back in. Your setup will be waiting here.` | 请保存工作，然后注销并重新登录。设置进度会保留在这里。 | 补精确词条（原模板误配） |
| `Schedule` | 运行计划 |  |
| `Scheduled Tasks` | 定时任务 |  |
| `Scheduled task is incomplete` | 定时任务信息不完整 | 补精确词条（原模板误配） |
| `Scheduled tasks` | 定时任务 |  |
| `Scoped to one repository, project, or workspace. Create it in that item's Bitbucket settings.` | 仅限单个仓库、项目或工作区。请在该项的 Bitbucket 设置中创建。 | 补精确词条（原模板误配） |
| `Search ACP Registry` | 搜索 ACP 注册表 |  |
| `Search agents…` | 搜索 Agent… |  |
| `Search image files…` | 搜索图片文件… |  |
| `Search registry` | 搜索注册表 |  |
| `Search themes...` | 搜索主题... |  |
| `Searching project files…` | 正在搜索项目文件… |  |
| `Searching the ACP Registry.` | 正在搜索 ACP 注册表。 |  |
| `Searching the registry...` | 正在搜索注册表... |  |
| `Set up {0} capture` | 设置 {0} 截图 | 补精确词条（原模板误配） |
| `Setting saved on some environments` | 设置已在部分环境中保存 | 补精确词条（原模板误配） |
| `Shortcut saved` | 快捷键已保存 | 补精确词条（原模板误配） |
| `Show {0} in the model picker` | 在模型选择器中显示 {0} | 补精确词条（原模板误配） |
| `Showing the full value instead.` | 已改为显示完整内容。 |  |
| `Shown in the provider list.` | 显示在服务提供方列表中。 |  |
| `Sign out` | 退出登录 |  |
| `Sign out of {0} on {1}? This stops running threads that share this sign-in. Thread history is kept.` | 要在 {1} 上退出 {0} 的登录吗？共用此登录的运行中任务会停止，任务历史会保留。 | 补精确词条（原模板误配） |
| `Sign-in method` | 登录方式 |  |
| `Simulator support` | 模拟器支持 |  |
| `Skip for now` | 暂时跳过 | 补精确词条（原模板误配） |
| `Snooze limited threads` | 暂缓受限任务 |  |
| `Snooze usage-limit stops until the reported reset time. Combine with auto-resume to continue when they wake.` | 将因用量限额而停止的任务暂缓到报告的重置时间。与自动恢复配合使用，可在唤醒时继续运行。 | 补精确词条（原模板误配） |
| `Span` | 跨度 |  |
| `Speed` | 速度 |  |
| `Still unable to check access. See Advanced for help.` | 仍无法检查权限。请参阅“高级”中的帮助。 | 补精确词条（原模板误配） |
| `Still waiting for you to sign out and back in.` | 仍在等待你注销并重新登录。 | 补精确词条（原模板误配） |
| `Subprocess` | 子进程 |  |
| `T3 Code will restart and start running a server on this computer again.` | T3 Code 将重新启动，并重新在此设备上运行服务器。 | 补精确词条（原模板误配） |
| `T3 Code will restart without running a server on this computer. Any agents and terminals running here will stop, and other devices will no longer be able to connect to this computer. Your projects, history, and remote environments are unaffected.` | T3 Code 将重新启动，并且不再在此设备上运行服务器。此处运行的所有 Agent 和终端都会停止，其他设备也将无法再连接到此设备。你的项目、历史记录和远程环境不受影响。 | 补精确词条（原模板误配） |
| `T3 Code's capture helper lets you capture other apps and return to your draft. It's included with T3 Code.` | T3 Code 的截图辅助程序可让你截取其他应用并返回草稿。它已包含在 T3 Code 中。 | 补精确词条（原模板误配） |
| `Task unavailable` | 定时任务不可用 |  |
| `Test a snapshot of the current window. If macOS asks to bypass its window picker, choose Allow. The test image is discarded.` | 测试截取当前窗口。如果 macOS 询问是否绕过其窗口选择器，请选择“允许”。测试图片会被丢弃。 | 补精确词条（原模板误配） |
| `That file is {0}. Theme files are only a few KB, so this one was not read (limit {1}).` | 该文件大小为 {0}。主题文件通常只有几 KB，因此未读取此文件（上限 {1}）。 | 补精确词条（原模板误配） |
| `That theme could not be added.` | 无法添加该主题。 |  |
| `That theme file is invalid.` | 该主题文件无效。 | 补精确词条（原模板误配） |
| `The ACP could not be prepared.` | 无法准备该 ACP。 |  |
| `The ACP operation failed.` | ACP 操作失败。 |  |
| `The T3 Code GNOME extension lets you capture other windows and bring them into your draft. Sign out once after installing.` | T3 Code GNOME 扩展可让你截取其他窗口并带入草稿。安装后需注销一次。 | 补精确词条（原模板误配） |
| `The authentication request expired.` | 认证请求已过期。 |  |
| `The environment is saved and will reconnect on app startup.` | 环境已保存，应用启动时会重新连接。 | 补精确词条（原模板误配） |
| `The extension isn't ready yet. Try again in a moment.` | 扩展尚未就绪，请稍后重试。 |  |
| `The model chooses a prefix that describes the work, such as feat/add-search, fix/login-timeout, or refactor/auth.` | 由模型选择描述工作内容的前缀，例如 feat/add-search、fix/login-timeout 或 refactor/auth。 |  |
| `The provider sign-in terminal is no longer available.` | 服务提供方登录终端已不可用。 | 补精确词条（原模板误配） |
| `The resource monitor retry failed.` | 资源监视器重试失败。 |  |
| `The settings update failed.` | 设置更新失败。 |  |
| `Theme added, but it could not be selected. Try again.` | 主题已添加，但无法选中，请重试。 |  |
| `Theme saved, but it could not be made active. Try again.` | 主题已保存，但无法设为当前主题，请重试。 |  |
| `There's no capture shortcut to remove.` | 没有可移除的截图快捷键。 | 补精确词条（原模板误配） |
| `This desktop only provides a screenshot.` | 此桌面环境仅提供截图。 |  |
| `This scheduled task no longer exists.` | 此定时任务已不存在。 |  |
| `This session can view {0}'s providers but can't change their settings.` | 此会话可以查看 {0} 的服务提供方，但无法更改其设置。 |  |
| `This task no longer exists or is outside the selected project scope.` | 此定时任务已不存在，或不在所选项目范围内。 | 补精确词条（原模板误配） |
| `This task uses a legacy interval below one minute. Saving updates it to at least one minute.` | 此定时任务使用的是低于一分钟的旧版间隔，保存时会更新为至少一分钟。 | 补精确词条（原模板误配） |
| `Trace` | 追踪 |  |
| `Trace ID copied` | 追踪 ID 已复制 |  |
| `Try reinstalling the capture helper, then check again.` | 请尝试重新安装截图辅助程序，然后再次检查。 |  |
| `Unavailable selection` | 选择不可用 |  |
| `Unsupported version` | 不支持的版本 |  |
| `Update for full support.` | 请更新以获得完整支持。 | 补精确词条（原模板误配） |
| `Update the GNOME extension, then sign out and back in to enable effects.` | 更新 GNOME 扩展，然后注销并重新登录以启用效果。 | 补精确词条（原模板误配） |
| `Update the capture helper` | 更新截图辅助程序 | 补精确词条（原模板误配） |
| `Update the desktop app to use snapshots.` | 请更新桌面应用以使用截图功能。 | 补精确词条（原模板误配） |
| `Update the extension` | 更新扩展 | 补精确词条（原模板误配） |
| `Usage: Period: {0}` | 用量：时段：{0} |  |
| `Usage: {0}` | 用量：{0} |  |
| `Use Take snapshot from the command palette to choose a window.` | 在命令面板中使用 Take snapshot 选择窗口。 | 补精确词条（原模板误配） |
| `Use a specific checkout` | 使用指定的检出目录 | 补精确词条（原模板误配） |
| `Use julius/ followed by the issue ID and a short description.` | 使用 julius/，后接问题 ID 和简短描述。 | 补精确词条（原模板误配） |
| `Use the project checkout` | 使用项目检出目录 | 补精确词条（原模板误配） |
| `Use {0} for full support.` | 请使用 {0} 以获得完整支持。 | 补精确词条（原模板误配） |
| `Use {0} for {1} mode{2}` | 在 {1} 模式下使用 {0}{2} | 补精确词条（原模板误配） |
| `Use {0}{1}` | 使用 {0}{1} | 补精确词条（原模板误配） |
| `Use {collection}, {theme} variant` | 使用 {collection}，{theme} 变体 | 运行时变体，对应源码 `Use {0}{1}` |
| `Use {collection}, {theme} variant, currently active` | 使用 {collection}，{theme} 变体，当前正在使用 | 运行时变体，对应源码 `Use {0}{1}` |
| `Use {theme} for dark mode` | 在深色模式下使用 {theme} | 运行时变体，对应源码 `Use {0}{1}` |
| `Use {theme} for dark mode, currently active` | 在深色模式下使用 {theme}，当前正在使用 | 运行时变体，对应源码 `Use {0}{1}` |
| `Use {theme} for light mode` | 在浅色模式下使用 {theme} | 运行时变体，对应源码 `Use {0}{1}` |
| `Use {theme} for light mode, currently active` | 在浅色模式下使用 {theme}，当前正在使用 | 运行时变体，对应源码 `Use {0}{1}` |
| `Use {theme} theme` | 使用 {theme} 主题 | 运行时变体，对应源码 `Use {0}{1}` |
| `Use {theme} theme, currently active` | 使用 {theme} 主题，当前正在使用 | 运行时变体，对应源码 `Use {0}{1}` |
| `Uses your Atlassian account, so it reaches every repository you can. Give it read and write access to repositories and pull requests, and read:user:bitbucket.` | 使用你的 Atlassian 账户，因此可访问你有权访问的所有仓库。请为其授予仓库和拉取请求的读写权限，以及 read:user:bitbucket 权限。 | 补精确词条（原模板误配） |
| `Using CURSOR_API_KEY. Remove it from this provider's environment to use browser sign-in.` | 正在使用 CURSOR_API_KEY。如需使用浏览器登录，请将其从此服务提供方的环境变量中移除。 | 补精确词条（原模板误配） |
| `View source for {0}` | 查看 {0} 的源代码 | 补精确词条（原模板误配） |
| `WSL is unavailable, so Windows is running instead. Turn WSL off to clear this preference.` | WSL 不可用，因此改为运行 Windows。关闭 WSL 即可清除此偏好设置。 | 补精确词条（原模板误配） |
| `What should the agent do each time this runs?` | 每次运行时，Agent 应该做什么？ |  |
| `Worktree branch naming` | 工作树分支命名 |  |
| `Worktree cleanup` | 工作树清理 |  |
| `Your default browser` | 默认浏览器 |  |
| `Your desktop doesn't support automatic capture. You'll choose the window to capture instead.` | 你的桌面环境不支持自动截图，需要改为手动选择要截取的窗口。 | 补精确词条（原模板误配） |
| `Your desktop may ask for permission when you first capture.` | 首次截图时，桌面环境可能会请求权限。 | 补精确词条（原模板误配） |
| `as` | 为 |  |
| `branch naming` | 分支命名 |  |
| `branch naming instructions` | 分支命名说明 |  |
| `branch prefix` | 分支前缀 |  |
| `change request templates` | 变更请求模板 |  |
| `composer context` | 输入框上下文 |  |
| `e.g. Check for Sentry issues` | 例如：检查 Sentry 问题 | 补精确词条（原模板误配） |
| `in under a minute` | 不到 1 分钟后 |  |
| `in your browser.` | 。 |  |
| `in {0}d` | {0} 天后 |  |
| `in {0}h` | {0} 小时后 |  |
| `in {0}m` | {0} 分钟后 | 补精确词条（原模板误配） |
| `minutes` | 分钟 |  |
| `no cookies` | 没有 Cookie | 补精确词条（原模板误配） |
| `override` | 覆盖 |  |
| `process` | 个进程 |  |
| `processes` | 个进程 |  |
| `project order` | 项目排序 |  |
| `read PRs` | 读取 PR |  |
| `read and act` | 读取并操作 | 补精确词条（原模板误配） |
| `source control writing style` | 源代码管理文案风格 |  |
| `working section` | “进行中”分区 |  |
| `{0} accent color for {1}` | {0} {1} 的强调色 | 补精确词条（原模板误配） |
| `{0} and {1} more` | {0} 等另外 {1} 个 | 补精确词条（原模板误配） |
| `{0} at {1}` | {0} {1} |  |
| `{0} base URL` | {0} 基础 URL |  |
| `{0} bytes` | {0} 字节 |  |
| `{0} compatible {1} found.` | 找到 {0} 个兼容的 {1}。 |  |
| `{0} hue` | {0}色相 |  |
| `{0} ms` | {0} 毫秒 |  |
| `{0} notices` | {0} 条声明 |  |
| `{0} protocol` | {0} 协议 |  |
| `{0} s` | {0} 秒 |  |
| `{0} server` | {0} 服务器 |  |
| `{0} themes {1}` | {0} 个主题 {1} |  |
| `{0} write-only headers JSON` | {0} 只写请求头 JSON |  |
| `{0} {1} usage` | {0} {1} 的使用位置 |  |
| `{0} {1} {2} favorites` | {0} {1} {2} 收藏 | 补精确词条（原模板误配） |
| `{0} µs` | {0} 微秒 |  |
| `{0}. Exporting OTEL metrics to {1}.` | {0}。正在将 OTEL 指标导出到 {1}。 | 补精确词条（原模板误配） |
| `{0}. Exporting OTEL to {1}.` | {0}。正在将 OTEL 导出到 {1}。 | 补精确词条（原模板误配） |
| `{0}. Exporting OTEL traces to {1} and metrics to {2}.` | {0}。正在将 OTEL 追踪导出到 {1}，指标导出到 {2}。 | 补精确词条（原模板误配） |
| `{0}. Exporting OTEL traces to {1}.` | {0}。正在将 OTEL 追踪导出到 {1}。 | 补精确词条（原模板误配） |
| `{0}: install the latest provider version.` | {0}：请安装最新版本的服务提供方。 |  |
| `{0}: install {1}.` | {0}：请安装 {1}。 |  |
| `{0}h` | {0} 小时 |  |
| `{count} compatible agent found.` | 找到 {count} 个兼容的 Agent。 | 运行时变体，对应源码 `{0} compatible {1} found.` |
| `{count} compatible agents found.` | 找到 {count} 个兼容的 Agent。 | 运行时变体，对应源码 `No compatible agents found` |
| `· Required` | · 必需 |  |
| `“{0}” already has a {1} palette. Pick another name.` | “{0}”已有 {1} 配色，请换一个名称。 |  |
| `“{0}” already has light and dark palettes. Pick another name.` | “{0}”已有浅色和深色配色，请换一个名称。 | 补精确词条（原模板误配） |
| `“{name}” already has a dark palette. Pick another name.` | “{name}”已有深色配色，请换一个名称。 | 运行时变体，对应源码 `“{0}” already has a {1} palette. Pick another name.` |
| `“{name}” already has a light palette. Pick another name.` | “{name}”已有浅色配色，请换一个名称。 | 运行时变体，对应源码 `“{0}” already has a {1} palette. Pick another name.` |

### apps/web/src/components/sidebar（1）

| 英文 | 中文 | 备注 |
|---|---|---|
| `{0} older {1} on GitHub` | 在 GitHub 上查看更早的 {0} 个{1} | 补精确词条（原模板误配） |

### apps/web/src/components/ui（1）

| 英文 | 中文 | 备注 |
|---|---|---|
| `{step}, step {index}, {summary}` | {step}，第 {index} 步，{summary} | 运行时变体，对应源码 `{0}, step {1}{2}` |

### apps/web/src/components/usage（29）

| 英文 | 中文 | 备注 |
|---|---|---|
| `30 days` | 30 天 | 补精确词条（原模板误配） |
| `7 days` | 7 天 | 补精确词条（原模板误配） |
| `90 days` | 90 天 | 补精确词条（原模板误配） |
| `Cache hit` | 缓存命中 |  |
| `Cost by speed` | 按速度统计费用 |  |
| `Cost by type` | 按类型统计费用 |  |
| `Map new model to model` | 将新模型映射到模型 | 运行时变体，对应源码 `Map {0} to model` |
| `Map to` | 映射到 |  |
| `Map {0} to model` | 将 {0} 映射到模型 | 补精确词条（原模板误配） |
| `No custom prices or mappings. Add a row to set one.` | 没有自定义价格或映射。添加一行即可设置。 | 补精确词条（原模板误配） |
| `Not saved · {0}` | 未保存 · {0} |  |
| `Other` | 其他 |  |
| `Per 1M tokens` | 每百万 Token |  |
| `Premium` | 高级 | 补精确词条（原模板误配） |
| `Prices and mappings apply to all past and future usage on the environments you select.` | 价格和映射将应用于所选环境中过去和将来的全部用量。 | 补精确词条（原模板误配） |
| `Set price` | 设置价格 |  |
| `Tokens by type` | 按类型统计 Token |  |
| `Using…` | 正在使用… |  |
| `cost` | 费用 |  |
| `processed tokens` | 已处理 Token |  |
| `{0}: {1}% left{2}{3}` | {0}：剩余 {1}%{2}{3} |  |
| `{name}: {remaining}% left` | {name}：剩余 {remaining}% | 运行时变体，对应源码 `{0}: {1}% left{2}{3}` |
| `{name}: {remaining}% left, {credits} reset credit banked` | {name}：剩余 {remaining}%，已存 {credits} 次重置额度 | 运行时变体，对应源码 `{0}: {1}% left{2}{3}` |
| `{name}: {remaining}% left, {credits} reset credits banked` | {name}：剩余 {remaining}%，已存 {credits} 次重置额度 | 运行时变体，对应源码 `{0}: {1}% left{2}{3}` |
| `{name}: {remaining}% left, {resets}` | {name}：剩余 {remaining}%，{resets} | 运行时变体，对应源码 `{0}: {1}% left{2}{3}` |
| `{name}: {remaining}% left, {resets}, {credits} reset credit banked` | {name}：剩余 {remaining}%，{resets}，已存 {credits} 次重置额度 | 运行时变体，对应源码 `{0}: {1}% left{2}{3}` |
| `{name}: {remaining}% left, {resets}, {credits} reset credits banked` | {name}：剩余 {remaining}%，{resets}，已存 {credits} 次重置额度 | 运行时变体，对应源码 `{0}: {1}% left{2}{3}` |
| `· API estimate` | · API 估算 |  |
| `· {0} of cost` | · 占费用的 {0} | 补精确词条（原模板误配） |

### apps/web/src/components（根目录）（268）

| 英文 | 中文 | 备注 |
|---|---|---|
| `(detached HEAD)` | （分离的 HEAD） |  |
| `1. Join the group` | 1. 加入群组 |  |
| `2. Become a tester` | 2. 成为测试者 |  |
| `A background prompt could not be sent` | 后台提示词发送失败 |  |
| `A message can have at most {0} attachments.` | 一条消息最多可包含 {0} 个附件。 |  |
| `Action failed` | 操作失败 |  |
| `Add project script` | 添加项目脚本 |  |
| `Add to chat` | 添加到对话 | 补精确词条（原模板误配） |
| `Allow retry` | 允许重试 |  |
| `Android beta group link` | Android 测试版群组链接 |  |
| `Appearance: {0}` | 外观：{0} |  |
| `Archive ({0})` | 归档（{0}） | 补精确词条（原模板误配） |
| `Archive thread "{0}"?` | 要归档任务“{0}”吗？ | 补精确词条（原模板误配） |
| `Archive {0} thread{1}?` | 要归档 {0} 个任务{1}吗？ | 补精确词条（原模板误配） |
| `Archive {count} thread?` | 要归档 {count} 个任务吗？ | 运行时变体，对应源码 `Archive thread "{0}"?` |
| `Archive {count} threads?` | 要归档 {count} 个任务吗？ | 运行时变体，对应源码 `Archive ({0})` |
| `Archived thread` | 已归档的任务 | 补精确词条（原模板误配） |
| `Background task failed` | 后台任务失败 |  |
| `Branch has diverged from upstream. Rebase/merge first.` | 分支已与上游分叉，请先变基或合并。 |  |
| `Caution` | 注意 |  |
| `Change appearance` | 更改外观 |  |
| `Change theme` | 更改主题 |  |
| `Changes` | 更改 |  |
| `Checking machine resources` | 正在检查设备资源 | 补精确词条（原模板误配） |
| `Choose a machine to continue` | 选择设备以继续 | 补精确词条（原模板误配） |
| `Choose models and a base branch` | 选择模型和基础分支 | 补精确词条（原模板误配） |
| `Choose project action` | 选择项目操作 |  |
| `Clipboard API unavailable.` | 剪贴板 API 不可用。 |  |
| `Clone failed` | 克隆失败 |  |
| `Close all` | 全部关闭 | 补精确词条（原模板误配） |
| `Close others` | 关闭其他 | 补精确词条（原模板误配） |
| `Close to the right` | 关闭右侧 | 补精确词条（原模板误配） |
| `Commit & push to default ref?` | 提交并推送到默认引用？ | 补精确词条（原模板误配） |
| `Commit, push & create {0} from default ref?` | 从默认引用提交、推送并创建{0}？ | 补精确词条（原模板误配） |
| `Copy PR link` | 复制 PR 链接 |  |
| `Copy Path` | 复制路径 |  |
| `Copy Thread ID` | 复制任务 ID |  |
| `Copy branch name` | 复制分支名称 |  |
| `Could not add WSL project` | 无法添加 WSL 项目 |  |
| `Could not choose environment` | 无法选择环境 |  |
| `Could not disconnect server` | 无法断开服务器连接 |  |
| `Could not open a fresh composer` | 无法打开新的输入框 |  |
| `Could not resume thread.` | 无法恢复任务。 |  |
| `Could not save the edited queued message.` | 无法保存编辑后的排队消息。 |  |
| `Could not start update download` | 无法开始下载更新 | 补精确词条（原模板误配） |
| `Couldn't save theme selection` | 无法保存主题选择 |  |
| `Create and checkout a ref before pushing or opening a {0}.` | 推送或创建{0}前，请先创建并检出一个引用。 | 补精确词条（原模板误配） |
| `Created at` | 创建时间 | 补精确词条（原模板误配） |
| `Delete all threads in this project before removing it.` | 移除项目前，请先删除其中的所有任务。 |  |
| `Delete anyway` | 仍然删除 |  |
| `Device` | 设备 | 值用途放行配套译文 |
| `Diff` | 差异 |  |
| `Directories` | 目录 |  |
| `Editor opening is unavailable.` | 无法打开编辑器。 | 补精确词条（原模板误配） |
| `Environment unavailable` | 环境不可用 |  |
| `Every project path gets its own sidebar row.` | 每个项目路径在侧栏中单独占一行。 |  |
| `Failed to add project` | 添加项目失败 | 补精确词条（原模板误配） |
| `Failed to archive threads` | 归档任务失败 | 补精确词条（原模板误配） |
| `Failed to compact context.` | 压缩上下文失败。 | 补精确词条（原模板误配） |
| `Failed to copy branch name` | 复制分支名称失败 | 补精确词条（原模板误配） |
| `Failed to create and switch ref.` | 创建并切换引用失败。 | 补精确词条（原模板误配） |
| `Failed to disconnect.` | 断开连接失败。 | 补精确词条（原模板误配） |
| `Failed to dismiss the question.` | 关闭问题失败。 | 补精确词条（原模板误配） |
| `Failed to fork this response.` | 从此回复分叉失败。 | 补精确词条（原模板误配） |
| `Failed to interrupt the current turn.` | 中断当前轮次失败。 | 补精确词条（原模板误配） |
| `Failed to revert thread state.` | 回退任务状态失败。 | 补精确词条（原模板误配） |
| `Failed to run script "{0}".` | 运行脚本“{0}”失败。 | 补精确词条（原模板误配） |
| `Failed to send message.` | 发送消息失败。 | 补精确词条（原模板误配） |
| `Failed to send messages.` | 发送消息失败。 | 补精确词条（原模板误配） |
| `Failed to send plan follow-up.` | 发送方案后续消息失败。 | 补精确词条（原模板误配） |
| `Failed to snooze {0} thread{1}` | 暂缓 {0} 个任务{1}失败 | 补精确词条（原模板误配） |
| `Failed to snooze {count} thread` | 暂缓 {count} 个任务失败 | 运行时变体，对应源码 `Failed to snooze {0} thread{1}` |
| `Failed to snooze {count} threads` | 暂缓 {count} 个任务失败 | 运行时变体，对应源码 `Failed to snooze {0} thread{1}` |
| `Failed to stop background work.` | 停止后台工作失败。 | 补精确词条（原模板误配） |
| `Failed to submit approval decision.` | 提交批准决定失败。 | 补精确词条（原模板误配） |
| `Failed to submit user input.` | 提交用户输入失败。 | 补精确词条（原模板误配） |
| `Failed to switch ref.` | 切换引用失败。 | 补精确词条（原模板误配） |
| `Failed to update auto-settle` | 更新自动收起设置失败 | 补精确词条（原模板误配） |
| `From {0}` | 基于 {0} |  |
| `Get the beta app` | 获取测试版应用 |  |
| `Git initialization failed` | Git 初始化失败 |  |
| `Go to file` | 转到文件 | 补精确词条（原模板误配） |
| `Google Play beta` | Google Play 测试版 |  |
| `Google Play beta link` | Google Play 测试版链接 |  |
| `Important` | 重要 |  |
| `Install update and restart T3 Code?⏎⏎Any running tasks will be interrupted. Make sure you're ready before continuing.` | 要安装更新并重启 T3 Code 吗？⏎⏎所有正在运行的任务都会被中断，请确认已准备好再继续。 | 运行时变体，对应源码 `Install update{0} and restart T3 Code?⏎⏎Any running tasks will be interrupted. Make sure you're ready before continuing.` |
| `Install update {version} and restart T3 Code?⏎⏎Any running tasks will be interrupted. Make sure you're ready before continuing.` | 要安装更新 {version} 并重启 T3 Code 吗？⏎⏎所有正在运行的任务都会被中断，请确认已准备好再继续。 | 运行时变体，对应源码 `Install update{0} and restart T3 Code?⏎⏎Any running tasks will be interrupted. Make sure you're ready before continuing.` |
| `Install update{0} and restart T3 Code?⏎⏎Any running tasks will be interrupted. Make sure you're ready before continuing.` | 要安装更新{0}并重启 T3 Code 吗？⏎⏎所有正在运行的任务都会被中断，请确认已准备好再继续。 | 补精确词条（原模板误配） |
| `Interrupt the current turn before reverting checkpoints.` | 请先中断当前轮次，再回退检查点。 |  |
| `Keep attachments on this machine` | 将附件保留在此设备上 | 补精确词条（原模板误配） |
| `Language: {0}` | 语言：{0} |  |
| `Last user message` | 最后一条用户消息 |  |
| `Limited` | 受限 |  |
| `Link pull request to thread` | 将拉取请求关联到任务 | 补精确词条（原模板误配） |
| `Linked pull requests` | 关联的拉取请求 |  |
| `Linked thread` | 关联的任务 |  |
| `Linked {count} pull requests` | 已关联 {count} 个拉取请求 | 运行时变体，对应源码 `Linked pull requests` |
| `Loading changes...` | 正在加载更改... | 补精确词条（原模板误配） |
| `Loading uncommitted changes...` | 正在加载未提交的更改... | 补精确词条（原模板误配） |
| `Manual` | 手动 |  |
| `Media unavailable` | 媒体不可用 |  |
| `Migrating {0} {1} from the previous version. You can keep working while this finishes.` | 正在从旧版本迁移 {0} {1}。迁移期间你可以继续工作。 |  |
| `Migrating {count} thread from the previous version. You can keep working while this finishes.` | 正在从旧版本迁移 {count} 个任务。迁移期间你可以继续工作。 | 运行时变体，对应源码 `Migrating {0} {1} from the previous version. You can keep working while this finishes.` |
| `Migrating {count} threads from the previous version. You can keep working while this finishes.` | 正在从旧版本迁移 {count} 个任务。迁移期间你可以继续工作。 | 运行时变体，对应源码 `Migrating {0} {1} from the previous version. You can keep working while this finishes.` |
| `Mini PC` | 迷你主机 |  |
| `Mobile app` | 移动应用 |  |
| `Multiple models need a new thread in a Git project. Each gets its own worktree.` | 多个模型需要在 Git 项目中新建任务，每个模型使用各自的工作树。 |  |
| `New thread in...` | 新建任务于... |  |
| `Nightly needs the beta app. The App Store and Google Play versions cannot connect.` | Nightly 版需要测试版应用，App Store 和 Google Play 上的版本无法连接。 | 补精确词条（原模板误配） |
| `Nightly needs the beta mobile app` | Nightly 版需要测试版移动应用 |  |
| `Nightly uses the new orchestrator. The App Store and Google Play versions of T3 Code cannot connect to it.` | Nightly 版使用新的编排器，App Store 和 Google Play 上的 T3 Code 无法连接到它。 | 补精确词条（原模板误配） |
| `No eligible machine has available resources. Choose a machine in the composer to override.` | 没有符合条件的设备有可用资源。可在输入框中手动选择设备。 | 补精确词条（原模板误配） |
| `Note` | 备注 |  |
| `Open WSL folder` | 打开 WSL 文件夹 |  |
| `Open draft` | 打开草稿 |  |
| `Open project` | 打开项目 |  |
| `Open pull requests` | 打开拉取请求 |  |
| `Open settings` | 打开设置 |  |
| `Open subagent {0}` | 打开子 Agent {0} |  |
| `Open thread` | 打开任务 |  |
| `Open usage` | 打开用量 |  |
| `Parent thread` | 父任务 |  |
| `Paste` | 粘贴 | 值用途放行配套译文 |
| `Pin` | 置顶 |  |
| `Press a shortcut. Use` | 按下快捷键。按 |  |
| `Preview media` | 预览媒体 | 补精确词条（原模板误配） |
| `Preview video attachment, {name}, {size}` | 预览视频附件，{name}，{size} | 运行时变体，对应源码 `{0} attachment, {1}, {2}` |
| `Previous worktree ({0})` | 上一个工作树（{0}） |  |
| `Project grouping rule` | 项目分组规则 |  |
| `Project is not empty` | 项目不为空 | 补精确词条（原模板误配） |
| `Projects group only when both the repository and repo-relative path match.` | 仅当仓库和仓库内相对路径都一致时，项目才会合并为一组。 | 补精确词条（原模板误配） |
| `Provider for {0} is unavailable.` | {0} 的服务提供方不可用。 | 补精确词条（原模板误配） |
| `Provider still needs an update` | 服务提供方仍需更新 |  |
| `Provider updates finished` | 服务提供方更新已完成 |  |
| `Providers still need updates` | 多个服务提供方仍需更新 |  |
| `Pull failed` | 拉取失败 |  |
| `Push & create {0} from default ref?` | 从默认引用推送并创建{0}？ | 补精确词条（原模板误配） |
| `Push to default ref?` | 推送到默认引用？ | 补精确词条（原模板误配） |
| `Queued message is no longer queued` | 该排队消息已不在队列中 | 补精确词条（原模板误配） |
| `Re-add it if you want that terminal output included.` | 如需包含该终端输出，请重新添加。 |  |
| `Recent Threads` | 最近的任务 |  |
| `Reconnect {0} before reverting checkpoints.` | 请先重新连接 {0}，再回退检查点。 |  |
| `Regenerate titles ({0})` | 重新生成标题（{0}） |  |
| `Regenerating… ({0})` | 正在重新生成…（{0}） |  |
| `Remove attachments before choosing automatic routing, then attach them on the selected machine.` | 选择自动分配前请先移除附件，然后在选定的设备上重新添加。 | 补精确词条（原模板误配） |
| `Remove it or re-add it to include terminal output.` | 请移除它，或重新添加以包含终端输出。 | 补精确词条（原模板误配） |
| `Rename` | 重命名 |  |
| `Rendering diagram` | 正在渲染图表 | 补精确词条（原模板误配） |
| `Repository lookup failed` | 仓库查找失败 |  |
| `Resource checks are still running. You can choose a machine in the composer.` | 资源检查仍在进行中。你可以在输入框中选择设备。 |  |
| `Restore prompt` | 恢复提示词 |  |
| `Restoring your threads…` | 正在恢复你的任务… |  |
| `Retry to bring in the repository.` | 请重试以导入仓库。 | 补精确词条（原模板误配） |
| `Return to the original draft and send or clear its current prompt before restoring.` | 请回到原草稿，先发送或清除其当前提示词，再进行恢复。 | 补精确词条（原模板误配） |
| `Review comment` | 评审评论 | 补精确词条（原模板误配） |
| `Roll back this thread to the selected checkpoint?` | 要将此任务回滚到所选检查点吗？ | 补精确词条（原模板误配） |
| `Roll back this thread to the selected checkpoint?⏎This action cannot be undone.` | 要将此任务回滚到所选检查点吗？⏎此操作无法撤销。 | 补精确词条（原模板误配） |
| `Running provider update command.` | 正在运行服务提供方更新命令。 |  |
| `Scan with your iPhone camera.` | 使用 iPhone 相机扫描。 |  |
| `Select a base branch before sending in New worktree mode.` | 在“新建工作树”模式下发送前，请先选择基础分支。 | 补精确词条（原模板误配） |
| `Select ref` | 选择引用 | 补精确词条（原模板误配） |
| `Send a message to continue` | 发送消息以继续 | 补精确词条（原模板误配） |
| `Settings · {0}` | 设置 · {0} |  |
| `Show linked pull requests` | 显示关联的拉取请求 | 补精确词条（原模板误配） |
| `Some requests are slow` | 部分请求响应缓慢 |  |
| `Start a new chat to change models` | 新建对话以更换模型 | 补精确词条（原模板误配） |
| `Start a new chat to switch providers` | 新建对话以切换服务提供方 | 补精确词条（原模板误配） |
| `Start the matching WSL backend, then choose the folder again.` | 请启动对应的 WSL 后端，然后重新选择文件夹。 |  |
| `Sync ref` | 同步引用 |  |
| `Terminal process running` | 终端进程正在运行 | 值用途放行配套译文 |
| `TestFlight beta` | TestFlight 测试版 |  |
| `TestFlight beta link` | TestFlight 测试版链接 |  |
| `The clone failed.` | 克隆失败。 |  |
| `The composer is not ready` | 输入框尚未就绪 | 补精确词条（原模板误配） |
| `The file could not be loaded. It may have been moved or deleted.` | 无法加载文件，它可能已被移动或删除。 |  |
| `The fork was created, but its thread data did not reach this client. Reconnect and try opening it from the sidebar.` | 分叉已创建，但其任务数据未同步到此客户端。请重新连接，然后尝试从侧栏打开。 | 补精确词条（原模板误配） |
| `The preview could not be opened.` | 无法打开预览。 |  |
| `The previous request may already be running. Check its thread first. Allow another send that could create a duplicate thread?` | 上一个请求可能已在运行，请先查看对应任务。仍要再次发送吗？这可能会创建重复的任务。 |  |
| `This Mac has Apple Silicon, but T3 Code is still running the Intel build under Rosetta. Download the available update to switch to the native Apple Silicon build.` | 这台 Mac 使用 Apple 芯片，但 T3 Code 仍在 Rosetta 下运行 Intel 版本。请下载可用更新以切换到原生 Apple 芯片版本。 | 补精确词条（原模板误配） |
| `This Mac has Apple Silicon, but T3 Code is still running the Intel build under Rosetta. Restart to install the downloaded Apple Silicon build.` | 这台 Mac 使用 Apple 芯片，但 T3 Code 仍在 Rosetta 下运行 Intel 版本。重新启动即可安装已下载的 Apple 芯片版本。 | 补精确词条（原模板误配） |
| `This Mac has Apple Silicon, but T3 Code is still running the Intel build under Rosetta. The next app update will replace it with the native Apple Silicon build.` | 这台 Mac 使用 Apple 芯片，但 T3 Code 仍在 Rosetta 下运行 Intel 版本。下次应用更新会将其替换为原生 Apple 芯片版本。 | 补精确词条（原模板误配） |
| `This action will commit and push changes on "{branch}". You can continue on this ref or create a feature ref and run the same action there.` | 此操作会在“{branch}”上提交并推送更改。你可以继续使用此引用，也可以创建功能引用后执行相同操作。 | 运行时变体，对应源码 `This action will …{0}` |
| `This action will commit and push changes{0}` | 此操作将提交并推送更改{0} | 补精确词条（原模板误配） |
| `This action will commit, push, and create a {0}{1}` | 此操作将提交、推送并创建{0}{1} | 补精确词条（原模板误配） |
| `This action will commit, push, and create a {request} on "{branch}". You can continue on this ref or create a feature ref and run the same action there.` | 此操作会在“{branch}”上提交、推送并创建{request}。你可以继续使用此引用，也可以创建功能引用后执行相同操作。 | 运行时变体，对应源码 `This action will …{0}` |
| `This action will push local commits and create a {0}{1}` | 此操作将推送本地提交并创建{0}{1} | 补精确词条（原模板误配） |
| `This action will push local commits and create a {request} on "{branch}". You can continue on this ref or create a feature ref and run the same action there.` | 此操作会推送“{branch}”上的本地提交并创建{request}。你可以继续使用此引用，也可以创建功能引用后执行相同操作。 | 运行时变体，对应源码 `This action will …{0}` |
| `This action will push local commits on "{branch}". You can continue on this ref or create a feature ref and run the same action there.` | 此操作会推送“{branch}”上的本地提交。你可以继续使用此引用，也可以创建功能引用后执行相同操作。 | 运行时变体，对应源码 `This action will …{0}` |
| `This action will push local commits{0}` | 此操作将推送本地提交{0} |  |
| `This install is using the correct architecture.` | 当前安装使用的是正确的架构。 | 补精确词条（原模板误配） |
| `This provider does not allow switching models after a conversation has started.` | 此服务提供方不允许在对话开始后切换模型。 |  |
| `This provider does not support reverting conversation history. Start a new thread instead.` | 此服务提供方不支持回退对话历史，请改为新建任务。 |  |
| `This thread does not support switching providers after it has started.` | 此任务开始后不支持切换服务提供方。 |  |
| `Thread action failed` | 任务操作失败 |  |
| `Thread no longer available` | 任务已不可用 |  |
| `Thread woke from snooze` | 任务已从暂缓中唤醒 |  |
| `Thread, {0}` | 任务，{0} |  |
| `Threads` | 任务 |  |
| `Tip` | 提示 |  |
| `Toggle theme editor` | 切换主题编辑器 |  |
| `Try again.` | 请重试。 |  |
| `Try citing the selection after the connection or pending input is resolved.` | 请在连接恢复或待处理输入完成后再引用所选内容。 | 补精确词条（原模板误配） |
| `Unable to open browser` | 无法打开浏览器 | 补精确词条（原模板误配） |
| `Unable to open link` | 无法打开链接 | 补精确词条（原模板误配） |
| `Unable to open link in browser` | 无法在浏览器中打开链接 | 补精确词条（原模板误配） |
| `Unable to open preview` | 无法打开预览 | 补精确词条（原模板误配） |
| `Unable to open release notes` | 无法打开发行说明 | 补精确词条（原模板误配） |
| `Unable to run command` | 无法运行命令 | 补精确词条（原模板误配） |
| `Unable to update the thread pull request` | 无法更新任务的拉取请求 | 补精确词条（原模板误配） |
| `Uncommitted` | 未提交 |  |
| `Unknown error removing project.` | 移除项目时发生未知错误。 |  |
| `Unlinked {count} pull requests` | 已取消关联 {count} 个拉取请求 | 运行时变体，对应源码 `Linked pull requests` |
| `Unpin` | 取消置顶 |  |
| `Unpin ({0})` | 取消置顶（{0}） |  |
| `Update downloaded` | 更新已下载 |  |
| `Update the T3 Code desktop app that runs the {0}? It will close and relaunch on that machine.` | 要更新运行 {0} 的 T3 Code 桌面应用吗？它将在该设备上关闭并重新启动。 | 补精确词条（原模板误配） |
| `Update the T3 Code desktop apps on {0}? They will close and relaunch on those machines.` | 要更新 {0} 上的 T3 Code 桌面应用吗？它们将在这些设备上关闭并重新启动。 | 补精确词条（原模板误配） |
| `Update this server before starting multiple models.` | 请先更新此服务器，再启动多个模型。 | 补精确词条（原模板误配） |
| `Updating provider` | 正在更新服务提供方 | 补精确词条（原模板误配） |
| `Updating providers` | 正在更新服务提供方 | 补精确词条（原模板误配） |
| `Updating {0} providers` | 正在更新 {0} 个服务提供方 | 补精确词条（原模板误配） |
| `Usage limit reached` | 已达到用量限额 |  |
| `Usage limits are unavailable for this provider` | 此服务提供方不提供用量限额信息 | 补精确词条（原模板误配） |
| `Use the same Google account for both steps. Step 2 can take up to an hour to work after you join the group.` | 两个步骤请使用同一个 Google 账户。加入群组后，第 2 步最多可能需要一小时才会生效。 | 补精确词条（原模板误配） |
| `Wait for attachments to finish uploading, or remove failed uploads.` | 请等待附件上传完成，或移除上传失败的附件。 | 补精确词条（原模板误配） |
| `Wake` | 唤醒 |  |
| `Watch an iOS Simulator or Android Emulator.` | 查看 iOS 模拟器或 Android 模拟器。 |  |
| `Watching {count} pull requests` | 正在关注 {count} 个拉取请求 | 运行时变体，对应源码 `Linked pull requests` |
| `Windows-style paths are only supported on Windows.` | Windows 风格的路径仅在 Windows 上受支持。 | 补精确词条（原模板误配） |
| `Workstation` | 工作站 |  |
| `Your newer draft is unchanged. Restore the failed prompt when this composer is empty.` | 你较新的草稿未更改。请在输入框为空时再恢复发送失败的提示词。 | 补精确词条（原模板误配） |
| `Your signed-in server` | 你已登录的服务器 |  |
| `Your unsaved edit was discarded.` | 未保存的编辑已丢弃。 |  |
| `Your unsaved edit was kept in the composer.` | 未保存的编辑已保留在输入框中。 |  |
| `chain` | 链 |  |
| `stack` | 堆栈 |  |
| `to clear. Shortcuts are environment-wide. Projects using the same action share its shortcut.` | 清除。快捷键在整个环境中生效，使用同一操作的项目共享该快捷键。 |  |
| `tomorrow {0}` | 明天 {0} |  |
| `{0} (Enter)` | {0}（Enter） |  |
| `{0} (Local)` | {0}（本地） |  |
| `{0} (setup)` | {0}（初始化） |  |
| `{0} copied` | {0} 已复制 |  |
| `{0} failed to update. Check provider settings for details.` | {0} 更新失败，详情请查看服务提供方设置。 | 补精确词条（原模板误配） |
| `{0} omitted from message` | 已从消息中省略 {0} |  |
| `{0} provider updates failed` | {0} 个服务提供方更新失败 |  |
| `{0} providers still need updates` | {0} 个服务提供方仍需更新 |  |
| `{0} request{1} waiting longer than {2}s.` | {0} 个请求{1}的等待时间已超过 {2} 秒。 |  |
| `{0} still needs an update` | {0} 仍需更新 |  |
| `{0} template` | {0} 模板 |  |
| `{0} terminal {1} running` | {0} 个终端{1}正在运行 |  |
| `{0} update failed` | {0} 更新失败 |  |
| `{0} update in progress.` | {0} 正在更新。 |  |
| `{0} updated: {1}` | {0} 已更新：{1} |  |
| `{0} updates are in progress.` | {0} 正在更新。 |  |
| `{0} won't be sent` | {0} 不会发送 |  |
| `{0} {1} outdated. Check provider settings for details.` | {0} {1} 过旧，详情请查看服务提供方设置。 | 补精确词条（原模板误配） |
| `{0} {1} outdated. Review provider settings for details.` | {0} {1} 过旧，详情请查看服务提供方设置。 | 补精确词条（原模板误配） |
| `{0} {1} update failed` | {0} {1} 更新失败 |  |
| `{0}m {1}s` | {0} 分 {1} 秒 |  |
| `{0}s` | {0} 秒 |  |
| `{count} request waiting longer than {seconds}s.` | {count} 个请求的等待时间已超过 {seconds} 秒。 | 运行时变体，对应源码 `{0} request{1} waiting longer than {2}s.` |
| `{count} requests waiting longer than {seconds}s.` | {count} 个请求的等待时间已超过 {seconds} 秒。 | 运行时变体，对应源码 `{0} request{1} waiting longer than {2}s.` |
| `{count} terminal process running` | 有 {count} 个终端进程正在运行 | 运行时变体，对应源码 `Terminal process running` |
| `{count} terminal processes running` | 有 {count} 个终端进程正在运行 | 运行时变体，对应源码 `{0} terminal {1} running` |
| `{providers} still appear outdated. Check provider settings for details.` | {providers} 似乎仍未更新，详情请查看服务提供方设置。 | 运行时变体，对应源码 `{0} {1} outdated. Check provider settings for details.` |
| `{providers} still appear outdated. Review provider settings for details.` | {providers} 似乎仍未更新，详情请查看服务提供方设置。 | 运行时变体，对应源码 `{0} {1} outdated. Review provider settings for details.` |
| `{providers} still appears outdated. Check provider settings for details.` | {providers} 似乎仍未更新，详情请查看服务提供方设置。 | 运行时变体，对应源码 `{0} {1} outdated. Check provider settings for details.` |
| `{providers} still appears outdated. Review provider settings for details.` | {providers} 似乎仍未更新，详情请查看服务提供方设置。 | 运行时变体，对应源码 `{0} {1} outdated. Review provider settings for details.` |

### apps/web/src/hooks（8）

| 英文 | 中文 | 备注 |
|---|---|---|
| `Could not remove {0}. {1}` | 无法移除 {0}。{1} |  |
| `Failed to delete worktree` | 删除工作树失败 | 补精确词条（原模板误配） |
| `Failed to remove project` | 移除项目失败 | 值用途放行配套译文 |
| `Failed to undo archive` | 撤销归档失败 | 补精确词条（原模板误配） |
| `Failed to undo settle` | 撤销收起失败 | 补精确词条（原模板误配） |
| `Failed to undo unpin` | 撤销取消置顶失败 | 补精确词条（原模板误配） |
| `Thread deleted, but navigation failed` | 任务已删除，但跳转失败 |  |
| `Worktree deleted, but Git status refresh failed` | 工作树已删除，但 Git 状态刷新失败 |  |

### apps/web/src/lib（5）

| 英文 | 中文 | 备注 |
|---|---|---|
| `Failed to restore draft` | 恢复草稿失败 | 补精确词条（原模板误配） |
| `Unable to open pull request link` | 无法打开拉取请求链接 | 补精确词条（原模板误配） |
| `line {0}` | 第 {0} 行 |  |
| `lines {0}-{1}` | 第 {0}-{1} 行 |  |
| `{0}{1} pull request` | {0}{1} 拉取请求 |  |

### apps/web/src/routes（10）

| 英文 | 中文 | 备注 |
|---|---|---|
| `An unexpected router error occurred.` | 发生了意外的路由错误。 |  |
| `Blocked on me` | 等待我处理 | 补精确词条（原模板误配） |
| `Failed to copy PR link` | 复制 PR 链接失败 | 补精确词条（原模板误配） |
| `Invalid keybindings configuration` | 快捷键配置无效 |  |
| `Keybindings configuration reloaded successfully.` | 快捷键配置已重新加载。 |  |
| `Keybindings updated` | 快捷键已更新 | 补精确词条（原模板误配） |
| `Open T3 Code in the desktop app to use the in-app preview.` | 请在桌面应用中打开 T3 Code 以使用应用内预览。 | 补精确词条（原模板误配） |
| `PR link copied` | PR 链接已复制 |  |
| `Preview is desktop-only` | 预览仅限桌面版 | 补精确词条（原模板误配） |
| `Unknown error opening file.` | 打开文件时发生未知错误。 |  |

### apps/web/src/state（5）

| 英文 | 中文 | 备注 |
|---|---|---|
| `Initializing repository` | 正在初始化仓库 | 补精确词条（原模板误配） |
| `Preparing pull request thread` | 正在准备拉取请求任务 |  |
| `Publishing repository` | 正在发布仓库 | 补精确词条（原模板误配） |
| `Pulling latest changes...` | 正在拉取最新更改... |  |
| `The environment request failed.` | 环境请求失败。 |  |

### apps/web/src（根目录）（88）

| 英文 | 中文 | 备注 |
|---|---|---|
| `Amber` | 琥珀色 |  |
| `Answered questions` | 已回答问题 |  |
| `Approval requested` | 已请求批准 |  |
| `Blue` | 蓝色 |  |
| `Books` | 书籍 |  |
| `Brain` | 大脑 |  |
| `Changed {0}` | 已更改 {0} |  |
| `Changed {count} file` | 已更改 {count} 个文件 | 运行时变体，对应源码 `Changed {0}` |
| `Changed {count} files` | 已更改 {count} 个文件 | 运行时变体，对应源码 `Changed {0} files` |
| `Chart` | 图表 |  |
| `Checkpoint captured` | 已创建检查点 |  |
| `Cloud` | 云 |  |
| `Could not open file` | 无法打开文件 | 补精确词条（原模板误配） |
| `Could not open in {0}` | 无法在 {0} 中打开 |  |
| `Cyan` | 青色 |  |
| `Database` | 数据库 |  |
| `Emerald` | 翠绿色 |  |
| `Expires in a moment` | 即将过期 |  |
| `Expires in {0}` | {0} 后过期 |  |
| `Expires in {0}d` | {0} 天后过期 |  |
| `Expires in {0}d {1}` | {0} 天 {1} 后过期 |  |
| `Expires in {0}d {1}h` | {0} 天 {1} 小时后过期 | 运行时变体，对应源码 `Expires in {0}m` |
| `Expires in {0}d {1}h {2}m` | {0} 天 {1} 小时 {2} 分钟后过期 | 运行时变体，对应源码 `Expires in {0}m` |
| `Expires in {0}d {1}h {2}m {3}s` | {0} 天 {1} 小时 {2} 分 {3} 秒后过期 | 运行时变体，对应源码 `Expires in {0}m` |
| `Expires in {0}d {1}h {2}s` | {0} 天 {1} 小时 {2} 秒后过期 | 运行时变体，对应源码 `Expires in {0}m` |
| `Expires in {0}d {1}m` | {0} 天 {1} 分钟后过期 | 运行时变体，对应源码 `Expires in {0}m` |
| `Expires in {0}d {1}m {2}s` | {0} 天 {1} 分 {2} 秒后过期 | 运行时变体，对应源码 `Expires in {0}m` |
| `Expires in {0}d {1}s` | {0} 天 {1} 秒后过期 | 运行时变体，对应源码 `Expires in {0}m` |
| `Expires in {0}h` | {0} 小时后过期 | 运行时变体，对应源码 `Expires in {0}m` |
| `Expires in {0}h {1}m` | {0} 小时 {1} 分钟后过期 | 运行时变体，对应源码 `Expires in {0}m` |
| `Expires in {0}h {1}m {2}s` | {0} 小时 {1} 分 {2} 秒后过期 | 运行时变体，对应源码 `Expires in {0}m` |
| `Expires in {0}h {1}s` | {0} 小时 {1} 秒后过期 | 运行时变体，对应源码 `Expires in {0}m` |
| `Expires in {0}m` | {0} 分钟后过期 | 补精确词条（原模板误配） |
| `Expires in {0}m {1}s` | {0} 分 {1} 秒后过期 |  |
| `Expires in {0}s` | {0} 秒后过期 |  |
| `Fire` | 火焰 |  |
| `Fuchsia` | 品红色 |  |
| `Game` | 游戏 |  |
| `Gear` | 齿轮 |  |
| `Gray` | 灰色 |  |
| `Green` | 绿色 |  |
| `Idea` | 灵感 |  |
| `Implement plan` | 实施方案 |  |
| `Implement {0}` | 实施 {0} |  |
| `Indigo` | 靛蓝色 |  |
| `Input requested` | 已请求输入 |  |
| `Keyboard` | 键盘 |  |
| `Lightning` | 闪电 |  |
| `Lime` | 青柠色 |  |
| `Loading messages...` | 正在加载消息... | 补精确词条（原模板误配） |
| `Lock` | 锁 |  |
| `Mobile` | 移动端 |  |
| `Movie` | 电影 |  |
| `Music` | 音乐 |  |
| `Octopus` | 章鱼 |  |
| `Open with` | 打开方式 |  |
| `Orange` | 橙色 |  |
| `Package` | 包裹 |  |
| `Picture` | 图片 |  |
| `Pink` | 粉色 |  |
| `Provider error` | 服务提供方错误 |  |
| `Purple` | 紫色 |  |
| `Puzzle` | 拼图 |  |
| `Ran command` | 已运行命令 |  |
| `Ran {count} command` | 已运行 {count} 条命令 | 运行时变体，对应源码 `Ran command` |
| `Red` | 红色 |  |
| `Robot` | 机器人 |  |
| `Rocket` | 火箭 |  |
| `Rose` | 玫瑰色 |  |
| `Searched files` | 已搜索文件 | 补精确词条（原模板误配） |
| `Searched the web` | 已搜索网页 |  |
| `Seedling` | 幼苗 |  |
| `Shopping` | 购物 |  |
| `Sky` | 天蓝色 |  |
| `Sparkles` | 闪光 |  |
| `Syncing messages...` | 正在同步消息... |  |
| `Teal` | 蓝绿色 |  |
| `Test tube` | 试管 |  |
| `Thread` | 任务 |  |
| `Tool call` | 工具调用 |  |
| `Unicorn` | 独角兽 |  |
| `Version mismatch. Try syncing the client and server to the same T3 Code version.` | 版本不一致。请将客户端和服务器同步到相同的 T3 Code 版本。 | 补精确词条（原模板误配） |
| `Violet` | 紫罗兰色 |  |
| `Web` | 网页 |  |
| `Yellow` | 黄色 |  |
| `tomorrow at {0}` | 明天 {0} |  |
| `yesterday at {0}` | 昨天 {0} |  |
| `{0}d` | {0} 天 |  |

### packages/client-runtime（98）

| 英文 | 中文 | 备注 |
|---|---|---|
| `'{0}' exceeds the {1} attachment limit.` | “{0}”超出了 {1} 的附件大小限制。 |  |
| `Add an "origin" remote before pushing or creating a PR.` | 推送或创建 PR 前，请先添加名为“origin”的远程仓库。 |  |
| `Another voice recording is already active.` | 已有其他录音正在进行。 | 补精确词条（原模板误配） |
| `Book` | 书本 |  |
| `Changed {0} {1}` | 已更改 {0} {1} |  |
| `Checked linked pull requests {0} times` | 已检查关联的拉取请求 {0} 次 | 补精确词条（原模板误配） |
| `Commit, push & PR` | 提交、推送并创建 PR | 补精确词条（原模板误配） |
| `Commit, push & create PR` | 提交、推送并创建 PR | 补精确词条（原模板误配） |
| `Commit, push & create PR from default branch?` | 从默认分支提交、推送并创建 PR？ | 补精确词条（原模板误配） |
| `Compacting context` | 正在压缩上下文 |  |
| `Connection failed. Reason: {0}` | 连接失败。原因：{0} |  |
| `Context compacted {0} → {1} tokens` | 上下文已压缩：{0} → {1} Token |  |
| `Could not finish voice recording.` | 无法完成录音。 |  |
| `Could not load earlier activity.` | 无法加载更早的活动。 |  |
| `Could not prepare voice transcription.` | 无法准备语音转写。 |  |
| `Could not start voice recording.` | 无法开始录音。 | 补精确词条（原模板误配） |
| `Could not synchronize the thread.` | 无法同步任务。 |  |
| `Could not transcribe this recording.` | 无法转写此录音。 |  |
| `Create PR` | 创建 PR | 补精确词条（原模板误配） |
| `Create and checkout a branch before pushing or opening a PR.` | 推送或创建 PR 前，请先创建并检出一个分支。 | 补精确词条（原模板误配） |
| `Created {0} {1}` | 已创建 {0} {1} | 补精确词条（原模板误配） |
| `Created {count} threads` | 已创建 {count} 个任务 | 运行时变体，对应源码 `Created {0} {1}` |
| `Failed to connect. Reconnecting...` | 连接失败，正在重新连接... | 补精确词条（原模板误配） |
| `Failed to connect. Reconnecting... Reason: {0}` | 连接失败，正在重新连接... 原因：{0} | 补精确词条（原模板误配） |
| `File` | 文件 | 值用途放行配套译文 |
| `Interrupted` | 已中断 | 值用途放行配套译文 |
| `Linked {0} {1}` | 已关联 {0} {1} |  |
| `Microphone access is required for voice input.` | 语音输入需要麦克风权限。 | 补精确词条（原模板误配） |
| `No speech was detected.` | 未检测到语音。 |  |
| `Provider status unavailable. Open Source Control settings and rescan.` | 服务提供方状态不可用。请打开源代码管理设置并重新扫描。 | 补精确词条（原模板误配） |
| `Push & create PR` | 推送并创建 PR | 补精确词条（原模板误配） |
| `Push & create PR from default branch?` | 从默认分支推送并创建 PR？ | 补精确词条（原模板误配） |
| `Ran {0} {1}` | 已运行 {0} {1} |  |
| `Ran {count} commands` | 已运行 {count} 条命令 | 运行时变体，对应源码 `Ran {0} {1}` |
| `Read {0} {1}` | 已读取 {0} {1} |  |
| `Read {count} files` | 已读取 {count} 个文件 | 运行时变体，对应源码 `Read {0} {1}` |
| `Read {path}` | 已读取 {path} | 运行时变体，对应源码 `Read {0} {1}` |
| `Read {path} +{count} more` | 已读取 {path} 及另外 {count} 个 | 运行时变体，对应源码 `Read {0} {1}` |
| `Received {0} {1}` | 已收到 {0} {1} |  |
| `Received {count} update` | 已收到 {count} 条更新 | 运行时变体，对应源码 `Received {0} {1}` |
| `Received {count} updates` | 已收到 {count} 条更新 | 运行时变体，对应源码 `Received {0} {1}` |
| `Relay cannot provision the managed endpoint ({0}).` | 中继无法配置托管端点（{0}）。 |  |
| `Relay could not link the environment ({0}).` | 中继无法关联环境（{0}）。 |  |
| `Relay could not reach the environment endpoint ({0}).` | 中继无法访问环境端点（{0}）。 |  |
| `Relay encountered an internal error ({0}).` | 中继发生内部错误（{0}）。 |  |
| `Relay has no active link for this environment. The environment server may not have re-established its link yet.` | 中继没有此环境的有效关联。环境服务器可能尚未重新建立关联。 | 补精确词条（原模板误配） |
| `Relay refused the link: this account already has its maximum of {0} managed tunnels. Unlink an environment to free one up.` | 中继拒绝了关联：此账户的托管隧道已达上限 {0} 个。请取消关联一个环境以释放名额。 | 补精确词条（原模板误配） |
| `Relay rejected an expired agent activity publish proof.` | 中继拒绝了已过期的 Agent 动态发布凭证。 |  |
| `Relay rejected an expired environment link proof.` | 中继拒绝了已过期的环境关联凭证。 |  |
| `Relay rejected the agent activity publish proof ({0}).` | 中继拒绝了 Agent 动态发布凭证（{0}）。 |  |
| `Relay rejected the authenticated request.` | 中继拒绝了已认证的请求。 |  |
| `Relay rejected the cloud session token.` | 中继拒绝了云端会话令牌。 |  |
| `Relay rejected the environment connection request ({0}).` | 中继拒绝了环境连接请求（{0}）。 |  |
| `Relay rejected the environment connection request.` | 中继拒绝了环境连接请求。 |  |
| `Relay rejected the environment link proof ({0}).` | 中继拒绝了环境关联凭证（{0}）。 |  |
| `Relay timed out while contacting the environment endpoint.` | 中继连接环境端点时超时。 |  |
| `Running {0}...` | 正在运行 {0}... |  |
| `Searched code {0} {1}` | 已搜索代码 {0} {1} |  |
| `Searched code {count} time` | 已搜索代码 {count} 次 | 运行时变体，对应源码 `Searched code {0} {1}` |
| `Searched code {count} times` | 已搜索代码 {count} 次 | 运行时变体，对应源码 `Searched code {0} {1}` |
| `Searched the web {0} {1}` | 已搜索网页 {0} {1} |  |
| `Searched the web {count} time` | 已搜索网页 {count} 次 | 运行时变体，对应源码 `Searched the web {0} {1}` |
| `Searched the web {count} times` | 已搜索网页 {count} 次 | 运行时变体，对应源码 `Searched the web {0} {1}` |
| `Stopped watching {0} {1}` | 已停止关注 {0} {1} |  |
| `Stopped watching {count} pull requests` | 已停止关注 {count} 个拉取请求 | 运行时变体，对应源码 `Stopped watching {0} {1}` |
| `Tent` | 帐篷 |  |
| `The draft changed while voice input was running. The transcript was not added.` | 语音输入期间草稿已更改，转写内容未添加。 |  |
| `This action will commit, push, and create a PR on "{branch}". You can continue on this branch or create a feature branch and run the same action there.` | 此操作会在“{branch}”上提交、推送并创建 PR。你可以继续使用此分支，也可以创建功能分支后执行相同操作。 | 运行时变体，对应源码 `This action will …{0}` |
| `This action will commit, push, and create a PR{0}` | 此操作将提交、推送并创建 PR{0} | 补精确词条（原模板误配） |
| `This action will push local commits and create a PR on "{branch}". You can continue on this branch or create a feature branch and run the same action there.` | 此操作会推送“{branch}”上的本地提交并创建 PR。你可以继续使用此分支，也可以创建功能分支后执行相同操作。 | 运行时变体，对应源码 `This action will …{0}` |
| `This action will push local commits and create a PR{0}` | 此操作将推送本地提交并创建 PR{0} | 补精确词条（原模板误配） |
| `This action will push local commits on "{branch}". You can continue on this branch or create a feature branch and run the same action there.` | 此操作会推送“{branch}”上的本地提交。你可以继续使用此分支，也可以创建功能分支后执行相同操作。 | 运行时变体，对应源码 `This action will …{0}` |
| `This draft is no longer available.` | 此草稿已不可用。 | 补精确词条（原模板误配） |
| `Thought (×{0})` | 思考（×{0}） |  |
| `Unlinked {0} {1}` | 已取消关联 {0} {1} |  |
| `Used browser {0} {1}` | 已使用浏览器 {0} {1} |  |
| `Used browser {count} time` | 已使用浏览器 {count} 次 | 运行时变体，对应源码 `Used browser {0} {1}` |
| `Used browser {count} times` | 已使用浏览器 {count} 次 | 运行时变体，对应源码 `Used browser {0} {1}` |
| `Used device controls {0} {1}` | 已使用设备控制 {0} {1} |  |
| `Used device controls {count} time` | 已使用设备控制 {count} 次 | 运行时变体，对应源码 `Used device controls {0} {1}` |
| `Used device controls {count} times` | 已使用设备控制 {count} 次 | 运行时变体，对应源码 `Used device controls {0} {1}` |
| `Used {0} {1}` | 已使用 {0} {1} |  |
| `Used {count} tool` | 已使用 {count} 个工具 | 运行时变体，对应源码 `Used {0} {1}` |
| `Used {count} tools` | 已使用 {count} 个工具 | 运行时变体，对应源码 `Used {0} {1}` |
| `View PR` | 查看 PR | 补精确词条（原模板误配） |
| `Voice input stopped when the app moved to the background.` | 应用转入后台时，语音输入已停止。 | 补精确词条（原模板误配） |
| `Voice transcription is not available for this language.` | 此语言不支持语音转写。 | 补精确词条（原模板误配） |
| `Voice transcription is not available.` | 语音转写不可用。 | 补精确词条（原模板误配） |
| `Voice transcription is still finishing. Try again shortly.` | 语音转写仍在完成中，请稍后重试。 | 补精确词条（原模板误配） |
| `Watching {0} {1}` | 正在关注 {0} {1} |  |
| `{0} config subscription ended.` | {0} 配置订阅已结束。 |  |
| `{0} done` | {0} 个已完成 |  |
| `{0} in {1}` | {0}，用时 {1} |  |
| `{0} is not authenticated. Open Source Control settings for setup guidance.` | {0} 未认证。请打开源代码管理设置查看设置指引。 | 补精确词条（原模板误配） |
| `{0} of {1} agents working` | {1} 个 Agent 中有 {0} 个正在运行 | 补精确词条（原模板误配） |
| `{0} {1} done` | {0} {1} 已完成 |  |
| `{count} agent done` | {count} 个 Agent 已完成 | 运行时变体，对应源码 `{0} done` |
| `{count} agents done` | {count} 个 Agent 已完成 | 运行时变体，对应源码 `{0} done` |

### packages/contracts（36）

| 英文 | 中文 | 备注 |
|---|---|---|
| `API key` | API 密钥 |  |
| `Additional CLI arguments passed to pi --mode rpc on session start.` | 会话启动时传递给 pi --mode rpc 的额外 CLI 参数。 | 补精确词条（原模板误配） |
| `Agent identifier from the official ACP Registry, for example 'devin'.` | 官方 ACP 注册表中的 Agent 标识符，例如 'devin'。 | 补精确词条（原模板误配） |
| `Authentication method` | 认证方式 |  |
| `Check out files` | 检出文件 | 补精确词条（原模板误配） |
| `Checking out files` | 正在检出文件 | 补精确词条（原模板误配） |
| `Counting objects` | 对象计数中 |  |
| `Custom ACP executable. Leave empty to select automatically.` | 自定义 ACP 可执行文件。留空则自动选择。 | 补精确词条（原模板误配） |
| `Executable override` | 可执行文件覆盖 |  |
| `Fetch base branch` | 获取基础分支 |  |
| `File Manager` | 文件管理器 |  |
| `GCP location` | GCP 位置 |  |
| `GCP project` | GCP 项目 |  |
| `Gemini API key` | Gemini API 密钥 |  |
| `Gemini or Vertex AI express key. Stored in plain text.` | Gemini 或 Vertex AI Express 模式密钥，以明文存储。 |  |
| `Google accounts use your subscription; API keys and Agent Platform bill usage.` | Google 账户使用你的订阅；API 密钥和 Agent Platform 按用量计费。 | 补精确词条（原模板误配） |
| `Init submodules` | 初始化子模块 |  |
| `Installing {0} {1}…` | 正在安装 {0} {1}… |  |
| `Installing {0}…` | 正在安装 {0}… |  |
| `Optional ACP authentication method ID. By default, the first agent-managed method is selected.` | 可选的 ACP 认证方式 ID。默认选择第一个由 Agent 管理的方式。 | 补精确词条（原模板误配） |
| `Optional local executable to use instead of installing the registry distribution. Registry arguments and environment are still applied.` | 可选的本地可执行文件，用于替代安装注册表发行版。注册表中的参数和环境变量仍会生效。 | 补精确词条（原模板误配） |
| `Path to the Claude binary used by this instance.` | 此实例使用的 Claude 程序路径。 | 补精确词条（原模板误配） |
| `Path to the Codex binary used by this instance.` | 此实例使用的 Codex 程序路径。 | 补精确词条（原模板误配） |
| `Path to the Grok CLI binary.` | Grok CLI 程序路径。 | 补精确词条（原模板误配） |
| `Path to the OpenCode binary.` | OpenCode 程序路径。 | 补精确词条（原模板误配） |
| `Path to the Pi coding agent binary.` | Pi 编程 Agent 程序路径。 | 补精确词条（原模板误配） |
| `Receiving objects` | 接收对象中 |  |
| `Region for Gemini Enterprise or Agent Platform.` | Gemini Enterprise 或 Agent Platform 的区域。 | 补精确词条（原模板误配） |
| `Registry agent ID` | 注册表 Agent ID |  |
| `Registry default` | 注册表默认值 |  |
| `Required for Gemini Enterprise. Agent Platform uses it when no API key is set.` | Gemini Enterprise 必填。未设置 API 密钥时，Agent Platform 会使用此项。 | 补精确词条（原模板误配） |
| `Resolving deltas` | 处理 delta 中 |  |
| `Run setup script` | 运行初始化脚本 | 补精确词条（原模板误配） |
| `Start agent` | 启动 Agent |  |
| `Updating {0} from {1} to {2}…` | 正在将 {0} 从 {1} 更新到 {2}… | 补精确词条（原模板误配） |
| `e.g. --chrome` | 例如 --chrome |  |

### packages/shared（42）

| 英文 | 中文 | 备注 |
|---|---|---|
| `0ms` | 0 毫秒 | 值用途放行配套译文 |
| `10s` | 10 秒 |  |
| `Assets` | 资源 |  |
| `Changed files` | 已更改的文件 | 补精确词条（原模板误配） |
| `Claude, GPT, and Gemini use this pool. Grok and Composer fall back here.` | Claude、GPT 和 Gemini 使用此额度池。Grok 和 Composer 会回退到这里。 | 补精确词条（原模板误配） |
| `Combined usage across both allowances, not a third quota.` | 两项额度的合计用量，并非第三项配额。 |  |
| `Cursor Models` | Cursor 模型 |  |
| `Daily at {time}` | 每天 {time} | 运行时变体，对应源码 `{0}⏎  at {1}{2}` |
| `Expected exactly one schema member to match` | 应恰好匹配一个 Schema 成员 | 补精确词条（原模板误配） |
| `Forbidden operation` | 禁止的操作 |  |
| `Grok and Composer use this first. Auto can use either pool.` | Grok 和 Composer 优先使用此额度池。Auto 可使用任一额度池。 | 补精确词条（原模板误配） |
| `Invalid YAML (code={0}{1}).` | YAML 无效（code={0}{1}）。 |  |
| `Invalid YAML.` | YAML 无效。 |  |
| `Invalid type` | 类型无效 |  |
| `Invalid value` | 值无效 | 值用途放行配套译文 |
| `Missing key` | 缺少键 |  |
| `Other Models` | 其他模型 |  |
| `Overall` | 总计 |  |
| `Read file +{count} more` | 已读取文件及另外 {count} 个 | 运行时变体，对应源码 `Read file{0}` |
| `Read file{0}` | 已读取文件{0} |  |
| `Read {0}{1}` | 已读取 {0}{1} |  |
| `Read {count} file` | 已读取 {count} 个文件 | 运行时变体，对应源码 `Read file{0}` |
| `Schema validation failed (failureCount={0}, defectCount={1}, interruptionCount={2}).` | Schema 校验失败（failureCount={0}，defectCount={1}，interruptionCount={2}）。 |  |
| `Searched files {0}` | 已搜索文件 {0} |  |
| `Searched files {0} in {1}` | 已在 {1} 中搜索文件 {0} |  |
| `Searched in {0}` | 已在 {0} 中搜索 |  |
| `Searched {0}` | 已搜索 {0} |  |
| `Searched {0} in {1}` | 已在 {1} 中搜索 {0} |  |
| `Show this provider's usage limits` | 显示此服务提供方的用量限额 | 补精确词条（原模板误配） |
| `Skill: {0}` | 技能：{0} |  |
| `Terminal {0}` | 终端 {0} |  |
| `This client is older than the server on {0}; its usage is excluded from totals.` | 此客户端版本低于 {0} 上的服务器，其用量未计入总计。 | 补精确词条（原模板误配） |
| `Unexpected key` | 意外的键 |  |
| `Weekdays at {time}` | 工作日 {time} | 运行时变体，对应源码 `{0}⏎  at {1}{2}` |
| `{0}⏎  at {1}{2}` | {0}⏎  位于 {1}{2} |  |
| `{0} requires Node.js. Install Node.js and make sure node is on PATH, then retry.` | {0} 需要 Node.js。请安装 Node.js 并确保 node 在 PATH 中，然后重试。 | 补精确词条（原模板误配） |
| `{0} today` | 今天 {0} |  |
| `{0} yesterday` | 昨天 {0} |  |
| `{0}d {1}h` | {0} 天 {1} 小时 |  |
| `{0}h {1}m {2}s` | {0} 小时 {1} 分 {2} 秒 | 运行时变体，对应源码 `formatDuration 的多单位组合` |
| `{0}h {1}s` | {0} 小时 {1} 秒 | 运行时变体，对应源码 `formatDuration 的多单位组合` |
| `{0}ms` | {0} 毫秒 |  |

## 2. 按原文保留的新增条目（译文 = 原文）

这些条目让运行时查表命中（报告不再计为未翻译、也不会再被宽模板误配），显示结果与原文相同。

### 2.1 产品名、型号、命令、按键名、单位缩写等（111）

`3D`、`Aa`、`Agent Platform (Vertex AI)`、`Alt`、`Android`、`Aqua`、`Asus Zenbook Fold`、`Azure DevOps`、`Bitbucket`、`CLion`、`CPU`、`Claude Code`、`Codex`、`Conventional Commits`、`Ctrl`、`Cursor`、`DataGrip`、`DataSpell`、`Down`、`Ember`、`Esc`、`Face ID`、`Forgejo / Gitea`、`Galaxy Z Fold 5`、`Gemini Enterprise`、`Git URL`、`GitHub`、`GitLab`、`GoLand`、`Grok Build`、`Grove`、`HEAD`、`HEX`、`HTTPS`、`Hub URL`、`INT`、`IntelliJ IDEA`、`Iris`、`Kiro`、`Linux/WSL`、`L{0}`、`Mac mini`、`Nest Hub Max`、`Nest Hub`、`Ocean`、`PID`、`PR`、`PhpStorm`、`Pixel 7`、`PyCharm`、`RGB`、`Rider`、`Right`、`RubyMine`、`RustRover`、`SF Mono`、`SF Pro`、`SSH {0}`、`SSH`、`Samsung Galaxy A51/71`、`Samsung Galaxy S20 Ultra`、`Samsung Galaxy S8+`、`Super`、`Surface Duo`、`Surface Pro 7`、`T3 Chat`、`T3 Code Desktop`、`T3 Code Web`、`T3 Code`、`T3 Connect`、`T3`、`Tailscale HTTPS`、`Trae`、`Up`、`VARIABLE_NAME`、`VS Code Insiders`、`VS Code`、`VSCodium`、`WSL · {0}`、`WSL`、`WebStorm`、`Zed`、`ab`、`bun test`、`ghost`、`iOS`、`iPad Air`、`iPad Mini`、`iPad Pro`、`iPhone 12 Pro`、`iPhone 14 Pro Max`、`iPhone SE`、`iPhone XR`、`iPhone`、`model-slug`、`my-project-id`、`npx t3 serve`、`optionId`、`origin`、`us-central1`、`v{0}`、`{0} B`、`{0} Enter`、`{0} KB`、`{0} MB`、`{0}B`、`{0}K`、`{0}M`、`{0}T`、`{0}b`、`{0}k`

### 2.2 contracts 里的 Schema 注解（提供给 Agent 的工具参数说明，不是界面文字）（136）

来自 `packages/contracts/src/` 的 `orchestratorMcp.ts`、`previewAutomation.ts`、`relay.ts`、`scheduledTask.ts`、`t3ProjectFile.ts`、`threadMetadataMcp.ts`、`worktreeMcp.ts` 和 `device.ts` 的 `.annotate({ description })`。web 端只用这些 Schema 解码请求，不显示这些说明；翻译它们只会改变工具 Schema 的元数据。按调度方「template-collision 一律补精确 messages 词条」的要求补了词条，取值为原文。建议 T03 把 Schema `annotate` 的 description 加进非显示位置（见第 8 节）。

<details><summary>展开清单</summary>

- `A project script that team members can import into T3 Code.`（packages/contracts/src/t3ProjectFile.ts:65）
- `Absolute filesystem path for the new worktree. Relative paths are rejected. Defaults to the server-managed worktrees directory.`（packages/contracts/src/worktreeMcp.ts:35）
- `Also power the simulator or emulator off. Defaults to false.`（packages/contracts/src/device.ts:546）
- `Await a returned Promise. Defaults to true.`（packages/contracts/src/previewAutomation.ts:433）
- `Boots the device if needed, starts its live stream, and opens the Device panel so the user can watch. Returns how to drive it with the agent-device CLI.`（packages/contracts/src/device.ts:499）
- `Branch name to create for the worktree (e.g. 'feature/my-change').`（packages/contracts/src/worktreeMcp.ts:15）
- `Branch or ref the worktree branch starts from. Defaults to the branch currently checked out in the project workspace.`（packages/contracts/src/worktreeMcp.ts:20）
- `Canonical HTTP(S) pull request URL, including self-hosted repository URLs.`（packages/contracts/src/threadMetadataMcp.ts:58）
- `Case-sensitive substring that must appear in visible document text.`（packages/contracts/src/previewAutomation.ts:458）
- `Checked-in project configuration for T3 Code (t3.json at the repository root). See https://t3.codes for documentation.`（packages/contracts/src/t3ProjectFile.ts:106）
- `Clear the existing input value before inserting text. Defaults to false.`（packages/contracts/src/previewAutomation.ts:344）
- `Clerk bearer token for the signed-in cloud user.`（packages/contracts/src/relay.ts:755）
- `Clicks one target. Provide exactly one of locator, selector, or the x/y coordinate pair.`（packages/contracts/src/previewAutomation.ts:328）
- `Compatibility-only JSON encoding of the schedule object. Prefer a structured object.`（packages/contracts/src/orchestratorMcp.ts:59）
- `Complete task or message text for the target agent.`（packages/contracts/src/orchestratorMcp.ts:41）
- `Configured provider instance id from orchestrator_capabilities.`（packages/contracts/src/orchestratorMcp.ts:102）
- `Current agent-awareness state, or null to remove the published state.`（packages/contracts/src/relay.ts:276）
- `Defaults to async. Use wait only when this turn needs the child's result before you can continue.`（packages/contracts/src/orchestratorMcp.ts:179）
- `Deprecated alias for clientProofKeyThumbprint.`（packages/contracts/src/relay.ts:722）
- `Deprecated alias for open. Whether to reveal the thread-bound inline preview to the human.`（packages/contracts/src/previewAutomation.ts:94）
- `Dev-server TCP port inside the current environment.`（packages/contracts/src/previewAutomation.ts:132）
- `Dev-server protocol. Defaults to http.`（packages/contracts/src/previewAutomation.ts:135）
- `Device from device_list. Omit to use the device most recently opened in this thread.`（packages/contracts/src/device.ts:519）
- `Device host from device_list. Defaults to local.`（packages/contracts/src/device.ts:495）
- `Device to close. Omit to close every device in this thread.`（packages/contracts/src/device.ts:540）
- `Direct website URL. {0}`（packages/contracts/src/previewAutomation.ts:123）
- `Display name for the script, shown in the T3 Code scripts menu.`（packages/contracts/src/t3ProjectFile.ts:30）
- `Emulated prefers-color-scheme for the page: light, dark, or system to follow the OS appearance.`（packages/contracts/src/previewAutomation.ts:268）
- `Emulates prefers-color-scheme in the active browser tab without changing the OS or app theme.`（packages/contracts/src/previewAutomation.ts:272）
- `Environment-signed JWT covering this published activity state.`（packages/contracts/src/relay.ts:279）
- `Environment-signed proof bound to a previously issued link challenge.`（packages/contracts/src/relay.ts:332）
- `Evaluates JavaScript in the page. Prefer snapshot and semantic actions; use evaluate for inspection or unsupported interactions.`（packages/contracts/src/previewAutomation.ts:443）
- `Exact collaborative browser tab to target. Omit to use this agent session's current tab.`（packages/contracts/src/previewAutomation.ts:55）
- `Fetch origin and start the worktree branch from the remote-tracking commit of baseRef instead of the local ref. Defaults to the server's 'new worktrees start from origin' setting.`（packages/contracts/src/worktreeMcp.ts:26）
- `Freeform viewport height in CSS pixels. Required only in freeform mode.`（packages/contracts/src/previewAutomation.ts:207）
- `Freeform viewport width in CSS pixels. Required only in freeform mode.`（packages/contracts/src/previewAutomation.ts:200）
- `Horizontal scroll delta in CSS pixels. Positive scrolls right. Defaults to 0.`（packages/contracts/src/previewAutomation.ts:387）
- `How new worktrees populate git submodules: "recursive" (the default) initializes nested submodules too, "top-level" initializes only those declared by this repository, and "none" leaves every submodule empty for a setup script to handle. A project or environment setting in T3 Code overrides this.`（packages/contracts/src/t3ProjectFile.ts:93）
- `Icon shown next to the script in the scripts menu. Defaults to "play".`（packages/contracts/src/t3ProjectFile.ts:37）
- `Interval in milliseconds, with a minimum of 60000 (one minute).`（packages/contracts/src/scheduledTask.ts:79）
- `JWK thumbprint that the minted environment credential must be bound to.`（packages/contracts/src/relay.ts:727）
- `Keyboard key name such as Enter, Escape, Tab, ArrowDown, Backspace, or a single character.`（packages/contracts/src/previewAutomation.ts:368）
- `Legacy CSS selector for a scrollable container. Omit to scroll the viewport.`（packages/contracts/src/previewAutomation.ts:396）
- `Legacy CSS selector for the input. Prefer locator.`（packages/contracts/src/previewAutomation.ts:336）
- `Legacy CSS selector such as button[type='submit']. Prefer locator for resilient role/text targeting.`（packages/contracts/src/previewAutomation.ts:290）
- `Legacy CSS selector that must match an element. Prefer locator.`（packages/contracts/src/previewAutomation.ts:450）
- `Links an authenticated cloud user to a T3 environment.`（packages/contracts/src/relay.ts:337）
- `Literal text to insert.`（packages/contracts/src/previewAutomation.ts:334）
- `Local wall-clock time in 24-hour HH:MM form, such as 09:30.`（packages/contracts/src/scheduledTask.ts:22）
- `Maximum wait in milliseconds. Defaults to 15000; maximum 60000.`（packages/contracts/src/previewAutomation.ts:22）
- `Message queued as the thread's next turn after the handoff. The handoff detaches the current provider session, so pass the remaining work here to automatically resume inside the worktree; omit it to stop after the handoff and wait for the next message.`（packages/contracts/src/worktreeMcp.ts:47）
- `Metadata mutation: rename, regenerate_title, link_pull_request, or unlink_pull_request.`（packages/contracts/src/threadMetadataMcp.ts:68）
- `Model id advertised for the selected provider instance.`（packages/contracts/src/orchestratorMcp.ts:112）
- `Model option selections advertised by orchestrator_capabilities.`（packages/contracts/src/orchestratorMcp.ts:124）
- `Modifier keys held while pressing key.`（packages/contracts/src/previewAutomation.ts:377）
- `Named device size. Required only when mode is preset.`（packages/contracts/src/previewAutomation.ts:196）
- `Named viewport from Chrome DevTools' standard device catalog.`（packages/contracts/src/previewAutomation.ts:193）
- `Navigates the active browser tab. Provide exactly one of url or target; for most public pages use url.`（packages/contracts/src/previewAutomation.ts:181）
- `New concise display title. Required only when action is rename.`（packages/contracts/src/threadMetadataMcp.ts:40）
- `OAuth token exchange request for a DPoP-bound relay access token.`（packages/contracts/src/relay.ts:767）
- `Only for runOnWorktreeCreate scripts. When true (the default), the agent starts while the script is still running. Set false to hold the agent until the script exits.`（packages/contracts/src/t3ProjectFile.ts:49）
- `Opens the collaborative browser for the current thread. Use preview_navigate afterward when readiness waiting matters.`（packages/contracts/src/previewAutomation.ts:113）
- `Optional client device identifier associated with this link.`（packages/contracts/src/relay.ts:328）
- `Optional client device identifier requesting the connection.`（packages/contracts/src/relay.ts:717）
- `Optional concise display title.`（packages/contracts/src/orchestratorMcp.ts:44）
- `Optional initial page URL. {0} Omit to open a blank tab.`（packages/contracts/src/previewAutomation.ts:83）
- `Optional path, query, and fragment, for example /settings?tab=account.`（packages/contracts/src/previewAutomation.ts:140）
- `Optional weekdays; omit to run every day.`（packages/contracts/src/scheduledTask.ts:50）
- `Orientation for a fixed device preset. Defaults to the preset's native orientation.`（packages/contracts/src/previewAutomation.ts:215）
- `Orientation for a named device preset. It is not accepted in fill or freeform mode.`（packages/contracts/src/previewAutomation.ts:219）
- `Playwright selector for a scrollable container. Omit to scroll the viewport.`（packages/contracts/src/previewAutomation.ts:399）
- `Playwright selector for the input, for example role=textbox[name='Message'] or textarea[placeholder*='Message'].`（packages/contracts/src/previewAutomation.ts:340）
- `Playwright selector that must match an element, for example role=button[name='Send'].`（packages/contracts/src/previewAutomation.ts:454）
- `Playwright selector, preferably role/text based, for example role=button[name='Send'] or text=Continue. Use snapshot first to inspect the page.`（packages/contracts/src/previewAutomation.ts:285）
- `Positive interval in milliseconds.`（packages/contracts/src/scheduledTask.ts:27）
- `Presses one keyboard key in the active browser tab.`（packages/contracts/src/previewAutomation.ts:380）
- `Project scripts shared with everyone who opens this repository in T3 Code.`（packages/contracts/src/t3ProjectFile.ts:99）
- `Prompt executed on every scheduled run.`（packages/contracts/src/orchestratorMcp.ts:499）
- `Provider driver kind; prefer providerInstanceId when available.`（packages/contracts/src/orchestratorMcp.ts:107）
- `Publishes a signed agent-awareness update from an environment.`（packages/contracts/src/relay.ts:281）
- `Pull request number.`（packages/contracts/src/threadMetadataMcp.ts:76）
- `Pull request to link. Required only when action is link_pull_request.`（packages/contracts/src/threadMetadataMcp.ts:88）
- `Readiness milestone before returning. 'load' is the default; use 'none' only when a later wait call will verify the page.`（packages/contracts/src/previewAutomation.ts:168）
- `Readiness milestone before returning. 'load' waits for loading to stop (default), 'domContentLoaded' waits for an interactive document, and 'none' returns immediately.`（packages/contracts/src/previewAutomation.ts:164）
- `Reject the save if the task no longer exists, for edits from a client form.`（packages/contracts/src/scheduledTask.ts:128）
- `Relay issuer URL that will receive the DPoP-bound access token.`（packages/contracts/src/relay.ts:760）
- `Repository name as owner/name.`（packages/contracts/src/threadMetadataMcp.ts:74）
- `Requested capabilities for a new environment-link challenge.`（packages/contracts/src/relay.ts:315）
- `Requests a short-lived credential for connecting to an environment.`（packages/contracts/src/relay.ts:730）
- `Required when deviceId is omitted and both platforms are available.`（packages/contracts/src/device.ts:491）
- `Reuse tabId when supplied, otherwise this agent session's current tab. Defaults to true; set false to create a new tab.`（packages/contracts/src/previewAutomation.ts:100）
- `Root of the project's main workspace checkout.`（packages/contracts/src/worktreeMcp.ts:105）
- `Run at a fixed local wall-clock time on selected weekdays.`（packages/contracts/src/scheduledTask.ts:54）
- `Run repeatedly after a fixed number of milliseconds.`（packages/contracts/src/scheduledTask.ts:36）
- `Run the project's configured setup script in the new worktree after handoff. Defaults to true.`（packages/contracts/src/worktreeMcp.ts:41）
- `Scrolls the viewport, or a locator/selector container. Provide deltaX, deltaY, or both.`（packages/contracts/src/previewAutomation.ts:414）
- `Select a fixed local wall-clock time.`（packages/contracts/src/scheduledTask.ts:41）
- `Select interval scheduling.`（packages/contracts/src/scheduledTask.ts:32）
- `Selects a dev-server port relative to the current execution environment.`（packages/contracts/src/previewAutomation.ts:128）
- `Selects direct URL navigation.`（packages/contracts/src/previewAutomation.ts:120）
- `Self-contained task for one delegated child agent/subagent.`（packages/contracts/src/orchestratorMcp.ts:171）
- `Serialize and return the value instead of a remote object reference. Defaults to true.`（packages/contracts/src/previewAutomation.ts:438）
- `Server default used by t3_worktree_handoff when startFromOrigin is omitted.`（packages/contracts/src/worktreeMcp.ts:108）
- `Sets the active browser tab to fill-panel, independently resizable freeform, or named device-preset sizing.`（packages/contracts/src/previewAutomation.ts:249）
- `Shell command executed in a T3 Code terminal at the project root.`（packages/contracts/src/t3ProjectFile.ts:33）
- `Simulator udid or emulator serial from device_list. Omit to use the booted device for the platform, or the most recently used one.`（packages/contracts/src/device.ts:486）
- `Space-separated relay scopes requested by the client.`（packages/contracts/src/relay.ts:763）
- `Stable idempotency key to reuse when retrying this mutation.`（packages/contracts/src/orchestratorMcp.ts:48）
- `Structured recurring schedule. Pass an object with type 'interval' or 'fixed_time'.`（packages/contracts/src/scheduledTask.ts:66）
- `Substring that must appear in the current absolute URL.`（packages/contracts/src/previewAutomation.ts:465）
- `T3 project file`（packages/contracts/src/t3ProjectFile.ts:104）
- `Thread in the calling project. Omit to update the calling thread.`（packages/contracts/src/threadMetadataMcp.ts:83）
- `True (default) posts each run into this thread; false creates a fresh top-level thread per run.`（packages/contracts/src/orchestratorMcp.ts:514）
- `True only on that mode=wait call when timeoutMs elapsed. The timeout does not cancel the child. Later task_status reads return false and use status for liveness.`（packages/contracts/src/orchestratorMcp.ts:210）
- `True when this thread is already attached to a git worktree.`（packages/contracts/src/worktreeMcp.ts:100）
- `Types into locator/selector, or into the currently focused element when neither target is provided.`（packages/contracts/src/previewAutomation.ts:358）
- `URL of the JSON Schema for this file, typically "{0}".`（packages/contracts/src/t3ProjectFile.ts:72）
- `URL opened in the in-app browser preview when this script runs. Only honored on the desktop build.`（packages/contracts/src/t3ProjectFile.ts:55）
- `Vertical scroll delta in CSS pixels. Positive scrolls down. Defaults to 0.`（packages/contracts/src/previewAutomation.ts:392）
- `Viewport mode: fill follows the preview panel, freeform uses exact independently resizable dimensions, and preset uses a named device size.`（packages/contracts/src/previewAutomation.ts:189）
- `Viewport-relative X coordinate in CSS pixels. Must be paired with y.`（packages/contracts/src/previewAutomation.ts:305）
- `Viewport-relative Y coordinate in CSS pixels. Must be paired with x.`（packages/contracts/src/previewAutomation.ts:310）
- `Wait budget for mode=wait only. Default 10 minutes. Elapsing it returns waitTimedOut=true on that call and does not cancel the child.`（packages/contracts/src/orchestratorMcp.ts:184）
- `Waits until all provided conditions match. Use after click/type when the page changes asynchronously.`（packages/contracts/src/previewAutomation.ts:486）
- `Website URL. {0} Use this for public pages and directly reachable URLs.`（packages/contracts/src/previewAutomation.ts:150）
- `Weekday number where 0 is Sunday and 6 is Saturday.`（packages/contracts/src/scheduledTask.ts:47）
- `When true, automatically open the preview panel at ˋpreviewUrlˋ the moment the script starts.`（packages/contracts/src/t3ProjectFile.ts:61）
- `When true, the script runs automatically after a worktree is created for a new thread.`（packages/contracts/src/t3ProjectFile.ts:43）
- `Where new threads start for this repository: "worktree" for a fresh git worktree, "local" for the current checkout. A per-project setting in T3 Code overrides this; when neither is set, the global default applies.`（packages/contracts/src/t3ProjectFile.ts:87）
- `Whether the relay should provision a managed tunnel for this environment.`（packages/contracts/src/relay.ts:313）
- `Whether the schedule starts enabled; defaults true.`（packages/contracts/src/orchestratorMcp.ts:504）
- `Whether this link may deliver push notifications.`（packages/contracts/src/relay.ts:307）
- `Whether this link may update Live Activities.`（packages/contracts/src/relay.ts:310）
- `Whether to open the thread-bound inline preview for the human. Defaults to true; set false for background-only automation.`（packages/contracts/src/previewAutomation.ts:88）
- `Workspace-relative path to the project icon (e.g. "assets/logo.svg"). Checked before T3 Code's built-in icon locations.`（packages/contracts/src/t3ProjectFile.ts:79）
- `Writable recurring schedule. Pass an object with type 'interval' or 'fixed_time'.`（packages/contracts/src/scheduledTask.ts:86）

</details>

## 3. 修订条目（旧译 → 新译）

只改 value。按定稿术语统一的，以及 conflicts.md 冲突定值改动的，都在这里。

| 英文 | 旧译 | 新译 | 原因 |
|---|---|---|---|
| `Account {account}` | 账号 {account} | 账户 {account} | Account → 账户 |
| `Account-specific Codex home. Keeps auth.json separate while sharing state from CODEX_HOME.` | 账号专用的 Codex 主目录；单独保存 auth.json，同时共享 CODEX_HOME 中的其他状态。 | 账户专用的 Codex 主目录；单独保存 auth.json，同时共享 CODEX_HOME 中的其他状态。 | Account → 账户 |
| `Add to agent` | 添加给智能体 | 添加给 Agent | Agent 保留英文 |
| `Added to the composer` | 已添加到输入区 | 已添加到输入框 | Composer → 输入框 |
| `Adds the pull request to this thread's composer.` | 将拉取请求添加到当前任务的输入区。 | 将拉取请求添加到当前任务的输入框。 | Composer → 输入框 |
| `Agent access` | 智能体访问权限 | Agent 访问权限 | Agent 保留英文 |
| `Agent device` | 智能体设备 | Agent 设备 | Agent 保留英文 |
| `Agent device access` | 智能体设备访问权限 | Agent 设备访问权限 | Agent 保留英文 |
| `Agent tools are ready.` | 智能体工具已就绪。 | Agent 工具已就绪。 | Agent 保留英文 |
| `Agent:` | 智能体： | Agent： | Agent 保留英文 |
| `All accounts are shown by connected providers.` | 所有账号均已通过已连接的服务提供方显示。 | 所有账户均已通过已连接的服务提供方显示。 | Account → 账户 |
| `Allow agent control` | 允许智能体控制 | 允许 Agent 控制 | Agent 保留英文 |
| `Allow agents in this project to use the shared browser. Applies when the agent session next starts.` | 允许此项目的智能体使用共享浏览器。智能体会话下次启动时生效。 | 允许此项目的 Agent 使用共享浏览器。Agent 会话下次启动时生效。 | Agent 保留英文 |
| `Allow agents to control devices` | 允许智能体控制设备 | 允许 Agent 控制设备 | Agent 保留英文 |
| `Approve` | 仅允许一次 | 批准 | 冲突定值 |
| `Authenticated as` | 已认证账号 | 已认证为 | 冲突定值 |
| `Automatically resume active threads after a server update restarts the environment.` | 服务端更新并重启环境后，自动恢复进行中的任务。 | 服务器更新并重启环境后，自动恢复进行中的任务。 | Server → 服务器 |
| `Back` | 后退 | 返回 | 冲突定值 |
| `Brings back the Build/Plan toggle in the composer along with the /plan and /default commands and the Shift+Tab shortcut. While off, every thread runs in build mode.` | 恢复输入区中的“构建/方案”切换，以及 /plan、/default 命令和 Shift+Tab 快捷键。关闭后，所有任务都以构建模式运行。 | 恢复输入框中的“执行/规划”切换，以及 /plan、/default 命令和 Shift+Tab 快捷键。关闭后，所有任务都以执行模式运行。 | Composer → 输入框；Build 模式 → 执行 |
| `Browser storage rejected the write, so the composer was left as-is. Free up site data and try again.` | 浏览器存储拒绝写入，输入区内容已保留。请清理站点数据后重试。 | 浏览器存储拒绝写入，输入框内容已保留。请清理站点数据后重试。 | Composer → 输入框 |
| `Checkout feature branch & continue` | 签出功能分支并继续 | 检出功能分支并继续 | checkout → 检出 |
| `Checkout {request}` | 签出{request} | 检出{request} | checkout → 检出 |
| `Choose an agent to start coding. You can add more later.` | 选择一个智能体开始编程。之后可以添加更多。 | 选择一个 Agent 开始编程。之后可以添加更多。 | Agent 保留英文 |
| `Click to hide account` | 点击隐藏账号 | 点击隐藏账户 | Account → 账户 |
| `Click to reveal account` | 点击显示账号 | 点击显示账户 | Account → 账户 |
| `Collapse composer` | 自动收起输入区 | 自动收起输入框 | Composer → 输入框 |
| `Compact after 100,000 to 1,000,000 tokens. Leave empty to use Claude's default.` | 上下文达到 100,000 至 1,000,000 个令牌后压缩。留空则使用 Claude 默认值。 | 上下文达到 100,000 至 1,000,000 个 Token 后压缩。留空则使用 Claude 默认值。 | 模型计量 token → Token |
| `Compacts automatically at {tokens} tokens.` | 达到 {tokens} 个令牌后自动压缩。 | 达到 {tokens} 个 Token 后自动压缩。 | 模型计量 token → Token |
| `Confirm thread unpinning` | 取消固定任务前确认 | 取消置顶任务前确认 | Pin → 置顶 |
| `Connect a CLIProxyAPI hub to show its accounts on Usage → Limits.` | 连接 CLIProxyAPI Hub，在“用量 → 限额”中显示其账号。 | 连接 CLIProxyAPI Hub，在“用量 → 限额”中显示其账户。 | Account → 账户 |
| `Connect your agents` | 连接智能体 | 连接 Agent | Agent 保留英文 |
| `Context window {0} tokens used` | 上下文窗口已使用 {0} 个令牌 | 上下文窗口已使用 {0} 个 Token | 模型计量 token → Token |
| `Context window {tokens} tokens used` | 上下文窗口已使用 {tokens} 个令牌 | 上下文窗口已使用 {tokens} 个 Token | 模型计量 token → Token |
| `Continue threads after server updates` | 服务端更新后继续任务 | 服务器更新后继续任务 | Server → 服务器 |
| `Control how transparent glass surfaces are. Higher values make menus, dialogs, and the composer more solid.` | 控制玻璃界面的透明度。数值越高，菜单、对话框和输入区越不透明。 | 控制玻璃界面的透明度。数值越高，菜单、对话框和输入框越不透明。 | Composer → 输入框 |
| `Could not open a fresh composer.` | 无法打开新的输入区。 | 无法打开新的输入框。 | Composer → 输入框 |
| `Could not open a fresh composer: {reason}` | 无法打开新的输入区：{reason} | 无法打开新的输入框：{reason} | Composer → 输入框 |
| `Create and check out a branch before pushing or opening a {request}.` | 请先创建并签出分支，再推送或打开{request}。 | 请先创建并检出分支，再推送或打开{request}。 | checkout → 检出 |
| `Daily processed tokens` | 每日已处理令牌 | 每日已处理 Token | 模型计量 token → Token |
| `Default mode - click to enter plan mode` | 当前为常规模式，点击进入方案模式 | 当前为默认模式，点击进入规划模式 | Plan 模式 → 规划 |
| `Detached HEAD: check out a branch before creating a {request}.` | 当前处于分离 HEAD 状态，请先签出分支再创建{request}。 | 当前处于分离的 HEAD 状态，请先检出分支再创建{request}。 | checkout → 检出 |
| `Detached HEAD: check out a branch before pushing.` | 当前处于分离 HEAD 状态，请先签出分支再推送。 | 当前处于分离的 HEAD 状态，请先检出分支再推送。 | checkout → 检出 |
| `Direct spawns` | 直接创建的子智能体 | 直接创建的子 Agent | Agent 保留英文 |
| `Disable` | 禁用 | 停用 | Disable → 停用 |
| `Disable Tailscale HTTPS?` | 禁用 Tailscale HTTPS？ | 停用 Tailscale HTTPS？ | Disable → 停用 |
| `Disable all` | 全部禁用 | 全部停用 | Disable → 停用 |
| `Disable extension` | 禁用扩展 | 停用扩展 | Disable → 停用 |
| `Disabled` | 已禁用 | 已停用 | Disable → 停用 |
| `Enable T3 Connect on that machine, then open Connections here to sign in with the same account. You can also add the machine using a pairing link.` | 请在该设备上启用 T3 Connect，再在此处打开“连接”并使用同一账号登录；也可以使用配对链接添加设备。 | 请在该设备上启用 T3 Connect，再在此处打开“连接”并使用同一账户登录；也可以使用配对链接添加设备。 | Account → 账户 |
| `Expand composer` | 展开输入区 | 展开输入框 | Composer → 输入框 |
| `Failed to pin thread` | 固定任务失败 | 置顶任务失败 | Pin → 置顶 |
| `Failed to reorder pinned threads` | 调整固定任务顺序失败 | 调整置顶任务顺序失败 | Pin → 置顶 |
| `Failed to snooze thread` | 稍后处理任务失败 | 暂缓任务失败 | Snooze → 暂缓 |
| `Failed to snooze threads` | 稍后处理多个任务失败 | 暂缓多个任务失败 | Snooze → 暂缓 |
| `Failed to unpin thread` | 取消固定任务失败 | 取消置顶任务失败 | Pin → 置顶 |
| `Google account` | Google 账号 | Google 账户 | Account → 账户 |
| `Higher values make menus, dialogs, and the composer more solid.` | 数值越高，菜单、对话框和输入区越不透明。 | 数值越高，菜单、对话框和输入框越不透明。 | Composer → 输入框 |
| `Host` | 主机地址 | 主机 | 冲突定值 |
| `Hourly processed tokens` | 每小时已处理令牌 | 每小时已处理 Token | 模型计量 token → Token |
| `Leave this off to keep manual device controls without giving agents access.` | 关闭此选项可保留手动设备控制，并禁止智能体访问。 | 关闭此选项可保留手动设备控制，并禁止 Agent 访问。 | Agent 保留英文 |
| `No accounts reported.` | 未报告任何账号。 | 未报告任何账户。 | Account → 账户 |
| `No agents yet` | 暂无智能体 | 暂无 Agent | Agent 保留英文 |
| `No custom options. The composer uses the provider's default options.` | 没有自定义选项，输入区将使用服务提供方的默认选项。 | 没有自定义选项，输入框将使用服务提供方的默认选项。 | Composer → 输入框 |
| `No other environments are published to your account yet. Publish one from another device and it will show up here.` | 你的账号还没有发布其他环境。请从另一台设备发布环境，随后会显示在这里。 | 你的账户还没有发布其他环境。请从另一台设备发布环境，随后会显示在这里。 | Account → 账户 |
| `Only available in the desktop app.` | 仅桌面客户端支持这些设置。 | 仅在桌面应用中可用。 | 按 0.0.46 实际用途 |
| `Open` | 开放 | 打开 | 冲突定值 |
| `Open Agents panel ›` | 打开智能体面板 › | 打开 Agent 面板 › | Agent 保留英文 |
| `Options shown in the composer` | 输入区中显示的选项 | 输入框中显示的选项 | Composer → 输入框 |
| `Paints assistant output token by token instead of in complete chunks. Not recommended: it is significantly slower, and long responses become harder to follow. Kept only for compatibility with the old behavior.` | 逐个令牌绘制助手输出，而不是分块显示完整内容。不建议启用：速度会明显变慢，长回复也更难阅读；此选项仅用于兼容旧行为。 | 逐个 Token绘制助手输出，而不是分块显示完整内容。不建议启用：速度会明显变慢，长回复也更难阅读；此选项仅用于兼容旧行为。 | 模型计量 token → Token |
| `Paste a {request} URL, checkout command, or enter 123 / #123.` | 粘贴{request} URL、签出命令，或输入 123 / #123。 | 粘贴{request} URL、检出命令，或输入 123 / #123。 | checkout → 检出 |
| `Plan mode (legacy)` | 方案模式（旧版） | 规划模式（旧版） | Plan 模式 → 规划 |
| `Plan mode - click to return to normal build mode` | 当前为方案模式，点击返回常规执行模式 | 当前为规划模式，点击返回常规执行模式 | Plan 模式 → 规划 |
| `Press {shortcut} with a prompt in the composer to stash it.` | 在输入区有内容时按 {shortcut} 即可暂存。 | 在输入框有内容时按 {shortcut} 即可暂存。 | Composer → 输入框 |
| `Processed tokens` | 已处理令牌 | 已处理 Token | 模型计量 token → Token |
| `Prompt font preview` | 输入区字体预览 | 输入框字体预览 | Composer → 输入框 |
| `Prompt font size` | 输入区字号 | 输入框字号 | Composer → 输入框 |
| `Pull request tabs` | 拉取请求选项卡 | 拉取请求标签页 | 冲突定值 |
| `Pull requests the agent opens from this thread land here. Link one yourself from a URL or a number.` | 智能体从此任务创建的拉取请求会显示在这里，也可通过 URL 或编号手动关联。 | Agent 从此任务创建的拉取请求会显示在这里，也可通过 URL 或编号手动关联。 | Agent 保留英文 |
| `Queue follow-ups while the agent runs or steer the current run.` | 智能体运行时，将后续消息加入队列或用来调整当前任务。 | Agent 运行时，将后续消息加入队列或用来调整当前运行。 | Agent 保留英文 |
| `Raw token cost` | 原始令牌费用 | 原始 Token 费用 | 模型计量 token → Token |
| `Refresh provider status, versions, and models in the background. Set to 0 to disable.` | 在后台刷新服务提供方状态、版本和模型；设为 0 可禁用。 | 在后台刷新服务提供方状态、版本和模型；设为 0 可停用。 | Disable → 停用 |
| `Remove assistant citation` | 移除智能体引用 | 移除助手引用 | assistant → 助手 |
| `Rest the composer of an existing thread into a single line when it loses focus, when you scroll the conversation, or both. Pick neither to keep it expanded.` | 现有任务的输入区失去焦点、滚动对话或同时满足两者时收起为单行；均不选择则保持展开。 | 现有任务的输入框失去焦点、滚动对话或同时满足两者时收起为单行；均不选择则保持展开。 | Composer → 输入框 |
| `Restart and disable` | 重启并禁用 | 重启并停用 | 冲突定值；Disable → 停用 |
| `Restore Build/Plan, /plan, /default, and Shift+Tab. Off uses build mode.` | 恢复构建/规划、/plan、/default 和 Shift+Tab。关闭后使用构建模式。 | 恢复执行/规划、/plan、/default 和 Shift+Tab。关闭后使用执行模式。 | Build 模式 → 执行 |
| `Resume with a summary and use fewer tokens.` | 生成摘要后继续，以减少令牌用量。 | 生成摘要后继续，以减少 Token 用量。 | 模型计量 token → Token |
| `Run agents on this computer. Turn off to use T3 Code only with remote environments.` | 在此计算机上运行智能体。关闭后，T3 Code 仅使用远程环境。 | 在此设备上运行 Agent。关闭后，T3 Code 仅使用远程环境。 | Agent 保留英文；Computer → 设备 |
| `Settle ({0})` | 完成（{0}） | 收起（{0}） | 按 0.0.46 实际用途 |
| `Settled` | 已完成 | 已收起 | 冲突定值；Settled → 已收起 |
| `Show the floating preview when an agent opens a browser or device unless the agent says otherwise.` | 智能体打开浏览器或设备时显示浮动预览，除非智能体另有说明。 | Agent 打开浏览器或设备时显示浮动预览，除非 Agent 另有说明。 | Agent 保留英文 |
| `Show the quota of every account the hub pools, next to the providers on {environment}. The key stays on that server.` | 在 {environment} 的服务提供方旁显示该 Hub 汇集的所有账号限额。管理密钥只保存在该服务器上。 | 在 {environment} 的服务提供方旁显示该 Hub 汇集的所有账户限额。管理密钥只保存在该服务器上。 | Account → 账户 |
| `Shows context window usage as a circular indicator in the composer.` | 在输入区中以圆形指示器显示上下文窗口用量。 | 在输入框中以圆形指示器显示上下文窗口用量。 | Composer → 输入框 |
| `Sidebar background` | 侧边栏背景 | 侧栏背景 | Sidebar → 侧栏 |
| `Sidebar controls` | 侧边栏控件 | 侧栏控件 | Sidebar → 侧栏 |
| `Sidebar selection` | 侧边栏选中项 | 侧栏选中项 | Sidebar → 侧栏 |
| `Sign in with your Google account.` | 使用 Google 账号登录。 | 使用 Google 账户登录。 | Account → 账户 |
| `Snooze` | 稍后处理 | 暂缓 | Snooze → 暂缓 |
| `Snoozed ({0})` | 已稍后处理（{0}） | 已暂缓（{0}） | Snooze → 暂缓 |
| `Snoozed ({count})` | 已稍后处理（{count}） | 已暂缓（{count}） | Snooze → 暂缓 |
| `Snoozed until {time}` | 已稍后处理至 {time} | 已暂缓至 {time} | Snooze → 暂缓 |
| `Snoozed {count} thread(s)` | 已稍后处理 {count} 个任务 | 已暂缓 {count} 个任务 | Snooze → 暂缓 |
| `Snoozed {done} of {total} threads` | 已稍后处理 {total} 个任务中的 {done} 个 | 已暂缓 {total} 个任务中的 {done} 个 | Snooze → 暂缓 |
| `Supervised` | 监督模式 | 需确认 | 冲突定值 |
| `Switch this thread back to normal build mode` | 将此任务切回普通构建模式 | 将此任务切回常规执行模式 | Build 模式 → 执行 |
| `Switch this thread into plan mode` | 将此任务切换到方案模式 | 将此任务切换到规划模式 | Plan 模式 → 规划 |
| `System` | 系统 | 跟随系统 | 冲突定值 |
| `Text appears once the agent finishes its turn.` | 智能体完成本轮回复后显示文本。 | Agent 完成本轮回复后显示文本。 | Agent 保留英文 |
| `The composer is busy; try again once it is ready.` | 输入区正在忙碌，请在其就绪后重试。 | 输入框正在忙碌，请在其就绪后重试。 | Composer → 输入框 |
| `The hub's management key is deleted from this server. Its accounts leave the Limits view; the hub itself is untouched. Add it again with the URL and key to bring them back.` | 将从此服务器删除该 Hub 的管理密钥，其账号也会从“限额”视图中移除；Hub 本身不会受到影响。之后可使用 URL 和密钥重新添加。 | 将从此服务器删除该 Hub 的管理密钥，其账户也会从“限额”视图中移除；Hub 本身不会受到影响。之后可使用 URL 和密钥重新添加。 | Account → 账户 |
| `The pull request is in the composer — type your question, then send.` | 拉取请求已加入输入区，请输入问题后发送。 | 拉取请求已加入输入框，请输入问题后发送。 | Composer → 输入框 |
| `The question is in the composer — read it over, then send.` | 问题已加入输入区，请检查后发送。 | 问题已加入输入框，请检查后发送。 | Composer → 输入框 |
| `The task is in the composer — read it over, then send.` | 任务已加入输入区，请检查后发送。 | 任务已加入输入框，请检查后发送。 | Composer → 输入框 |
| `This account has no subscription limits.` | 此账号没有订阅限额。 | 此账户没有订阅限额。 | Account → 账户 |
| `This redeems one credit on your account and clears the current rate-limit windows. It cannot be undone.` | 这会兑换账号中的一个额度并清空当前速率限制窗口，且无法撤销。 | 这会兑换账户中的一个额度并清空当前速率限制窗口，且无法撤销。 | Account → 账户 |
| `This session is {age} old and uses {tokens} tokens. Compact it before continuing?` | 此会话已有 {age}，当前使用 {tokens} 个令牌。是否先压缩再继续？ | 此会话已有 {age}，当前使用 {tokens} 个 Token。是否先压缩再继续？ | 模型计量 token → Token |
| `This thread is snoozed` | 此任务正在稍后处理 | 此任务已暂缓 | Snooze → 暂缓 |
| `This thread woke from snooze` | 此任务已结束稍后处理 | 此任务已从暂缓中唤醒 | Snooze → 暂缓 |
| `Toggle Sidebar` | 切换侧边栏 | 切换侧栏 | Sidebar → 侧栏 |
| `Toggle account email visibility` | 显示或隐藏账号邮箱 | 显示或隐藏账户邮箱 | Account → 账户 |
| `Toggle source control account visibility` | 显示或隐藏源代码管理账号 | 显示或隐藏源代码管理账户 | Account → 账户 |
| `Tokens` | 令牌 | Token | 模型计量 token → Token |
| `Turn on token-by-token output?` | 启用逐令牌输出？ | 启用逐 Token 输出？ | 模型计量 token → Token |
| `Turned off. Agents only run in remote environments.` | 已关闭，智能体仅在远程环境中运行。 | 已关闭，Agent 仅在远程环境中运行。 | Agent 保留英文 |
| `Update this environment's T3 Code server to browse pull requests.` | 请更新此环境的 T3 Code 服务端以浏览拉取请求。 | 请更新此环境的 T3 Code 服务器以浏览拉取请求。 | Server → 服务器 |
| `Use a {request} URL, checkout command, 123, or #123.` | 请输入{request} URL、签出命令、123 或 #123。 | 请输入{request} URL、检出命令、123 或 #123。 | checkout → 检出 |
| `View agents` | 查看智能体 | 查看 Agent | Agent 保留英文 |
| `View cited assistant text: {text}` | 查看引用的智能体文本：{text} | 查看引用的助手文本：{text} | assistant → 助手 |
| `Wait for it to finish before the agent starts` | 等待操作完成后再启动智能体 | 等待操作完成后再启动 Agent | Agent 保留英文 |
| `When this thread spawns subagents or runs a workflow, they show up here with live status, activity, and token usage.` | 此任务创建子智能体或运行工作流时，它们会显示在这里，包含实时状态、活动和 Token 用量。 | 此任务创建子 Agent或运行工作流时，它们会显示在这里，包含实时状态、活动和 Token 用量。 | Agent 保留英文 |
| `Working` | 运行中 | 进行中 | 冲突定值 |
| `You're not connected to a server yet.` | 尚未连接到服务端。 | 尚未连接到服务器。 | Server → 服务器 |
| `You’re not connected to a server yet.` | 尚未连接到服务端。 | 尚未连接到服务器。 | Server → 服务器 |
| `agents` | 智能体 | Agent | Agent 保留英文 |
| `collapse composer` | 收起输入区 | 收起输入框 | Composer → 输入框 |
| `continue threads after server updates` | 服务端更新后继续任务 | 服务器更新后继续任务 | Server → 服务器 |
| `includes {count} reasoning` | 其中推理令牌 {count} | 其中推理 Token {count} | 模型计量 token → Token |
| `now` | 当前 | 现在 | 按 0.0.46 实际用途 |
| `settled` | 已完成 | 已收起 | Settled → 已收起 |
| `setup` | 设置 | 初始化 | 冲突定值 |
| `{count} accounts` | {count} 个账号 | {count} 个账户 | Account → 账户 |
| `{count} thread(s) couldn't be snoozed.` | 有 {count} 个任务无法稍后处理。 | 有 {count} 个任务无法暂缓。 | Snooze → 暂缓 |
| `{files} could not be restored: the composer is at its {count}-attachment limit.` | 无法恢复 {files}：输入区最多只能添加 {count} 个附件。 | 无法恢复 {files}：输入框最多只能添加 {count} 个附件。 | Composer → 输入框 |
| `{label} URL, checkout command, or #42` | {label} URL、签出命令或 #42 | {label} URL、检出命令或 #42 | checkout → 检出 |
| `{provider} is disabled in T3 Code settings.` | 已在 T3 Code 设置中禁用 {provider}。 | 已在 T3 Code 设置中停用 {provider}。 | Disable → 停用 |
| `{share} of cost · {tokens} tokens` | 占费用 {share} · {tokens} 令牌 | 占费用 {share} · {tokens} Token | 模型计量 token → Token |
| `{share} of tokens · {cost}` | 占令牌 {share} · {cost} | 占 Token {share} · {cost} | 模型计量 token → Token |
| `{tokens} tokens from an older session` | 来自较早会话的 {tokens} 个令牌 | 来自较早会话的 {tokens} 个 Token | 模型计量 token → Token |
| `{value}x the raw token cost` | 相当于原始令牌费用的 {value} 倍 | 相当于原始 Token 费用的 {value} 倍 | 模型计量 token → Token |

## 4. conflicts.md 冲突的最终取值

逐条按 0.0.46 源码里实际出现的位置定值（位置清单由当前 matcher 扫描 `upstream/` 得到）。改了取值的也列在第 3 节。

| 英文 | 原取值 | 最终取值 | 依据 |
|---|---|---|---|
| `Approve` | 仅允许一次 | **批准** | 0.0.46 两处：工具调用审批按钮（旁边是「拒绝」「本次会话始终允许」）和 PR 评审「Approve」。旧取值「仅允许一次」是旧版审批菜单的语境，放到 PR 评审里不对；「批准」两处都成立 |
| `Authenticated as` | 已认证账号 | **已认证为** | 0.0.46 只在 `ProviderInstanceCard.tsx:752` `<span>Authenticated as</span>` 后接账户；两个候选都把它当名词。改为「已认证为」，与后面的账户连读 |
| `Back` | 后退 | **返回** | 0.0.46 共 15 处，13 处是向导/面板/命令面板的返回，2 处是预览浏览器的后退按钮。按多数取「返回」 |
| `Battery saver` | 省电 | （不变） | 0.0.46 是电源模式标签映射 `battery-saver`；保留「省电」 |
| `Branch changed — was` | 分支已更改，原分支为 | （不变） | 保留「分支已更改，原分支为」 |
| `Build` | 执行 | （不变） | 0.0.46 三处：输入框的模式标签、OpenCode 的 Agent 选项（均为与「规划」相对的执行模式）、项目脚本图标名。按多数保留「执行」，脚本图标的取舍见「拿不准」 |
| `Cancel` | 取消 | （不变） | 保留「取消」；「取消本轮」只适合中断场景 |
| `Changes requested` | 已要求修改 | （不变） | PR 评审状态，保留「已要求修改」 |
| `Compact` | 压缩上下文 | （不变） | 0.0.46 只在 `ChatView.tsx:7295` 的压缩按钮；保留「压缩上下文」（单写「压缩」容易误解） |
| `Copied!` | 已复制 | （不变） | 保留「已复制」（中文界面不加感叹号） |
| `Current` | 当前 | （不变） | 命令面板「当前」标记和诊断表头，保留「当前」 |
| `Description` | 描述 | （不变） | PR 的描述区块，保留「描述」 |
| `Desktop` | 台式机 | （不变） | 0.0.46 四处：机器类型、项目图标名（台式机语义）；资源诊断的桌面端进程组、第三方许可证的包名（桌面端语义）。保留「台式机」，另两处见「拿不准」 |
| `Dismiss Woke notification` | 关闭任务唤醒提示 | （不变） | 保留「关闭任务唤醒提示」 |
| `Done` | 完成 | （不变） | 0.0.46 十二处，九处是按钮，保留「完成」 |
| `Fix in a thread` | 在新任务中修复 | （不变） | 三处都是「在新任务中修复」的按钮默认文字，保留 |
| `Host` | 主机地址 | **主机** | 0.0.46 两处：SSH 主机输入框标题、PR 列表的托管平台筛选。改为通用的「主机」（旧取值「主机地址」只适合前者） |
| `Input` | 输入 | （不变） | 任务状态、工具输入、主题角色、用量里的输入 Token 都适用，保留「输入」 |
| `Keep separate` | 保持独立 | （不变） | 侧栏项目分组方式，保留「保持独立」 |
| `Label` | 名称 | （不变） | Provider 实例显示名称、自定义选项名称，保留「名称」 |
| `Loading {name}` | 正在加载 {name} | （不变） | 0.0.46 已不再使用，保留旧取值 |
| `Make this environment available to your other devices through T3 Connect.` | 允许你的其他设备通过 T3 Connect 访问此环境。 | （不变） | 保留 |
| `New profile` | 新建配置文件 | （不变） | 保留「新建配置文件」 |
| `New worktree` | 新建工作树 | （不变） | 工作区模式标签，保留「新建工作树」 |
| `None` | 无 | （不变） | 保留「无」 |
| `Off` | 关 | （不变） | 开关状态（与「开」成对），保留「关」 |
| `Open` | 开放 | **打开** | 0.0.46 八处：打开按钮/菜单（3）、PR 状态（3）、评审线程未解决状态（1）、Duo 姿态（1）。旧取值「开放」作动词不通，改为「打开」，其余语境见「拿不准」 |
| `Plan` | 规划 | （不变） | 0.0.46 五处：输入框模式标签、紧凑菜单、方案卡片徽标、OpenCode Agent 选项（均为规划模式），以及用量页的订阅套餐行。保留「规划」，套餐行见「拿不准」 |
| `Play {name}` | 播放 {name} | （不变） | 0.0.46 已不再使用，保留旧取值 |
| `Publish` | 发布 | （不变） | 发布仓库按钮和 T3 Connect 引导步骤，保留「发布」 |
| `Pull request tabs` | 拉取请求选项卡 | **拉取请求标签页** | 两处 aria-label，按定稿 Tab → 标签页，改为「拉取请求标签页」 |
| `Restart and disable` | 重启并禁用 | **重启并停用** | 按定稿 Disable → 停用，改为「重启并停用」 |
| `Server update available` | 服务器有可用更新 | （不变） | 保留「服务器有可用更新」 |
| `Settled` | 已完成 | **已收起** | 两处是侧栏筛选标签，按定稿改为「已收起」（与「收起任务」「已收起（{count}）」一致） |
| `Share` | 分享 | （不变） | 0.0.46 两处：配对二维码的「Share」按钮、用量表的占比列。保留「分享」，表头见「拿不准」 |
| `Showing the last pull requests loaded.` | 显示上次加载的拉取请求。 | （不变） | 0.0.46 里是 mixed-jsx（不转换），保留 |
| `Snoozed` | 已暂缓 | （不变） | 侧栏筛选标签，保留「已暂缓」（定稿） |
| `Standard` | 标准 | （不变） | 保留「标准」 |
| `Supervised` | 监督模式 | **需确认** | 运行模式名，与「自动接受编辑 / 自动 / 完全访问」并列；改为不带「模式」后缀的「需确认」（另一候选） |
| `System` | 系统 | **跟随系统** | 0.0.46 四处都是外观/配色方案的「跟随系统」选项（T06 补丁的语言选项「System」同用此词条），改为「跟随系统」 |
| `Thinking` | 思考 | （不变） | 思考中状态与模型「思考」开关共用，保留「思考」 |
| `This closes #{number} without merging it.` | 关闭 #{number}，但不进行合并。 | （不变） | 0.0.46 已不再使用，保留旧取值 |
| `This environment is available to your other devices through T3 Connect.` | 你的其他设备可通过 T3 Connect 访问此环境。 | （不变） | 保留 |
| `This environment publishes agent activity to your mobile clients.` | 此环境会向你的移动客户端发布 Agent 动态。 | （不变） | 保留 |
| `This merges #{number} using {method} as soon as the host considers it ready, which may be immediately.` | 托管服务认为 #{number} 已就绪时，会立即使用{method}合并；这可能马上发生。 | （不变） | 0.0.46 已不再使用，保留旧取值 |
| `This merges #{number} using {method}.` | 将使用 {method} 合并 #{number}。 | （不变） | 0.0.46 已不再使用，保留旧取值 |
| `Toggle` | 开关 | （不变） | 自定义模型选项类型（开关/选项列表），保留「开关」 |
| `Unavailable project` | 不可用的项目 | （不变） | 保留「不可用的项目」 |
| `Unknown` | 未知 | （不变） | 保留「未知」 |
| `Use $frontend-design to fix the flaky test in [surface.test.ts](apps/web/src/terminal/ghostty/surface.test.ts) and align the header with [SettingsPanels.tsx](apps/web/src/components/settings/SettingsPanels.tsx) before shipping.` | 使用 $frontend-design 修复 [surface.test.ts](apps/web/src/terminal/ghostty/surface.test.ts) 中不稳定的测试，并在发布前将标题与 [SettingsPanels.tsx](apps/web/src/components/settings/SettingsPanels.tsx) 对齐。 | （不变） | 0.0.46 已不再使用，保留旧取值 |
| `Working` | 运行中 | **进行中** | 按定稿 Working → 进行中（侧栏「进行中」分区），旧取值「运行中」留给 Running |
| `Write` | 写入 | （不变） | 0.0.46 三处：资源诊断的磁盘写入（2）、PR 编辑器的编写标签（1）。保留「写入」，编辑器标签见「拿不准」 |
| `You have uncommitted changes. They'll carry over to the other branch, or block the switch if they conflict.` | 你有未提交的更改。它们将保留到另一分支；如存在冲突，则无法切换。 | （不变） | 保留 |
| `image` | 图片 | （不变） | 0.0.46 里是 mixed-jsx（不转换），保留「图片」 |
| `setup` | 设置 | **初始化** | 0.0.46 只在项目操作列表里给「创建工作树时运行」的脚本打标，改为「初始化」 |
| `{count} changed files` | 已更改 {count} 个文件 | （不变） | 0.0.46 源码不再直接出现，但 `{0} changed {1}` 运行时仍会产生此字符串，保留「已更改 {count} 个文件」 |

## 5. 可疑项的处理

本任务开始时（当前 matcher 生成的报告）：value-use 112 个文本（229 处），template-collision 526 个文本（585 处）。

### 5.1 value-use 放行（62，已写入 `dict/allow-suspicious.json`，词库有中文）

逐条对照报告列出的值用途位置核对：值用途要么是与该界面文字无关的另一份数据（`_tag`、按键名、对象键、Schema 字面量等），要么只用于显示。

| 英文 | 中文 | 核对结论 |
|---|---|---|
| `0ms` | 0 毫秒 | 值用途是 style 的 `transitionDuration`/`transitionDelay`，与 `formatDuration` 的显示结果无关 |
| `12-hour` | 12 小时制 | 值用途是选择框的 `value` 比较和 Schema 字面量，比较的是设置值；被包裹的只有 `TIMESTAMP_FORMAT_LABELS` 的显示值 |
| `24-hour` | 24 小时制 | 同上 |
| `Action` | 操作 | 值用途是 desktop Niri IPC 的对象键，无关 |
| `Actions` | 操作 | 值用途是 `ComposerBanner` 的导出成员名，无关 |
| `Close` | 关闭 | 值用途是 desktop `_tag: "Close"`，无关 |
| `Closed` | 已关闭 | 值用途是 desktop DBus 信号名 `message.member === "Closed"`，无关 |
| `Copy` | 复制 | 值用途是终端 `keyCodes.ts` 的按键名 as const 数组，无关；菜单项按 `id` 分派 |
| `Custom` | 自定义 | 同上：`row.source === "Custom"` 比较的是数据，不是 `formatValue()` 的显示结果 |
| `Default` | 默认 | 同上：`row.source !== "Default"` 比较的是 `sourceForBinding()` 的返回值；`DeviceControlsRail` 的 as const 元组只显示不比较 |
| `Delete` | 删除 | 值用途是按键名（`event.key === "Delete"`、键码表），无关；菜单项按 `id` 分派 |
| `Desktop` | 台式机 | 值用途是类型 `category: "Desktop" | "Tablet" | "Phone"`，无关 |
| `Device` | 设备 | 值用途是 `DeviceStreamView.tsx:545` 传给 `DeviceLoadingView` 的 `name=`，该组件只用来显示（T03 fix3 核对结论同） |
| `Device hub` | 设备中心 | 值用途是 `DeviceToolVersions`/`device.ts` 的 as const 元组（只显示），没有比较 |
| `Direct` | 直接退出 | 值用途是图片来源 `_tag === "Direct"`，无关 |
| `Disabled` | 已停用 | 值用途是 `ResourceTelemetryDiagnostics.tsx:1114` 传给 `DetailRow value=` 的显示文字，不参与比较（T03 fix3 核对结论同） |
| `Dismiss` | 关闭 | 值用途是 `ComposerBanner` 的导出成员名，无关 |
| `Empty` | 空 | 值用途是 server `_tag === "Empty"`，无关 |
| `Enabled` | 已启用 | 同上（`:1113`） |
| `Extra large` | 特大 | 同上 |
| `Failed` | 失败 | 值用途全部是 desktop/server 的 `_tag: "Failed"` 判别联合，与 web 的状态标签不是同一份数据 |
| `Failed to pin thread` | 置顶任务失败 | 同上（`Sidebar.tsx:4026`） |
| `Failed to remove project` | 移除项目失败 | 值用途是 `LegacySidebar.tsx:1630/1666` 的 `console.error("…", …)` 日志消息，与 toast 标题无关 |
| `Failed to un-settle thread` | 恢复任务失败 | 同上（`Sidebar.tsx:4013`） |
| `Failed to unpin thread` | 取消置顶任务失败 | 同上（`Sidebar.tsx:4009`） |
| `Failed to wake thread` | 唤醒任务失败 | 值用途是 `Sidebar.tsx:4016` if 条件里 `run(…, "…")` 的失败标题参数（toast 显示用），不参与比较；该处本身受保护仍为英文 |
| `File` | 文件 | 值用途是文件系统 stat 类型 `type === "File"`，无关 |
| `Files` | 文件 | 值用途是 DOM `dataTransfer.types.includes("Files")`，无关 |
| `Idle` | 空闲 | 值用途是 desktop/server/web 的 `_tag`/`kind === "Idle"`（导航状态等），与状态标签无关 |
| `Interrupted` | 已中断 | 值用途是 server/client-runtime 的 `_tag`，无关 |
| `Invalid value` | 值无效 | 值用途是 `RangeError` 消息，无关（T03 fix3 结论同） |
| `Large` | 大 | 同上 |
| `Monitor` | 监控器 | 值用途是 server 工具名比较，无关 |
| `No environment is selected.` | 尚未选择环境。 | 值用途是同文的 `new Error(…)` 消息，只显示（T03 fix3 结论同） |
| `None` | 无 | 值用途全部是 server `_tag === "None"`；`usagePriceTable` 的 `placeholder: "None"` 在 `UsagePriceOverrides.matchesSaved` 里没有被比较（只比较 Mixed/Unavailable） |
| `Off` | 关 | 值用途只有 `packages/shared/src/otelEnvironment.ts` 的对象键 `Off`（OTEL 日志级别表），与界面标签无关；各显示位置（开关状态、通知模式、继承值）没有按文字比较 |
| `Only available in the desktop app.` | 仅在桌面应用中可用。 | 值用途是 `RightPanelTabs.tsx:177` as const 映射的值（只显示），没有比较 |
| `Paste` | 粘贴 | 同上 |
| `Path` | 路径 | 值用途是 Windows 环境变量名 `Path`，无关 |
| `Pending` | 待处理 | 值用途是 server `_tag: "Pending"`，无关 |
| `Process` | 进程 | 值用途是 IME 按键名 `event.key === "Process"`，无关 |
| `Project` | 项目 | 值用途是类型 `KeybindingSource`；快捷键行的 source 由 `sourceForBinding()` 返回（函数名不匹配 E3，不转换），与 `SettingInheritance` 的层级标签不是同一份数据；各层用独立的 `key` 字段区分 |
| `Projects` | 项目 | 值用途是 `ONBOARDING_STAGES` as const 数组，与命令面板分组标签无关 |
| `Provider` | 服务提供方 | 值用途是向导步骤 as const 数组，与资源诊断的类别标签无关 |
| `Provider update failed.` | 服务提供方更新失败。 | 同上 |
| `Ready` | 就绪 | 值用途是 desktop `_tag: "Ready"`，无关 |
| `Reconnect to the environment and try again.` | 请重新连接环境后重试。 | 同上 |
| `Skill` | 技能 | 值用途是 `toolActivity.ts` 的工具名比较 `toolName !== "Skill"`，比较的是服务端数据 |
| `Skipped` | 已跳过 | 值用途是 server `_tag`，无关 |
| `Small` | 小 | 值用途是 `DeviceControlsRail` 的 as const 元组（只显示，未翻译），没有比较 |
| `Starting` | 正在启动 | 值用途是 server ACP 运行时的 `_tag`，无关 |
| `Summary` | 摘要 | 值用途是 `publishWizardSteps` as const 数组，与 PR 详情页标签无关 |
| `Surface` | 表面 | 值用途是 `ComposerBanner` 的导出成员名，无关；主题角色按 `id` 区分 |
| `Terminal process running` | 终端进程正在运行 | 值用途只有类型字面量 `label: "Terminal process running"`，运行时没有比较 |
| `The environment is not connected.` | 环境尚未连接。 | 同上 |
| `The reset time has passed. Retry the thread manually.` | 重置时间已过，请手动重试该任务。 | 值用途是 server 错误的 `cause`，只显示（T03 fix3 结论同） |
| `Ultrafast` | 极速 | `TraitsPicker` 比较的是服务端模型描述里的 option.label；放行只影响 `usageBreakdown` 的图表标签 |
| `Unknown` | 未知 | 值用途是 server `_tag`/switch、`ResourceTelemetryDiagnostics.tsx:1047` 的 `value=` 显示文字和 Schema 字面量，web 侧没有按显示文字比较 |
| `Worktree` | 工作树 | 值用途是 server `_tag`，无关 |
| `just now` | 刚刚 | 值用途是 `Sidebar.tsx:299` `label === "just now"`：放行后该比较不再命中，侧栏紧凑时间由「现在」变为显示「刚刚」，只影响显示文字，不影响其他逻辑 |
| `now` | 现在 | 值用途全部是标识符形式的对象键 `now`；`compactSidebarTimeLabel`、`snoozeWakeLabel` 的返回值只显示 |
| `server` | 服务器 | 值用途是对象键和 server 侧的 `category === "server"`；web 侧的 `kind === "server"` 比较的是路由数据，`serverLabel` 只拼进显示文字 |

### 5.2 value-use 不放行（50，保持英文）

| 英文 | 理由 |
|---|---|
| `Commit` | `GitActionsControl.tsx:385` 对非 run_action 的快捷操作（如禁用时的 show_hint）用 `quickAction.label === "Commit"` 选图标，label 正是被翻译的值；放行后这些状态下的提交按钮图标会变成 Info |
| `Push` | 同上（`:386`，推送图标） |
| `Browser` | `RightPanelTabs.tsx:513/525/1244` 按 `action.label === "Browser"` 决定浏览器配置文件选择器和打开逻辑 |
| `Mixed` | `UsagePriceOverrides.tsx:215` 按 `cell.placeholder !== "Mixed"` 判断是否已保存，而 placeholder 正是被翻译的那个值 |
| `Unavailable` | 同上（`:216`） |
| `Working` | `Sidebar.logic.ts:1246` `THREAD_STATUS_PRIORITY[status.label]` 按标签文字查优先级，翻译后查不到，侧栏状态胶囊的优先级会错 |
| `Waiting` | 同上 |
| `Completed` | 同上 |
| `Connecting` | 同上 |
| `Awaiting Input` | 同上 |
| `Pending Approval` | 同上 |
| `Plan Ready` | 同上 |
| `Branch` | `SubagentTooltipContent.tsx:88` `label === "Branch"` 选图标，label 来自 `subagentDisplay.ts:108` |
| `Fast` | `TraitsPicker.tsx:515`、`ProviderModelsSection.tsx:51` 按 `label === "Fast"` 查找选项；`customModelEditor` 的预设会把 label 复制进用户的自定义模型描述，翻译后找不到 |
| `New thread` | web 本地草稿任务的标题会发到服务端，`ThreadTitleRegenerationService.ts:118` 按 `=== "New thread"` 判断是否重新生成标题 |
| `Running source control action` | `GitActionsControl.logic.ts:96` `currentLabel !== "Running source control action"` 比较的正是这个标签 |
| `Agent` | 译文与原文相同（Agent 保留英文），放行没有收益 |
| `Alt` | 按键名，译文与原文相同 |
| `Shift` | 按键名，译文与原文相同 |
| `Command` | 按键名，不翻译 |
| `Control` | 按键名，不翻译 |
| `Option` | 按键名，不翻译 |
| `Space` | 按键名，不翻译 |
| `Enter` | 按键名，不翻译 |
| `Android` | 平台名，不翻译 |
| `iOS` | 平台名，不翻译 |
| `macOS` | 平台名，不翻译 |
| `Linux` | 平台名，不翻译 |
| `Windows` | 平台名，不翻译 |
| `Antigravity` | 产品名，不翻译 |
| `Claude` | 产品名，不翻译 |
| `Codex` | 产品名，不翻译 |
| `Cursor` | 产品名，不翻译 |
| `Grok` | 产品名，不翻译 |
| `OpenCode` | 产品名，不翻译 |
| `Pi` | 产品名，不翻译 |
| `T3 Code` | 产品名，不翻译 |
| `Nightly` | 渠道名，不翻译 |
| `Dev` | 渠道名，不翻译 |
| `GPU` | 技术缩写，不翻译 |
| `auto` | 设置表单里的占位示例（取值本身），不翻译 |
| `claude` | 可执行文件名占位示例，不翻译 |
| `codex` | 同上 |
| `grok` | 同上 |
| `opencode` | 同上 |
| `pi` | 同上 |
| `devin` | ACP 注册表 ID 占位示例，不翻译 |
| `placeholder` | 主题检查器里的取值标识，不是界面文字 |
| `show-link-context-menu` | `reportFailure` 的第一个参数在这里是操作标识而非显示标题（D 类白名单的误收），不是界面文字 |
| `text-primary` | className，不是界面文字（T03 fix3 结论同） |

前 16 条是真实的逻辑风险：代码按显示文字查表或比较，而被比较的正是这个界面文字本身。要让它们显示中文，需要改上游代码（按 id 比较）或由 T03 给这些位置单独加 `t3zh-skip`/改判定，词库这一层做不到。其余是产品名、按键名、命令、标识符等本就不翻译的文本。

### 5.3 T03 handoff「修复记录 r2」列出的 13 个误伤文本（28 处）

全部放行（见 5.1），中文：`The environment is not connected.` → 环境尚未连接。；`Failed to un-settle thread` → 恢复任务失败；`Failed to wake thread` → 唤醒任务失败；`Failed to pin thread` → 置顶任务失败；`Failed to unpin thread` → 取消置顶任务失败；`Provider update failed.` → 服务提供方更新失败。；`Device` → 设备；`The reset time has passed. Retry the thread manually.` → 重置时间已过，请手动重试该任务。；`No environment is selected.` → 尚未选择环境。；`Enabled` → 已启用；`Disabled` → 已停用；`0ms` → 0 毫秒；`Invalid value` → 值无效。值用途位置都只用于显示或日志，与 T03 的核对结论一致。

### 5.4 template-collision

- 526 个文本中，519 个补了精确词条（messages，或骨架相同的 templates），重跑后不再误配、自动转换。
- 5 个是「同骨架的旧模板并列」：词库里早有字面文字相同、但多一个相邻占位符的旧模板（如 `Terminal excerpt, {0}{1}`），运行时按长度并列时它排在前面，构建期的误配检查因此总是判骨架不同。补精确词条也排不到前面，所以放行。逐条用运行时查表实测过，结果与精确模板相同：
  - `Terminal excerpt, {0}`（撞 `Terminal excerpt, {0}{1}`）
  - `Toggle right panel{0}`（撞 `Toggle right panel{0}{1}`）
  - `Use {0}{1}`（撞 `Use {theme}`）
  - `{0}, step {1}{2}`（撞 `{step}, step {index}`）
  - `{0}{1} results in {2} files`（撞 `{results} results in {files} files`）
- 2 个无法补词条，保持英文（不包裹）：
  - `Environment-relative target. Prefer {kind:'environment-port',port:5173} for a dev server in the current environment.`（packages/contracts/src/previewAutomation.ts:155）：contracts 的 Schema 注解（非界面文字），且原文含字面花括号（`{kind:…}`、`{href: …}`），check-dict 的占位符结构校验不接受，无法写入词库
  - `JavaScript expression evaluated in the page's main frame, for example document.title or (() => ({href: location.href}))().`（packages/contracts/src/previewAutomation.ts:424）：contracts 的 Schema 注解（非界面文字），且原文含字面花括号（`{kind:…}`、`{href: …}`），check-dict 的占位符结构校验不接受，无法写入词库

## 6. 骨架模板（运行时不会命中）

下列 key 是源码模板字面量的构建期骨架（`{1}` 等是三元表达式拼出的单复数后缀、`it`/`them`、`Hide`/`Show`、可选后缀等）。它们的中文只翻译字面文字、按原顺序保留全部占位符，作用是让构建期误配检查通过、包裹生效；运行时实际字符串由第 1 节标注「运行时变体」的具体模板命中（字面文字更长，优先匹配）。只有当运行时出现变体没覆盖的取值时才会落到这里，那时会显示原样的英文片段。

- `Archive {0} thread{1}?` → 要归档 {0} 个任务{1}吗？
- `Changed {0} {1}` → 已更改 {0} {1}
- `Could not update {0}.{1}` → 无法更新 {0}。{1}
- `Created {0} {1}` → 已创建 {0} {1}
- `Edit in the composer{0}` → 在输入框中编辑{0}
- `Failed to snooze {0} thread{1}` → 暂缓 {0} 个任务{1}失败
- `Install update{0} and restart T3 Code?⏎⏎Any running tasks will be interrupted. Make sure you're ready before continuing.` → 要安装更新{0}并重启 T3 Code 吗？⏎⏎所有正在运行的任务都会被中断，请确认已准备好再继续。
- `Linked {0} {1}` → 已关联 {0} {1}
- `Migrating {0} {1} from the previous version. You can keep working while this finishes.` → 正在从旧版本迁移 {0} {1}。迁移期间你可以继续工作。
- `Prompt is {0} {1} over the {2}-character limit. Shorten or split it before sending.` → 提示词超出 {2} 字符上限 {0} {1}，请缩短或拆分后再发送。
- `Ran {0} {1}` → 已运行 {0} {1}
- `Read file{0}` → 已读取文件{0}
- `Read {0} {1}` → 已读取 {0} {1}
- `Read {0}{1}` → 已读取 {0}{1}
- `Received {0} {1}` → 已收到 {0} {1}
- `Remove selected{0}` → 移除所选主题{0}
- `Remove {0} from the message?⏎It is referenced in your text; removing it also removes every reference.` → 要从消息中移除 {0} 吗？⏎它在你的文本中被引用；移除后所有引用也会一并移除。
- `Searched code {0} {1}` → 已搜索代码 {0} {1}
- `Searched the web {0} {1}` → 已搜索网页 {0} {1}
- `Send as a steer instead{0}` → 改为作为调整发送{0}
- `Stopped watching {0} {1}` → 已停止关注 {0} {1}
- `That prompt was restored or deleted before {0} image{1} finished saving. Re-attach {2} if you still need {3}.` → 该提示词在 {0} 张图片{1}保存完成前已被恢复或删除。如仍需要{3}，请重新添加{2}。
- `This action will commit and push changes{0}` → 此操作将提交并推送更改{0}
- `This action will commit, push, and create a {0}{1}` → 此操作将提交、推送并创建{0}{1}
- `This action will push local commits and create a {0}{1}` → 此操作将推送本地提交并创建{0}{1}
- `This action will push local commits{0}` → 此操作将推送本地提交{0}
- `This allows {0} {1} from #{2} to run. Review the code and workflow changes first.` → 这会允许 #{2} 中的 {0} {1} 运行。请先检查代码和工作流更改。
- `Unlinked {0} {1}` → 已取消关联 {0} {1}
- `Use {0} for {1} mode{2}` → 在 {1} 模式下使用 {0}{2}
- `Use {0}{1}` → 使用 {0}{1}
- `Used browser {0} {1}` → 已使用浏览器 {0} {1}
- `Used device controls {0} {1}` → 已使用设备控制 {0} {1}
- `Used {0} {1}` → 已使用 {0} {1}
- `Watching {0} {1}` → 正在关注 {0} {1}
- `{0} accent color for {1}` → {0} {1} 的强调色
- `{0} attachment, {1}, {2}` → {0}附件，{1}，{2}
- `{0} bot comment{1}` → {0} 条机器人评论{1}
- `{0} changed {1}` → 已更改 {0} {1}
- `{0} compatible {1} found.` → 找到 {0} 个兼容的 {1}。
- `{0} older {1} on GitHub` → 在 GitHub 上查看更早的 {0} 个{1}
- `{0} queued message{1}` → {0} 条排队消息{1}
- `{0} request{1} waiting longer than {2}s.` → {0} 个请求{1}的等待时间已超过 {2} 秒。
- `{0} resolved or dismissed comment{1}` → {0} 条已解决或已撤销的评论{1}
- `{0} {1} done` → {0} {1} 已完成
- `{0} {1} outdated. Check provider settings for details.` → {0} {1} 过旧，详情请查看服务提供方设置。
- `{0} {1} outdated. Review provider settings for details.` → {0} {1} 过旧，详情请查看服务提供方设置。
- `{0} {1} usage` → {0} {1} 的使用位置
- `{0} {1} {2} favorites` → {0} {1} {2} 收藏
- `{0}: {1}% left{2}{3}` → {0}：剩余 {1}%{2}{3}
- `{0}{1} pull request` → {0}{1} 拉取请求
- `“{0}” already has a {1} palette. Pick another name.` → “{0}”已有 {1} 配色，请换一个名称。

## 7. 重跑报告后仍未翻译的 14 条

| 文本 | 位置 | 原因 |
|---|---|---|
| `Recurring schedule object: {type:'interval', everyMs} or {type:'fixed_time', timeOfDay, weekdays?}. Never stringify it unless the provider requires the compatibility form.` | packages/contracts/src/orchestratorMcp.ts:67 | contracts Schema 注解（非界面文字）；含字面花括号，check-dict 拒收 |
| `Write-only headers JSON, e.g. {"Authorization":"Bearer …"}` | apps/web/src/components/settings/AcpSessionManagementSection.tsx:555 | 界面文字，但含示例 JSON 的字面花括号 `{"Authorization":…}`，check-dict 的占位符结构校验拒收，无法写入词库 |
| `oklch(0.529681 0.01551 326.299)` | packages/shared/src/themePalettes.ts:405 | 主题色板的颜色值，键名恰好是 `placeholder`（T04 已记录的 matcher 误收），不是界面文字 |
| `oklch(0.530733 0.01795 323.79)` | packages/shared/src/themePalettes.ts:532 | 主题色板的颜色值，键名恰好是 `placeholder`（T04 已记录的 matcher 误收），不是界面文字 |
| `oklch(0.532177 0.019333 325.784)` | packages/shared/src/themePalettes.ts:786 | 主题色板的颜色值，键名恰好是 `placeholder`（T04 已记录的 matcher 误收），不是界面文字 |
| `oklch(0.532339 0.017796 331.748)` | packages/shared/src/themePalettes.ts:659 | 主题色板的颜色值，键名恰好是 `placeholder`（T04 已记录的 matcher 误收），不是界面文字 |
| `oklch(0.549927 0.090215 323.149)` | packages/shared/src/themePalettes.ts:278 | 主题色板的颜色值，键名恰好是 `placeholder`（T04 已记录的 matcher 误收），不是界面文字 |
| `oklch(0.657087 0.028226 307.985)` | packages/shared/src/themePalettes.ts:338 | 主题色板的颜色值，键名恰好是 `placeholder`（T04 已记录的 matcher 误收），不是界面文字 |
| `oklch(0.706249 0.014508 306.607)` | packages/shared/src/themePalettes.ts:846 | 主题色板的颜色值，键名恰好是 `placeholder`（T04 已记录的 matcher 误收），不是界面文字 |
| `oklch(0.721641 0.010192 281.271)` | packages/shared/src/themePalettes.ts:592 | 主题色板的颜色值，键名恰好是 `placeholder`（T04 已记录的 matcher 误收），不是界面文字 |
| `oklch(0.723533 0.008741 4.515)` | packages/shared/src/themePalettes.ts:719 | 主题色板的颜色值，键名恰好是 `placeholder`（T04 已记录的 matcher 误收），不是界面文字 |
| `oklch(0.739243 0.002222 223.225)` | packages/shared/src/themePalettes.ts:465 | 主题色板的颜色值，键名恰好是 `placeholder`（T04 已记录的 matcher 误收），不是界面文字 |
| `text-blue-600 dark:text-blue-400` | apps/web/src/components/ui/collapsible-section-header.tsx:7 | className（T03 已记录的 E1 误收），不是界面文字 |
| `{⏎  "version": 1,⏎  "name": "Aurora",⏎  "appearance": "light",⏎  "colors": { ... }⏎}` | apps/web/src/components/settings/ThemeImportDialog.tsx:134 | 主题 JSON 示例占位文本，无需翻译；含嵌套花括号，check-dict 也拒收 |

## 8. 拿不准的条目

一个 messages 词条只能有一个译法。下列英文串在 0.0.46 里不止一种语义，或者译文会进入数据，按多数或按更稳妥的一侧取值，其余位置的显示效果在这里列明，供构建后目视确认。

| 英文 | 当前取值 | 不理想的位置 | 说明 |
|---|---|---|---|
| `Plan` | 规划 | `components/usage/UsageLimitsPooled.tsx:183` 账户的订阅套餐行（应为「套餐」） | 另外 4 处都是规划模式 |
| `Build` | 执行 | `components/projectScriptEditor.tsx:64` 项目脚本图标名（应为「构建」） | 另外 2 处是执行模式 |
| `Open` | 打开 | PR 状态筛选和徽标（`routes/_chat.pull-requests.tsx:236`、`pullRequest/pullRequestIcons.tsx:35`）、评审线程状态（`PullRequestReviewAnnotation.tsx:228`，应为「未解决」）、Duo 姿态（`duoControl.ts:5`） | 动词 3 处、状态 4 处；「开放」作动词不通，状态写「打开」可接受 |
| `Desktop` | 台式机 | 资源诊断的桌面端进程组（`ResourceTelemetryDiagnostics.tsx:1067`）、第三方许可证的包名（`thirdPartyLicenses.ts:102`），应为「桌面端」 | 机器类型、项目图标两处是台式机语义 |
| `Host` | 主机 | PR 列表的托管平台筛选（`PullRequestListFilters.tsx:561`，应为「托管服务」） | 另一处是 SSH 主机 |
| `Share` | 分享 | 用量表的占比列（`usage/UsagePage.tsx:707`，应为「占比」） | 另一处是配对二维码的分享按钮 |
| `Write` | 写入 | PR 编辑器的编写/预览标签（`PullRequestMarkdownEditor.tsx:91`，应为「编写」） | 另外 2 处是磁盘写入 |
| `Closed` | 已关闭 | Duo 姿态（`duoControl.ts:3`，应为「合上」） | 另外 2 处是 PR 状态 |
| `Back` | 返回 | 预览浏览器的后退按钮（`PreviewChromeRow.tsx:130/137`，Safari 用「后退」） | 另外 13 处是返回 |
| `Ready` | 就绪 | PR「标记为可供评审」按钮（`ThreadDetailsPrRow.tsx:307`），按钮写「就绪」略像状态 | 沿用旧词库取值 |
| `Working` | 进行中 | 命令面板添加远程项目时的忙碌按钮（`CommandPalette.tsx:3329`，写「处理中」更贴切） | 侧栏的 Working 分区按定稿 |
| `Subagent of` | 子 Agent 隶属于 | `MessagesTimeline.tsx:1260`，后面紧跟父任务标题 | 措辞可再斟酌 |
| `line {0}` / `lines {0}-{1}` / `Terminal {0}` | 第 {0} 行 / 第 {0}-{1} 行 / 终端 {0} | 终端上下文标签会写进提示词的引用链接文字和任务标题种子（`terminalContext.ts`、`ChatView.tsx:9361`） | 只影响发给 Agent 的显示文字和新任务标题，不参与解析（旧版提示词解析只处理旧消息） |
| `Implement plan` / `Implement {0}` | 实施方案 / 实施 {0} | 会成为新任务的标题（服务端保存） | T03 已在已知问题中列出 |
| `{request}` 占位符 | — | `This action will commit, push, and create a {request} …` 等模板运行时代入的是英文 `pull request`（`terminology.singular` 不经过转换），显示为「创建pull request」 | 旧词库同类模板（`Create {request}` 等）一直如此，未改 |
| `Use Take snapshot from the command palette to choose a window.` | 在命令面板中使用 Take snapshot 选择窗口。 | 命令名「Take snapshot」不在 web 源码里（应来自桌面端菜单，T07 范围），译文保留英文命令名 | T07 若翻译了该命令，需同步此句 |
| `Daily`/`Hourly` + `processed tokens`/`cost` | 每日 / 每小时 + 已处理 Token / 费用 | 0.0.46 把标题拆成两个 JSX 表达式（`UsagePage.tsx:613-614`），中间有空格，显示为「每日 已处理 Token」 | 词库无法合并两段 |
| `T3 Code Desktop` / `T3 Code Web` | 原文 | 客户端元数据标签，会随配对发给服务端，在其他客户端的「已授权客户端」里显示 | 为避免把中文写进服务端数据，按原文保留 |
| 主题名 `Grove`/`Ocean`/`Ember`/`Iris`/`T3 Chat` | 原文 | 内置主题的名字 | 视为专有名，未译 |
| `Linked {0}` | 已关联 {0} | T3 Connect 账户页的关联日期（`Linked Oct 5, 2026`）；日期里有空格时由骨架 `Linked {0} {1}` 命中，结果相同 | |

## 9. 建议收窄的模板

只列出，不删除（调度方要求）。前 9 条是旧词库带来的宽模板，在本任务开始时的报告里造成的误配次数如下；本任务给受影响的静态文本都补了精确词条，现有界面不再受影响，但以后新增的英文仍会先撞上它们。

| 模板 | 当前中文 | 开始时造成的误配次数 | 问题 | 建议 |
|---|---|---:|---|---|
| `{head} to {base}` | {head} 到 {base} | 126 | 任意含「 to 」的句子都能匹配，译文只把 to 换成「到」 | 删除；需要的地方改成带上下文的具体模板（如 `Merge {head} into {base}`） |
| `{0} for {1}` | {1} 的 {0} | 62 | 匹配任意含「 for 」的句子并调换语序 | 删除 |
| `{first} and {second}` | {first} 和 {second} | 60 | 匹配任意含「 and 」的句子 | 删除，或只保留在列表拼接的调用点（改为 D 类函数参数） |
| `{0} {1} is {2}` | {0} {1} 的状态为 {2} | 50 | 语义写死成「状态为」，匹配任意含「 is 」的三段句 | 删除 |
| `{failure} on {environment}` | {environment}上的{failure} | 27 | 匹配任意含「 on 」的句子并调换语序 | 改为具体模板 |
| `{minutes}m` | {minutes} 分钟 | 15 | 匹配任意以 m 结尾的文本（`Rendering diagram` → `Rendering diagra 分钟`） | 收窄为数字（需要运行时支持数字占位符，属 T03）；或保留，只靠构建期误配检查兜底 |
| `{selected} of {total}` / `{0} of {1}` / `{current} of {total}` | 已选 X 个，共 Y 个 / 第 X 项，共 Y 项 | 11 | 语义写死成「已选」「第 X 项」 | 删除，按具体句子补 |
| `{leading}, and {last}` | {leading} 和 {last} | 11 | 匹配任意含「, and 」的句子 | 同 `{first} and {second}` |
| `{0} is {1}` | {0} 的状态为 {1} | 5 | 同 `{0} {1} is {2}` | 删除 |
| `{mode}.` | {mode}。 | — | 任何以英文句号结尾、不在 messages 里的文本都会被匹配，只把句号换成「。」，结果半中半英；也是很多静态句子被判误配的原因 | 删除 |
| `{theme} saved` / `{theme} added` | 已保存主题“{theme}” 等 | 4 | 语义写死成「主题」，任何「X saved」都会被说成主题 | 改为 `Theme {theme} saved` 之类的具体 key，或删除 |
| `Show {model}` / `Use {theme}` / `Remove {theme}` / `Edit {theme}` / `Close {name}` / `Open on {provider}` 等「动词 + 一个占位符」 | — | 17 / 6 / 9 / 4 / 3 / 5 | 匹配所有以该动词开头的句子 | 可保留（结果通常可读），但占位符名带着具体语义（`{theme}`）容易误导维护者 |
| `{count} file` / `{count} files` / `{count} days` / `{count} session(s)` / `{count} conversation` | — | 6 / 5 / 3 / 7 / 4 | 匹配任意以这些词结尾的句子（`Could not save file` → 「Could not save 个文件」） | 收窄为数字占位符（T03） |

本任务新增的较宽模板（都已逐条核对源码出现位置，运行时结果见 handoff 的实测）：

| 模板 | 中文 | 为什么需要 | 风险 |
|---|---|---|---|
| `{0}s`、`{0}h`、`{0}d`、`{0}ms`、`{0} s`、`{0} ms`、`{0} µs` | {0} 秒 等 | 0.0.46 的时长格式化函数（E3）大量返回 `${n}s` 等 | 任何以 s/h/d 结尾、不在 messages 里的被包裹文本都会被判误配（不包裹）；多单位组合已逐一补模板，实测无半中半英 |
| `{0}k`、`{0}b`、`{0}K/M/B/T`、`{0} B`、`{0} KB`、`{0} MB`、`L{0}`、`v{0}` | 原样 | 计数/字节/行号/版本号格式 | 同上，但译文与原文相同，误配也不会改坏显示 |
| `Open {0}` | 打开 {0} | `` `Open ${title}` `` 的 aria-label | 以 Open 开头的句子都会被匹配 |
| `{0} in {1}` | {0}，用时 {1} | 子 Agent 状态 `` `${label} in ${elapsed}` `` | 语义写死成「用时」，与上面 `{0} for {1}` 同类问题；建议 T03 让该函数的返回值改为具体模板后删除 |
| `{0} at {1}` | {0} {1} | 定时任务的 `` `${days} at ${time}` `` | 只是去掉 at |
| `{0} done`、`{0} copied`、`{0} server`、`{0} template`、`{0} screen`、`{0} hue`、`{0} stand`、`Read {path}`、`Searched {0}`、`Changed {0}`、`Linked {0}` | — | 各自的源码模板 | 单占位符 + 短字面文字，同「动词 + 一个占位符」类 |
| 第 6 节的骨架模板 | — | 构建期误配检查需要 | 运行时不命中；若命中会显示英文片段 |

另：建议 T03 把 `packages/contracts` 里 Schema `.annotate({ description })` 的值列为非显示位置（第 2.2 节的 136 条只是为了满足「补精确词条」按原文保留），并把 `reportFailure("show-link-context-menu", …)` 这类第一个参数是操作标识的调用排除出 D 类。
