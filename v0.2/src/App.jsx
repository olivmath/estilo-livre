import { useAuth } from "@/contexts/AuthContext";
import { LoginScreen } from "@/screens/LoginScreen";
import { HelloScreen } from "@/screens/HelloScreen";

function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div
        className="w-10 h-10 rounded-full border-[3px] animate-spin"
        style={{ borderColor: "var(--bg3)", borderTopColor: "var(--acc)" }}
      />
      <p className="text-sm" style={{ color: "var(--sub)" }}>Verificando acesso…</p>
    </div>
  );
}

function ErrorScreen({ message }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <span className="text-5xl mb-4">⚠️</span>
      <p className="text-sm mb-6" style={{ color: "var(--red)" }}>{message}</p>
    </div>
  );
}

export default function App() {
  const { user, role, loading, error } = useAuth();

  if (loading) return <Spinner />;
  if (error)   return <ErrorScreen message={error} />;
  if (!user)   return <LoginScreen />;

  return <HelloScreen user={user} role={role} />;
}
