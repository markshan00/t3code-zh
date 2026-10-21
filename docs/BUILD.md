# 构建手册（T01 建立，后续任务据此复现）

当前基线：正式版 `v0.1.1` / `fe27e8e3dc12dcbb108e9a28fd9b8cb65f34ae92`，当前交付 `0.1.1-zh.2`（macOS ARM64 + Windows x64）。已交付的版本号不再覆盖重建，修复一律升 `zh.<N>`。上游产品名为 `T3 Code (Beta)`。

macOS ARM64 沿用 `scripts/build-zh.sh` → `scripts/make-installer.ts` → `scripts/release-hygiene.ts` → `scripts/web-check/run.ts`。只交付 `release/<版本>/installer/` 中完成检查的 DMG，根目录的同名 DMG 是打包中间产物。

Windows x64 使用 `.github/workflows/build-windows.yml`：Linux 构建共用中文 JS bundle，再生成同版本 Linux x64 CLI 归档作为 WSL runtime，Windows runner 使用这些输入打 NSIS 包并运行 `smoke-installed.ps1`。补丁、词库和守卫阈值复用同一来源；仅 Windows 的语言资源/安装器配置在 `scripts/windows/patches/`。运行结果以 CI 证据为准，静态测试通过不代表 Windows 实际出包通过。

两个平台共用版本号 `<上游版本>-zh.<N>`。Windows 安装器未做发布者签名；Mac 为 ad-hoc 签名，未公证，不含 Touch ID 通行密钥所需描述文件。两者均禁用官方自动更新源；产品名/标识及配置目录沿用上游，不能与同配置的官方或旧汉化实例同时运行。

以下保留首次从零构建（基线 2644）的实测记录：

基线：

- tag `v0.0.46-nightly.20261004.2644`
- commit `737993303d36e10674c54b95e5bd3826682c99c7`
- 上游仓库 `~/Projects/t3code`（blobless 部分克隆，检出时按需下载，需要网络）

本文件记录从零到产物的完整步骤。所有命令都实际跑过，耗时是实测值。

> 本手册写于首个基线 2644，命令里的 tag / commit 是当时的值。**当前基线以 [CONVENTIONS.md](../CONVENTIONS.md) §1 为准**，照做时换成当前值即可；日常构建只需要 README 里的步骤。目录按 `~/Projects/t3code`（上游克隆）和 `~/Projects/t3code-zh`（本仓库）的布局书写，放在别处时替换路径。

## 0. 验证环境版本（实测）

| 工具 | 版本 | 备注 |
|---|---|---|
| macOS | 26.6.2 | |
| Xcode Command Line Tools | `/Applications/Xcode.app/Contents/Developer` | clang 21.0.0 (clang-2100.3.34.2) |
| Node | v24.14.0 | 上游 `engines.node` 为 `^24.13.1`，满足 |
| package manager | pnpm v11.10.0 | 由 `vp` 管理 |
| vp (Vite+) | v1.0.0 | `curl -fsSL https://vite.plus \| bash` 安装 |
| rustc | 1.99.0 (b940084d7 2026-09-28) | `--profile minimal`，target `aarch64-apple-darwin` |
| cargo | 1.99.0 (5f94df478 2026-08-27) | |

### 环境准备

