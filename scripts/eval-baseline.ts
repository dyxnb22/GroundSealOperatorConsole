import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ErrorCodeSchema } from "../src/contracts/errors.js";
import { ERROR_TAXONOMY } from "../src/policy/error-taxonomy.js";

const root = process.cwd();
const output = execSync("pnpm exec vitest run 2>&1", { encoding: "utf-8", cwd: root });

const passedMatch = output.match(/Tests\s+(\d+) passed/);
const failedMatch = output.match(/(\d+) failed/);
const fileMatch = output.match(/Test Files\s+(\d+) passed/);

const testsPassed = passedMatch ? Number(passedMatch[1]) : 0;
const testsFailed = failedMatch ? Number(failedMatch[1]) : 0;
const testFiles = fileMatch ? Number(fileMatch[1]) : 0;

const categories = [...new Set(Object.values(ERROR_TAXONOMY).map((e) => e.category))];

const baseline = {
  version: 1,
  generatedAt: new Date().toISOString(),
  testFiles,
  testsPassed,
  testsFailed,
  contractPassRate: testsFailed === 0 ? 1 : 0,
  negativePathCorrectness: testsFailed === 0 ? 1 : 0,
  errorCodeCount: ErrorCodeSchema.options.length,
  evaluationCategories: categories,
  notes: "Baseline ratchet: testsPassed must not decrease; testsFailed must stay 0.",
};

const outDir = join(root, "evals");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "baseline.json"), JSON.stringify(baseline, null, 2) + "\n");
console.log(JSON.stringify(baseline, null, 2));

if (testsFailed > 0) {
  process.exit(1);
}
