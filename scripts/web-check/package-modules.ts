import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import * as asar from '@electron/asar';
import { findApp, MountCleanupError, runCommand, sha256, withMount, type PrivatePattern } from '../lib/iteration-tooling.ts';

export function moduleHashes(file:string,built:Buffer|null,packed:Buffer|null) {
  return {file,resource:'apps/server/dist/client/assets/'+file,bytes:built?.length??null,
    sha256:built?sha256(built):null,dmg_sha256:packed?sha256(packed):null,
    matches_dmg:!!built&&!!packed&&built.equals(packed),
    ...(!built||!packed?{error:'构建或 DMG 对应资源缺失 / 不可读取'}:{}),
  };
}

export async function verifyPackageModules(dmg:string,version:string,assets:string,files:string[],out:string,patterns:PrivatePattern[]) {
  const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'t3zh-web-package-'));
  let preserve=false;
  try {
    return await withMount(dmg,path.join(temporary,'mount'),true,out,patterns,async mount=> {
      const app=findApp(mount), archive=path.join(app,'Contents/Resources/app.asar');
      const plist=await runCommand('plutil',['-extract','CFBundleShortVersionString','raw','-o','-',path.join(app,'Contents/Info.plist')],path.join(out,'dmg-version.log'),patterns);
      const rows=files.sort().map(file=> {
        const relative='apps/server/dist/client/assets/'+file;
        try {
          const built=fs.readFileSync(path.join(assets,file)),packed=asar.extractFile(archive,relative);
          return moduleHashes(file,built,packed);
        } catch {return moduleHashes(file,null,null);}
      });
      return {passed:plist.output.trim()===version&&rows.length>0&&rows.every(row=>row.matches_dmg),dmg,version,
        actual_version:plist.output.trim(),module_count:rows.length,modules:rows};
    });
  } catch(error) {preserve=error instanceof MountCleanupError;throw error;}
  finally {if(!preserve)fs.rmSync(temporary,{recursive:true,force:true});}
}