```sh
# vp（Vite+ CLI）。VP_NODE_MANAGER=no 跳过它自己的 Node 安装提示，改用验证环境 Node。
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

数据源：构建脚本日志，见 `build-base.log`（本次实测完整输出）；下面仅保留阶段耗时。

| 阶段 | 耗时 | 证据来源 |
|---|---|---|
| web + server(server bundle) + desktop 构建（`vp run build:desktop`） | **23.7s** | 日志 `[desktop-artifact] Building desktop/server/web artifacts...` → `Applied production web client branding.` |
| cargo 编译 resource-monitor（在上一阶段内） | **未单独计时**（`build:resource-monitor` 是 `vp run build:desktop` 的一部分，日志未为其单独打点） | 不适用；**不要用目标文件 mtime 代替耗时** |
| staging 发布 app + 安装 staged 生产依赖 | **55.2s** | `Staging release app...` → `Building mac/dmg ...` |
| electron-builder 打包（dmg/zip + blockmap） | **76.9s** | `Building mac/dmg (arch=arm64, version=0.0.46-n2644.base)...` → `Done. Artifacts:` |
| **合计** | **155.9s（2m35.9s）**；`time` 报告的 `real` 为 2m37.7s，差值为脚本启动/收尾开销 | 同左 |

注：这些耗时来自 T01 本次构建的真实日志；未为补文档重跑构建。

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

- **实测耗时：36.5s（`real 0m36.515s`），EXIT 0。** 跳过构建后各阶段：staging 1.0s；安装 staged 生产依赖 0.6s；electron-builder 打包 **34.1s**。证据来源同 `build-skip.log`。
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

原因：`vp i` 走 `pnpm install`，pnpm 会用验证环境的解析器规范化 lockfile 元数据（补 `libc` 字段）并按 registry 实际返回刷新 `deprecated` 文本。与所用 npm 镜像无关（是 pnpm 自身行为）。

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

## T16：公开发布路径清理与许可证

`scripts/build-zh.sh 0.0.46-n2774.zh.6` 执行全部 13 步。第 11 步保留外部 `RUSTFLAGS`，追加 `--remap-path-prefix=${CARGO_HOME:-$HOME/.cargo}=/cargo` 和构建源码目录到 `/t3code` 的映射；设置了优先级更高的 `CARGO_ENCODED_RUSTFLAGS` 时，也向它追加相同参数。第 2 步清除构建树的 Rust target，第 11 步关闭 resource-monitor 复用并启用打包详细日志，Cargo 日志应显示依赖和主程序重新编译。

补丁 0019 在 staging 时将基线 `.build/src/LICENSE` 逐字节复制到资源目录，通过 `extraResources` 在签名前放入 `Contents/Resources/T3-Code-LICENSE.txt`。第 13 步从打包 ZIP 的实际 App 中读取该文件，与基线 `LICENSE` 用 `cmp` 比较，缺失或不同立即失败。

最终交付沿用 T15 的做法：用 `ditto -x -k` 解出 App，在 `release/<版本>/app/` 下重新 ad-hoc 签名；将根目录 DMG 转为临时 UDRW，用签名后的 App 替换卷内 App，再转换为 `installer/` 下的 UDZO DMG。在整个最终卷上用 `LC_ALL=C grep -aF` 扫描 `$HOME`、`/Users/`、Git 邮箱和主机名，并检查许可证、严格签名、两个 plist 版本、DMG 完整性和 `SHA256.txt`。验收挂载使用 `-readonly -nobrowse -noautoopen`，不启动 Electron。具体命令及结果见 T16 交接。

扫描结果不能只写“全部 0”：上游通用路径逻辑和供应商预编译二进制仍可能含 `/Users/`。T16 的 13 个命中文件、847 处字节命中已逐条列明，并核对供应商文件 / 基线来源。若 `git config user.email` 未配置，不能拿空字符串扫描或宣称该值为 0；如实记录未配置，并注明补扫的历史提交邮箱及上游固定身份命中。

历史提取脚本 `extract-dict.ts` 必须显式提供 `T3ZH_BACKUP` 或 `--backup=<旧版 app.asar 路径>`；参数优先。它会写词库，T16 不运行该脚本。

## T17 / n2861 构建

T17 当时源码基线为 `v0.0.46-nightly.20261009.2861` / `3b6af0bd1600f034b0466e1b8ff017fbabeba910`，交付版本 `0.0.46-n2861.zh.1`。升级后第一次安装依赖仍使用 `vp i --frozen-lockfile`；打包用 Electron 44.4.5。0014 已由上游合入，活动补丁 18 份（0001、0003–0013、0015–0020），新增 0020 不改 matcher。

`build-zh.sh` 第 11 步会删除同版本的整个 `release/<版本>/` 目录。构建、测试及打包的运行日志先写到输出目录外，构建结束后再归档进 `acceptance/`；已有证据也须先备份到输出目录外。T17 最终日志在 `.build/T17-r2/`，已归档为 `acceptance/` 下 `*-final-r2.*` 文件；页面证据以 `web-last-` 前缀为准，归档与限制见交接。

## T18 / n2908 上游生成文件守卫

按 `tasks/T18-upgrade-2908.md`「主会话决定」第 2 条，第 13 步单独维护 `UPSTREAM_GENERATED_FILES`，仅含 `apps/desktop/src/preview/AnnotationStyles.generated.ts`，不扩大通用工作树白名单。2908 上游提交的输出仍含 `.static`，输入 `PickPreload.ts` 已不含对应候选；官方 desktop 构建同样会重生成并移除该样式。

仅在以下条件全部成立时放行：`PickPreload.ts`、`Annotation.css` 和 `build-preview-annotation-css.mjs` 相对基线 HEAD 未改动；在系统临时目录使用从基线读取的干净输入与构建树解析到的同一 `tailwindcss` 独立运行生成器；独立输出与构建树输出逐字节一致。检查不写 `.build/src`，临时目录自动清理；任一条件不满足，第 13 步仍失败。日志记录路径、决定依据及实际检查结果。上游修正漂移后，没有改动的生成文件不会触发例外。

自检：`node --test scripts/lib/upstream-generated.test.ts`。使用临时 Git 树和真实上游生成器，验证正常重生成通过、三份输入分别改动 / 输入模式改动 / 输出不一致 / 基线不符 / 名单外路径均拒绝；不改真实构建源码。

T18 最终构建为 `scripts/build-zh.sh 0.0.46-n2908.zh.1`，13/13、85.0 秒，转换 6735 处。前段第 13 步失败的日志与产物已保留到 `release/backups/before-T18-resume-20261010T035531Z/`；恢复后首个 13/13 包因 WelcomeWizard 缺少 translateFixed import 被最终类型检查拦下，备份到 `release/backups/before-T18-import-fix-20261010T035917Z/`，补齐 0020 import 后再次重建。最终日志来自 `.build/T18/` 并归档到 `release/0.0.46-n2908.zh.1/acceptance/` 的 `*-final.*`。

最终 installer 沿用重新 ad-hoc 签名方案，无 provisioning profile；`CFBundleLocalizations` 为 en / zh-Hans，上游 URL schemes 与 HTML / XHTML 文档类型均保留，受限的 keychain-access-groups / com.apple.developer.web-browser.public-key-credential 均不存在。内置浏览器 Touch ID 通行密钥在本构建中不可用，不改变签名方式或系统默认浏览器。指定双语网页检查已完成，真实 / 模拟 / 未触发分开记录，English 后切回 zh-CN；详情以 T18 交接为准。

网页收尾补入 0020 的 PR 空描述固定回退后，另存第二个中间包及全部 acceptance 到 `release/backups/before-T18-pr-empty-description-20261010T043546Z/`，再次完整重建（13/13、85.0 秒）。最终插件 / 配置测试 835/835，两份 tsc 通过；最后 installer 和发布卫生再次从最后产物检查。历史 acceptance 恢复到最终 acceptance/history/ 独立子目录；顶层以 *-final 与 web-last 为准。新增 PR 显示点只包裹空正文的已存在精确词条，不改正文、数据或词库。


## T19 / n2935

活动补丁 19 份。0007 跟随 #17664 的 Combobox，只翻译显示 / 搜索标签；项目 key 和选中逻辑保持上游。0021 处理清理结果、上次运行、失败计数、固定理由、导入单复数按钮、拖动读屏播报及 Automatic 回退，任意环境名、路径、任务名和动态服务端理由不交给翻译器。m3 在生成文件守卫的 node 调用加 `</dev/null`。

`NSLocalNetworkUsageDescription` 保留上游英文说明；不新增 `zh-Hans.lproj`。macOS 首次本地网络权限弹窗的说明文字仍为英文，和截屏权限说明的处理相同。CFBundleLocalizations 继续声明 en / zh-Hans，无描述文件、内置浏览器 Touch ID 通行密钥不可用。网页清理结果使用模拟 props，不开启清理规则或执行立即删除；原生 Electron 验收留给维护者安排。

## 迭代脚本（T20）

在本仓库根目录用 Node v24 直接运行。每次使用新的空输出目录；已有输出时拒绝覆盖，尤其不要覆盖已交付的 installer。标准输出每项一行、总计不超过 30 行，详细证据写入输出目录。运行时读取的 HOME、短主机名与 Git 邮箱只在内存中保留；日志及报告仅写标签和命中数，家目录显示为 `~`。

| 脚本 | 用途 | 输出 |
|---|---|---|
| `scripts/run-checks.ts` | 依次运行插件 / 配置、词库自测与校验、回归、异形扫描、生成文件守卫及 web / desktop 类型检查 | `checks.json`、每项 `.log` / `.exit`、`output-audit.json` |
| `scripts/make-installer.ts` | 从 ZIP 解出 App、核对许可证、重新 ad-hoc 签名、替换临时 DMG 的 App 并转为 UDZO，核对 ASAR 不变、摘要清单与镜像完整性 | DMG、`SHA256.txt`、`installer.json`、各步骤日志 |
| `scripts/release-hygiene.ts` | 只读挂载，检查 App、封存许可证、plist、entitlements、整卷内容 / 路径 / 链接与来源证据，使用 `LC_ALL=C grep -aFl` 独立复核 | `hygiene.json`、`hygiene.md`、各步骤日志；报告含输出过滤收尾检查 |
| `scripts/web-check/run.ts`（含 `sandbox.ts`） | 最终 server + 空沙盒 + 临时 profile 无头 Chrome，按累积清单检查双语真实 DOM / 模拟组件，并与交付 DMG 比对加载模块 | `web-last-<locale>-<名字>-<real\|simulated>.json`、模块哈希、fixture / 运行 / 清理明细、`web-check.json`、`output-audit.json` |

```sh
node scripts/run-checks.ts --out .build/<本轮>/checks
# --next 可指定回归和异形扫描的源码树，默认 .build/next；tsc 始终只读 .build/src。
node scripts/run-checks.ts --out .build/<本轮>/checks-next --next .build/next

