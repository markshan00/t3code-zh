# 构建手册（T01 建立，后续任务据此复现）

基线：

- tag `v0.0.46-nightly.20261004.2644`
- commit `737993303d36e10674c54b95e5bd3826682c99c7`
- 上游仓库 `~/Projects/t3code`（blobless 部分克隆，检出时按需下载，需要网络）

本文件记录从零到产物的完整步骤。所有命令都实际跑过，耗时是实测值。

> 本手册写于首个基线 2644，命令里的 tag / commit 是当时的值。**当前基线以 [CONVENTIONS.md](../CONVENTIONS.md) §1 为准**，照做时换成当前值即可；日常构建只需要 README 里的步骤。目录按 `~/Projects/t3code`（上游克隆）和 `~/Projects/t3code-zh`（本仓库）的布局书写，放在别处时替换路径。

## 0. 本机环境版本（实测）

| 工具 | 版本 | 备注 |
|---|---|---|
| macOS | 26.6.2 (25G83) | |
| Xcode Command Line Tools | `/Applications/Xcode.app/Contents/Developer` | clang 21.0.0 (clang-2100.3.34.2) |
| Node | v24.14.0 | 上游 `engines.node` 为 `^24.13.1`，满足 |
| package manager | pnpm v11.10.0 | 由 `vp` 管理 |
| vp (Vite+) | v1.0.0 | `curl -fsSL https://vite.plus \| bash` 安装 |
| rustc | 1.99.0 (b940084d7 2026-09-28) | `--profile minimal`，target `aarch64-apple-darwin` |
| cargo | 1.99.0 (5f94df478 2026-08-27) | |

### 环境准备

```sh
# vp（Vite+ CLI）。VP_NODE_MANAGER=no 跳过它自己的 Node 安装提示，改用本机 Node。
export VP_NODE_MANAGER=no
curl -fsSL https://vite.plus | bash
# 装完把环境加进当前 shell（zsh）
. "$HOME/.config/vite-plus/env"

# Rust（mac 打包要编译 native/resource-monitor）
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --profile minimal
. "$HOME/.cargo/env"
```

每个新 shell 都要先 `. "$HOME/.config/vite-plus/env"` 和 `. "$HOME/.cargo/env"`，否则 `vp` / `cargo` 不在 PATH。

## 1. 拉基线、建工作树

```sh
git -C ~/Projects/t3code fetch origin tag v0.0.46-nightly.20261004.2644 --no-tags
git -C ~/Projects/t3code rev-parse 'v0.0.46-nightly.20261004.2644^{commit}'
# => 737993303d36e10674c54b95e5bd3826682c99c7

git -C ~/Projects/t3code worktree add --detach ~/Projects/t3code-zh/upstream   v0.0.46-nightly.20261004.2644
git -C ~/Projects/t3code worktree add --detach ~/Projects/t3code-zh/.build/src v0.0.46-nightly.20261004.2644
```

- `upstream/`：只读参考。
- `.build/src/`：构建用工作树，**只允许 `scripts/build-zh.sh` 修改**（T01 首次建树除外）。

## 2. 装依赖（在 `.build/src`）

```sh
cd ~/Projects/t3code-zh/.build/src
vp i --frozen-lockfile
```

- **实测耗时：首次（冷）5m20.2s；再次（热）1.3s。**
- **必须带 `--frozen-lockfile`。** 不带时 `vp i` 会改写 `pnpm-lock.yaml`（见 §5 的 lockfile 说明）。
- 冷装慢主要取决于 npm registry 的速度（实测环境里多条请求 10–30s）。属正常，不要为此改全局 npm 配置。

## 3. 原版构建（在 `.build/src`）

```sh
cd ~/Projects/t3code-zh/.build/src
time T3CODE_DESKTOP_VERSION=0.0.46-n2644.base \
     T3CODE_DESKTOP_OUTPUT_DIR=$HOME/Projects/t3code-zh/release/base \
     vp run dist:desktop:dmg:arm64
```

