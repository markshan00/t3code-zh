#!/usr/bin/env bash
# t3code-zh 一键构建（T03；桌面主进程部分 T07）。
#
# 从干净的基线源码出发：应用 patches/ → 用包装配置构建 web（构建时转换插件）→ 构建 server、desktop →
# 打 dmg。除了 patches/ 里的补丁、复制进去的 apps/web/vite.zh.config.ts 和 apps/desktop/src/t3zh/
# （桌面主进程汉化用的三个文件，patches/0003 引用它们）及构建工作树的 server 版本字段，
# 不改任何上游文件。T3 Connect 的四个公开标识从基线 .env.example 写入构建树 .env。
#
# 用法：scripts/build-zh.sh <版本号>        例：scripts/build-zh.sh 0.0.46-n2644.zh.0
#
# 环境变量：
#   T3ZH_PATCH_DIR   覆盖补丁目录（默认 <仓库>/patches）。只用于排查补丁问题，交付构建不要设。
#   T3ZH_SKIP_REPORT=1  跳过第 12 步覆盖率报告（报告在审核中、不能改动 reports/ 时用）。
#   RUSTFLAGS / CARGO_ENCODED_RUSTFLAGS  保留外部参数，追加 Cargo 与构建源码的路径映射。
#
# 任何一步失败都立即退出，并说明是哪一步。各步骤耗时和产物路径在最后打印。

set -Eeuo pipefail

ZH_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="${ZH_ROOT}/.build/src"
BASELINE_COMMIT="611132c171f3a821bd2e32f22261135cef6330ac"
STATS_FILE="${ZH_ROOT}/reports/transform-stats.json"
WRAPPER_NAME="vite.zh.config.ts"

# ---- 桌面主进程汉化（T07）----
# 第 5 步把这三个文件复制到 apps/desktop/src/t3zh/（写法：<仓库内路径>:<复制后的文件名>），
# patches/0003 从那里 import __t3zh_t；第 13 步放行这三个文件。
DESKTOP_I18N_DIR="apps/desktop/src/t3zh"
DESKTOP_I18N_FILES=(
  "plugin/desktop/t3zh-desktop.ts:t3zh-desktop.ts"
  "runtime/t3zh-runtime.ts:t3zh-runtime.ts"
  "dict/zh-CN.desktop.json:zh-CN.desktop.json"
)
# 第 10 步的桌面产物守卫：主进程包里要有词库的中文（证明 dict/zh-CN.desktop.json 打包进去了）和
# 传系统语言的参数前缀；preload 包里要有暴露系统语言的代码（证明 patches/0003 的 preload 部分生效）。
DESKTOP_MAIN_GUARD_TEXT='检查更新...'
DESKTOP_ARGUMENT_GUARD_TEXT='--t3zh-system-languages='
DESKTOP_PRELOAD_GUARD_TEXT='__t3zhSystemLanguages'
APP_LICENSE_NAME='T3-Code-LICENSE.txt'

# ---- 构建链守卫的预期值（第 6 步）。上游改了构建链，这里要跟着更新 ----
EXPECTED_SERVER_BUILD_COMMAND='node scripts/cli.ts build'
EXPECTED_SERVER_BUILD_DEPENDS_ON='["@t3tools/web#build"]'
EXPECTED_DESKTOP_BUILD_COMMAND='node scripts/build-browser-secret.mjs && node scripts/build-preview-annotation-css.mjs && vp pack'
EXPECTED_DESKTOP_BUILD_DEPENDS_ON='["t3#build"]'
EXPECTED_WEB_BUILD_SCRIPT='vp build'
EXPECTED_ROOT_BUILD_DESKTOP_SCRIPT='vp run --filter @t3tools/desktop --filter t3 build'