node scripts/make-installer.ts <版本> --out .build/<本轮>/installer
# 省略 --out 时输出到 release/<版本>/installer/，该目录须为空。

node scripts/release-hygiene.ts release/<版本>/installer/<安装包>.dmg \
  --version <版本> --out .build/<本轮>/hygiene
# 旧版本指定自己的源码基线；build-src 仅补充 ASAR 证据，仍用于供应商文件严格比对。
node scripts/release-hygiene.ts <旧版安装包>.dmg --version <旧版本> \
  --baseline <旧基线commit> --build-src .build/src --out .build/<本轮>/hygiene-old

node --test scripts/lib/iteration-tooling.test.ts scripts/lib/release-hygiene.test.ts

# 使用未被 T3 或其他进程占用的两个端口，server / helper 均只绑定 127.0.0.1。
node scripts/web-check/run.ts --version <版本> --dmg <交付installer.dmg> \
  --port 15182 --helper-port 15183 --out .build/<本轮>/web
# 默认读取 .build/src；可传 --build-src、--checks。--phase real / simulated 用于分段定位。
# 模拟项必须有交付 DMG；缺失 / 不同的资源会使模拟项失败。
# 同一 DMG 的发布卫生扫描与网页检查须顺序执行，避免 hdiutil 同时挂载时报资源忙。

