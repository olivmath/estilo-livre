import { UserAvatar } from "@/components/shared";
import { S } from "@/components/student/shared";
import { LoopRingHero } from "@/components/student/LoopRingHero";
import { DraftBanner } from "@/components/student/DraftBanner";
import { Button } from "@/components/ui/button";

// LoopDots: horizontal dots showing workouts + current position
function LoopDots({ workouts, cycleInfo, onSelect }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: 8,
        marginTop: 16,
        flexWrap: "wrap",
      }}
      role="group"
      aria-label="Seletor de treinos"
    >
      {workouts.map((w, idx) => {
        const letter = w.label?.charAt(0).toUpperCase() || String.fromCharCode(65 + idx);
        const isDone = cycleInfo.done.has(w.id);
        const isNext = w.id === cycleInfo.next;

        let variant = "outline";
        if (isNext) variant = "default";
        if (isDone) variant = "secondary";

        const status = isDone ? "concluído" : isNext ? "próximo" : "não iniciado";
        const label = `Treino ${letter} — ${w.name} (${status})`;

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
            aria-label={label}
            aria-pressed={isNext}
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
    <div style={{ padding: "16px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          marginBottom: 16,
        }}
        role="banner"
      >
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, lineHeight: 1.2 }}>
            Bom treino, {profile?.name?.split(" ")[0] ?? "Atleta"} 👋
          </h1>
          <span
            style={{
              fontSize: 10,
              color: "var(--acc)",
              fontWeight: 700,
              letterSpacing: 2,
              display: "block",
            }}
            aria-label="Academia Estilo Livre"
          >
            ACADEMIA ESTILO LIVRE
          </span>
        </div>
        <button
          onClick={onAvatarClick}
          style={{
            cursor: "pointer",
            flexShrink: 0,
            border: "none",
            background: "transparent",
            padding: 0,
          }}
          aria-label={`Editar perfil de ${profile?.name ?? "Atleta"}`}
        >
          <UserAvatar name={profile?.name} photoURL={profile?.photoURL} size={44} />
        </button>
      </div>

      {/* Draft Banner */}
      {draft && (
        <div style={{ marginBottom: 16 }}>
          <DraftBanner draft={draft} onResume={onResumeDraft} onStartFromScratch={onStartFromScratch} />
        </div>
      )}

      {/* Hero: Loop Ring + Dots */}
      {workouts.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <LoopRingHero
            loopsCompleted={cycleInfo.cycles}
            totalWorkouts={workouts.length}
            done={cycleInfo.done}
            hasDraft={!!draft}
          />
          <LoopDots workouts={workouts} cycleInfo={cycleInfo} onSelect={onStart} />
        </div>
      )}

      {/* Empty state */}
      {workouts.length === 0 && (
        <div style={S.cardEmpty} role="status" aria-live="polite">
          <p>Sem treinos atribuídos pelo professor. Fale com seu instrutor.</p>
        </div>
      )}
    </div>
  );
}
