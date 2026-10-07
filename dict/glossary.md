# 术语表

统计自 `dict/zh-CN.json` 主词库的 4132 条条目（messages + templates），共 87 个术语。

口径：

- **命中条目**：英文原文里按词边界出现该术语的条目数（不区分大小写，多词术语允许空白/连字符），与 key 上的 grep 一致。
- **现有译法**：先剔除中英两侧的占位符（`{name}` / `{0}` 是运行时插值，不算译文），再按**最长匹配**归属——
  一条译文命中多个形式时算给最长的那个，所以“服务提供方”不会重复记进“提供方”。同一英文词的另一语义
  单列为“另一语义”分组并注明（如 Review 的“评审”与“检查”），避免把不同意思混成一列。
- **保留英文**：剔除占位符后，中文译文里仍出现该英文词的条目数。
- **占位符内**：英文里该术语只出现在占位符内部（如 `… for {provider}`），不是 UI 正文，不计入翻译统计。
- **其他**：既没命中任何形式、也没保留英文的条目数，下面单列实例。
- 恒等：命中条目 = 现有译法（含分组）之和 + 保留英文 + 占位符内 + 其他。
- **建议**只针对术语本身的译法，不改词库，定稿由 T05 决定。

## 术语与现有译法

| 术语 | 命中条目 | 现有译法（条目数） | 保留英文 | 占位符内 | 其他 | 建议 |
|---|---:|---|---:|---:|---:|---|
| Thread | 153 | 任务（151）、对话（1） | 0 | 0 | 1 | 建议统一用「任务」 |
| Environment | 141 | 环境（120） | 0 | 21 | 0 | 统一用「环境」 |
| Project | 138 | 项目（132） | 0 | 6 | 0 | 统一用「项目」 |
| Provider | 104 | 服务提供方（76）、提供商（2） | 0 | 26 | 0 | 建议统一用「服务提供方」 |
| Failed | 86 | 失败（82）、*未通过 / 无法（failed to…）*（3） | 0 | 1 | 0 | 统一用「失败」（另有语义分组） |
| Default | 84 | 默认（79）、*跟随系统（system default）*（2）、*常规（default mode）*（1） | 0 | 0 | 2 | 建议统一用「默认」（另有语义分组） |
| Browser | 82 | 浏览器（77） | 0 | 5 | 0 | 统一用「浏览器」 |
| Connect | 80 | 连接（45） | 35 | 0 | 0 | 建议统一用「连接」 |
| Device | 79 | 设备（79） | 0 | 0 | 0 | 统一用「设备」 |
| Host | 73 | 主机（28）、主机地址（3）、地址（3）、*托管服务 / 托管平台（host＝代码托管方）*（30） | 1 | 1 | 7 | 建议统一用「主机」（另有语义分组） |
| Pull request | 73 | 拉取请求（73） | 0 | 0 | 0 | 统一用「拉取请求」 |
| Remove | 73 | 移除（73） | 0 | 0 | 0 | 统一用「移除」 |
| Branch | 72 | 分支（64） | 0 | 8 | 0 | 统一用「分支」 |
| Model | 61 | 模型（52） | 0 | 9 | 0 | 统一用「模型」 |
| Preview | 59 | 预览（59） | 0 | 0 | 0 | 统一用「预览」 |
| Settings | 58 | 设置（55） | 0 | 1 | 2 | 建议统一用「设置」 |
| Server | 52 | 服务器（41）、服务端（6） | 0 | 4 | 1 | 建议统一用「服务器」 |
| Checkout | 47 | 检出目录（35）、签出（5）、检出（4） | 1 | 2 | 0 | 建议统一用「检出目录」 |
| Theme | 44 | 主题（27） | 0 | 17 | 0 | 统一用「主题」 |
| Composer | 42 | 输入区（21）、输入框（20）、输入控制（1） | 0 | 0 | 0 | 建议统一用「输入区」 |
| Repository | 41 | 仓库（40） | 0 | 0 | 1 | 建议统一用「仓库」 |
| Review | 38 | 评审（28）、*一般检查（review＝检查/查看，不是代码评审）*（9）、*查看*（1） | 0 | 0 | 0 | 统一用「评审」（另有语义分组） |
| Terminal | 38 | 终端（37） | 0 | 0 | 1 | 建议统一用「终端」 |
| Diff | 37 | 差异（37） | 0 | 0 | 0 | 统一用「差异」 |
| Machine | 36 | 设备（33）、*本机（this machine）*（3） | 0 | 0 | 0 | 统一用「设备」（另有语义分组） |
| Usage | 36 | 用量（33）、*使用（usage 的位置/动作义）*（2）、*时段（usage period）*（1） | 0 | 0 | 0 | 统一用「用量」（另有语义分组） |
| Account | 35 | 账户（22）、账号（13） | 0 | 0 | 0 | 建议统一用「账户」 |
| Agent | 34 | 智能体（14） | 20 | 0 | 0 | 建议统一用「智能体」 |
| Shortcut | 32 | 快捷键（29） | 0 | 3 | 0 | 统一用「快捷键」 |
| Message | 30 | 消息（28）、信息（2） | 0 | 0 | 0 | 建议统一用「消息」 |
| Save | 30 | 保存（30） | 0 | 0 | 0 | 统一用「保存」 |
| Workspace | 30 | 工作区（29） | 0 | 1 | 0 | 统一用「工作区」 |
| Delete | 28 | 删除（28） | 0 | 0 | 0 | 统一用「删除」 |
| Commit | 27 | 提交（25） | 2 | 0 | 0 | 建议统一用「提交」 |
| Import | 27 | 导入（27） | 0 | 0 | 0 | 统一用「导入」 |
| Retry | 27 | 重试（25）、*重新（retry upload）*（2） | 0 | 0 | 0 | 统一用「重试」（另有语义分组） |
| Sidebar | 26 | 侧栏（22）、侧边栏（4） | 0 | 0 | 0 | 建议统一用「侧栏」 |
| Token | 24 | 令牌（14） | 8 | 0 | 2 | 建议统一用「令牌」 |
| Worktree | 24 | 工作树（24） | 0 | 0 | 0 | 统一用「工作树」 |
| Session | 23 | 会话（23） | 0 | 0 | 0 | 统一用「会话」 |
| Panel | 20 | 面板（20） | 0 | 0 | 0 | 统一用「面板」 |
| Running | 17 | 运行中（3） | 0 | 0 | 14 | 建议统一用「运行中」 |
| Working | 16 | 进行中（4）、工作区（3）、运行中（3）、正在运行（2）、已运行（1）、*工作（working 作动词）*（2） | 0 | 0 | 1 | 建议统一用「进行中」（另有语义分组） |
| Connection | 14 | 连接（14） | 0 | 0 | 0 | 统一用「连接」 |
| Limits | 13 | 限额（12）、*额度*（1） | 0 | 0 | 0 | 统一用「限额」（另有语义分组） |
| Archived | 12 | 已归档（10）、归档于（1）、*归档（动作）*（1） | 0 | 0 | 0 | 建议统一用「已归档」（另有语义分组） |
| Cancel | 12 | 取消（12） | 0 | 0 | 0 | 统一用「取消」 |
| Notifications | 12 | 通知（12） | 0 | 0 | 0 | 统一用「通知」 |
| Override | 12 | 覆盖（11）、*专用（override 作指定）*（1） | 0 | 0 | 0 | 统一用「覆盖」（另有语义分组） |
| Appearance | 10 | 外观（7） | 0 | 3 | 0 | 统一用「外观」 |
| Auto-merge | 10 | 自动合并（10） | 0 | 0 | 0 | 统一用「自动合并」 |
| Credentials | 10 | 凭据（10） | 0 | 0 | 0 | 统一用「凭据」 |
| Passed | 10 | 已通过（4）、通过（2）、*传递（passed 作过去分词）*（3） | 0 | 1 | 0 | 建议统一用「已通过」（另有语义分组） |
| Pending | 10 | 待提交（4）、待处理（2）、*等待（pending 状态）*（3） | 0 | 1 | 0 | 建议统一用「待提交」（另有语义分组） |
| Waiting | 10 | 等待（9）、等待中（1） | 0 | 0 | 0 | 建议统一用「等待」 |
| Accent color | 9 | 强调色（9） | 0 | 0 | 0 | 统一用「强调色」 |
| Archive | 9 | 归档（9） | 0 | 0 | 0 | 统一用「归档」 |
| Idle | 9 | 空闲（9） | 0 | 0 | 0 | 统一用「空闲」 |
| Snoozed | 9 | 已稍后处理（5）、已暂缓（1）、*稍后处理*（2） | 0 | 0 | 1 | 建议统一用「已稍后处理」（另有语义分组） |
| Background Activity | 8 | 后台活动（8） | 0 | 0 | 0 | 统一用「后台活动」 |
| Computer | 8 | 设备（7）、计算机（1） | 0 | 0 | 0 | 建议统一用「设备」 |
| Behavior | 7 | 行为（6）、使用行为（1） | 0 | 0 | 0 | 建议统一用「行为」 |
| Connections | 7 | 连接（7） | 0 | 0 | 0 | 统一用「连接」 |
| Keybindings | 7 | 快捷键（6） | 0 | 0 | 1 | 建议统一用「快捷键」 |
| Skills | 7 | 技能（7） | 0 | 0 | 0 | 统一用「技能」 |
| Messages | 6 | 消息（6） | 0 | 0 | 0 | 统一用「消息」 |
| Settled | 6 | 已收起（4）、已完成（2） | 0 | 0 | 0 | 建议统一用「已收起」 |
| Workflow | 6 | 工作流（6） | 0 | 0 | 0 | 统一用「工作流」 |
| Disabled | 5 | 已停用（2）、已禁用（1）、禁用（1）、*不会用于（disabled for…）*（1） | 0 | 0 | 0 | 建议统一用「已停用」（另有语义分组） |
| Skipped | 5 | 已跳过（2）、跳过（2） | 0 | 1 | 0 | 建议统一用「已跳过」 |
| Cancelled | 4 | 已取消（4） | 0 | 0 | 0 | 统一用「已取消」 |
| Enabled | 4 | 已启用（3）、启用（1） | 0 | 0 | 0 | 建议统一用「已启用」 |
| Interface | 4 | 界面（4） | 0 | 0 | 0 | 统一用「界面」 |
| Version control | 4 | 版本控制（4） | 0 | 0 | 0 | 统一用「版本控制」 |
| Command palette | 3 | 命令面板（3） | 0 | 0 | 0 | 统一用「命令面板」 |
| Disconnect | 3 | 断开（3） | 0 | 0 | 0 | 统一用「断开」 |
| Effort | 3 | 推理强度（3） | 0 | 0 | 0 | 统一用「推理强度」 |
| General | 3 | 常规（3） | 0 | 0 | 0 | 统一用「常规」 |
| Reasoning | 3 | 推理（2）、推理强度（1） | 0 | 0 | 0 | 建议统一用「推理」 |
| Diff layout | 2 | 差异布局（2） | 0 | 0 | 0 | 统一用「差异布局」 |
| Inherit | 2 | 继承（2） | 0 | 0 | 0 | 统一用「继承」 |
| Motion | 2 | 动态效果（1）、动效（1） | 0 | 0 | 0 | 建议统一用「动态效果」 |
| Panel animations | 2 | 面板动效（2） | 0 | 0 | 0 | 统一用「面板动效」 |
| Checkpoint | 1 | 检查点（1） | 0 | 0 | 0 | 统一用「检查点」 |
| Colors & themes | 1 | 颜色与主题（1） | 0 | 0 | 0 | 统一用「颜色与主题」 |
| Confirmations | 1 | 操作确认（1） | 0 | 0 | 0 | 统一用「操作确认」 |
| Organization | 1 | 组织（1） | 0 | 0 | 0 | 统一用「组织」 |

