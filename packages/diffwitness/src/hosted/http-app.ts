import http from "node:http";
import os from "node:os";
import { z } from "zod";
import { defaultCliCommand } from "./cli-invocation.js";
import type { HostedConfig } from "./config.js";
import type { DemoResult } from "./demo-result.js";
import { describeError, silentLogger, type HostedLogger } from "./logger.js";
import { runDemo, type DemoAbortReason } from "./run-demo.js";
import { BUILT_IN_SCENARIOS, SCENARIO_ID_PATTERN, type ScenarioRegistry } from "./scenarios.js";
import { defaultGitCheck, Readiness, type GitAvailabilityCheck } from "./readiness.js";
import { loadStaticAssets, DEFAULT_PUBLIC_DIR, type StaticAsset } from "./static-assets.js";
import { WorkspaceTracker } from "./workspace.js";

export interface DemoServerOptions {
  readonly config: HostedConfig;
  /** Trusted scenario registry (built-ins by default; tests may register trusted test scenarios). */
  readonly scenarios?: ScenarioRegistry;
  readonly cliCommand?: readonly string[];
  /** Parent directory for per-run workspaces (default: OS temp dir). */
  readonly workspaceParent?: string;
  readonly publicDir?: string;
  readonly log?: HostedLogger;
  /** Startup dependency check behind /ready (default: `git --version`). */
  readonly gitCheck?: GitAvailabilityCheck;
}

export interface DemoServer {
  readonly server: http.Server;
  /** Resolves once the startup readiness check has finished. */
  readonly ready: Promise<void>;
  /** Stop accepting work, abort active runs, wait (bounded) for cleanup, remove workspaces. */
  shutdown(): Promise<void>;
  readonly activeRuns: () => number;
  readonly trackedWorkspaces: () => number;
}

/** Strict request contract: exactly one field, an id matching the scenario-id pattern. */
const demoRequestSchema = z
  .object({ scenario: z.string().min(1).max(64).regex(SCENARIO_ID_PATTERN) })
  .strict();

const SECURITY_HEADERS: Readonly<Record<string, string>> = {
  "Content-Security-Policy":
    "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
};

const RETRY_AFTER_SECONDS = "5";

