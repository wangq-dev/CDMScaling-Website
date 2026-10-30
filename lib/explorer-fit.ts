import data from "./explorer-data.json";

export interface Checkpoint {
  step: number;
  tokens: number;
  accuracy: number;
}
export interface Backbone {
  id: string;
  family: string;
  size: number;
  variant: string;
  holdout: boolean;
  s: number;
  points: Checkpoint[];
}
export interface Coefficients {
  A: number;
  B0: number;
  Bm: number;
  P0: number;
}
export interface FitResult extends Coefficients {
  mae: number;
  count: number;
  modelCount: number;
  minS: number;
  maxS: number;
  minD: number;
  maxD: number;
  boundary: boolean;
}
export const BACKBONES: Backbone[] = data.models;
export const NOTEBOOK_DATA = data.provenance;
export const REFERENCE_FIT: Coefficients = data.baseline;
export const FAMILIES = [
  ...new Set(BACKBONES.filter((m) => !m.holdout).map((m) => m.family)),
];
export const FAMILY_COLORS: Record<string, string> = {
  Qwen3: "#5964cb",
  Falcon3: "#269384",
  "Llama-3.2": "#c27b3a",
  "Gemma-2": "#9b63a4",
  DeepSeek: "#508bac",
  Mistral: "#b86670",
  "Qwen2.5": "#cf7057",
};
export const SIZE_GROUPS = ["<2B", "2–4B", "7–10B", "30B MoE"];
export function sizeGroup(m: Backbone) {
  return m.size < 2
    ? SIZE_GROUPS[0]
    : m.size <= 4
      ? SIZE_GROUPS[1]
      : m.size <= 10
        ? SIZE_GROUPS[2]
        : SIZE_GROUPS[3];
}
export function predict(c: Coefficients, s: number, tokens: number) {
  return c.A * s + (c.B0 - c.Bm * s) * Math.log(tokens) + c.P0;
}
export function modelMae(c: Coefficients, m: Backbone) {
  return (
    m.points.reduce(
      (sum, p) => sum + Math.abs(predict(c, m.s, p.tokens) - p.accuracy),
      0,
    ) / m.points.length
  );
}

function solve(matrix: number[][], rhs: number[]): number[] | null {
  const a = matrix.map((row, i) => [...row, rhs[i]]);
  const n = a.length;
  const scale = Math.max(...matrix.flat().map(Math.abs), 1);
  for (let i = 0; i < n; i++) {
    let pivot = i;
    for (let r = i + 1; r < n; r++)
      if (Math.abs(a[r][i]) > Math.abs(a[pivot][i])) pivot = r;
    if (Math.abs(a[pivot][i]) < scale * 1e-11) return null;
    [a[i], a[pivot]] = [a[pivot], a[i]];
    const divisor = a[i][i];
    a[i] = a[i].map((v) => v / divisor);
    for (let r = 0; r < n; r++)
      if (r !== i) {
        const factor = a[r][i];
        a[r] = a[r].map((v, j) => v - factor * a[i][j]);
      }
  }
  return a.map((row) => row[n]);
}

/** Fixed S; globally optimal constrained least squares in four coefficients.
 * With Smax fixed, write B0 = q + Bm*Smax. Nonnegative A,q,Bm ensure
 * nonnegative transfer/decay coefficients and absorption on the training support.
 * Enumerating all eight active sets solves this small convex problem exactly.
 * PCA and the capability direction never learn from filtered or held-out points.
 */
export function fitBackbones(models: Backbone[]): FitResult | null {
  if (models.length < 3) return null;
  const minS = Math.min(...models.map((m) => m.s)),
    maxS = Math.max(...models.map((m) => m.s));
  if (maxS - minS < 1e-5) return null;
  const rows = models.flatMap((m) =>
    m.points.map((p) => ({
      x: [m.s, Math.log(p.tokens), (maxS - m.s) * Math.log(p.tokens), 1],
      y: p.accuracy,
      d: p.tokens,
    })),
  );
  if (rows.length < 12) return null;
  const gram = Array.from({ length: 4 }, (_, i) =>
    Array.from({ length: 4 }, (_, j) =>
      rows.reduce((v, r) => v + r.x[i] * r.x[j], 0),
    ),
  );
  const rhs = Array.from({ length: 4 }, (_, i) =>
    rows.reduce((v, r) => v + r.x[i] * r.y, 0),
  );
  if (!solve(gram, rhs)) return null;
  let best: { coeff: number[]; loss: number; mask: number } | null = null;
  for (let mask = 0; mask < 8; mask++) {
    const indices = [0, 1, 2].filter((i) => mask & (1 << i)).concat(3);
    const small = solve(
      indices.map((i) => indices.map((j) => gram[i][j])),
      indices.map((i) => rhs[i]),
    );
    if (!small) continue;
    const coeff = [0, 0, 0, 0];
    indices.forEach((idx, i) => (coeff[idx] = small[i]));
    if (coeff.slice(0, 3).some((v) => v < -1e-9)) continue;
    for (let i = 0; i < 3; i++) coeff[i] = Math.max(0, coeff[i]);
    const loss = rows.reduce(
      (sum, r) =>
        sum + (r.x.reduce((v, x, i) => v + x * coeff[i], 0) - r.y) ** 2,
      0,
    );
    if (!best || loss < best.loss) best = { coeff, loss, mask };
  }
  if (!best) return null;
  const [A, q, Bm, P0] = best.coeff;
  const coeff = { A, B0: q + Bm * maxS, Bm, P0 };
  const mae =
    models.reduce(
      (sum, m) =>
        sum +
        m.points.reduce(
          (v, p) => v + Math.abs(predict(coeff, m.s, p.tokens) - p.accuracy),
          0,
        ),
      0,
    ) / rows.length;
  return {
    ...coeff,
    mae,
    count: rows.length,
    modelCount: models.length,
    minS,
    maxS,
    minD: Math.min(...rows.map((r) => r.d)),
    maxD: Math.max(...rows.map((r) => r.d)),
    boundary: best.mask !== 7,
  };
}
