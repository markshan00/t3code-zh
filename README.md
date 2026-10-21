# t3code-zh：T3 Code 简体中文版（非官方）

[T3 Code](https://github.com/pingdotgg/t3code) 桌面版的简体中文界面，可在「设置 → 常规 → 语言」里切换中文 / 英文。

> 非官方项目，与 T3 Tools Inc. 无关。
>
> 基于 T3 Code **官方正式版**翻译（当前 `v0.1.1`，汉化版 `0.1.1-zh.2`），只跟进正式 Release，不跟 nightly。应用名沿用上游的 `T3 Code (Beta)`。

## 安装

从 [Releases](https://github.com/markshan00/t3code-zh/releases/latest) 下载对应平台的安装包：

| 平台 | 文件 |
|---|---|
| macOS Apple Silicon（M 系列芯片） | `T3-Code-<版本>-arm64.dmg` |
| Windows 64 位（Intel / AMD x64） | `T3-Code-<版本>-x64.exe` |

两个安装包的 SHA-256 在 Release 附带的 `SHA256SUMS.txt` 里。安装前先退出正在运行的 T3 Code。

### macOS

1. 打开 `.dmg`，把 `T3 Code (Beta)` 拖进「应用程序」，替换旧版。
2. 第一次打开会提示无法验证（安装包没有经过苹果公证）。点「完成」，到「系统设置 → 隐私与安全性」，在页面底部点「仍要打开」。

如果提示「已损坏，无法打开」，在终端运行：

```sh
xattr -dr com.apple.quarantine "/Applications/T3 Code (Beta).app"
```

### Windows

运行 `.exe` 安装。安装包没有发布者签名，SmartScreen 拦截时点「更多信息 → 仍要运行」。

### 注意

- 会替换官方的 T3 Code (Beta)，并且不会自动更新，新版本到 Releases 下载。
- 不要和官方版或旧的汉化版同时打开，两者共用设置目录，会互相覆盖。
- 从旧版本升级前，建议先备份 `~/.t3/userdata`。

## 已知限制

少量文字保持英文，主要是账号弹层（由 Clerk 生成）、部分服务端下发的说明和系统权限弹窗。完整清单见 [docs/KNOWN-LIMITATIONS.md](docs/KNOWN-LIMITATIONS.md)。

## 自己构建

macOS 安装包需要 macOS（Apple Silicon）、Node 24、Xcode Command Line Tools、Rust、[Vite+](https://vite.plus)。

```sh
git clone --filter=blob:none https://github.com/pingdotgg/t3code.git ~/Projects/t3code
git clone https://github.com/markshan00/t3code-zh.git ~/Projects/t3code-zh
cd ~/Projects/t3code-zh && npm ci

TAG=v0.1.1
git -C ~/Projects/t3code fetch origin tag "$TAG" --no-tags
git -C ~/Projects/t3code worktree add --detach ~/Projects/t3code-zh/upstream   "$TAG"
git -C ~/Projects/t3code worktree add --detach ~/Projects/t3code-zh/.build/src "$TAG"

scripts/build-zh.sh 0.1.1-zh.2
```

产物在 `release/<版本号>/`。Windows 安装包由 GitHub Actions 工作流 [`build-windows.yml`](.github/workflows/build-windows.yml) 构建（Actions 页面手动运行，产物在 artifacts 里）。

详细步骤和常见问题见 [docs/BUILD.md](docs/BUILD.md)，跟进上游新版本见 [docs/UPGRADE.md](docs/UPGRADE.md)，原理和约定见 [CONVENTIONS.md](CONVENTIONS.md)。

## 致谢与许可证

初版词库来自 [ZhiweiXiao98/t3code](https://github.com/ZhiweiXiao98/t3code)（MIT），感谢原作者。

开发过程中使用了 [Claude Code](https://claude.com/claude-code) 和 [Codex](https://openai.com/codex)。

本仓库使用 [MIT](LICENSE) 许可证，上游许可证见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
