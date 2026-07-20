import { ringDash, type Ratios } from "@domain/home/entities/DailySummary";

/**
 * Trois anneaux concentriques — pas (orange, r96), nutrition (bleu, r74),
 * séries (vert, r52). Géométrie et transition identiques au prototype.
 */
export function ProgressRings({ ratios }: { ratios: Ratios }) {
  const transition = "stroke-dasharray 0.8s cubic-bezier(0.22,1,0.36,1)";

  return (
    <div style={{ position: "relative" }}>
      <svg width="220" height="220" viewBox="0 0 220 220" role="img" aria-label={`Progression du jour : ${ratios.averagePct}%`}>
        <g transform="translate(110 110) rotate(-90)">
          <circle r="96" fill="none" stroke="#F59E71" strokeOpacity="0.15" strokeWidth="16" />
          <circle r="96" fill="none" stroke="#F59E71" strokeWidth="16" strokeLinecap="round" strokeDasharray={ringDash(96, ratios.steps)} style={{ transition }} />
          <circle r="74" fill="none" stroke="#C0EBFF" strokeOpacity="0.15" strokeWidth="16" />
          <circle r="74" fill="none" stroke="#C0EBFF" strokeWidth="16" strokeLinecap="round" strokeDasharray={ringDash(74, ratios.nutrition)} style={{ transition }} />
          <circle r="52" fill="none" stroke="#10B981" strokeOpacity="0.15" strokeWidth="16" />
          <circle r="52" fill="none" stroke="#10B981" strokeWidth="16" strokeLinecap="round" strokeDasharray={ringDash(52, ratios.workout)} style={{ transition }} />
        </g>
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ color: "#fff", fontSize: "34px", fontWeight: 900, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
          {ratios.averagePct}
          <span style={{ fontSize: "16px", color: "var(--color-at-prefix)" }}>%</span>
        </span>
      </div>
    </div>
  );
}
