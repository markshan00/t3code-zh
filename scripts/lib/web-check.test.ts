import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanUrl, compareText, filterEvidence, rebaseImports, summaryPassed, symbolBody } from './web-check.ts';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ModuleIndex, componentDefinitions } from '../web-check/modules.ts';
import { parse } from '@babel/parser';
import { prepareFixtureModules } from '../web-check/fixture.ts';
import { moduleHashes } from '../web-check/package-modules.ts';
import net from 'node:net';
import { startSandbox } from '../web-check/sandbox.ts';
import { identity, loadState, portFree, stopSandbox } from '../web-check/sandbox-runtime.ts';
import { ROOT } from './iteration-tooling.ts';

test('Webhook验收清单跟随实际上游状态映射，并串联原label函数与显示helper',()=> {
  const manifest=JSON.parse(fs.readFileSync(path.join(ROOT,'scripts/web-check/checks/acceptance.json'),'utf8'));
  const definition=componentDefinitions.webhookDeliveryLabel!;
  const source=fs.readFileSync(path.join(ROOT,'upstream/apps/web/src',definition.source),'utf8');
  const ast=parse(source,{sourceType:'module',plugins:['typescript']});
  const fn:any=ast.program.body.map((node:any)=>node.declaration).find((node:any)=>node?.id?.name===definition.symbol);
  assert.ok(fn,'实际上游label函数必须存在');
  const mapping=fn.body.body.flatMap((node:any)=>node.declarations||[]).find((node:any)=>node.id.name==='labels').init;
  const pairs=Object.fromEntries(mapping.properties.map((node:any)=>[node.key.name,node.value.value]));
  assert.equal(Object.keys(pairs).length,8,'上游固定状态数量变化时必须重审覆盖');
  const check=manifest.checks.find((row:any)=>row.name==='webhook-delivery-status');
  const fixture=manifest.fixtures[check.fixture];
  assert.ok(fixture.modules.includes('webhookDeliveryLabel')&&fixture.modules.includes('webhookDeliveryStatus'));
  const cases=new Map(fixture.tree.map((row:any)=>[row.props['data-webhook-case'],row]));
  const dict=JSON.parse(fs.readFileSync(path.join(ROOT,'dict/zh-CN.json'),'utf8')).messages;
  const verify=(id:string,delivery:any,english:string,chinese:string)=> {
    const row:any=cases.get(id);assert.ok(row,'缺少真实状态：'+id);
    const outer=row.children[1],inner=outer.args[1].$element;
    assert.equal(outer.call,'webhookDeliveryStatus');assert.equal(outer.args[0],delivery.outcome);
    assert.equal(inner.call,definition.symbol);assert.deepEqual(inner.args,[delivery]);
    assert.equal(inner.assert_unchanged_args,true);assert.equal(outer.assert_unchanged_args,true);
    for(const [locale,label] of [['en',english],['zh-CN',chinese]]) {
      const line=`${id} | ${delivery.outcome} | ${label}`;
      assert.ok(check.expected[locale].required.includes(line));
      assert.ok(check.expected[locale].exact_text.split('\n\n').includes(line));
    }
  };
  for(const [outcome,label] of Object.entries(pairs)) {
    assert.equal(typeof dict[label as string],'string','固定状态必须有精确词条：'+label);
    verify(outcome,{outcome},label as string,dict[label as string]);
  }
  verify('accepted-run',{outcome:'accepted',pendingWindow:false},'Ran',dict.Ran);
  verify('accepted-window',{outcome:'accepted',pendingWindow:true},'Opened window',dict['Opened window']);
  verify('unknown-fallback',{outcome:'unknown_future_state'},'unknown future state','unknown future state');
  verify('user-content-fallback',{outcome:'No_project'},'No project','No project');
  for(const id of ['unknown-known-label','forged-known-label','forged-unknown-label','wrong-case-outcome']) {
    const row:any=cases.get(id);assert.ok(row);const call=row.children[1];
    assert.equal(call.assert_unchanged_args,true);assert.equal(typeof call.args[1],'string');
    const line=`${id} | ${call.args[0]} | ${call.args[1]}`;
    for(const locale of ['en','zh-CN'])assert.ok(check.expected[locale].required.includes(line));
  }
});

