import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { descendants, owned, identity } from './sandbox-runtime.ts';
import { type ModuleIndex, type ModuleSymbol } from './modules.ts';

export async function launchChrome(build: string, profile: string, executablePath: string) {
  const require=createRequire(path.join(build,'apps/server/package.json'));
  let chromium;
  try { chromium=require('playwright-core').chromium; } catch { throw new Error('STOP: 构建树内找不到 playwright-core，按说明书先停下来问'); }
  try {
    return await chromium.launchPersistentContext(profile,{executablePath,headless:true,viewport:{width:1280,height:900},timeout:20000});
  } catch { throw new Error('STOP: playwright-core 驱动本机 Chrome 失败，按说明书先停下来问'); }
}
export async function importPublic(page: any, entry: ModuleSymbol) {
  return page.evaluate(async (entry:any)=> {
    const module=await import('/assets/'+entry.file);return Object.keys(module).includes(entry.exported);
  },entry);
}
export async function completeOnboarding(page: any, shared: any) {
  await page.evaluate(async ({hydrate,persist}:any)=> {
    const h=await import('/assets/'+hydrate.file),p=await import('/assets/'+persist.file);
    await h[hydrate.exported]();
    await p[persist.exported]((current:any)=>({...current,onboardingCompletedAt:new Date().toISOString()}));
  }, shared);
  await waitForWorkspace(page,shared);
}
export async function waitForWorkspace(page:any,shared:any) {
  await page.waitForFunction(async ({atomRegistry,welcome,presentations}:any)=> {
    const r=await import('/assets/'+atomRegistry.file),w=await import('/assets/'+welcome.file),p=await import('/assets/'+presentations.file);
    const registry=r[atomRegistry.exported];
    return registry.get(w[welcome.exported])!==null && [...registry.get(p[presentations.exported].presentationsAtom).values()].some((value:any)=>value.connection.phase==='connected');
  },shared,{timeout:20000});
  // Atom 到 React DOM 的发布在下一帧完成；等两帧再使用依赖连接状态的菜单。
  await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));
}
export async function setLocale(page:any, locale:string, origin:string) {
  await page.evaluate((locale:string)=>localStorage.setItem('t3code-zh.locale',locale),locale);
  await page.goto(origin+'/settings/general');
  await page.waitForFunction((locale:string)=>(window as any).__t3zh?.getResolvedLocale()===locale && document.documentElement.lang===locale,locale);
}
export async function readRegion(page:any, selector:string) {
  return page.locator(selector).evaluate((root:HTMLElement)=>({
    text:root.innerText,
    labels:[...root.querySelectorAll('[aria-label]')].map(el=>el.getAttribute('aria-label')),
    inputs:[...root.querySelectorAll('input')].map((el:HTMLInputElement)=>({placeholder:el.placeholder,value:el.value})),
    buttons:[...root.querySelectorAll('button')].map((el:HTMLButtonElement)=>({text:el.innerText,aria:el.getAttribute('aria-label'),disabled:el.disabled})),
  }));
}
export function locator(page:any, target:any, locale:string) {
  if(target.selector)return page.locator(target.selector);
  const name=typeof target.name==='string'?target.name:target.name[locale];
  return target.role?page.getByRole(target.role,{name,exact:target.exact!==false}):page.getByText(name,{exact:target.exact!==false});
}
export async function actions(page:any, rows:any[], locale:string, substitutions:Record<string,string>) {
  for(const row of rows) {
    if(row.type==='escape'){await page.keyboard.press('Escape');continue;}
    const target=locator(page,row.target,locale); const selected=row.first?target.first():target;
    if(row.type==='click')await selected.click();
    else if(row.type==='fill')await selected.fill(typeof row.value==='string'?substitutions[row.value]??row.value:row.value[locale]);
    else if(row.type==='select')await selected.selectOption(row.value);
    else if(row.type==='wait')await selected.waitFor({state:'visible'});
    else if(row.type==='drag') {
      const to=locator(page,row.to,locale); const fromBox=await selected.boundingBox(),toBox=await to.boundingBox();
      assert.ok(fromBox&&toBox,'拖动目标不可见');
      await page.mouse.move(fromBox.x+fromBox.width/2,fromBox.y+fromBox.height/2);await page.mouse.down();
      await page.mouse.move(fromBox.x+fromBox.width/2+12,fromBox.y+fromBox.height/2,{steps:5});
      await page.mouse.move(toBox.x+toBox.width/2,toBox.y+toBox.height/2,{steps:20});await page.mouse.up();
    } else throw new Error('未知动作：'+row.type);
  }
}
export function recordChromeProcesses(profile:string) {
  const all=descendants(process.pid);
  const roots=all.filter(pid=>spawnSync('ps',['-p',String(pid),'-o','command='],{encoding:'utf8'}).stdout.includes('--user-data-dir='+profile));
  return [...new Set(roots.flatMap(pid=>[pid,...descendants(pid)]))].filter(pid=>identity(pid)).map(pid=>owned(pid,'chrome'));
}
export function assertChromeTransport(profile:string) {
  const commands=descendants(process.pid).map(pid=>spawnSync('ps',['-p',String(pid),'-o','command='],{encoding:'utf8'}).stdout)
    .filter(command=>command.includes('--user-data-dir='+profile));
  assert.ok(commands.some(command=>command.includes('--remote-debugging-pipe')),'Chrome 必须使用调试 pipe');
  assert.ok(commands.every(command=>!command.includes('--remote-debugging-port')),'Chrome 不得开放调试端口');
}
