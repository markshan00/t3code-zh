import assert from 'node:assert/strict';
import { type ModuleIndex, componentDefinitions } from './modules.ts';

export function fixtureSymbols(index:ModuleIndex, names:string[]) {
  return Object.fromEntries(names.map(name=> {
    const definition=componentDefinitions[name];assert.ok(definition,'未登记的组件：'+name);
    return [name,index.symbol(definition.source,definition.symbol,definition.features)];
  }));
}
// Keep each module's original URL and module-cache identity. A helper or component
// may move into the application entry chunk; importing a blob copy would execute
// that entry again, recreate the router and erase the fixture through navigation.
export async function prepareFixtureModules(page:any,index:ModuleIndex,fixtures:any[],origin:string) {
  const names=[...new Set(fixtures.flatMap(fixture=>fixture.modules))] as string[];
  const components=fixtureSymbols(index,names);
  const rewrites=index.rewrite(Object.values(components),origin);
  for(const row of rewrites) {
    await page.route(origin+'/assets/'+row.file,(route:any)=>route.fulfill({
      status:200,contentType:'application/javascript',body:row.source,
    }));
  }
  return {components,rewrites};
}
export async function renderFixture(page:any,prepared:Awaited<ReturnType<typeof prepareFixtureModules>>,shared:any,fixture:any) {
  const components=Object.fromEntries(fixture.modules.map((name:string)=>[name,prepared.components[name]]));
  const files=new Set(Object.values(components).map((entry:any)=>entry.file));
  const rewrites=prepared.rewrites.filter(row=>files.has(row.file));
  await page.evaluate(async ({components,shared,fixture}:any)=> {
    const reactModule=await import('/assets/'+shared.react.file);
    const domModule=await import('/assets/'+shared.reactDom.file);
    const R=reactModule[shared.react.exported](),D=domModule[shared.reactDom.exported]();
    const registryModule=await import('/assets/'+shared.registry.file),routerModule=await import('/assets/'+shared.router.file);
    const C:Record<string,any>={};
    for(const [key,entry] of Object.entries(components) as any) {
      const imported=await import('/assets/'+entry.file);
      C[key]=imported['WebCheck_'+entry.name];
    }
    const noop=()=>{};
    if(fixture.desktopBridge)(window as any).desktopBridge={onMenuAction:()=>noop,cliCommand:{getState:async()=>({supported:true,installedPath:null,shadowedBy:null,onPath:false})},
      ...fixture.desktopBridge};
    function Fixture() {
      const [state,setState]=R.useState(fixture.state||{});
      (window as any).__webCheckSetState=setState;
      const resolve=(value:any):any=> {
        if(Array.isArray(value))return value.map(resolve);
        if(!value||typeof value!=='object')return value;
        if(value.$noop)return noop;
        if(value.$set)return new Set(resolve(value.$set));
        if(value.$map)return new Map(resolve(value.$map));
        if(value.$t)return (window as any).__t3zh.t(resolve(value.$t));
        if(value.$state)return resolve(state[value.$state]);
        if(value.$element)return element(value.$element);
        if(value.$handler==='moveSurface')return (id:string,to:number)=> {
          (window as any).__webCheckMoves.push({id,to});setState((current:any)=> {
            const surfaces=[...current.surfaces],from=surfaces.findIndex((surface:any)=>surface.id===id);
            surfaces.splice(to,0,surfaces.splice(from,1)[0]);return {...current,surfaces};
          });
        };
        return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,resolve(item)]));
      };
      const element=(node:any):any=> {
        if(node===null||typeof node!=='object')return node;
        if(node.$t)return resolve(node);
        if(node.call) {
          const args=resolve(node.args);
          const before=node.assert_unchanged_args?JSON.stringify(args):undefined;
          const result=C[node.call](...args);
          if(before!==undefined) {
            if(JSON.stringify(args)!==before)throw new Error('Fixture helper mutated arguments: '+node.call);
            (window as any).__webCheckCalls.push({name:node.call,args:JSON.parse(before),result,arguments_unchanged:true});
          }
          return node.select?result[node.select]:result;
        }
        if(node.provider)return R.createElement(C[node.provider].Provider,{value:resolve(node.value)},...node.children.map(element));
        const component=C[node.component]||node.component;
        return R.createElement(component,resolve(node.props||{}),...(node.children||[]).map(element));
      };
      return R.createElement('div',{'data-web-check-root':true,style:{maxWidth:950,margin:'auto',...(fixture.style||{})}},...fixture.tree.map(element));
    }
    class Boundary extends R.Component {
      state={error:null};
      static getDerivedStateFromError(error:any){return {error:error.message};}
      render(){return this.state.error?R.createElement('pre',{'data-web-check-error':true},this.state.error):this.props.children;}
    }
    (window as any).__webCheckMoves=[];
    (window as any).__webCheckCalls=[];
    const div=document.createElement('div');div.id='web-check-fixture';
    div.style.cssText='position:fixed;inset:0;z-index:40;background:var(--background);overflow:auto;padding:24px';document.body.append(div);
    const root=D.createRoot(div);
    root.render(R.createElement(Boundary,null,R.createElement(routerModule[shared.router.exported].Provider,{value:(window as any).__TSR_ROUTER__},
      R.createElement(registryModule[shared.registry.exported],null,R.createElement(Fixture)))));
    (window as any).__webCheckFixture={root,syntheticProps:true,onlyImportRebasingAndExtraExports:true};
  },{components,shared,fixture});
  // Portal-only fixtures can leave the wrapper empty while their dialog is visible.
  await page.locator('[data-web-check-root], [data-web-check-error]').waitFor({state:'attached'});
  assert.equal(await page.locator('[data-web-check-error]').count(),0,'最终组件渲染失败');
  return {components,rewrites:rewrites.map(row=>({file:row.file,symbols:row.symbols})),synthetic_props:true,original_module_urls:true,
    checked_calls:await page.evaluate(()=>(window as any).__webCheckCalls),
    only_relative_imports_rebased_and_exports_appended:true};
}
