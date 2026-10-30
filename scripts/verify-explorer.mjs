/** Numerical contracts for the interactive fixed-S refit. */
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
const out = mkdtempSync(path.join(tmpdir(), "cdm-fit-test-"));
try {
  execFileSync(
    process.execPath,
    [
      "node_modules/typescript/bin/tsc",
      "lib/explorer-fit.ts",
      "--module",
      "commonjs",
      "--target",
      "es2020",
      "--esModuleInterop",
      "--resolveJsonModule",
      "--skipLibCheck",
      "--outDir",
      out,
    ],
    { stdio: "pipe" },
  );
  const require = createRequire(import.meta.url);
  const { BACKBONES, fitBackbones, predict, REFERENCE_FIT } = require(
    path.join(out, "explorer-fit.js"),
  );
  const training = BACKBONES.filter((m) => !m.holdout);
  assert.equal(BACKBONES.length, 34);
  assert.equal(training.length, 32);
  assert.equal(BACKBONES.flatMap((m) => m.points).length, 264);
  for (const m of BACKBONES)
    for (const p of m.points)
      assert.equal(p.tokens, (p.step * 8192 * 512) / 1e9);
  const fit = fitBackbones(training);
  assert(fit);
  assert.equal(fit.count, 256);
  for (const key of ["A", "B0", "Bm", "P0"])
    assert(Math.abs(fit[key] - REFERENCE_FIT[key]) < 1e-8, key);
  assert(Math.abs(fit.mae - 0.012871) < 0.00002);
  const known = { A: 0.22, B0: 0.032, Bm: 0.015, P0: 0.41 };
  const synthetic = Array.from({ length: 8 }, (_, i) => {
    const s = -0.35 + i * 0.1;
    return {
      id: `synthetic-${i}`,
      s,
      points: [10, 25, 60, 100].map((d) => ({
        tokens: d,
        accuracy: predict(known, s, d),
      })),
    };
  });
  const recovered = fitBackbones(synthetic);
  assert(recovered);
  for (const key of Object.keys(known))
    assert(Math.abs(recovered[key] - known[key]) < 1e-8, `recover ${key}`);
  assert(recovered.mae < 1e-9);
  const boundary = fitBackbones(
    synthetic.map((m) => ({
      ...m,
      points: m.points.map((p) => ({
        ...p,
        accuracy: predict({ ...known, A: -0.22 }, m.s, p.tokens),
      })),
    })),
  );
  assert(boundary && boundary.boundary);
  assert(boundary.A >= 0 && boundary.Bm >= 0);
  for (const selection of [
    training,
    training.filter((m) => m.size <= 4),
    training.filter((m) => m.family !== "Qwen3"),
    training.filter((m) => m.variant === "Base"),
  ]) {
    const result = fitBackbones(selection);
    assert(result);
    assert(result.A >= 0 && result.Bm >= 0);
    for (const m of selection) assert(result.B0 - result.Bm * m.s >= -1e-9);
  }
  assert.equal(fitBackbones([]), null);
  assert.equal(fitBackbones(training.slice(0, 2)), null);
  assert.equal(
    fitBackbones(training.slice(0, 4).map((m) => ({ ...m, s: 0 }))),
    null,
  );
  const s = BACKBONES.at(-1).s;
  assert(
    Math.abs(
      predict(fit, s, 20) -
        predict(fit, s, 10) -
        (predict(fit, s, 40) - predict(fit, s, 20)),
    ) < 1e-12,
  );
  console.log(
    `PASS: 34 models / 264 checkpoints; baseline MAE ${(fit.mae * 100).toFixed(4)}%; coefficient recovery, constraints, subsets, empty/degenerate selections, log-data predictions.`,
  );
} finally {
  rmSync(out, { recursive: true, force: true });
}
