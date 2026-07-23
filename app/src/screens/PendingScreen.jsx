import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { redeemInviteCode } from "@/services/invites";

export function PendingScreen() {
  const { t } = useTranslation();
  const { role } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (role && role !== "pendente") navigate("/", { replace: true });
  }, [role, navigate]);

  async function handleRedeem(e) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await redeemInviteCode(code.trim().toUpperCase());
    } catch {
      setError(t("pending.invalidCode"));
    } finally {
      setLoading(false);
    }
  }

  const spacing = {
    px: "clamp(12px, 4vw, 24px)",
    sm: "clamp(16px, 5vw, 32px)",
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: spacing.px }}>
      <div style={{ width: "100%", maxWidth: 390, background: "var(--bg2)", border: "1px solid var(--blue)", borderRadius: 20, padding: `${spacing.sm} ${spacing.px}`, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>&#x231B;</div>
        <h2 style={{ color: "var(--acc)", fontSize: 22, fontWeight: 700, marginBottom: 12 }}>{t("pending.title")}</h2>
        <p style={{ color: "var(--sub)", fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>{t("pending.message")}</p>

        <form onSubmit={handleRedeem} style={{ marginBottom: 16 }}>
          <p style={{ color: "var(--sub)", fontSize: 13, marginBottom: 8 }}>{t("pending.hasCode")}</p>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder={t("pending.codePlaceholder")}
            style={{ textAlign: "center", letterSpacing: 4, fontSize: 18, fontWeight: 700, marginBottom: 8 }}
          />
          {error && <p style={{ color: "var(--red)", fontSize: 13, marginBottom: 8 }}>{error}</p>}
          <Button type="submit" disabled={loading || !code.trim()} style={{ width: "100%" }}>
            {loading ? t("common.loading") : t("pending.redeem")}
          </Button>
        </form>

        <Button variant="ghost" onClick={() => signOut(auth)} style={{ width: "100%", color: "var(--sub)" }}>
          {t("pending.logout")}
        </Button>
      </div>
    </div>
  );
}
