// Loop ring progress indicator with centered number and label
export function LoopRingHero({ loopsCompleted, totalWorkouts, done, hasDraft }) {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  let progress = totalWorkouts > 0 ? (done.size / totalWorkouts) : 0;
  if (hasDraft) progress += 0.5 / totalWorkouts;
  const offset = circumference * (1 - progress);

  return (
    <div style={{ display: "flex", justifyContent: "center", marginBottom: 40 }}>
      <svg width={160} height={160} viewBox="0 0 160 160" style={{ overflow: "visible" }}>
        {/* Background ring */}
        <circle cx={80} cy={80} r={radius} fill="none" stroke="var(--bg3)" strokeWidth={8} strokeLinecap="round" />

        {/* Progress ring - starts at top (12 o'clock) */}
        <circle
          cx={80}
          cy={80}
          r={radius}
          fill="none"
          stroke="var(--acc)"
          strokeWidth={8}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
          transform="rotate(-90 80 80)"
        />

        {/* Number */}
        <text
          x={80}
          y={80}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={48}
          fontWeight={900}
          fill="var(--acc)"
          fontFamily="system-ui"
        >
          {loopsCompleted}
        </text>

        {/* Label */}
        <text
          x={80}
          y={105}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={10}
          fontWeight={700}
          fill="var(--sub)"
          letterSpacing={1}
          fontFamily="system-ui"
        >
          LOOPS
        </text>
      </svg>
    </div>
  );
}