- **实测耗时：2m37.7s（全程，`real 2m37.682s`，EXIT 0）。**
- 产物（`release/base/`）：
  - `T3-Code-0.0.46-n2644.base-arm64.dmg`（160M）
  - `T3-Code-0.0.46-n2644.base-arm64.zip`
  - 两个 `.blockmap`、`builder-debug.yml`

### 分阶段实际耗时（本次构建）

数据源：构建脚本自身打的时间戳日志，见 `build-base.log`（本次实测完整输出，`[HH:MM:SS.mmm]` 为日志行的本地时间）。

| 阶段 | 开始 | 结束 | 耗时 | 证据来源 |
|---|---|---|---|---|
| web + server(server bundle) + desktop 构建（`vp run build:desktop`） | 22:26:27.330 | 22:26:51.073 | **23.7s** | 日志 `[desktop-artifact] Building desktop/server/web artifacts...` → `Applied production web client branding.` |
| cargo 编译 resource-monitor（在上一阶段内） | 未单独计时 | 未单独计时 | **未单独计时**（`build:resource-monitor` 是 `vp run build:desktop` 的一部分，日志未为其单独打点） | 不适用；**不要用目标文件 mtime 代替耗时** |
| staging 发布 app + 安装 staged 生产依赖 | 22:26:51.074 | 22:27:46.317 | **55.2s** | `Staging release app...` → `Building mac/dmg ...` |
| electron-builder 打包（dmg/zip + blockmap） | 22:27:46.317 | 22:29:03.188 | **76.9s** | `Building mac/dmg (arch=arm64, version=0.0.46-n2644.base)...` → `Done. Artifacts:` |
| **合计** | 22:26:27.330 | 22:29:03.188 | **155.9s（2m35.9s）**；`time` 报告的 `real` 为 2m37.7s，差值为脚本启动/收尾开销 | 同左 |

注：这些时间戳是 T01 本次构建的真实日志；未为补文档重跑构建。

### 版本号 / 输出目录的两种传法

`scripts/build-desktop-artifact.ts` 同时支持环境变量和 CLI 参数，**CLI 参数优先**：

| 项 | 环境变量 | CLI 参数 |
|---|---|---|
| 版本号 | `T3CODE_DESKTOP_VERSION` | `--build-version` |
| 输出目录 | `T3CODE_DESKTOP_OUTPUT_DIR` | `--output-dir` |
| 跳过构建 | `T3CODE_DESKTOP_SKIP_BUILD` | `--skip-build` |

依据：`scripts/build-desktop-artifact.ts:1574-1576`（env 定义）、`:3945-3955`（flag 定义）、`:1651-1660`（`mergeOptions(input, env, default)`，input 在前即 CLI 优先）。

实测用的是环境变量方式，生效（产物名和 plist 版本号都是 `0.0.46-n2644.base`）。

## 4. 只打包、跳过构建（T03 构建脚本依赖此路径）

```sh
cd ~/Projects/t3code-zh/.build/src
time T3CODE_DESKTOP_VERSION=0.0.46-n2644.base \
     T3CODE_DESKTOP_OUTPUT_DIR=$HOME/Projects/t3code-zh/release/base-skip \
     vp run dist:desktop:dmg:arm64 --skip-build
```

- **实测耗时：36.5s（`real 0m36.515s`），EXIT 0。** 跳过构建后各阶段：staging 22:30:01.108 → 22:30:02.076（1.0s）；安装 staged 生产依赖 → 22:30:02.710（0.6s）；electron-builder 打包 22:30:02.710 → 22:30:36.762（**34.1s**）。证据来源同 `build-skip.log`。
- 机制：`:3472-3482` `if (!options.skipBuild)` 为 false 时不再 spawn `vp run build:desktop`，直接用已有的 `apps/desktop/dist-electron`、`apps/server/dist`、`apps/desktop/resources`（`:3484-3496` 校验三者存在，缺则报 `MissingDesktopBuildInputError`）。
- 产物内容与全量构建**相同**（ZIP 内 109 个路径一致，plist/ASAR 内容一致）；不是逐字节相同（见 §10 说明）。

