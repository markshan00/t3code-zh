# 覆盖率报告 v0.0.46-nightly.20261010.2908

- 扫描根：`upstream`（默认 `upstream/`，基线 worktree）
- 词库：`dict/zh-CN.json`，messages 5262 + templates 1126
- 判定来源：`plugin/matcher.ts` 的 `createScanContext` / `listScopeFiles` / `scanModule`
- 预扫描：2215 个文件，值用途字面量 25491 个，0 个解析错误
- 扫描范围：1477 个文件（§4：apps/web/src 与 web 依赖的 packages/*/src，排除测试/stories/bench/.d.ts）

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
| 可翻译位置总数 | 6852 | 4904 |
| 已翻译 | 6779（98.9%） | 4835 |
| 未翻译 | 73（1.1%） | 69 |
| 可疑项 | 196 | 123 |
| └ value-use | 129 | 64 |
| └ template-collision | 67 | 59 |
| mixed-jsx | 271 | 238 |
| A/B 值用途重名（单独清单，见 ab-value-use.md） | 216 | 116 |
| 过期词条（stale） | 1554 | — |

对账：可翻译位置总数 6852 = 已翻译 6779 + 未翻译 73 ✅

## 分类分布（translate / skip / suspicious）

| 类别 | translate | skip | suspicious |
|---|---:|---:|---:|
| A | 2187 | 638 | 3 |
| B | 1668 | 60 | 1 |
| C | 2838 | 720 | 189 |
| D | 159 | 0 | 3 |

## 按 reason 的出现次数

- `allow-listed`：132
- `as-const-property`：338
- `attribute`：1659
- `brand-name`：2
- `call-arg`：154
- `data-function`：16
- `destructuring-default`：18
- `error-constructor`：275
- `identifier-like`：30
- `jsx-expression`：904
- `jsx-text`：1096
- `jsx-text-fragment`：185
- `label-function-return`：454
- `label-map`：173
- `mixed-jsx`：271
- `no-letters`：579
- `non-display-call`：243
- `property`：1739
- `rpc-input`：2
- `template-collision`：67
- `value-use`：129

## 与上一份报告的对比

对照 `reports/v0.0.46-nightly.20261009.2861`（只列本次出现的指标，正数表示比上次多）：

| 指标 | 本次 | 上次 | 变化 |
|---|---:|---:|---:|
| scopeFiles | 1477 | 1449 | +28 |
| candidateOccurrences | 8466 | 8409 | +57 |
| translatableOccurrences | 6852 | 6847 | +5 |
| distinctTranslatable | 4904 | 4896 | +8 |
| translatedOccurrences | 6779 | 6775 | +4 |
| distinctTranslated | 4835 | 4828 | +7 |
| untranslatedOccurrences | 73 | 72 | +1 |
| distinctUntranslated | 69 | 68 | +1 |
| skipOccurrences | 1418 | 1366 | +52 |
| suspiciousOccurrences | 196 | 196 | 0 |
| suspiciousValueUseOccurrences | 129 | 129 | 0 |
| suspiciousCollisionOccurrences | 67 | 67 | 0 |
| abValueUseOccurrences | 216 | 219 | -3 |
| distinctAbValueUse | 116 | 115 | +1 |
| mixedJsxOccurrences | 271 | 277 | -6 |
| staleEntries | 1554 | 1544 | +10 |
| usedDictKeys | 4834 | 4827 | +7 |
| dictMessages | 5262 | 5247 | +15 |
| dictTemplates | 1126 | 1124 | +2 |

## 附：A/B 值用途重名

A（JSX 文本/子表达式）和 B 原始白名单属性即使与值用途字面量相同也照常转换（只用于显示），但 §4 要求在报告里列出——见 `ab-value-use.md`（216 处）。
