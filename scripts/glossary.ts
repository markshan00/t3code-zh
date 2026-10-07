/**
 * 术语表生成（T02 交付物之一）。
 *
 * 统计口径（全部可从 dict/zh-CN.json 复算）：
 *  1. 对每个术语，扫主词库（messages + templates）里英文原文按词边界命中的条目，
 *     得到"命中条目"数（与英文 key 上的 grep 词边界一致，不因出现位置而变）。
 *  2. 归属统计前先做两件事，避免把运行时插值当成译文：
 *     a. 英文里只在占位符内出现的命中（如 `Choose accent color for {provider}` 里的
 *        `provider`）不计入翻译统计，单列为"占位符内"；
 *     b. 中文译文里的占位符片段（`{provider}`）整段剔除后再看有没有该术语的译法。
 *  3. 现有译法 = 登记的表现形式（variants：同一语义的直译；groups：同一英文词另一语义
 *     的译法，按语义分组并注明）。逐条按**最长匹配**归属：一条译文命中多个形式时算给
 *     最长的那个，所以"服务提供方"不会被同时记进"提供方"，语义分组之间也不重复计数。
 *  4. "保留英文"＝剔除占位符后，中文译文里仍出现该英文词的条目数。
 *  5. "其他"＝既没命中任何登记形式、也没保留英文的条目数，并列出代表性实例。
 *  恒等关系：命中条目 = 现有译法之和 + 保留英文 + 占位符内 + 其他。
 *
 * 输出只写建议，不改词库；译法定稿留给 T05。
 */

