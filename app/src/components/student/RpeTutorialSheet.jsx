import { useTranslation } from "react-i18next";
import { Sheet, SheetContent } from "@/components/ui/sheet";

const TOTAL = 3;
const txt = { color: "#8899bb", fontSize: 13, lineHeight: 1.6 };
const miniChart = (color, points) => (
  <svg width="100%" height="60" viewBox="0 0 260 60" preserveAspectRatio="none" style={{ display: "block", marginBottom: 6 }}>
    <defs><linearGradient id={`tg-${color}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.3" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
    <polygon points={`4,60 ${points} 256,60`} fill={`url(#tg-${color})`} />
    <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    {points.split(" ").map((pt, i) => { const [cx, cy] = pt.split(","); return <circle key={i} cx={cx} cy={cy} r="3.5" fill={color} />; })}
  </svg>
);

export function RpeTutorialSheet({ open, onOpenChange, slide, setSlide }) {
  const { t } = useTranslation();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" style={{ background: "#0b1228", border: "none", borderRadius: "20px 20px 0 0", padding: "20px 20px 44px", maxHeight: "88vh", overflowY: "auto", maxWidth: 430, margin: "0 auto" }}>
        <div style={{ width: 40, height: 4, background: "#162040", borderRadius: 2, margin: "0 auto 18px" }} />
        <div style={{ marginBottom: 18 }}>
          <span style={{ fontSize: 17, fontWeight: 700 }}>{t("rpeTutorial.title")}</span>
        </div>

        {slide === 0 && <RpeSlide0 t={t} />}
        {slide === 1 && <RpeSlide1 t={t} />}
        {slide === 2 && <RpeSlide2 t={t} />}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 22 }}>
          <button onClick={() => setSlide((s) => s - 1)} style={{ visibility: slide === 0 ? "hidden" : "visible", background: "#162040", border: "none", color: "#fff", fontSize: 14, fontWeight: 600, padding: "10px 20px", borderRadius: 10, cursor: "pointer" }}>← {t("rpeTutorial.previous")}</button>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {Array.from({ length: TOTAL }, (_, i) => (
              <div key={i} style={{ width: i === slide ? 18 : 6, height: 6, borderRadius: 3, background: i === slide ? "#F5C400" : "#162040", transition: "all .25s" }} />
            ))}
          </div>
          {slide < TOTAL - 1
            ? <button onClick={() => setSlide((s) => s + 1)} style={{ background: "#F5C400", border: "none", color: "#06091a", fontSize: 14, fontWeight: 600, padding: "10px 20px", borderRadius: 10, cursor: "pointer" }}>{t("rpeTutorial.nextStep")} →</button>
            : <button onClick={() => onOpenChange(false)} style={{ background: "#F5C400", border: "none", color: "#06091a", fontSize: 14, fontWeight: 600, padding: "10px 20px", borderRadius: 10, cursor: "pointer" }}>{t("common.close")} ✓</button>}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function RpeSlide0({ t }) {
  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{t("rpeTutorial.whatIsRpe")}</div>
      <div style={{ ...txt, marginBottom: 14 }}>RPE = <b style={{ color: "#fff" }}>{t("rpeTutorial.perceivedEffort")}</b> — 0–10.</div>
      <div style={{ background: "#162040", borderRadius: 10, padding: "14px 12px 10px", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "10px 0 4px" }}>
          <span style={{ fontSize: 11, color: "#3a4a70", width: 28 }}>0</span>
          <div style={{ flex: 1, height: 10, borderRadius: 5, background: "linear-gradient(to right,#00c853,#F5C400,#f44336)" }} />
          <span style={{ fontSize: 11, color: "#3a4a70", width: 28, textAlign: "right" }}>10</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#3a4a70", marginTop: 4, padding: "0 36px" }}>
          <span>{t("rpeTutorial.noEffort")}</span><span>{t("rpeTutorial.maximum")}</span>
        </div>
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 7 }}>
          <div style={{ fontSize: 13 }}><b style={{ color: "#00c853" }}>1–3</b> — {t("rpeTutorial.easy")}</div>
          <div style={{ fontSize: 13 }}><b style={{ color: "#F5C400" }}>4–6</b> — {t("rpeTutorial.moderate")}</div>
          <div style={{ fontSize: 13 }}><b style={{ color: "#f44336" }}>7–10</b> — {t("rpeTutorial.intense")}</div>
        </div>
      </div>
      <div style={txt}>{t("rpeTutorial.rpeAvg")}</div>
    </div>
  );
}

function RpeSlide1({ t }) {
  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: "#00c853" }}>↑ {t("rpeTutorial.evolving")}</div>
      <div style={{ ...txt, marginBottom: 14 }}>{t("rpeTutorial.surpassing")}</div>
      <div style={{ background: "#162040", borderRadius: 10, padding: "14px 12px 10px", marginBottom: 14 }}>
        {miniChart("#00c853", "4,40 69,35 134,30 199,20 256,14")}
      </div>
      <div style={{ background: "rgba(0,200,83,.08)", border: "1px solid rgba(0,200,83,.2)", borderRadius: 10, padding: 12, fontSize: 13, color: "#8899bb", lineHeight: 1.5 }}>
        <b style={{ color: "#00c853" }}>{t("rpeTutorial.green")}</b> — {t("rpeTutorial.keepItUp")}
      </div>
    </div>
  );
}

function RpeSlide2({ t }) {
  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: "#f44336" }}>↑ {t("rpeTutorial.increaseWeight")}</div>
      <div style={{ ...txt, marginBottom: 14 }}>RPE ≤ 6</div>
      <div style={{ background: "#162040", borderRadius: 10, padding: "14px 12px 10px", marginBottom: 14 }}>
        {miniChart("#f44336", "4,28 69,30 134,28 199,30 256,29")}
      </div>
      <div style={{ background: "rgba(244,67,54,.08)", border: "1px solid rgba(244,67,54,.2)", borderRadius: 10, padding: 12, fontSize: 13, color: "#8899bb", lineHeight: 1.5 }}>
        <b style={{ color: "#f44336" }}>{t("rpeTutorial.red")}</b> — {t("rpeTutorial.increaseWeightTip")}
      </div>
    </div>
  );
}
