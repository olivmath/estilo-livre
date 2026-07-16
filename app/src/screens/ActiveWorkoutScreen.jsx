import { useState } from "react";
import { Dumbbell, ListChecks } from "lucide-react";
import { RestOverlay } from "@/components/workout/RestOverlay";
import { RpeOverlay } from "@/components/workout/RpeOverlay";
import { SummaryOverlay } from "@/components/workout/SummaryOverlay";
import { ExitSheet } from "@/components/workout/ExitSheet";
import { WeightSheet } from "@/components/workout/WeightSheet";
import { SetsRepsSheet } from "@/components/workout/SetsRepsSheet";
import { VideoScreen } from "@/components/workout/VideoScreen";
import { WorkoutSwitchSheet } from "@/components/workout/WorkoutSwitchSheet";
import { ExerciseDrawer } from "@/components/workout/ExerciseDrawer";
import { ActiveWorkoutTopNav } from "@/components/workout/ActiveWorkoutTopNav";
import { ActiveWorkoutMetrics } from "@/components/workout/ActiveWorkoutMetrics";

export function ActiveWorkoutScreen({
  activeWk, workouts, elapsedTime,
  restTime, restTotal, restType,
  showRpe, rpeValue, setRpeValue,
  showSummary, summaryData, showExit,
  onNextSet, onConfirmRpe, onAdjustWeight, onSaveSession,
  onSkipRest, onShowExit, onHideExit, onConfirmExit,
  onSavePartial, onSwitchWorkout, onSelectExercise,
  onExitWithoutSave, onUpdateSetsReps,
}) {
  const [videoEx, setVideoEx] = useState(null);
  const [weightOpen, setWeightOpen] = useState(false);
  const [setsRepsOpen, setSetsRepsOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const ex = activeWk.exercises[activeWk.exIdx];
  const nextEx = activeWk.exercises[activeWk.exIdx + 1];
  const hasMachine = ex.machine && ex.machine !== "0";
  const doneCount = activeWk.results.length;

  const exItems = activeWk.exercises.map((e, i) => {
    const doneIdx = activeWk.results.findIndex((r) => r.name === e.name);
    if (doneIdx !== -1) return { ...e, idx: i, status: "done", result: activeWk.results[doneIdx] };
    if (i === activeWk.exIdx) return { ...e, idx: i, status: "current" };
    return { ...e, idx: i, status: "upcoming" };
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
        <ExitSheet onSavePartial={onSavePartial} onCancel={onHideExit} onExitWithoutSave={onExitWithoutSave} />
      )}
      {videoEx && <VideoScreen exercise={videoEx} onClose={() => setVideoEx(null)} />}

      <WeightSheet open={weightOpen} onOpenChange={setWeightOpen}
        value={activeWk.currentWeight}
        onChange={(v) => onAdjustWeight(v - activeWk.currentWeight)} />
      <SetsRepsSheet open={setsRepsOpen} onOpenChange={setSetsRepsOpen}
        sets={ex.sets} reps={ex.reps} onChange={onUpdateSetsReps} />
      <WorkoutSwitchSheet open={switcherOpen} onOpenChange={setSwitcherOpen}
        workouts={workouts} currentId={activeWk.id}
        onSelect={(wkId) => { setSwitcherOpen(false); onSwitchWorkout(wkId); }} />
      <ExerciseDrawer open={drawerOpen} onOpenChange={setDrawerOpen}
        exItems={exItems} currentSet={activeWk.set + 1}
        onVideoClick={setVideoEx} onSelect={onSelectExercise} />

      <ActiveWorkoutTopNav label={activeWk.label} name={activeWk.name}
        elapsedTime={elapsedTime} onSwitchClick={() => setSwitcherOpen(true)} onShowExit={onShowExit} />

      <div style={S.exHeader}>
        <div style={S.exIcon}>
          {hasMachine ? (
            <>
              <span style={{ fontSize: 8, color: "var(--sub)", fontWeight: 600, lineHeight: 1 }}>máq</span>
              <span style={{ fontSize: 14, color: "var(--acc)", fontWeight: 800, lineHeight: 1 }}>{ex.machine}</span>
            </>
          ) : (
            <Dumbbell size={16} color="var(--sub)" />
          )}
        </div>
        <h1 style={S.exName}>{ex.name}</h1>
        <button onClick={() => setDrawerOpen(true)} style={S.listBtn}>
          <ListChecks size={18} color="var(--acc)" />
          <span style={S.listLabel}>{doneCount}/{activeWk.exercises.length}</span>
        </button>
      </div>

      <div style={S.body}>
        <ActiveWorkoutMetrics ex={ex} currentSetIdx={activeWk.set}
          currentWeight={activeWk.currentWeight}
          onWeightClick={() => setWeightOpen(true)}
          onSetsRepsClick={() => setSetsRepsOpen(true)} />
      </div>

      <div style={{ padding: "10px 14px 26px", flexShrink: 0 }}>
        <button onClick={onNextSet} style={S.ctaBtn}>Concluir Série</button>
      </div>
    </div>
  );
}

const blue = "var(--blue)", bg3 = "var(--bg3)";
const S = {
  page: { background: "var(--bg)", color: "var(--text)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif", height: "100dvh", display: "flex", flexDirection: "column", maxWidth: 430, margin: "0 auto", overflow: "hidden" },
  exHeader: { display: "flex", alignItems: "center", gap: 10, padding: "8px 14px 4px" },
  exIcon: { width: 36, height: 36, borderRadius: 10, background: bg3, border: `1px solid ${blue}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1, flexShrink: 0 },
  exName: { fontSize: 22, fontWeight: 800, color: "var(--text)", margin: 0, lineHeight: 1.2, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  listBtn: { flexShrink: 0, height: 40, borderRadius: 12, border: `1px solid ${blue}`, background: bg3, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, padding: "0 12px" },
  listLabel: { fontSize: 13, fontWeight: 700, color: "var(--acc)", fontVariantNumeric: "tabular-nums" },
  body: { flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 14px", overflow: "hidden", minHeight: 0 },
  ctaBtn: { width: "100%", padding: 17, borderRadius: 15, border: "none", background: "var(--acc)", color: "#000", fontSize: 17, fontWeight: 800, cursor: "pointer" },
};
