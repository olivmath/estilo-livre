import { S } from "@/components/student/shared";

// "Treino pausado" card shown on the home tab while a draft exists in Firestore.
export function DraftBanner({ draft, onResume, onStartFromScratch }) {
  const pct = ((draft.results?.length ?? 0) / (draft.exercises?.length ?? 1)) * 100;
  return (
    <div style={{ marginBottom: 24, padding: 20, borderRadius: 16, background: "linear-gradient(135deg, rgba(245,196,0,0.12), rgba(245,196,0,0.04))", border: "1.5px solid rgba(245,196,0,0.4)", boxShadow: "0 8px 24px rgba(245,196,0,0.08)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--acc)", boxShadow: "0 0 8px var(--acc)" }} />
        <span style={{ fontSize: 11, fontWeight: 800, color: "var(--acc)", letterSpacing: 1.5, textTransform: "uppercase" }}>
          Treino pausado
        </span>
      </div>
      <p style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", marginBottom: 6, lineHeight: 1.3 }}>
        Treino {draft.label} — {draft.name}
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: "var(--acc)", fontWeight: 700 }}>
          {draft.results?.length ?? 0}/{draft.exercises?.length ?? 0} exercícios
        </span>
        <span style={{ fontSize: 13, color: "var(--sub)" }}>concluídos</span>
      </div>
      <div style={{ height: 4, borderRadius: 4, background: "rgba(245,196,0,0.15)", overflow: "hidden", marginBottom: 16 }}>
        <div style={{ height: "100%", borderRadius: 4, background: "var(--acc)", width: `${pct}%`, transition: "width 0.3s ease" }} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => onResume(draft)} style={{ ...S.btnPrimary, flex: 3, padding: "13px 0", fontSize: 14, whiteSpace: "nowrap" }}>
          ▶ Continuar treino
        </button>
        <button onClick={() => onStartFromScratch(draft.id)} style={{ ...S.btnSecondary, flex: 2, padding: "13px 0", fontSize: 13, whiteSpace: "nowrap" }}>
          Começar do zero
        </button>
      </div>
    </div>
  );
}