# ---- 产物守卫（第 8 步）----
# 转换总数（reports/transform-stats.json 的 totals.translate）不得低于阈值。阈值 = 首次实测值的 90%（向下取整）。
# 实测：T03-fix4，2026-10-05，基线 v0.0.46-nightly.20261004.2644 + patches 0001/0002，含 §4 位置扩充 E1–E3、
# 受保护语法形式的统一解析，词库为当时 T05 尚未提交的工作区版本（4698 messages + 1021 templates），转换 6176 处。
# 同一份代码用已提交的词库（447fe55：3465 + 668）构建为 5613 处，仍高于阈值。
# （此前：T03-fix3 为 5613 / 阈值 5051；T03-fix1/fix2 为 5642 / 5077；T03 首版不含 E1–E3 时为 4869 / 4382。）
MEASURED_TRANSLATE=6176
MIN_TRANSLATE=5558
# 词库里一条已确认在基线源码中出现的条目的中文（源码 apps/web/src/components/settings/SettingInheritance.tsx 的 "Inherit defaults"）。
GUARD_TEXT='继承默认设置'

# ---------------------------------------------------------------------------

log() { printf '[build-zh] %s\n' "$*"; }
die() { printf '[build-zh] 失败：第 %s 步「%s」：%s\n' "${STEP_NO:-0}" "${STEP_NAME:-准备}" "$*" >&2; exit 1; }
now() { perl -MTime::HiRes=time -e 'printf "%.1f\n", time'; }

usage() {
  echo "用法：scripts/build-zh.sh <版本号>   例：scripts/build-zh.sh 0.0.46-n2644.zh.0" >&2
  exit 2
}

VERSION="${1:-}"
[[ -n "${VERSION}" ]] || usage
[[ "${VERSION}" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z]+([.-][0-9A-Za-z]+)*)?$ ]] || die "版本号格式不对：${VERSION}"
# 与 scripts/build-desktop-artifact.ts 的 resolveDesktopUpdateChannel 一致：这种形式会让产品名变成 T3 Code (Nightly)。
if [[ "${VERSION}" =~ -nightly\.[0-9]{8}\.[0-9]+$ ]]; then
  die "版本号不能是 -nightly.YYYYMMDD.N 形式（CONVENTIONS §6），会和官方 Nightly 重名：${VERSION}"
fi
RELEASE_DIR="${ZH_ROOT}/release/${VERSION}"

# Claude Code / VSCode 的终端可能带着 ELECTRON_RUN_AS_NODE=1；构建本身不需要它，清掉以免子进程里的 Electron 以 Node 模式运行。
unset ELECTRON_RUN_AS_NODE || true

# vp、cargo 不在 PATH 时加载它们的环境脚本（docs/BUILD.md §0）。
set +u
if ! command -v vp >/dev/null 2>&1 && [[ -f "${HOME}/.config/vite-plus/env" ]]; then . "${HOME}/.config/vite-plus/env"; fi
if ! command -v cargo >/dev/null 2>&1 && [[ -f "${HOME}/.cargo/env" ]]; then . "${HOME}/.cargo/env"; fi
set -u
command -v vp >/dev/null 2>&1 || die "找不到 vp（见 docs/BUILD.md §0）"
command -v node >/dev/null 2>&1 || die "找不到 node"

STEP_NO=0
STEP_NAME="准备"
STEP_LOG=""
TOTAL_START="$(now)"

on_error() {
  local status=$?
  printf '[build-zh] 失败：第 %s 步「%s」（退出码 %s，脚本第 %s 行）\n' "${STEP_NO}" "${STEP_NAME}" "${status}" "$1" >&2
  exit "${status}"
}
trap 'on_error ${LINENO}' ERR

step() {
  local no="$1" name="$2"
  shift 2
  STEP_NO="${no}"
  STEP_NAME="${name}"
  log "==== 第 ${no} 步：${name} ===="
  local start end
  start="$(now)"
  "$@"
  end="$(now)"
  local secs
  secs="$(perl -e "printf '%.1f', ${end} - ${start}")"
  STEP_LOG="${STEP_LOG}$(printf '  %2s. %-28s %8ss' "${no}" "${name}" "${secs}")"$'\n'
  log "第 ${no} 步完成（${secs}s）"
}

