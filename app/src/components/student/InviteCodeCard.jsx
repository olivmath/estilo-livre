// Displays the professor's invite code with copy and regenerate actions
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { getMyInviteCode, generateInviteCode } from "@/services/invites";
import { Copy, RefreshCw, Check } from "lucide-react";

export function InviteCodeCard() {
  const { t } = useTranslation();
  const [code, setCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getMyInviteCode()
      .then((r) => setCode(r.code))
      .finally(() => setLoading(false));
  }, []);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const r = await generateInviteCode();
      setCode(r.code);
    } finally {
      setGenerating(false);
    }
  }

  function handleCopy() {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return null;

  return (
    <div style={{
      background: "var(--bg2)",
      border: "1px solid var(--blue)",
      borderRadius: 12,
      padding: "clamp(12px, 4vw, 20px)",
      marginBottom: "clamp(12px, 4vw, 20px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "clamp(8px, 2vw, 16px)",
      flexWrap: "wrap",
    }}>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 12, color: "var(--sub)", marginBottom: 4 }}>
          {t("inviteCode.myCode")}
        </p>
        {code ? (
          <p style={{ fontSize: 22, fontWeight: 800, color: "var(--acc)", letterSpacing: 4, fontFamily: "monospace" }}>
            {code}
          </p>
        ) : (
          <p style={{ fontSize: 13, color: "var(--sub)" }}>{t("inviteCode.noCode")}</p>
        )}
      </div>
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        {code && (
          <Button size="sm" variant="outline" onClick={handleCopy}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? t("inviteCode.copied") : t("inviteCode.copy")}
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={handleGenerate} disabled={generating}>
          <RefreshCw size={14} className={generating ? "animate-spin" : ""} />
          {t("inviteCode.generate")}
        </Button>
      </div>
    </div>
  );
}
