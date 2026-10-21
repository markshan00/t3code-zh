#!/usr/bin/env bash
# 在空目录里浅取上游 T3 Code 的固定 tag，并核对 commit（T21-W；CI 三个 job 共用，Windows 上用 Git Bash 运行）。
#
# 用法：scripts/windows/fetch-upstream.sh <目标目录> <tag> <40 位 commit> [仓库 URL]
#
# 与上游 release-desktop.yml 相同：稀疏检出排除 /.repos/（上游 vendored 树里有孤立 gitlink）。
# 只往不存在或空的目录里取，不覆盖已有内容；tag 指向的 commit 与预期不同就失败。
set -Eeuo pipefail

dest="${1:-}"
tag="${2:-}"
commit="${3:-}"
repo="${4:-https://github.com/pingdotgg/t3code.git}"

die() { printf '[fetch-upstream] 失败：%s\n' "$*" >&2; exit 1; }

[[ -n "${dest}" && -n "${tag}" && -n "${commit}" ]] || die "用法：fetch-upstream.sh <目标目录> <tag> <commit> [仓库 URL]"
[[ "${commit}" =~ ^[0-9a-f]{40}$ ]] || die "commit 应为 40 位小写十六进制：${commit}"
[[ "${tag}" =~ ^[A-Za-z0-9._/-]+$ && "${tag}" != *..* ]] || die "tag 异常：${tag}"
if [[ -e "${dest}" ]]; then
  [[ -d "${dest}" && -z "$(ls -A "${dest}")" ]] || die "${dest} 已存在且非空"
fi

mkdir -p "${dest}"
export GIT_TERMINAL_PROMPT=0
git -C "${dest}" init -q
git -C "${dest}" remote add origin "${repo}"
git -C "${dest}" fetch -q --no-tags --depth=1 origin "refs/tags/${tag}"
git -C "${dest}" sparse-checkout set --no-cone '/*' '!/.repos/'
git -C "${dest}" -c checkout.workers=0 -c advice.detachedHead=false checkout -q --detach FETCH_HEAD
head="$(git -C "${dest}" rev-parse HEAD)"
[[ "${head}" == "${commit}" ]] || die "tag ${tag} 指向 ${head}，不是预期的 ${commit}"
printf '[fetch-upstream] %s = %s\n' "${tag}" "${head}"
