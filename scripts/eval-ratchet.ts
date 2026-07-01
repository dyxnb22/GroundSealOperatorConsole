import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

const baselinePath = join(process.cwd(), "evals/baseline.json");

if (!existsSync(baselinePath)) {
  console.error("Missing evals/baseline.json — run pnpm eval:baseline first");
  process.exit(1);
}

const baseline = JSON.parse(readFileSync(baselinePath, "utf-8")) as {
  testsPassed: number;
  testsFailed: number;
};

const output = execSync("pnpm exec vitest run 2>&1", { encoding: "utf-8" });
const passedMatch = output.match(/Tests\s+(\d+) passed/);
const failedMatch = output.match(/(\d+) failed/);

const testsPassed = passedMatch ? Number(passedMatch[1]) : 0;
const testsFailed = failedMatch ? Number(failedMatch[1]) : 0;

console.log(`Baseline: ${baseline.testsPassed} passed, ${baseline.testsFailed} failed`);
console.log(`Current:  ${testsPassed} passed, ${testsFailed} failed`);

if (testsFailed > 0) {
  console.error("Ratchet failed: tests failing");
  process.exit(1);
}

if (testsPassed < baseline.testsPassed) {
  console.error(
    `Ratchet failed: test count regressed (${testsPassed} < ${baseline.testsPassed})`,
  );
  process.exit(1);
}

console.log("Eval ratchet passed");
