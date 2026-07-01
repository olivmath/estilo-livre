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

// Explains the "Intensidade do treino" RPE chart on first use — 3-slide shadcn Sheet.
export function RpeTutorialSheet({ open, onOpenChange, slide, setSlide }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" style={{ background: "#0b1228", border: "none", borderRadius: "20px 20px 0 0", padding: "20px 20px 44px", maxHeight: "88vh", overflowY: "auto", maxWidth: 430, margin: "0 auto" }}>
        <div style={{ width: 40, height: 4, background: "#162040", borderRadius: 2, margin: "0 auto 18px" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <span style={{ fontSize: 17, fontWeight: 700 }}>Entendendo o gráfico</span>
          <button onClick={() => onOpenChange(false)} style={{ width: 36, height: 36, borderRadius: 8, background: "#162040", border: "none", color: "#8899bb", fontSize: 16, cursor: "pointer" }}>✕</button>
        </div>

        {slide === 0 && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>O que é RPE?</div>
            <div style={{ ...txt, marginBottom: 14 }}>RPE significa <b style={{ color: "#fff" }}>Esforço Percebido</b> — uma nota de 0 a 10 que você dá ao exercício logo depois de terminar.</div>
            <div style={{ background: "#162040", borderRadius: 10, padding: "14px 12px 10px", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "10px 0 4px" }}>
                <span style={{ fontSize: 11, color: "#3a4a70", width: 28 }}>0</span>
                <div style={{ flex: 1, height: 10, borderRadius: 5, background: "linear-gradient(to right,#00c853,#F5C400,#f44336)" }} />
                <span style={{ fontSize: 11, color: "#3a4a70", width: 28, textAlign: "right" }}>10</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#3a4a70", marginTop: 4, padding: "0 36px" }}>
                <span>sem esforço</span><span>máximo</span>
              </div>
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 7 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}><span style={{ fontSize: 16 }}>😴</span><span><b style={{ color: "#00c853" }}>1–3</b> — fácil, poderia continuar por horas</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}><span style={{ fontSize: 16 }}>💪</span><span><b style={{ color: "#F5C400" }}>4–6</b> — moderado, desafiador mas controlado</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}><span style={{ fontSize: 16 }}>🔥</span><span><b style={{ color: "#f44336" }}>7–10</b> — intenso, perto do limite</span></div>
              </div>
            </div>
            <div style={txt}>O gráfico mostra a <b style={{ color: "#fff" }}>média do RPE</b> ao longo dos seus treinos, do mais antigo para o mais recente.</div>
          </div>
        )}

        {slide === 1 && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: "#00c853" }}>↑ Evoluindo</div>
            <div style={{ ...txt, marginBottom: 14 }}>Quando o RPE sobe ao longo do tempo, você está <b style={{ color: "#fff" }}>se superando</b> — cargas maiores, mais séries, menos descanso. Isso é evolução.</div>
            <div style={{ background: "#162040", borderRadius: 10, padding: "14px 12px 10px", marginBottom: 14 }}>
              {miniChart("#00c853", "4,40 69,35 134,30 199,20 256,14")}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#3a4a70" }}><span>treino 1</span><span>treino mais recente</span></div>
            </div>
            <div style={{ background: "rgba(0,200,83,.08)", border: "1px solid rgba(0,200,83,.2)", borderRadius: 10, padding: 12, fontSize: 13, color: "#8899bb", lineHeight: 1.5 }}>
              RPE crescendo = você está se desafiando cada vez mais.<br /><b style={{ color: "#00c853" }}>Continue assim! 🚀</b>
            </div>
          </div>
        )}

        {slide === 2 && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: "#F5C400" }}>↓ Acomodando</div>
            <div style={{ ...txt, marginBottom: 14 }}>Quando o RPE cai, o treino está ficando <b style={{ color: "#fff" }}>fácil demais</b> — seu corpo se adaptou e está pedindo mais estímulo.</div>
            <div style={{ background: "#162040", borderRadius: 10, padding: "14px 12px 10px", marginBottom: 14 }}>
              {miniChart("#F5C400", "4,14 69,20 134,30 199,35 256,40")}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#3a4a70" }}><span>treino 1</span><span>treino mais recente</span></div>
            </div>
            <div style={{ background: "rgba(245,196,0,.08)", border: "1px solid rgba(245,196,0,.2)", borderRadius: 10, padding: 12, fontSize: 13, color: "#8899bb", lineHeight: 1.5 }}>
              RPE caindo = hora de aumentar peso ou intensidade.<br /><b style={{ color: "#F5C400" }}>Fique de olho nas sugestões de progressão abaixo! 💡</b>
            </div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 22 }}>
          <button onClick={() => setSlide((s) => s - 1)} style={{ visibility: slide === 0 ? "hidden" : "visible", background: "#162040", border: "none", color: "#fff", fontSize: 14, fontWeight: 600, padding: "10px 20px", borderRadius: 10, cursor: "pointer" }}>← Anterior</button>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {Array.from({ length: TOTAL }, (_, i) => (
              <div key={i} style={{ width: i === slide ? 18 : 6, height: 6, borderRadius: 3, background: i === slide ? "#F5C400" : "#162040", transition: "all .25s" }} />
            ))}
          </div>
          {slide < TOTAL - 1
            ? <button onClick={() => setSlide((s) => s + 1)} style={{ background: "#F5C400", border: "none", color: "#06091a", fontSize: 14, fontWeight: 600, padding: "10px 20px", borderRadius: 10, cursor: "pointer" }}>Próximo →</button>
            : <button onClick={() => onOpenChange(false)} style={{ background: "#F5C400", border: "none", color: "#06091a", fontSize: 14, fontWeight: 600, padding: "10px 20px", borderRadius: 10, cursor: "pointer" }}>Fechar ✓</button>}
        </div>
      </SheetContent>
    </Sheet>
  );
}
