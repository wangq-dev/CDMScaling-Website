"use client";

import { useMemo, useState } from "react";
import {
  BACKBONES,
  FAMILY_COLORS,
  FAMILIES,
  SIZE_GROUPS,
  NOTEBOOK_DATA,
  fitBackbones,
  predict,
  sizeGroup,
  type Backbone,
  type Checkpoint,
} from "@/lib/explorer-fit";
import "./fit-explorer.css";

const TRAINING = BACKBONES.filter((m) => !m.holdout);
const ALL_POINTS = BACKBONES.flatMap((model) =>
  model.points.map((point) => ({ model, point })),
);
const S_MIN = Math.floor(Math.min(...TRAINING.map((m) => m.s)) * 100) / 100;
const S_MAX = Math.ceil(Math.max(...TRAINING.map((m) => m.s)) * 100) / 100;
const VARIANTS = ["Base", "Chat"];
const pct = (n: number, digits = 2) => `${(n * 100).toFixed(digits)}%`;
const fmt = (n: number) => n.toFixed(4);
const WIDTH = 720,
  HEIGHT = 350,
  LEFT = 66,
  RIGHT = 28,
  TOP = 30,
  BOTTOM = 64;
const scale = (
  value: number,
  min: number,
  max: number,
  start: number,
  end: number,
) => start + ((value - min) / (max - min)) * (end - start);

function ChartAxes({
  xTicks,
  x,
  y,
}: {
  xTicks: number[];
  x: (n: number) => number;
  y: (n: number) => number;
}) {
  return (
    <>
      {[0.4, 0.5, 0.6, 0.7].map((t) => (
        <g key={t}>
          <line
            className="fit-gridline"
            x1={LEFT}
            x2={WIDTH - RIGHT}
            y1={y(t)}
            y2={y(t)}
          />
          <text x={LEFT - 12} y={y(t) + 4} textAnchor="end">
            {pct(t, 0)}
          </text>
        </g>
      ))}
      {xTicks.map((t) => (
        <g key={t}>
          <line
            className="fit-gridline vertical"
            x1={x(t)}
            x2={x(t)}
            y1={TOP}
            y2={HEIGHT - BOTTOM}
          />
          <text x={x(t)} y={HEIGHT - BOTTOM + 24} textAnchor="middle">
            {Number(t.toFixed(2)).toString()}
          </text>
        </g>
      ))}
      <text x={LEFT} y="17" className="fit-axis-title">
        Observed multimodal accuracy
      </text>
      <text
        x={(LEFT + WIDTH - RIGHT) / 2}
        y={HEIGHT - 12}
        textAnchor="middle"
        className="fit-axis-title"
      >
        ÂS + B̂ ln D
      </text>
    </>
  );
}