# ---- 第 1 步 ----
check_baseline() {
  [[ -d "${SRC}/.git" || -f "${SRC}/.git" ]] || die "${SRC} 不是 git 工作树（见 docs/BUILD.md §1）"
  local head
  head="$(git -C "${SRC}" rev-parse HEAD)"
  [[ "${head}" == "${BASELINE_COMMIT}" ]] || die ".build/src 的 HEAD 是 ${head}，不是基线 ${BASELINE_COMMIT}"
  log "HEAD = ${head}"
}

# ---- 第 2 步 ----
reset_tree() {
  git -C "${SRC}" reset --hard --quiet
  git -C "${SRC}" clean -fdx -e node_modules --quiet
  log "已还原到基线并清除未跟踪文件（保留 node_modules）"
}

# ---- 第 3 步 ----
install_deps() {
  local hash stamp
  hash="$(shasum -a 256 "${SRC}/pnpm-lock.yaml" | awk '{print $1}')"
  stamp="${SRC}/node_modules/.t3zh-lockfile.sha256"
  if [[ -d "${SRC}/node_modules" && -f "${stamp}" && "$(cat "${stamp}")" == "${hash}" ]]; then
    log "node_modules 存在且 pnpm-lock.yaml 未变化，跳过安装"
    return 0
  fi
  log "运行 vp i --frozen-lockfile（docs/BUILD.md §5.1：不加 --frozen-lockfile 会改写 lockfile）"
  (cd "${SRC}" && vp i --frozen-lockfile)
  printf '%s\n' "${hash}" >"${stamp}"
}

