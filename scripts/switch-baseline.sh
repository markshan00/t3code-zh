#!/usr/bin/env bash
# 升级第 3 步：把仓库的基线切到新 tag（docs/UPGRADE.md）。补丁已移植、待译清单已合并之后再跑。
#
# 用法：scripts/switch-baseline.sh <新 tag>
#
# 改写（只改基线标识，不碰其他内容）：
#   - scripts/build-zh.sh 的 BASELINE_COMMIT、scripts/report.ts 的 BASELINE_TAG
#   - CONVENTIONS.md §1 的基线 tag / commit 两行
#   - dict/zh-CN.json、dict/zh-CN.desktop.json 的 baseline 字段
#   - patches/*.patch 开头 `#` 说明里的基线 tag、patches/README.md 里的「现在是 / 都在基线 tag」
# 工作树：upstream/ 与 .build/src 切到新 commit（.build/src 先按 build-zh.sh 第 2 步的方式还原，保留 node_modules）。
# 跑完后：git diff 检查改写结果；跑全套测试；再按 docs/UPGRADE.md 继续构建。

set -Eeuo pipefail

NEW_TAG="${1:-}"
[[ -n "${NEW_TAG}" ]] || { echo "用法：scripts/switch-baseline.sh <新 tag>" >&2; exit 2; }

ZH_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ORIGIN_REPO="${T3ZH_UPSTREAM_REPO:-${HOME}/Projects/t3code}"
OLD_COMMIT="$(sed -n 's/^BASELINE_COMMIT="\(.*\)"$/\1/p' "${ZH_ROOT}/scripts/build-zh.sh")"
OLD_TAG="$(sed -n 's/^const BASELINE_TAG = "\(.*\)";$/\1/p' "${ZH_ROOT}/scripts/report.ts")"
NEW_COMMIT="$(git -C "${ORIGIN_REPO}" rev-parse "${NEW_TAG}^{commit}")"
log() { printf '[switch-baseline] %s\n' "$*"; }

[[ "${OLD_TAG}" != "${NEW_TAG}" ]] || { log "已经是 ${NEW_TAG}"; exit 0; }
[[ -n "${OLD_COMMIT}" && -n "${OLD_TAG}" ]] || { log "读不到当前基线（build-zh.sh / report.ts）"; exit 1; }
[[ -z "$(git -C "${ZH_ROOT}/upstream" status --porcelain)" ]] || { log "upstream/ 有改动，停下"; exit 1; }

# 只在 `#` 说明行里替换 tag；diff 内容不动。
replace_in_comments() {
  perl -i -pe "s/\Q${OLD_TAG}\E/${NEW_TAG}/g if /^#/" "$1"
}

log "${OLD_TAG}（${OLD_COMMIT}）→ ${NEW_TAG}（${NEW_COMMIT}）"
perl -i -pe "s/^BASELINE_COMMIT=\"\Q${OLD_COMMIT}\E\"/BASELINE_COMMIT=\"${NEW_COMMIT}\"/" "${ZH_ROOT}/scripts/build-zh.sh"
perl -i -pe "s/^const BASELINE_TAG = \"\Q${OLD_TAG}\E\";/const BASELINE_TAG = \"${NEW_TAG}\";/" "${ZH_ROOT}/scripts/report.ts"
perl -i -pe "s/^- 基线 tag：\`\Q${OLD_TAG}\E\`/- 基线 tag：\`${NEW_TAG}\`/; s/^- 基线 commit：\`\Q${OLD_COMMIT}\E\`/- 基线 commit：\`${NEW_COMMIT}\`/" "${ZH_ROOT}/CONVENTIONS.md"
for dict in dict/zh-CN.json dict/zh-CN.desktop.json; do
  perl -i -pe "s/^  \"baseline\": \"\Q${OLD_TAG}\E\",/  \"baseline\": \"${NEW_TAG}\",/" "${ZH_ROOT}/${dict}"
done
for patch in "${ZH_ROOT}"/patches/*.patch; do replace_in_comments "${patch}"; done
perl -i -pe "s/\Q${OLD_TAG}\E/${NEW_TAG}/g; s/\Q${OLD_COMMIT}\E/${NEW_COMMIT}/g" "${ZH_ROOT}/patches/README.md"

# 核对改写都发生了。
grep -q "^BASELINE_COMMIT=\"${NEW_COMMIT}\"" "${ZH_ROOT}/scripts/build-zh.sh" || { log "build-zh.sh 没改到"; exit 1; }
grep -q "^const BASELINE_TAG = \"${NEW_TAG}\";" "${ZH_ROOT}/scripts/report.ts" || { log "report.ts 没改到"; exit 1; }
grep -q "基线 commit：\`${NEW_COMMIT}\`" "${ZH_ROOT}/CONVENTIONS.md" || { log "CONVENTIONS.md 没改到"; exit 1; }
for dict in dict/zh-CN.json dict/zh-CN.desktop.json; do
  grep -q "\"baseline\": \"${NEW_TAG}\"" "${ZH_ROOT}/${dict}" || { log "${dict} 没改到"; exit 1; }
done

log "upstream/ → ${NEW_COMMIT}"
git -C "${ZH_ROOT}/upstream" checkout --quiet --detach "${NEW_COMMIT}"
log ".build/src → ${NEW_COMMIT}（先还原，保留 node_modules）"
git -C "${ZH_ROOT}/.build/src" reset --hard --quiet
git -C "${ZH_ROOT}/.build/src" clean -fdx -e node_modules --quiet
git -C "${ZH_ROOT}/.build/src" checkout --quiet --detach "${NEW_COMMIT}"

[[ -z "$(git -C "${ZH_ROOT}/upstream" status --porcelain)" ]] || { log "upstream/ 切换后不干净"; exit 1; }
log "完成。接着：git diff 检查改写；node --test \"plugin/__tests__/*.test.ts\"；scripts/build-zh.sh <版本号>"