export function createDemoServer(options: DemoServerOptions): DemoServer {
  const { config } = options;
  const scenarios = options.scenarios ?? BUILT_IN_SCENARIOS;
  const log = options.log ?? silentLogger;
  const assets = loadStaticAssets(options.publicDir ?? DEFAULT_PUBLIC_DIR);
  const workspaces = new WorkspaceTracker(options.workspaceParent ?? os.tmpdir());
  const runDeps = {
    workspaces,
    cliCommand: options.cliCommand ?? defaultCliCommand(),
    stageTimeoutMs: config.stageTimeoutMs,
    maxOutputBytes: config.maxOutputBytes,
    log,
  };

  const readiness = new Readiness(options.gitCheck ?? defaultGitCheck, () =>
    log("dependency_missing", { dependency: "git", effect: "demo runs refused; /ready returns 503" }),
  );

  const controllers = new Set<AbortController>();
  const running = new Set<Promise<unknown>>();
  let shuttingDown = false;

  const sweeper = setInterval(() => {
    void workspaces.removeOlderThan(config.workspaceTtlMs).then((n) => {
      if (n > 0) log("workspace_swept", { count: n });
    });
  }, Math.min(Math.floor(config.workspaceTtlMs / 2), 30_000));
  sweeper.unref();

  const scenarioList = [...scenarios.values()].map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    change: s.change.summary,
  }));

  async function handleDemo(req: http.IncomingMessage, res: http.ServerResponse): Promise<number> {
    if (shuttingDown) {
      return sendError(res, 503, "shutting_down", "Server is shutting down", { "Retry-After": RETRY_AFTER_SECONDS });
    }
    const contentType = (req.headers["content-type"] ?? "").split(";")[0]!.trim().toLowerCase();
    if (contentType !== "application/json") {
      return sendError(res, 415, "unsupported_media_type", "Content-Type must be application/json");
    }
    const body = await readBody(req, config.maxBodyBytes);
    if (body === "too_large") {
      return sendError(res, 413, "payload_too_large", "Request body too large", { Connection: "close" }, () =>
        req.destroy(),
      );
    }
    if (body === "aborted") {
      return 499;
    }
    let payload: unknown;
    try {
      payload = JSON.parse(body.toString("utf8"));
    } catch {
      return sendError(res, 400, "invalid_json", "Request body must be valid JSON");
    }
    const parsed = demoRequestSchema.safeParse(payload);
    if (!parsed.success) {
      return sendError(res, 400, "invalid_request", 'Body must be exactly {"scenario": "<scenario-id>"}');
    }
    const scenario = scenarios.get(parsed.data.scenario);
    if (scenario === undefined) {
      return sendError(res, 400, "unknown_scenario", "Unknown scenario");
    }
    const state = readiness.current;
    if (state.status !== "ready") {
      const message =
        state.status === "starting" ? "Server is starting; retry shortly" : "Demo unavailable: git is not installed on this host";
      return sendError(res, 503, "not_ready", message, { "Retry-After": RETRY_AFTER_SECONDS });
    }
    if (controllers.size >= config.maxConcurrent) {
      return sendError(res, 503, "busy", "Demo capacity reached; retry shortly", { "Retry-After": RETRY_AFTER_SECONDS });
    }

    const controller = new AbortController();
    controllers.add(controller);
    const abort = (reason: DemoAbortReason): void => controller.abort(reason);
    const deadline = setTimeout(() => abort("request_timeout"), config.requestTimeoutMs);
    const onClose = (): void => {
      if (!res.writableEnded) abort("client_disconnected");
    };
    res.on("close", onClose);

    const run = runDemo(runDeps, scenario, controller.signal);
    running.add(run);
    let result: DemoResult;
    try {
      result = await run;
    } finally {
      clearTimeout(deadline);
      res.off("close", onClose);
      controllers.delete(controller);
      running.delete(run);
    }
    log("demo_finished", {
      scenario: scenario.id,
      status: result.status,
      failure: result.failure?.kind ?? null,
      stage: result.failure?.stage ?? null,
      durationMs: result.durationMs,
    });
    if (res.destroyed) return 499;
    return sendJson(res, statusForResult(result), result);
  }

  function route(req: http.IncomingMessage, res: http.ServerResponse): Promise<number> | number {
    const pathname = safePathname(req.url);
    const method = req.method ?? "GET";
    if (pathname === "/health") {
      if (method !== "GET" && method !== "HEAD") return methodNotAllowed(res, "GET, HEAD");
      return shuttingDown ? sendJson(res, 503, { status: "shutting_down" }) : sendJson(res, 200, { status: "ok" });
    }
    if (pathname === "/ready") {
      if (method !== "GET" && method !== "HEAD") return methodNotAllowed(res, "GET, HEAD");
      if (shuttingDown) return sendJson(res, 503, { status: "shutting_down" });
      const state = readiness.current;
      return sendJson(res, state.status === "ready" ? 200 : 503, {
        ...state,
        checks: { git: state.status === "ready" ? "ok" : state.status === "starting" ? "pending" : "missing" },
      });
    }
    if (pathname === "/api/demo") {
      if (method !== "POST") return methodNotAllowed(res, "POST");
      return handleDemo(req, res);
    }
    if (pathname === "/api/scenarios") {
      if (method !== "GET" && method !== "HEAD") return methodNotAllowed(res, "GET, HEAD");
      return sendJson(res, 200, { schemaVersion: 1, scenarios: scenarioList });
    }
    const asset = pathname !== null ? assets.get(pathname) : undefined;
    if (asset !== undefined) {
      if (method !== "GET" && method !== "HEAD") return methodNotAllowed(res, "GET, HEAD");
      return sendAsset(res, asset, method === "HEAD");
    }
    return sendError(res, 404, "not_found", "Not found");
  }

  const server = http.createServer((req, res) => {
    const started = Date.now();
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) res.setHeader(name, value);
    Promise.resolve()
      .then(() => route(req, res))
      .catch((error: unknown) => {
        log("request_error", { error: describeError(error) });
        return res.headersSent ? 500 : sendError(res, 500, "internal_error", "Internal server error");
      })
      .then((status) => {
        log("request", {
          method: req.method,
          route: routeLabel(safePathname(req.url), assets),
          status,
          durationMs: Date.now() - started,
        });
      });
  });
  // Bound how long a client may take to send headers / the (tiny) request body.
  server.headersTimeout = 10_000;
  server.requestTimeout = 15_000;

  async function shutdown(): Promise<void> {
    if (shuttingDown) return;
    shuttingDown = true;
    clearInterval(sweeper);
    server.close();
    server.closeIdleConnections();
    for (const controller of controllers) controller.abort("shutdown" satisfies DemoAbortReason);
    await Promise.race([Promise.allSettled([...running]), delay(config.shutdownGraceMs)]);
    await workspaces.removeAll();
    server.closeAllConnections();
  }

  return {
    server,
    ready: readiness.settled,
    shutdown,
    activeRuns: () => controllers.size,
    trackedWorkspaces: () => workspaces.size,
  };
}

