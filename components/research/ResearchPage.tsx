import { RESEARCH } from "@/lib/research-data";
import { withBasePath } from "@/lib/base-path";
import { MathFormula } from "./MathFormula";
import { Citation } from "./ResearchInteractions";
import { FitExplorer } from "./FitExplorer";

function Figure({
  name,
  alt,
  label,
  children,
}: {
  name: string;
  alt: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <figure className="paper-figure">
      <a
        href={withBasePath(`/research/${name}.png`)}
        target="_blank"
        rel="noreferrer"
        aria-label={`Open ${label} at full resolution`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={withBasePath(`/research/${name}.png`)}
          alt={alt}
          loading="lazy"
        />
      </a>
      <figcaption>
        <strong>{label}</strong> {children}{" "}
        <span>Click the figure to enlarge ↗</span>
      </figcaption>
    </figure>
  );
}

function SectionHeading({
  n,
  label,
  title,
  children,
}: {
  n: string;
  label: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="section-heading">
      <span className="eyebrow">
        <span className="section-number">{n}</span>
        {label}
      </span>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </div>
  );
}

function HeroDiagram() {
  return (
    <div
      className="hero-diagram"
      aria-label="Text benchmark scores are projected into capability S, then combined with data budget D to predict a VLM learning curve."
    >
      <div className="diagram-topline">
        <span className="status-dot" /> Capability-driven prediction{" "}
        <span>01 — 03</span>
      </div>
      <div className="diagram-inputs">
        <div className="input-block">
          <span className="diagram-index">01 / OBSERVE</span>
          <div className="benchmark-glyph" aria-hidden="true">
            {[62, 88, 48, 76, 95, 57, 80].map((h, i) => (
              <i key={i} style={{ height: `${h}%` }} />
            ))}
          </div>
          <h3>
            Text capability <i>S</i>
          </h3>
          <p>What the language model knows</p>
        </div>
        <span className="diagram-plus" aria-hidden="true">
          +
        </span>
        <div className="input-block">
          <span className="diagram-index">02 / PLAN</span>
          <div className="data-glyph" aria-hidden="true">
            {Array.from({ length: 24 }, (_, i) => (
              <i key={i} />
            ))}
          </div>
          <h3>
            Multimodal data <i>D</i>
          </h3>
          <p>How much it will learn from</p>
        </div>
      </div>
      <div className="diagram-bridge">
        <span />
        transfer + absorption
        <span />
      </div>
      <div className="diagram-output">
        <div>
          <span className="diagram-index">03 / PREDICT</span>
          <h3>
            A learning curve,
            <br />
            before training.
          </h3>
          <p>Across scales. Across families.</p>
        </div>
        <svg
          viewBox="0 0 245 180"
          role="img"
          aria-label="Schematic predicted performance curves. Higher capability improves the starting point and changes data absorption."
        >
          <defs>
            <linearGradient id="curve-fill" x1="0" x2="0" y1="0" y2="1">
              <stop stopColor="#5967da" stopOpacity=".18" />
              <stop offset="1" stopColor="#5967da" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[40, 80, 120, 160].map((y) => (
            <line key={y} x1="15" x2="230" y1={y} y2={y} stroke="#e3e5ef" />
          ))}
          <path
            d="M18 108 C55 55 113 35 230 22 L230 45 C113 58 55 78 18 131 Z"
            fill="url(#curve-fill)"
          />
          <path
            d="M18 120 C55 65 113 45 230 33"
            fill="none"
            stroke="#5967da"
            strokeWidth="3"
          />
          <path
            d="M18 153 C60 110 126 90 230 70"
            fill="none"
            stroke="#a4abe1"
            strokeWidth="2"
            strokeDasharray="5 5"
          />
          {[
            [36, 100],
            [79, 66],
            [131, 48],
            [192, 37],
          ].map(([x, y]) => (
            <circle
              key={x}
              cx={x}
              cy={y}
              r="4"
              fill="#5967da"
              stroke="white"
              strokeWidth="2"
            />
          ))}
          <text x="15" y="13">
            Performance
          </text>
          <text x="175" y="177">
            Data budget →
          </text>
        </svg>
      </div>
      <div className="diagram-footnote">
        Conceptual illustration · see the measured results below
      </div>
    </div>
  );
}

