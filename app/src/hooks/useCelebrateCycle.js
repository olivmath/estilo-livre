import { useEffect, useRef } from "react";
import { launchConfetti } from "@/lib/confetti";

// Fires the confetti burst exactly once, the moment loop progress crosses into 100%.
export function useCelebrateCycle(pct) {
  const prevPctRef = useRef(null);
  useEffect(() => {
    if (prevPctRef.current !== null && prevPctRef.current < 100 && pct === 100) {
      launchConfetti();
    }
    prevPctRef.current = pct;
  }, [pct]);
}
