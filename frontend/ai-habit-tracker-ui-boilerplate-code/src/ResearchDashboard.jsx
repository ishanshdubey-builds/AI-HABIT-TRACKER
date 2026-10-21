
import { useEffect, useMemo, useState } from "react";
import "./ResearchDashboard.css";
import ResearchTrendCharts from "./ResearchTrendCharts";

// const API_URL = "http://localhost:8000/api/research/results";

const API_URL = `${
  import.meta.env.VITE_API_URL ||
  "https://ai-habit-tracker-api-m0d3.onrender.com/api"
}/research/results`;

const labels = {
  HOPE_T: "Hope",
  DEPRESSION_T: "Depression",
  SATISFACTION_T: "Life satisfaction",
  CONTROL: "Perceived control",
  control_within: "Within-person control",
  control_between: "Between-person control",
  DAY: "Study day",
  Intercept: "Intercept",
};

const format = (value, digits = 3) =>
  Number(value).toFixed(digits);

const formatP = (p) => {
  if (p < 0.001) return "p < .001";
  return `p = ${Number(p).toFixed(3)}`;
};

function MetricCard({ label, value, detail }) {
  return (
    <article className="research-metric">
      <span className="research-muted">{label}</span>
      <strong>{value}</strong>
      <span className="research-metric-detail">{detail}</span>
    </article>
  );
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="research-section-heading">
      <span className="research-eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}

function CorrelationChart({ correlations }) {
  const [selectedPair, setSelectedPair] = useState("all");

  const visible = correlations.filter((item) => {
    if (selectedPair === "all") return true;
    return `${item.variable_1}|${item.variable_2}` === selectedPair;
  });

  return (
    <div>
      <label className="research-label" htmlFor="correlation-pair">
        Explore variable pair
      </label>

      <select
        id="correlation-pair"
        className="research-select"
        value={selectedPair}
        onChange={(event) => setSelectedPair(event.target.value)}
      >
        <option value="all">All six correlations</option>
        {correlations.map((item) => (
          <option
            key={`${item.variable_1}|${item.variable_2}`}
            value={`${item.variable_1}|${item.variable_2}`}
          >
            {labels[item.variable_1] || item.variable_1} ×{" "}
            {labels[item.variable_2] || item.variable_2}
          </option>
        ))}
      </select>

      <div className="correlation-axis">
        <span>−1 negative</span>
        <span>0</span>
        <span>+1 positive</span>
      </div>

      <div className="correlation-list">
        {visible.map((item) => {
          const rho = Number(item.spearman_rho);
          const width = Math.abs(rho) * 50;

          return (
            <article
              className="correlation-row"
              key={`${item.variable_1}|${item.variable_2}`}
            >
              <div className="correlation-title">
                <span>
                  {labels[item.variable_1] || item.variable_1} and{" "}
                  {labels[item.variable_2] || item.variable_2}
                </span>
                <strong>{rho > 0 ? "+" : ""}{format(rho, 3)}</strong>
              </div>

              <div className="correlation-track">
                <div className="correlation-half correlation-left">
                  {rho < 0 && (
                    <div
                      className="correlation-bar correlation-negative"
                      style={{ width: `${width * 2}%` }}
                    />
                  )}
                </div>

                <div className="correlation-zero" />

                <div className="correlation-half correlation-right">
                  {rho >= 0 && (
                    <div
                      className="correlation-bar correlation-positive"
                      style={{ width: `${width * 2}%` }}
                    />
                  )}
                </div>
              </div>

              <div className="correlation-meta">
                <span>N = {item.n}</span>
                <span>{formatP(Number(item.p_value))}</span>
              </div>
            </article>
          );
        })}
      </div>

      <p className="research-note">
        Spearman's rho measures the direction and strength of a monotonic
        association. These correlations do not establish causation.
      </p>
    </div>
  );
}

function CoefficientChart({ model }) {
  const [effect, setEffect] = useState("both");

  const terms = [
    {
      key: "control_within",
      label: "Within-person control",
      color: "var(--research-accent)",
    },
    {
      key: "control_between",
      label: "Between-person control",
      color: "var(--research-purple)",
    },
  ].filter((term) => effect === "both" || effect === term.key);

  const points = terms
    .map((term) => {
      const result = model.coefficients?.[term.key];
      return result ? { ...term, ...result } : null;
    })
    .filter(Boolean);

//   const allBounds = points.flatMap((point) => [
//     Number(point.ci_lower),
//     Number(point.ci_upper),
//   ]);

//   const min = Math.min(0, ...allBounds);
//   const max = Math.max(0, ...allBounds);
//   const padding = Math.max((max - min) * 0.15, 0.01);
//   const low = min - padding;
//   const high = max + padding;
//   const x = (value) => 20 + ((value - low) / (high - low)) * 260;
//   const ticks = [low, (low + high) / 2, 0, high]
//     .filter((value, index, arr) =>
//       arr.findIndex((v) => Math.abs(v - value) < 1e-8) === index
//     )
//     .sort((a, b) => a - b);

const allBounds = points.flatMap((point) => [
  Number(point.ci_lower),
  Number(point.ci_upper),
]);

// Make the axis symmetric around zero so the reference line
// is centered and all tick marks are equally spaced.
const maxAbs = Math.max(
  0.05,
  ...allBounds.map((value) => Math.abs(value))
);

const limit = Math.ceil((maxAbs * 1.15) / 0.05) * 0.05;

const low = -limit;
const high = limit;

const x = (value) =>
  20 + ((value - low) / (high - low)) * 260;

const ticks = [-limit, -limit / 2, 0, limit / 2, limit];

  return (
    <div>
      <label className="research-label" htmlFor="effect-filter">
        Coefficients to display
      </label>

      <select
        id="effect-filter"
        className="research-select"
        value={effect}
        onChange={(event) => setEffect(event.target.value)}
      >
        <option value="both">Within-person and between-person</option>
        <option value="control_within">Within-person only</option>
        <option value="control_between">Between-person only</option>
      </select>

      <div className="coefficient-legend">
        {points.map((point) => (
          <span key={point.key}>
            <i style={{ background: point.color }} />
            {point.label}
          </span>
        ))}
      </div>

      <div className="coefficient-plot">
        <svg
          viewBox="0 0 300 185"
          role="img"
          aria-label="Regression coefficients with 95 percent confidence intervals"
        >
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={x(tick)}
                x2={x(tick)}
                y1="10"
                y2="145"
                stroke="var(--research-border)"
                strokeDasharray={Math.abs(tick) < 1e-8 ? "0" : "3 4"}
              />
              <text
                x={x(tick)}
                y="164"
                textAnchor="middle"
                fontSize="9"
                fill="var(--research-muted)"
              >
                {format(tick, 2)}
              </text>
            </g>
          ))}

          {points.map((point, index) => {
            const y = 45 + index * 60;
            return (
              <g key={point.key}>
                <line
                  x1={x(point.ci_lower)}
                  x2={x(point.ci_upper)}
                  y1={y}
                  y2={y}
                  stroke={point.color}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <line
                  x1={x(point.ci_lower)}
                  x2={x(point.ci_lower)}
                  y1={y - 7}
                  y2={y + 7}
                  stroke={point.color}
                  strokeWidth="2"
                />
                <line
                  x1={x(point.ci_upper)}
                  x2={x(point.ci_upper)}
                  y1={y - 7}
                  y2={y + 7}
                  stroke={point.color}
                  strokeWidth="2"
                />
                <circle
                  cx={x(point.estimate)}
                  cy={y}
                  r="5"
                  fill={point.color}
                  stroke="var(--research-card)"
                  strokeWidth="2"
                />
              </g>
            );
          })}
        </svg>
      </div>

      <p className="research-note">
        Points show estimated coefficients; horizontal lines show 95% confidence
        intervals. An interval crossing zero indicates that the estimate is
        not statistically significant at the conventional two-sided 0.05 level.
      </p>

      <div className="research-table-wrap">
        <table className="research-table">
          <thead>
            <tr>
              <th>Effect</th>
              <th>Estimate</th>
              <th>95% confidence interval</th>
              <th>p-value</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.key}>
                <td>{point.label}</td>
                <td>{format(point.estimate, 4)}</td>
                <td>
                  [{format(point.ci_lower, 4)}, {format(point.ci_upper, 4)}]
                </td>
                <td>{formatP(Number(point.p_value))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Interpretation({ results }) {
  const correlations = results.correlations || [];
  const models = results.mixed_effects_models || {};
  const controlHope = correlations.find(
    (item) =>
      item.variable_1 === "HOPE_T" && item.variable_2 === "CONTROL"
  );
  const controlDepression = correlations.find(
    (item) =>
      item.variable_1 === "DEPRESSION_T" &&
      item.variable_2 === "CONTROL"
  );
  const controlSatisfaction = correlations.find(
    (item) =>
      item.variable_1 === "SATISFACTION_T" &&
      item.variable_2 === "CONTROL"
  );

  const hopeWithin = models.HOPE_T?.coefficients?.control_within;
  const depressionWithin =
    models.DEPRESSION_T?.coefficients?.control_within;
  const satisfactionWithin =
    models.SATISFACTION_T?.coefficients?.control_within;

  return (
    <div className="interpretation-grid">
      <article className="interpretation-card">
        <span className="interpretation-icon">↗</span>
        <h3>Control and hope</h3>
        <p>
          {controlHope
            ? `Perceived control was positively associated with hope
               (Spearman ρ = ${format(controlHope.spearman_rho, 3)}; N = ${controlHope.n}).`
            : "The control–hope correlation was not available."}
        </p>
        {hopeWithin && (
          <p>
            Within a participant, a one-point increase in daily control relative
            to their own average was associated with a{" "}
            {format(hopeWithin.estimate, 3)}-point increase in hope, holding
            study day and between-person control constant.
          </p>
        )}
      </article>

      <article className="interpretation-card">
        <span className="interpretation-icon">↘</span>
        <h3>Control and depression</h3>
        <p>
          {controlDepression
            ? `Perceived control was negatively associated with depression
               (Spearman ρ = ${format(controlDepression.spearman_rho, 3)}; N = ${controlDepression.n}).`
            : "The control–depression correlation was not available."}
        </p>
        {depressionWithin && (
          <p>
            Within-person control was also negatively associated with depression
            in the adjusted model (β = {format(depressionWithin.estimate, 3)};
            {" "}{formatP(depressionWithin.p_value)}).
          </p>
        )}
      </article>

      <article className="interpretation-card">
        <span className="interpretation-icon">＋</span>
        <h3>Control and life satisfaction</h3>
        <p>
          {controlSatisfaction
            ? `Perceived control was positively associated with life satisfaction
               (Spearman ρ = ${format(controlSatisfaction.spearman_rho, 3)}; N = ${controlSatisfaction.n}).`
            : "The control–satisfaction correlation was not available."}
        </p>
        {satisfactionWithin && (
          <p>
            Within-person control was positively associated with satisfaction
            (β = {format(satisfactionWithin.estimate, 3)};
            {" "}{formatP(satisfactionWithin.p_value)}).
          </p>
        )}
      </article>

      <article className="interpretation-card interpretation-wide">
        <span className="interpretation-icon">i</span>
        <h3>How to interpret these findings</h3>
        <p>
          The correlations describe associations between measured variables.
          The mixed-effects models distinguish daily deviations from a
          participant's own average control from differences in average control
          between participants. These are observational results; they do not
          prove that control causes changes in well-being.
        </p>
      </article>
    </div>
  );
}

export default function ResearchDashboard() {
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadResults() {
      try {
        setError("");
        const response = await fetch(API_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Research API returned HTTP ${response.status}`);
        }

        const json = await response.json();
        setResults(json);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Unable to load research data.");
        }
      }
    }

    loadResults();
    return () => controller.abort();
  }, [retry]);

  const correlations = results?.correlations || [];
  const models = results?.mixed_effects_models || {};

  const completeRecords = useMemo(
    () =>
      Object.values(models).length
        ? Math.min(
            ...Object.values(models).map((model) => model.observations)
          )
        : 0,
    [models]
  );

  if (error) {
    return (
      <main className="research-page">
        <div className="research-alert">
          <h2>Unable to load research results</h2>
          <p>{error}</p>
          <p>
            Check that your backend is running on port 8000 and that the
            research endpoint is available.
          </p>
          <button
            className="research-button"
            onClick={() => setRetry((value) => value + 1)}
          >
            Retry connection
          </button>
        </div>
      </main>
    );
  }

  if (!results) {
    return (
      <main className="research-page">
        <div className="research-loading">Loading research analytics…</div>
      </main>
    );
  }

  const stats = results.descriptive_statistics || {};
  const participants =
    models.HOPE_T?.participants ??
    models.DEPRESSION_T?.participants ??
    models.SATISFACTION_T?.participants ??
    "—";

  return (
    <main className="research-page">
      <header className="research-header">
        <div>
          <span className="research-eyebrow">RESEARCH & ANALYTICS</span>
          <h1>Research dashboard</h1>
          <p>
            Secondary-data analysis of hope, depression, life satisfaction,
            and perceived control.
          </p>
        </div>

        <a
          className="research-source-link"
          href={results.source}
          target="_blank"
          rel="noreferrer"
        >
          View dataset source ↗
        </a>
      </header>

      <div className="research-data-notice">
        <strong>Secondary dataset</strong>
        <span>
          These are research-level findings, not an analysis of your personal
          habit records.
        </span>
      </div>

      <section className="research-metrics">
        <MetricCard
          label="Participants"
          value={participants}
          detail="Distinct participant IDs"
        />
        <MetricCard
          label="Model observations"
          value={completeRecords}
          detail="Records used in each model"
        />
        <MetricCard
          label="Correlations"
          value={correlations.length}
          detail="Spearman pairwise tests"
        />
        <MetricCard
          label="Models converged"
          value={`${Object.values(models).filter((model) => model.converged).length}/${Object.keys(models).length}`}
          detail="Mixed-effects models"
        />
      </section>

      <section className="research-panel">
        <SectionHeading
          eyebrow="01 · DATA OVERVIEW"
          title="Descriptive statistics"
          description="Summary measures for the available observations. Valid record counts differ because some values are missing."
        />

        <div className="research-table-wrap">
          <table className="research-table">
            <thead>
              <tr>
                <th>Measure</th>
                <th>Valid N</th>
                <th>Mean</th>
                <th>Std. deviation</th>
                <th>Minimum</th>
                <th>Median</th>
                <th>Maximum</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stats).map(([name, value]) => (
                <tr key={name}>
                  <td>{labels[name] || name}</td>
                  <td>{value.count}</td>
                  <td>{format(value.mean)}</td>
                  <td>{format(value.std)}</td>
                  <td>{format(value.min)}</td>
                  <td>{format(value["50%"])}</td>
                  <td>{format(value.max)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="research-panel">
        <SectionHeading
          eyebrow="02 · ASSOCIATIONS"
          title="Correlation analysis"
          description="Explore the direction and strength of the six pairwise Spearman correlations."
        />
        <CorrelationChart correlations={correlations} />
      </section>

      <section className="research-panel">
        <SectionHeading
          eyebrow="03 · LONGITUDINAL ANALYSIS"
          title="Mixed-effects model"
          description="Regression estimates for daily control relative to a participant's own average and average control between participants."
        />

        <div className="research-tabs">
          {Object.entries(models).map(([outcome, model]) => (
            <ModelTab
              key={outcome}
              outcome={outcome}
              model={model}
            />
          ))}
        </div>
      </section>

            <section className="research-panel">
        <SectionHeading
          eyebrow="04 · DAILY TRENDS"
          title="Research trend charts"
          description="Daily mean scores and participant-level associations from the research dataset."
        />

        <ResearchTrendCharts results={results} />
      </section>

      <section className="research-panel">
        <SectionHeading
          eyebrow="05 · FINDINGS"
          title="Research interpretation"
          description="Plain-language summaries generated from the returned statistics."
        />
        <Interpretation results={results} />
      </section>

      <section className="research-panel">
        <SectionHeading
          eyebrow="06 · DATA QUALITY"
          title="Missing data and limitations"
          description="Important qualifications to include when reporting the findings."
        />

        <div className="research-limitations">
          <article>
            <h3>Missing observations</h3>
            <p>
              The dataset contains 900 rows. Hope, depression and satisfaction
              each have 878 valid values, meaning 22 missing values per measure.
              Perceived control has 818 valid values and 82 missing values.
            </p>
            <p>
              The mixed-effects models use 818 complete observations for the
              required outcome, control and study-day variables. This is
              complete-case analysis for those model variables; it is not
              automatically unbiased if missingness is related to the data.
            </p>
          </article>

          <article>
            <h3>Interpretation limits</h3>
            <ul>
              <li>
                Observational associations do not establish causality.
              </li>
              <li>
                The sample includes 60 participants; generalization depends on
                how participants were recruited and how representative they are.
              </li>
              <li>
                Statistical significance does not by itself establish practical
                importance.
              </li>
              <li>
                These results do not validate this application's AI
                recommendations or show that the application improves health.
              </li>
              <li>
                Confirm the dataset's provenance, usage permissions, variable
                definitions, and original study design before publication.
              </li>
            </ul>
          </article>
        </div>
      </section>

      <footer className="research-footer">
        <span>{results.dataset}</span>
        <a href={results.source} target="_blank" rel="noreferrer">
          Dataset reference ↗
        </a>
      </footer>
    </main>
  );
}

function ModelTab({ outcome, model }) {
  const [open, setOpen] = useState(outcome === "HOPE_T");

  return (
    <article className="research-model">
      <button
        className="research-model-toggle"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span>
          <strong>{labels[outcome] || outcome}</strong>
          <small>
            {model.observations} observations · {model.participants} participants
          </small>
        </span>
        <span>{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="research-model-content">
          <div className="research-model-status">
            <span>
              Model convergence:{" "}
              <strong>{model.converged ? "Successful" : "Not converged"}</strong>
            </span>
            <span>95% confidence intervals</span>
          </div>
          <CoefficientChart model={model} />
        </div>
      )}
    </article>
  );
}
