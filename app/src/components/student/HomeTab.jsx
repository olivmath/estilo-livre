// Home tab (Tela 1): header, loop ring, workout dots, trend chips, CTA.
// Fits entirely within 430px viewport without scrolling.
import { UserAvatar } from "@/components/shared";
import { S } from "@/components/student/shared";
import { DraftBanner } from "@/components/student/DraftBanner";
import { LoopRing } from "@/components/student/LoopRing";
import { TrendChips } from "@/components/student/TrendChips";
import { Check } from "lucide-react";

export function HomeTab({
  profile, workouts, draft, cycleInfo, homeStats,
  onAvatarClick, onStart, onResumeDraft, onStartFromScratch, onDrillDown,
}) {
  const nextWk = workouts.find((w) => w.id === cycleInfo.next);

  if (draft) {
    return (
      <div style={{ paddingTop: 24 }}>
        <Header profile={profile} onAvatarClick={onAvatarClick} />
        <DraftBanner draft={draft} onResume={onResumeDraft} onStartFromScratch={onStartFromScratch} />
        {homeStats && <TrendChips metrics={homeStats.metrics} onDrillDown={onDrillDown} />}
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 24 }}>
      <Header profile={profile} onAvatarClick={onAvatarClick} />
      <div style={{ marginBottom: 12 }}>
        <LoopRing cycles={cycleInfo.cycles} pct={cycleInfo.pct} />
      </div>
      <LoopDots workouts={workouts} cycleInfo={cycleInfo} onSelect={onStart} />
      {homeStats && <TrendChips metrics={homeStats.metrics} onDrillDown={onDrillDown} />}
      {nextWk && !draft && (
        <button onClick={() => onStart(nextWk.id)} style={{
          ...S.btnPrimary, width: "100%", marginTop: 12, borderRadius: 12,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          <span style={{ fontSize: 14 }}>▶</span>
          <span>Começar treino {nextWk.label} · {nextWk.exercises?.length || 0} exercícios</span>
        </button>
      )}
      {!workouts.length && <div style={S.cardEmpty}><p>Sem treinos atribuídos.</p></div>}
    </div>
  );
}

function Header({ profile, onAvatarClick }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
      <div>
        <h2 style={{ fontSize: 14, fontWeight: 500, color: "#F5F3EC" }}>
          Bom treino, {profile?.name?.split(" ")[0] ?? "Atleta"} 👋
        </h2>
        <span style={{ fontSize: 9, color: "#F0C64A", fontWeight: 500, letterSpacing: 2 }}>ACADEMIA ESTILO LIVRE</span>
      </div>
      <div onClick={onAvatarClick} style={{ cursor: "pointer" }}>
        <UserAvatar name={profile?.name} photoURL={profile?.photoURL} size={30} />
      </div>
    </div>
  );
}

function LoopDots({ workouts, cycleInfo, onSelect }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 9, marginBottom: 14 }}>
      {workouts.map((w) => {
        const isDone = cycleInfo.done.has(w.id);
        const isNext = w.id === cycleInfo.next;
        return (
          <div key={w.id} onClick={() => onSelect?.(w.id)} style={{
            width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 9, fontWeight: 500, cursor: "pointer",
            background: isDone ? "#F0C64A" : "#1C2440",
            border: isNext ? "2px solid #F0C64A" : isDone ? "none" : "1px solid #2A3350",
            color: isDone ? "#2E2404" : isNext ? "#F5F3EC" : "#5C6480",
          }}>
            {isDone ? <Check size={11} strokeWidth={3} /> : w.label}
          </div>
        );
      })}
    </div>
  );
}
