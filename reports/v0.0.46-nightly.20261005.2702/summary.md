# 覆盖率报告 v0.0.46-nightly.20261005.2702

- 扫描根：`upstream`（默认 `upstream/`，基线 worktree）
- 词库：`dict/zh-CN.json`，messages 4947 + templates 1066
- 判定来源：`plugin/matcher.ts` 的 `createScanContext` / `listScopeFiles` / `scanModule`
- 预扫描：2054 个文件，值用途字面量 24487 个，0 个解析错误
- 扫描范围：1267 个文件（§4：apps/web/src 与 web 依赖的 packages/*/src，排除测试/stories/bench/.d.ts）

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
| 可翻译位置总数 | 6475 | 4646 |
| 已翻译 | 6447（99.6%） | 4618 |
| 未翻译 | 28（0.4%） | 28 |
| 可疑项 | 133 | 71 |
| └ value-use | 108 | 50 |
| └ template-collision | 25 | 21 |
| mixed-jsx | 255 | 223 |
| A/B 值用途重名（单独清单，见 ab-value-use.md） | 211 | 112 |
| 过期词条（stale） | 1396 | — |

对账：可翻译位置总数 6475 = 已翻译 6447 + 未翻译 28 ✅

## 分类分布（translate / skip / suspicious）

| 类别 | translate | skip | suspicious |
|---|---:|---:|---:|
| A | 2090 | 611 | 1 |
| B | 1617 | 60 | 0 |
| C | 2610 | 467 | 131 |
| D | 158 | 0 | 1 |

## 按 reason 的出现次数

- `allow-listed`：127
- `as-const-property`：290
- `attribute`：1609
- `brand-name`：2
- `call-arg`：152
- `data-function`：16
- `destructuring-default`：18
- `error-constructor`：52
- `identifier-like`：31
- `jsx-expression`：879
- `jsx-text`：1044
- `jsx-text-fragment`：165
- `label-function-return`：412
- `label-map`：157
- `mixed-jsx`：255
- `no-letters`：548
- `non-display-call`：233
- `property`：1622
- `rpc-input`：1
- `template-collision`：25
- `value-use`：108

## 与上一份报告的对比

对照 `reports/v0.0.46-nightly.20261004.2644`（只列本次出现的指标，正数表示比上次多）：

| 指标 | 本次 | 上次 | 变化 |
|---|---:|---:|---:|
| scopeFiles | 1267 | 1251 | +16 |
| candidateOccurrences | 7746 | 7535 | +211 |
| translatableOccurrences | 6475 | 6319 | +156 |
| distinctTranslatable | 4646 | 4519 | +127 |
| translatedOccurrences | 6447 | 6305 | +142 |
| distinctTranslated | 4618 | 4505 | +113 |
| untranslatedOccurrences | 28 | 14 | +14 |
| distinctUntranslated | 28 | 14 | +14 |
| skipOccurrences | 1138 | 1104 | +34 |
| suspiciousOccurrences | 133 | 112 | +21 |
| suspiciousValueUseOccurrences | 108 | 108 | 0 |
| suspiciousCollisionOccurrences | 25 | 4 | +21 |
| abValueUseOccurrences | 211 | 202 | +9 |
| distinctAbValueUse | 112 | 105 | +7 |
| mixedJsxOccurrences | 255 | 248 | +7 |
| staleEntries | 1396 | 1307 | +89 |
| usedDictKeys | 4617 | 4504 | +113 |
| dictMessages | 4947 | 4786 | +161 |
| dictTemplates | 1066 | 1025 | +41 |

## 附：A/B 值用途重名

A（JSX 文本/子表达式）和 B 原始白名单属性即使与值用途字面量相同也照常转换（只用于显示），但 §4 要求在报告里列出——见 `ab-value-use.md`（211 处）。
