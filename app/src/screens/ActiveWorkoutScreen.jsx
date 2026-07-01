import { useState } from "react";
import { RestOverlay } from "@/components/workout/RestOverlay";
import { RpeOverlay } from "@/components/workout/RpeOverlay";
import { SummaryOverlay } from "@/components/workout/SummaryOverlay";
import { ExitSheet } from "@/components/workout/ExitSheet";
import { ExerciseList } from "@/components/workout/ExerciseList";
import { WeightSheet } from "@/components/workout/WeightSheet";
import { VideoScreen } from "@/components/workout/VideoScreen";
import { WorkoutSwitchSheet } from "@/components/workout/WorkoutSwitchSheet";
import { ActiveWorkoutTopNav } from "@/components/workout/ActiveWorkoutTopNav";
import { ActiveWorkoutMetrics } from "@/components/workout/ActiveWorkoutMetrics";

export function ActiveWorkoutScreen({
  activeWk,
  workouts,
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
  onSwitchWorkout,
}) {
  const [videoEx, setVideoEx] = useState(null);
  const [weightOpen, setWeightOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  const ex = activeWk.exercises[activeWk.exIdx];
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

      <WorkoutSwitchSheet
        open={switcherOpen}
        onOpenChange={setSwitcherOpen}
        workouts={workouts}
        currentId={activeWk.id}
        onSelect={(wkId) => {
          setSwitcherOpen(false);
          onSwitchWorkout(wkId);
        }}
      />

      <ActiveWorkoutTopNav
        label={activeWk.label}
        name={activeWk.name}
        elapsedTime={elapsedTime}
        onSwitchClick={() => setSwitcherOpen(true)}
        onShowExit={onShowExit}
      />

      <div style={S.body}>
        <ActiveWorkoutMetrics
          ex={ex}
          currentSetIdx={activeWk.set}
          currentWeight={activeWk.currentWeight}
          onWeightClick={() => setWeightOpen(true)}
          onAdjustWeight={onAdjustWeight}
        />
        <div style={S.colRight}>
          <ExerciseList exItems={exItems} currentSet={activeWk.set + 1} onVideoClick={setVideoEx} />
        </div>
      </div>

      <div style={{ padding: "10px 14px 26px", flexShrink: 0 }}>
        <button onClick={onNextSet} style={S.ctaBtn}>Concluir Série</button>
      </div>
    </div>
  );
}

const S = {
  page: { background: "var(--bg)", color: "var(--text)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif", height: "100dvh", display: "flex", flexDirection: "column", maxWidth: 430, margin: "0 auto", overflow: "hidden" },
  body: { flex: 1, display: "flex", gap: 10, padding: "0 14px", overflow: "hidden", minHeight: 0 },
  colRight: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  ctaBtn: { width: "100%", padding: 17, borderRadius: 15, border: "none", background: "var(--acc)", color: "#000", fontSize: 17, fontWeight: 800, cursor: "pointer" },
};