test('证据递归移除 URL 查询、配对 fragment、身份值和秘密字段', () => {
  const value = filterEvidence({ url:'http://127.0.0.1:1234/path?access_token=secret#token=secret',
    nested:[{credential:'secret', text:'Token #token=secret HOME-VALUE host-value mail-value'}] }, [
    {label:'pairing', value:'secret'}, {label:'HOME',value:'HOME-VALUE'}, {label:'hostname',value:'host-value'}, {label:'email',value:'mail-value'},
  ]);
  const encoded = JSON.stringify(value);
  for (const needle of ['"secret"','HOME-VALUE','host-value','mail-value','?access_token','#token=','"credential"']) assert.ok(!encoded.includes(needle));
  assert.equal(cleanUrl('https://example.invalid/a?x=1#token=x'), 'https://example.invalid/a');
});
test('区域比较检查 required / forbidden / exact / order，空汇总失败', () => {
  assert.deepEqual(compareText('文件\n浏览器\n差异', {required:['浏览器'],forbidden:['Files'],exact:' 文件 \n 浏览器\n差异 ', ordered:['文件','浏览器','差异']}), []);
  assert.equal(compareText('Files Browser', {required:['文件'],forbidden:['Files'],exact:'文件',ordered:['Browser','Files']}).length, 4);
  assert.equal(summaryPassed([]),false); assert.equal(summaryPassed([{passed:true},{passed:false}]),false);
});
test('重定向静态和动态 import，只追加导出，函数体和普通字符串不变', () => {
  const source = 'import {x} from "./a.js"; export {y} from "./b.js"; const ordinary="./unchanged.js"; function C(){return "from \\\"./text.js\\\""} const load=()=>import("./lazy.js");';
  const rebased = rebaseImports(source, 'http://127.0.0.1:1234', ['C']);
  assert.equal(symbolBody(source,'C'),symbolBody(rebased,'C'));
  assert.ok(rebased.includes('"http://127.0.0.1:1234/assets/a.js"'));
  assert.ok(rebased.includes('import("http://127.0.0.1:1234/assets/lazy.js")'));
  assert.ok(rebased.includes('ordinary="./unchanged.js"'));
  assert.throws(()=>rebaseImports(source,'http://127.0.0.1:1234/path',['C']));
});
test('哈希比对明确拒绝不同和缺失资源',()=> {
  const buffer=Buffer.from('final module');
  assert.equal(moduleHashes('component.js',buffer,buffer).matches_dmg,true);
  assert.equal(moduleHashes('component.js',buffer,Buffer.from('different')).matches_dmg,false);
  assert.equal(moduleHashes('component.js',buffer,null).matches_dmg,false);
  assert.equal(moduleHashes('component.js',null,buffer).matches_dmg,false);
});
test('源码映射与函数特征必须唯一，禁止重写组件函数体',()=> {
  const build=fs.mkdtempSync(path.join(os.tmpdir(),'t3zh-web-unit-'));
  const assets=path.join(build,'apps/server/dist/client/assets');fs.mkdirSync(assets,{recursive:true});
  const write=(file:string,source:string)=> {
    fs.writeFileSync(path.join(assets,file),source);
    fs.writeFileSync(path.join(assets,file+'.map'),JSON.stringify({version:3,sources:['/components/Widget.tsx'],names:['Widget'],mappings:'SAAAA'}));
  };
  try {
    write('one.js','function a(){return "widget";}');
    const index=new ModuleIndex(build),entry=index.symbol('/components/Widget.tsx','Widget',['widget']);
    assert.equal(entry.name,'a');assert.equal(index.rewrite([entry],'http://127.0.0.1:1234').length,1);
    assert.throws(()=>index.symbol('/components/Widget.tsx','Missing'));
    write('two.js','function b(){return "widget";}');
    assert.throws(()=>new ModuleIndex(build).symbol('/components/Widget.tsx','Widget'));
    fs.rmSync(path.join(assets,'two.js.map'));
    write('one.js','function a(){return import("./child.js");}');
    const dynamic=new ModuleIndex(build),symbol=dynamic.symbol('/components/Widget.tsx','Widget');
    assert.throws(()=>dynamic.rewrite([symbol],'http://127.0.0.1:1234'));
  }finally{fs.rmSync(build,{recursive:true,force:true});}
});
test('位于入口的 fixture 使用原模块 URL，只安装一次导出且不改顶层副作用',async()=> {
  const build=fs.mkdtempSync(path.join(os.tmpdir(),'t3zh-web-entry-test-'));
  const assets=path.join(build,'apps/server/dist/client/assets');fs.mkdirSync(assets,{recursive:true});
  const source='function a(){return "guide";}globalThis.entryRuns++;';
  fs.writeFileSync(path.join(assets,'entry.js'),source);
  fs.writeFileSync(path.join(assets,'entry.js.map'),JSON.stringify({version:3,
    sources:['/components/pullRequest/guide/GuideRail.tsx'],names:['GuideRail'],mappings:'SAAAA'}));
  const responses:any[]=[];
  const page={route:async(url:string,handler:any)=>handler({fulfill:(response:any)=>responses.push({url,...response})})};
  try {
    const prepared=await prepareFixtureModules(page,new ModuleIndex(build),
      [{modules:['guideRail']},{modules:['guideRail']}],'http://127.0.0.1:1234');
    assert.equal(responses.length,1);
    assert.equal(responses[0].url,'http://127.0.0.1:1234/assets/entry.js');
    assert.equal(responses[0].body,source+'\nexport {a as WebCheck_a};\n');
    assert.equal(prepared.components.guideRail?.file,'entry.js');
    assert.equal(fs.readFileSync(path.join(assets,'entry.js'),'utf8'),source);
  }finally{fs.rmSync(build,{recursive:true,force:true});}
});
test('被占用的端口在创建沙盒 / PID 之前拒绝',async()=> {
  const server=net.createServer();await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
  const port=(server.address() as net.AddressInfo).port;
  const out=fs.mkdtempSync(path.join(os.tmpdir(),'t3zh-web-port-test-')),file=path.join(out,'state.json');
  try {
    assert.equal(await portFree(port),false);
    await assert.rejects(startSandbox(file,path.join(ROOT,'.build/src'),port,port===65535?65534:port+1),/端口已被占用/);
    assert.equal(fs.existsSync(file),false);
  }finally{await new Promise<void>(resolve=>server.close(()=>resolve()));fs.rmSync(out,{recursive:true,force:true});}
});
test('状态归属 / PID 身份不符时保留文件并拒绝终止',async()=> {
  const sandbox=fs.mkdtempSync(path.join(os.homedir(),'.t3-zh-test-web-unit-'));
  const out=fs.mkdtempSync(path.join(os.tmpdir(),'t3zh-web-state-test-')),file=path.join(out,'state.json');
  const state={schema:1,sandbox,build_src:ROOT,origin:'http://127.0.0.1:12345',helper_origin:'http://127.0.0.1:12346',
    processes:[{pid:process.pid,role:'helper',started:'wrong identity'}],marker:'own unit marker',ready:true};
  fs.writeFileSync(path.join(sandbox,'.web-check-marker'),state.marker);fs.writeFileSync(file,JSON.stringify(state));
  try {
    await assert.rejects(stopSandbox(file),/PID 已复用/);assert.ok(identity(process.pid));assert.ok(fs.existsSync(sandbox)&&fs.existsSync(file));
    fs.writeFileSync(file,JSON.stringify({...state,sandbox:out}));assert.throws(()=>loadState(file),/沙盒必须位于 HOME/);
  }finally{fs.rmSync(sandbox,{recursive:true,force:true});fs.rmSync(out,{recursive:true,force:true});}
});
