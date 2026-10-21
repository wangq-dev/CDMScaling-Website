"use client";

import { useState } from "react";
import { RESEARCH } from "@/lib/research-data";

export function FormulaExplorer() {
  const [capability, setCapability] = useState(0.2);
  const [budget, setBudget] = useState(50);
  // Table 2 Base fit. Intercept is deliberately omitted: this explains relative
  // terms, rather than claiming to reproduce the unavailable full fitted model.
  const transfer = 0.212 * capability;
  const absorptionRate = 0.016 - 0.0078 * capability;
  const absorption = absorptionRate * Math.log(budget);
  const x = (d: number) => 48 + (Math.log(d / 10) / Math.log(10)) * 390;
  const y = (s: number, d: number) =>
    210 - (0.212 * s + (0.016 - 0.0078 * s) * Math.log(d)) * 900;
  const path = (s: number) =>
    Array.from({ length: 61 }, (_, i) => {
      const d = 10 * Math.pow(10, i / 60);
      return `${i === 0 ? "M" : "L"}${x(d).toFixed(2)},${y(s, d).toFixed(2)}`;
    }).join(" ");
  return (
    <div className="explorer">
      <div className="explorer-controls">
        <span className="eyebrow">Explore the mechanism</span>
        <h3>
          Two ingredients.
          <br />
          One learning curve.
        </h3>
        <label htmlFor="capability">
          Text capability <i>S</i>
          <output>{capability.toFixed(2)}</output>
        </label>
        <input
          id="capability"
          type="range"
          min="-0.3"
          max="0.6"
          step="0.01"
          value={capability}
          onChange={(e) => setCapability(Number(e.target.value))}
        />
        <label htmlFor="budget">
          Multimodal data <i>D</i>
          <output>{budget}B tokens</output>
        </label>
        <input
          id="budget"
          type="range"
          min="10"
          max="100"
          step="1"
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
        />
        <p className="fine-print">
          Illustration using the Base coefficients in Table 2. Values show P −
          P₀; they are not calibrated accuracy predictions for an unseen model.
          S requires the fitted text-benchmark projection.
        </p>
      </div>
      <div className="explorer-chart">
        <div className="chart-legend">
          <span className="legend-dot reference" /> S = 0 reference{" "}
          <span className="legend-dot" /> Selected capability
        </div>
        <svg
          viewBox="0 0 490 285"
          role="img"
          aria-label={`Relative predicted performance over data budget at capability ${capability.toFixed(2)}. A higher capability increases transfer and reduces the slope over log data.`}
        >
          {[-0.025, 0, 0.05, 0.1, 0.15].map((v) => (
            <g key={v}>
              <line
                x1="48"
                x2="448"
                y1={210 - v * 900}
                y2={210 - v * 900}
                className="gridline"
              />
              <text x="39" y={214 - v * 900} textAnchor="end">
                {v.toFixed(2)}
              </text>
            </g>
          ))}
          <text x="48" y="24">
            P − P₀
          </text>
          <path d={path(0)} className="reference-curve" />
          <path d={path(capability)} className="selected-curve" />
          <line
            x1={x(budget)}
            x2={x(budget)}
            y1="45"
            y2="236"
            className="cursor-line"
          />
          <circle
            cx={x(budget)}
            cy={y(capability, budget)}
            r="6"
            className="curve-point"
          />
          {[10, 20, 50, 100].map((d) => (
            <text key={d} x={x(d)} y="252" textAnchor="middle">
              {d}B
            </text>
          ))}
          <text x="245" y="278" textAnchor="middle">
            Multimodal tokens · logarithmic scale
          </text>
        </svg>
        <dl className="term-values" aria-live="polite">
          <div>
            <dt>Transfer · ÂS</dt>
            <dd>{transfer.toFixed(3)}</dd>
          </div>
          <div>
            <dt>Data absorption · B̂ ln D</dt>
            <dd>{absorption.toFixed(3)}</dd>
          </div>
          <div>
            <dt>Absorption rate · B̂</dt>
            <dd>{absorptionRate.toFixed(4)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

export function Citation() {
  const [status, setStatus] = useState("");
  async function copy() {
    try {
      await navigator.clipboard.writeText(RESEARCH.bibtex);
      setStatus("Copied");
    } catch {
      setStatus("Select the citation below to copy it.");
    }
  }
  return (
    <div className="citation-box">
      <div className="citation-heading">
        <span>BibTeX</span>
        <button type="button" onClick={copy}>
          Copy citation <span aria-hidden="true">↗</span>
        </button>
      </div>
      <pre tabIndex={0}>
        <code>{RESEARCH.bibtex}</code>
      </pre>
      <span className="copy-status" role="status">
        {status}
      </span>
    </div>
  );
}
