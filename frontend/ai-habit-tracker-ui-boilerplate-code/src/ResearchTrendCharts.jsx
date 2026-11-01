
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts";

const variables = [
  ["HOPE_T", "Mean HOPE_T by day"],
  ["DEPRESSION_T", "Mean DEPRESSION_T by day"],
  ["SATISFACTION_T", "Mean SATISFACTION_T by day"],
];

export default function ResearchTrendCharts({ results }) {
  if (
    !results?.daily_means?.length ||
    !results?.participant_means?.length
  ) {
    return <p>Research trend data is not available.</p>;
  }

  return (
    <section className="research-trend-charts">
      <h2>Daily Mean Trends</h2>

      <div className="research-trend-grid">
        {variables.map(([key, title]) => (
          <div key={key}>
            <h3>{title}</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={results.daily_means}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="DAY" />
                <YAxis domain={["auto", "auto"]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey={key}
                  stroke="#2878b5"
                  strokeWidth={2}
                  dot
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>

      <h2>Mean Control vs Mean Life Satisfaction by Participant</h2>

      <ResponsiveContainer width="100%" height={340}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="control"
            name="Mean control"
          />
          <YAxis
            type="number"
            dataKey="satisfaction"
            name="Mean satisfaction"
          />
          <Tooltip />
          <Scatter
            data={results.participant_means}
            fill="#2878b5"
          />
        </ScatterChart>
      </ResponsiveContainer>
    </section>
  );
}
