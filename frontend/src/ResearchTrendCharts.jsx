
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
                <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="1 5" vertical={false} />
                <XAxis dataKey="DAY" tick={{ fill: "var(--chart-tick)", fontSize: 10 }} axisLine={{ stroke: "var(--chart-grid)" }} tickLine={false} />
                <YAxis domain={["auto", "auto"]} tick={{ fill: "var(--chart-tick)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey={key}
                  stroke="#c6beb0"
                  strokeWidth={1.25}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>

      <h2>Mean Control vs Mean Life Satisfaction by Participant</h2>

      <ResponsiveContainer width="100%" height={340}>
        <ScatterChart>
          <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="1 5" vertical={false} />
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
            fill="#c6beb0"
          />
        </ScatterChart>
      </ResponsiveContainer>
    </section>
  );
}
