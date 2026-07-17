import { useTranslation } from "react-i18next";
import { ChevronLeft, Play } from "lucide-react";
import { getExerciseGif } from "@/lib/exerciseGifs";

export function VideoScreen({ exercise, onClose }) {
  const { t } = useTranslation();
  if (!exercise) return null;
  const { name, sets, reps, machine, alteres } = exercise;
  const hasMachine = machine && machine !== "0";
  const equipment = hasMachine ? t("common.machineFull", { n: machine }) : alteres ? t("common.dumbbells") : t("common.freeWeight");
  const gif = getExerciseGif(name);

  const stats = [
    { lbl: t("common.sets"), val: sets },
    { lbl: t("common.reps"), val: reps },
    { lbl: t("common.equipment"), val: equipment },
  ];

  return (
    <div style={S.screen}>
      <div style={S.topbar}>
        <button onClick={onClose} style={S.backBtn}><ChevronLeft size={20} color="var(--text)" /></button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</p>
          <p style={{ fontSize: 11, color: "var(--sub)", margin: 0 }}>{sets}×{reps} · {equipment}</p>
        </div>
      </div>

      <div style={S.videoBox}>
        {gif ? (
          <img src={gif} alt={name} style={{ width: "100%", height: "100%", objectFit: "contain", background: "#fff" }} />
        ) : (
          <>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--acc)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Play size={28} color="#000" fill="#000" style={{ marginLeft: 3 }} />
            </div>
            <p style={{ color: "var(--sub)", fontSize: 12, marginTop: 12 }}>{t("video.comingSoon")}</p>
          </>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "0 16px 20px" }}>
        {stats.map(({ lbl, val }) => (
          <div key={lbl} style={S.statBox}>
            <p style={{ fontSize: 16, fontWeight: 800, color: "var(--acc)", margin: 0, lineHeight: 1.2 }}>{val}</p>
            <p style={{ fontSize: 10, color: "var(--sub)", margin: 0, marginTop: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>{lbl}</p>
          </div>
        ))}
      </div>

      <div style={{ padding: "0 16px", flex: 1 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--sub)", marginBottom: 10 }}>{t("video.tips")}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[t("video.tip1"), t("video.tip2"), t("video.tip3")].map((tip, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ color: "var(--acc)", fontWeight: 700, flexShrink: 0, fontSize: 14, marginTop: 1 }}>·</span>
              <p style={{ fontSize: 13, color: "var(--sub)", margin: 0, lineHeight: 1.5 }}>{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const S = {
  screen: { position: "fixed", inset: 0, zIndex: 200, background: "var(--bg)", maxWidth: 430, margin: "0 auto", display: "flex", flexDirection: "column", overflowY: "auto" },
  topbar: { display: "flex", alignItems: "center", gap: 10, padding: "14px 16px 12px", borderBottom: "1px solid var(--blue)", flexShrink: 0 },
  backBtn: { width: 36, height: 36, borderRadius: 10, border: "1px solid var(--blue)", background: "var(--bg3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  videoBox: { width: "100%", aspectRatio: "16/9", background: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, marginBottom: 16 },
  statBox: { background: "var(--bg2)", borderRadius: 12, padding: "12px 10px", textAlign: "center", border: "1px solid var(--blue)" },
};