// 术语表：英文术语 → 该术语在现有词库里实际出现过的中文写法。
// 只登记从词库观察到的写法，不臆造。
//   zh:      同一语义的直译变体，各自计数、互不包含（最长匹配）。
//   groups:  同一英文词的另一语义/另一语境下的译法，按语义分组注明，避免把 "review＝检查"
//            和 "review＝评审" 混成一列；组内词也参与最长匹配，不会与 variants 重叠计数。
// 不列英文原词本身做候选——中文里保留英文的情况统一记在"保留英文"列。
export const TERMS = [
  // —— 核心领域对象
  { en: "Thread", zh: ["任务", "线程", "对话"], note: "侧栏里的工作单元" },
  { en: "Project", zh: ["项目"], note: "被托管的代码仓库容器" },
  { en: "Worktree", zh: ["工作树", "签出"], note: "git worktree，每个线程一份" },
  { en: "Checkout", zh: ["检出目录", "检出", "签出"], note: "项目在本机的本地副本" },
  { en: "Provider", zh: ["服务提供方", "提供方", "提供商"], note: "模型服务商（Anthropic / OpenAI…）" },
  { en: "Agent", zh: ["智能体", "代理"], note: "在环境里跑代码的 AI；现有词库常保留 Agent，见下节" },
  { en: "Environment", zh: ["环境"], note: "一台运行服务端的主机" },
  { en: "Session", zh: ["会话"], note: "一次运行上下文" },
  { en: "Workspace", zh: ["工作区"], note: "线程所在目录范围" },
  { en: "Checkpoint", zh: ["检查点"], note: "消息级回滚点" },
  { en: "Branch", zh: ["分支"], note: "git 分支" },
  { en: "Commit", zh: ["提交"], note: "git commit" },
  { en: "Diff", zh: ["差异", "变更"], note: "代码改动视图；现有词库也常直接保留 Diff" },
  { en: "Terminal", zh: ["终端"], note: "内置命令行" },
  { en: "Model", zh: ["模型"], note: "LLM 模型" },
  { en: "Reasoning", zh: ["推理", "推理强度"], note: "推理过程 / 推理档位" },
  { en: "Effort", zh: ["推理强度", "档位", "力度"], note: "推理力度档位" },
  { en: "Composer", zh: ["输入框", "输入区", "输入控制"], note: "底部输入区" },
  { en: "Message", zh: ["消息", "信息"], note: "对话消息；提交语境下也译作「信息」" },
  { en: "Messages", zh: ["消息", "信息"], note: "Message 的复数" },
  { en: "Pull request", zh: ["拉取请求", "PR"], note: "GitHub PR" },
  {
    en: "Review",
    zh: ["评审", "审核", "审查"],
    groups: [
      { label: "一般检查（review＝检查/查看，不是代码评审）", words: ["检查"] },
      { label: "查看", words: ["查看"] },
    ],
    note: "代码评审与「检查某物」两个语义，分列",
  },
  {
    en: "Usage",
    zh: ["用量"],
    groups: [
      { label: "时段（usage period）", words: ["时段"] },
      { label: "使用（usage 的位置/动作义）", words: ["使用"] },
    ],
    note: "用量与配额的「用量」页",
  },
  { en: "Limits", zh: ["限额", "限制"], groups: [{ label: "额度", words: ["额度"] }], note: "用量页的限额" },
  { en: "Settings", zh: ["设置"], note: "设置页" },
  { en: "Sidebar", zh: ["侧栏", "侧边栏"], note: "左侧导航栏" },
  { en: "Panel", zh: ["面板"], note: "可停靠面板" },
  { en: "Device", zh: ["设备"], note: "移动端/模拟器设备" },
  {
    en: "Machine",
    zh: ["设备", "机器"],
    groups: [{ label: "本机（this machine）", words: ["本机"] }],
    note: "环境里的主机",
  },
  { en: "Computer", zh: ["设备", "计算机", "电脑"], note: "设置向导里的主机" },
  {
    en: "Host",
    zh: ["主机地址", "主机", "地址"],
    groups: [{ label: "托管服务 / 托管平台（host＝代码托管方）", words: ["托管服务", "托管平台", "托管位置"] }],
    note: "运行服务的机器；另一语义指代码托管平台",
  },
  { en: "Server", zh: ["服务器", "服务端"], note: "本地/远端服务" },
  { en: "Connection", zh: ["连接"], note: "与服务的连接" },
  { en: "Account", zh: ["账户", "账号"], note: "登录账户" },
  { en: "Credentials", zh: ["凭据"], note: "API 凭据" },
  { en: "Token", zh: ["令牌"], note: "访问令牌" },

  // —— 设置各页与分组
  { en: "General", zh: ["常规", "通用"], note: "设置 → 通用" },
  { en: "Appearance", zh: ["外观"], note: "设置 → 外观" },
  { en: "Keybindings", zh: ["快捷键"], note: "设置 → 快捷键" },
  { en: "Shortcut", zh: ["快捷键"], note: "快捷键条目" },
  { en: "Interface", zh: ["界面"], note: "设置 → 界面" },
  { en: "Version control", zh: ["版本控制"], note: "设置 → 版本控制" },
  { en: "Connections", zh: ["连接"], note: "设置 → 连接" },
  { en: "Behavior", zh: ["使用行为", "行为"], note: "设置分组" },
  { en: "Confirmations", zh: ["操作确认", "确认"], note: "设置分组" },
  { en: "Colors & themes", zh: ["颜色与主题"], note: "设置分组" },
  { en: "Panel animations", zh: ["面板动效", "面板动画"], note: "设置项" },
  { en: "Diff layout", zh: ["差异布局", "Diff 布局"], note: "设置项" },
  { en: "Theme", zh: ["主题"], note: "配色主题" },
  { en: "Accent color", zh: ["强调色"], note: "主题强调色" },
  { en: "Motion", zh: ["动效", "动态效果"], note: "设置分组 / 动效开关" },
  { en: "Notifications", zh: ["通知"], note: "通知设置" },

  // —— 状态与动作
  {
    en: "Working",
    zh: ["进行中", "运行中", "工作区", "已运行", "正在运行"],
    groups: [{ label: "工作（working 作动词）", words: ["工作"] }],
    note: "线程状态（含 Working tree 等复合词）",
  },
  { en: "Idle", zh: ["空闲"], note: "线程状态" },
  { en: "Waiting", zh: ["等待中", "等待"], note: "线程状态" },
  { en: "Settled", zh: ["已完成", "已收起"], note: "线程状态" },
  { en: "Snoozed", zh: ["已暂缓", "已稍后处理"], groups: [{ label: "稍后处理", words: ["稍后处理"] }], note: "线程状态" },
  { en: "Archived", zh: ["已归档", "归档于"], groups: [{ label: "归档（动作）", words: ["归档"] }], note: "线程状态" },
  { en: "Running", zh: ["运行中"], note: "任务/检查状态" },
  {
    en: "Failed",
    zh: ["失败"],
    groups: [{ label: "未通过 / 无法（failed to…）", words: ["未通过", "无法"] }],
    note: "状态",
  },
  {
    en: "Passed",
    zh: ["已通过", "通过"],
    groups: [{ label: "传递（passed 作过去分词）", words: ["传递"] }],
    note: "检查状态；也作 arguments passed 的「传递」",
  },
  { en: "Cancelled", zh: ["已取消", "取消"], note: "状态" },
  { en: "Skipped", zh: ["已跳过", "跳过"], note: "检查状态" },
  { en: "Pending", zh: ["待处理", "等待中", "待提交"], groups: [{ label: "等待（pending 状态）", words: ["等待"] }], note: "状态" },
  { en: "Enabled", zh: ["已启用", "启用"], note: "开关状态" },
  {
    en: "Disabled",
    zh: ["已禁用", "禁用", "已停用"],
    groups: [{ label: "不会用于（disabled for…）", words: ["不会用于"] }],
    note: "开关状态",
  },
  { en: "Inherit", zh: ["继承"], note: "继承默认设置" },
  {
    en: "Default",
    zh: ["默认"],
    groups: [
      { label: "常规（default mode）", words: ["常规"] },
      { label: "跟随系统（system default）", words: ["跟随系统"] },
    ],
    note: "默认值 / 默认模式",
  },
  { en: "Override", zh: ["覆盖"], groups: [{ label: "专用（override 作指定）", words: ["专用"] }], note: "覆盖默认" },
  { en: "Retry", zh: ["重试"], groups: [{ label: "重新（retry upload）", words: ["重新"] }], note: "动作" },
  { en: "Cancel", zh: ["取消"], note: "动作" },
  { en: "Save", zh: ["保存"], note: "动作" },
  { en: "Delete", zh: ["删除"], note: "动作" },
  { en: "Remove", zh: ["移除"], note: "动作" },
  { en: "Archive", zh: ["归档"], note: "动作" },
  { en: "Import", zh: ["导入"], note: "动作" },
  { en: "Connect", zh: ["连接"], note: "动作" },
  { en: "Disconnect", zh: ["断开"], note: "动作" },

  // —— 功能名词
  { en: "Skills", zh: ["技能"], note: "斜杠菜单里的技能" },
  { en: "Command palette", zh: ["命令面板"], note: "全局搜索面板" },
  { en: "Browser", zh: ["浏览器"], note: "预览浏览器" },
  { en: "Preview", zh: ["预览"], note: "预览面板" },
  { en: "Background Activity", zh: ["后台活动"], note: "后台任务面板" },
  { en: "Auto-merge", zh: ["自动合并"], note: "PR 自动合并" },
  { en: "Workflow", zh: ["工作流"], note: "自动化流程" },
  { en: "Organization", zh: ["组织"], note: "GitHub 组织" },
  { en: "Repository", zh: ["仓库"], note: "git 仓库" },
];