function Checks({
  title,
  options,
  values,
  onChange,
  colors,
}: {
  title: string;
  options: string[];
  values: string[];
  onChange: (values: string[]) => void;
  colors?: Record<string, string>;
}) {
  return (
    <fieldset className="fit-checks">
      <legend>{title}</legend>
      <div>
        {options.map((option) => (
          <label key={option}>
            <input
              type="checkbox"
              checked={values.includes(option)}
              onChange={() =>
                onChange(
                  values.includes(option)
                    ? values.filter((v) => v !== option)
                    : [...values, option],
                )
              }
            />
            {colors && (
              <i style={{ background: colors[option] }} aria-hidden="true" />
            )}
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function FitExplorer() {
  const [minS, setMinS] = useState(S_MIN);
  const [maxS, setMaxS] = useState(S_MAX);
  const [families, setFamilies] = useState(FAMILIES);
  const [sizes, setSizes] = useState(SIZE_GROUPS);
  const [variants, setVariants] = useState(VARIANTS);
  const [hover, setHover] = useState<{
    model: Backbone;
    point: Checkpoint;
  } | null>(null);
  const selected = useMemo(
    () =>
      TRAINING.filter(
        (m) =>
          m.s >= minS - 1e-9 &&
          m.s <= maxS + 1e-9 &&
          families.includes(m.family) &&
          sizes.includes(sizeGroup(m)) &&
          variants.includes(m.variant === "Instruct" ? "Chat" : m.variant),
      ),
    [minS, maxS, families, sizes, variants],
  );
  const selectedIds = useMemo(
    () => new Set(selected.map((m) => m.id)),
    [selected],
  );
  const fit = useMemo(() => fitBackbones(selected), [selected]);
  const projected = fit
    ? ALL_POINTS.map(
        ({ model, point }) => predict(fit, model.s, point.tokens) - fit.P0,
      )
    : [];
  const xDomain = [
    Math.min(-0.05, ...projected.map((v) => v - 0.01)),
    Math.max(0.25, ...projected.map((v) => v + 0.01)),
  ];
  const xTicks =
    xDomain[0] === -0.05 && xDomain[1] === 0.25
      ? [-0.05, 0, 0.05, 0.1, 0.15, 0.2, 0.25]
      : Array.from({ length: 5 }, (_, i) =>
          Number((xDomain[0] + ((xDomain[1] - xDomain[0]) * i) / 4).toFixed(2)),
        );
  const x = (n: number) =>
    scale(n, xDomain[0], xDomain[1], LEFT, WIDTH - RIGHT);
  const y = (n: number) => scale(n, 0.35, 0.72, HEIGHT - BOTTOM, TOP);
  const ordered = [...ALL_POINTS].sort(
    (a, b) =>
      Number(selectedIds.has(a.model.id)) - Number(selectedIds.has(b.model.id)),
  );
  const inspected = fit ? hover : null;
  function reset() {
    setMinS(S_MIN);
    setMaxS(S_MAX);
    setFamilies(FAMILIES);
    setSizes(SIZE_GROUPS);
    setVariants(VARIANTS);
    setHover(null);
  }
  function exportFit() {
    if (!fit) return;
    const result = {
      method: NOTEBOOK_DATA.method,
      projection: "Frozen 12-PC notebook capability direction",
      selectedModels: selected.map((m) => m.id),
      coefficients: { A: fit.A, B0: fit.B0, Bm: fit.Bm, P0: fit.P0 },
      trainingMae: fit.mae,
      source: NOTEBOOK_DATA,
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(result, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "cdm-custom-fit.json";
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <section
      className="fit-lab"
      id="fit-explorer"
      aria-label="Interactive scaling-law fitting explorer"
    >
      <div className="fit-lab-header">
        <div>
          <span className="eyebrow">
            Explore the mechanism · interactive prototype
          </span>
          <h3>
            Choose the evidence.
            <br />
            Inspect the fit.
          </h3>
          <p>
            Filter real checkpoints and see how the scaling coefficients and
            fitting error change.
          </p>
        </div>
        <div className="fit-source-badge">
          <strong>34 backbones · 264 checkpoints</strong>
          <span>32 fitting candidates + 2 original 72B holdouts</span>
        </div>
      </div>
      <div className="fit-workspace">
        <aside className="fit-controls" aria-label="Training selection">
          <div className="fit-control-heading">
            <h4>Choose the fitting set</h4>
            <button type="button" onClick={reset}>
              Reset filters
            </button>
          </div>
          <fieldset className="fit-s-range">
            <legend>
              Text capability S{" "}
              <output>
                {minS.toFixed(2)} to {maxS.toFixed(2)}
              </output>
            </legend>
            <svg
              viewBox="0 0 300 44"
              role="img"
              aria-label="Backbone capability distribution; shaded range selects models for fitting"
            >
              <rect
                x={scale(minS, S_MIN, S_MAX, 8, 292)}
                y="3"
                width={Math.max(
                  0,
                  scale(maxS, S_MIN, S_MAX, 8, 292) -
                    scale(minS, S_MIN, S_MAX, 8, 292),
                )}
                height="38"
                rx="3"
                fill="#eaeafa"
              />
              {TRAINING.map((m, i) => (
                <circle
                  key={m.id}
                  cx={scale(m.s, S_MIN, S_MAX, 8, 292)}
                  cy={14 + (i % 3) * 8}
                  r="3.3"
                  fill={
                    selectedIds.has(m.id) ? FAMILY_COLORS[m.family] : "#d4d5df"
                  }
                />
              ))}
            </svg>
            <label htmlFor="fit-s-min">
              Minimum S<output>{minS.toFixed(2)}</output>
            </label>
            <input
              id="fit-s-min"
              type="range"
              min={S_MIN}
              max={S_MAX}
              step="0.01"
              value={minS}
              onChange={(e) => setMinS(Math.min(Number(e.target.value), maxS))}
            />
            <label htmlFor="fit-s-max">
              Maximum S<output>{maxS.toFixed(2)}</output>
            </label>
            <input
              id="fit-s-max"
              type="range"
              min={S_MIN}
              max={S_MAX}
              step="0.01"
              value={maxS}
              onChange={(e) => setMaxS(Math.max(Number(e.target.value), minS))}
            />
          </fieldset>
          <Checks
            title="Model family"
            options={FAMILIES}
            values={families}
            onChange={setFamilies}
            colors={FAMILY_COLORS}
          />
          <Checks
            title="Parameter scale"
            options={SIZE_GROUPS}
            values={sizes}
            onChange={setSizes}
          />
          <p className="fit-small">
            30B MoE uses total parameters (3B active).
          </p>
          <Checks
            title="Base / Chat"
            options={VARIANTS}
            values={variants}
            onChange={setVariants}
          />
          <p className="fit-small">Chat includes instruction-tuned variants.</p>
          <p className="fit-small">
            The two Qwen2.5-72B holdouts are shown for comparison and never
            included in fitting.
          </p>
        </aside>
        <div className="fit-results">
          <div className="fit-summary" aria-live="polite">
            <div>
              <span>Fitting backbones</span>
              <strong data-testid="fit-model-count">
                {selected.length}
                <small> / 32</small>
              </strong>
            </div>
            <div>
              <span>Training checkpoints</span>
              <strong>
                {fit?.count ??
                  selected.reduce((n, m) => n + m.points.length, 0)}
              </strong>
            </div>
            <div>
              <span>Training MAE</span>
              <strong data-testid="fit-mae">
                {fit ? pct(fit.mae, 4) : "—"}
              </strong>
            </div>
          </div>
          <div className="fit-plot-header">
            <div>
              <h4>Fitted vs. observed accuracy</h4>
              <p>
                Hover, focus, or click a checkpoint to inspect its fitted value.
              </p>
            </div>
          </div>
          {!fit && (
            <p className="fit-notice" role="status">
              Not enough independent data to fit four coefficients. Select at
              least three backbones with different S values and multiple
              checkpoints, or reset the filters.
            </p>
          )}
          <div className="fit-scatter">
            <svg
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              role="group"
              aria-label="Observed accuracy versus A S plus (B0 minus Bm S) times log D, excluding P0. The fitted reference line is y equals x plus P0."
            >
              <defs>
                <clipPath id="fit-scatter-clip">
                  <rect
                    x={LEFT}
                    y={TOP}
                    width={WIDTH - LEFT - RIGHT}
                    height={HEIGHT - BOTTOM - TOP}
                  />
                </clipPath>
              </defs>
              <ChartAxes xTicks={xTicks} x={x} y={y} />
              {fit && (
                <g clipPath="url(#fit-scatter-clip)">
                  <path
                    className="fit-custom-line"
                    d={`M${x(0.35 - fit.P0)},${y(0.35)}L${x(0.72 - fit.P0)},${y(0.72)}`}
                  />
                  {ordered.map(({ model: m, point: p }) => {
                    const active =
                      inspected?.model.id === m.id &&
                      inspected.point.step === p.step;
                    return (
                      <circle
                        key={`${m.id}-${p.step}`}
                        cx={x(predict(fit, m.s, p.tokens) - fit.P0)}
                        cy={y(p.accuracy)}
                        r={
                          active
                            ? 5.5
                            : m.holdout
                              ? 4.3
                              : selectedIds.has(m.id)
                                ? 3.5
                                : 2.9
                        }
                        fill={
                          m.holdout
                            ? "#cf7057"
                            : selectedIds.has(m.id)
                              ? FAMILY_COLORS[m.family]
                              : "#d6d7e0"
                        }
                        opacity={
                          m.holdout || selectedIds.has(m.id) ? 0.85 : 0.55
                        }
                        stroke={active ? "#343853" : "none"}
                        strokeWidth="1.5"
                        tabIndex={0}
                        role="button"
                        aria-label={`Inspect ${m.id}, ${p.tokens.toFixed(2)}B tokens, observed accuracy ${pct(p.accuracy)}`}
                        onMouseEnter={() => setHover({ model: m, point: p })}
                        onFocus={() => setHover({ model: m, point: p })}
                        onClick={() => setHover({ model: m, point: p })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setHover({ model: m, point: p });
                          }
                        }}
                      >
                        <title>{`${m.id} · S ${m.s.toFixed(3)} · ${p.tokens.toFixed(2)}B · ${pct(p.accuracy)}`}</title>
                      </circle>
                    );
                  })}
                </g>
              )}
            </svg>
          </div>
          <div className="fit-point-info" aria-live="polite">
            {inspected && fit ? (
              <>
                <strong>{inspected.model.id}</strong>
                <span>
                  S {inspected.model.s.toFixed(3)} ·{" "}
                  {inspected.point.tokens.toFixed(2)}B tokens · observed{" "}
                  {pct(inspected.point.accuracy)} · fitted{" "}
                  {pct(predict(fit, inspected.model.s, inspected.point.tokens))}
                </span>
              </>
            ) : (
              <>
                <strong>
                  {fit
                    ? "Hover or focus a checkpoint"
                    : "Choose a broader fitting set"}
                </strong>
                <span>
                  Colored: selected for fitting · gray: excluded · coral:
                  original 72B holdouts
                </span>
              </>
            )}
          </div>
          <p className="fit-chart-note">
            The horizontal axis is ÂS + B̂ ln D, where B̂ = B₀ − BₘS. P₀ is
            excluded from the horizontal coordinate but remains in the fit; the
            reference line is y = x + P₀.
          </p>
          <div className="fit-coefficients">
            <span>Live coefficients</span>
            {fit ? (
              <>
                <code>Â {fmt(fit.A)}</code>
                <code>B₀ {fmt(fit.B0)}</code>
                <code>Bₘ {fmt(fit.Bm)}</code>
                <code>P₀ {fmt(fit.P0)}</code>
              </>
            ) : (
              <span>Choose a broader fitting set.</span>
            )}
          </div>
          {fit?.boundary && (
            <p className="fit-small fit-boundary">
              A constraint is active in this fit. This subset supports a
              boundary solution rather than four unconstrained coefficients.
            </p>
          )}
          <button
            type="button"
            className="fit-export"
            disabled={!fit}
            onClick={exportFit}
          >
            Download this fit ↓
          </button>
        </div>
      </div>
      <details className="fit-method-details">
        <summary>How this interactive fit relates to the notebook</summary>
        <p>
          Real observations come from the supplied text_accuracy.csv and
          multimodal_accuracy.csv: 32 backbones × 8 checkpoints, plus two 72B
          holdouts × 4 checkpoints. Tokens = checkpoint step × 8,192 × 512 /
          10⁹.
        </p>
        <p>
          The PCA mean, 12 components (≥95% variance), and normalized capability
          direction are recovered from the notebook’s original 32-model training
          pool and saved weights. They remain fixed during interaction. Your
          filters refit Â, B₀, Bₘ and P₀ with constrained least squares,
          enforcing nonnegative Â, Bₘ and absorption across the selected
          training S range. The notebook’s Huber δ = 1 objective is quadratic
          for these accuracy residuals, but the browser does not rerun its joint
          weight learning, regularization, Differential Evolution or L-BFGS-B.
        </p>
        <p>
          The default all-32 fit is recovered from rounded saved notebook
          weights, so small differences from the paper are expected. Removing a
          training model or family here excludes its observations only from the
          coefficient refit; it is not a new independent leave-one-family-out
          experiment because S was originally learned from all 32 backbones.
        </p>
      </details>
    </section>
  );
}
