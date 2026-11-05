import { weekKeys } from "../utils/dateHelpers.js";
import { Check } from "lucide-react";

export default function WeeklyGrid({ habits, logsByHabit, days: customDays }) {
  const days = customDays || weekKeys();
  const todayKey = new Date().toISOString().slice(0, 10);

  if (!habits.length) {
    return (
      <div className="card p-6 text-center text-muted text-sm">
        Create a habit to see your weekly grid.
      </div>
    );
  }

  return (
    <div className="dashboard-weekly-grid overflow-x-auto">
      <div className="min-w-[520px]">
        <div className="grid grid-cols-[180px_repeat(7,minmax(0,1fr))] gap-2 items-center mb-2">
          <div className="text-xs font-medium text-muted uppercase tracking-wider">
            Habit
          </div>
          {days.map((d) => (
            <div
              key={d.key}
              className={`text-center text-xs font-medium ${
                d.key === todayKey ? "text-brand-600 dark:text-brand-300" : "text-muted"
              }`}
            >
              <div>{d.label}</div>
              <div className="text-faint">{d.short}</div>
            </div>
          ))}
        </div>

        {habits.map((h) => {
          const done = new Set(logsByHabit[h._id] || []);
          return (
            <div
              key={h._id}
              className="grid grid-cols-[180px_repeat(7,minmax(0,1fr))] gap-2 items-center py-2 border-t divider"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-7 h-7 rounded-sm border border-zinc-800 flex items-center justify-center text-base shrink-0"
                  style={{ color: "var(--text-soft)" }}
                >
                  {h.icon}
                </span>
                <span className="text-sm truncate">{h.name}</span>
              </div>
              {days.map((d) => {
                const isDone = done.has(d.key);
                return (
                  <div key={d.key} className="flex items-center justify-center">
                    <div
                      className={`w-7 h-7 rounded-[1px] border border-zinc-800/80 flex items-center justify-center transition ${isDone ? "text-[#151615]" : "text-zinc-700"}`}
                      style={
                        isDone
                          ? { background: "rgba(232,229,222,.82)", borderColor: "rgba(232,229,222,.82)" }
                          : { background: "rgba(255,255,255,.025)" }
                      }
                    >
                      {isDone && <Check size={13} strokeWidth={1.8} />}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
