import { Sparkles } from "lucide-react";
import {
  FaDroplet,
  FaPersonRunning,
  FaBookOpen,
  FaDumbbell,
  FaPenNib,
  FaBullseye,
} from "react-icons/fa6";
import { GiMeditation } from "react-icons/gi";
import { useTheme } from "../context/ThemeContext.jsx";

const HABITS = [
  // outer orbit
  { Icon: FaDroplet, color: "#8bc5ff", orbit: "outer", delay: 0 },
  { Icon: FaPersonRunning, color: "#d69acb", orbit: "outer", delay: -10 },
  { Icon: FaBookOpen, color: "#a99aff", orbit: "outer", delay: -20 },
  // middle orbit (reverse direction)
  { Icon: GiMeditation, color: "#b49cff", orbit: "middle", delay: -4, reverse: true },
  { Icon: FaDumbbell, color: "#e2b6ff", orbit: "middle", delay: -16, reverse: true },
  // inner orbit
  { Icon: FaPenNib, color: "#dba7f3", orbit: "inner", delay: -2 },
  { Icon: FaBullseye, color: "#80c8df", orbit: "inner", delay: -10 },
];

const ORBITS = {
  outer: { inset: "0%", duration: 32, planet: 52 },
  middle: { inset: "18%", duration: 24, planet: 46 },
  inner: { inset: "36%", duration: 18, planet: 40 },
};

const STARS = Array.from({ length: 14 }).map((_, i) => ({
  top: `${Math.round(Math.random() * 95)}%`,
  left: `${Math.round(Math.random() * 95)}%`,
  size: 2 + Math.round(Math.random() * 3),
  delay: -Math.random() * 3,
}));

export default function OrbitingHabits() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const sunGradient = isDark
    ? "radial-gradient(circle at 30% 25%, rgba(194,178,255,0.42), rgba(142,128,238,0.28) 60%, rgba(102,117,201,0.22))"
    : "radial-gradient(circle at 30% 25%, #ffffff, #e9e3ff 45%, #c7b8ff 100%)";

  const sunShadow = isDark
    ? "inset 0 1px 0 rgba(255,255,255,0.35), 0 6px 24px rgba(164,145,255,0.34)"
    : "inset 0 1px 0 rgba(255,255,255,0.9), 0 8px 24px rgba(147,128,245,0.22), 0 2px 6px rgba(147,128,245,0.14)";

  const sunBorder = isDark
    ? "1px solid rgba(255,255,255,0.2)"
    : "1px solid rgba(255,255,255,0.8)";

  const sunIconColor = isDark ? "#e6dcff" : "#7667c9";

  const haloBg = isDark
    ? "radial-gradient(circle, rgba(142,128,238,0.28), transparent 70%)"
    : "radial-gradient(circle, rgba(164,145,255,0.23), transparent 70%)";

  return (
    <div className="relative mx-auto w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] lg:w-[460px] lg:h-[460px]">
      {/* twinkling stars */}
      {STARS.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-violet-300/70 dark:bg-violet-200/80"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            animation: `twinkle ${2.5 + (i % 3)}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}

      {/* orbit rings */}
      {Object.entries(ORBITS).map(([k, o]) => (
        <div
          key={k}
          className="absolute rounded-full border border-dashed border-[var(--surface-border)] dark:border-white/10"
          style={{ inset: o.inset }}
        />
      ))}

      {/* soft pulsing halo behind sun */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: "34%",
          height: "34%",
          background: haloBg,
          animation: "pulse-ring 4.5s ease-in-out infinite",
        }}
      />

      {/* central sun — glassy, subtle */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[20%] h-[20%] rounded-full flex items-center justify-center backdrop-blur-xl"
        style={{
          background: sunGradient,
          boxShadow: sunShadow,
          border: sunBorder,
          color: sunIconColor,
        }}
      >
        <Sparkles className="w-1/2 h-1/2" strokeWidth={1.5} />
      </div>

      {/* orbiting habits */}
      {HABITS.map((h, i) => {
        const o = ORBITS[h.orbit];
        const Icon = h.Icon;
        return (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              inset: o.inset,
              animation: `${h.reverse ? "orbit-reverse" : "orbit"} ${o.duration}s linear ${h.delay}s infinite`,
            }}
          >
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl flex items-center justify-center backdrop-blur-md glass-strong"
              style={{
                width: o.planet,
                height: o.planet,
                background: `${h.color}33`,
                borderColor: `${h.color}55`,
                boxShadow: `0 8px 28px ${h.color}55, 0 0 0 1px ${h.color}33`,
                color: h.color,
                animation: `${h.reverse ? "orbit" : "orbit-reverse"} ${o.duration}s linear ${h.delay}s infinite`,
              }}
            >
              <Icon size={o.planet * 0.45} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
