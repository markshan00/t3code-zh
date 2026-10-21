# 跟进上游版本：汉化迭代手册

以**当前汉化版**（基线源码 + `patches/` + 词库）为起点，只处理新版本相对当前基线的增量。按维护者 2026-10-19 的决定，只跟进官方正式 Release，不主动跟进 Nightly / Preview。每轮开始后不随上游继续变更目标。

T23 已完成从 `v0.1.0` 到正式版 `v0.1.1` 的迁移，交付双平台 `0.1.1-zh.1`；最终状态与限制见 `handoff/T23.md`。

T21 从 `v0.0.46-nightly.20261010.2935` 迁移到正式版 `v0.1.0`，macOS ARM64 与 Windows x64 共用一套汉化输入；实际交付状态见 `handoff/T21.md`。

第一次按本手册迭代：2026-10-06，`v0.0.46-nightly.20261004.2644` → `v0.0.46-nightly.20261005.2702`（120 个上游提交）。

「谁做」一列是本项目开发时的 AI 分工（主会话负责调度，其余模型分别负责移植和审核），一个人照做时全部自己来即可。上游仓库默认在 `~/Projects/t3code`，放在别处时设置 `T3ZH_UPSTREAM_REPO`。

## 流程

| 步 | 做什么 | 命令 / 产物 | 谁做 |
|---|---|---|---|
| 1 体检 | 拉新 tag、建 `.build/next`、补丁试打、构建链守卫、覆盖率报告、待译清单、异形调用扫描、测试对新源码 | `scripts/upgrade-check.sh <新 tag>` → `reports/upgrade/<新 tag>.md` | 主会话（脚本，约 20 秒） |
| 2 补丁 | 体检里 ❌ 的补丁移植到新源码，只移植、不增删汉化内容；自检「+」行与旧补丁相同、全序 apply 通过 | `patches/README.md`「上游变化后怎么重做」 | 执行模型，A 段（在 `/tmp` 里做，产出补丁文件） |
| 3 翻译 | 填待译清单：界面文字填 `zh`；刻意不译的填 `skip` 写理由（以后不再列出）；复数后缀模板的单 / 复数两条、其他手加词条写进 `.extra.json` | `dict/todo/<新 tag>.json`（`scripts/dict-todo.ts` 生成，增量保留已填） → `node scripts/dict-merge.ts dict/todo/<新 tag>.json dict/todo/<新 tag>.extra.json`（先校验再写入，失败时词库不动）→ `node scripts/dict-regress.ts .build/next`（对比合并前词库：原本译好的文字有没有被新模板截走，「回归」必须为 0） | 执行模型，A 段 |
| 4 切换基线 | 改写基线标识（build-zh.sh、report.ts、CONVENTIONS §1、两份词库、补丁头），`upstream/`、`.build/src` 切到新 commit；重新生成桌面字符串附录、处理新增条目的归类 | `scripts/switch-baseline.sh <新 tag>`；`node plugin/desktop/survey-strings.ts > s.tsv && node plugin/desktop/classify-strings.ts s.tsv > reports/desktop-main-strings-appendix.md`；全套测试 | 执行模型，A 段 |
| 5 构建与网页检查 | 交付构建、installer、发布卫生扫描（B 段）；网页沙盒中英文检查（C 段） | 正式版用 `scripts/build-zh.sh 0.1.0-zh.1`；随后运行 `scripts/make-installer.ts`、`scripts/release-hygiene.ts`、`scripts/web-check/run.ts`。Windows 入口为 `.github/workflows/build-windows.yml`，使用相同版本及冻结的汉化输入 | 执行模型，B / C 段 |
| 6 审核 | 一轮全量审核增量 + 至多一轮窄审（见下面收敛规则） | `reviews/T<nn>-r1.md` | 主会话（执行和审核换模型） |
| 7 验收 | 在沙盒里手动检查主要页面，确认后再替换正式安装（见 README「安装到正式环境」） | | 维护者 |

`T3ZH_UPSTREAM=<源码目录>` 可以让 plugin 测试和桌面字符串普查读任意源码目录（默认 `upstream/`），第 1 步就是这样在不切基线的情况下对新源码跑测试的。

## 派活方式（2026-10-11 起）

T19 的执行线程从头做到尾，一共 105 次工具调用，单次请求的上下文从 2.3 万 token 涨到 46 万；每步间隔的中位数从开头的 15 秒涨到最后的 100 秒，最慢一步超过 9 分钟。为此维护者定了下面的做法，推理档一律保持 xhigh，不为提速调低。

