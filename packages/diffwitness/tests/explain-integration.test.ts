import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { describe, it } from "node:test";
import { runCli } from "../src/cli/program.js";
import { EXIT_CODES } from "../src/domain/errors.js";
import { FsStorage } from "../src/infrastructure/storage/fs-storage.js";
import type { AiProvider } from "../src/ports/ai-provider.js";
import type { EvidencePacket, Explanation } from "../src/domain/types.js";
import { EXPLAIN_PROMPT_VERSION } from "../src/infrastructure/ai/prompts/explain.v2.js";
import { afterInit } from "./support/demo-config.js";

const execFileAsync = promisify(execFile);
const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixtureSrc = path.join(packageRoot, "fixtures", "demo");

async function makeFixtureRepo(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "diffwitness-explain-"));
  await execFileAsync("git", ["init"], { cwd: root });
  await execFileAsync("git", ["config", "user.email", "test@example.com"], { cwd: root });
  await execFileAsync("git", ["config", "user.name", "Test"], { cwd: root });
  await mkdir(path.join(root, "fixtures"), { recursive: true });
  await cp(fixtureSrc, path.join(root, "fixtures", "demo"), { recursive: true });
  await writeFile(path.join(root, "README.md"), "fixture repo\n", "utf8");
  await execFileAsync("git", ["add", "."], { cwd: root });
  await execFileAsync("git", ["commit", "-m", "init"], { cwd: root });
  return root;
}

async function cli(
  repo: string,
  argv: string[],
  extras?: { aiProvider?: AiProvider },
): Promise<{ code: number; out: string; err: string }> {
  const storage = new FsStorage();
  let out = "";
  let err = "";
  const code = await runCli({
    argv,
    cwd: repo,
    storage,
    ...(extras?.aiProvider !== undefined ? { aiProvider: extras.aiProvider } : {}),
    stdout: (c) => {
      out += c;
    },
    stderr: (c) => {
      err += c;
    },
  });
  await afterInit(repo, argv, code);
  return { code, out, err };
}

