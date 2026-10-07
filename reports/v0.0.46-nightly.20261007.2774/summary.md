# 覆盖率报告 v0.0.46-nightly.20261007.2774

- 扫描根：`upstream`（默认 `upstream/`，基线 worktree）
- 词库：`dict/zh-CN.json`，messages 5166 + templates 1100
- 判定来源：`plugin/matcher.ts` 的 `createScanContext` / `listScopeFiles` / `scanModule`
- 预扫描：2091 个文件，值用途字面量 24924 个，0 个解析错误
- 扫描范围：1285 个文件（§4：apps/web/src 与 web 依赖的 packages/*/src，排除测试/stories/bench/.d.ts）

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
| 可翻译位置总数 | 6657 | 4783 |
| 已翻译 | 6623（99.5%） | 4749 |
| 未翻译 | 34（0.5%） | 34 |
| 可疑项 | 155 | 90 |
| └ value-use | 111 | 52 |
| └ template-collision | 44 | 38 |
| mixed-jsx | 273 | 238 |
| A/B 值用途重名（单独清单，见 ab-value-use.md） | 219 | 113 |
| 过期词条（stale） | 1518 | — |

对账：可翻译位置总数 6657 = 已翻译 6623 + 未翻译 34 ✅

## 分类分布（translate / skip / suspicious）

| 类别 | translate | skip | suspicious |
|---|---:|---:|---:|
| A | 2163 | 646 | 3 |
| B | 1655 | 60 | 0 |
| C | 2680 | 471 | 149 |
| D | 159 | 0 | 3 |

## 按 reason 的出现次数

- `allow-listed`：129
- `as-const-property`：299
- `attribute`：1646
- `brand-name`：2
- `call-arg`：154
- `data-function`：16
- `destructuring-default`：18
- `error-constructor`：52
- `identifier-like`：30
- `jsx-expression`：899
- `jsx-text`：1080
- `jsx-text-fragment`：182
- `label-function-return`：431
- `label-map`：160
- `mixed-jsx`：273
- `no-letters`：568
- `non-display-call`：235
- `property`：1659
- `rpc-input`：1
- `template-collision`：44
- `value-use`：111

## 与上一份报告的对比

对照 `reports/v0.0.46-nightly.20261007.2761`（只列本次出现的指标，正数表示比上次多）：

| 指标 | 本次 | 上次 | 变化 |
|---|---:|---:|---:|
| scopeFiles | 1285 | 1282 | +3 |
| candidateOccurrences | 7989 | 7975 | +14 |
| translatableOccurrences | 6657 | 6654 | +3 |
| distinctTranslatable | 4783 | 4785 | -2 |
| translatedOccurrences | 6623 | 6622 | +1 |
| distinctTranslated | 4749 | 4753 | -4 |
| untranslatedOccurrences | 34 | 32 | +2 |
| distinctUntranslated | 34 | 32 | +2 |
| skipOccurrences | 1177 | 1167 | +10 |
| suspiciousOccurrences | 155 | 154 | +1 |
| suspiciousValueUseOccurrences | 111 | 111 | 0 |
| suspiciousCollisionOccurrences | 44 | 43 | +1 |
| abValueUseOccurrences | 219 | 216 | +3 |
| distinctAbValueUse | 113 | 113 | 0 |
| mixedJsxOccurrences | 273 | 268 | +5 |
| staleEntries | 1518 | 1432 | +86 |
| usedDictKeys | 4748 | 4752 | -4 |
| dictMessages | 5166 | 5103 | +63 |
| dictTemplates | 1100 | 1081 | +19 |

## 附：A/B 值用途重名

A（JSX 文本/子表达式）和 B 原始白名单属性即使与值用途字面量相同也照常转换（只用于显示），但 §4 要求在报告里列出——见 `ab-value-use.md`（219 处）。
