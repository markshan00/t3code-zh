import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { loadRepoEnv } from "../../upstream/scripts/lib/public-config.ts";
import { CONNECT_KEYS, checkT3ConnectSource, prepareT3ConnectConfig } from "./t3-connect-config.ts";

const root = fileURLToPath(new URL("../../", import.meta.url));
function fixture(t: test.TestContext): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "t3zh-connect-config-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.copyFileSync(path.join(root, "upstream/.env.example"), path.join(dir, ".env.example"));
  fs.mkdirSync(path.join(dir, "scripts/lib"), { recursive: true });
  fs.copyFileSync(path.join(root, "upstream/scripts/lib/public-config.ts"), path.join(dir, "scripts/lib/public-config.ts"));
  return dir;
}

test("clean source builds lose Connect until the build prepares .env; upstream loader exposes every client alias afterwards", async (t) => {
  const dir = fixture(t);
  assert.equal(loadRepoEnv({ baseEnv: {}, repoRoot: dir }).T3CODE_CLERK_PUBLISHABLE_KEY, undefined);
  prepareT3ConnectConfig(dir);
  await checkT3ConnectSource(dir, {});
  const env = loadRepoEnv({ baseEnv: {}, repoRoot: dir });
  for (const key of CONNECT_KEYS) assert.ok(env[key]);
  assert.equal(env.VITE_CLERK_PUBLISHABLE_KEY, env.T3CODE_CLERK_PUBLISHABLE_KEY);
  assert.equal(env.VITE_CLERK_JWT_TEMPLATE, env.T3CODE_CLERK_JWT_TEMPLATE);
  assert.equal(env.VITE_CLERK_CLI_OAUTH_CLIENT_ID, env.T3CODE_CLERK_CLI_OAUTH_CLIENT_ID);
  assert.equal(env.VITE_T3CODE_RELAY_URL, env.T3CODE_RELAY_URL);
  assert.equal(env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY, env.T3CODE_CLERK_PUBLISHABLE_KEY);
});

test("preparation copies only public identifiers and ignores optional telemetry and server secrets", async (t) => {
  const dir = fixture(t);
  fs.appendFileSync(path.join(dir, ".env.example"), "\nT3CODE_MOBILE_OTLP_TRACES_TOKEN=test-telemetry\nCLERK_SECRET_KEY=test-private\n");
  prepareT3ConnectConfig(dir);
  await checkT3ConnectSource(dir, {});
  const text = fs.readFileSync(path.join(dir, ".env"), "utf8");
  assert.ok(!text.includes("test-telemetry"));
  assert.ok(!text.includes("test-private"));
  assert.equal(fs.statSync(path.join(dir, ".env")).mode & 0o777, 0o600);
});

test("missing required identifiers fail before replacing an existing build env", (t) => {
  const dir = fixture(t);
  const example = path.join(dir, ".env.example");
  fs.writeFileSync(example, fs.readFileSync(example, "utf8").replace(/^T3CODE_CLERK_CLI_OAUTH_CLIENT_ID=.*$/m, ""));
  fs.writeFileSync(path.join(dir, ".env"), "sentinel\n");
  assert.throws(() => prepareT3ConnectConfig(dir), /T3CODE_CLERK_CLI_OAUTH_CLIENT_ID/);
  assert.equal(fs.readFileSync(path.join(dir, ".env"), "utf8"), "sentinel\n");
});

test("a secret key cannot replace the Clerk publishable key", (t) => {
  const dir = fixture(t);
  const example = path.join(dir, ".env.example");
  fs.writeFileSync(example, fs.readFileSync(example, "utf8").replace(/^T3CODE_CLERK_PUBLISHABLE_KEY=.*$/m, "T3CODE_CLERK_PUBLISHABLE_KEY=sk_test_wrong"));
  assert.throws(() => prepareT3ConnectConfig(dir), /publishable key/);
  assert.ok(!fs.existsSync(path.join(dir, ".env")));
});

test("an insecure relay cannot be baked into a release", (t) => {
  const dir = fixture(t);
  const example = path.join(dir, ".env.example");
  fs.writeFileSync(example, fs.readFileSync(example, "utf8").replace("https://relay.t3.codes", "http://relay.t3.codes"));
  assert.throws(() => prepareT3ConnectConfig(dir), /HTTPS/);
});

test("ambient Vite aliases cannot silently redirect the release to a different account", async (t) => {
  const dir = fixture(t);
  prepareT3ConnectConfig(dir);
  await assert.rejects(checkT3ConnectSource(dir, { VITE_CLERK_PUBLISHABLE_KEY: "pk_live_different" }), /build override/);
});

test("a local env overlay cannot silently redirect the release relay", async (t) => {
  const dir = fixture(t);
  prepareT3ConnectConfig(dir);
  fs.writeFileSync(path.join(dir, ".env.local"), "T3CODE_RELAY_URL=https://other.example.test\n");
  await assert.rejects(checkT3ConnectSource(dir, {}), /T3CODE_RELAY_URL/);
});

test("build env contamination is rejected instead of packaged", async (t) => {
  const dir = fixture(t);
  prepareT3ConnectConfig(dir);
  fs.appendFileSync(path.join(dir, ".env"), "CLERK_SECRET_KEY=test-private\n");
  await assert.rejects(checkT3ConnectSource(dir, {}), /only public/);
});
