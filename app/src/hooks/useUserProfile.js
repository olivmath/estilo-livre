import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Timeout before assuming the trigger failed and showing an error
const TRIGGER_TIMEOUT_MS = 15000;

export function useUserProfile(firebaseUser) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!firebaseUser) {
      setProfile(null);
      return;
    }

    setLoading(true);
    setError(null);

    const ref = doc(db, "users", firebaseUser.uid);
    let timeoutId;

    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          clearTimeout(timeoutId);
          if (snap.data().role === "negado") {
            setError("Seu email não está cadastrado na academia.");
            setLoading(false);
          } else {
            setProfile(snap.data());
            setLoading(false);
          }
        }
        // else: onUserCreate trigger is still running — keep spinner, wait for next snapshot
      },
      (err) => {
        clearTimeout(timeoutId);
        setError(err.message);
        setLoading(false);
      }
    );

    // If the trigger never creates the doc (e.g. cold-start failure), show error after timeout
    timeoutId = setTimeout(() => {
      setError("Não foi possível verificar seu acesso. Tente novamente.");
      setLoading(false);
    }, TRIGGER_TIMEOUT_MS);

    return () => {
      unsub();
      clearTimeout(timeoutId);
    };
  }, [firebaseUser]);

  return { profile, loading, error };
}
