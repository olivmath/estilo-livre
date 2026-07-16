import { UserAvatar } from "@/components/shared";
import { S } from "@/components/student/shared";

// LoopRing: hero component showing completed loops + current progress
function LoopRing({ loopsCompleted, totalWorkouts, done }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const progress = totalWorkouts > 0 ? (done.size / totalWorkouts) : 0;
  const offset = circumference * (1 - progress);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, marginBottom: 40 }}>
      <svg width={140} height={140} style={{ transform: "rotate(-90deg)" }}>
        {/* Background ring */}
        <circle cx={70} cy={70} r={radius} fill="none" stroke="var(--bg3)" strokeWidth={3} />
        {/* Progress ring */}
        <circle
          cx={70}
          cy={70}
          r={radius}
          fill="none"
          stroke="var(--acc)"
          strokeWidth={3}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div style={{ textAlign: "center", marginTop: -120 }}>
        <div style={{ fontSize: 48, fontWeight: 900, color: "var(--acc)" }}>
          {loopsCompleted}
        </div>
        <div style={{ fontSize: 10, color: "var(--sub)", letterSpacing: 1, fontWeight: 700 }}>
          LOOPS
        </div>
      </div>
    </div>
  );
}

// LoopDots: horizontal dots showing workouts + current position
function LoopDots({ workouts, cycleInfo, onSelect }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 32 }}>
      {workouts.map((w, idx) => {
        const letter = w.label?.charAt(0).toUpperCase() || String.fromCharCode(65 + idx);
        const isDone = cycleInfo.done.has(w.id);
        const isNext = w.id === cycleInfo.next;

        return (
          <button
            key={w.id}
            onClick={() => onSelect?.(w)}
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: "2px solid",
              borderColor: isNext ? "var(--acc)" : isDone ? "var(--green)" : "var(--bg3)",
              backgroundColor: isNext ? "var(--acc)" : isDone ? "var(--green)" : "transparent",
              color: isNext || isDone ? "var(--bg)" : "var(--sub)",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {letter}
          </button>
        );
      })}
    </div>
  );
}

export function HomeTab({
  profile, workouts, cycleInfo,
  onAvatarClick, onStart,
}) {
  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 32, marginBottom: 40 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>
            Bom treino, {profile?.name?.split(" ")[0] ?? "Atleta"} 👋
          </h2>
          <span style={{ fontSize: 10, color: "var(--acc)", fontWeight: 700, letterSpacing: 2 }}>ACADEMIA ESTILO LIVRE</span>
        </div>
        <div onClick={onAvatarClick} style={{ cursor: "pointer" }}>
          <UserAvatar name={profile?.name} photoURL={profile?.photoURL} size={44} />
        </div>
      </div>

      {/* Hero: Loop Ring */}
      {workouts.length > 0 && (
        <LoopRing loopsCompleted={cycleInfo.cycles} totalWorkouts={workouts.length} done={cycleInfo.done} />
      )}

      {/* Loop Dots */}
      {workouts.length > 0 && (
        <LoopDots workouts={workouts} cycleInfo={cycleInfo} onSelect={onStart} />
      )}

      {/* Empty state */}
      {workouts.length === 0 && (
        <div style={S.cardEmpty}><p>Sem treinos atribuídos pelo professor. Fale com seu instrutor.</p></div>
      )}
    </div>
  );
}
