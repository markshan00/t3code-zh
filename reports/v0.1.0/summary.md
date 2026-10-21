# 覆盖率报告 v0.1.0

- 扫描根：`upstream`（默认 `upstream/`，基线 worktree）
- 词库：`dict/zh-CN.json`，messages 5504 + templates 1216
- 判定来源：`plugin/matcher.ts` 的 `createScanContext` / `listScopeFiles` / `scanModule`
- 预扫描：2310 个文件，值用途字面量 26283 个，0 个解析错误
- 扫描范围：1605 个文件（§4：apps/web/src 与 web 依赖的 packages/*/src，排除测试/stories/bench/.d.ts）

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
| 可翻译位置总数 | 7099 | 5093 |
| 已翻译 | 7016（98.8%） | 5014 |
| 未翻译 | 83（1.2%） | 79 |
| 可疑项 | 221 | 140 |
| └ value-use | 148 | 75 |
| └ template-collision | 73 | 65 |
| mixed-jsx | 300 | 259 |
| A/B 值用途重名（单独清单，见 ab-value-use.md） | 225 | 120 |
| 过期词条（stale） | 1707 | — |

对账：可翻译位置总数 7099 = 已翻译 7016 + 未翻译 83 ✅

## 分类分布（translate / skip / suspicious）

| 类别 | translate | skip | suspicious |
|---|---:|---:|---:|
| A | 2250 | 691 | 3 |
| B | 1738 | 63 | 1 |
| C | 2950 | 772 | 214 |
| D | 161 | 0 | 3 |

## 按 reason 的出现次数

- `allow-listed`：136
- `as-const-property`：339
- `attribute`：1729
- `brand-name`：2
- `call-arg`：156
- `data-function`：16
- `destructuring-default`：19
- `error-constructor`：315
- `identifier-like`：27
- `jsx-expression`：944
- `jsx-text`：1121
- `jsx-text-fragment`：183
- `label-function-return`：459
- `label-map`：170
- `mixed-jsx`：300
- `no-letters`：612
- `non-display-call`：252
- `property`：1843
- `rpc-input`：2
- `template-collision`：73
- `value-use`：148

## 与上一份报告的对比

对照 `reports/v0.0.46-nightly.20261010.2935`（只列本次出现的指标，正数表示比上次多）：

| 指标 | 本次 | 上次 | 变化 |
|---|---:|---:|---:|
| scopeFiles | 1605 | 1481 | +124 |
| candidateOccurrences | 8846 | 8516 | +330 |
| translatableOccurrences | 7099 | 6884 | +215 |
| distinctTranslatable | 5093 | 4919 | +174 |
| translatedOccurrences | 7016 | 6811 | +205 |
| distinctTranslated | 5014 | 4850 | +164 |
| untranslatedOccurrences | 83 | 73 | +10 |
| distinctUntranslated | 79 | 69 | +10 |
| skipOccurrences | 1526 | 1434 | +92 |
| suspiciousOccurrences | 221 | 198 | +23 |
| suspiciousValueUseOccurrences | 148 | 131 | +17 |
| suspiciousCollisionOccurrences | 73 | 67 | +6 |
| abValueUseOccurrences | 225 | 216 | +9 |
| distinctAbValueUse | 120 | 116 | +4 |
| mixedJsxOccurrences | 300 | 273 | +27 |
| staleEntries | 1707 | 1609 | +98 |
| usedDictKeys | 5013 | 4849 | +164 |
| dictMessages | 5504 | 5314 | +190 |
| dictTemplates | 1216 | 1144 | +72 |

## 附：A/B 值用途重名

A（JSX 文本/子表达式）和 B 原始白名单属性即使与值用途字面量相同也照常转换（只用于显示），但 §4 要求在报告里列出——见 `ab-value-use.md`（225 处）。
