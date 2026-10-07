# t3code-zh：T3 Code 简体中文界面（非官方）

给 [T3 Code](https://github.com/pingdotgg/t3code) 桌面版做的简体中文界面。上游源码不改，构建时把界面文字换成运行时查表，界面里可以随时在「跟随系统 / English / 简体中文」之间切换。

> **非官方项目**，与 T3 Tools Inc. 没有关联。「T3 Code」名称归上游所有。本仓库只有汉化层（词库、构建插件、补丁、脚本），不含上游源码，也不提供安装包，需要自己构建。

## 当前状态

| 项 | 值 |
|---|---|
| 上游基线 | `v0.0.46-nightly.20261007.2774`（commit `611132c171f3`） |
| 最新构建 | `0.0.46-n2774.zh.4`（macOS Apple Silicon） |
| 词库 | 界面 5166 条精确词条 + 1100 条模板；桌面主进程 62 + 7 条 |
| 覆盖率 | 可翻译位置 6657 处，已翻译 6623 处（99.5%） |
| 测试 | 插件 / 配置测试 815 项、词库校验测试 17 项 |

覆盖率按「构建插件判定为可翻译的位置」统计，句中夹变量的 JSX 等位置单独统计，**不等于整个界面 100% 中文**，见下方「已知限制」和 `reports/`。

## 原理

1. **构建时转换**：`plugin/vite-plugin-t3zh.ts` 在上游 web 构建里把界面文字（JSX 文本、`placeholder`/`title`/`aria-label` 等属性、`label`/`description` 等对象属性……）包成 `__t3zh_t(原表达式)`。哪些位置能转、哪些绝不能转（比较、对象键、`as const`、错误信息等），判定只写在 `plugin/matcher.ts`。规则见 [CONVENTIONS.md](CONVENTIONS.md) §4。
2. **运行时查表**：`runtime/t3zh-runtime.ts` 先查精确词条，再按模板匹配，查不到原样返回。语言是 `en` 时直接返回原文，所以英文界面和原版一致。
3. **补丁**：插件处理不了的地方（语言设置入口、同时被当作值比较的文字、句中嵌变量的混排句、桌面主进程菜单等）做成 `patches/` 里的 16 个补丁，构建时按编号依次应用。见 [patches/README.md](patches/README.md)。
4. **词库**：`dict/zh-CN.json`（web 界面）和 `dict/zh-CN.desktop.json`（桌面主进程），术语表在 `dict/glossary.md`。

## 目录

```
dict/          词库、术语表、待译清单
plugin/        构建插件、转换判定、桌面主进程汉化，以及测试
runtime/       运行时查表
build/         web 构建的包装配置
patches/       必须改上游文件的补丁（按编号应用）
scripts/       构建、词库校验 / 合并 / 回归、覆盖率报告、升级脚本
reports/       覆盖率报告（构建时自动刷新）
docs/          构建手册 BUILD.md、跟进上游 nightly 的手册 UPGRADE.md
CONVENTIONS.md 词库格式、转换边界、运行时与版本号约定
```

以下目录由脚本生成，已在 `.gitignore` 里：`upstream/`（基线源码，只读）、`.build/src/`（构建用源码）、`release/`（产物）、`node_modules/`。

## 构建

需要 macOS（Apple Silicon）、Node 24（上游要求 `^24.13.1`）、git、Xcode Command Line Tools、[Vite+](https://vite.plus)（`vp` 命令）、Rust（打包时编译 resource-monitor）。安装命令和各工具实测版本见 [docs/BUILD.md](docs/BUILD.md) §0。

下面按 `~/Projects/t3code`（上游克隆）和 `~/Projects/t3code-zh`（本仓库）的布局写。

```sh
# 1. 上游克隆（blobless，按需下载）和本仓库
git clone --filter=blob:none https://github.com/pingdotgg/t3code.git ~/Projects/t3code
git clone <本仓库地址> ~/Projects/t3code-zh
cd ~/Projects/t3code-zh && npm ci

# 2. 基线 tag 建两个工作树：upstream/ 只读参考，.build/src 专供构建
TAG=v0.0.46-nightly.20261007.2774
git -C ~/Projects/t3code fetch origin tag "$TAG" --no-tags
git -C ~/Projects/t3code worktree add --detach ~/Projects/t3code-zh/upstream   "$TAG"
git -C ~/Projects/t3code worktree add --detach ~/Projects/t3code-zh/.build/src "$TAG"

# 3. 一键构建（还原工作树 → 装依赖 → 打补丁 → 构建 web / server / desktop → 打包 → 覆盖率报告 → 检查）
scripts/build-zh.sh 0.0.46-n2774.zh.1
```

产物在 `release/<版本号>/`，有 `.dmg` 和 `.zip`。版本号格式是 `0.0.46-n<nightly 号>.zh.<N>`，不能含 `-nightly.`，否则产品名会变成官方的 `T3 Code (Nightly)`。首次装依赖需要几分钟，之后整套构建约一两分钟。常见问题见 [docs/BUILD.md](docs/BUILD.md) §5。

测试：

```sh
npm run test:plugin        # 需要 upstream/；也可以用 T3ZH_UPSTREAM=<源码目录> 指定
npm run test:check-dict
npm run check-dict
```

## 先在沙盒里试

```sh
V=0.0.46-n2774.zh.1
ditto -x -k "release/$V/T3-Code-$V-arm64.zip" "release/$V/app"
pgrep -fl "T3 Code"        # 先退出其他 0.0.46 实例（官方 Nightly 或已安装的汉化版）
unset ELECTRON_RUN_AS_NODE # 带着它启动会变成 Node 进程，没有窗口
open -n --env T3CODE_HOME=$HOME/.t3-zh-test --env T3CODE_DISABLE_AUTO_UPDATE=1 \
  "release/$V/app/T3 Code (Alpha).app"
```

`T3CODE_HOME` 指向沙盒目录，不会动 `~/.t3/userdata` 里的真实数据。**但所有 0.0.46 正式包的 Electron 配置目录都是 `~/Library/Application Support/t3code-v2`，不受 `T3CODE_HOME` 影响**，两个 0.0.46 实例同时开会互相覆盖界面设置和草稿。

语言在「设置 → 常规 → 语言」里切换，改完页面会刷新。

## 安装到正式环境

1. **先备份 `~/.t3/userdata`**。从 0.0.45 及更早版本升级时，0.0.46 首次启动会把 `state.sqlite` 迁移成 `statev2.sqlite`（旧库保留，但之后两边不再同步）。数据库用 `sqlite3 ~/.t3/userdata/state.sqlite ".backup '<备份目录>/state.sqlite'"` 备份，比直接复制可靠。
2. 退出所有 T3 Code，把原来的 `/Applications/T3 Code (Alpha).app` 移到别处保留，用来回滚。
3. `ditto "release/<版本号>/app/T3 Code (Alpha).app" "/Applications/T3 Code (Alpha).app"`，然后正常打开。

需要知道的几点：

- **不会自动更新**：包里没有 `app-update.yml`，上游的自动更新不会启用，所以不会被官方版本覆盖；更新靠自己重新构建。
- bundle id 和官方一样（`com.t3tools.t3code`），产品名是 `T3 Code (Alpha)`，会替换同名 app。
- 只有 ad-hoc 签名、没有公证。本机构建的在本机能正常打开；分发给别人时会被 Gatekeeper 拦下。

## 跟进上游 nightly

见 [docs/UPGRADE.md](docs/UPGRADE.md)：`scripts/upgrade-check.sh <新 tag>` 体检，按清单移植补丁、补译，`scripts/switch-baseline.sh <新 tag>` 切基线，再构建。上游克隆不在 `~/Projects/t3code` 时设置 `T3ZH_UPSTREAM_REPO`。

## 已知限制

- `Ultrathink`、`Ultracode` 保持英文，与输入框里的 `Ultrathink:` 前缀一致；推理档位和服务端下发的其他选项只按固定名单翻译，名单外的说明（如 Ultracode 的档位说明）保持英文。
- 源代码管理设置里的部分说明（Jujutsu、Bitbucket、「Not available on this server: …」）保持英文。
- 账号弹层（`Manage account`、`Sign out` 等）由 Clerk SDK 生成，保持英文；只翻译了账号按钮的读屏名称。
- 旧版侧栏、命令面板、通知里的默认名 `New thread` / `No project` 保持英文。
- 定时任务 Webhook 里含 `{{body.path}}` 的说明句，以及 Webhook 默认提示词（会保存并发给 agent）保持英文。
- 文件预览面板（不是附件预览）超过 1 MB 的提示保持英文。
- 以下界面还没在实机上验证过：Agents / 派活入口、远程路由、Webhook 投递记录、空占位符提示、工具输出或 HTML 预览加载失败、大附件预览。
- 系统语言是简体中文的 Mac 上，界面切到 English 时，日期、数字格式可能跟着系统变成中文格式（app 声明了简体中文本地化，见 CONVENTIONS §5）。
- web 和 server 的版本号是汉化版版本号。连接比它旧的远程 server 时，界面给出的升级命令会指向 `t3@0.0.46-n…zh.…`，npm 上没有这个版本，需要自己改成官方版本号。

## 关于仓库内容

- 初版词库是从 [ZhiweiXiao98/t3code](https://github.com/ZhiweiXiao98/t3code)（MIT）发布的 0.0.45 中文版 app 里提取的（`scripts/extract-dict.ts`，读取本机的旧版备份，只作为历史记录保留，无法直接复现），之后按 0.0.46 源码补译并统一术语。感谢原作者的翻译工作。
- 开发时用的任务说明、审核报告和交接记录（`tasks/`、`reviews/`、`handoff/`）没有放进公开仓库，代码注释里引用这些文件的地方可以忽略。

## 许可证

[MIT](LICENSE)。上游 T3 Code 的许可证见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
