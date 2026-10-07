# 旧词库提取报告

- 基线：`v0.0.46-nightly.20261004.2644`
- 源文件：`apps/server/dist/client/assets/server-PkaaCpC9.js`
- 备份 sha256：`c04bb5e7d3568a5212f4b8f3bf292dc42d2b6f8d76b00fe72f017f56092b8d57`

## 各来源条目数

| 来源 | 对象 | 条目数 | 说明 |
|---|---|---|---|
| 来源1 | `c` | 956 | 英文 → 中文直映射 |
| 来源2 | `l` | 227 | 位置占位符模板 |
| 来源3/4 | `u + d["zh-CN"]` | 2747 | 按 key 配对（配对前两侧各 2747 条） |
| 来源5 | `p` | 542 | 覆盖表，spread 部分不重复计数 |
| **合计** | | **4472** | |

## 合并结果

| 项 | 数量 |
|---|---|
| messages | 3464 |
| templates | 668 |
| 主词库合计 | 4132 |
| 冲突条数（同一英文多个中文） | 56 |
| 冲突中被舍弃的候选 | 59 |
| 同英文同中文的重复条目（去重消失） | 266 |
| 无效条目 | 3 |
| 未翻译（中文 = 英文） | 12 |

## 对账

```
五个来源条目总数        4472
= 主词库条目            4132
+ 冲突中被舍弃的候选    59
+ 重复条目（去重）      266
+ 无效条目              3
+ 未翻译                12
= 4472
```
对账结果：**一致 ✅**

说明：分类只对「有效条目」做，无效 / 未翻译条目在去重之前就被剔除，因此不计入重复数。
有效条目 4457 = 主词库 4132 + 冲突舍弃 59 + 重复 266；
有效 4457 + 无效 3 + 未翻译 12 = 4472，与来源总数一致。

### 重复条目的来源分布

同一英文在不同来源里给出了完全相同的中文时，去重后只保留一份；下表是这些重复出现在哪两个来源之间。

| 重复出现于 | 条数 |
|---|---:|
| 来源 3/4 与 3/4 | 183 |
| 来源 3/4 与 5 | 76 |
| 来源 1 与 3/4 | 5 |
| 来源 1 与 5 | 2 |

其中「来源 3/4 与 3/4」是指 obj4 里不同的 key 指向了相同的英文原文（2747 个 key 对应 2525 个不同英文），
「3/4 与 5」是覆盖表把 key 式里已有的映射原样再列了一遍；这些都不影响最终取值，只是同一句被记了两遍。

## 无效条目分类

| 原因 | 条数 |
|---|---|
| placeholder-mismatch | 3 |

## 未翻译（中文 = 英文，不进主词库）

| 英文 | 来源 |
|---|---|
| · PID {0} | 2 |
| English | 3/4 |
| Hub URL | 3/4 |
| CPU | 3/4 |
| Span | 3/4 |
| Trace | 3/4 |
| GPU | 3/4 |
| Tailscale HTTPS | 3/4 |
| Conventional Commits | 3/4 |
| Git URL | 3/4 |
| Mac mini | 5 |
| Mac Studio | 5 |

## 随机抽样 20 条

（固定随机种子 20261004，两次运行结果一致）

| # | 英文 | 中文 | 来源 | 位置 |
|---|---|---|---|---|
| 1 | Use these rules for this project. | 此项目使用这些规则。 | 1 | messages |
| 2 | Close {name} | 关闭 {name} | 3/4 | templates |
| 3 | Waiting for {environment}'s configuration. | 正在等待 {environment} 的配置。 | 3/4 | templates |
| 4 | Default viewport height | 默认视口高度 | 3/4 | messages |
| 5 | Git fetch interval | Git 拉取间隔 | 3/4 | messages |
| 6 | Filters | 筛选 | 3/4 | messages |
| 7 | Undo reset | 撤销重置 | 5 | messages |
| 8 | New model | 新模型 | 1 | messages |
| 9 | Mixed cells keep each environment’s rate until you edit them. | 值不同的单元格会保留各环境原有价格，直到你进行编辑。 | 5 | messages |
| 10 | Current CPU | 当前 CPU | 3/4 | messages |
| 11 | Reset to automatic | 恢复自动定价 | 5 | messages |
| 12 | Approving... | 正在批准... | 3/4 | messages |
| 13 | Copy checkout path | 复制检出目录路径 | 3/4 | messages |
| 14 | Select a project | 选择项目 | 5 | messages |
| 15 | Sort | 排序 | 3/4,5 | messages |
| 16 | Scan limit reached. Some projects or conversations may be missing. | 已达到扫描上限，部分项目或对话可能未显示。 | 5 | messages |
| 17 | Pull | 拉取 | 3/4 | messages |
| 18 | {percent}% of the window elapsed | 时间窗口已过去 {percent}% | 3/4 | templates |
| 19 | Send activity to mobile notifications and Live Activities without T3 Connect. | 无需 T3 Connect，即可将动态发送到移动端通知和实时活动。 | 3/4 | messages |
| 20 | Event log | 事件日志 | 1 | messages |

