import { useState } from "react";
import { Pencil } from "lucide-react";
import { RestOverlay } from "@/components/workout/RestOverlay";
import { RpeOverlay } from "@/components/workout/RpeOverlay";
import { SummaryOverlay } from "@/components/workout/SummaryOverlay";
import { ExitSheet } from "@/components/workout/ExitSheet";
import { ExerciseList } from "@/components/workout/ExerciseList";
import { WeightSheet } from "@/components/workout/WeightSheet";
import { VideoScreen } from "@/components/workout/VideoScreen";

export function ActiveWorkoutScreen({
  activeWk,
  elapsedTime,
  restTime,
  restTotal,
  restType,
  showRpe,
  rpeValue,
  setRpeValue,
  showSummary,
  summaryData,
  showExit,
  onNextSet,
  onConfirmRpe,
  onAdjustWeight,
  onSaveSession,
  onSkipRest,
  onShowExit,
  onHideExit,
  onConfirmExit,
  onSavePartial,
}) {
  const [videoEx, setVideoEx] = useState(null);
  const [weightOpen, setWeightOpen] = useState(false);

  const ex = activeWk.exercises[activeWk.exIdx];
  const currentSet = activeWk.set + 1;
  const nextEx = activeWk.exercises[activeWk.exIdx + 1];

  const exItems = activeWk.exercises.map((e, i) => {
    const doneIdx = activeWk.results.findIndex((r) => r.name === e.name);
    if (doneIdx !== -1) return { ...e, status: "done", result: activeWk.results[doneIdx] };
    if (i === activeWk.exIdx) return { ...e, status: "current" };
    return { ...e, status: "upcoming" };
  });

  return (
    <div style={S.page}>
      {restTime !== null && (
        <RestOverlay restTime={restTime} restTotal={restTotal} restType={restType}
          nextExName={nextEx?.name} nextExMachine={nextEx?.machine} onSkip={onSkipRest} />
      )}
      {showRpe && (
        <RpeOverlay exName={ex.name} rpeValue={rpeValue} setRpeValue={setRpeValue} onConfirm={onConfirmRpe} />
      )}
      {showSummary && (
        <SummaryOverlay summaryData={summaryData} onSave={onSaveSession} onDiscard={onConfirmExit} />
      )}
      {showExit && (
        <ExitSheet onSavePartial={onSavePartial} onCancel={onHideExit} />
      )}
      {videoEx && (
        <VideoScreen exercise={videoEx} onClose={() => setVideoEx(null)} />
      )}

      <WeightSheet
        open={weightOpen}
        onOpenChange={setWeightOpen}
        value={activeWk.currentWeight}
        onChange={(v) => onAdjustWeight(v - activeWk.currentWeight)}
      />

      {/* Top Nav */}
      <div style={S.topnav}>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.2, color: "var(--acc)", textTransform: "uppercase" }}>
            Treino {activeWk.label}
          </span>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{activeWk.name}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={S.timerPill}>
            <div style={S.liveDot} />
            <span style={{ fontSize: 12, fontVariantNumeric: "tabular-nums", fontWeight: 500, color: "var(--sub)" }}>
              {elapsedTime}
            </span>
          </div>
          <button onClick={onShowExit} style={S.closeBtn}>✕</button>
        </div>
      </div>

      {/* 2-Column Body */}
      <div style={S.body}>
        {/* Left: Metrics */}
        <div style={S.colLeft}>
          <div style={S.metricCard}>
            <span style={S.mcLabel}>Repetições</span>
            <div style={{ fontSize: 62, fontWeight: 900, lineHeight: 1, letterSpacing: -2, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text)" }}>
              <span style={{ fontSize: 22, fontWeight: 600, color: "var(--sub)", marginRight: 2 }}>{ex.sets}×</span>
              {ex.reps}
            </div>
            <div style={{ display: "flex", gap: 5, width: "100%", flexShrink: 0 }}>
              {Array.from({ length: ex.sets }).map((_, i) => (
                <div key={i} style={{
                  flex: 1, height: 6, borderRadius: 3,
                  background: i < activeWk.set ? "var(--green)" : i === activeWk.set ? "var(--acc)" : "var(--bg3)",
                  border: `1px solid ${i < activeWk.set ? "var(--green)" : i === activeWk.set ? "var(--acc)" : "var(--blue)"}`,
                }} />
              ))}
            </div>
          </div>

          <div style={S.metricCard}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={S.mcLabel}>Carga</span>
              <button onClick={() => setWeightOpen(true)} style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${blue}`, background: bg3, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Pencil size={13} color={acc} />
              </button>
            </div>
            <button onClick={() => setWeightOpen(true)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 0 }}>
              <span style={{ fontSize: 52, fontWeight: 900, lineHeight: 1, letterSpacing: -2, color: "var(--acc)", fontVariantNumeric: "tabular-nums" }}>
                {activeWk.currentWeight % 1 === 0 ? activeWk.currentWeight : activeWk.currentWeight.toFixed(1)}
              </span>
              <span style={{ fontSize: 16, fontWeight: 600, color: "var(--sub)", marginLeft: 3, marginTop: 8 }}>kg</span>
            </button>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => onAdjustWeight(-2.5)} style={S.wBtn}>−</button>
              <button onClick={() => onAdjustWeight(2.5)} style={S.wBtn}>+</button>
            </div>
          </div>
        </div>

        {/* Right: Exercise list */}
        <div style={S.colRight}>
          <ExerciseList exItems={exItems} currentSet={currentSet} onVideoClick={setVideoEx} />
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: "10px 14px 26px", flexShrink: 0 }}>
        <button onClick={onNextSet} style={S.ctaBtn}>Concluir Série</button>
      </div>
    </div>
  );
}

const pg = "var(--bg)", bg2 = "var(--bg2)", bg3 = "var(--bg3)", blue = "var(--blue)", acc = "var(--acc)", sub = "var(--sub)", grn = "var(--green)";
const S = {
  page: { background: pg, color: "var(--text)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif", height: "100dvh", display: "flex", flexDirection: "column", maxWidth: 430, margin: "0 auto", overflow: "hidden" },
  topnav: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 10px", flexShrink: 0 },
  timerPill: { display: "flex", alignItems: "center", gap: 5, background: bg3, borderRadius: 20, padding: "5px 10px", border: `1px solid ${blue}` },
  liveDot: { width: 5, height: 5, borderRadius: "50%", background: grn, animation: "blink 1.4s infinite" },
  closeBtn: { width: 28, height: 28, borderRadius: "50%", border: `1px solid ${blue}`, background: bg3, color: sub, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  body: { flex: 1, display: "flex", gap: 10, padding: "0 14px", overflow: "hidden", minHeight: 0 },
  colLeft: { display: "flex", flexDirection: "column", gap: 10, width: "44%", flexShrink: 0 },
  metricCard: { background: bg2, borderRadius: 16, border: `1px solid ${blue}`, flex: "none", height: 200, flexDirection: "column", alignItems: "stretch", padding: "10px 14px 12px", display: "flex" },
  mcLabel: { fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: sub, lineHeight: 1.3, flexShrink: 0 },
  colRight: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  wBtn: { flex: 1, height: 44, borderRadius: 8, border: `1px solid ${blue}`, background: bg3, color: acc, fontSize: 22, fontWeight: 400, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 },
  ctaBtn: { width: "100%", padding: 17, borderRadius: 15, border: "none", background: acc, color: "#000", fontSize: 17, fontWeight: 800, cursor: "pointer" },
};
