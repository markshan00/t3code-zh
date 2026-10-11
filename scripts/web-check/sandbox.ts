import assert from 'node:assert/strict';
import { fork } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertSafePath, parseArgs, privatePatterns, redact, ROOT } from '../lib/iteration-tooling.ts';
import { identity, loadState, portFree, stopSandbox, validPort } from './sandbox-runtime.ts';

export async function startSandbox(stateFile: string, build: string, port: number, helperPort: number) {
  validPort(String(port));validPort(String(helperPort));
  assertSafePath(stateFile, true); assertSafePath(build);
  assert.ok(!fs.existsSync(stateFile), '状态文件已存在，请先 status / stop');
  assert.notEqual(port, helperPort, '两个端口不能相同');
  for (const p of [port, helperPort]) assert.ok(await portFree(p), '端口已被占用，拒绝启动');
  assert.ok(fs.existsSync(path.join(build, 'apps/server/dist/bin.mjs')), '最终 server 不存在');
  fs.mkdirSync(path.dirname(stateFile), { recursive: true });
  const worker = fork(fileURLToPath(new URL('./sandbox-worker.ts', import.meta.url)), [
    '--state', stateFile, '--port', String(port), '--helper-port', String(helperPort), '--build-src', build,
  ], { detached: true, stdio: ['ignore', 'ignore', 'ignore', 'ipc'] });
  try {
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('沙盒启动超时')), 35000);
      worker.on('message', (message: any) => {
        clearTimeout(timer); message.ready ? resolve() : reject(new Error(message.error || '沙盒启动失败'));
      });
      worker.on('exit', code => { clearTimeout(timer); reject(new Error(`沙盒 helper 退出 (${code})`)); });
      worker.on('error', error => { clearTimeout(timer); reject(error); });
    });
    worker.unref(); return loadState(stateFile);
  } catch (error) {
    if (fs.existsSync(stateFile)) await stopSandbox(stateFile);
    else if (worker.pid) process.kill(worker.pid, 'SIGTERM');
    throw error;
  }
}
async function main() {
  const { options, positional } = parseArgs(process.argv.slice(2), ['state', 'port', 'helper-port', 'build-src']);
  assert.equal(positional.length, 1, '用法：sandbox.ts start|stop|status --state <文件>');
  assert.ok(options.state, '必须传 --state'); const file = path.resolve(options.state);
  if (positional[0] === 'start') {
    const port = validPort(options.port), helperPort = validPort(options['helper-port']);
    const state = await startSandbox(file, path.resolve(options['build-src'] || path.join(ROOT, '.build/src')), port, helperPort);
    console.log(`sandbox: PASS ${state.origin} server/helper=${state.processes.map(p => p.pid).join(',')}`);
  } else if (positional[0] === 'stop') {
    const result = await stopSandbox(file); console.log(`sandbox-stop: PASS pids=${result.processes.length} ports-free=true directories-removed=true`);
  } else if (positional[0] === 'status') {
    if (!fs.existsSync(file)) { console.log('sandbox: STOPPED state-absent'); return; }
    const state = loadState(file);
    console.log(`sandbox: ${state.ready ? 'READY' : 'STARTING'} ${state.origin} live=${state.processes.filter(p=>identity(p.pid)===p.started).length}/${state.processes.length}`);
  } else throw new Error('未知沙盒命令');
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(redact(String(error), privatePatterns().patterns)); process.exitCode = 1; });
}
