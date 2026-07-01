import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/shared";
import { S } from "@/components/student/shared";

// "Meu Perfil" tab: avatar/photo upload, stats, sign out.
export function ProfileTab({ profile, sessionsCount, loopsCount, onUploadPhoto, onSignOut }) {
  return (
    <div>
      <h2 style={S.pageTitle}>Meu Perfil</h2>
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
            Aluno Especial
          </span>
        </div>

        <div style={{ display: "flex", background: "var(--bg3)", borderRadius: 12, padding: 16, marginTop: 24, border: "1px solid var(--blue)" }}>
          <div style={{ flex: 1, textAlign: "center", borderRight: "1px solid var(--blue)" }}>
            <h3 style={{ fontSize: 24, fontWeight: 900, color: "var(--acc)" }}>{sessionsCount}</h3>
            <span style={{ fontSize: 11, color: "var(--sub)" }}>Sessões completas</span>
          </div>
          <div style={{ flex: 1, textAlign: "center" }}>
            <h3 style={{ fontSize: 24, fontWeight: 900, color: "var(--acc)" }}>{loopsCount}</h3>
            <span style={{ fontSize: 11, color: "var(--sub)" }}>Loops</span>
          </div>
        </div>

        <button onClick={onSignOut} className="mt-8" style={{ width: "100%", padding: 14, background: "transparent", color: "var(--red)", border: "1px solid var(--red)", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          Sair do Aplicativo
        </button>

        <p style={{ marginTop: 16, fontSize: 11, color: "var(--sub)", opacity: 0.45 }}>v{__APP_VERSION__}</p>
      </div>
    </div>
  );
}
