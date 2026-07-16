import { useState } from "react";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useWorkoutTimers } from "./useWorkoutTimers";
import { useWorkoutDraft } from "./useWorkoutDraft";
import { useSaveWorkoutSession } from "./useSaveWorkoutSession";
import { useUpdateSetsReps } from "./useUpdateSetsReps";
import { lastWeightFor } from "./useWorkoutCycle";

export function useActiveWorkoutSession({ user, workouts, sessions, setDraft, reload, onSaved }) {
  const [activeWk, setActiveWk] = useState(null);
  const [restTime, setRestTime] = useState(null);
  const [restTotal, setRestTotal] = useState(null);
  const [restType, setRestType] = useState(null);
  const [showExit, setShowExit] = useState(false);
  const [showRpe, setShowRpe] = useState(false);
  const [rpeValue, setRpeValue] = useState(5);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState(null);

  const { elapsedTime, setElapsedTime } = useWorkoutTimers(activeWk, showSummary, restTime, setRestTime);

  const startWorkout = (wkId) => {
    const wk = workouts.find((w) => w.id === wkId);
    if (!wk?.exercises?.length) return alert("Este treino não possui exercícios cadastrados.");
    setActiveWk({
      id: wk.id,
      label: wk.label,
      name: wk.name,
      color: wk.color || "var(--acc)",
      exercises: wk.exercises.map((ex) => ({ ...ex })),
      exIdx: 0,
      set: 0,
      progress: {},
      start: Date.now(),
      results: [],
      currentWeight: lastWeightFor(sessions, wk.exercises[0]?.name, wk.exercises[0]?.wt || 0),
      exStart: Date.now(),
    });
    setRestTime(null);
    setShowRpe(false);
    setShowSummary(false);
    setElapsedTime("00:00");
  };

  const selectExercise = (idx) => {
    if (idx === activeWk.exIdx) return;
    const isDone = activeWk.results.some((r) => r.name === activeWk.exercises[idx].name);
    if (isDone) return;
    setActiveWk((prev) => ({
      ...prev,
      exIdx: idx,
      set: prev.progress?.[prev.exercises[idx].name] || 0,
      currentWeight: lastWeightFor(sessions, prev.exercises[idx].name, prev.exercises[idx].wt || 0),
      exStart: Date.now(),
    }));
  };

  const handleNextSet = () => {
    const ex = activeWk.exercises[activeWk.exIdx];
    const newSet = activeWk.set + 1;
    if (newSet >= ex.sets) {
      setRpeValue(5);
      setShowRpe(true);
    } else {
      setActiveWk((prev) => ({ ...prev, set: newSet, progress: { ...prev.progress, [ex.name]: newSet } }));
      setRestTotal(30);
      setRestType("rest");
      setRestTime(30);
    }
  };

  const confirmRpe = () => {
    const ex = activeWk.exercises[activeWk.exIdx];
    const timeSpent = Math.floor((Date.now() - activeWk.exStart) / 1000);
    const resultItem = {
      exId: ex.id || Math.random().toString(36).slice(2, 10),
      num: ex.num || "", name: ex.name, mac: ex.mac || "",
      wt: activeWk.currentWeight, diff: rpeValue,
      sets: ex.sets, reps: ex.reps, time: timeSpent,
    };
    const updatedResults = [...activeWk.results, resultItem];
    const doneNames = new Set(updatedResults.map((r) => r.name));
    const nextIdx = activeWk.exercises.findIndex((e, i) => i !== activeWk.exIdx && !doneNames.has(e.name));
    setShowRpe(false);

    if (nextIdx === -1) {
      const sec = Math.floor((Date.now() - activeWk.start) / 1000);
      setSummaryData({
        wkId: activeWk.id, wkLabel: activeWk.label, wkName: activeWk.name, wkColor: activeWk.color,
        date: Date.now(), dur: sec, exs: updatedResults,
      });
      setShowSummary(true);
    } else {
      const nextExName = activeWk.exercises[nextIdx].name;
      const nextState = {
        ...activeWk, results: updatedResults, exIdx: nextIdx, set: activeWk.progress?.[nextExName] || 0,
        currentWeight: lastWeightFor(sessions, nextExName, activeWk.exercises[nextIdx].wt || 0),
        exStart: Date.now(),
      };
      setActiveWk(nextState);
      setRestTotal(45);
      setRestType("transition");
      setRestTime(45);
      // Auto-save so "Continuar depois" resumes from here even without an explicit exit.
      setDoc(doc(db, "users", user.uid, "drafts", "current"), { ...nextState, savedAt: Date.now() }).catch(() => {});
    }
  };

  const discardWorkout = () => {
    setActiveWk(null);
    setShowSummary(false);
    setSummaryData(null);
    setShowExit(false);
  };

  const exitWithoutSave = async () => {
    await deleteDoc(doc(db, "users", user.uid, "drafts", "current")).catch(() => {});
    discardWorkout();
  };

  const saveWorkoutSession = useSaveWorkoutSession({
    user, workouts, summaryData, reload, onSaved,
    closeSummary: () => { setActiveWk(null); setShowSummary(false); setSummaryData(null); },
  });

  const draftActions = useWorkoutDraft({ user, activeWk, setActiveWk, setDraft, closeActiveSession: discardWorkout, startWorkout });

  const skipRest = () => { setRestTime(null); setRestType(null); setRestTotal(null); };

  const adjustActiveWeight = (val) => {
    setActiveWk((prev) => ({
      ...prev,
      currentWeight: Math.max(0, parseFloat((prev.currentWeight + val).toFixed(1))),
    }));
  };

  const updateSetsReps = useUpdateSetsReps({ user, activeWk, setActiveWk, workouts });

  return {
    activeWk, elapsedTime, restTime, restTotal, restType,
    showExit, setShowExit, showRpe, rpeValue, setRpeValue,
    showSummary, summaryData,
    startWorkout, handleNextSet, confirmRpe, saveWorkoutSession, discardWorkout, exitWithoutSave,
    skipRest, adjustActiveWeight, selectExercise, updateSetsReps,
    ...draftActions,
  };
}