## 其他（未归类的实例）

这些条目的译文既没命中登记的形式，也没保留英文——多为术语用在了另一语义、或原译文省略了该词。
列出代表性实例供 T05 定夺（显示原文，便于定位；占位符在实际统计中已剔除）。

| 术语 | 其他条数 | 实例（英文 → 中文） |
|---|---:|---|
| Thread | 1 | Choose a project above to start a thread → 请先在上方选择项目 |
| Default | 2 | Brings back the Build/Plan toggle in the composer along with the /plan and /default commands and the Shift+Tab shortcut. While off, every thread runs in build mode. → 恢复输入区中的“构建/方案”切换，以及 /plan、/default 命令和 Shift+Tab 快捷键。关闭后，所有任务都以构建模式运行。；Restore Build/Plan, /plan, /default, and Shift+Tab. Off uses build mode. → 恢复构建/规划、/plan、/default 和 Shift+Tab。关闭后使用构建模式。 |
| Host | 7 | Active host power interval in seconds → 活跃时设备电源状态检查间隔（秒）；Decrease active host power interval → 缩短活跃时电源状态检查间隔；Decrease idle host power interval → 缩短空闲时电源状态检查间隔；Idle host power interval in seconds → 空闲时设备电源状态检查间隔（秒） |
| Settings | 2 | Add variables to pass API keys, base URLs, or other per-instance CLI settings. → 添加要传给此实例 CLI 的 API 密钥、基础 URL 或其他变量。；Use $frontend-design to fix the flaky test in [surface.test.ts](apps/web/src/terminal/ghostty/surface.test.ts) and align the header with [SettingsPanels.tsx](apps/web/src/components/settings/SettingsPanels.tsx) before shipping. → 使用 $frontend-design 修复 [surface.test.ts](apps/web/src/terminal/ghostty/surface.test.ts) 中不稳定的测试，并在发布前将标题与 [SettingsPanels.tsx](apps/web/src/components/settings/SettingsPanels.tsx) 对齐。 |
| Server | 1 | Additional CLI arguments passed to codex app-server on session start. → 会话启动时传递给 codex app-server 的额外 CLI 参数。 |
| Repository | 1 | This repository has more people with access than are listed here. Ask for the rest on the host. → 此处未列出所有有权访问的人员，请在托管服务中选择其余人员。 |
| Terminal | 1 | Use $frontend-design to fix the flaky test in [surface.test.ts](apps/web/src/terminal/ghostty/surface.test.ts) and align the header with [SettingsPanels.tsx](apps/web/src/components/settings/SettingsPanels.tsx) before shipping. → 使用 $frontend-design 修复 [surface.test.ts](apps/web/src/terminal/ghostty/surface.test.ts) 中不稳定的测试，并在发布前将标题与 [SettingsPanels.tsx](apps/web/src/components/settings/SettingsPanels.tsx) 对齐。 |
| Token | 2 | Copy the token and pair from another client using this backend's reachable host. → 请复制配对码，并在另一个客户端中使用此后端可访问的主机地址完成配对。；Stream token by token (legacy) → 逐字输出（旧版） |
| Running | 14 | Applies to sessions started from now on; a running agent keeps the tools it was given. → 仅对之后启动的会话生效；正在运行的 Agent 会保留已获得的工具。；Confirming the dev server is running → 正在确认开发服务器是否运行；Connect to a computer running T3 Code → 连接运行 T3 Code 的设备；Keep T3 Code running. Select the computers you want to set up above. → 请保持 T3 Code 运行，并在上方选择要设置的设备。 |
| Working | 1 | Devices connected over your local network will disconnect. Existing tunnels, such as T3 Connect or Tailscale HTTPS, keep working. T3 Code will restart. → 通过本地网络连接的设备将断开。T3 Connect 或 Tailscale HTTPS 等现有隧道仍可使用。T3 Code 将重新启动。 |
| Snoozed | 1 | Choose when snoozed threads return to your inbox. → 选择暂缓的任务何时返回收件箱。 |
| Keybindings | 1 | Open keybindings.json → 打开 keybindings.json |