/** 生成词边界正则；多词术语按空格拆开，允许空白或连字符。 */
function bodyRegex(term) {
  return term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").split(/\s+/).join("[\\s-]+");
}

/** 命中（用于「命中条目」列）：与英文 key 上的 grep 词边界一致（不区分大小写）。 */
function termRegex(term) {
  return new RegExp(`(^|[^A-Za-z0-9])${bodyRegex(term)}($|[^A-Za-z0-9])`, "i");
}

/** 判定「译文里保留了英文词」时用更严的边界：把 . / - _ 也算作词内字符，
 *  这样路径、文件名、命令（如 components/settings/、keybindings.json、app-server）不算保留英文。 */
function preserveRegex(term) {
  return new RegExp(`(^|[^A-Za-z0-9/._-])${bodyRegex(term)}($|[^A-Za-z0-9/._-])`, "i");
}

/** 占位符片段：{name} 或 {0}。 */
const PLACEHOLDER = /\{[A-Za-z][A-Za-z0-9_]*\}|\{\d+\}/g;

/** 剔除占位符（连同其中的名称）——占位符是运行时插值，不算译文。 */
function stripPlaceholders(s) {
  return String(s).replace(PLACEHOLDER, "").trim();
}

/** 英文里该术语是否出现在占位符之外的正文中（含术语的匹配区间必须不落在任何占位符内）。 */
function occursOutsidePlaceholders(text, term) {
  const text2 = String(text);
  const spans = [];
  for (const m of text2.matchAll(PLACEHOLDER)) spans.push([m.index, m.index + m[0].length]);
  const re = new RegExp(bodyRegex(term), "gi");
  let m;
  while ((m = re.exec(text2))) {
    const a = m.index;
    const b = a + m[0].length;
    if (!spans.some(([s, t]) => a >= s && b <= t)) return true;
  }
  return false;
}