describe("explain CLI", () => {
  it("errors when check has not been run", async () => {
    const repo = await makeFixtureRepo();
    try {
      assert.equal((await cli(repo, ["init"])).code, 0);
      assert.equal((await cli(repo, ["baseline"])).code, 0);
      const result = await cli(repo, ["explain"]);
      assert.equal(result.code, EXIT_CODES.user_error);
      assert.match(result.err, /check/i);
    } finally {
      await rm(repo, { recursive: true, force: true });
    }
  });

  it("clean check → explain does not fabricate findings narrative", async () => {
    const repo = await makeFixtureRepo();
    try {
      assert.equal((await cli(repo, ["init"])).code, 0);
      assert.equal((await cli(repo, ["baseline"])).code, 0);
      assert.equal((await cli(repo, ["check"])).code, 0);
      const explained = await cli(repo, ["explain", "--provider", "mock", "--json"]);
      assert.equal(explained.code, EXIT_CODES.success);
      const json = JSON.parse(explained.out);
      assert.equal(json.command, "explain");
      assert.equal(json.status, "clean");
      assert.ok(json.behavioralDiff);
      assert.ok(json.explanation);
      assert.match(json.explanation.narrative, /No behavioral findings/i);
      assert.equal(json.explanation.citations.length, 0);
    } finally {
      await rm(repo, { recursive: true, force: true });
    }
  });

  it("findings → explain cites EvidenceIds; JSON keeps Structured Diff + Explanation", async () => {
    const repo = await makeFixtureRepo();
    try {
      assert.equal((await cli(repo, ["init"])).code, 0);
      assert.equal((await cli(repo, ["baseline"])).code, 0);

      const behaviorPath = path.join(repo, "fixtures", "demo", "behavior.json");
      await writeFile(
        behaviorPath,
        `${JSON.stringify({ message: "diffwitness-demo", rank: 2, stable: true }, null, 2)}\n`,
        "utf8",
      );
      assert.equal((await cli(repo, ["check"])).code, 0);

      const explained = await cli(repo, ["explain", "--provider", "mock", "--json"]);
      assert.equal(explained.code, EXIT_CODES.success);
      const json = JSON.parse(explained.out);
      assert.equal(json.status, "findings");
      assert.ok(json.behavioralDiff.findings.length >= 1);
      assert.ok(json.explanation);
      assert.equal(json.explanation.provider, "mock");
      assert.equal(json.explanation.promptVersion, EXPLAIN_PROMPT_VERSION);
      assert.match(json.explanation.narrative, /FACT:/);
      assert.match(json.explanation.narrative, /EVIDENCE:/);
      assert.match(json.explanation.narrative, /INTERPRETATION:/);
      assert.ok(json.explanation.hypotheses.every((h: { confidence: string }) =>
        ["low", "medium", "high"].includes(h.confidence),
      ));
      for (const c of json.explanation.citations) {
        const findingIds = new Set(
          json.behavioralDiff.findings.map((f: { id: string }) => f.id),
        );
        if (c.findingId) {
          assert.ok(findingIds.has(c.findingId));
        }
      }
      assert.ok(json.packet);
      assert.equal(json.packet.schemaVersion, 2);
      assert.equal(json.schemaVersion, 2);
    } finally {
      await rm(repo, { recursive: true, force: true });
    }
  });

  it("provider=none leaves findings visible without explanation", async () => {
    const repo = await makeFixtureRepo();
    try {
      assert.equal((await cli(repo, ["init"])).code, 0);
      assert.equal((await cli(repo, ["baseline"])).code, 0);
      const behaviorPath = path.join(repo, "fixtures", "demo", "behavior.json");
      await writeFile(
        behaviorPath,
        `${JSON.stringify({ message: "diffwitness-demo", rank: 2, stable: true }, null, 2)}\n`,
        "utf8",
      );
      assert.equal((await cli(repo, ["check"])).code, 0);
      const explained = await cli(repo, ["explain", "--provider", "none", "--json"]);
      assert.equal(explained.code, EXIT_CODES.success);
      const json = JSON.parse(explained.out);
      assert.equal(json.status, "findings");
      assert.ok(json.behavioralDiff.findings.length >= 1);
      assert.equal(json.explanation, null);
      assert.match(json.explanationUnavailableReason, /none/);
    } finally {
      await rm(repo, { recursive: true, force: true });
    }
  });

  it("featherless without API key is explain_error; findings remain (no mock fallback)", async () => {
    const repo = await makeFixtureRepo();
    const prev = process.env.FEATHERLESS_API_KEY;
    delete process.env.FEATHERLESS_API_KEY;
    try {
      assert.equal((await cli(repo, ["init"])).code, 0);
      assert.equal((await cli(repo, ["baseline"])).code, 0);
      const behaviorPath = path.join(repo, "fixtures", "demo", "behavior.json");
      await writeFile(
        behaviorPath,
        `${JSON.stringify({ message: "diffwitness-demo", rank: 2, stable: true }, null, 2)}\n`,
        "utf8",
      );
      assert.equal((await cli(repo, ["check"])).code, 0);
      const explained = await cli(repo, ["explain", "--provider", "featherless", "--json"]);
      assert.equal(explained.code, EXIT_CODES.explain_error);
      const json = JSON.parse(explained.out);
      assert.equal(json.status, "findings");
      assert.ok(json.behavioralDiff.findings.length >= 1);
      assert.equal(json.explanation, null);
      assert.match(json.explainError, /Missing credentials|FEATHERLESS_API_KEY|Featherless/i);
      assert.equal(json.metadata.explanationStatus, "error");
      assert.equal(json.metadata.provider, "featherless");
      assert.doesNotMatch(JSON.stringify(json), /Bearer /);
    } finally {
      if (prev !== undefined) {
        process.env.FEATHERLESS_API_KEY = prev;
      } else {
        delete process.env.FEATHERLESS_API_KEY;
      }
      await rm(repo, { recursive: true, force: true });
    }
  });

  it("provider failure keeps findings visible and is not clean", async () => {
    const repo = await makeFixtureRepo();
    const failingProvider: AiProvider = {
      name: "fail",
      async explain(_packet: EvidencePacket): Promise<Explanation> {
        throw new Error("simulated provider failure");
      },
    };
    try {
      assert.equal((await cli(repo, ["init"])).code, 0);
      assert.equal((await cli(repo, ["baseline"])).code, 0);
      const behaviorPath = path.join(repo, "fixtures", "demo", "behavior.json");
      await writeFile(
        behaviorPath,
        `${JSON.stringify({ message: "diffwitness-demo", rank: 2, stable: true }, null, 2)}\n`,
        "utf8",
      );
      assert.equal((await cli(repo, ["check"])).code, 0);
      const explained = await cli(repo, ["explain"], { aiProvider: failingProvider });
      assert.equal(explained.code, EXIT_CODES.explain_error);
      const json = JSON.parse(
        (await cli(repo, ["explain", "--json"], { aiProvider: failingProvider })).out,
      );
      assert.equal(json.status, "findings");
      assert.ok(json.behavioralDiff.findings.length >= 1);
      assert.equal(json.explanation, null);
      assert.match(json.explainError, /simulated provider failure/);
    } finally {
      await rm(repo, { recursive: true, force: true });
    }
  });

  it("baseline and check paths do not invoke AI", async () => {
    const repo = await makeFixtureRepo();
    let explainCalls = 0;
    const spy: AiProvider = {
      name: "spy",
      async explain(packet) {
        explainCalls += 1;
        return {
          schemaVersion: 1,
          promptVersion: EXPLAIN_PROMPT_VERSION,
          narrative: "should not run",
          facts: [],
          hypotheses: [],
          citations: [],
          caveats: [],
          provider: "spy",
        };
      },
    };
    try {
      assert.equal((await cli(repo, ["init"], { aiProvider: spy })).code, 0);
      assert.equal((await cli(repo, ["baseline"], { aiProvider: spy })).code, 0);
      assert.equal((await cli(repo, ["check"], { aiProvider: spy })).code, 0);
      assert.equal(explainCalls, 0);
      // Injected provider is only used by explain command
      assert.equal((await cli(repo, ["explain"], { aiProvider: spy })).code, 0);
      assert.equal(explainCalls, 1);
    } finally {
      await rm(repo, { recursive: true, force: true });
    }
  });
});
