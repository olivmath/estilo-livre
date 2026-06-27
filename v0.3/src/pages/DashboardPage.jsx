import { useEffect, useState } from "react";
import { getDashboardStats } from "@/services/dashboard";

function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
      <div className="w-8 h-8 rounded-full border-[3px] animate-spin"
        style={{ borderColor: "var(--bg3)", borderTopColor: "var(--acc)" }} />
    </div>
  );
}

function KpiCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: "var(--bg2)",
      border: `1px solid ${accent ? "var(--red)" : "var(--blue)"}`,
      borderRadius: 12,
      padding: "16px 20px",
    }}>
      <p style={{ fontSize: 12, color: "var(--sub)", marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 800, color: accent ? "var(--red)" : "var(--acc)", lineHeight: 1 }}>
        {value ?? "—"}
      </p>
      {sub && <p style={{ fontSize: 11, color: "var(--sub)", marginTop: 4 }}>{sub}</p>}
    </div>
  );
}

function WeekChart({ data }) {
  if (!data?.length) return null;
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{
            width: "100%",
            height: Math.max(4, (d.count / max) * 60),
            background: d.count > 0 ? "var(--acc)" : "var(--bg3)",
            borderRadius: 4,
            transition: "height .3s",
          }} />
          <span style={{ fontSize: 10, color: "var(--sub)" }}>{d.day}</span>
        </div>
      ))}
    </div>
  );
}

function timeAgo(date) {
  if (!date) return "";
  const ms = typeof date.toMillis === "function" ? date.toMillis() : new Date(date).getTime();
  const days = Math.floor((Date.now() - ms) / 86400000);
  if (days === 0) return "hoje";
  if (days === 1) return "1 dia atrás";
  return `${days} dias atrás`;
}

function fmtDuration(secs) {
  if (!secs) return null;
  const m = Math.floor(secs / 60);
  return `${m}min`;
}

export function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return (
    <div style={{ padding: 24, color: "var(--red)", fontSize: 13 }}>{error}</div>
  );

  return (
    <div style={{ padding: "24px 20px", maxWidth: 900 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", marginBottom: 20 }}>
        Dashboard
      </h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Total Alunos" value={stats.totalStudents} />
        <KpiCard label="Sessões Hoje" value={stats.todaySessions} />
        <KpiCard label="Sessões Semana" value={stats.weekSessions} />
        <KpiCard
          label="Inativos"
          value={stats.inactiveCount}
          accent={stats.inactiveCount > 0}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Gráfico */}
        <div style={{
          background: "var(--bg2)",
          border: "1px solid var(--blue)",
          borderRadius: 12,
          padding: 20,
        }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 16 }}>
            Sessões — últimos 7 dias
          </p>
          <WeekChart data={stats.weekChart} />
        </div>

        {/* Alertas */}
        <div style={{
          background: "var(--bg2)",
          border: "1px solid var(--blue)",
          borderRadius: 12,
          padding: 20,
        }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 12 }}>
            Alertas ({stats.alerts.length})
          </p>
          {stats.alerts.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--sub)" }}>Nenhum alerta</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {stats.alerts.map((a) => (
                <div key={a.uid} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 12px",
                  background: "var(--bg3)",
                  borderRadius: 8,
                }}>
                  <span style={{ fontSize: 13, color: "var(--text)" }}>{a.name}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 20,
                    background: a.daysAgo >= 14 ? "rgba(244,67,54,0.15)" : "rgba(245,196,0,0.12)",
                    color: a.daysAgo >= 14 ? "var(--red)" : "var(--acc)",
                  }}>
                    {a.daysAgo != null ? `${a.daysAgo}d sem treinar` : "sem sessão"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Atividade recente */}
      <div style={{
        background: "var(--bg2)",
        border: "1px solid var(--blue)",
        borderRadius: 12,
        padding: 20,
        marginTop: 20,
      }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 12 }}>
          Atividade Recente
        </p>
        {stats.recentActivity.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--sub)" }}>Nenhuma atividade ainda</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {stats.recentActivity.map((a, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 0",
                borderBottom: i < stats.recentActivity.length - 1 ? "1px solid var(--bg3)" : "none",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: a.photoURL ? "transparent" : "var(--blue)",
                  overflow: "hidden", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 700, color: "var(--acc)",
                }}>
                  {a.photoURL
                    ? <img src={a.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : (a.name?.[0]?.toUpperCase() ?? "?")}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                    {a.studentName ?? a.name}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--sub)" }}>
                    {a.workout}
                    {a.duration ? ` · ${fmtDuration(a.duration)}` : ""}
                  </p>
                </div>
                <span style={{ fontSize: 11, color: "var(--sub)", flexShrink: 0 }}>
                  {timeAgo(a.date)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