/** 术语自身在中文里按更严边界出现（用于判断是否"保留了英文"）。 */
function preservesTerm(zh, term) {
  return preserveRegex(term).test(zh);
}

export function renderGlossary({ messages, templates, compareCodePoints }) {
  const entries = [
    ...[...messages.entries()].map(([en, zh]) => ({ en, zh, slot: "messages" })),
    ...[...templates.entries()].map(([en, zh]) => ({ en, zh, slot: "templates" })),
  ];
  const totalEntries = entries.length;

  // 去重（同名术语只能出现一次）
  const seen = new Set();
  const terms = [];
  for (const t of TERMS) {
    if (seen.has(t.en)) continue;
    seen.add(t.en);
    terms.push(t);
  }

  const rows = [];
  for (const term of terms) {
    const re = termRegex(term.en);
    const hits = entries.filter((e) => re.test(e.en));
    if (hits.length === 0) continue;

    const groups = term.groups ?? [];
    // 全部可归属形式：variants 按词计，groups 按组计；一起参与最长匹配，避免重叠。
    const cands = [
      ...term.zh.map((w) => ({ w, kind: "variant", key: w })),
      ...groups.flatMap((g) => g.words.map((w) => ({ w, kind: "group", key: g.label }))),
    ];

    const variantCounts = new Map(term.zh.map((c) => [c, 0]));
    const groupCounts = new Map(groups.map((g) => [g.label, 0]));
    let preserved = 0;
    let placeholderOnly = 0;
    let other = 0;
    const otherExamples = [];

    for (const e of hits) {
      // 英文里只在占位符内出现 → 不是 UI 正文，不计入翻译统计
      if (!occursOutsidePlaceholders(e.en, term.en)) {
        placeholderOnly++;
        continue;
      }
      const zhProse = stripPlaceholders(e.zh); // 剔掉中文里的运行时插值
      if (preservesTerm(zhProse, term.en)) {
        preserved++;
        continue;
      }
      const present = cands.filter((c) => zhProse.includes(c.w)).sort((a, b) => b.w.length - a.w.length);
      if (!present.length) {
        other++;
        if (otherExamples.length < 4) otherExamples.push({ rawEn: e.en, rawZh: e.zh });
        continue;
      }
      const best = present[0];
      if (best.kind === "variant") variantCounts.set(best.key, variantCounts.get(best.key) + 1);
      else groupCounts.set(best.key, groupCounts.get(best.key) + 1);
    }

    const variants = [...variantCounts.entries()]
      .filter(([, n]) => n > 0)
      .map(([zh, n]) => ({ zh, n }))
      .sort((a, b) => b.n - a.n || compareCodePoints(a.zh, b.zh));
    const groupStats = [...groupCounts.entries()]
      .filter(([, n]) => n > 0)
      .map(([label, n]) => ({ label, n }))
      .sort((a, b) => b.n - a.n || compareCodePoints(a.label, b.label));

    rows.push({ term, hits: hits.length, variants, groupStats, preserved, placeholderOnly, other, otherExamples });
  }

  rows.sort((a, b) => b.hits - a.hits || compareCodePoints(a.term.en, b.term.en));

  // —— 渲染
  const L = [];
  L.push("# 术语表");
  L.push("");
  L.push(`统计自 \`dict/zh-CN.json\` 主词库的 ${totalEntries} 条条目（messages + templates），共 ${rows.length} 个术语。`);
  L.push("");
  L.push("口径：");
  L.push("");
  L.push("- **命中条目**：英文原文里按词边界出现该术语的条目数（不区分大小写，多词术语允许空白/连字符），与 key 上的 grep 一致。");
  L.push("- **现有译法**：先剔除中英两侧的占位符（`{name}` / `{0}` 是运行时插值，不算译文），再按**最长匹配**归属——");
  L.push("  一条译文命中多个形式时算给最长的那个，所以“服务提供方”不会重复记进“提供方”。同一英文词的另一语义");
  L.push("  单列为“另一语义”分组并注明（如 Review 的“评审”与“检查”），避免把不同意思混成一列。");
  L.push("- **保留英文**：剔除占位符后，中文译文里仍出现该英文词的条目数。");
  L.push("- **占位符内**：英文里该术语只出现在占位符内部（如 `… for {provider}`），不是 UI 正文，不计入翻译统计。");
  L.push("- **其他**：既没命中任何形式、也没保留英文的条目数，下面单列实例。");
  L.push("- 恒等：命中条目 = 现有译法（含分组）之和 + 保留英文 + 占位符内 + 其他。");
  L.push("- **建议**只针对术语本身的译法，不改词库，定稿由 T05 决定。");
  L.push("");
  L.push("## 术语与现有译法");
  L.push("");
  L.push("| 术语 | 命中条目 | 现有译法（条目数） | 保留英文 | 占位符内 | 其他 | 建议 |");
  L.push("|---|---:|---|---:|---:|---:|---|");
  for (const r of rows) {
    const parts = [
      ...r.variants.map((v) => `${v.zh}（${v.n}）`),
      ...r.groupStats.map((g) => `*${g.label}*（${g.n}）`),
    ];
    const vars = parts.length ? parts.join("、") : r.preserved > 0 ? "（全部保留英文）" : "（无匹配）";
    const allCounted = [...r.variants.map((v) => v.n), ...r.groupStats.map((g) => g.n)];
    let advice;
    if (r.variants.length) advice = r.variants.length === 1 && r.other === 0 && r.preserved === 0 ? `统一用「${r.variants[0].zh}」` : `建议统一用「${r.variants[0].zh}」`;
    else if (r.groupStats.length) advice = `主要译法「${r.groupStats[0].label}」；另一语义，需按上下文`;
    else if (r.preserved > 0) advice = `保留英文「${r.term.en}」`;
    else advice = "待定";
    if (allCounted.length && r.variants.length && r.groupStats.length) advice += "（另有语义分组）";
    L.push(`| ${r.term.en} | ${r.hits} | ${vars} | ${r.preserved} | ${r.placeholderOnly} | ${r.other} | ${advice} |`);
  }
  L.push("");

  // —— 其他（未归类）实例
  const withOther = rows.filter((r) => r.other > 0);
  L.push("## 其他（未归类的实例）");
  L.push("");
  L.push("这些条目的译文既没命中登记的形式，也没保留英文——多为术语用在了另一语义、或原译文省略了该词。");
  L.push("列出代表性实例供 T05 定夺（显示原文，便于定位；占位符在实际统计中已剔除）。");
  L.push("");
  if (withOther.length === 0) {
    L.push("（无）");
  } else {
    L.push("| 术语 | 其他条数 | 实例（英文 → 中文） |");
    L.push("|---|---:|---|");
    for (const r of withOther) {
      const ex = r.otherExamples
        .map((p) => `${String(p.rawEn).replace(/\|/g, "\\|")} → ${String(p.rawZh).replace(/\|/g, "\\|")}`)
        .join("；");
      L.push(`| ${r.term.en} | ${r.other} | ${ex} |`);
    }
  }
  L.push("");

  // —— 保留英文的词：依据现有词库的实际用法
  L.push("## 保留英文的词");
  L.push("");
  L.push("依据是现有词库的实际用法：剔除占位符后，中文译文里仍然保留该英文词。");
  L.push("");
  const preservedRows = rows
    .filter((r) => r.preserved > 0)
    .sort((a, b) => b.preserved - a.preserved || compareCodePoints(a.term.en, b.term.en));
  if (preservedRows.length === 0) {
    L.push("（无）");
  } else {
    L.push("| 词 | 命中条目 | 中文里保留英文的条目数 | 例 |");
    L.push("|---|---:|---:|---|");
    for (const r of preservedRows) {
      const re = termRegex(r.term.en);
      const example = entries.find((e) => re.test(e.en) && preservesTerm(stripPlaceholders(e.zh), r.term.en));
      const shown = example
        ? `${String(example.en).replace(/\|/g, "\\|")} → ${String(example.zh).replace(/\|/g, "\\|")}`
        : "—";
      L.push(`| ${r.term.en} | ${r.hits} | ${r.preserved} | ${shown} |`);
    }
  }
  L.push("");
  L.push("## 说明");
  L.push("");
  L.push("- 登记的形式来自对现有词库的实际观察，不是穷举；T05 补译时如出现新译法，需回填本表。");
  L.push("- 产品名、模型名、命令、代码标识不翻译（见 CONVENTIONS §3）。");
  L.push("");
  return L.join("\n");
}
