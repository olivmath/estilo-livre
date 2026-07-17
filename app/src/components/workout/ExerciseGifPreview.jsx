import { useTranslation } from "react-i18next";
import { Play } from "lucide-react";
import { getExerciseGif } from "@/lib/exerciseGifs";

export function ExerciseGifPreview({ name, onVideoClick }) {
  const { t } = useTranslation();
  const gif = getExerciseGif(name);

  return (
    <button onClick={onVideoClick} style={S.wrapper}>
      {gif ? (
        <img src={gif} alt={name} style={S.img} />
      ) : (
        <div style={S.placeholder}>
          <div style={S.playCircle}>
            <Play size={20} color="#000" fill="#000" style={{ marginLeft: 2 }} />
          </div>
          <p style={S.placeholderText}>{t("activeWorkout.seeExercise")}</p>
        </div>
      )}
    </button>
  );
}

const S = {
  wrapper: {
    width: "100%", aspectRatio: "16/9", borderRadius: 16,
    overflow: "hidden", background: "#000", border: "1px solid var(--blue)",
    cursor: "pointer", padding: 0, flexShrink: 0, marginBottom: 10,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  img: { width: "100%", height: "100%", objectFit: "contain", background: "#fff" },
  placeholder: {
    display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
  },
  playCircle: {
    width: 48, height: 48, borderRadius: "50%", background: "var(--acc)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  placeholderText: { fontSize: 12, color: "var(--sub)", margin: 0 },
};