## 保留英文的词

依据是现有词库的实际用法：剔除占位符后，中文译文里仍然保留该英文词。

| 词 | 命中条目 | 中文里保留英文的条目数 | 例 |
|---|---:|---:|---|
| Connect | 80 | 35 | Click “Add environment” to pair another environment, or connect one from T3 Connect. → 点击“添加环境”以配对其他环境，也可以从 T3 Connect 连接环境。 |
| Agent | 34 | 20 | Agent activity disabled → 已停用 Agent 动态 |
| Token | 24 | 8 | Every token repaints the answer as it arrives. Slower and harder to read. Thinking traces still arrive a paragraph at a time. → 每个 Token 到达时都会重绘回复，速度较慢且不易阅读。思考过程仍逐段显示。 |
| Commit | 27 | 2 | Use Conventional Commit prefixes and keep change request text concise. → 使用 Conventional Commit 前缀，并保持变更请求文案简洁。 |
| Checkout | 47 | 1 | Switches the branch you are working in, like `gh pr checkout`. → 像 `gh pr checkout` 一样切换当前工作分支。 |
| Host | 73 | 1 | user@host or SSH alias → user@host 或 SSH 别名 |

## 说明

- 登记的形式来自对现有词库的实际观察，不是穷举；T05 补译时如出现新译法，需回填本表。
- 产品名、模型名、命令、代码标识不翻译（见 CONVENTIONS §3）。


