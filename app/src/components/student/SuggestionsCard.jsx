// "Sugestões de Progressão" — exercises whose recent avg RPE suggests a weight bump.
export function SuggestionsCard({ suggestions }) {
  if (!suggestions.length) return null;
  return (
    <div style={{ background: "rgba(245,196,0,0.06)", border: "1px solid rgba(245,196,0,0.2)", borderRadius: 16, padding: 20, marginBottom: 20 }}>
      <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--acc)", display: "flex", gap: 6, alignItems: "center" }}>
        💡 Sugestões de Progressão
      </h4>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
        {suggestions.map((s, idx) => (
          <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 10, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</span>
              <span style={{ fontSize: 11, color: "var(--sub)" }}>Treino {s.wkLabel} · {s.wkName}</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700 }}>
              {s.cur}kg → <span style={{ color: "var(--green)" }}>{s.sug}kg</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
