/** v0.1.1: real upstream / patched display expressions, bilingual output and data isolation. */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { stripTypeScriptTypes } from "node:module";
import { pathToFileURL } from "node:url";
import { parse } from "@babel/parser";
import tr from "@babel/traverse";
import gen from "@babel/generator";
import * as t from "@babel/types";
import { installT3zhRuntime } from "../../runtime/t3zh-runtime.ts";
import { createScanContext } from "../matcher.ts";
import { transformCode } from "../vite-plugin-t3zh.ts";
const traverse=(tr as any).default??tr, generate=(gen as any).default??gen;
const ROOT=path.resolve(import.meta.dirname,"../.."), UP=path.resolve(process.env.T3ZH_UPSTREAM??path.join(ROOT,"upstream"));
const BASE="apps/web/src/", PATCH="0023-v011-display-strings.patch";
const files=[...new Set([...fs.readFileSync(path.join(ROOT,"patches",PATCH),"utf8").matchAll(/^diff --git a\/(.+) b\//gm)].map(m=>m[1])), BASE+"newThreadDisplayStrings.ts",BASE+"stableDisplayStrings.ts",BASE+"components/settings/scheduledTasksSettings.logic.ts"];
const DIR=fs.mkdtempSync(path.join(os.tmpdir(),"t3zh-v011-display-"));
for(const f of files)if(fs.existsSync(path.join(UP,f))){fs.mkdirSync(path.dirname(path.join(DIR,f)),{recursive:true});fs.copyFileSync(path.join(UP,f),path.join(DIR,f));}
for(const p of fs.readdirSync(path.join(ROOT,"patches")).filter(x=>x.endsWith(".patch")).sort())execFileSync("git",["apply",...files.map(f=>`--include=${f}`),path.join(ROOT,"patches",p)],{cwd:DIR});
after(()=>fs.rmSync(DIR,{recursive:true,force:true}));
for(const f of ["acceptanceDisplayStrings.ts","stableDisplayStrings.ts","v011DisplayStrings.ts"]){const p=path.join(DIR,BASE,f);fs.writeFileSync(p,fs.readFileSync(p,"utf8").replace(/from "\.\/(newThreadDisplayStrings|stableDisplayStrings)"/g,'from "./$1.ts"'));}
const slots=await import(pathToFileURL(path.join(DIR,BASE,"newThreadDisplayStrings.ts")).href);
const stable=await import(pathToFileURL(path.join(DIR,BASE,"stableDisplayStrings.ts")).href);
const helper=await import(pathToFileURL(path.join(DIR,BASE,"v011DisplayStrings.ts")).href);
const dict=JSON.parse(fs.readFileSync(path.join(ROOT,"dict/zh-CN.json"),"utf8"));
const ctx=createScanContext({root:UP}), risk="Account A / feature/foo to main $&";
const read=(root:string,f:string)=>fs.readFileSync(path.join(root,BASE+f),"utf8");
const ast=(s:string)=>parse(s,{sourceType:"module",plugins:["typescript","jsx"]});
const code=(n:any)=>generate(n).code;
function all(s:string,predicate:(n:any)=>boolean){const out:any[]=[];traverse(ast(s),{enter(p:any){if(predicate(p.node))out.push(p.node);}});return out;}
function one(s:string,predicate:(n:any)=>boolean){const out=all(s,predicate);assert.equal(out.length,1);return out[0];}
function evaluate(n:any,scope:Record<string,any>={}){const vars={...slots,...stable,...helper,...scope};return new Function(...Object.keys(vars),"return "+stripTypeScriptTypes("("+code(n)+")"))(...Object.values(vars));}
const converted=(f:string)=>{const s=read(DIR,f);return transformCode(s,path.join(UP,BASE,f),ctx).output?.code??s;};
const call=(s:string,name:string,needle="")=>one(s,n=>t.isCallExpression(n)&&t.isIdentifier(n.callee,{name})&&code(n).includes(needle));
const init=(s:string,name:string)=>one(s,n=>t.isVariableDeclarator(n)&&t.isIdentifier(n.id,{name})).init;
function runtime(locale:"en"|"zh-CN"|null){const previous=globalThis.__t3zh,calls:string[]=[];const api=locale===null?undefined:installT3zhRuntime(dict,{localStorage:{getItem:()=>locale,setItem(){}},navigator:null,systemLanguages:null,document:null,location:null,target:null}).api;globalThis.__t3zh=api?{...api,t(v:string){calls.push(v);return api.t(v);}}:undefined;return{calls,scope:{__t3zh_t:(v:any)=>api?api.t(v):v},restore(){globalThis.__t3zh=previous;}};}

for(const locale of [null,"en","zh-CN"] as const){
 test(`usage account aria: original optional branches, new pace and account isolation (${locale})`,()=>{
  const f="components/usage/UsageLimitsPooled.tsx",before=one(read(UP,f),n=>t.isJSXAttribute(n)&&n.name.name==="aria-label"&&code(n).includes("timeLeft")).value.expression;
  const after=call(converted(f),"displayUsageAccountSummary");
  for(const timeLeft of [null,50])for(const resetsIn of [null,"resets in 2h"])for(const credits of [0,1,2]){const r=runtime(locale);try{
   const scope={account:{displayName:risk},accountInitials:()=>"XX",remaining:80,timeLeft,resetsIn,credits,...r.scope};
   const original=evaluate(before,scope),actual=evaluate(after,scope);
   assert.equal(actual,locale==="zh-CN"?`${risk}: 剩余 80%${resetsIn?`, ${resetsIn}`:""}${timeLeft===null?"":", 此时间窗口剩余 50%"}${credits?`, ${credits===1?"已储备 1 个重置额度":"已储备 2 个重置额度"}`:""}`:original);
   assert.ok(r.calls.every(v=>!v.includes(risk)&&!v.includes("80")&&!v.includes("50")));
  }finally{r.restore();}}
 });
 test(`cross-machine clone: real final slot calls preserve names, counts and fallback (${locale})`,()=>{
  const f="components/AddProjectToMachineDialog.tsx",s=converted(f),r=runtime(locale);try{
   const scope={project:{title:risk},target:{label:risk},files:Array(4),selectedFiles:new Set(["a"]),...r.scope};
   assert.equal(evaluate(call(s,"fillSlot",'"Clone "'),scope),locale==="zh-CN"?`克隆 ${risk}，并复制 Git 未跟踪的本地文件。`:`Clone ${risk} and bring the local files git does not track.`);
   for(const size of [1,2])assert.equal(evaluate(call(s,"fillSlot",'"+ "'),{...scope,selectedFiles:new Set(Array.from({length:size},(_,i)=>i))}),locale==="zh-CN"?`+ ${size} 个文件`:`+ ${size} ${size===1?"file":"files"}`);
   assert.equal(evaluate(call(s,"fillSlot",'"Folder on "'),scope),locale==="zh-CN"?`${risk} 上的文件夹`:`Folder on ${risk}`);
   assert.equal(evaluate(call(s,"fillSlot",'"Folder on "'),{...scope,target:null}),locale==="zh-CN"?"另一台设备 上的文件夹":"Folder on the other machine");
   assert.equal(evaluate(call(s,"fillDisplaySlots"),scope),locale==="zh-CN"?"1 / 4":"1 of 4");
   assert.equal(evaluate(call(s,"fillSlot",'"Showing the first "'),scope),locale==="zh-CN"?"显示前 4 个文件。":"Showing the first 4 files.");
   assert.ok(!r.calls.some(v=>v.includes(risk)));
   // Files / target sent to the server are unmodified; the patch changes only render branches.
   assert.equal(code(init(read(DIR,f),"selectedFiles")),code(init(read(UP,f),"selectedFiles")));
  }finally{r.restore();}
 });
 test(`EAS host: actual limits and credential display; settings and arbitrary errors remain raw (${locale})`,()=>{
  const f="components/settings/EasDeviceHostsSettings.tsx",s=converted(f),r=runtime(locale);try{
   const original=one(read(UP,"components/settings/easDeviceHostsSettings.logic.ts"),n=>t.isFunctionDeclaration(n)&&n.id.name==="easSessionLimits");
   for(const count of [1,3]){const host={maxConcurrentSessions:count,maxSessionMinutes:30,idleMinutes:10};assert.equal(evaluate(call(s,"displayEasSessionLimits"),{host,...r.scope}),locale==="zh-CN"?`最多同时运行 ${count} 个会话，每个会话在运行 30 分钟或空闲 10 分钟后停止`:evaluate(original)(host));}
   const mapping=evaluate(init(read(UP,f),"CREDENTIAL_SOURCES"));assert.equal(code(init(read(DIR,f),"CREDENTIAL_SOURCES")),code(init(read(UP,f),"CREDENTIAL_SOURCES")));
   const credentials=call(s,"translateFixed","CREDENTIAL_SOURCES");
   for(const credentialSource of Object.keys(mapping))assert.equal(evaluate(credentials,{account:{account:{credentialSource}},CREDENTIAL_SOURCES:mapping,...r.scope}),locale==="zh-CN"?dict.messages[mapping[credentialSource]]:mapping[credentialSource]);
   assert.equal(code(init(read(DIR,f),"next")),code(init(read(UP,f),"next")),"accessToken / settings payload unchanged");
   const status=one(s,n=>t.isConditionalExpression(n)&&code(n.test)==='account.status === "signed-in"'&&code(n).includes("account.error"));
   assert.equal(evaluate(status,{account:{status:"failed",error:risk},...r.scope}),risk);
   for(const label of ["Sessions at once","Session minutes","Idle minutes"]){assert.equal(evaluate(call(s,"translateFixed","label"),{label,...r.scope}),locale==="zh-CN"?dict.messages[label]:label);}
  }finally{r.restore();}
 });
 test(`webhook local validator: real source, no arbitrary value translation (${locale})`,()=>{
  const r=runtime(locale);try{
   const source=fs.readFileSync(path.join(UP,"packages/client-runtime/src/scheduledTaskWebhook.ts"),"utf8");
   const parseFn=evaluate(one(source,n=>t.isFunctionDeclaration(n)&&n.id.name==="parseWebhookFilterDrafts"),{MAX_WEBHOOK_FILTERS:8,decodeFilter:()=>({_tag:"None"}),Option:{isNone:(x:any)=>x._tag==="None"}});
   const expression=call(converted("components/settings/ScheduledTasksSettings.tsx"),"displayWebhookFilterError");
   for(const drafts of [Array(9).fill({}),[{path:"",op:"exists",value:""}],[{path:"",op:"in",value:""}],[{path:"",op:"eq",value:""}]]){const parsedFilters=parseFn(drafts);const shown=evaluate(expression,{parsedFilters,...r.scope});assert.equal(shown,locale==="zh-CN"?globalThis.__t3zh!.t(parsedFilters.error):parsedFilters.error);if(locale==="zh-CN")assert.doesNotMatch(shown,/Use at most|Filter |needs a path/);}
   assert.equal(helper.displayWebhookFilterError(risk),risk);
   assert.ok(!r.calls.some(v=>v.includes(risk)));
  }finally{r.restore();}
 });
 test(`webhook delivery: nine real outcomes, eight strict pairs and accepted windows (${locale})`,()=>{
  const file="components/settings/scheduledTasksSettings.logic.ts",original=read(UP,file),final=converted(file);
  const formatter=(source:string)=>one(source,n=>t.isFunctionDeclaration(n)&&n.id.name==="webhookDeliveryLabel");
  const labels=evaluate(init(code(formatter(original)),"labels"));
  assert.deepEqual(labels,{
   dispatch_failed:"Run failed",duplicate:"Duplicate",coalesced:"Coalesced",filtered:"Filtered",
   rejected_signature:"Bad signature",disabled:"Task paused",rate_limited:"Rate limited",expired:"Too old",
  });
  const helperSource=converted("v011DisplayStrings.ts");
  const pairs=evaluate(init(helperSource,"WEBHOOK_DELIVERY_STATUS_PAIRS"));
  assert.deepEqual(pairs,Object.entries(labels),"all and only the eight real upstream pairs are gated");
  const finalHelper=one(helperSource,n=>t.isFunctionDeclaration(n)&&n.id.name==="displayWebhookDeliveryStatus");
  const callSites=all(converted("components/settings/ScheduledTasksSettings.tsx"),n=>t.isCallExpression(n)&&t.isIdentifier(n.callee,{name:"displayWebhookDeliveryStatus"}));
  assert.equal(callSites.length,2,"the real list and detail display sites remain connected");
  const expected:{[outcome:string]:string}={dispatch_failed:"运行失败",duplicate:"重复投递",coalesced:"已合并",filtered:"已过滤",rejected_signature:"签名无效",disabled:"定时任务已暂停",rate_limited:"已限流",expired:"已过期"};
  const r=runtime(locale);try{
   const rawFormatter=evaluate(formatter(original));
   const shownFormatter=evaluate(formatter(final),r.scope);
   const displayWebhookDeliveryStatus=evaluate(finalHelper,{WEBHOOK_DELIVERY_STATUS_PAIRS:pairs,...r.scope});
   const cases=[...Object.keys(labels).map(outcome=>({outcome,pendingWindow:false})),{outcome:"accepted",pendingWindow:false},{outcome:"accepted",pendingWindow:true}];
   for(const input of cases){
    const delivery=Object.freeze(input),snapshot=JSON.stringify(delivery),raw=rawFormatter(delivery);
    const translated=input.outcome==="accepted"?(input.pendingWindow?"已开启窗口":"已运行"):expected[input.outcome];
    for(const expression of callSites){
     r.calls.length=0;
     const actual=evaluate(expression,{delivery,selected:delivery,webhookDeliveryLabel:shownFormatter,displayWebhookDeliveryStatus,...r.scope});
     assert.equal(actual,locale==="zh-CN"?translated:raw);
     assert.deepEqual(r.calls,locale===null||input.outcome==="accepted"?[]:[raw],"accepted is translated by upstream E3; mapped labels only at the final gate");
     assert.equal(JSON.stringify(delivery),snapshot,"outcome and pendingWindow remain protocol values");
    }
   }
   // A genuine unknown outcome can produce text equal to a known label; that text must remain raw.
   for(const outcome of ["Filtered","Run failed","custom_event",risk]){
    const delivery=Object.freeze({outcome,pendingWindow:false});r.calls.length=0;
    assert.equal(displayWebhookDeliveryStatus(outcome,shownFormatter(delivery)),rawFormatter(delivery));
    assert.deepEqual(r.calls,[]);assert.equal(delivery.outcome,outcome);
   }
   // Both sides of the pair are required, including an accepted outcome paired with a mapped label.
   const entries=Object.entries(labels) as Array<[string,string]>;
   for(const [index,[outcome,label]] of entries.entries()){
    const otherLabel=entries[(index+1)%entries.length]![1];
    for(const [fakeOutcome,fakeLabel] of [["unknown-outcome",label],["accepted",label],[outcome,otherLabel],[outcome,risk]]){
     r.calls.length=0;assert.equal(displayWebhookDeliveryStatus(fakeOutcome,fakeLabel),fakeLabel);assert.deepEqual(r.calls,[]);
    }
   }
  }finally{r.restore();}
 });
 test(`device retry, attempt and store links use actual display calls (${locale})`,()=>{
  const r=runtime(locale);try{
   const retry=call(converted("components/settings/DeviceHostsSettings.tsx"),"fillSlot","Retrying from");
   for(const retrying of [null,"id"]){assert.equal(evaluate(retry,{retrying,result:{environmentId:"id",label:risk},...r.scope}),locale==="zh-CN"?`${retrying?"正在从":"从"} ${risk} 重试`:`${retrying?"Retrying":"Retry"} from ${risk}`);}
   assert.equal(evaluate(call(converted("components/settings/ConnectionDiagnosisDetails.tsx"),"fillSlot","attempt"),{attempt:3,...r.scope}),locale==="zh-CN"?"第 3 次尝试":"attempt 3");
   assert.equal(evaluate(call(converted("components/settings/MobileAppSettingsRow.tsx"),"fillSlot"),{store:"App Store",...r.scope}),locale==="zh-CN"?"打开 App Store":"Open App Store");
   assert.ok(!r.calls.some(v=>v.includes(risk)||v.includes("App Store")));
  }finally{r.restore();}
 });
}

test("account columns preserve new shared popover, refill and pace behavior",()=>{
 const source=read(DIR,"components/usage/UsageLimitsPooled.tsx");
 for(const needle of ["pool.accounts.map((account)","collectLimitPools([account], now)","repeat(auto-fit, minmax(min(100%, 18rem), 1fr))","h-6 w-full","<SegmentPopoverContext value={segmentPopover}>","<Popover handle={segmentPopover} actionsRef={segmentPopoverActions}>","refillPercent={member.refillPercent}","Math.min(100 - remaining, refillPercent)","usePaceMark(timeLeft)","payload.redeem?.setConfirming(true)","actions.current?.unmount()"]){assert.ok(source.includes(needle),needle);}
 const before=read(UP,"components/usage/UsageLimitsPooled.tsx");
 for(const name of ["ActiveSegmentPopover","RedeemableSegment"]){const get=(s:string)=>code(one(s,n=>t.isFunctionDeclaration(n)&&n.id.name===name));assert.equal(get(source),get(before),name+" retains upstream behavior");}
});

test("browser search engine: transform Custom label, keep engine keys and URL data unchanged",()=>{
 const file="components/settings/IntegrationsSettings.tsx",before=read(UP,file),after=transformCode(before,path.join(UP,BASE,file),ctx).output?.code??before;
 for(const locale of [null,"en","zh-CN"] as const){const r=runtime(locale);try{const original=evaluate(init(before,"SEARCH_ENGINE_LABELS")),shown=evaluate(init(after,"SEARCH_ENGINE_LABELS"),r.scope);assert.deepEqual(Object.keys(shown),Object.keys(original));assert.equal(shown.custom,locale==="zh-CN"?"自定义":"Custom");for(const key of Object.keys(original).filter(x=>x!=="custom"))assert.equal(shown[key],original[key]);}finally{r.restore();}}
});

test("C browser status: actual final attributes translate fixed copy and preserve URL validation / storage",()=>{
 const file="components/settings/IntegrationsSettings.tsx",original=read(UP,file),patched=read(DIR,file),final=converted(file);
 const key="Enter an http or https URL containing %s. Searches use DuckDuckGo until then.";
 const status=(source:string)=>one(source,n=>t.isJSXAttribute(n)&&n.name.name==="status"&&code(n).includes("isValidSearchUrlTemplate(customUrl)")).value.expression;
 const availability=(source:string)=>one(source,n=>t.isJSXAttribute(n)&&n.name.name==="message"&&code(n).includes("Only available in the desktop app.")).value;
 const preview=fs.readFileSync(path.join(UP,"packages/shared/src/preview.ts"),"utf8");
 const fn=(name:string)=>one(preview,n=>t.isFunctionDeclaration(n)&&n.id.name===name);
 const fillSearchUrlTemplate=evaluate(fn("fillSearchUrlTemplate"));
 const isValidSearchUrlTemplate=evaluate(fn("isValidSearchUrlTemplate"),{fillSearchUrlTemplate});
 for(const locale of [null,"en","zh-CN"] as const){const r=runtime(locale);try{
  for(const customUrl of ["","https://example.com/search","https://example.com/search?q=%s","http://example.com/search?q=%s"]){
   const scope={customUrl,isValidSearchUrlTemplate,...r.scope};
   const before=evaluate(status(original),scope),expected=locale==="zh-CN"&&before!==undefined?"请输入包含 %s 的 http 或 https URL。在此之前，搜索会使用 DuckDuckGo。":before;
   for(const source of [patched,final]){r.calls.length=0;assert.equal(evaluate(status(source),scope),expected);assert.deepEqual(r.calls,locale===null||before===undefined?[]:[key]);}
  }
  for(const source of [patched,final]){r.calls.length=0;assert.equal(evaluate(availability(source).expression,r.scope),locale==="zh-CN"?"仅在桌面应用中可用。":evaluate(availability(original),r.scope));assert.deepEqual(r.calls,locale===null?[]:["Only available in the desktop app."]);}
 }finally{r.restore();}}
 // Validate and persist the original URL. Translation does not touch either the predicate or the input callback.
 assert.equal(code(status(patched).test),code(status(original).test));
 const onCommit=(source:string)=>one(source,n=>t.isJSXAttribute(n)&&n.name.name==="onCommit"&&code(n).includes("browserCustomSearchUrl")).value.expression;
 assert.equal(code(onCommit(patched)),code(onCommit(original)));
 const updates:any[]=[];evaluate(onCommit(patched),{updateSettings:(value:any)=>updates.push(value)})(" https://example.com/search?q=%s ");
 assert.deepEqual(updates,[{browserCustomSearchUrl:"https://example.com/search?q=%s"}]);
});
