import { useTranslation } from "react-i18next";

export function ExitSheet({ onSavePartial, onCancel, onExitWithoutSave }) {
  const { t } = useTranslation();
  return (
    <div style={S.backdrop}>
      <div style={S.sheet}>
        <p style={{ fontSize: 18, fontWeight: 800, marginBottom: 6, color: "var(--text)" }}>{t("exit.title")}</p>
        <p style={{ fontSize: 13, color: "var(--sub)", marginBottom: 24 }}>{t("exit.message")}</p>
        <button onClick={onCancel} style={S.ctaBtn}>{t("exit.backToWorkout")}</button>
        <div style={{ height: 10 }} />
        <button onClick={onSavePartial} style={S.cancelBtn}>{t("exit.continueLater")}</button>
        <div style={{ height: 10 }} />
        <button onClick={onExitWithoutSave} style={S.dangerBtn}>{t("exit.exitWithoutSaving")}</button>
      </div>
    </div>
  );
}

const S = {
  backdrop: { position: "fixed", inset: 0, maxWidth: 430, margin: "0 auto", zIndex: 110, background: "rgba(6,9,26,0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", display: "flex", alignItems: "flex-end" },
  sheet: { background: "var(--bg2)", borderRadius: "20px 20px 0 0", padding: "28px 20px 16px", width: "100%", borderTop: "1px solid var(--blue)" },
  ctaBtn: { width: "100%", padding: 16, borderRadius: 13, border: "none", background: "var(--acc)", color: "#000", fontSize: 16, fontWeight: 800, cursor: "pointer" },
  cancelBtn: { width: "100%", padding: 16, borderRadius: 13, border: "1px solid var(--blue)", fontSize: 16, fontWeight: 700, cursor: "pointer", background: "var(--bg3)", color: "var(--sub)" },
  dangerBtn: { width: "100%", padding: 16, borderRadius: 13, border: "1px solid var(--red)", fontSize: 16, fontWeight: 700, cursor: "pointer", background: "rgba(244, 67, 54, 0.1)", color: "var(--red)" },
};