## 5. 已知问题与解决办法

### 5.1 `vp i` 会改写 `pnpm-lock.yaml`（必须用 `--frozen-lockfile`）

不带 `--frozen-lockfile` 时，`vp i` 会重写 lockfile，diff 为 1 增 2 删，**纯元数据、与镜像无关**：

```diff
@@ -4732,7 +4732,6 @@ packages:
     cpu: [x64]        # @rolldown/binding-linux-x64-gnu 的元数据
     os: [linux]
-    libc: [glibc]
@@ -8194,6 +8193,7 @@ packages:
   glob@7.2.3:
-    deprecated: Old versions of glob are not supported...
+    deprecated: Glob versions prior to v9 are no longer supported
```

原因：`vp i` 走 `pnpm install`，pnpm 会用本机解析器规范化 lockfile 元数据（补 `libc` 字段）并按 registry 实际返回刷新 `deprecated` 文本。与所用 npm 镜像无关（是 pnpm 自身行为）。

**结论：T03 的构建脚本一律用 `vp i --frozen-lockfile`。** 实测冷装后锁文件会变，加 `--frozen-lockfile` 后锁文件保持不变（实测 1.3s，EXIT 0，`git status` 干净）。若确需更新 lockfile，应显式安装并在 review 中说明，不要让构建脚本静默改写。

### 5.2 `ELECTRON_RUN_AS_NODE=1` 会让打包产物起不来（T08 注意）

如果当前 shell 里带有 `ELECTRON_RUN_AS_NODE=1`（Claude Code 的 bash 工具环境实测就带这个），`open -n` 及直接执行产物二进制都会起不来：主进程以 Node 模式启动、不加载 app.asar，无窗口、无报错、无日志。

**验证方法：** 启动前 `unset ELECTRON_RUN_AS_NODE`，或先 `echo $ELECTRON_RUN_AS_NODE` 确认为空。T01 实测：带着该变量启动，空沙盒目录始终为空、无进程；清掉后立刻正常。

### 5.3 首次启动先显示 "Still connecting" 是正常的

空沙盒冷启动时，`FirstRunGate`（`apps/web/src/components/onboarding/FirstRunGate.tsx`）在等首个 workspace 证据，超过 4s（`FIRST_RUN_DECISION_TIMEOUT_MS`）会先显示 "Still connecting / T3 Code could not confirm this workspace."。内嵌 server 起来、renderer 拿到 `/.well-known/t3/environment`、`/oauth/token`、`/api/auth/session`、`/api/orchestration/shell` 之后，界面自动进入 Settings，无需点 Reload。实测约 20–60s 内自愈。

### 5.4 日志里的 "ERROR" 多是无害的

`userdata/logs/*.trace.ndjson` 是 OTEL span，不是分级日志。搜到的两类 error 都无害：

- `HttpClientError ... ECONNREFUSED 127.0.0.1:3773`：renderer 在 server 绑定端口前重试，随后成功（`.well-known/t3/environment` 最终 200）。
- `CommandResolutionError`（`shell.resolveCommandPath`）：探测 provider CLI（codex/claude/cursor 等）不存在，空沙盒里属预期。

## 6. 产物核对（实测结论）

| 问题 | 结论 | 依据 |
|---|---|---|
| .app 叫什么 | `T3 Code (Alpha).app` | 与预期一致；版本号无 `-nightly.`，故走 `productName` 分支 |
| bundle id | `com.t3tools.t3code` | `defaults read Info.plist CFBundleIdentifier`；源码 `scripts/build-desktop-artifact.ts:57` `DESKTOP_APP_ID` |
| 版本号 | `CFBundleShortVersionString` = `CFBundleVersion` = `0.0.46-n2644.base` | `defaults read` |
| `app-update.yml` | **不存在**（不会自动更新） | `:2699-2712`：未设 `T3CODE_DESKTOP_UPDATE_REPOSITORY` / `GITHUB_REPOSITORY` 时 `publish` 不注入，electron-builder 不产该文件 |
| 签名 | ad-hoc / linker-signed，未公证 | `codesign -dv --verbose=2`：`flags=0x20002(adhoc,linker-signed)`、`Signature=adhoc`、`TeamIdentifier=not set`、`Sealed Resources=none`（未签版 `:3812-3818` 强制 `CSC_IDENTITY_AUTO_DISCOVERY=false`） |