1. **分三段派，每段一个新任务（新的上下文）**：
   - **A 段**：补丁移植、翻译、切换基线、新补丁和测试、全套检查（第 2–4 步）；
   - **B 段**：交付构建、installer、发布卫生扫描（第 5 步前半）；
   - **C 段**：网页沙盒中英文检查、文档、交接（第 5 步后半）。

   每段结束，在 `handoff/T<nn>.md` 写本段一节（做了什么、实际命令和结果、留给下一段的事），然后停下。主会话抽查后再派下一段；A 段的问题要在构建之前打回。三段共用同一份任务书，每段的派活提示词写明只做哪一段。
2. **输出纪律**（写进每份任务书）：
   - 长输出（测试、构建、扫描、整页 DOM）一律写进日志文件，只读结尾或摘要；
   - 网页文字由页面脚本写进证据文件，工具只返回一两行摘要；
   - 不要把整份日志或补丁读进对话。
3. **重复的部分用脚本**（T20 已完成，2026-10-11）：全套检查用 `scripts/run-checks.ts`，installer 用 `scripts/make-installer.ts`，发布卫生用 `scripts/release-hygiene.ts`，网页检查用 `scripts/web-check/`；清单每轮只补新界面的项，旧项自动当回归。脚本的用法见 `docs/BUILD.md`「迭代脚本」。

## 判定口径（翻译时）

- **界面文字**一律译，术语以 `dict/glossary.md` 定稿为准；`packages/contracts/src/settings.ts` 的 provider 设置 schema 会渲染成设置表单，属于界面。
- **不译**（填 `skip`）：发给 AI 的 MCP 工具 / schema 说明（`packages/contracts` 的 orchestratorMcp、scheduledTask、previewAutomation、threadMetadataMcp 等）、产品名与格式名（Tailscale、HTML、hex、base64…）、颜色值、类名、代码示例。
- **模板误配**（`collision`）：静态文字会被某条宽模板截走，补精确词条就好；带表达式的补一条骨架相同的专用模板。
- **复数后缀模板**（`… pull request{1}`，`{1}` 是 `""` / `"s"`）：不能直接加，否则中文后面会多出 "s"；在 `.extra.json` 里补单、复数两条具体模板（`… {count} pull request` / `… {count} pull requests`），原条目填 `skip` 说明已覆盖。
- 词库校验会拒收含 `{{…}}` 嵌套花括号的文字（`check-dict.ts`），这类保持英文，填 `skip`。

## 收敛规则（防止审核循环）

T03 曾因审核方不断构造新的理论反例、在同一类问题上来回九轮。迭代审核一律按下面执行，写进每轮审核任务书：

1. **范围只看增量**：本次迭代改动的补丁、词库新增 / 修改条目、脚本，以及上游新增代码里的汉化影响。已关闭任务的结论不重开。
2. **阻断 / 重要只有一种来源**：在新基线的真实代码或产物里能复现，且会让界面显示错误译文、中英夹杂，或改变数据 / 比较 / 发给服务端的值。构造出来的理论反例、测试还能更全、措辞偏好，一律记「次要」。
3. **轮数上限**：r1 全量；有重要 / 阻断才修并开 r2，r2 只核 r1 的问题是否关闭。r2 之后还有新发现的，按第 2 条复核：真实可复现的修掉、在交接里说明，不再开 r3；其余写进已知限制。次要项不单独开轮。
4. **matcher 不随迭代改**：`scripts/check-exotic-forms.ts`（体检第 6 节）报警类全为 0 时，matcher 不动。某类从 0 变非 0，才按 CONVENTIONS §4 收敛标准评估，而且只看真实命中。
5. **审核不做变异测试**：审核方复跑全套测试即可，不再故意改坏代码验证测试是否有效。执行方写新测试时可以自行验证。审核报告只写三部分：结论、问题清单（级别 / 位置 / 复现 / 修法）、实际执行的命令和结果。
6. 体检报告里的数字（覆盖率、误配数、测试失败数）是工作清单，不是验收门槛；验收门槛是：全套测试通过、构建 13 步全过、沙盒实机主要页面无英文残留（已知限制除外）。

## 版本号

正式版使用 `<上游版本>-zh.<N>`，如 `v0.1.0` → `0.1.0-zh.1`，两个平台使用相同版本号。历史 Nightly 使用 `0.0.46-n<nightly 号>.zh.<N>`。同一基线每次对外交付 N 加 1；任务内验证包可用 `-check`，不得交付。不能出现官方 `-nightly.` 版本形态（CONVENTIONS §6）。

## 双平台验收的并行边界

公共补丁和词库冻结后，Mac 打包与 Windows CI 可以并行。Mac installer、发布卫生和网页模块比对都会挂载同一个 DMG，必须顺序执行；审核只读挂载也须协调，避免 hdiutil 返回资源忙。网页验收用最终 installer，不能把重建前的 ASAR 哈希或检查结果记到新包名下。