# ---- 第 4 步 ----
PATCH_TOUCHED=""
apply_patches() {
  local dir="${T3ZH_PATCH_DIR:-${ZH_ROOT}/patches}"
  if [[ -n "${T3ZH_PATCH_DIR:-}" ]]; then
    log "注意：补丁目录被 T3ZH_PATCH_DIR 覆盖为 ${dir}"
  fi
  local files=()
  if [[ -d "${dir}" ]]; then
    while IFS= read -r file; do files+=("${file}"); done < <(find "${dir}" -maxdepth 1 -type f -name '*.patch' | LC_ALL=C sort)
  fi
  if [[ ${#files[@]} -eq 0 ]]; then
    log "没有补丁"
    return 0
  fi
  local patch
  for patch in "${files[@]}"; do
    if ! git -C "${SRC}" apply "${patch}"; then
      die "补丁打不上：$(basename "${patch}")（按 patches/README.md 重做补丁）"
    fi
    # --numstat 只解析补丁、不应用，第三列是涉及的文件（第 13 步据此放行）。
    PATCH_TOUCHED="${PATCH_TOUCHED}$(git -C "${SRC}" apply --numstat "${patch}" | awk -F'\t' '{print $3}')"$'\n'
    log "已应用 $(basename "${patch}")"
  done
}

# ---- 第 5 步 ----
copy_wrapper() {
  node "${ZH_ROOT}/scripts/lib/t3-connect-config.ts" prepare "${SRC}"
  node "${ZH_ROOT}/scripts/lib/t3-connect-config.ts" check-source "${SRC}"
  cp "${ZH_ROOT}/build/${WRAPPER_NAME}" "${SRC}/apps/web/${WRAPPER_NAME}"
  log "已复制 build/${WRAPPER_NAME} → apps/web/${WRAPPER_NAME}"
  copy_desktop_i18n
}

# 桌面主进程汉化文件（T07）。先校验桌面词库；目标目录若已在上游源码里出现，说明上游占用了这个路径，停下来改名。
copy_desktop_i18n() {
  node "${ZH_ROOT}/scripts/check-dict.ts" "${ZH_ROOT}/dict/zh-CN.desktop.json" ||
    die "dict/zh-CN.desktop.json 校验不通过"
  [[ ! -e "${SRC}/${DESKTOP_I18N_DIR}" ]] || die "上游源码里已有 ${DESKTOP_I18N_DIR}，与桌面汉化文件的目录冲突"
  mkdir -p "${SRC}/${DESKTOP_I18N_DIR}"
  local entry
  for entry in "${DESKTOP_I18N_FILES[@]}"; do
    cp "${ZH_ROOT}/${entry%%:*}" "${SRC}/${DESKTOP_I18N_DIR}/${entry##*:}"
    log "已复制 ${entry%%:*} → ${DESKTOP_I18N_DIR}/${entry##*:}"
  done
}

# ---- 第 6 步 ----
CHAIN_FAILED=0
check_chain_value() {
  local file="$1" query="$2" expected="$3" actual
  if ! actual="$(node "${ZH_ROOT}/scripts/lib/build-chain.ts" "${SRC}/${file}" "${query}")"; then
    log "读不到 ${file} 的 ${query}"
    CHAIN_FAILED=1
    return 0
  fi
  if [[ "${actual}" != "${expected}" ]]; then
    log "不一致：${file} ${query}"
    log "  预期：${expected}"
    log "  实际：${actual}"
    CHAIN_FAILED=1
  else
    log "一致：${file} ${query} = ${actual}"
  fi
}
guard_build_chain() {
  CHAIN_FAILED=0
  check_chain_value apps/server/vite.config.ts run.tasks.build.command "${EXPECTED_SERVER_BUILD_COMMAND}"
  check_chain_value apps/server/vite.config.ts run.tasks.build.dependsOn "${EXPECTED_SERVER_BUILD_DEPENDS_ON}"
  check_chain_value apps/desktop/vite.config.ts run.tasks.build.command "${EXPECTED_DESKTOP_BUILD_COMMAND}"
  check_chain_value apps/desktop/vite.config.ts run.tasks.build.dependsOn "${EXPECTED_DESKTOP_BUILD_DEPENDS_ON}"
  check_chain_value apps/web/package.json scripts.build "${EXPECTED_WEB_BUILD_SCRIPT}"
  check_chain_value package.json scripts.build:desktop "${EXPECTED_ROOT_BUILD_DESKTOP_SCRIPT}"
  if [[ "${CHAIN_FAILED}" != 0 ]]; then
    die "上游构建链变了，需要更新 build-zh.sh"
  fi
}

# ---- 第 7 步 ----
build_web() {
  rm -f "${STATS_FILE}"
  (cd "${SRC}/apps/web" && APP_VERSION="${VERSION}" T3ZH_ROOT="${ZH_ROOT}" vp build -c "${WRAPPER_NAME}")
}

# ---- 第 8 步 ----
guard_web_output() {
  [[ -f "${SRC}/apps/web/dist/index.html" ]] || die "apps/web/dist/index.html 不存在"
  [[ -f "${STATS_FILE}" ]] || die "没有生成 ${STATS_FILE}（插件没运行？）"
  local translated
  translated="$(node -e 'const s = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8")); console.log(s.totals.translate)' "${STATS_FILE}")"
  log "转换总数 ${translated}（阈值 ${MIN_TRANSLATE}，首次实测 ${MEASURED_TRANSLATE}）"
  if (( translated < MIN_TRANSLATE )); then
    die "转换总数 ${translated} 低于阈值 ${MIN_TRANSLATE}：插件可能没生效，或上游改了文字的写法"
  fi
  local hit
  hit="$(grep -rlF -- "${GUARD_TEXT}" "${SRC}/apps/web/dist" | head -n 1 || true)"
  [[ -n "${hit}" ]] || die "apps/web/dist 里找不到固定中文「${GUARD_TEXT}」：词库没有打包进去"
  log "固定中文「${GUARD_TEXT}」见于 ${hit#"${SRC}/"}"
  # 常规设置读取 web 的 APP_VERSION，不是 serverVersion 或桌面 plist。
  # 包装配置已核对实际 Vite define；这里再确认对应版本进入编译产物。
  hit="$(grep -rlF -- "${VERSION}" "${SRC}/apps/web/dist/assets" | head -n 1 || true)"
  [[ -n "${hit}" ]] || die "web 产物未包含交付版本 ${VERSION}"
  log "web APP_VERSION = ${VERSION}"
}

# ---- 第 9 步 ----
build_server() {
  # 上游 tag 的 package.json 仍可能是上一正式版；serverVersion 和 CLI --version
  # 在编译时读取此字段，必须与桌面包装版本一致。只修改专用构建工作树。
  node --input-type=module - "${SRC}/apps/server/package.json" "${VERSION}" <<'NODE'
import fs from "node:fs";
const [file, version] = process.argv.slice(2);
const pkg = JSON.parse(fs.readFileSync(file, "utf8"));
pkg.version = version;
fs.writeFileSync(file, JSON.stringify(pkg, null, 2) + "\n");
NODE
  # 不能用 vp run --filter t3 build：dependsOn 会用上游配置重新构建 web，覆盖中文产物。
  (cd "${SRC}/apps/server" && node scripts/cli.ts build)
  local version_home actual_version
  version_home="$(mktemp -d /tmp/t3zh-build-version.XXXXXX)"
  if ! actual_version="$(T3CODE_HOME="${version_home}" node "${SRC}/apps/server/dist/bin.mjs" --version)"; then
    rm -rf "${version_home}"
    die "无法读取构建后的 server 版本"
  fi
  rm -rf "${version_home}"
  [[ "${actual_version}" == "t3 v${VERSION}" ]] || die "server 版本 ${actual_version} 与交付版本 ${VERSION} 不一致"
  log "server --version = ${actual_version}"
  local hit
  hit="$(grep -rlF -- "${GUARD_TEXT}" "${SRC}/apps/server/dist/client" | head -n 1 || true)"
  [[ -n "${hit}" ]] || die "apps/server/dist/client 里找不到「${GUARD_TEXT}」：server 没有带上中文 web 产物"
}

# ---- 第 10 步 ----
build_desktop() {
  (cd "${SRC}/apps/desktop" && bash -c "${EXPECTED_DESKTOP_BUILD_COMMAND}")
  guard_desktop_output
  node "${ZH_ROOT}/scripts/lib/t3-connect-config.ts" check-artifacts "${SRC}"
}

# 桌面产物守卫（T07）：确认 patches/0003 和复制进去的汉化文件确实进了打包用的 dist-electron。
guard_desktop_output() {
  local dist="${SRC}/apps/desktop/dist-electron"
  [[ -f "${dist}/main.cjs" && -f "${dist}/preload.cjs" ]] || die "apps/desktop/dist-electron 里缺 main.cjs 或 preload.cjs"
  grep -qF -- "${DESKTOP_MAIN_GUARD_TEXT}" "${dist}/main.cjs" ||
    die "main.cjs 里找不到「${DESKTOP_MAIN_GUARD_TEXT}」：桌面词库没有打包进去"
  grep -qF -- "${DESKTOP_ARGUMENT_GUARD_TEXT}" "${dist}/main.cjs" ||
    die "main.cjs 里找不到 ${DESKTOP_ARGUMENT_GUARD_TEXT}：主窗口没有传系统语言"
  grep -qF -- "${DESKTOP_PRELOAD_GUARD_TEXT}" "${dist}/preload.cjs" ||
    die "preload.cjs 里找不到 ${DESKTOP_PRELOAD_GUARD_TEXT}：preload 没有暴露系统语言"
  log "桌面产物含「${DESKTOP_MAIN_GUARD_TEXT}」、${DESKTOP_ARGUMENT_GUARD_TEXT} 和 ${DESKTOP_PRELOAD_GUARD_TEXT}"
}

# ---- 第 11 步 ----
package_dmg() {
  case "${RELEASE_DIR}" in
    "${ZH_ROOT}/release/"?*) ;;
    *) die "输出目录异常：${RELEASE_DIR}" ;;
  esac
  if [[ -e "${RELEASE_DIR}" ]]; then
    log "删除同版本号的旧产物 ${RELEASE_DIR}"
    rm -rf "${RELEASE_DIR}"
  fi
  # Cargo 子进程继承这些参数；不复用 resource-monitor，确保此次映射经过实际编译。
  # .build/src 的 target 已由第 2 步清除，依赖及主程序都会重新编译。
  local cargo_remap="--remap-path-prefix=${CARGO_HOME:-${HOME}/.cargo}=/cargo"
  local source_remap="--remap-path-prefix=${SRC}=/t3code"
  (
    export RUSTFLAGS="${RUSTFLAGS:+${RUSTFLAGS} }${cargo_remap} ${source_remap}"
    # Cargo 优先读取 encoded 形式；存在时同样追加，保留其原有参数边界。
    if [[ -n "${CARGO_ENCODED_RUSTFLAGS+x}" ]]; then
      export CARGO_ENCODED_RUSTFLAGS="${CARGO_ENCODED_RUSTFLAGS:+${CARGO_ENCODED_RUSTFLAGS}$'\x1f'}${cargo_remap}"$'\x1f'"${source_remap}"
    fi
    cd "${SRC}"
    T3CODE_DESKTOP_REUSE_RESOURCE_MONITOR=false T3CODE_DESKTOP_VERSION="${VERSION}" T3CODE_DESKTOP_OUTPUT_DIR="${RELEASE_DIR}" vp run dist:desktop:dmg:arm64 --skip-build --verbose
  )
  ls "${RELEASE_DIR}"/*.dmg >/dev/null 2>&1 || die "${RELEASE_DIR} 里没有 dmg"
  guard_mac_localization
}

# 打包产物守卫（T07-fix1）：patches/0005 让 Info.plist 声明 zh-Hans 本地化，从 zip 里读出来核对。
guard_mac_localization() {
  local zip plist localizations
  zip="$(find "${RELEASE_DIR}" -maxdepth 1 -type f -name '*.zip' | head -n 1 || true)"
  [[ -n "${zip}" ]] || die "${RELEASE_DIR} 里没有 zip，无法核对 Info.plist"
  plist="$(unzip -Z1 "${zip}" | grep -E '^[^/]+\.app/Contents/Info\.plist$' | head -n 1 || true)"
  [[ -n "${plist}" ]] || die "zip 里找不到 <app>/Contents/Info.plist"
  localizations="$(unzip -p "${zip}" "${plist}" | plutil -extract CFBundleLocalizations json -o - - 2>/dev/null || true)"
  [[ "${localizations}" == *'"zh-Hans"'* ]] ||
    die "Info.plist 的 CFBundleLocalizations 不含 zh-Hans（patches/0005 没生效）：${localizations:-（没有这个键）}"
  log "Info.plist CFBundleLocalizations = ${localizations}"
}

# ---- 第 12 步 ----
run_report() {
  if [[ "${T3ZH_SKIP_REPORT:-}" == "1" ]]; then
    log "T3ZH_SKIP_REPORT=1，跳过覆盖率报告"
    return 0
  fi
  if [[ -f "${ZH_ROOT}/scripts/report.ts" ]]; then
    (cd "${ZH_ROOT}" && node scripts/report.ts)
  else
    log "scripts/report.ts 不存在（T04 交付），跳过"
  fi
}

# ---- 第 13 步 ----
check_tree_status() {
  # 从实际 App 包读取许可证，不能只检查源码或 staging 文件。
  local zip license_path
  zip="$(find "${RELEASE_DIR}" -maxdepth 1 -type f -name '*.zip' | head -n 1 || true)"
  [[ -n "${zip}" ]] || die "没有 zip，无法核对 App 许可证"
  license_path="$(unzip -Z1 "${zip}" | grep -E "^[^/]+\\.app/Contents/Resources/${APP_LICENSE_NAME}$" | head -n 1 || true)"
  [[ -n "${license_path}" ]] || die "App 里没有 ${APP_LICENSE_NAME}"
  unzip -p "${zip}" "${license_path}" | cmp - "${SRC}/LICENSE" || die "App 许可证与基线 LICENSE 不一致"
  log "App ${APP_LICENSE_NAME} 与基线 LICENSE 逐字节一致"
  # .env 被上游 Git 忽略，单独核对其字段和值，不能靠 git status 放行。
  node "${ZH_ROOT}/scripts/lib/t3-connect-config.ts" check-source "${SRC}"
  log "git -C .build/src status --porcelain："
  git -C "${SRC}" status --porcelain
  local allowed unexpected="" line path entry desktop_files=""
  for entry in "${DESKTOP_I18N_FILES[@]}"; do
    desktop_files="${desktop_files}${DESKTOP_I18N_DIR}/${entry##*:}"$'\n'
  done
  allowed="$(printf '%s\n%s\n%s\n%s\n' "${PATCH_TOUCHED}" "apps/web/${WRAPPER_NAME}" "${desktop_files}" "apps/server/package.json" | sed '/^$/d' | LC_ALL=C sort -u)"
  # package.json 只允许版本字段变化，避免扩大构建工作树放行范围。
  node --input-type=module - "${SRC}" "${VERSION}" <<'NODE'
import fs from "node:fs";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
const [src, version] = process.argv.slice(2);
const original = JSON.parse(execFileSync("git", ["-C", src, "show", "HEAD:apps/server/package.json"], { encoding: "utf8" }));
const actual = JSON.parse(fs.readFileSync(`${src}/apps/server/package.json`, "utf8"));
assert.equal(actual.version, version);
assert.deepEqual(actual, { ...original, version });
NODE
  while IFS= read -r line; do
    [[ -z "${line}" ]] && continue
    path="${line:3}"
    path="${path##* -> }"
    path="${path#\"}"
    path="${path%\"}"
    if ! grep -qxF -- "${path}" <<<"${allowed}"; then
      unexpected="${unexpected}  ${line}"$'\n'
    fi
  done < <(git -C "${SRC}" status --porcelain --untracked-files=all)
  if [[ -n "${unexpected}" ]]; then
    printf '%s' "${unexpected}" >&2
    die ".build/src 出现了补丁、包装配置、桌面汉化文件和 server 版本字段以外的改动"
  fi
  log "仅有补丁文件、包装配置、${DESKTOP_I18N_DIR}/ 的 ${#DESKTOP_I18N_FILES[@]} 个文件及 server 版本字段有改动"
}

step 1 "校验基线 commit" check_baseline
step 2 "还原工作树" reset_tree
step 3 "安装依赖" install_deps
step 4 "应用补丁" apply_patches
step 5 "准备 T3 Connect 与汉化配置" copy_wrapper
step 6 "构建链守卫" guard_build_chain
step 7 "构建 web（中文转换）" build_web
step 8 "产物守卫" guard_web_output
step 9 "构建 server" build_server
step 10 "构建 desktop" build_desktop
step 11 "打包 dmg" package_dmg
step 12 "覆盖率报告" run_report
step 13 "检查许可证与工作树改动" check_tree_status

STEP_NO=14
STEP_NAME="汇总"
TOTAL_END="$(now)"
log "==== 完成：${VERSION} ===="
printf '%s' "${STEP_LOG}"
printf '  总耗时 %ss\n' "$(perl -e "printf '%.1f', ${TOTAL_END} - ${TOTAL_START}")"
log "产物："
find "${RELEASE_DIR}" -maxdepth 1 -type f \( -name '*.dmg' -o -name '*.zip' \) | LC_ALL=C sort | sed 's/^/  /'
log "转换统计：${STATS_FILE}"