## 6.5 从 dmg 取出 `.app` 并核对（§6 表格的命令依据）

DMG 只是分发镜像，`release/base/app/` 下的 `.app` 需要从上一步的 dmg 里挂载取出。§7 启动步骤指向的 `release/base/app/...` 就来自这里——**从干净输出目录照抄 §3 只会得到 dmg/zip，不会自动得到该 `.app`**，所以这一步不能省。

```sh
DMG=$(ls ~/Projects/t3code-zh/release/base/*.dmg)
rm -rf /tmp/t3zh-mnt
hdiutil attach "$DMG" -nobrowse -mountpoint /tmp/t3zh-mnt

APP_NAME=$(ls /tmp/t3zh-mnt | grep '\.app$')     # => "T3 Code (Alpha).app"
mkdir -p ~/Projects/t3code-zh/release/base/app
ditto "/tmp/t3zh-mnt/$APP_NAME" ~/Projects/t3code-zh/release/base/app/"$APP_NAME"

hdiutil detach /tmp/t3zh-mnt                      # 用完必须卸载
APP="$HOME/Projects/t3code-zh/release/base/app/$APP_NAME"
```

**不要**把 `.app` 拷到 `/Applications` 或安装到那里（CONVENTIONS §2 第 2 条）；只在仓库的 `release/` 下展开。

核对四项（§6 表格的原始命令）：

```sh
defaults read "$APP/Contents/Info.plist" CFBundleIdentifier          # com.t3tools.t3code
defaults read "$APP/Contents/Info.plist" CFBundleShortVersionString  # 0.0.46-n2644.base
defaults read "$APP/Contents/Info.plist" CFBundleVersion             # 0.0.46-n2644.base
defaults read "$APP/Contents/Info.plist" CFBundleName                # T3 Code (Alpha)
ls "$APP/Contents/Resources/app-update.yml"                          # 应报 No such file（无自动更新）
codesign -dv --verbose=2 "$APP" 2>&1 | head -12                      # adhoc / linker-signed
```

若 `defaults read` 报 domain 不存在，可用等价的 `plutil -p "$APP/Contents/Info.plist"` 读同一文件。

## 7. 空沙盒试运行

```sh
pgrep -fl "T3 Code"                    # 不能有其他 0.0.46 实例（官方 Nightly 或已安装的汉化版），有就先退出
unset ELECTRON_RUN_AS_NODE             # 必须：见 §5.2，带着它启动会静默变成 Node 进程
mkdir -p ~/.t3-zh-test-empty
APP="$HOME/Projects/t3code-zh/release/base/app/T3 Code (Alpha).app"
open -n --env T3CODE_HOME=$HOME/.t3-zh-test-empty --env T3CODE_DISABLE_AUTO_UPDATE=1 "$APP"
```

- **启动前必写 `unset ELECTRON_RUN_AS_NODE`**（§5.2）。当前 bash 工具环境默认带 `ELECTRON_RUN_AS_NODE=1`，不清掉的话 `open -n` 后无进程、无窗口、无日志，空沙盒目录始终为空。
- `$APP` 来自 §6.5 的 dmg 提取；未做该步会找不到路径。

实测：主进程 + GPU/网络 helper + renderer + 内嵌 server + resource-monitor 五个进程起来，沙盒下生成 `userdata/statev2.sqlite`、`secrets/`、`logs/`、`caches/` 等，界面正常渲染。结束只能 `kill <自己启动的主进程 PID>`（CONVENTIONS §2 第 6 条），不要 `pkill`。

## 8. 构建链（T03 用；逐条核对基线 tag）