## 定稿

T05（2026-10-05）定稿。每个术语只取一个译法；同一英文词有不同语义时按语义分列，并写明适用条件。依据：现有词库的多数用法、macOS 简体中文界面惯例（账户、标签页、跟随系统、停用等），以及 VS Code 中文界面的 Git 术语（拉取请求、检出、变基、暂存）。现有词库中与定稿不一致的译文已在 T05 一并修订，修订清单见 `dict/T05-changes.md`。

注意：一个 messages 词条只能有一个译法。同一英文串在不同位置语义不同时（如 `Plan`、`Build`、`Open`），按 0.0.46 源码里出现最多的语义取值，其余位置的取舍列在 `T05-changes.md` 的「拿不准」一节。

### 核心对象

| 英文 | 定稿 | 说明 |
|---|---|---|
| Thread | 任务 | 沿用旧词库（151 条）。Scheduled task 另译「定时任务」以示区分 |
| Scheduled task / Automation | 定时任务 / 自动化 | 「New task」「Edit task」等定时任务页的 task 一律译「定时任务」 |
| Project | 项目 | |
| Environment | 环境 | |
| Provider | 服务提供方 | 驱动/实例同此；Provider instance → 服务提供方实例 |
| Agent | Agent（保留英文） | 旧词库保留英文 20 条、「智能体」14 条（术语表口径），取多数；含「智能体」的 27 条（含误译的 assistant）已改。Subagent → 子 Agent，Parent agent → 父 Agent |
| Assistant（回复方） | 助手 | 旧词库曾误用「智能体」，已改 |
| Model | 模型 | |
| Reasoning / Effort | 推理 / 推理强度 | |
| Session | 会话 | |
| Turn | 轮次 / 本轮 | 「当前轮次」「本轮回复」 |
| Message / Prompt | 消息 / 提示词 | |
| Composer | 输入框 | 旧词库「输入区」21、「输入框」20（术语表口径），取聊天类应用常用的「输入框」；含「输入区」的 23 条已全部改掉 |
| Queue / Queued message | 队列 / 排队消息 | Queued → 已排队 |
| Steer | 调整 | 「调整当前运行」「作为调整发送」 |
| Follow-up | 后续消息 | |
| Fork（对话） | 分叉 | GitHub 仓库的 fork 仍译「复刻」 |
| Lineage | 谱系 | |
| Context / Compact | 上下文 / 压缩上下文 | Context compacted → 上下文已压缩 |
| Checkpoint | 检查点 | |
| Mention / Cite, citation | 提及 / 引用 | |
| Plan（模式） | 规划 | Plan mode → 规划模式 |
| plan（方案文档） | 方案 | Proposed plan → 建议方案，Implement plan → 实施方案 |
| plan（订阅） | 套餐 | 只用于订阅语境的句子；单独的 `Plan` 词条取「规划」 |
| Build（模式） | 执行 | Build mode → 执行模式；与「规划」成对 |

