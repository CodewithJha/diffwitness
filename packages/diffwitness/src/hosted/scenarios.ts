import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Package root (works from src/hosted via tsx and from dist/hosted when built). */
export const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

/**
 * A trusted, built-in demo scenario. Everything here ships with the app; visitors can only
 * pick a scenario by id. Fixture paths are resolved server-side, never from request input.
 */
export interface DemoScenario {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  /** Absolute path of the trusted project copied into the root of each run's repository. */
  readonly fixtureDir: string;
  /** Fixture-relative trusted DiffWitness config installed as .diffwitness/config.yaml after init. */
  readonly configFile: string;
  /** Which configured workflows play which role on the summary card. */
  readonly roles: {
    readonly testsWorkflowId: string;
    readonly behaviorWorkflowId: string;
  };
  readonly change: {
    readonly summary: string;
    /** Trusted code that edits the run's repository working tree. */
    readonly apply: (repoDir: string) => Promise<void>;
  };
  /** BehavioralDiff status the scenario must produce; anything else is a failed demo. */
  readonly expectedCheckStatus: "findings" | "clean";
  /** Test-only trusted hook between check and explain. Built-in scenarios never set it. */
  readonly beforeExplain?: (repoDir: string) => Promise<void>;
}

export const PRICING_FIXTURE_DIR = path.join(PACKAGE_ROOT, "fixtures", "pricing");
export const PRICING_CONFIG_FILE = "diffwitness.config.yaml";
/** Repo-relative script of the `pricing` workflow (tests replace it to simulate failures). */
export const PRICING_WORKFLOW_SCRIPT = "bin/quote.mjs";

const PRICING_SOURCE = "src/pricing.mjs";
const DISCOUNT_BEFORE = "export const DISCOUNT = 0.1;";
const DISCOUNT_AFTER = "export const DISCOUNT = 0.2;";

/** The "simplify a constant" edit: exactly one line in the source, nothing else. */
async function applyDiscountChange(repoDir: string): Promise<void> {
  const file = path.join(repoDir, PRICING_SOURCE);
  const source = await readFile(file, "utf8");
  if (source.split(DISCOUNT_BEFORE).length !== 2) {
    throw new Error("pricing fixture does not contain exactly one DISCOUNT declaration");
  }
  await writeFile(file, source.replace(DISCOUNT_BEFORE, DISCOUNT_AFTER), "utf8");
}

export const PRICING_SCENARIO: DemoScenario = {
  id: "pricing-discount-change",
  title: "A one-line pricing change the tests don't catch",
  description:
    "A small pricing project with passing unit tests. Baseline it, change one constant in the source (DISCOUNT 0.1 → 0.2), then check and explain with MockAI.",
  fixtureDir: PRICING_FIXTURE_DIR,
  configFile: PRICING_CONFIG_FILE,
  roles: { testsWorkflowId: "tests", behaviorWorkflowId: "pricing" },
  change: {
    summary: "src/pricing.mjs: DISCOUNT 0.1 → 0.2 (one line; tests untouched)",
    apply: applyDiscountChange,
  },
  expectedCheckStatus: "findings",
};

export type ScenarioRegistry = ReadonlyMap<string, DemoScenario>;

export function createScenarioRegistry(scenarios: readonly DemoScenario[]): ScenarioRegistry {
  const registry = new Map<string, DemoScenario>();
  for (const scenario of scenarios) {
    if (!SCENARIO_ID_PATTERN.test(scenario.id) || registry.has(scenario.id)) {
      throw new Error(`Invalid or duplicate scenario id: ${scenario.id}`);
    }
    registry.set(scenario.id, scenario);
  }
  return registry;
}

export const SCENARIO_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const BUILT_IN_SCENARIOS: ScenarioRegistry = createScenarioRegistry([PRICING_SCENARIO]);
