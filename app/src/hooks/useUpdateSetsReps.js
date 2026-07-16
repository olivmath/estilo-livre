// Persists sets/reps edits to both active state and Firestore workout doc.
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useUpdateSetsReps({ user, activeWk, setActiveWk, workouts }) {
  const updateSetsReps = async ({ sets, reps }) => {
    if (!activeWk) return;
    const ex = activeWk.exercises[activeWk.exIdx];
    const newExercises = activeWk.exercises.map((e, i) =>
      i === activeWk.exIdx ? { ...e, sets, reps } : e,
    );
    setActiveWk((prev) => ({
      ...prev,
      exercises: newExercises,
      set: Math.min(prev.set, sets - 1),
    }));
    const wk = workouts.find((w) => w.id === activeWk.id);
    if (!wk) return;
    const updatedWkExs = wk.exercises.map((e) =>
      e.name === ex.name ? { ...e, sets, reps } : e,
    );
    await updateDoc(
      doc(db, "users", user.uid, "workouts", activeWk.id),
      { exercises: updatedWkExs },
    ).catch(() => {});
  };

  return updateSetsReps;
}