### 侧栏与任务状态

| 英文 | 定稿 | 说明 |
|---|---|---|
| Snooze / Snoozed | 暂缓 / 已暂缓 | 旧词库「稍后处理」11 条已全部改为「暂缓」；Wake → 唤醒 |
| Settle / Settled / Un-settle | 收起 / 已收起 / 恢复 | 冲突 `Settled` 定为「已收起」 |
| Pin / Pinned / Unpin | 置顶 / 已置顶 / 取消置顶 | 旧词库「固定」4 条已改 |
| Archive / Archived | 归档 / 已归档 | |
| Working（状态） | 进行中 | 侧栏「进行中」分区同此；Running → 运行中 |
| Waiting / Idle / Queued | 等待中 / 空闲 / 已排队 | 侧栏状态胶囊里的 Working/Waiting/Completed 等按 value-use 保持英文，原因见 T05-changes |
| Done（按钮）/ Completed（状态） | 完成 / 已完成 | |
| Sidebar | 侧栏 | 旧词库「侧边栏」4 条已改 |

### Git 与源代码管理

| 英文 | 定稿 | 说明 |
|---|---|---|
| Repository | 仓库 | |
| Branch / Base branch | 分支 / 基础分支 | |
| Ref | 引用 | Default ref → 默认引用 |
| Worktree | 工作树 | |
| Checkout（名词，工作副本） | 检出目录 | |
| check out / checkout（动词） | 检出 | 旧词库「签出」8 条已改 |
| Commit / Push / Pull / Merge / Rebase | 提交 / 推送 / 拉取 / 合并 / 变基 | |
| Squash and merge / Rebase and merge | 压缩并合并 / 变基并合并 | |
| Stash（输入框暂存） | 暂存 | |
| Pull request | 拉取请求 | 缩写 PR 保留英文 |
| Review（代码评审） | 评审 | 一般义「检查/查看」按语义 |
| Diff / Changes | 差异 / 更改 | |
| Stack（堆叠 PR） | 堆栈 | |
| detached HEAD | 分离的 HEAD | |
| Host（代码托管方） | 托管服务 | 句子里按语义；单独的 `Host` 词条取「主机」 |
| Source control | 源代码管理 | |