# 也可以单独管理沙盒；每份配对凭据只在内存转交一次。
node scripts/web-check/sandbox.ts start --port 15182 --helper-port 15183 \
  --state .build/<本轮>/web-state.json
node scripts/web-check/sandbox.ts status --state .build/<本轮>/web-state.json
node scripts/web-check/run.ts --state .build/<本轮>/web-state.json --version <版本> \
  --dmg <交付installer.dmg> --out .build/<本轮>/web
# run 的 finally 自动 stop；仅启动沙盒而未 run 时，显式 stop。
node scripts/web-check/sandbox.ts stop --state .build/<本轮>/web-state.json

node --test scripts/lib/web-check.test.ts
```

网页累积清单在 `scripts/web-check/checks/acceptance.json`，目前 13 个 real、22 个 simulated，双语共 70 项；每项先 zh-CN、整组完成后 en，最后恢复 zh-CN。真实检查自建名为 `No project` 的项目，只读本沙盒 SQLite 核对原始 title；通过最终公开 client-settings API 完成首启门控，另行访问 `/welcome`。遥测检查在空沙盒中选择自身环境，保持端点为空，不保存或测试外部端点。新增模拟项覆盖评审指南、提示词链接和更新侧栏，并检查动态标题、提示词正文和错误原文。模拟只验证显示路径；PR、账号、子任务、更新/重启、导入和清理的真实集成仍按 T19 交接的限制处理。

新增真实项只改清单中的 path、区域、动作和双语 required / forbidden / exact_text；动作支持点击、输入、选择、等待、Escape 和 PointerEvent 拖动。模拟复用已登记组件时，在清单的 fixtures 填 props / tree / state，再引用它；helper 的 `call` 可以用 `select` 读取返回对象的显示字段。新组件另外在 `modules.ts` 登记源码后缀、原符号及函数特征。找不到唯一符号或函数体被重写即失败。清单提供回归预期；版本预期使用 CLI 的 `--version`，编译文件和导出名从最终 source map / AST 推出，不写死 asset 哈希名。

每个模拟结果关联 `web-last-final-module-hashes.json`：对全部实际加载 JavaScript（含依赖及追加 export 前的原模块）逐个记录 SHA-256，并与只读交付 DMG 的 ASAR 资源比对，缺失或不同均失败。首次导航前，Chrome 当前页面路由仅在内存中提供重定向 import / 追加 export 的模块；保留原 URL 和模块缓存身份，避免组件迁入入口 chunk 后通过 blob 副本重复执行应用启动。原模块与重定向 import 后的组件 / helper 函数体逐字节相同，磁盘构建资源不变；不比较两次构建的整个 ASAR。证据 URL 仅含 origin / pathname；配对 fragment、秘密字段和运行时个人值写入前过滤，收尾自查。

每次 Chrome 使用系统临时目录中的新 profile，启动后核对调试 pipe 且没有调试端口。server / helper / 子进程记录 PID 和启动时间，结束前核对身份；PID 已复用时拒绝终止。finally 关闭 Chrome、检查记录进程、删除 profile、结束沙盒 PID、确认端口可重新绑定，再删除沙盒和状态文件。状态文件原子替换；中断后先查看 status 和交接进度，使用记录的 state 执行 stop。网页整套参考耗时见 T20 B 段最终交接；明显更慢时记录 `uptime` 后查看逐项 seconds，不盲等。

参考耗时（2026-10-11 主会话复跑，机器空闲）：`run-checks.ts` 约 32 秒；`make-installer.ts` 约 21 秒；`release-hygiene.ts` 每个 DMG 约 20–26 秒；`web-check/run.ts` 整套 40 项约 31 秒。明显更久时先看机器负载，T20 A 段第三次验收在高负载下跑了 61 分钟。

卫生检查的 `--baseline` 默认读取 `build-zh.sh` 的 `BASELINE_COMMIT`，通过只读 `git show` 读取原上游仓库。随版本变化的预期值均从该基线源码推出：`extendInfo` 键名读取该 commit 的 `scripts/build-desktop-artifact.ts`，读取或解析失败即报错，报告记录 commit、源码 SHA-256、预期和缺失键。`CFBundleLocalizations` 含 `zh-Hans` 仍单独检查，不要求上游源码声明。ASAR 的每处 `/Users/` 必须匹配 `release-hygiene-allowlist.ts` 中注明来源文件的通用写法，且指定基线的源文件必须包含该写法。`matches_build_src` 只补充记录编译项是否逐字节相同，不因旧版本缺失 / 不同而失败，也不比较两次构建的整个 ASAR。第三方文件必须与 `--build-src` 的 pnpm 同名原文件逐字节一致；Electron 必须与同版本缓存 ZIP 中的原始框架上下文字节一致。

任何检查失败、来源无法分类、个人信息命中或输出过滤失败均返回非 0。Git user.email 未配置时如实记录「未配置、未扫描」，另扫历史作者 / 提交者邮箱；固定检查点身份仅在基线源码和实际编译字段均证明来源后放行，报告只保留标签。未分类 `/Users/` 或个人信息命中时按 T20 任务说明停下来问，不修改名单来凑通过。挂载与临时目录在 finally 中清理；若普通 / 强制卸载都失败，返回失败并保留目录，避免删除仍挂载的卷。