function statusForResult(result: DemoResult): number {
  if (result.status === "completed") return 200;
  switch (result.failure?.kind) {
    case "request_timeout":
    case "stage_timeout":
      return 504;
    case "interrupted":
      return 503;
    default:
      return 500;
  }
}

async function readBody(
  req: http.IncomingMessage,
  maxBytes: number,
): Promise<Buffer | "too_large" | "aborted"> {
  const declared = Number(req.headers["content-length"]);
  if (Number.isFinite(declared) && declared > maxBytes) return "too_large";
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    let size = 0;
    let done = false;
    const finish = (value: Buffer | "too_large" | "aborted"): void => {
      if (done) return;
      done = true;
      req.off("data", onData);
      resolve(value);
    };
    const onData = (chunk: Buffer): void => {
      size += chunk.byteLength;
      if (size > maxBytes) {
        req.pause();
        finish("too_large");
        return;
      }
      chunks.push(chunk);
    };
    req.on("data", onData);
    req.on("end", () => finish(Buffer.concat(chunks)));
    req.on("error", () => finish("aborted"));
    req.on("aborted", () => finish("aborted"));
  });
}

function safePathname(url: string | undefined): string | null {
  try {
    return new URL(url ?? "/", "http://localhost").pathname;
  } catch {
    return null;
  }
}

function routeLabel(pathname: string | null, assets: ReadonlyMap<string, StaticAsset>): string {
  if (pathname === "/health" || pathname === "/ready" || pathname === "/api/demo" || pathname === "/api/scenarios") {
    return pathname;
  }
  return pathname !== null && assets.has(pathname) ? pathname : "(other)";
}

function sendJson(res: http.ServerResponse, status: number, body: unknown, headers: Record<string, string> = {}, after?: () => void): number {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload),
    "Cache-Control": "no-store",
    ...headers,
  });
  res.end(payload, after);
  return status;
}

function sendError(
  res: http.ServerResponse,
  status: number,
  code: string,
  message: string,
  headers: Record<string, string> = {},
  after?: () => void,
): number {
  return sendJson(res, status, { error: { code, message } }, headers, after);
}

function methodNotAllowed(res: http.ServerResponse, allow: string): number {
  return sendError(res, 405, "method_not_allowed", "Method not allowed", { Allow: allow });
}

function sendAsset(res: http.ServerResponse, asset: StaticAsset, headOnly: boolean): number {
  res.writeHead(200, {
    "Content-Type": asset.contentType,
    "Content-Length": asset.body.byteLength,
    "Cache-Control": "no-cache",
  });
  res.end(headOnly ? undefined : asset.body);
  return 200;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms).unref());
}