### 设置与通用界面

| 英文 | 定稿 | 说明 |
|---|---|---|
| Settings / General / Appearance | 设置 / 常规 / 外观 | |
| Keybindings / Shortcut | 快捷键 | |
| Account | 账户 | macOS 用「账户」；旧词库「账号」19 条已改 |
| Sign in / Sign out / Log out | 登录 / 退出登录 / 退出登录 | |
| Enable / Enabled | 启用 / 已启用 | |
| Disable / Disabled | 停用 / 已停用 | 旧词库「禁用 / 已禁用」8 条已改 |
| Remove / Delete | 移除 / 删除 | |
| System（外观/语言选项） | 跟随系统 | 冲突 `System` 定为「跟随系统」 |
| Default | 默认 | |
| Tab | 标签页 | macOS 用「标签页」；冲突 `Pull request tabs` 定为「拉取请求标签页」 |
| Back | 返回 | 冲突定值；浏览器的后退按钮同用此词条 |
| Open（动词） | 打开 | 冲突定值；拉取请求状态 Open 共用此词条 |
| Approve / Decline | 批准 / 拒绝 | 冲突定值 |
| Copied | 已复制 | |
| Server | 服务器 | 旧词库「服务端」6 条已改 |
| Machine / Computer | 设备 | this machine → 本机 |
| Device（模拟器/真机） | 设备 | |
| Simulator / Emulator | 模拟器 | |
| Host（机器） | 主机 | |
| Relay / Tunnel / Pairing | 中继 / 隧道 / 配对 | |
| Snapshot / Capture（截图功能） | 截图 | |
| Usage / Limits / Usage limit | 用量 / 限额 / 用量限额 | |
| Credentials | 凭据 | |
| Token（模型计量） | Token（保留英文） | 旧词库误作「令牌」的 18 条已改 |
| token（认证、配对） | 令牌 | API token、配对令牌等 |
| setup script / worktree setup | 初始化脚本 / 工作树初始化 | 冲突 `setup` 定为「初始化」 |
| Supervised（运行模式） | 需确认 | 与「自动接受编辑 / 自动 / 完全访问」并列 |