### 8.1 `apps/web` 用 `vp build`，配置文件 `apps/web/vite.config.ts`，函数形式

- `apps/web/package.json:9` `"build": "vp build"`
- `apps/web/vite.config.ts:156` `export default defineConfig(() => {` —— 是 `defineConfig(() => ({...}))` 函数形式，插件若要改配置需处理函数调用。
- 结论：**成立。**

### 8.2 `apps/server`（包名 `t3`）的 build 任务：`node scripts/cli.ts build`，依赖 `@t3tools/web#build`，把 `apps/web/dist` 复制成 `apps/server/dist/client`

- `apps/server/vite.config.ts:71-75`：
  ```ts
  build: {
    command: "node scripts/cli.ts build",
    dependsOn: ["@t3tools/web#build"],
    cache: false,
  },
  ```
- `apps/server/scripts/cli.ts:93-99`：`webDist = repoRoot/apps/web/dist`，`clientTarget = serverDir/dist/client`，`fs.copy(webDist, clientTarget)`，日志 `[cli] Bundled web app into dist/client`。
- 实测产物：`apps/server/dist/client/` 内容与 `apps/web/dist/` 一致（同为 8 项：`index.html`、`assets`、图标等）。
- 结论：**成立。**

### 8.3 `apps/desktop` 的 build 任务：`node scripts/build-browser-secret.mjs && node scripts/build-preview-annotation-css.mjs && vp pack`，依赖 `t3#build`

- `apps/desktop/vite.config.ts:26-30`：
  ```ts
  build: {
    command:
      "node scripts/build-browser-secret.mjs && node scripts/build-preview-annotation-css.mjs && vp pack",
    dependsOn: ["t3#build"],
    cache: false,
  },
  ```
- 说明：`t3#build` 指 `t3` 包（即 `apps/server`，见其 `package.json` 的 `"name": "t3"`）的 `build` 任务，因此桌面端依赖 server 先构建完（而 server 又依赖 web）。依赖链：`web#build` → `t3(server)#build` → `desktop#build`。
- 结论：**成立。**

### 8.4 `dist:desktop:*` 支持 `--skip-build`，直接用已有 dist

- `scripts/build-desktop-artifact.ts:3953-3956` `Flag.Boolean("skip-build")`（env `T3CODE_DESKTOP_SKIP_BUILD`，`:1576`）。
- `:3472-3482` `if (!options.skipBuild) { ... spawn vp run build:desktop ... }`；`:3484-3496` 校验 `apps/desktop/dist-electron`、`apps/desktop/resources`、`apps/server/dist` 存在（缺则报 `MissingDesktopBuildInputError`）。
- 实测：`vp run dist:desktop:dmg:arm64 --skip-build` 36.5s 成功，产物与全量构建内容一致。
- 结论：**成立。**

### 8.5 `vp build` 支持 `-c/--config` 指定配置文件

- `vp build --help` 的选项列表**没有** `-c/--config`（`--help` 只列显式声明的选项）。
- 但实测传入 `-c` 会被接受并透传给 Vite：
  - `vp build -c /tmp/no-such-config.ts` → `failed to load config from /tmp/no-such-config.ts`（说明它按给定路径去加载）。
  - `cd apps/web && vp build -c ./vite.config.ts` → **EXIT 0，19.7s 构建成功。**
- 另外 `vp build --help` 里 `ROOT` 位置参数（"Project root directory"）也可用于换目录。
- 结论：**支持**，`-c/--config` 可用（尽管未列在 `--help`）。若 T03 需要自定义配置，推荐把配置写到独立文件再 `vp build -c <file>`，或改 `apps/web/vite.config.ts`（补丁方式）。

## 9. 复现命令汇总（照抄）

