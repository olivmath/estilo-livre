import { useState, useCallback, useEffect } from "react";
import { collection, query, getDocs, orderBy, getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Loads a student's workouts, session history and paused draft from Firestore.
function enrichExercises(exs, catalogById, catalogByName) {
  return (exs ?? []).map((e) => {
    const cat = catalogById[e.id] || catalogByName[(e.name ?? "").toLowerCase().trim()] || {};
    return { ...e, machine: cat.machine ?? "", alteres: cat.alteres ?? false };
  });
}

export function useStudentData(user) {
  const [workouts, setWorkouts] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      setLoading(true);

      const [wksSnap, sessSnap, exSnap, draftSnap] = await Promise.all([
        getDocs(query(collection(db, "users", user.uid, "workouts"), orderBy("order"))),
        getDocs(query(collection(db, "users", user.uid, "sessions"), orderBy("date", "desc"))),
        getDocs(collection(db, "exercises")),
        getDoc(doc(db, "users", user.uid, "drafts", "current")),
      ]);

      const catalogById = {};
      const catalogByName = {};
      exSnap.forEach((d) => {
        const data = d.data();
        const entry = { machine: data.machine ?? "", alteres: data.alteres ?? false };
        catalogById[d.id] = entry;
        catalogByName[(data.name ?? "").toLowerCase().trim()] = entry;
      });

      const wksList = wksSnap.docs.map((d) => {
        const wk = { id: d.id, ...d.data() };
        return { ...wk, exercises: enrichExercises(wk.exercises, catalogById, catalogByName) };
      });
      setWorkouts(wksList);

      setSessions(sessSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

      if (draftSnap.exists()) {
        const draftData = draftSnap.data();
        setDraft({ ...draftData, exercises: enrichExercises(draftData.exercises, catalogById, catalogByName) });
      } else {
        setDraft(null);
      }
    } catch (e) {
      console.error("Error loading data from Firestore: ", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { workouts, sessions, draft, setDraft, loading, reload: loadData };
}
