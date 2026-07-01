import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Backs the EditWeightModal: which exercise is being edited, the input value,
// and persisting the new default weight onto the workout's exercise list.
export function useEditWeight(user, workouts, reload) {
  const [editingEx, setEditingEx] = useState(null);
  const [exWeightInput, setExWeightInput] = useState(0);

  const openSetWeightModal = (wk, ex) => {
    setEditingEx({ wkId: wk.id, exId: ex.id, name: ex.name });
    setExWeightInput(ex.wt || 0);
  };

  const saveEditedWeight = async () => {
    if (!editingEx) return;
    try {
      const wk = workouts.find((w) => w.id === editingEx.wkId);
      if (wk) {
        const updatedExs = wk.exercises.map((ex) =>
          ex.id === editingEx.exId ? { ...ex, wt: parseFloat(exWeightInput) || 0 } : ex
        );
        await updateDoc(doc(db, "users", user.uid, "workouts", editingEx.wkId), { exercises: updatedExs });
        setEditingEx(null);
        await reload();
      }
    } catch (e) {
      console.error("Error updating weight: ", e);
      alert("Erro ao salvar carga.");
    }
  };

  return { editingEx, exWeightInput, setExWeightInput, openSetWeightModal, saveEditedWeight, closeEditWeight: () => setEditingEx(null) };
}
