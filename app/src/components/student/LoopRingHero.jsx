// Loop ring progress indicator with centered number and label
export function LoopRingHero({ loopsCompleted, totalWorkouts, done, hasDraft }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  let progress = totalWorkouts > 0 ? (done.size / totalWorkouts) : 0;
  if (hasDraft) progress += 0.5 / totalWorkouts;
  const offset = circumference * (1 - progress);

  return (
    <div style={{ display: "flex", justifyContent: "center", marginBottom: "clamp(6px, 1.5vw, 10px)" }}>
      <svg width="200" height="200" viewBox="0 0 220 220" style={{ overflow: "visible", maxWidth: "75vw", height: "auto" }}>
        {/* Background ring */}
        <circle cx={110} cy={110} r={radius} fill="none" stroke="var(--bg3)" strokeWidth={8} strokeLinecap="round" />

        {/* Progress ring - starts at top (12 o'clock) */}
        <circle
          cx={110}
          cy={110}
          r={radius}
          fill="none"
          stroke="var(--acc)"
          strokeWidth={8}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
          transform="rotate(-90 110 110)"
        />

        {/* Number */}
        <text
          x={110}
          y={105}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={56}
          fontWeight={700}
          fill="white"
          fontFamily="system-ui"
        >
          {loopsCompleted}
        </text>

        {/* Label */}
        <text
          x={110}
          y={150}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={12}
          fontWeight={400}
          fill="var(--sub)"
          fontFamily="system-ui"
        >
          loops feitos
        </text>
      </svg>
    </div>
  );
}
