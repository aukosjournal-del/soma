import { type TrainingHistory, buildBadges } from "@domain/profile/entities/Achievements";

const card = {
  background: "var(--color-bg-elevated)",
  border: "1px solid var(--color-border)",
  borderRadius: "24px",
  padding: "16px",
  backdropFilter: "var(--blur-glass)",
  WebkitBackdropFilter: "var(--blur-glass)",
  boxShadow: "var(--shadow-card)",
} as const;

/** Discipline & Récompenses — streak hebdomadaire et 4 badges. */
export function DisciplineCard({ history }: { history: TrainingHistory }) {
  const badges = buildBadges(history);
  const weeks = history.streakWeeks;

  return (
    <div style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
        <div
          style={{
            height: "44px",
            width: "44px",
            borderRadius: "12px",
            background: "var(--color-accent-soft)",
            border: "1px solid rgba(245,158,113,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 16 16" fill="#F59E71" aria-hidden="true">
            <path d="M8 1c1 3-2 3.5-2 6a2 2 0 004 0c0-1-.5-1.5-.5-1.5 1.5.5 3 2.5 3 4.5a4.5 4.5 0 01-9 0C3.5 6 6 4 8 1z" />
          </svg>
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p
            style={{
              color: "var(--color-at-prefix)",
              fontSize: "11px",
              fontWeight: "var(--weight-medium)",
              textTransform: "uppercase",
              letterSpacing: "var(--tracking-eyebrow)",
              margin: 0,
            }}
          >
            Discipline &amp; Récompenses
          </p>
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "2px" }}>
            <span style={{ color: "var(--color-accent)", fontSize: "32px", fontWeight: "var(--weight-medium)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
              {weeks}
            </span>
            <span style={{ color: "var(--color-text-muted)", fontSize: "13px" }}>
              semaine{weeks > 1 ? "s" : ""} consécutive{weeks > 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px" }}>
        {badges.map((badge) => (
          <div
            key={badge.id}
            style={{
              borderRadius: "12px",
              padding: "10px 6px",
              textAlign: "center",
              fontSize: "11px",
              fontWeight: "var(--weight-medium)",
              transition: "all 0.4s ease",
              opacity: badge.unlocked ? 1 : 0.3,
              background: badge.unlocked ? "var(--color-accent-soft)" : "rgba(192,235,255,0.05)",
              border: `1px solid ${badge.unlocked ? "var(--color-accent-border)" : "var(--color-border-soft)"}`,
              color: badge.unlocked ? "var(--color-accent)" : "var(--color-text-muted)",
            }}
          >
            {badge.label}
          </div>
        ))}
      </div>
    </div>
  );
}
