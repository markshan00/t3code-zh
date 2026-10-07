import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parseEnv } from "node:util";

// Official source builds use these four public identifiers. Do not copy optional
// telemetry settings or server-side secrets from an environment file.
export const CONNECT_KEYS = [
  "T3CODE_CLERK_PUBLISHABLE_KEY",
  "T3CODE_CLERK_JWT_TEMPLATE",
  "T3CODE_CLERK_CLI_OAUTH_CLIENT_ID",
  "T3CODE_RELAY_URL",
] as const;

export function readT3ConnectConfig(exampleFile: string): Record<string, string> {
  const parsed = parseEnv(fs.readFileSync(exampleFile, "utf8"));
  const config: Record<string, string> = {};
  for (const key of CONNECT_KEYS) {
    const value = parsed[key]?.trim();
    if (!value || /[\r\n]/.test(value)) throw new Error(`T3 Connect public config missing or invalid: ${key}`);
    if (key !== "T3CODE_RELAY_URL" && !/^[A-Za-z0-9_-]+$/.test(value)) {
      throw new Error(`Invalid public identifier: ${key}`);
    }
    config[key] = value;
  }
  if (!config.T3CODE_CLERK_PUBLISHABLE_KEY.startsWith("pk_live_")) {
    throw new Error("Expected the upstream production Clerk publishable key");
  }
  const relay = new URL(config.T3CODE_RELAY_URL);
  if (relay.protocol !== "https:" || relay.username || relay.password || relay.search || relay.hash) {
    throw new Error("Expected an HTTPS relay URL without credentials, query, or fragment");
  }
  return config;
}

export function prepareT3ConnectConfig(sourceRoot: string): void {
  const config = readT3ConnectConfig(path.join(sourceRoot, ".env.example"));
  fs.writeFileSync(
    path.join(sourceRoot, ".env"),
    CONNECT_KEYS.map((key) => `${key}=${config[key]}`).join("\n") + "\n",
    { mode: 0o600 },
  );
}

export async function checkT3ConnectSource(sourceRoot: string, baseEnv = process.env): Promise<void> {
  const expected = readT3ConnectConfig(path.join(sourceRoot, ".env.example"));
  const actual = parseEnv(fs.readFileSync(path.join(sourceRoot, ".env"), "utf8"));
  assert.deepEqual(Object.keys(actual).sort(), [...CONNECT_KEYS].sort(), "Build .env must contain only public T3 Connect identifiers");
  for (const key of CONNECT_KEYS) {
    if (actual[key] !== expected[key]) throw new Error(`Build .env differs from upstream: ${key}`);
  }
  const { loadRepoEnv } = await import(pathToFileURL(path.join(sourceRoot, "scripts/lib/public-config.ts")).href);
  const effective = loadRepoEnv({ baseEnv, repoRoot: sourceRoot });
  for (const key of CONNECT_KEYS) {
    if (effective[key] !== expected[key]) throw new Error(`T3 Connect build override differs from upstream: ${key}`);
  }
}

export function checkT3ConnectArtifacts(sourceRoot: string): void {
  const config = readT3ConnectConfig(path.join(sourceRoot, ".env.example"));
  const readJs = (directory: string, excludeDirectory?: string): string => fs.readdirSync(directory, { recursive: true })
    .filter((name) => name.split(path.sep)[0] !== excludeDirectory && /\.(?:js|mjs|cjs)$/.test(name))
    .map((name) => fs.readFileSync(path.join(directory, name), "utf8")).join("\n");
  const targets = [
    ["web", readJs(path.join(sourceRoot, "apps/web/dist/assets")), CONNECT_KEYS],
    // The server entry imports binCli-*.mjs. Exclude its copied web client so
    // client literals cannot conceal a missing server-side build fallback.
    ["server", readJs(path.join(sourceRoot, "apps/server/dist"), "client"), CONNECT_KEYS.filter((key) => key !== "T3CODE_CLERK_JWT_TEMPLATE")],
    ["desktop", fs.readFileSync(path.join(sourceRoot, "apps/desktop/dist-electron/main.cjs"), "utf8"), ["T3CODE_CLERK_PUBLISHABLE_KEY"]],
  ] as const;
  for (const [label, code, keys] of targets) {
    for (const key of keys) {
      if (!code.includes(config[key])) throw new Error(`${label} artifact is missing public T3 Connect config: ${key}`);
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const [command, sourceRoot] = process.argv.slice(2);
  if (!sourceRoot || !["prepare", "check-source", "check-artifacts"].includes(command)) {
    throw new Error("usage: t3-connect-config.ts <prepare|check-source|check-artifacts> <source-root>");
  }
  if (command === "prepare") prepareT3ConnectConfig(sourceRoot);
  else if (command === "check-source") await checkT3ConnectSource(sourceRoot);
  else checkT3ConnectArtifacts(sourceRoot);
  console.log(`T3 Connect ${command}: passed`);
}
