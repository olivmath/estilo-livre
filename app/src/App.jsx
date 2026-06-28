import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LoginScreen } from "@/screens/LoginScreen";
import { PendingScreen } from "@/screens/PendingScreen";
import { StudentApp } from "@/screens/StudentApp";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { DashboardPage } from "@/pages/DashboardPage";
import { AlunosPage } from "@/pages/AlunosPage";
import { ExerciciosPage } from "@/pages/ExerciciosPage";
import { TreinosPage } from "@/pages/TreinosPage";
import { RankingPage } from "@/pages/RankingPage";
import { ContasPage } from "@/pages/ContasPage";

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

function RoleGate() {
  const { user, role, loading, error } = useAuth();

  if (loading) return <Spinner />;
  if (!user) return <LoginScreen />;
  if (error) return <Spinner />;
  if (!role) return <Spinner />;

  if (role === "pendente") return <Navigate to="/pending" replace />;
  if (role === "aluno") return <Navigate to="/student" replace />;
  if (role === "professor") return <Navigate to="/prof/dashboard" replace />;
  if (role === "admin") return <Navigate to="/admin/dashboard" replace />;

  return <Spinner />;
}

function ProtectedRoute({ roles, children }) {
  const { user, role, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user || !roles.includes(role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleGate />} />
        <Route path="/pending" element={<PendingScreen />} />
        <Route
          path="/student"
          element={
            <ProtectedRoute roles={["aluno"]}>
              <StudentApp />
            </ProtectedRoute>
          }
        />

        <Route
          path="/prof/*"
          element={
            <ProtectedRoute roles={["professor", "admin"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="alunos" element={<AlunosPage />} />
          <Route path="exercicios" element={<ExerciciosPage />} />
          <Route path="treinos" element={<TreinosPage />} />
          <Route path="ranking" element={<RankingPage />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        <Route
          path="/admin/*"
          element={
            <ProtectedRoute roles={["admin"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="alunos" element={<AlunosPage />} />
          <Route path="exercicios" element={<ExerciciosPage />} />
          <Route path="treinos" element={<TreinosPage />} />
          <Route path="ranking" element={<RankingPage />} />
          <Route path="contas" element={<ContasPage />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
