import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { parseArgs, ROOT } from '../lib/iteration-tooling.ts';
import { descendants, identity, owned, saveState, validPort, type SandboxState } from './sandbox-runtime.ts';

const { options } = parseArgs(process.argv.slice(2), ['state', 'port', 'helper-port', 'build-src']);
const stateFile = path.resolve(options.state!);
const port = validPort(options.port), helperPort = validPort(options['helper-port']);
const build = path.resolve(options['build-src']!);
const sandbox = fs.mkdtempSync(path.join(os.homedir(), '.t3-zh-test-web-'));
const marker = randomUUID(); fs.writeFileSync(path.join(sandbox, '.web-check-marker'), marker);
let credential: string | undefined;
const state: SandboxState = { schema: 1, sandbox, marker, build_src: build,
  origin: `http://127.0.0.1:${port}`, helper_origin: `http://127.0.0.1:${helperPort}`,
  processes: [owned(process.pid, 'helper')], ready: false };
saveState(stateFile, state);
const server = spawn(process.execPath, [path.join(build, 'apps/server/dist/bin.mjs'), 'serve',
  '--host', '127.0.0.1', '--port', String(port), '--base-dir', sandbox, '--no-browser'], {
  cwd: sandbox, env: { ...process.env, T3CODE_HOME: sandbox, T3CODE_DISABLE_AUTO_UPDATE: '1',
    T3CODE_TRACE_FILE: '/dev/null', T3CODE_TRACE_MIN_LEVEL: 'None' }, stdio: ['ignore', 'pipe', 'pipe'],
});
assert.ok(server.pid); state.processes.push(owned(server.pid, 'server')); saveState(stateFile, state);
let pending = '';
// 丢弃原始启动输出（含二维码、URL 和配对 token），只在内存抽出 token。
server.stdout.on('data', chunk => {
  pending += chunk.toString();
  const lines = pending.split(/\r?\n/); pending = lines.pop()!.slice(-16384);
  for (const line of lines) if (line.startsWith('Token: ')) credential = line.slice(7).trim();
});
server.stderr.resume();
server.on('error', () => process.send?.({ error: '最终 server 启动失败' }));
server.on('exit', code => {
  if (!state.ready) process.send?.({ error: `最终 server 提前退出 (${code})` });
  state.ready=false;saveState(stateFile,state);
});
const helper = http.createServer((req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  // 只对 Node runner 转交一次，不启用浏览器 CORS，也不记录请求。
  if (req.method === 'GET' && req.url === '/pair' && credential) {
    const value = credential; credential = undefined;
    res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ credential: value })); return;
  }
  res.writeHead(404); res.end();
});
await new Promise<void>((resolve, reject) => { helper.once('error', reject); helper.listen(helperPort, '127.0.0.1', resolve); });
let shuttingDown = false;
function rememberChildren() {
  if(identity(server.pid!)!==state.processes.find(p=>p.role==='server')!.started) {
    state.ready=false;saveState(stateFile,state);return;
  }
  for (const pid of descendants(server.pid!)) if (!state.processes.some(p => p.pid === pid)) {
    if (identity(pid)) state.processes.push(owned(pid, 'server-child'));
  }
  saveState(stateFile, state);
}
const timer = setInterval(rememberChildren, 1000);
const shutdown = () => {
  if (shuttingDown) return; shuttingDown = true; clearInterval(timer); credential = undefined;
  helper.close();
  for (const p of [...state.processes].reverse()) if (p.pid !== process.pid && identity(p.pid) === p.started) {
    try { process.kill(p.pid, 'SIGTERM'); } catch {}
  }
  process.exit(0);
};
process.on('SIGTERM', shutdown); process.on('SIGINT', shutdown);
const deadline = Date.now() + 30000;
while (Date.now() < deadline) {
  if (credential) {
    try {
      const response = await fetch(state.origin + '/.well-known/t3/environment', { signal: AbortSignal.timeout(1000) });
      if (response.ok) { state.ready = true; rememberChildren(); process.send?.({ ready: true }); break; }
    } catch {}
  }
  await new Promise(resolve => setTimeout(resolve, 100));
}
if (!state.ready) { process.send?.({ error: '最终 server 30 秒内未就绪' }); shutdown(); }
process.disconnect?.();
