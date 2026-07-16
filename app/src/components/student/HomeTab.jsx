import { UserAvatar } from "@/components/shared";
import { S } from "@/components/student/shared";
import { LoopRingHero } from "@/components/student/LoopRingHero";
import { DraftBanner } from "@/components/student/DraftBanner";
import { Button } from "@/components/ui/button";

// LoopDots: horizontal dots showing workouts + current position
function LoopDots({ workouts, cycleInfo, onSelect }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: -22, marginBottom: 32, flexWrap: "wrap" }}>
      {workouts.map((w, idx) => {
        const letter = w.label?.charAt(0).toUpperCase() || String.fromCharCode(65 + idx);
        const isDone = cycleInfo.done.has(w.id);
        const isNext = w.id === cycleInfo.next;

        let variant = "outline";
        if (isNext) variant = "default";
        if (isDone) variant = "secondary";

        return (
          <Button
            key={w.id}
            variant={variant}
            size="icon"
            onClick={() => onSelect?.(w.id)}
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              boxShadow: isNext ? "0 0 12px rgba(245,196,0,0.3)" : isDone ? "0 0 12px rgba(0,200,83,0.2)" : "none",
            }}
            className={isDone ? "bg-[var(--green)] hover:bg-[var(--green)]" : isNext ? "bg-[var(--acc)] hover:bg-[var(--acc)]" : ""}
          >
            {letter}
          </Button>
        );
      })}
    </div>
  );
}

export function HomeTab({
  profile, workouts, cycleInfo, draft,
  onAvatarClick, onStart, onResumeDraft, onStartFromScratch,
}) {
  return (
    <div style={{ paddingLeft: 16, paddingRight: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 24, marginBottom: 8 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>
            Bom treino, {profile?.name?.split(" ")[0] ?? "Atleta"} 👋
          </h2>
          <span style={{ fontSize: 10, color: "var(--acc)", fontWeight: 700, letterSpacing: 2 }}>ACADEMIA ESTILO LIVRE</span>
        </div>
        <div onClick={onAvatarClick} style={{ cursor: "pointer", flexShrink: 0 }}>
          <UserAvatar name={profile?.name} photoURL={profile?.photoURL} size={44} />
        </div>
      </div>

      {/* Draft Banner */}
      {draft && (
        <DraftBanner draft={draft} onResume={onResumeDraft} onStartFromScratch={onStartFromScratch} />
      )}

      {/* Hero: Loop Ring */}
      {workouts.length > 0 && (
        <LoopRingHero loopsCompleted={cycleInfo.cycles} totalWorkouts={workouts.length} done={cycleInfo.done} hasDraft={!!draft} />
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
