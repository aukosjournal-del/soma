import { restTimerStore, useRestTimer } from "@presentation/hooks/restTimerStore";
import { fmtTime } from "@domain/workout/value-objects/Duration";

/**
 * Minuteur de repos global — barre flottante fixe (bottom 92px), visible
 * quel que soit l'écran. Clone pixel-perfect du prototype.
 */
export function RestTimerBar() {
  const { seconds, total } = useRestTimer();
  if (seconds === null) return null;

  const finished = seconds === 0;
  const accent = finished ? "var(--color-success)" : "var(--color-accent)";
  const iconBg = finished ? "rgba(16,185,129,0.2)" : "rgba(245,158,113,0.2)";
  const percent = total > 0 ? Math.round((seconds / total) * 100) : 0;

  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        transform: "translateX(-50%)",
        // Aligné sur la nav flottante, qui suit elle aussi la zone sûre.
        bottom: "calc(92px + env(safe-area-inset-bottom, 0px))",
        zIndex: 45,
        width: "calc(100% - 32px)",
        maxWidth: "420px",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          pointerEvents: "auto",
          background: "rgba(0,20,36,0.95)",
          backdropFilter: "var(--blur-glass)",
          WebkitBackdropFilter: "var(--blur-glass)",
          border: "1px solid var(--color-border)",
          borderRadius: "24px",
          padding: "12px",
          boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
          animation: "somaFadeIn 0.3s ease-out",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              height: "44px",
              width: "44px",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              background: iconBg,
              color: accent,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="8" cy="9" r="6" />
              <line x1="8" y1="9" x2="8" y2="5.5" />
              <line x1="8" y1="9" x2="10.5" y2="10" />
              <line x1="5.5" y1="1" x2="10.5" y2="1" />
            </svg>
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <p
              style={{
                color: "var(--color-at-prefix)",
                fontSize: "10px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                margin: 0,
              }}
            >
              {finished ? "Récupération terminée" : "Repos en cours"}
            </p>
            <p
              aria-live="polite"
              style={{
                fontSize: "22px",
                fontWeight: 900,
                fontVariantNumeric: "tabular-nums",
                lineHeight: 1,
                margin: "2px 0 0",
                color: finished ? "var(--color-success)" : "#fff",
              }}
            >
              {fmtTime(seconds)}
            </p>
            <div
              style={{
                height: "4px",
                width: "100%",
                background: "var(--color-border)",
                borderRadius: "999px",
                marginTop: "6px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  borderRadius: "999px",
                  transition: "width 1s linear",
                  width: `${percent}%`,
                  background: accent,
                }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => restTimerStore.close()}
            aria-label="Fermer le minuteur"
            style={{
              flexShrink: 0,
              height: "36px",
              width: "36px",
              borderRadius: "12px",
              background: "var(--color-bg-elevated)",
              border: "1px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(192,235,255,0.7)",
              cursor: "pointer",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <line x1="4" y1="4" x2="12" y2="12" />
              <line x1="12" y1="4" x2="4" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
