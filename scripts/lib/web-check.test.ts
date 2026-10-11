import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanUrl, compareText, filterEvidence, rebaseImports, summaryPassed, symbolBody } from './web-check.ts';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ModuleIndex } from '../web-check/modules.ts';
import { moduleHashes } from '../web-check/package-modules.ts';
import net from 'node:net';
import { startSandbox } from '../web-check/sandbox.ts';
import { identity, loadState, portFree, stopSandbox } from '../web-check/sandbox-runtime.ts';
import { ROOT } from './iteration-tooling.ts';

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
