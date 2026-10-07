#!/usr/bin/env bash
# 升级第 1 步：一条命令摸清新 nightly 对汉化的影响（docs/UPGRADE.md）。只读，不改仓库已跟踪的文件。
#
# 用法：scripts/upgrade-check.sh <新 tag>        例：scripts/upgrade-check.sh v0.0.46-nightly.20261005.2702
#
# 做的事：
#   1. 上游克隆（$T3ZH_UPSTREAM_REPO，默认 ~/Projects/t3code）fetch 新 tag（CONVENTIONS §2 第 3 条允许的操作），建 / 更新工作树 .build/next
#   2. 上游改动规模：提交数、各目录改动文件数（不含测试）
#   3. 补丁试打：新 tag 源码的临时副本里按编号顺序 git apply，打不上的补丁列出失败文件
#   4. 构建链守卫：build-zh.sh 第 6 步的预期值逐项对新源码核对；pnpm-lock.yaml 是否变化
#   5. 覆盖率报告：scripts/report.ts 跑新源码（写 reports/<新 tag>/，与当前基线报告对比）
#   6. 待译清单：scripts/dict-todo.ts 写 dict/todo/<新 tag>.json（增量，已填的保留）
#   7. 异形调用扫描：scripts/check-exotic-forms.ts（某类从 0 变非 0 才需要评估，CONVENTIONS §4 收敛标准）
#   8. 测试对新源码：T3ZH_UPSTREAM=.build/next 跑 plugin 测试（补丁、名单与上游源码的一致性检查会报出漂移）
# 汇总写到 reports/upgrade/<新 tag>.md，末尾附下一步清单。任何一步失败都记进汇总、继续往下（这是体检，不是构建）。

set -uo pipefail

NEW_TAG="${1:-}"
[[ -n "${NEW_TAG}" ]] || { echo "用法：scripts/upgrade-check.sh <新 tag>" >&2; exit 2; }

ZH_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ORIGIN_REPO="${T3ZH_UPSTREAM_REPO:-${HOME}/Projects/t3code}"
NEXT="${ZH_ROOT}/.build/next"
OLD_COMMIT="$(sed -n 's/^BASELINE_COMMIT="\(.*\)"$/\1/p' "${ZH_ROOT}/scripts/build-zh.sh")"
OLD_TAG="$(sed -n 's/^const BASELINE_TAG = "\(.*\)";$/\1/p' "${ZH_ROOT}/scripts/report.ts")"
SCRATCH="$(mktemp -d "/tmp/t3zh-upgrade-check.XXXXXX")"
OUT_DIR="${ZH_ROOT}/reports/upgrade"
OUT="${OUT_DIR}/${NEW_TAG}.md"
mkdir -p "${OUT_DIR}"

unset ELECTRON_RUN_AS_NODE
log() { printf '[upgrade-check] %s\n' "$*" >&2; }
md() { printf '%s\n' "$*" >>"${OUT}"; }
: >"${OUT}"

log "1/8 获取 ${NEW_TAG}"
git -C "${ORIGIN_REPO}" fetch origin tag "${NEW_TAG}" --no-tags >&2 || { log "fetch 失败"; exit 1; }
NEW_COMMIT="$(git -C "${ORIGIN_REPO}" rev-parse "${NEW_TAG}^{commit}")"
if [[ -e "${NEXT}" ]]; then
  if [[ "$(git -C "${NEXT}" rev-parse HEAD 2>/dev/null)" != "${NEW_COMMIT}" ]]; then
    [[ -z "$(git -C "${NEXT}" status --porcelain)" ]] || { log ".build/next 有改动，先处理掉再跑"; exit 1; }
    git -C "${NEXT}" checkout --quiet --detach "${NEW_COMMIT}"
  fi
else
  git -C "${ORIGIN_REPO}" worktree add --detach "${NEXT}" "${NEW_COMMIT}" >&2
fi

md "# 升级体检：${OLD_TAG} → ${NEW_TAG}"
md ""
md "- 当前基线：\`${OLD_TAG}\`（\`${OLD_COMMIT}\`）"
md "- 新 tag：\`${NEW_TAG}\`（\`${NEW_COMMIT}\`），源码在 \`.build/next\`"
md "- 由 \`scripts/upgrade-check.sh\` 生成；下一步见文末清单与 docs/UPGRADE.md"
md ""

log "2/8 上游改动规模"
md "## 1. 上游改动规模"
md ""
md "- 提交数：$(git -C "${NEXT}" rev-list --count "${OLD_COMMIT}..${NEW_COMMIT}")"
md ""
md "| 目录 | 改动文件（不含测试） |"
md "|---|---:|"
for dir in apps/web/src apps/desktop/src apps/server/src packages scripts; do
  count="$(git -C "${NEXT}" diff --name-only "${OLD_COMMIT}" "${NEW_COMMIT}" -- "${dir}" | grep -cvE '\.test\.|__tests__|\.spec\.')"
  md "| \`${dir}\` | ${count} |"
done
md ""

log "3/8 补丁试打"
md "## 2. 补丁试打（新源码副本，按编号顺序）"
md ""
git -C "${NEXT}" archive "${NEW_COMMIT}" | tar -x -C "${SCRATCH}"
git -C "${SCRATCH}" init --quiet
PATCH_FAILED=0
for patch in $(find "${ZH_ROOT}/patches" -maxdepth 1 -name '*.patch' | LC_ALL=C sort); do
  name="$(basename "${patch}")"
  if git -C "${SCRATCH}" apply "${patch}" 2>/dev/null; then
    md "- ✅ \`${name}\`"
  else
    PATCH_FAILED=1
    md "- ❌ \`${name}\`：打不上的文件 ——"
    while read -r file; do
      git -C "${SCRATCH}" apply --check --include="${file}" "${patch}" 2>/dev/null || md "  - \`${file}\`"
    done < <(git apply --numstat "${patch}" | awk '{print $3}')
  fi
