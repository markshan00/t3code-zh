import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { parseArgs, prepareOut, privatePatterns, redact, writeJson, auditOutputs, ROOT, assertSafePath, runCommand, validateVersion } from '../lib/iteration-tooling.ts';
import { compareText, filterEvidence, summaryPassed } from '../lib/web-check.ts';
import { startSandbox } from './sandbox.ts';
import { expandPath, identity, loadState, signalOwned, stopSandbox } from './sandbox-runtime.ts';
import { ModuleIndex, sharedSymbols } from './modules.ts';
import { actions, assertChromeTransport, completeOnboarding, launchChrome, readRegion, recordChromeProcesses, setLocale, waitForWorkspace } from './runner.ts';
import { renderFixture } from './fixture.ts';
import { verifyPackageModules } from './package-modules.ts';

const here=path.dirname(fileURLToPath(import.meta.url));
export async function main() {
  const started=performance.now();
  const {options,positional}=parseArgs(process.argv.slice(2),['out','build-src','port','helper-port','state','checks','phase','chrome','dmg','version']);
  assert.equal(positional.length,0);assert.ok(options.out,'必须传 --out');
  const out=path.resolve(options.out);prepareOut(out);
  const {patterns,emailConfigured}=privatePatterns();
  const computerName=spawnSync('scutil',['--get','ComputerName'],{encoding:'utf8'});
  if(computerName.status===0&&computerName.stdout.trim())patterns.push({label:'computer_name',value:computerName.stdout.trim()});
  const save=(name:string,value:any)=>writeJson(path.join(out,name),filterEvidence(value,patterns),patterns);
  const build=path.resolve(options['build-src']||path.join(ROOT,'.build/src'));assertSafePath(build);
  const checksPath=path.resolve(options.checks||path.join(here,'checks/t17-t19.json'));
  const manifest=JSON.parse(fs.readFileSync(checksPath,'utf8'));
  const phase=options.phase||'all';assert.ok(['all','real','simulated'].includes(phase));
  const checks=manifest.checks.filter((item:any)=>phase==='all'||item.kind===phase);
  assert.ok(checks.length,'清单不能为空');
  validateVersion(options.version);
  if(checks.some((check:any)=>check.kind==='simulated')) {
    assert.ok(options.dmg,'模拟检查必须传 --dmg');assertSafePath(options.dmg);
  }
  const stateFile=path.resolve(options.state||path.join(out,'sandbox-state.json'));
  let state:any,context:any,profile:string|undefined,chromeProcesses:any[]=[];
  const rows:any[]=[],errors:string[]=[],loadedModules=new Set<string>();
  let moduleEvidence:any;
  let cleanup:any={passed:false};
  try {
    state=options.state?loadState(stateFile):await startSandbox(stateFile,build,Number(options.port),Number(options['helper-port']||Number(options.port)+1));
    assert.equal(expandPath(state.build_src),build,'状态的构建树与参数不同');
    save('runtime.json',{...state,base_dir_explicit:true,empty_sandbox:true,trace_file:'/dev/null'});
    const index=new ModuleIndex(build),shared=sharedSymbols(index);save('shared-modules.json',shared);
    profile=fs.mkdtempSync(path.join(os.tmpdir(),'t3zh-web-chrome-'));
    context=await launchChrome(build,profile,options.chrome||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
    assertChromeTransport(profile);
    chromeProcesses=recordChromeProcesses(profile);assert.ok(chromeProcesses.length,'Chrome PID 未记录');save('chrome-runtime.json',{profile,processes:chromeProcesses,headless:true,new_empty_profile:true,debugging_transport:'pipe'});
    const page=context.pages()[0]||await context.newPage();page.setDefaultTimeout(10000);page.setDefaultNavigationTimeout(20000);
    page.on('request',(req:any)=>{const url=new URL(req.url());if(url.origin===state.origin&&url.pathname.startsWith('/assets/')&&url.pathname.endsWith('.js'))loadedModules.add(path.basename(url.pathname));});
    const pairing=await (await fetch(state.helper_origin+'/pair')).json() as any;
    assert.ok(typeof pairing.credential==='string'&&pairing.credential,'配对凭据未就绪或已转交');
    patterns.push({label:'pairing',value:pairing.credential});
    await page.goto(state.origin+'/#token='+encodeURIComponent(pairing.credential));
    await page.waitForFunction(()=>(window as any).__t3zh);
    await completeOnboarding(page,shared);
    // 与 T19 相同：公开 client-settings API 完成首启门控，/welcome 另测。
    const project=path.join(expandPath(state.sandbox),manifest.dataset.directory);
    fs.mkdirSync(project);const substitutions={'$project':project};
    for(const locale of ['zh-CN','en']) {
      await setLocale(page,locale,state.origin);
      await waitForWorkspace(page,shared);
      if(locale==='zh-CN' && checks.some((check:any)=>check.kind==='real')) {
        await page.evaluate(()=>(window as any).__TSR_ROUTER__.navigate({to:'/'}));
        await waitForWorkspace(page,shared);
        try {await actions(page,manifest.dataset.actions,locale,substitutions);}
        catch(error) { save('dataset-failure.json',{error:String(error),...(await readRegion(page,'body'))});throw error; }
        await page.waitForURL(/\/draft\//,{timeout:10000});
        const database=path.join(expandPath(state.sandbox),'userdata/statev2.sqlite');assertSafePath(database);
        const data=await runCommand('sqlite3',['-readonly','-json',database,
          "SELECT project_id, title, workspace_root FROM projection_projects WHERE workspace_root = '"+project.replaceAll("'","''")+"' AND deleted_at IS NULL;"],path.join(out,'project-data.log'),patterns);
        const projects=JSON.parse(data.output);assert.equal(projects.length,1,'沙盒应恰有一个测试项目');
        assert.equal(projects[0].title,manifest.dataset.directory,'显示翻译不得改原始项目名');
        save('dataset.json',{kind:'own-sandbox-only',directory:project,projects,raw_title_unchanged:true,created_via:'public UI'});
      }
      for(const check of checks) {
        const stamp=performance.now();const failures:string[]=[];let capture:any={text:'',labels:[],inputs:[],buttons:[]};
        try {
          await page.keyboard.press('Escape');
          await page.goto(state.origin+'/settings/general');
          await page.waitForFunction(()=>(window as any).__t3zh);
          await waitForWorkspace(page,shared);
          await page.evaluate((to:string)=>(window as any).__TSR_ROUTER__.navigate({to}),check.path);
          await waitForWorkspace(page,shared);
          if(check.kind==='simulated') {
            const fixture=typeof check.fixture==='string'?manifest.fixtures[check.fixture]:check.fixture;
            assert.ok(fixture,'清单引用的 fixture 不存在');
            const fixtureEvidence=await renderFixture(page,index,shared,fixture);
            for(const entry of Object.values(fixtureEvidence.components) as any)loadedModules.add(entry.file);
            save(`fixture-${locale}-${check.name}.json`,fixtureEvidence);
          }
          await actions(page,check.actions||[],locale,substitutions);
          if(check.wait)await actions(page,[{type:'wait',target:check.wait}],locale,substitutions);
          const expected=JSON.parse(JSON.stringify(check.expected[locale]).replaceAll('$version',options.version||''));
          await page.waitForFunction(({required,regions}:any)=> {
            const roots=regions.flatMap((selector:string)=>[...document.querySelectorAll(selector)]) as HTMLElement[];
            const text=roots.map(root=>root.innerText+'\n'+[...root.querySelectorAll('[aria-label]')].map(el=>el.getAttribute('aria-label')).join('\n')).join('\n');
            return required.every((value:string)=>text.includes(value));
          },{required:expected.required||[],regions:[check.region||'body',...(check.extra_regions||[])]},{timeout:10000});
          capture=await readRegion(page,check.region||'body');
          for(const region of check.extra_regions||[]) {
            if(await page.locator(region).count()) {
              const extra=await readRegion(page,region);capture.text+='\n'+extra.text;capture.labels.push(...extra.labels);capture.inputs.push(...extra.inputs);capture.buttons.push(...extra.buttons);
            }
          }
          failures.push(...compareText(capture.text+'\n'+capture.labels.join('\n'),expected));
          if(expected.exact_text)failures.push(...compareText(capture.text,{exact:expected.exact_text}));
          for(const forbidden of check.forbidden_all||[])if(capture.text.includes(forbidden))failures.push('不应重复显示：'+forbidden);
          if(check.disabled)assert.ok(capture.buttons.some((button:any)=>button.disabled&&button.text===check.disabled[locale]),'清理按钮必须禁用');
          if(check.tab_order)assert.deepEqual(capture.buttons.map((b:any)=>b.text).filter((text:string)=>check.tab_order[locale].includes(text)),check.tab_order[locale],'标签顺序不符');
          if(check.expect_move)assert.deepEqual(await page.evaluate(()=>(window as any).__webCheckMoves),[check.expect_move],'真实拖动回调不符');
          if(check.layout) {
            capture.cards=await page.locator(check.region+' article').evaluateAll((cards:HTMLElement[])=>cards.map(card=> {
              const box=card.getBoundingClientRect();return {account:card.querySelector('h3')?.textContent,text:card.innerText,x:box.x,y:box.y,width:box.width};
            }));
            assert.deepEqual(capture.cards.map((card:any)=>card.account),check.layout.accounts,'账号卡片内容 / 顺序不符');
            assert.equal(new Set(capture.cards.map((card:any)=>Math.round(card.x))).size,check.layout.columns,'账号布局列数不符');
            for(const [account,readings] of Object.entries(check.layout.readings||{})) {
              const card=capture.cards.find((card:any)=>card.account===account);assert.ok(card);
              for(const reading of readings as string[])assert.ok(card.text.includes(reading),'账号自身窗口读数不符：'+account);
            }
          }
        } catch(error) {
          failures.push(String(error));
          try {capture=await readRegion(page,'body');}catch{}
        }
        const row={name:check.name,kind:check.kind,locale,lang:await page.locator('html').getAttribute('lang'),url:page.url(),...capture,
          passed:failures.length===0,failures,seconds:Number(((performance.now()-stamp)/1000).toFixed(3)),migration:check.migration};
        rows.push(row);save(`web-last-${locale}-${check.name}-${check.kind}.json`,row);
      }
    }
    await setLocale(page,'zh-CN',state.origin);
    const final=await page.evaluate(()=>({locale:(window as any).__t3zh.getLocale(),resolved:(window as any).__t3zh.getResolvedLocale(),lang:document.documentElement.lang}));
    assert.deepEqual(final,{locale:'zh-CN',resolved:'zh-CN',lang:'zh-CN'});save('web-last-locale-final.json',final);
    if(checks.some((check:any)=>check.kind==='simulated')) {
      assert.ok(options.dmg&&options.version,'模拟检查必须传 --dmg 和 --version');assertSafePath(options.dmg);
      try {moduleEvidence=await verifyPackageModules(path.resolve(options.dmg!),options.version,index.assets,[...loadedModules],out,patterns);}
      catch(error){moduleEvidence={passed:false,error:String(error),module_count:loadedModules.size};}
      save('web-last-final-module-hashes.json',moduleEvidence);
      for(const row of rows.filter(row=>row.kind==='simulated')) {
        row.module_evidence='web-last-final-module-hashes.json';
        if(!moduleEvidence.passed){row.passed=false;row.failures.push('加载模块与交付 DMG 资源比对失败');}
        save(`web-last-${row.locale}-${row.name}-${row.kind}.json`,row);
      }
    }
  } catch(error) {errors.push(String(error));}
  finally {
    if(profile)chromeProcesses=[...new Map([...chromeProcesses,...recordChromeProcesses(profile)].map(p=>[p.pid,p])).values()];
    try {await context?.close();}catch(error){errors.push('Chrome close: '+String(error));}
    try {
      for(const p of chromeProcesses)if(identity(p.pid)===p.started)signalOwned(p,'SIGTERM');
      const deadline=Date.now()+5000;
      while(chromeProcesses.some(p=>identity(p.pid)===p.started)&&Date.now()<deadline)await new Promise(resolve=>setTimeout(resolve,100));
      for(const p of chromeProcesses)if(identity(p.pid)===p.started)signalOwned(p,'SIGKILL');
      assert.ok(chromeProcesses.every(p=>identity(p.pid)!==p.started),'Chrome 记录进程仍存活');
      if(profile)fs.rmSync(profile,{recursive:true,force:true});
    }catch(error){errors.push('Chrome 清理失败：'+String(error));}
    try {
      const sandbox=fs.existsSync(stateFile)?await stopSandbox(stateFile):{passed:!state};
      cleanup={...sandbox,chrome_processes:chromeProcesses,chrome_processes_absent:chromeProcesses.every(p=>identity(p.pid)!==p.started),chrome_profile:profile,chrome_profile_removed:!profile||!fs.existsSync(profile)};
      cleanup.passed=cleanup.passed&&cleanup.chrome_processes_absent&&cleanup.chrome_profile_removed;
    }catch(error){errors.push('沙盒清理失败：'+String(error));}
    save('cleanup.json',cleanup);
    const passed=summaryPassed(rows)&&rows.length===checks.length*2&&errors.length===0&&cleanup.passed;
    save('web-check.json',{passed,phase,seconds:Number(((performance.now()-started)/1000).toFixed(3)),expected_results:checks.length*2,
      results:rows.map(({text,labels,inputs,buttons,...row})=>row),errors,email_configured:emailConfigured});
    const audit=auditOutputs(out,patterns);save('output-audit.json',audit);
    console.log('项目 | 中文 | English');
    for(const check of checks) console.log(redact(check.name+' | '+['zh-CN','en'].map(locale=>{
      const row=rows.find(row=>row.name===check.name&&row.locale===locale);return row?(row.passed?'PASS':'FAIL '+row.failures.map((value:string)=>value.split('\n')[0]).join('; ').slice(0,180)):'未执行';
    }).join(' | '),patterns));
    console.log(`total: ${passed&&audit.passed?'PASS':'FAIL'} ${rows.filter(row=>row.passed).length}/${checks.length*2} logs=${redact(out,patterns)}`);
    for(const error of errors.slice(0,3))console.error(filterEvidence(error.split('\n')[0]!,patterns));
    process.exitCode=passed&&audit.passed?0:1;
  }
}
main().catch(error=>{console.error(redact(String(error),privatePatterns().patterns));process.exitCode=1;});
