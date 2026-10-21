import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
import { TraceMap, eachMapping } from '@jridgewell/trace-mapping';
import { sha256 } from '../lib/iteration-tooling.ts';
import { rebaseImports, symbolBody } from '../lib/web-check.ts';

const traverse = traverseModule.default ?? traverseModule;
export type ModuleSymbol = { file: string; name: string; exported?: string; original: string; original_symbol: string; sha256: string; body_sha256: string };
export class ModuleIndex {
  assets: string;
  maps: { file: string; map: any }[];
  cache = new Map<string, { source: string; ast: any; offsets: number[] }>();
  symbols = new Map<string,ModuleSymbol>();
  rewritten = new Map<string,string>();
  constructor(build: string) {
    this.assets = path.join(build, 'apps/server/dist/client/assets');
    this.maps = fs.readdirSync(this.assets).filter(name=>name.endsWith('.js.map')).map(name=>({
      file:name.slice(0,-4), map:JSON.parse(fs.readFileSync(path.join(this.assets,name),'utf8')),
    }));
  }
  read(file: string) {
    if (!this.cache.has(file)) {
      const source = fs.readFileSync(path.join(this.assets,file),'utf8');
      let offset = 0; const offsets=source.split('\n').map(line=>{const current=offset;offset+=line.length+1;return current;});
      this.cache.set(file,{source, ast:parse(source,{sourceType:'module'}),offsets});
    }
    return this.cache.get(file)!;
  }
  symbol(original: string, originalSymbol: string, features: string[] = [], publicOnly = false): ModuleSymbol {
    const key=JSON.stringify([original,originalSymbol,features,publicOnly]);
    if(this.symbols.has(key))return this.symbols.get(key)!;
    const found: ModuleSymbol[] = [];
    for (const { file, map } of this.maps) {
      if (!map.sources.some((source:string)=>source.endsWith(original))) continue;
      const {source,ast,offsets}=this.read(file); const names=new Set<string>();
      eachMapping(new TraceMap(map), m=> {
        if (m.name!==originalSymbol || !m.source?.endsWith(original)) return;
        const offset=offsets[m.generatedLine-1]!+m.generatedColumn;
        const local=/^[A-Za-z_$][\w$]*/.exec(source.slice(offset))?.[0]; if(local)names.add(local);
      });
      const exportMap=new Map<string,string>(ast.program.body.filter((n:any)=>n.type==='ExportNamedDeclaration')
        .flatMap((n:any)=>n.specifiers.map((s:any)=>[s.local.name,s.exported.name])));
      for (const name of names) {
        let body: string; try { body=symbolBody(source,name); } catch { continue; }
        if (!features.every(feature=>body.includes(feature)) || (publicOnly && !exportMap.has(name))) continue;
        found.push({file,name,exported:exportMap.get(name),original,original_symbol:originalSymbol,
          sha256:sha256(Buffer.from(source)),body_sha256:sha256(Buffer.from(body))});
      }
    }
    const unique=[...new Map(found.map(entry=>[entry.file+':'+entry.name,entry])).values()];
    assert.equal(unique.length,1,`符号映射需唯一：${originalSymbol} (${unique.length})`);
    this.symbols.set(key,unique[0]!);return unique[0]!;
  }
  rewrite(entries: ModuleSymbol[], origin: string) {
    const result: {file:string;source:string;symbols:ModuleSymbol[]}[]=[];
    for(const file of new Set(entries.map(entry=>entry.file))) {
      const symbols=entries.filter(entry=>entry.file===file),source=this.read(file).source;
      const key=JSON.stringify([file,origin,symbols.map(entry=>entry.name).sort()]);
      if(!this.rewritten.has(key)) {
        const rewritten=rebaseImports(source,origin,symbols.map(entry=>entry.name));
        for(const entry of symbols) assert.equal(symbolBody(source,entry.name),symbolBody(rewritten,entry.name),'函数体不得修改：'+entry.original_symbol);
        this.rewritten.set(key,rewritten);
      }
      result.push({file,source:this.rewritten.get(key)!,symbols});
    }
    return result;
  }
  commonJsWrapper(original: string): ModuleSymbol {
    const found: ModuleSymbol[]=[];
    for(const {file,map} of this.maps) {
      if (!map.sources.some((source:string)=>source.endsWith(original)))continue;
      const {source,ast}=this.read(file);
      const exports=ast.program.body.filter((n:any)=>n.type==='ExportNamedDeclaration').flatMap((n:any)=>n.specifiers);
      const nodes=ast.program.body.flatMap((n:any)=>n.type==='VariableDeclaration'?n.declarations:[]);
      for(const node of nodes) {
        const name=node.id?.name, exported=exports.find((entry:any)=>entry.local.name===name)?.exported.name;
        const body=source.slice(node.start,node.end);
        if(exported && node.init?.type==='CallExpression' && body.includes('.exports=')) found.push({file,name,exported,
          original,original_symbol:'CommonJS public wrapper',sha256:sha256(Buffer.from(source)),body_sha256:sha256(Buffer.from(body))});
      }
    }
    assert.equal(found.length,1,'CommonJS wrapper 需唯一：'+original);return found[0]!;
  }
}
export function sharedSymbols(index: ModuleIndex) {
  return {
    react:index.commonJsWrapper('/react/cjs/react.production.js'),
    reactDom:index.commonJsWrapper('/react-dom/client.js'),
    router:index.symbol('/routerContext.js','routerContext',[],true),
    registry:index.symbol('/rpc/atomRegistry.ts','AppAtomRegistryProvider',[],true),
    atomRegistry:index.symbol('/rpc/atomRegistry.ts','appAtomRegistry',[],true),
    welcome:index.symbol('/state/server.ts','primaryServerWelcomeAtom',[],true),
    presentations:index.symbol('/state/presentation.ts','environmentPresentations',[],true),
    hydrate:index.symbol('/hooks/useSettings.ts','ensureClientSettingsHydrated',[],true),
    persist:index.symbol('/hooks/useSettings.ts','persistClientSettingsUpdate',[],true),
  };
}
export const componentDefinitions: Record<string,{source:string;symbol:string;features?:string[]}> = {
  header:{source:'/components/chat/ChatHeader.tsx',symbol:'ChatHeader',features:['parentThreadLink','data-parent-breadcrumb-ellipsis']},
  pr:{source:'/components/pullRequest/PullRequestSummaryTab.tsx',symbol:'PullRequestSummaryTab',features:['activityPending','Filter comments']},
  language:{source:'/components/chat/ComposerCodeBlockLanguagePicker.tsx',symbol:'ComposerCodeBlockLanguagePicker',features:['Search languages']},
  quota:{source:'/components/usage/UsageLimitsPooled.tsx',symbol:'UsageLimitsPooled',features:['presentations:','cursorPrompt:']},
  filter:{source:'/components/usage/UsagePage.tsx',symbol:'UsageProviderFilter',features:['All providers']},
  cleanupResults:{source:'/components/settings/StorageSettings.tsx',symbol:'CleanupResults'},
  lastRun:{source:'/n2935DisplayStrings.ts',symbol:'displayCleanupLastRun'},
  summary:{source:'/n2935DisplayStrings.ts',symbol:'displayCleanupSummary'},
  importStep:{source:'/components/onboarding/WelcomeWizard.tsx',symbol:'ImportStep'},
  userRow:{source:'/components/chat/MessagesTimeline.tsx',symbol:'UserTimelineRow'},
  timelineContext:{source:'/components/chat/MessagesTimeline.tsx',symbol:'TimelineRowCtx'},
  tabs:{source:'/components/RightPanelTabs.tsx',symbol:'RightPanelTabs'},
  banner:{source:'/components/chat/ComposerBannerStack.tsx',symbol:'ComposerBannerStack'},
  about:{source:'/components/settings/SettingsPanels.tsx',symbol:'AboutVersionSection'},
  guideRail:{source:'/components/pullRequest/guide/GuideRail.tsx',symbol:'GuideRail'},
  promptLanding:{source:'/components/promptLinks/HostedPromptLinkLanding.tsx',symbol:'HostedPromptLinkLanding'},
  updateCapsule:{source:'/components/sidebar/SidebarUpdateCapsule.tsx',symbol:'SidebarUpdateCapsule'},
  updateSummary:{source:'/components/sidebar/updateEverything.logic.ts',symbol:'describeUpdateEverything'},
  usageAccountSummary:{source:'/v011DisplayStrings.ts',symbol:'displayUsageAccountSummary'},
  easSessionLimits:{source:'/v011DisplayStrings.ts',symbol:'displayEasSessionLimits'},
  webhookFilterError:{source:'/v011DisplayStrings.ts',symbol:'displayWebhookFilterError'},
  webhookDeliveryStatus:{source:'/v011DisplayStrings.ts',symbol:'displayWebhookDeliveryStatus'},
  webhookDeliveryLabel:{source:'/components/settings/scheduledTasksSettings.logic.ts',symbol:'webhookDeliveryLabel',features:['pendingWindow','dispatch_failed','replaceAll']},
  connectionSummary:{source:'/components/settings/ConnectionDiagnosisDetails.tsx',symbol:'ConnectionDiagnosisSummary'},
  mobileApps:{source:'/components/settings/MobileAppSettingsRow.tsx',symbol:'MobileAppSettingsRow'},
  resetCreditDialog:{source:'/components/usage/UsageLimits.tsx',symbol:'ResetCreditDialog'},
};
