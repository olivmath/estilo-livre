import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useUserProfile(firebaseUser) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!firebaseUser) {
      setProfile(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const ref = doc(db, "users", firebaseUser.uid);

    getDoc(ref)
      .then(async (snap) => {
        if (cancelled) return;

        if (!snap.exists()) {
          await setDoc(ref, {
            email:     firebaseUser.email,
            name:      firebaseUser.displayName ?? "",
            photoURL:  firebaseUser.photoURL ?? "",
            role:      "aluno",
            createdAt: serverTimestamp(),
          });
          if (!cancelled) setProfile({ role: "aluno", name: firebaseUser.displayName ?? "" });
        } else {
          if (!cancelled) setProfile(snap.data());
        }
      })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [firebaseUser]);

  return { profile, loading, error };
}
