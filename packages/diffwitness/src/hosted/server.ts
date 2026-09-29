#!/usr/bin/env node
import { existsSync } from "node:fs";
import type { AddressInfo } from "node:net";
import { defaultCliCommand } from "./cli-invocation.js";
import { HostedConfigError, loadHostedConfig, type HostedConfig } from "./config.js";
import { createDemoServer } from "./http-app.js";
import { createStdoutLogger, describeError } from "./logger.js";

/** Production entry: `node dist/hosted/server.js` (see `npm start`). */
async function main(): Promise<void> {
  const log = createStdoutLogger();
  let config: HostedConfig;
  try {
    config = loadHostedConfig();
  } catch (error) {
    if (error instanceof HostedConfigError) {
      log("startup_failed", { error: error.message });
      process.exitCode = 1;
      return;
    }
    throw error;
  }

  const cliCommand = defaultCliCommand();
  const cliEntry = cliCommand.at(-1)!;
  if (!existsSync(cliEntry)) {
    log("startup_failed", { error: "DiffWitness CLI build not found — run `npm run build` first" });
    process.exitCode = 1;
    return;
  }

  const demo = createDemoServer({ config, cliCommand, log });
  demo.server.on("error", (error) => {
    log("server_error", { error: describeError(error) });
    process.exit(1);
  });
  demo.server.listen(config.port, config.host, () => {
    const address = demo.server.address() as AddressInfo;
    log("listening", {
      host: config.host,
      port: address.port,
      maxConcurrent: config.maxConcurrent,
      requestTimeoutMs: config.requestTimeoutMs,
      aiProvider: "mock",
    });
  });

  let stopping = false;
  const onSignal = (signal: NodeJS.Signals): void => {
    if (stopping) {
      log("forced_exit", { signal });
      process.exit(1);
    }
    stopping = true;
    log("shutdown_started", { signal, activeRuns: demo.activeRuns() });
    void demo.shutdown().then(() => {
      log("shutdown_complete", { trackedWorkspaces: demo.trackedWorkspaces() });
      process.exit(0);
    });
  };
  process.on("SIGINT", onSignal);
  process.on("SIGTERM", onSignal);
}

await main();
