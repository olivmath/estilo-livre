import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

export function StudentPlaceholder() {
  const { profile } = useAuth();

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 390,
        background: "var(--bg2)",
        border: "1px solid var(--blue)",
        borderRadius: 20,
        padding: "40px 32px 32px",
        textAlign: "center",
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "var(--blue)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
          fontSize: 28,
          color: "var(--acc)",
          fontWeight: 800,
        }}>
          {profile?.name?.[0]?.toUpperCase() ?? "A"}
        </div>
        <h2 style={{ color: "var(--acc)", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
          Olá, {profile?.name?.split(" ")[0] ?? "Aluno"}!
        </h2>
        <p style={{ color: "var(--sub)", fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
          O app do aluno está em construção.
          Em breve você poderá acompanhar seus treinos aqui.
        </p>
        <button
          onClick={() => signOut(auth)}
          style={{
            width: "100%",
            padding: "12px 20px",
            background: "var(--bg3)",
            color: "var(--text)",
            border: "1px solid var(--blue)",
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Sair
        </button>
      </div>
    </div>
  );
}
