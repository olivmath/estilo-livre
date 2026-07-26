// Captures the workout summary as an image and shares via Web Share API.
import { useState, useCallback } from "react";
import html2canvas from "html2canvas";

export function useShareWorkout() {
  const [sharing, setSharing] = useState(false);

  const share = useCallback(async (elementRef, workoutName) => {
    if (!elementRef.current) return;
    setSharing(true);
    try {
      const canvas = await html2canvas(elementRef.current, {
        backgroundColor: "#06091a",
        scale: 2,
        useCORS: true,
      });

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      const file = new File([blob], `${workoutName || "workout"}.png`, { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      if (e.name !== "AbortError") console.error("Share failed:", e);
    } finally {
      setSharing(false);
    }
  }, []);

  return { share, sharing };
}
