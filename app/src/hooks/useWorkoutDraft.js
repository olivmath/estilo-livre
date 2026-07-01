import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// "Continuar depois" — a single paused-workout slot kept at drafts/current
// in Firestore, resumed or discarded from the home tab banner. Also owns
// switchWorkout, which auto-saves the current session as a draft first.
export function useWorkoutDraft({ user, activeWk, setActiveWk, setDraft, closeActiveSession, startWorkout }) {
  const deleteDraft = async () => {
    await deleteDoc(doc(db, "users", user.uid, "drafts", "current"));
    setDraft(null);
  };

  const savePartialWorkout = async () => {
    const draftRef = doc(db, "users", user.uid, "drafts", "current");
    await setDoc(draftRef, { ...activeWk, savedAt: Date.now() });
    setDraft({ ...activeWk, savedAt: Date.now() });
    closeActiveSession();
  };

  const resumeWorkout = (d) => {
    const { savedAt, ...wkState } = d;
    setActiveWk({ ...wkState, start: Date.now() - (savedAt - wkState.start) });
  };

  const startFromScratch = async (wkId) => {
    await deleteDraft();
    startWorkout(wkId);
  };

  const switchWorkout = async (wkId) => {
    if (!activeWk || wkId === activeWk.id) return;
    await setDoc(doc(db, "users", user.uid, "drafts", "current"), { ...activeWk, savedAt: Date.now() });
    setDraft({ ...activeWk, savedAt: Date.now() });
    startWorkout(wkId);
  };

  return { deleteDraft, savePartialWorkout, resumeWorkout, startFromScratch, switchWorkout };
}
