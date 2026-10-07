# 覆盖率报告 v0.0.46-nightly.20261004.2644

- 扫描根：`upstream`（默认 `upstream/`，基线 worktree）
- 词库：`dict/zh-CN.json`，messages 4786 + templates 1025
- 判定来源：`plugin/matcher.ts` 的 `createScanContext` / `listScopeFiles` / `scanModule`
- 预扫描：2015 个文件，值用途字面量 23937 个，0 个解析错误
- 扫描范围：1251 个文件（§4：apps/web/src 与 web 依赖的 packages/*/src，排除测试/stories/bench/.d.ts）

## 口径

- 报告按文件系统扫描 §4 范围（含未被 web 实际引入的 packages/ 文件），而构建插件只转换进入 web 构建模块图的文件，覆盖率数字因此**略偏保守**（分母偏大）。
- **可翻译位置总数**指 `scanModule` 判定为 `translate` 的候选出现次数（同一段文字多处出现算多次）；**去重后的文字数**按「相同 text + 相同 kind」合并。
- **已翻译 / 未翻译按运行时实际查表归类**：对每个 `translate` 候选，先查 messages 再查 templates（`runtime/t3zh-runtime.ts` 的 `createTranslator`，也是 matcher 做模板误配检查时用的同一实现与顺序）。能查到即「已翻译」，即使源码里的建议 key 是 `{0}` 形式、而词库用的是命名占位符（如源码 `Open in {0}` 命中词库模板 `Open in {fileManager}`）。查不到才是「未翻译」。
- `untranslated.json` 里的 `text` 是**建议 key**（把运行时表达式换成 `{0}`、`{1}` 后的形式），补词条时用它；它与「已用词条」是两套 key，别混。
- 可疑项、mixed-jsx 与 A/B 值用途重名清单都**单独统计**，不计入可翻译位置总数；因此 `可翻译位置总数 = 已翻译 + 未翻译` 恒成立。
- **过期词条（stale）**：词库里有、但没有任何 `translate` 候选会在运行时命中它的条目（按真正命中的词库 key 判据，不按源码里搜不搜得到）。只列出，不删除。
- 位置分类 A/B/C/D 与 reason 代码见 CONVENTIONS §4 与 `plugin/matcher.ts` 的 `Candidate.reason` 注释。

## 数字

| 指标 | 出现次数 | 去重后文字数 |
|---|---:|---:|
| 可翻译位置总数 | 6319 | 4519 |
| 已翻译 | 6305（99.8%） | 4505 |
| 未翻译 | 14（0.2%） | 14 |
| 可疑项 | 112 | 52 |
| └ value-use | 108 | 50 |
| └ template-collision | 4 | 2 |
| mixed-jsx | 248 | 216 |
| A/B 值用途重名（单独清单，见 ab-value-use.md） | 202 | 105 |
| 过期词条（stale） | 1307 | — |

对账：可翻译位置总数 6319 = 已翻译 6305 + 未翻译 14 ✅

## 分类分布（translate / skip / suspicious）

| 类别 | translate | skip | suspicious |
|---|---:|---:|---:|
| A | 2038 | 596 | 0 |
| B | 1586 | 59 | 0 |
| C | 2541 | 449 | 111 |
| D | 154 | 0 | 1 |

## 按 reason 的出现次数

- `allow-listed`：126
- `as-const-property`：285
- `attribute`：1578
- `brand-name`：2
- `call-arg`：148
- `data-function`：16
- `destructuring-default`：18
- `error-constructor`：45
- `identifier-like`：31
- `jsx-expression`：853
- `jsx-text`：1021
- `jsx-text-fragment`：162
- `label-function-return`：401
- `label-map`：145
- `mixed-jsx`：248
- `no-letters`：537
- `non-display-call`：224
- `property`：1582
- `rpc-input`：1
- `template-collision`：4
- `value-use`：108

## 与上一份报告的对比

（reports/ 下没有早于当前基线、且带可用 summary.json 的报告，这是首份；只有 summary.md 的残留目录会跳过。）

## 附：A/B 值用途重名

A（JSX 文本/子表达式）和 B 原始白名单属性即使与值用途字面量相同也照常转换（只用于显示），但 §4 要求在报告里列出——见 `ab-value-use.md`（202 处）。
