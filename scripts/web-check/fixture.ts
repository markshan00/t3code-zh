import assert from 'node:assert/strict';
import { type ModuleIndex, componentDefinitions, type ModuleSymbol } from './modules.ts';

export function fixtureSymbols(index:ModuleIndex, names:string[]) {
  return Object.fromEntries(names.map(name=> {
    const definition=componentDefinitions[name];assert.ok(definition,'未登记的组件：'+name);
    return [name,index.symbol(definition.source,definition.symbol,definition.features)];
  }));
}
export async function renderFixture(page:any,index:ModuleIndex,shared:any,fixture:any) {
  const components=fixtureSymbols(index,fixture.modules);
  const rewrites=index.rewrite(Object.values(components),new URL(page.url()).origin);
  await page.evaluate(async ({components,rewrites,shared,fixture}:any)=> {
    const reactModule=await import('/assets/'+shared.react.file);
    const domModule=await import('/assets/'+shared.reactDom.file);
    const R=reactModule[shared.react.exported](),D=domModule[shared.reactDom.exported]();
    const registryModule=await import('/assets/'+shared.registry.file),routerModule=await import('/assets/'+shared.router.file);
    const C:Record<string,any>={};const urls:string[]=[];
    for(const row of rewrites) {
      const url=URL.createObjectURL(new Blob([row.source],{type:'text/javascript'}));urls.push(url);
      const imported=await import(url);
      for(const [key,entry] of Object.entries(components) as any)if(entry.file===row.file)C[key]=imported['WebCheck_'+entry.name];
    }
    const noop=()=>{};
    if(fixture.desktopBridge)(window as any).desktopBridge={onMenuAction:()=>noop,cliCommand:{getState:async()=>({supported:true,installedPath:null,shadowedBy:null,onPath:false})},
      ...fixture.desktopBridge};
    function Fixture() {
      const [state,setState]=R.useState(fixture.state||{});
      const resolve=(value:any):any=> {
        if(Array.isArray(value))return value.map(resolve);
        if(!value||typeof value!=='object')return value;
        if(value.$noop)return noop;
        if(value.$set)return new Set(resolve(value.$set));
        if(value.$map)return new Map(resolve(value.$map));
        if(value.$t)return (window as any).__t3zh.t(resolve(value.$t));
        if(value.$state)return state[value.$state];
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
        if(node.call)return C[node.call](...resolve(node.args));
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
    const div=document.createElement('div');div.id='web-check-fixture';
    div.style.cssText='position:fixed;inset:0;z-index:40;background:var(--background);overflow:auto;padding:24px';document.body.append(div);
    const root=D.createRoot(div);
    root.render(R.createElement(Boundary,null,R.createElement(routerModule[shared.router.exported].Provider,{value:(window as any).__TSR_ROUTER__},
      R.createElement(registryModule[shared.registry.exported],null,R.createElement(Fixture)))));
    (window as any).__webCheckFixture={root,urls,syntheticProps:true,onlyImportRebasingAndExtraExports:true};
  },{components,rewrites,shared,fixture});
  await page.locator('[data-web-check-root], [data-web-check-error]').waitFor();
  assert.equal(await page.locator('[data-web-check-error]').count(),0,'最终组件渲染失败');
  return {components,rewrites:rewrites.map(row=>({file:row.file,symbols:row.symbols})),synthetic_props:true,
    only_relative_imports_rebased_and_exports_appended:true};
}