done
md ""

log "4/8 构建链守卫"
md "## 3. 构建链守卫（build-zh.sh 第 6 步的预期值）"
md ""
chain() {
  local file="$1" query="$2" var="$3" expected actual
  expected="$(sed -n "s/^${var}='\(.*\)'$/\1/p" "${ZH_ROOT}/scripts/build-zh.sh")"
  actual="$(node "${ZH_ROOT}/scripts/lib/build-chain.ts" "${NEXT}/${file}" "${query}" 2>&1)"
  if [[ "${actual}" == "${expected}" ]]; then md "- ✅ \`${file}\` ${query}"; else md "- ❌ \`${file}\` ${query}：预期 \`${expected}\`，实际 \`${actual}\`"; fi
}
chain apps/server/vite.config.ts run.tasks.build.command EXPECTED_SERVER_BUILD_COMMAND
chain apps/server/vite.config.ts run.tasks.build.dependsOn EXPECTED_SERVER_BUILD_DEPENDS_ON
chain apps/desktop/vite.config.ts run.tasks.build.command EXPECTED_DESKTOP_BUILD_COMMAND
chain apps/desktop/vite.config.ts run.tasks.build.dependsOn EXPECTED_DESKTOP_BUILD_DEPENDS_ON
chain apps/web/package.json scripts.build EXPECTED_WEB_BUILD_SCRIPT
chain package.json scripts.build:desktop EXPECTED_ROOT_BUILD_DESKTOP_SCRIPT
if git -C "${NEXT}" diff --quiet "${OLD_COMMIT}" "${NEW_COMMIT}" -- pnpm-lock.yaml; then
  md "- pnpm-lock.yaml 未变"
else
  md "- pnpm-lock.yaml 变了：首次构建第 3 步会重新安装依赖（需要网络）"
fi
md ""

log "5/8 覆盖率报告"
md "## 4. 覆盖率报告"
md ""
if summary="$(node "${ZH_ROOT}/scripts/report.ts" "${NEXT}" --tag="${NEW_TAG}" --previous="${OLD_TAG}" 2>&1)"; then
  md "- ${summary}"
  md "- 详见 \`reports/${NEW_TAG}/summary.md\`（含与 ${OLD_TAG} 的逐项对比）"
else
  md "- ❌ report.ts 失败：\`${summary}\`"
fi
md ""

log "6/8 待译清单"
md "## 5. 待译清单"
md ""
if todo="$(node "${ZH_ROOT}/scripts/dict-todo.ts" "${NEXT}" --tag="${NEW_TAG}" 2>&1)"; then md "- ${todo}"; else md "- ❌ dict-todo.ts 失败：\`${todo}\`"; fi
md ""

log "7/8 异形调用扫描"
md "## 6. 异形调用扫描（scripts/check-exotic-forms.ts）"
md ""
exotic="$(node "${ZH_ROOT}/scripts/check-exotic-forms.ts" "${NEXT}" 2>&1)"
exotic_status=$?
md '```text'
printf '%s\n' "${exotic}" | tail -25 >>"${OUT}"
md '```'
md "- 退出码 ${exotic_status}（非 0 表示有报警类从 0 变成非 0 或扫描不完整，按 CONVENTIONS §4 收敛标准评估：只有真实代码里会出错才处理）"
md ""

log "8/8 测试对新源码"
md "## 7. plugin 测试对新源码（T3ZH_UPSTREAM=.build/next，补丁和词库仍是当前版本）"
md ""
tests="$(cd "${ZH_ROOT}" && T3ZH_UPSTREAM="${NEXT}" node --test plugin/__tests__/*.test.ts 2>&1)"
md '```text'
printf '%s\n' "${tests}" | grep -E '^ℹ (tests|pass|fail)|^✖' | grep -v 'failing tests' | sort -u | head -40 >>"${OUT}"
md '```'
md "- 失败项多半是补丁 / 名单与上游源码的一致性检查报出的漂移；补丁重做、词库合并、切换基线之后应全部通过"
md ""

md "## 下一步（docs/UPGRADE.md）"
md ""
md "1. 补丁：上面 ❌ 的补丁按 patches/README.md「上游变化后怎么重做」移植（DeepSeek）"
md "2. 翻译：填 \`dict/todo/${NEW_TAG}.json\` 的 zh / skip，复数后缀等写进 \`dict/todo/${NEW_TAG}.extra.json\`，然后 \`node scripts/dict-merge.ts dict/todo/${NEW_TAG}.json [extra] --baseline=${NEW_TAG}\`"
md "3. 切换基线：\`scripts/switch-baseline.sh ${NEW_TAG}\`，跑全套测试"
md "4. 构建：\`scripts/build-zh.sh <版本号>\`，沙盒实机截图"
md "5. 审核：一轮全量 + 至多一轮窄审（收敛规则见 docs/UPGRADE.md）"

rm -rf "${SCRATCH}"
log "汇总：${OUT}"
[[ "${PATCH_FAILED}" == 0 ]] || log "有补丁打不上，见汇总第 2 节"
