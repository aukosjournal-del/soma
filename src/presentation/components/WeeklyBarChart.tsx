import type { WeeklyBar } from "@domain/analytics/entities/WeeklySeries";

export interface WeeklyBarChartProps {
  bars: WeeklyBar[];
  /** Couleur des barres (accent par défaut). */
  color?: string;
}

/**
 * Graphique en barres compact 7 jours (hauteur 96px), repris du prototype.
 * Le jour courant est mis en avant ; les jours vides restent visibles.
 */
export function WeeklyBarChart({ bars, color = "var(--color-accent)" }: WeeklyBarChartProps) {
  return (
    <div
      style={{
        marginTop: "16px",
        display: "grid",
        gridTemplateColumns: "repeat(7,1fr)",
        gap: "6px",
        height: "96px",
        alignItems: "end",
      }}
    >
      {bars.map((bar) => (
        <div key={bar.day} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", height: "100%" }}>
          <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "end" }}>
            <div
              title={`${bar.day} : ${bar.value}`}
              style={{
                width: "100%",
                borderRadius: "4px 4px 0 0",
                transition: "height 0.5s ease",
                height: `${Math.max(bar.heightPct, bar.value > 0 ? 4 : 2)}%`,
                background:
                  bar.value === 0
                    ? "rgba(192,235,255,0.15)"
                    : bar.isToday
                      ? color
                      : "rgba(192,235,255,0.4)",
              }}
            />
          </div>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: bar.isToday ? "var(--color-accent)" : "var(--color-at-prefix)",
            }}
          >
            {bar.day}
          </span>
        </div>
      ))}
    </div>
  );
}
