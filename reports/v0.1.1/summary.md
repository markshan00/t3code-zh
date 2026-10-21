# 覆盖率报告 v0.1.1

- 扫描根：`upstream`（默认 `upstream/`，基线 worktree）
- 词库：`dict/zh-CN.json`，messages 5677 + templates 1281
- 判定来源：`plugin/matcher.ts` 的 `createScanContext` / `listScopeFiles` / `scanModule`
- 预扫描：2419 个文件，值用途字面量 27627 个，0 个解析错误
- 扫描范围：1678 个文件（§4：apps/web/src 与 web 依赖的 packages/*/src，排除测试/stories/bench/.d.ts）

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
| 可翻译位置总数 | 7292 | 5233 |
| 已翻译 | 7195（98.7%） | 5143 |
| 未翻译 | 97（1.3%） | 90 |
| 可疑项 | 241 | 156 |
| └ value-use | 155 | 80 |
| └ template-collision | 86 | 76 |
| mixed-jsx | 322 | 275 |
| A/B 值用途重名（单独清单，见 ab-value-use.md） | 243 | 131 |
| 过期词条（stale） | 1816 | — |

对账：可翻译位置总数 7292 = 已翻译 7195 + 未翻译 97 ✅

## 分类分布（translate / skip / suspicious）

| 类别 | translate | skip | suspicious |
|---|---:|---:|---:|
| A | 2333 | 729 | 4 |
| B | 1785 | 68 | 2 |
| C | 3016 | 795 | 232 |
| D | 158 | 0 | 3 |

## 按 reason 的出现次数

- `allow-listed`：134
- `as-const-property`：339
- `attribute`：1776
- `brand-name`：2
- `call-arg`：154
- `data-function`：16
- `destructuring-default`：19
- `error-constructor`：328
- `identifier-like`：31
- `jsx-expression`：971
- `jsx-text`：1166
- `jsx-text-fragment`：194
- `label-function-return`：479
- `label-map`：174
- `mixed-jsx`：322
- `no-letters`：629
- `non-display-call`：262
- `property`：1886
- `rpc-input`：2
- `template-collision`：86
- `value-use`：155

## 与上一份报告的对比

对照 `reports/v0.1.0`（只列本次出现的指标，正数表示比上次多）：

| 指标 | 本次 | 上次 | 变化 |
|---|---:|---:|---:|
| scopeFiles | 1678 | 1605 | +73 |
| candidateOccurrences | 9125 | 8846 | +279 |
| translatableOccurrences | 7292 | 7099 | +193 |
| distinctTranslatable | 5233 | 5093 | +140 |
| translatedOccurrences | 7195 | 7016 | +179 |
| distinctTranslated | 5143 | 5014 | +129 |
| untranslatedOccurrences | 97 | 83 | +14 |
| distinctUntranslated | 90 | 79 | +11 |
| skipOccurrences | 1592 | 1526 | +66 |
| suspiciousOccurrences | 241 | 221 | +20 |
| suspiciousValueUseOccurrences | 155 | 148 | +7 |
| suspiciousCollisionOccurrences | 86 | 73 | +13 |
| abValueUseOccurrences | 243 | 225 | +18 |
| distinctAbValueUse | 131 | 120 | +11 |
| mixedJsxOccurrences | 322 | 300 | +22 |
| staleEntries | 1816 | 1707 | +109 |
| usedDictKeys | 5142 | 5013 | +129 |
| dictMessages | 5677 | 5504 | +173 |
| dictTemplates | 1281 | 1216 | +65 |

## 附：A/B 值用途重名

A（JSX 文本/子表达式）和 B 原始白名单属性即使与值用途字面量相同也照常转换（只用于显示），但 §4 要求在报告里列出——见 `ab-value-use.md`（243 处）。