```sh
export VP_NODE_MANAGER=no
curl -fsSL https://vite.plus | bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --profile minimal
. "$HOME/.config/vite-plus/env"; . "$HOME/.cargo/env"

git -C ~/Projects/t3code fetch origin tag v0.0.46-nightly.20261004.2644 --no-tags
git -C ~/Projects/t3code worktree add --detach ~/Projects/t3code-zh/upstream   v0.0.46-nightly.20261004.2644
git -C ~/Projects/t3code worktree add --detach ~/Projects/t3code-zh/.build/src v0.0.46-nightly.20261004.2644

cd ~/Projects/t3code-zh/.build/src
vp i --frozen-lockfile

T3CODE_DESKTOP_VERSION=0.0.46-n2644.base \
T3CODE_DESKTOP_OUTPUT_DIR=$HOME/Projects/t3code-zh/release/base \
vp run dist:desktop:dmg:arm64

# 取出 .app（见 §6.5），然后启动（见 §7）
DMG=$(ls ~/Projects/t3code-zh/release/base/*.dmg)
hdiutil attach "$DMG" -nobrowse -mountpoint /tmp/t3zh-mnt
APP_NAME=$(ls /tmp/t3zh-mnt | grep '\.app$')
mkdir -p ~/Projects/t3code-zh/release/base/app
ditto "/tmp/t3zh-mnt/$APP_NAME" ~/Projects/t3code-zh/release/base/app/"$APP_NAME"
hdiutil detach /tmp/t3zh-mnt
```

## 10. 两点措辞边界（避免误读）

- **"skip-build 产物与全量构建一致"** 指**应用内容一致**（ZIP 内 109 个路径相同、plist 除 `ElectronAsarIntegrity` 外相同、ASAR 内 3504 个常规文件逐一相同），不是逐字节相同：两次打包 ZIP 中有 5 个文件 CRC 不同（原生重建文件与分发脚本），plist 的 `ElectronAsarIntegrity` 哈希随打包重算而变化。功能上等价，不要据此断言字节级可复现。
- **"未公证"** 由 ad-hoc 签名状态推断（`TeamIdentifier=not set`、`Sealed Resources=none`），未联机查询公证服务。


## 2702 验收修复：web、server 与桌面版本一致

`T3CODE_DESKTOP_VERSION` 只控制桌面包装。连接页及 CLI 在编译时读取 `apps/server/package.json`；常规设置的 `APP_VERSION` 则来自 web 的 Vite define，默认读取 `apps/web/package.json`。两个包的基线版本均为 `0.0.45`。zh.3 只修复了 server 来源，实机复验确认常规设置仍为旧版本。

`build-zh.sh` 现在在第 9 步、server 编译前，仅将 `.build/src/apps/server/package.json` 的 `version` 改为本次交付版本。构建后以独立 `/tmp/t3zh-build-version.*` 沙盒运行 `dist/bin.mjs --version`，必须精确输出 `t3 v<交付版本>`。第 13 步按 JSON 对比上游内容，只允许 `version` 字段变化。源仓库及只读 `upstream/` 不变。远程连接依然显示各自服务器的真实版本。

zh.4 起，第 7 步另外通过 `APP_VERSION=<交付版本>` 构建 web；包装配置核对上游 Vite 的实际 define 与该值一致，第 8 步核对编译产物包含该版本。不改 web package.json，也不依靠 server 或 plist 推断 web 版本。仍需桌面实测常规、连接和原生关于三个入口。

## T3 Connect 公开配置

zh.10 起，`build-zh.sh` 第 5 步从当前基线的 `.env.example` 读取四个官方公开标识（Clerk publishable key、JWT template、CLI OAuth client ID、relay URL），写入构建树 `.env`。不复制可选遥测项或服务端密钥，不需要填写个人账号凭据；不要直接修改 `.build/src`。上游加载器据此为 web、server 和 desktop 注入对应配置。

构建前检查有效配置及覆盖层，web 包装配置核对实际 Vite define，桌面编译后核对三类编译产物。第 13 步另外检查被 Git 忽略的 `.env` 只能含这四项，值必须与当前基线一致。缺少配置或被环境变量、`.env.local` 改到另一个部署时立即失败。回归检查：`node --test scripts/lib/t3-connect-config.test.ts`。