export function ResearchPage() {
  return (
    <article className="research-page">
      <section className="research-hero" id="overview">
        <div className="research-container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="status-dot" /> Capability-Driven Multimodal
              Scaling Law
            </div>
            <h1>
              What transfers
              <br />
              from <em>text</em> to <em>vision?</em>
            </h1>
            <p className="hero-subtitle">{RESEARCH.subtitle}</p>
            <p className="hero-description">
              Predict how a language backbone will learn from multimodal
              data—using its text capability and a planned training budget.
            </p>
            <div className="resource-links">
              <a
                className="research-button primary"
                href={RESEARCH.arxiv}
                target="_blank"
                rel="noreferrer"
              >
                Read the paper <span aria-hidden="true">↗</span>
              </a>
              <a
                className="research-button"
                href={RESEARCH.code}
                target="_blank"
                rel="noreferrer"
              >
                Code & data <span aria-hidden="true">↗</span>
              </a>
              <a className="text-link" href="#method">
                Explore the method <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
          <HeroDiagram />
        </div>
        <div className="research-container author-strip">
          <div className="authors">
            {RESEARCH.authors.map((a) => (
              <span key={a.name}>
                {a.name}
                <sup>
                  {a.affiliation}
                  {a.equal ? "*" : ""}
                </sup>
              </span>
            ))}
          </div>
          <div className="affiliations">
            <span>
              <sup>1</sup> Meituan
            </span>
            <span>
              <sup>2</sup> Tsinghua University
            </span>
            <span>* Equal contribution</span>
            <a href={RESEARCH.arxiv} target="_blank" rel="noreferrer">
              arXiv:2608.00013 ↗
            </a>
          </div>
        </div>
      </section>

      <div className="research-container study-stats" aria-label="Study scale">
        {[
          { value: "34", label: "Language backbones" },
          { value: "7", label: "Model families" },
          { value: "150+", label: "VLMs trained" },
          { value: "72B", label: "Scale extrapolation" },
        ].map((s) => (
          <div key={s.label}>
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      <section className="research-container research-section intro-section">
        <SectionHeading
          n="01"
          label="A preliminary observation"
          title="Text capability and multimodal performance move together."
        />
        <div className="intro-grid">
          <p className="large-copy">
            Stronger text capability tends to accompany
            <br />
            <span>stronger multimodal performance.</span>
          </p>
          <div className="body-copy">
            <p>
              As an initial observation, we examine 17 LLM–VLM pairs from the
              OpenCompass leaderboard. Language backbones with higher text
              benchmark scores tend to have VLM counterparts with higher
              multimodal scores, revealing a positive correlation between the
              two capabilities.
            </p>
            <p>
              This observation motivates our central question: can textual
              capability help us <strong>predict multimodal performance</strong>
              ? The correlation alone does not explain how much capability
              transfers or how a backbone learns from additional multimodal
              data. Our scaling law models these two effects jointly.
            </p>
          </div>
        </div>
        <Figure
          name="text-vision-correlation"
          label="Figure 6 · Preliminary evidence of a positive correlation"
          alt="Text scores of 17 language backbones plotted against their corresponding VLM multimodal scores, showing a strong positive correlation with Spearman rho of 0.791 and p less than 0.001."
        >
          An initial analysis of 17 LLM–VLM pairs from the OpenCompass
          leaderboard shows a positive association between text and multimodal
          scores (Spearman ρ = 0.791, p &lt; 0.001; Appendix A.1).
        </Figure>
      </section>

      <section className="method-section" id="method">
        <div className="research-container research-section">
          <SectionHeading
            n="02"
            label="The method"
            title="Transfer sets the start. Absorption shapes the slope."
          >
            One capability score and one data budget predict the multimodal
            accuracy trajectory.
          </SectionHeading>
          <div className="formula-panel">
            <MathFormula
              expression={String.raw`P(S,D_{\mathrm{mm}})=\underbrace{\hat{A}S}_{\text{transfer}}+\underbrace{(B_0-B_mS)\ln D_{\mathrm{mm}}}_{\text{data absorption}}+P_0`}
              label="Predicted performance equals transfer plus capability-dependent data absorption plus a baseline."
              displayMode
            />
            <div className="formula-notes">
              <p>
                <strong>S · Text capability</strong>A learned, unit-norm
                projection of PCA-compressed text benchmark scores.
              </p>
              <p>
                <strong>B̂ = B₀ − BₘS · Absorption</strong>Stronger textual
                priors reduce the marginal benefit of additional multimodal
                data.
              </p>
              <p>
                <strong>P₀ · Baseline</strong>The fitted intercept captures
                benchmark-specific baseline performance.
              </p>
            </div>
          </div>
          <div className="method-steps">
            {[
              {
                title: "Measure",
                body: "Evaluate the backbone on text benchmarks and center its scores.",
              },
              {
                title: "Project",
                body: "Compress with PCA (≥95% explained variance), then compute the learned capability score S.",
              },
              {
                title: "Predict",
                body: "Keep the fitted projection and coefficients fixed. Supply a data budget to obtain a learning curve.",
              },
            ].map((s, i) => (
              <div key={s.title}>
                <span>0{i + 1}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
          <p className="method-note">
            During fitting, capability weights and scaling coefficients are
            learned jointly from observed VLM trajectories using Huber loss and
            a nonnegative-absorption penalty. At inference, only text scores and
            the planned token budget are needed. (§2, Appendix E)
          </p>
          <FitExplorer />
        </div>
      </section>

      <section className="research-container research-section" id="results">
        <SectionHeading
          n="03"
          label="The evidence"
          title="One law. Unseen scales and families."
        >
          A controlled training recipe isolates the effect of the language
          backbone.
        </SectionHeading>
        <div className="recipe-strip">
          <div>
            <strong>Architecture</strong>
            <span>LLaVA-OneVision + SigLIP</span>
          </div>
          <div>
            <strong>Training data</strong>
            <span>Infinity-MM · two-stage alignment</span>
          </div>
          <div>
            <strong>Prediction inputs / target</strong>
            <span>40 filtered text / 35 multimodal benchmarks</span>
          </div>
        </div>
        <div className="result-feature">
          <div>
            <span className="eyebrow">Cross-backbone fit · §3.4</span>
            <h3>
              A shared predictor
              <br />
              across 32 backbones.
            </h3>
            <div className="result-number">
              1.287<span>%</span>
            </div>
            <p>
              Mean absolute error in multimodal accuracy, without
              family-specific recalibration.
            </p>
            <p className="fine-print">
              The fitting pool includes 32 backbones. Qwen2.5-72B Base and
              Instruct are held out, bringing the full study to 34.
            </p>
          </div>
          <Figure
            name="accuracy-fit"
            label="Figure 2 · Accuracy fit"
            alt="Multimodal accuracy of 32 language backbones plotted against the capability and data composite metric, closely following a single fitted line."
          >
            Each point is a checkpoint; marker shapes indicate families and
            color distinguishes Base / Instruct.
          </Figure>
        </div>
        <div className="holdout-banner">
          <div>
            <span className="eyebrow">72B scale extrapolation</span>
            <h3>Predict beyond the fitting scale.</h3>
          </div>
          <div>
            <strong>
              1.92<span>%</span>
            </strong>
            <p>Base transfer error</p>
          </div>
          <div>
            <strong>
              0.70<span>%</span>
            </strong>
            <p>Instruct transfer error</p>
          </div>
          <div>
            <strong>
              1.225<span>%</span>
            </strong>
            <p>Full trajectory MAE (Figure 3b)</p>
          </div>
        </div>
        <Figure
          name="scale-extrapolation"
          label="Figure 3 · Transfer & absorption"
          alt="Qwen2.5-72B held-out checkpoints and predicted accuracy bands at the starting budget and across the full training trajectory."
        >
          Qwen2.5-72B Base and Instruct test both the initial transfer term and
          full trajectory prediction, with a combined holdout MAE of 1.225%
          across the full trajectories (panel b).
        </Figure>
        <div className="family-results">
          <div>
            <span className="eyebrow">Leave one family out · §3.5</span>
            <h3>
              Entirely new families.
              <br />
              Consistent scaling trends.
            </h3>
            <p>
              Fit on the remaining families, then predict all trajectories of
              the held-out family.
            </p>
          </div>
          <div className="family-errors">
            {RESEARCH.familyErrors.map((f) => (
              <div key={f.family}>
                <span>{f.family}</span>
                <div className="error-track">
                  <i style={{ width: `${(f.mae / 3) * 100}%` }} />
                </div>
                <strong>
                  {f.mae.toFixed(3)}
                  <small>%</small>
                </strong>
              </div>
            ))}
            <span className="fine-print">
              Held-out accuracy MAE · lower is better · Figure 4
            </span>
          </div>
        </div>
        <Figure
          name="family-generalization"
          label="Figure 4 · Cross-family generalization"
          alt="Four leave-one-family-out fits for Qwen3, DeepSeek, Falcon3 and Gemma-2, showing predicted versus observed multimodal accuracy."
        >
          The global trend generalizes across architectural and pretraining
          differences.
        </Figure>
      </section>

      <section className="findings-section" id="findings">
        <div className="research-container research-section">
          <SectionHeading
            n="04"
            label="Transfer dynamics"
            title="What the coefficients reveal."
          >
            Text capability is multidimensional. More of it does not always
            transfer in the same way.
          </SectionHeading>
          <div className="finding-grid">
            <div className="finding-copy">
              <span className="finding-index">Finding 01</span>
              <h3>
                Some text benchmarks
                <br />
                impose a transfer tax.
              </h3>
              <p>
                Benchmark-level coefficients reveal positive and negative
                associations with multimodal performance. Unweighted text
                leaderboard averages can reward dimensions that transfer poorly.
              </p>
              <div className="robustness-stats">
                <div>
                  <strong>25</strong>
                  <span>stable positive</span>
                </div>
                <div>
                  <strong>6</strong>
                  <span>stable negative</span>
                </div>
                <div>
                  <strong>9</strong>
                  <span>unstable</span>
                </div>
              </div>
              <p className="fine-print">
                These counts summarize sign stability across six robustness
                refits, with at least five consistent signs required for a
                stable classification (Appendix I). They are distinct from the
                individual main-fit coefficients shown in the bar chart.
              </p>
            </div>
            <div className="coefficient-panel">
              <div className="mini-chart-title">
                Selected main-fit transfer coefficients{" "}
                <span>Table 7 · λ · one fitted model</span>
              </div>
              {RESEARCH.benchmarks.map((b) => (
                <div className="coefficient-row" key={b.name}>
                  <span title={b.name}>{b.name}</span>
                  <div className="coefficient-track">
                    <i
                      className={b.value < 0 ? "negative" : "positive"}
                      style={{
                        width: `${(Math.abs(b.value) / 0.12) * 48}%`,
                        left:
                          b.value < 0
                            ? `${50 - (Math.abs(b.value) / 0.12) * 48}%`
                            : "50%",
                      }}
                    />
                  </div>
                  <strong>
                    {b.value > 0 ? "+" : ""}
                    {b.value.toFixed(3)}
                  </strong>
                </div>
              ))}
              <div className="coefficient-axis">
                <span>← Transfer tax</span>
                <span>Positive transfer →</span>
              </div>
              <p className="fine-print">
                A negative main-fit coefficient does not imply a stable transfer
                tax across refits. For example, boolean_expressions_hard is
                negative here but classified as unstable in Appendix I.
                Coefficients describe fitted associations, rather than causal
                effects.
              </p>
            </div>
          </div>
          <div className="finding-grid second-finding">
            <div className="finding-copy">
              <span className="finding-index">Finding 02</span>
              <h3>
                Instruction tuning starts ahead.
                <br />
                Base models scale further.
              </h3>
              <p>
                Instruct backbones have a higher fitted transfer coefficient,
                but their absorption-decay coefficient Bₘ is approximately 1.33×
                that of Base backbones (0.0104 vs. 0.0078). In B̂ = B₀ − BₘS,
                this means absorption decreases more steeply as text capability
                S increases. Base models have a larger average absorption rate
                and can overtake at larger data budgets.
              </p>
              <p className="fine-print">
                This is an aggregate tendency, with family-specific exceptions.
                Among pairs with positive slope differences, the median
                estimated crossover is ≈141B multimodal tokens (Appendix J).
              </p>
            </div>
            <div className="comparison-table table-scroll">
              <table>
                <caption>Base vs. Instruct · Table 2</caption>
                <thead>
                  <tr>
                    <th>Fitted parameter</th>
                    <th>Base</th>
                    <th>Instruct</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Transfer · Â</td>
                    <td>0.212</td>
                    <td>0.254</td>
                  </tr>
                  <tr>
                    <td>Absorption decay · Bₘ</td>
                    <td>0.0078</td>
                    <td>0.0104</td>
                  </tr>
                  <tr>
                    <td>Mean absorption · B̄</td>
                    <td>0.0161</td>
                    <td>0.0147</td>
                  </tr>
                </tbody>
              </table>
              <div className="table-takeaway">
                Choose the backbone together with the data budget.
              </div>
            </div>
          </div>
          <div className="family-profile">
            <span className="finding-index">Finding 03</span>
            <h3>Families occupy different transfer–absorption regimes.</h3>
            <div className="table-scroll">
              <table>
                <caption>
                  Family-specific fits · Table 3 · absorption values in original
                  units
                </caption>
                <thead>
                  <tr>
                    <th>Model family</th>
                    <th>Transfer · Â</th>
                    <th>Absorption decay · Bₘ</th>
                    <th>Mean absorption · B̄</th>
                  </tr>
                </thead>
                <tbody>
                  {RESEARCH.familyProfiles.map((f) => (
                    <tr key={f.family}>
                      <th scope="row">{f.family}</th>
                      <td>{f.transfer.toFixed(3)}</td>
                      <td>{f.decay.toFixed(4)}</td>
                      <td>{f.absorption.toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              Llama has the highest transfer slope and fastest absorption decay;
              Gemma-2 has the highest mean absorption. Backbone choice depends
              on the intended training regime.
            </p>
          </div>
        </div>
      </section>

      <section
        className="research-container research-section"
        id="applications"
      >
        <SectionHeading
          n="05"
          label="Practical use"
          title="From predicting performance to planning training."
        />
        <div className="application-grid">
          <div>
            <h3>
              The same metric guides
              <br />
              batch-size extrapolation.
            </h3>
            <p>
              A controlled sweep of five backbones and five batch sizes
              (128–2,048) finds that the optimal batch size increases with the
              composite capability–data metric.
            </p>
            <p>
              Qwen3-1.7B prefers a larger batch than Falcon3-3B, reversing their
              parameter-count ordering.
            </p>
            <div className="batch-predictions">
              <div>
                <strong>2,663</strong>
                <span>72B Base</span>
              </div>
              <div>
                <strong>4,194</strong>
                <span>72B Instruct</span>
              </div>
            </div>
            <p className="fine-print">
              Predicted optimal batch sizes for Qwen2.5-72B at 50B tokens
              (§4.4). These are extrapolations, not measured sweep optima.
            </p>
          </div>
          <Figure
            name="batch-size"
            label="Figure 5 · Batch-size extrapolation"
            alt="Optimal batch size increases with the composite capability and data metric, with predicted values for Qwen2.5-72B at 50 billion tokens."
          >
            Capability and data jointly inform training configuration.
          </Figure>
        </div>
        <details className="scope-note">
          <summary>Scope and limitations</summary>
          <p>
            The law is validated under a unified LLaVA-OneVision late-fusion
            recipe with a fixed SigLIP vision encoder. Generalization to
            early-fusion or native multimodal architectures, other training
            recipes, and jointly scaled vision encoders remains future work.
          </p>
        </details>
      </section>

      <section className="closing-section">
        <div className="research-container">
          <span className="eyebrow">The takeaway</span>
          <h2>
            Choose by capability.
            <br />
            <em>Plan for the data.</em>
          </h2>
          <p>
            A quantitative bridge from language backbones
            <br />
            to multimodal learning.
          </p>
          <div className="resource-links">
            <a
              className="research-button primary"
              href={RESEARCH.arxiv}
              target="_blank"
              rel="noreferrer"
            >
              Paper on arXiv ↗
            </a>
            <a
              className="research-button"
              href={RESEARCH.code}
              target="_blank"
              rel="noreferrer"
            >
              Explore code & data ↗
            </a>
          </div>
        </div>
      </section>
      <section
        className="research-container research-section citation-section"
        id="citation"
      >
        <div>
          <span className="eyebrow">Build on this work</span>
          <h2>Citation</h2>
          <p>If you find this work useful, please cite our paper.</p>
        </div>
        <Citation />
      </section>
    </article>
  );
}
