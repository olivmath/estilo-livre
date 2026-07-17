import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getRanking } from "@/services/ranking";
import { Spinner, UserAvatar } from "@/components/shared";

const TABS = [
  { key: "freq" },
  { key: "volume" },
  { key: "improvement" },
];

const PODIUM_COLORS = ["#F5C400", "#9e9e9e", "#cd7f32"];
const PODIUM_SIZE   = [56, 48, 44];

function PodiumCard({ item, rank }) {
  const color = PODIUM_COLORS[rank - 1];
  const size  = PODIUM_SIZE[rank - 1];

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
      padding: "16px 12px",
      background: "var(--bg2)",
      border: `1px solid ${color}`,
      borderRadius: 12,
      flex: 1,
    }}>
      <span style={{ fontSize: 20 }}>{rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}</span>
      <UserAvatar name={item.name} photoURL={item.photoURL} size={size} />
      <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", textAlign: "center", lineHeight: 1.3 }}>
        {item.name?.split(" ")[0]}
      </p>
      <p style={{ fontSize: 16, fontWeight: 800, color }}>
        {typeof item.value === "number" && !Number.isInteger(item.value)
          ? item.value.toFixed(1)
          : item.value}
        <span style={{ fontSize: 10, marginLeft: 3, color: "var(--sub)" }}>{item.unit}</span>
      </p>
      <div style={{ width: "100%", height: 4, background: "var(--bg3)", borderRadius: 2 }}>
        <div style={{ height: "100%", borderRadius: 2, background: color, width: `${100 - (rank - 1) * 20}%` }} />
      </div>
    </div>
  );
}

export function RankingPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState("freq");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const TAB_LABELS = {
    freq: t("rankingPage.frequency"),
    volume: t("rankingPage.volume"),
    improvement: t("rankingPage.improvement"),
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    getRanking(tab)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [tab]);

  const top3 = data.slice(0, 3);
  const rest  = data.slice(3);
  const max   = data[0]?.value ?? 1;

  return (
    <div style={{ padding: "20px 16px", maxWidth: 700, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", marginBottom: 20 }}>
        {t("rankingPage.title")}
      </h1>

      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "var(--bg3)", borderRadius: 10, padding: 4 }}>
        {TABS.map((tb) => (
          <button key={tb.key} onClick={() => setTab(tb.key)} style={{
            flex: 1, padding: "8px 0", borderRadius: 8, border: "none", cursor: "pointer",
            background: tab === tb.key ? "var(--blue2)" : "transparent",
            color: tab === tb.key ? "var(--text)" : "var(--sub)",
            fontSize: 13, fontWeight: tab === tb.key ? 600 : 400,
          }}>
            {TAB_LABELS[tb.key]}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : error ? (
        <p style={{ color: "var(--red)", fontSize: 13 }}>{error}</p>
      ) : data.length === 0 ? (
        <p style={{ color: "var(--sub)", fontSize: 13 }}>{t("rankingPage.noData")}</p>
      ) : (
        <>
          {top3.length > 0 && (
            <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "flex-end" }}>
              {top3.length >= 2 && <PodiumCard item={top3[1]} rank={2} />}
              <PodiumCard item={top3[0]} rank={1} />
              {top3.length >= 3 && <PodiumCard item={top3[2]} rank={3} />}
            </div>
          )}

          {rest.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {rest.map((item, i) => {
                const pos = i + 4;
                const pct = max > 0 ? (item.value / max) * 100 : 0;
                return (
                  <div key={item.uid} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 14px", background: "var(--bg2)",
                    border: "1px solid var(--blue)", borderRadius: 10,
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--sub)", width: 24, textAlign: "center" }}>
                      {pos}
                    </span>
                    <UserAvatar name={item.name} photoURL={item.photoURL} size={36} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{item.name}</p>
                      <div style={{ height: 3, background: "var(--bg3)", borderRadius: 2, marginTop: 4 }}>
                        <div style={{ height: "100%", borderRadius: 2, background: "var(--blue2)", width: `${pct}%` }} />
                      </div>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--acc)", flexShrink: 0 }}>
                      {typeof item.value === "number" && !Number.isInteger(item.value)
                        ? item.value.toFixed(1)
                        : item.value}
                      <span style={{ fontSize: 10, color: "var(--sub)", marginLeft: 3 }}>{item.unit}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
