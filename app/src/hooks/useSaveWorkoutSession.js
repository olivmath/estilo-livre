import { doc, updateDoc, addDoc, collection, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Persists a finished workout: writes the session doc and carries the
// exercise weights used forward as the workout's new defaults.
export function useSaveWorkoutSession({ user, workouts, summaryData, closeSummary, reload, onSaved }) {
  return async function saveWorkoutSession() {
    if (!summaryData) return;
    try {
      await addDoc(collection(db, "users", user.uid, "sessions"), summaryData);

      const wk = workouts.find((w) => w.id === summaryData.wkId);
      if (wk) {
        const updatedExs = wk.exercises.map((ex) => {
          const res = summaryData.exs.find((r) => r.name === ex.name);
          return res ? { ...ex, wt: res.wt } : ex;
        });
        await updateDoc(doc(db, "users", user.uid, "workouts", summaryData.wkId), { exercises: updatedExs });
      }

      await deleteDoc(doc(db, "users", user.uid, "drafts", "current")).catch(() => {});

      closeSummary();
      await reload();
      onSaved?.();
    } catch (e) {
      console.error("Error saving session: ", e);
      alert("Erro ao salvar treino. Tente novamente.");
    }
  };
}
