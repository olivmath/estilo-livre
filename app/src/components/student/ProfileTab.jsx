import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserAvatar } from "@/components/shared";
import { S } from "@/components/student/shared";
import { useLanguage } from "@/hooks/useLanguage";
import { LANGUAGES } from "@/lib/i18n";

export function ProfileTab({ profile, sessionsCount, loopsCount, onUploadPhoto, onSignOut }) {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  return (
    <div>
      <h2 style={S.pageTitle}>{t("profileTab.title")}</h2>
      <div style={{ background: "var(--bg2)", border: "1px solid var(--blue)", borderRadius: 16, padding: 24, textAlign: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ position: "relative" }}>
            <UserAvatar name={profile?.name} photoURL={profile?.photoURL} size={88} />
            <label style={{ position: "absolute", bottom: 0, right: 0, background: "var(--acc)", color: "#000", width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 5px rgba(0,0,0,0.3)" }}>
              <Plus size={16} />
              <Input type="file" accept="image/*" onChange={onUploadPhoto} style={{ display: "none" }} />
            </label>
          </div>

          <h3 style={{ fontSize: 18, fontWeight: 800 }}>{profile?.name}</h3>
          <span style={{ fontSize: 13, color: "var(--sub)" }}>{profile?.email}</span>
          <span style={{ display: "inline-block", padding: "4px 12px", background: "rgba(245,196,0,0.1)", border: "1px solid rgba(245,196,0,0.25)", color: "var(--acc)", fontSize: 11, fontWeight: 700, borderRadius: 20, textTransform: "uppercase", letterSpacing: 1, marginTop: 8 }}>
            {t("profileTab.specialAthlete")}
          </span>
        </div>

        <div style={{ display: "flex", background: "var(--bg3)", borderRadius: 12, padding: 16, marginTop: 24, border: "1px solid var(--blue)" }}>
          <div style={{ flex: 1, textAlign: "center", borderRight: "1px solid var(--blue)" }}>
            <h3 style={{ fontSize: 24, fontWeight: 900, color: "var(--acc)" }}>{sessionsCount}</h3>
            <span style={{ fontSize: 11, color: "var(--sub)" }}>{t("profileTab.completeSessions")}</span>
          </div>
          <div style={{ flex: 1, textAlign: "center" }}>
            <h3 style={{ fontSize: 24, fontWeight: 900, color: "var(--acc)" }}>{loopsCount}</h3>
            <span style={{ fontSize: 11, color: "var(--sub)" }}>{t("profileTab.loops")}</span>
          </div>
        </div>

        <LanguageSelector language={language} setLanguage={setLanguage} t={t} />

        <button onClick={onSignOut} className="mt-8" style={{ width: "100%", padding: 14, background: "transparent", color: "var(--red)", border: "1px solid var(--red)", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          {t("profileTab.logoutApp")}
        </button>

        <p style={{ marginTop: 16, fontSize: 11, color: "var(--sub)", opacity: 0.45 }}>v{__APP_VERSION__}</p>
      </div>
    </div>
  );
}

function LanguageSelector({ language, setLanguage, t }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg3)", borderRadius: 12, padding: "12px 16px", marginTop: 16, border: "1px solid var(--blue)" }}>
      <span style={{ fontSize: 14, fontWeight: 600 }}>{t("profileTab.language")}</span>
      <Select value={language} onValueChange={setLanguage}>
        <SelectTrigger style={{ width: 160, background: "var(--bg2)", border: "1px solid var(--blue)", color: "#fff" }}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {LANGUAGES.map((l) => (
            <SelectItem key={l.code} value={l.code}>
              {l.flag} {l.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
