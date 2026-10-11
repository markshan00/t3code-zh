import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { assertSafePath, privatePatterns, writeJson } from '../lib/iteration-tooling.ts';

export type OwnedProcess = { pid: number; started: string; role: string };
export type SandboxState = {
  schema: 1; sandbox: string; build_src: string; origin: string; helper_origin: string;
  processes: OwnedProcess[]; ready: boolean; marker: string;
};
export const expandPath = (value: string) => path.resolve(value.startsWith('~/') ? path.join(os.homedir(), value.slice(2)) : value);
export function identity(pid: number): string | null {
  const r = spawnSync('ps', ['-p', String(pid), '-o', 'lstart='], { encoding: 'utf8' });
  return r.status === 0 ? r.stdout.trim() || null : null;
}
export function owned(pid: number, role: string): OwnedProcess {
  const started = identity(pid); assert.ok(started, '新进程身份不可读');
  return { pid, role, started };
}
export function signalOwned(p:OwnedProcess,signal:NodeJS.Signals) {
  const current=identity(p.pid);if(!current)return false;
  assert.equal(current,p.started,'PID 已复用，拒绝终止');
  try {process.kill(p.pid,signal);return true;}catch(error){if((error as NodeJS.ErrnoException).code==='ESRCH')return false;throw error;}
}
export function descendants(parent: number): number[] {
  const r = spawnSync('ps', ['-axo', 'pid=,ppid='], { encoding: 'utf8' });
  assert.equal(r.status, 0, '进程树读取失败');
  const rows = r.stdout.trim().split('\n').map(line => line.trim().split(/\s+/).map(Number));
  const result: number[] = [];
  const visit = (pid: number) => { for (const [child, ppid] of rows) if (ppid === pid) { result.push(child!); visit(child!); } };
  visit(parent); return result;
}
export async function portFree(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const socket = net.createServer();
    socket.once('error', () => resolve(false));
    socket.listen(port, '127.0.0.1', () => socket.close(() => resolve(true)));
  });
}
export function validPort(value: string | undefined): number {
  const port = Number(value); assert.ok(Number.isInteger(port) && port > 1024 && port < 65536, '端口需为 1025–65535'); return port;
}
export function saveState(file: string, state: SandboxState) {
  const temporary=file+'.tmp';
  writeJson(temporary, state, privatePatterns().patterns);
  fs.chmodSync(temporary, 0o600);fs.renameSync(temporary,file);
}
export function loadState(file: string): SandboxState {
  assertSafePath(file, true);
  const state = JSON.parse(fs.readFileSync(file, 'utf8')) as SandboxState;
  assert.equal(state.schema, 1, '无效状态文件');
  const sandbox = expandPath(state.sandbox);
  assert.equal(path.dirname(sandbox), os.homedir(), '沙盒必须位于 HOME');
  assert.ok(path.basename(sandbox).startsWith('.t3-zh-test-web-'), '拒绝删除非网页沙盒');
  assert.ok(state.processes.every(p => Number.isInteger(p.pid) && p.pid > 1 && p.started && p.role), '无效 PID 记录');
  for (const key of ['origin', 'helper_origin'] as const) {
    const url = new URL(state[key]); assert.equal(url.hostname, '127.0.0.1'); assert.equal(url.protocol, 'http:');
  }
  if (fs.existsSync(sandbox)) {
    assert.ok(!fs.lstatSync(sandbox).isSymbolicLink(), '沙盒不能是链接');
    assert.equal(fs.readFileSync(path.join(sandbox, '.web-check-marker'), 'utf8'), state.marker, '沙盒归属标记不符');
  }
  return state;
}
export async function stopSandbox(file: string) {
  const state = loadState(file);
  const signalled: number[] = [];
  for (const p of [...state.processes].reverse()) {
    if(signalOwned(p,'SIGTERM'))signalled.push(p.pid);
  }
  const deadline = Date.now() + 10000;
  while (state.processes.some(p => identity(p.pid) === p.started) && Date.now() < deadline) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  for (const p of state.processes) if (identity(p.pid) === p.started) { signalOwned(p,'SIGKILL'); }
  await new Promise(resolve => setTimeout(resolve, 200));
  assert.ok(state.processes.every(p => identity(p.pid) !== p.started), '记录进程仍在运行');
  const ports = [state.origin, state.helper_origin].map(url => Number(new URL(url).port));
  for (const port of ports) assert.ok(await portFree(port), '沙盒端口仍被监听');
  const sandbox = expandPath(state.sandbox);
  fs.rmSync(sandbox, { recursive: true, force: true });
  fs.rmSync(file);
  return { passed: true, processes: state.processes, signalled, ports, ports_free: true,
    sandbox_removed: !fs.existsSync(sandbox), state_removed: !fs.existsSync(file) };
}