### 时间与计量

| 英文 | 定稿 | 说明 |
|---|---|---|
| `{n}s` / `{n}m` / `{n}h` / `{n}d` / `{n}ms` | `{n} 秒` / `{n} 分钟` / `{n} 小时` / `{n} 天` / `{n} 毫秒` | 与旧词库 `{minutes}m`、`{hours}h {minutes}m` 一致；多单位组合（`{m}m {s}s` → `{m} 分 {s} 秒` 等）逐一补了模板，运行时实测见 handoff |
| `in {n}m` / `Expires in …` | `{n} 分钟后` / `… 后过期` | |
| `{n}k`、`{n}K/M/B/T`、`{n} B/KB/MB` | 原样 | 计数缩写和字节单位不译 |
| just now / now | 刚刚 / 现在 | |

### 保留英文的词（定稿）

- 产品名与服务名：T3 Code、T3 Connect、T3 Chat、Claude、Claude Code、Codex、Cursor、OpenCode、Grok（含 Grok Build）、Gemini（含 Gemini Enterprise）、Pi、Antigravity、ChatGPT、GitHub、GitLab、Bitbucket、Azure DevOps、Forgejo / Gitea、Tailscale、TestFlight、Google Play、App Store、Open VSX、Agent Platform (Vertex AI)、Sentry
- 模型名与型号：GPT-*、各编辑器名（VS Code、Zed、IntelliJ IDEA 等）、设备型号（iPhone 12 Pro、Pixel 7 等）、主题名（Aurora、Grove、Ocean 等）
- 技术缩写与格式：ACP、MCP、CLI、API、SSH、HTTPS、URL、JSON、YAML、OTEL、WSL、Git、PR、HEAD、CPU、GPU、PID、HEX、RGB、3D、Face ID
- 渠道名：Nightly、Alpha、Dev
- 按键名：Enter、Esc、Shift、Ctrl、Alt、Option、Command、Control、Space、Super、Up、Down、Right、Backspace
- 命令、参数、代码标识、环境变量、路径与占位示例：`npx t3 serve`、`t3 connect`、`--tailscale`、`origin`、`bun test`、`VARIABLE_NAME`、`model-slug`、`my-project-id`、`us-central1` 等
- Agent、Token（模型计量）：见上表
