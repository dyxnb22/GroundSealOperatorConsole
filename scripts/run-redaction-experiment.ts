import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { compareRedactionPolicies } from "../src/evals/redaction-comparison.js";

const result = compareRedactionPolicies();
const outDir = join(process.cwd(), "evals/experiments");
mkdirSync(outDir, { recursive: true });

const output = {
  version: 1,
  generatedAt: new Date().toISOString(),
  experiment: "redaction-policy-comparison",
  ...result,
};

writeFileSync(
  join(outDir, "redaction-comparison.json"),
  JSON.stringify(output, null, 2) + "\n",
);
console.log(JSON.stringify(output, null, 2));

if (result.policies.some((p) => p.leakCount > 0)) {
  console.error("Experiment failed: policy leak detected");
  process.exit(1);
}
