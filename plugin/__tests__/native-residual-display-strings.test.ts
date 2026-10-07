/** T14：真实基线及全序补丁显示表达式，语言一致性和动态值隔离。 */
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { stripTypeScriptTypes } from 'node:module';
import { pathToFileURL } from 'node:url';
import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
import generatorModule from '@babel/generator';
import * as t from '@babel/types';
import { createTranslator, installT3zhRuntime } from '../../runtime/t3zh-runtime.ts';
import { collectValueUse, createScanContext, listScopeFiles, scanModule } from '../matcher.ts';
import { transformCode } from '../vite-plugin-t3zh.ts';
const traverse = (traverseModule as any).default ?? traverseModule;
const generate = (generatorModule as any).default ?? generatorModule;
const ROOT = path.resolve(import.meta.dirname, '../..');
const UP = path.resolve(process.env.T3ZH_UPSTREAM ?? path.join(ROOT, 'upstream'));
const PATCH = '0017-native-residual-display-strings.patch';
const base = 'apps/web/src/';
const paths = JSON.parse(JSON.stringify([...new Set(fs.readdirSync(path.join(ROOT, 'patches')).filter(x => x.endsWith('.patch')).flatMap(p => [...fs.readFileSync(path.join(ROOT, 'patches', p), 'utf8').matchAll(/^diff --git a\/(.+) b\//gm)].map(m => m[1])))])) as string[];
function tree(withPatch: boolean) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 't3zh-T14-test-'));
  for (const f of paths) if (fs.existsSync(path.join(UP, f))) {
    fs.mkdirSync(path.dirname(path.join(dir, f)), {
      recursive: true
    });
    fs.copyFileSync(path.join(UP, f), path.join(dir, f));
  }
  for (const p of fs.readdirSync(path.join(ROOT, 'patches')).filter(x => x.endsWith('.patch')).sort()) if (withPatch || p !== PATCH) execFileSync('git', ['apply', path.join(ROOT, 'patches', p)], {
    cwd: dir
  });
  return dir;
}
const BEFORE = tree(false),
  AFTER = tree(true);
after(() => {
  for (const d of [BEFORE, AFTER]) fs.rmSync(d, {
    recursive: true,
    force: true
  });
});
const read = (dir: string, f: string) => fs.readFileSync(path.join(dir, f), 'utf8');
const ast = (code: string) => parse(code, {
  sourceType: 'module',
  plugins: ['typescript', 'jsx']
});
const code = (n: any) => generate(n).code;
const evalExpr = (source: string, scope: Record<string, any>) => new Function(...Object.keys(scope), `return ${stripTypeScriptTypes("(" + source + ")")};`)(...Object.values(scope));
function select(source: string, visitor: string, predicate: (p: any) => boolean) {
  const nodes: any[] = [];
  traverse(ast(source), {
    [visitor](p: any) {
      if (predicate(p)) nodes.push(p.node);
    }
  });
  assert.equal(nodes.length, 1, `${visitor}: ${nodes.length}`);
  return nodes[0];
}
function fn(source: string, name: string, scope: Record<string, any> = {}) {
  const n = select(source, 'FunctionDeclaration', p => p.node.id?.name === name);
  return evalExpr(code(n), scope);
}
function initializer(source: string, name: string) {
  return code(select(source, 'VariableDeclarator', p => p.node.id.name === name).init);
}
function children(source: string, predicate: (children: any[]) => boolean) {
  return t.react.buildChildren(select(source, 'JSXElement', p => predicate(t.react.buildChildren(p.node))));
}
function render(nodes: any[], scope: Record<string, any>) {
  return nodes.map(n => {
    const x = evalExpr(code(n), scope);
    return x == null || typeof x === 'boolean' ? '' : String(x);
  }).join('');
}
function attribute(source: string, component: string, attr: string, predicate: (n: any) => boolean = () => true) {
  return select(source, 'JSXAttribute', p => p.node.name.name === attr && p.parent.name.name === component && predicate(p.node)).value.expression;
}
const helperFile = path.join(AFTER, base + 'acceptanceDisplayStrings.ts');
fs.writeFileSync(helperFile, fs.readFileSync(helperFile, 'utf8').replace('from "./newThreadDisplayStrings"', 'from "./newThreadDisplayStrings.ts"'));
const h = await import(pathToFileURL(helperFile).href);
const slots = await import(pathToFileURL(path.join(AFTER, base + 'newThreadDisplayStrings.ts')).href);
const dict = JSON.parse(fs.readFileSync(path.join(ROOT, 'dict/zh-CN.json'), 'utf8'));
const ctx = createScanContext({
  root: UP
});
const transformed = new Map<string, string>();
function sources(file: string) {
  if (!transformed.has(file)) {
    const s = read(AFTER, file);
    transformed.set(file, transformCode(s, path.join(UP, file), ctx).output?.code ?? s);
  }
  return [read(AFTER, file), transformed.get(file)!];
}
const SLOT = '\uE000',
  risky = 'feature/foo to main';
function runtime(locale: 'en' | 'zh-CN' | null) {
  const prev = globalThis.__t3zh,
    calls: string[] = [];
  const api = installT3zhRuntime(dict, {
    localStorage: {
      getItem: () => locale,
      setItem() {}
    },
    navigator: null,
    systemLanguages: null,
    document: null,
    location: null,
    target: null
  }).api;
  globalThis.__t3zh = locale === null ? undefined : {
    ...api,
    t(x: string) {
      calls.push(x);
      return api.t(x);
    }
  };
  return {
    calls,
    scope: {
      ...h,
      ...slots,
      __t3zh_t: (x: any) => locale === null ? x : globalThis.__t3zh!.t(x)
    },
    restore() {
      globalThis.__t3zh = prev;
    }
  };
}
const model = read(UP, 'packages/shared/src/model.ts');
const getRawSelectionValueById = fn(model, 'getRawSelectionValueById');
const getReportedOptionValue = fn(model, 'getReportedOptionValue', {
  getRawSelectionValueById
});
const getProviderOptionCurrentValue = fn(model, 'getProviderOptionCurrentValue', {
  getReportedOptionValue
});
const getProviderOptionCurrentLabel = fn(model, 'getProviderOptionCurrentLabel', {
  getProviderOptionCurrentValue,
  getReportedOptionValue
});
const providerScope = {
  getProviderOptionCurrentValue,
  getProviderOptionCurrentLabel
};
const traits = base + 'components/chat/TraitsPicker.tsx';
const descriptor = (label: string, id = 'effort') => ({
  id,
  label: 'Reasoning',
  type: 'select',
  currentValue: 'choice',
  options: [{
    id: 'choice',
    label
  }]
});
for (const locale of [null, 'en', 'zh-CN'] as const) {
  test(`推理按钮和菜单：${locale ?? '无运行时'}，所有档位、组合、未知标签及原始数据`, () => {
    const original = fn(read(BEFORE, traits), 'buildTraitsTriggerDisplay', providerScope);
    const fixed = ['Extra High', 'High', 'Medium', 'Low', 'Max', 'Ultra', 'Fast', 'Standard', 'Ultrafast', 'Normal', 'Minimal', 'None', 'Default', 'Custom'];
    const shownLabel = (label: string) => dict.messages[label === 'Max' || label === 'Ultra' ? `Reasoning tier: ${label}` : label];
    const calledLabel = (label: string) => label === 'Max' || label === 'Ultra' ? `Reasoning tier: ${label}` : label;
    for (const s of sources(traits)) {
      const build = fn(s, 'buildTraitsTriggerDisplay', providerScope);
      const init = code(select(s, 'VariableDeclarator', p => p.node.init?.callee?.name === 'buildTraitsTriggerDisplay').init);
      for (const label of [...fixed, '1M', '200k', '272k', risky, 'No project', 'Ultrathink', 'Ultracode', 'Medium · ' + risky]) {
        const descriptors = [descriptor(label), descriptor('1M', 'contextWindow')];
        const payload = JSON.stringify(descriptors);
        const scope = {
          provider: 'claudeAgent',
          descriptors,
          primarySelectDescriptor: descriptors[0],
          ultrathinkPromptControlled: false,
          instanceId: undefined,
          model: undefined,
          modelOptions: undefined,
          reportedModelSelection: undefined
        };
        const originalLabel = original({
          provider: scope.provider,
          descriptors,
          primarySelectDescriptorId: 'effort',
          ultrathinkPromptControlled: false
        }).label;
        const r = runtime(locale);
        try {
          const shown = evalExpr(init, {
            ...scope,
            ...r.scope,
            buildTraitsTriggerDisplay: build
          }).label;
          assert.equal(shown, locale === 'zh-CN' && fixed.includes(label) ? shownLabel(label) + ' · 1M' : originalLabel);
          assert.deepEqual(r.calls, locale === null || !fixed.includes(label) ? [] : [calledLabel(label)]);
          assert.equal(JSON.stringify(descriptors), payload);
          assert.equal(build({
            provider: scope.provider,
            descriptors,
            primarySelectDescriptorId: 'effort',
            ultrathinkPromptControlled: false
          }).label, originalLabel, '默认调用保持上游结果');
        } finally {
          r.restore();
        }
      }
      const menuExpr = select(s, 'CallExpression', p => p.node.callee.name === 'displayTraitLabel' && code(p.node.arguments[0]) === 'option.label');
      for (const label of [...fixed, risky, '1M', '200k']) {
        const r = runtime(locale);
        try {
          assert.equal(evalExpr(code(menuExpr), {
            ...r.scope,
            option: {
              label
            }
          }), locale === 'zh-CN' && fixed.includes(label) ? shownLabel(label) : label);
          assert.deepEqual(r.calls, locale === null || !fixed.includes(label) ? [] : [calledLabel(label)]);
        } finally {
          r.restore();
        }
      }
      for (const speed of [false, true]) {
        const descriptors = [descriptor('Medium'), descriptor('1M', 'contextWindow'), {
          id: 'fastMode',
          type: 'boolean',
          currentValue: speed,
          label: 'Fast mode'
        }];
        const r = runtime(locale);
        try {
          const input = {
            provider: 'claudeAgent',
            descriptors,
            primarySelectDescriptorId: 'effort',
            ultrathinkPromptControlled: false
          };
          assert.equal(build({
            ...input,
            displayLabel: h.displayTraitLabel
          }).label, locale === 'zh-CN' ? `中${speed ? ' 快速' : ''} · 1M` : original(input).label);
          assert.deepEqual(r.calls, locale === null ? [] : speed ? ['Medium', 'Fast'] : ['Medium']);
        } finally {
          r.restore();
        }
      }
      for (const enabled of [false, true]) {
        const r = runtime(locale);
        try {
          const input = {
            provider: 'claudeAgent',
            descriptors: [{
              id: 'thinking',
              type: 'boolean',
              currentValue: enabled,
              label: 'Thinking'
            }],
            primarySelectDescriptorId: null,
            ultrathinkPromptControlled: false
          };
          assert.equal(build({
            ...input,
            displayLabel: h.displayTraitLabel
          }).label, locale === 'zh-CN' ? dict.messages[enabled ? 'Thinking On' : 'Thinking Off'] : original(input).label);
        } finally {
          r.restore();
        }
      }
    }
  });
}
for (const locale of [null, 'en', 'zh-CN'] as const) {
  test(`分页、Agent 失败和连接计数：${locale ?? '无运行时'}，真实 JSX / summary 求值`, () => {
    const cases = [{
      file: base + 'components/Sidebar.tsx',
      count: 'hiddenSettledCount',
      constant: 'SETTLED_TAIL_PAGE_COUNT',
      suffix: ' more',
      prefix: 'Show ',
      zh: (v: string) => `再显示 ${v} 项`
    }, {
      file: base + 'components/chat/ThreadRelationshipsControl.tsx',
      count: 'props.hiddenCount',
      constant: 'THREAD_LINEAGE_PAGE_COUNT',
      suffix: ' more',
      prefix: 'Show ',
      zh: (v: string) => `再显示 ${v} 项`
    }, {
      file: base + 'components/chat/ThreadRelationshipsControl.tsx',
      count: 'failedCount',
      constant: null,
      suffix: ' failed',
      prefix: '',
      zh: (v: string) => `${v} 项失败`
    }];
    for (const c of cases) for (const value of [1, 3, 25, 80]) {
      const scope = {
        hiddenSettledCount: value,
        props: {
          hiddenCount: value
        },
        failedCount: value,
        SETTLED_TAIL_PAGE_COUNT: 25,
        THREAD_LINEAGE_PAGE_COUNT: 25
      };
      const old = children(read(BEFORE, c.file), nodes => nodes.some(n => t.isStringLiteral(n) && n.value === c.suffix) && nodes.some(n => code(n).includes(c.count)));
      // Button siblings are actual icons; evaluate the unchanged count/text children only.
      const oldText = old.filter(n => !t.isJSXElement(n));
      const english = render(oldText, scope);
      for (const s of sources(c.file)) {
        const calls: any[] = [];
        traverse(ast(s), {
          CallExpression(p: any) {
            if (p.node.callee.name === 'fillSlot' && p.node.arguments[0]?.value === c.prefix && code(p.node).includes(c.count)) calls.push(p.node);
          }
        });
        assert.equal(calls.length, 1);
        const r = runtime(locale);
        try {
          assert.equal(evalExpr(code(calls[0]), {
            ...scope,
            ...r.scope
          }), locale === 'zh-CN' ? c.zh(String(c.constant ? Math.min(value, 25) : value)) : english);
          assert.deepEqual(r.calls, locale === null ? [] : [c.prefix + SLOT + c.suffix]);
        } finally {
          r.restore();
        }
      }
    }
    const file = base + 'components/settings/ConnectionsSettings.tsx';
    for (const s of sources(file)) for (const sessions of [[], [{}], [{}, {}, {}]]) for (const links of [[], [{}], [{}, {}]]) {
      const old = fn(read(BEFORE, file), 'summarizeAuthorizedClients')(sessions, links);
      const r = runtime(locale);
      try {
        assert.equal(fn(s, 'summarizeAuthorizedClients', r.scope)(sessions, links), locale === 'zh-CN' ? `${sessions.length} 个客户端${links.length ? ` · ${links.length} 个配对链接` : ''}` : old);
        assert.deepEqual(r.calls, locale === null ? [] : [SLOT + (sessions.length === 1 ? ' client' : ' clients'), ...(links.length ? [SLOT + (links.length === 1 ? ' pairing link' : ' pairing links')] : [])]);
      } finally {
        r.restore();
      }
    }
  });
  test(`Clerk 读屏名称：${locale ?? '无运行时'}，两种 shell 官方 localization 属性`, () => {
    for (const file of ['BrowserManagedAuthShell', 'ElectronManagedAuthShell']) for (const s of sources(base + `components/clerk/${file}.tsx`)) {
      const n = select(s, 'JSXSpreadAttribute', p => code(p.node.argument).includes('getResolvedLocale')).argument;
      const r = runtime(locale);
      try {
        assert.deepEqual(evalExpr(code(n), r.scope), locale === 'zh-CN' ? {
          localization: { userButton: {
            action__openUserMenu: '打开用户菜单', action__closeUserMenu: '关闭用户菜单'
          } }
        } : {});
        assert.deepEqual(r.calls, locale === 'zh-CN' ? ['Open user menu', 'Close user menu'] : []);
      } finally {
        r.restore();
      }
    }
  });
  test(`快捷键、分支 / 合并选值与设备说明：${locale ?? '无运行时'}，最终显示表达式`, () => {
    const keylogic = read(UP, base + 'components/settings/KeybindingsSettings.logic.ts');
    const titleCaseCommandSegment = fn(keylogic, 'titleCaseCommandSegment');
    const commandLabel = fn(keylogic, 'commandLabel', {
      titleCaseCommandSegment,
      METRIC_OPTIONS: [],
      WINDOW_OPTIONS: []
    });
    for (const s of sources(base + 'components/settings/KeybindingsSettings.tsx')) {
      const n = select(s, 'CallExpression', p => p.node.callee.name === 'displayKnown' && code(p.node.arguments[0]) === 'commandLabel(row.command)' && p.parent.type === 'JSXExpressionContainer' && p.parentPath.parentPath.isJSXElement());
      for (const command of ['rightPanel.new', 'script.feature/foo to main.run']) {
        const r = runtime(locale);
        try {
          const old = commandLabel(command);
          assert.equal(evalExpr(code(n), {
            ...r.scope,
            commandLabel,
            row: {
              command
            }
          }), locale === 'zh-CN' && command === 'rightPanel.new' ? '右侧面板：新建' : old);
          assert.deepEqual(r.calls, locale === null || command !== 'rightPanel.new' ? [] : [old]);
        } finally {
          r.restore();
        }
      }
    }
    const branch = base + 'components/settings/BranchNamingSettings.tsx';
    const modes = evalExpr(initializer(read(UP, branch), 'MODES'), {});
    for (const s of sources(branch)) {
      const callback = select(s, 'ArrowFunctionExpression', p => code(p.node).includes('MODES[value]'));
      const option = select(s, 'CallExpression', p => p.node.callee.name === 'translateFixed' && code(p.node.arguments[0]) === 'MODES[mode]');
      for (const value of [null, 'static', 'semantic', 'custom']) {
        const r = runtime(locale);
        try {
          const old = value === null ? 'Mixed' : modes[value];
          assert.equal(evalExpr(code(callback), {
            ...r.scope,
            MODES: modes
          })(value), locale === 'zh-CN' ? dict.messages[old] : old);
          assert.deepEqual(r.calls, locale === null ? [] : [old]);
          if (value !== null) assert.equal(evalExpr(code(option), {
            ...r.scope,
            MODES: modes,
            mode: value
          }), locale === 'zh-CN' ? dict.messages[old] : old);
        } finally {
          r.restore();
        }
      }
    }
    const project = base + 'components/settings/ProjectDefaultsSettings.tsx';
    const labelSource = read(UP, base + 'components/pullRequest/pullRequestDetail.logic.ts');
    const labels = evalExpr(initializer(labelSource, 'PULL_REQUEST_MERGE_METHOD_LABELS'), {});
    const compiledLabels = transformCode(labelSource, path.join(UP, base + 'components/pullRequest/pullRequestDetail.logic.ts'), ctx).output!.code;
    for (const s of sources(project)) {
      const callback = select(s, 'ArrowFunctionExpression', p => code(p.node).includes('Last selected') && code(p.node).includes('PULL_REQUEST_MERGE_METHOD_LABELS[value]'));
      for (const value of [null, 'last', 'merge', 'squash', 'rebase']) {
        const r = runtime(locale);
        try {
          const old = value === 'last' ? 'Last selected' : value === null ? 'Mixed' : labels[value];
          const runtimeLabels = evalExpr(initializer(compiledLabels, 'PULL_REQUEST_MERGE_METHOD_LABELS'), r.scope);
          r.calls.length = 0;
          assert.equal(evalExpr(code(callback), {
            ...r.scope,
            PULL_REQUEST_MERGE_METHOD_LABELS: runtimeLabels
          })(value), locale === 'zh-CN' ? dict.messages[old] : old);
          assert.deepEqual(r.calls, locale === null || (value !== null && value !== 'last') ? [] : [old]);
        } finally {
          r.restore();
        }
      }
    }
    const device = base + 'components/device/DeviceSetup.tsx';
    for (const file of [device, base + 'components/settings/IntegrationsSettings.tsx']) for (const s of sources(file)) for (const name of ['deviceHubDescription', 'agentDeviceDescription']) {
      const text = evalExpr(initializer(read(UP, device), name), {});
      assert.equal(evalExpr(initializer(read(AFTER, device), name), {}), text, '原始常量不改');
      const n = select(s, 'CallExpression', p => p.node.callee.name === 'translateFixed' && code(p.node.arguments[0]) === name);
      const r = runtime(locale);
      try {
        assert.equal(evalExpr(code(n), {
          ...r.scope,
          [name]: text
        }), locale === 'zh-CN' ? dict.messages[text] : text);
        assert.deepEqual(r.calls, locale === null ? [] : [text]);
      } finally {
        r.restore();
      }
    }
  });
  test(`截图与发送按钮状态：${locale ?? '无运行时'}，任意后端说明保持原样`, () => {
    const logic = read(UP, base + 'components/settings/SnapShotSettings.logic.ts');
    const snapShotSetupSummary = fn(logic, 'snapShotSetupSummary', {
      captureSetupBackend: (x: any) => x.linuxBackend
    });
    const snapShotStatus = fn(logic, 'snapShotStatus', {
      snapShotSetupSummary
    });
    const states = [null, {
      mode: 'unavailable',
      message: risky
    }, {
      mode: 'unavailable'
    }, {
      mode: 'mac',
      message: risky
    }, {
      mode: 'mac'
    }, ...['hyprland', 'gnome', 'kde', 'picker', 'niri'].map(linuxBackend => ({
      mode: 'portal',
      linuxBackend
    })), {
      mode: 'mac',
      shortcutPending: true
    }, {
      mode: 'portal',
      linuxBackend: 'hyprland',
      hyprlandHelper: {
        status: 'ready'
      },
      shortcutPending: true
    }, {
      mode: 'mac',
      shortcutVerified: true
    }, {
      mode: 'mac',
      shortcutRegistered: true
    }, {
      mode: 'mac',
      shortcutRegistered: true,
      shortcutLabel: 'Ctrl+x'
    }, {
      mode: 'portal',
      linuxBackend: 'niri',
      shortcutBinding: 'x'
    }, {
      mode: 'portal',
      linuxBackend: 'hyprland',
      hyprlandHelper: {
        status: 'error'
      }
    }, {
      mode: 'portal',
      linuxBackend: 'kde',
      kdeHelper: {
        status: 'error'
      }
    }, {
      mode: 'portal',
      linuxBackend: 'hyprland',
      hyprlandHelper: {
        status: 'ready'
      },
      shortcutActionRegistered: true
    }];
    for (const s of sources(base + 'components/settings/SnapShotSettings.tsx')) {
      const n = select(s, 'CallExpression', p => p.node.callee.name === 'displayKnown' && p.node.arguments[0]?.callee?.name === 'snapShotStatus');
      for (const state of states) for (const enabled of [false, true]) {
        const old = snapShotStatus(state, enabled);
        const r = runtime(locale);
        try {
          const shown = evalExpr(code(n), {
            ...r.scope,
            snapShotStatus,
            state,
            settings: {
              snapShotEnabled: enabled
            }
          });
          assert.equal(shown, locale === 'zh-CN' && old !== risky ? dict.messages[old] : old);
          assert.deepEqual(r.calls, locale === null || old === risky ? [] : [old]);
        } finally {
          r.restore();
        }
      }
    }
    const composer = base + 'components/chat/ComposerPrimaryActions.tsx';
    const chat = base + 'components/ChatView.tsx';
    const reason = attribute(read(UP, chat), 'ChatComposer', 'sendDisabledReason');
    const originalReason = evalExpr(code(reason), {
      canOperateThread: true,
      isEnvironmentChanging: false,
      isRevertingCheckpoint: false,
      feedbackUploading: false,
      threadDetailLoading: true,
      worktreeSetupBlocksSend: false,
      projectCloneSendBlockReason: 'Cloning repository'
    });
    assert.equal(originalReason, 'Messages loading');
    for (const s of sources(composer)) {
      const aria = select(s, 'JSXAttribute', p => p.node.name.name === 'aria-label' && code(p.node).includes('submitStatus')).value.expression;
      const tooltip = select(s, 'CallExpression', p => p.node.callee.name === 'displayRunningSendTooltip' && code(p.node).includes('submitTooltip'));
      for (const status of [originalReason, 'Preparing machine', 'Rewinding conversation', 'Sending feedback', 'Preparing worktree', 'Submitting message', 'Updating queued message', 'Connecting', 'Environment disconnected', 'Cloning repository', 'Repository not cloned', risky, null]) {
        const scope = {
          isEnvironmentUnavailable: false,
          sendDisabledReason: status,
          isConnecting: false,
          isPreparingWorktree: false,
          isSendBusy: false,
          isEditingQueuedMessage: false
        };
        const r = runtime(locale);
        try {
          const actual = evalExpr(initializer(s, 'submitStatus'), {
            ...scope,
            ...r.scope
          });
          assert.equal(actual, status, '状态数据保持英文');
          const shown = evalExpr(code(aria), {
            ...r.scope,
            displayConnectionPermissionError: (x: any) => x,
            submitStatus: actual,
            submitLabel: 'Submit message'
          });
          assert.equal(shown, locale === 'zh-CN' && status !== risky ? dict.messages[status ?? 'Submit message'] : status ?? 'Submit message');
          assert.deepEqual(r.calls, locale === null || status === risky ? [] : [status ?? 'Submit message']);
          if (status !== null) {
            r.calls.length = 0;
            assert.equal(evalExpr(code(tooltip), {
              ...r.scope,
              displayConnectionPermissionError: (x: any) => x,
              submitTooltip: status, followUpBehavior: 'steer', alternateAction: 'queue', alternateShortcutLabel: null
            }), locale === 'zh-CN' && status !== risky ? dict.messages[status] : status);
            assert.deepEqual(r.calls, locale === null || status === risky ? [] : [status]);
          }
        } finally {
          r.restore();
        }
      }
    }
  });
}
test('T14 新模板只匹配自己的计数骨架，不截走真实源码其他候选', () => {
  const tr = createTranslator(dict),
    templates = ['{0} client', '{0} clients', '{0} pairing link', '{0} pairing links', 'Click to steer, Ctrl/⌘-click or {0} to queue', 'Click to queue, Ctrl/⌘-click or {0} to steer', 'Show {0} older comment ({1} hidden)'];
  for (const k of templates) assert.equal(tr.matchTemplate(k.replace('{0}', SLOT).replace('{1}', '\uE001'))?.key, k);
  const hits: string[] = [];
  let total = 0;
  for (const f of listScopeFiles(UP)) for (const c of scanModule(fs.readFileSync(f, 'utf8'), f, ctx).candidates) {
    if (c.decision !== 'translate') continue;
    total++;
    if (tr.lookupMessage(c.text) === undefined && templates.includes(tr.matchTemplate(c.text)?.key ?? '')) hits.push(`${f}:${c.line} ${c.text}`);
  }
  assert.ok(total > 5000);
  assert.deepEqual(hits, []);
});
test('所有新增名单有精确词条；未知服务端 label / 项目名 / 路径原样且不查表', () => {
  const r = runtime('zh-CN');
  try {
    for (const x of [...h.ACCEPTANCE_DISPLAY_LABELS, ...h.TRAIT_DISPLAY_LABELS, ...h.TRAIT_CONTEXT_LABELS, ...h.TRAIT_CONTEXT_KEYS]) assert.ok(dict.messages[x], x);
    for (const x of [risky, '/tmp/foo to main', 'GPT-6.1', 'My provider', 'Low · ' + risky, '200k', '1M']) assert.equal(h.displayKnown(x), x);
    assert.deepEqual(r.calls, []);
  } finally {
    r.restore();
  }
});

for (const locale of [null, 'en', 'zh-CN'] as const) {
  test(`T14-fix1 I1：真实 manifest / Codex 分组及说明，${locale ?? '无运行时'}`, () => {
    const manifest = JSON.parse(read(UP, 'apps/server/src/provider/model-manifest.json'));
    const labels = new Set<string>();
    function collect(x: any) {
      if (!x || typeof x !== 'object') return;
      if (typeof x.id === 'string' && ['reasoning', 'effort', 'fastMode', 'contextWindow'].includes(x.id) && typeof x.label === 'string') labels.add(x.label);
      for (const value of Object.values(x)) collect(value);
    }
    collect(manifest);
    assert.ok(labels.has('Fast Mode') && labels.has('Context Window'));
    const codex = read(UP, 'apps/server/src/provider/CodexProvider.ts');
    const descriptions = select(codex, 'ObjectProperty', p => p.node.key.name === 'ultrafast' && p.node.value.value === 'Even faster, more expensive').value.value;
    for (const s of sources(traits)) {
      const headings: any[] = [];
      traverse(ast(s), { CallExpression(p: any) { if (p.node.callee.name === 'displayTraitLabel' && code(p.node.arguments[0]) === 'descriptor.label') headings.push(p.node); } });
      assert.equal(headings.length, 3);
      for (const n of headings) for (const label of [...labels, 'Mode', 'Speed', 'Effort', 'Reasoning effort', risky]) {
        const r = runtime(locale);
        try {
          assert.equal(evalExpr(code(n), { ...r.scope, descriptor: { label } }), locale === 'zh-CN' && label !== risky ? dict.messages[label] : label);
          assert.deepEqual(r.calls, locale === null || label === risky ? [] : [label]);
        } finally { r.restore(); }
      }
      const description = select(s, 'CallExpression', p => p.node.callee.name === 'displayKnown' && code(p.node.arguments[0]) === 'option.description');
      const r = runtime(locale);
      try {
        assert.equal(evalExpr(code(description), { ...r.scope, option: { description: descriptions } }), locale === 'zh-CN' ? '更快，费用更高' : descriptions);
        assert.deepEqual(r.calls, locale === null ? [] : [descriptions]);
      } finally { r.restore(); }
    }
  });
  test(`T14-fix1 I2：4 种运行中提示、克隆状态及动态快捷键，${locale ?? '无运行时'}`, () => {
    const file = base + 'components/chat/ComposerPrimaryActions.tsx';
    const source = read(BEFORE, file);
    const originalInit = initializer(source, 'submitTooltip');
    for (const s of sources(file)) {
      assert.equal(initializer(s, 'submitTooltip'), originalInit, '原始 tooltip 数据表达式不改');
      const display = select(s, 'CallExpression', p => p.node.callee.name === 'displayRunningSendTooltip');
      for (const followUpBehavior of ['steer', 'queue', risky]) for (const alternateShortcutLabel of ['', risky, '⌘↵']) {
        const alternateAction = followUpBehavior === 'steer' ? 'queue' : 'steer';
        const scope = { submitStatus: null, isRunning: true, isEditingQueuedMessage: false, followUpBehavior, alternateAction, alternateShortcutLabel, submitLabel: 'Submit message' };
        const tooltip = evalExpr(originalInit, scope);
        const r = runtime(locale);
        try {
          const actual = evalExpr(code(display), { ...r.scope, ...scope, submitTooltip: tooltip, displayConnectionPermissionError: (x: any) => x });
          const skeleton = `Click to ${followUpBehavior}, Ctrl/⌘-click${alternateShortcutLabel ? ` or ${SLOT}` : ''} to ${alternateAction}`;
          assert.equal(actual, locale === 'zh-CN' && followUpBehavior !== risky ? createTranslator(dict)(skeleton).replace(SLOT, alternateShortcutLabel) : tooltip);
          assert.deepEqual(r.calls, locale === null || followUpBehavior === risky ? [] : [skeleton]);
        } finally { r.restore(); }
      }
      const reason = initializer(read(UP, base + 'components/ChatView.tsx'), 'projectCloneSendBlockReason');
      for (const cloneStatus of ['running', 'failed', 'pending', 'done', null]) {
        // Evaluate the real clone expression, including its null/non-clone branches.
        const scope = { activeProjectClone: cloneStatus === null ? null : { phase: cloneStatus } };
        const r = runtime(locale);
        try {
          const raw = evalExpr(reason, scope);
          assert.equal(raw, cloneStatus === 'running' ? 'Cloning repository' : cloneStatus === 'done' || cloneStatus === null ? null : 'Repository not cloned');
          if (raw) {
            const aria = select(s, 'JSXAttribute', p => p.node.name.name === 'aria-label' && code(p.node).includes('submitStatus')).value.expression;
            assert.equal(evalExpr(code(aria), { ...r.scope, submitStatus: raw, submitLabel: 'Submit message', displayConnectionPermissionError: (x: any) => x }), locale === 'zh-CN' ? dict.messages[raw] : raw);
            assert.deepEqual(r.calls, locale === null ? [] : [raw]);
          }
        } finally { r.restore(); }
      }
    }
  });
  test(`T14-fix1 M3：真实固定发送原因和截图保存分支，${locale ?? '无运行时'}`, () => {
    const rawKeys: string[] = ['Select at least one model.'];
    for (const [file, name] of [
      [base + 'lib/attachmentUploadState.ts', 'attachmentUploadBlockReason'],
      [base + 'components/chat/composerAttachmentFiles.ts', 'fileAttachmentCapabilityBlockReason'],
      [base + 'components/ChatView.logic.ts', 'getAntigravitySendBlockReason'],
    ]) {
      const declaration = select(read(UP, file), 'FunctionDeclaration', p => p.node.id.name === name);
      traverse(t.file(t.program([declaration])), { ReturnStatement(p: any) { if (p.node.argument) t.traverseFast(p.node.argument, (n: any) => { if (t.isStringLiteral(n) && n.value.length > 25 && !rawKeys.includes(n.value)) rawKeys.push(n.value); }); } });
    }
    const attachment = select(read(UP, base + 'components/chat/ChatComposer.tsx'), 'VariableDeclarator', p => p.node.id.name === 'attachmentBlockReason');
    t.traverseFast(attachment.init, (n: any) => { if (t.isStringLiteral(n)) rawKeys.push(n.value); });
    assert.ok(rawKeys.length >= 14);
    for (const s of sources(base + 'components/chat/ComposerPrimaryActions.tsx')) {
      const aria = select(s, 'JSXAttribute', p => p.node.name.name === 'aria-label' && code(p.node).includes('submitStatus')).value.expression;
      const tooltip = select(s, 'CallExpression', p => p.node.callee.name === 'displayRunningSendTooltip');
      for (const status of [...rawKeys, risky]) {
        const r = runtime(locale);
        try {
          const scope = { ...r.scope, submitStatus: status, submitTooltip: status, submitLabel: 'Submit message', followUpBehavior: 'steer', alternateAction: 'queue', alternateShortcutLabel: '', displayConnectionPermissionError: (x: any) => x };
          for (const n of [aria, tooltip]) {
            r.calls.length = 0;
            assert.equal(evalExpr(code(n), scope), locale === 'zh-CN' && status !== risky ? dict.messages[status] : status);
            assert.deepEqual(r.calls, locale === null || status === risky ? [] : [status]);
          }
        } finally { r.restore(); }
      }
    }
    for (const s of sources(base + 'components/settings/SnapShotSettings.tsx')) {
      const n = attribute(s, 'SettingsRow', 'status', n => code(n).includes('Updating capture settings'));
      const r = runtime(locale);
      try {
        assert.equal(evalExpr(code(n), { ...r.scope, bridge: true, setupBusy: true, wizard: null }), locale === 'zh-CN' ? '正在更新捕获设置…' : 'Updating capture settings…');
      } finally { r.restore(); }
    }
  });
  test(`T14-fix1 M6：设备步骤、平台检测和 PR 评论，${locale ?? '无运行时'}`, () => {
    const device = base + 'components/device/DeviceSetup.tsx';
    const originalPlatform = fn(read(UP, device), 'platformSetupStatus', { platformName: (p: string) => p === 'ios' ? 'iOS' : 'Android' });
    for (const s of sources(device)) {
      const display = attribute(s, 'WizardSteps', 'displayStep');
      const aria = attribute(s, 'WizardSteps', 'displayStepAria');
      const steps = attribute(s, 'WizardSteps', 'steps');
      for (const step of evalExpr(code(steps), {})) {
        const r = runtime(locale);
        try {
          assert.equal(evalExpr(code(display), r.scope)(step), locale === 'zh-CN' ? dict.messages[step] : step);
          r.calls.length = 0;
          const expected = locale === 'zh-CN' ? `${dict.messages[step]}，第 2 步，${risky}` : `${step}, step 2, ${risky}`;
          assert.equal(evalExpr(code(aria), r.scope)(step, 1, risky), expected);
          assert.ok(r.calls.every(x => !x.includes(risky) && !x.includes('2')));
        } finally { r.restore(); }
      }
      const status = select(s, 'CallExpression', p => p.node.callee.name === 'displayKnown' && code(p.node.arguments[0]) === 'props.status.message');
      for (const platform of ['ios', 'android']) for (const mode of ['missing', 'noDevice', 'ready', 'arbitrary']) {
        const state = { hostStatus: 'ready', hosts: [{ platforms: [{ platform, available: mode !== 'missing' && mode !== 'arbitrary', ...(mode === 'arbitrary' ? { reason: risky } : {}) }] }], devices: mode === 'ready' ? [{ platform }] : [] };
        const raw = originalPlatform(state, platform);
        const r = runtime(locale);
        try {
          assert.equal(evalExpr(code(status), { ...r.scope, props: { status: raw } }), locale === 'zh-CN' && raw.message !== risky ? dict.messages[raw.message] : raw.message);
          assert.deepEqual(r.calls, locale === null || raw.message === risky ? [] : [raw.message]);
        } finally { r.restore(); }
      }
    }
    const pr = base + 'components/pullRequest/PullRequestSummaryTab.tsx';
    const original = children(read(UP, pr), ns => ns.some(n => code(n).includes('hiddenCommentCount')) && ns.some(n => t.isStringLiteral(n) && n.value.includes('older comment')));
    for (const s of sources(pr)) for (const hiddenCommentCount of [1, 2, 99]) {
      const n = select(s, 'CallExpression', p => p.node.callee.name === 'displayOlderComments');
      const scope = { hiddenCommentCount, COMMENT_PAGE: 20, Math };
      const r = runtime(locale);
      try {
        assert.equal(evalExpr(code(n), { ...r.scope, ...scope }), locale === 'zh-CN' ? `显示较早的 ${Math.min(hiddenCommentCount, 20)} 条评论（隐藏了 ${hiddenCommentCount} 条）` : render(original, scope));
        assert.deepEqual(r.calls, locale === null ? [] : [`Show ${SLOT} older comment${hiddenCommentCount === 1 ? '' : 's'} (\uE001 hidden)`]);
      } finally { r.restore(); }
    }
  });
}

test('T14-fix1 M5：定稿措辞、品牌 skip 及通用 Max 保持原译', () => {
  assert.equal(dict.messages.Max, '最大值');
  assert.equal(dict.messages['Reasoning tier: Max'], '最大');
  assert.equal(dict.messages['Reasoning tier: Ultra'], '极限');
  assert.equal(dict.messages['Submitting message'], '正在发送消息');
  assert.equal(dict.messages['Check capture access in setup'], '请在设置向导中检查截图权限');
  const skipped = JSON.parse(read(ROOT, 'dict/todo-skip.json'));
  for (const key of ['Ultrathink', 'Ultracode']) {
    assert.equal(dict.messages[key], undefined);
    assert.ok(skipped.some((e: any) => e.key === key && e.reason.includes('Ultrathink:')));
    assert.ok(!h.TRAIT_DISPLAY_LABELS.includes(key));
  }
});
for (const locale of [null, 'en', 'zh-CN'] as const) {
  test(`T14-fix1 M6：向导最终可见名 / aria 求值、key 和任意摘要不查表，${locale ?? '无运行时'}`, () => {
    const file = base + 'components/ui/wizard.tsx';
    for (const s of sources(file)) {
      const text = select(s, 'CallExpression', p => p.node.callee.name === 'displayStep');
      const aria = attribute(s, 'Step', 'aria-label');
      const old = attribute(read(UP, file), 'Step', 'aria-label');
      const key = attribute(s, 'li', 'key');
      for (const step of ['Device hub', 'Simulators', 'Agent access', risky]) for (const summary of [null, risky, '$& $` $\' feature/foo to main']) {
        const r = runtime(locale);
        try {
          const scope = { ...r.scope, step, index: 1, currentStep: 2, summaries: [null, summary], displayStep: h.displayKnown, displayStepAria: h.displayDeviceStepAria };
          assert.equal(evalExpr(code(key), scope), step);
          assert.equal(evalExpr(code(text), scope), locale === 'zh-CN' && step !== risky ? dict.messages[step] : step);
          r.calls.length = 0;
          const actual = evalExpr(code(aria), scope);
          assert.equal(actual, locale === 'zh-CN' ? `${dict.messages[step] ?? step}，第 2 步${summary ? `，${summary}` : ''}` : evalExpr(code(old), scope));
          assert.ok(r.calls.every(x => !x.includes(risky) && !x.includes('$&')));
        } finally { r.restore(); }
      }
    }
  });
}

test('T14-fix1 M5：推理专用映射不增加通用 Max / Ultra 的值用途', () => {
  const uses = new Map();
  collectValueUse(read(AFTER, base + 'acceptanceDisplayStrings.ts'), helperFile, base + 'acceptanceDisplayStrings.ts', uses);
  assert.equal(uses.has('Max'), false);
  assert.equal(uses.has('Ultra'), false);
});
