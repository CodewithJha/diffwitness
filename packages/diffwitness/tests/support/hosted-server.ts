import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import type { AddressInfo } from "node:net";
import os from "node:os";
import path from "node:path";
import { DEFAULT_HOSTED_CONFIG, type HostedConfig } from "../../src/hosted/config.js";
import { createDemoServer, type DemoServer } from "../../src/hosted/http-app.js";
import {
  createScenarioRegistry,
  PRICING_SCENARIO,
  PRICING_WORKFLOW_SCRIPT,
  type DemoScenario,
  type ScenarioRegistry,
} from "../../src/hosted/scenarios.js";

export interface TestServer {
  readonly baseUrl: string;
  readonly demo: DemoServer;
  /** Parent of all per-run workspaces for this server (must end up empty). */
  readonly workspaceParent: string;
  readonly logs: { event: string; [key: string]: unknown }[];
  close(): Promise<void>;
}

export async function startTestServer(
  options: {
    config?: Partial<HostedConfig>;
    scenarios?: ScenarioRegistry;
    cliCommand?: readonly string[];
    gitCheck?: () => Promise<boolean>;
  } = {},
): Promise<TestServer> {
  const workspaceParent = await mkdtemp(path.join(os.tmpdir(), "diffwitness-hosted-test-"));
  const logs: TestServer["logs"] = [];
  const demo = createDemoServer({
    config: { ...DEFAULT_HOSTED_CONFIG, host: "127.0.0.1", port: 0, ...options.config },
    ...(options.scenarios !== undefined ? { scenarios: options.scenarios } : {}),
    ...(options.cliCommand !== undefined ? { cliCommand: options.cliCommand } : {}),
    ...(options.gitCheck !== undefined ? { gitCheck: options.gitCheck } : {}),
    workspaceParent,
    log: (event, fields) => logs.push({ event, ...fields }),
  });
  await demo.ready;
  await new Promise<void>((resolve) => demo.server.listen(0, "127.0.0.1", resolve));
  const { port } = demo.server.address() as AddressInfo;
  return {
    baseUrl: `http://127.0.0.1:${port}`,
    demo,
    workspaceParent,
    logs,
    async close() {
      await demo.shutdown();
      await rm(workspaceParent, { recursive: true, force: true });
    },
  };
}

export async function postDemo(
  baseUrl: string,
  body: unknown,
  init: { headers?: Record<string, string>; signal?: AbortSignal; raw?: string } = {},
): Promise<{ status: number; headers: Headers; json: any; text: string }> {
  const response = await fetch(`${baseUrl}/api/demo`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...init.headers },
    body: init.raw ?? JSON.stringify(body),
    ...(init.signal !== undefined ? { signal: init.signal } : {}),
  });
  const text = await response.text();
  let json: unknown = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  return { status: response.status, headers: response.headers, json, text };
}

export async function listDir(dir: string): Promise<string[]> {
  return readdir(dir);
}

export function registry(...scenarios: DemoScenario[]): ScenarioRegistry {
  return createScenarioRegistry(scenarios);
}

/** Trusted test scenario derived from the built-in one. */
export function testScenario(id: string, overrides: Partial<DemoScenario>): DemoScenario {
  return { ...PRICING_SCENARIO, id, ...overrides };
}

/** Replace the `pricing` workflow script inside the run's repo (trusted test change). */
export async function replaceWorkflow(repoDir: string, source: string): Promise<void> {
  await writeFile(path.join(repoDir, PRICING_WORKFLOW_SCRIPT), source, "utf8");
}

/** Workflow that records its pid, then never exits. */
export function hangingWorkflow(pidFile: string): string {
  return `import { writeFileSync } from "node:fs";
writeFileSync(${JSON.stringify(pidFile)}, String(process.pid));
setInterval(() => {}, 1000);
`;
}

export async function waitFor(predicate: () => Promise<boolean> | boolean, timeoutMs = 20_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await predicate()) return;
    await new Promise((r) => setTimeout(r, 25));
  }
  throw new Error("waitFor timed out");
}

export async function readPid(file: string): Promise<number | null> {
  try {
    const n = Number((await readFile(file, "utf8")).trim());
    return Number.isInteger(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

export function isAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}
