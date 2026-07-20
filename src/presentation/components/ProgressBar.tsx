/**
 * Barre de progression de l'onboarding — 4px, piste translucide, remplissage
 * accent, coins pill. Repris du prototype (SOMA.dc.html, ligne 84).
 */
export function ProgressBar({ percent }: { percent: number }) {
  return (
    <div
      style={{
        height: "4px",
        width: "100%",
        background: "var(--color-border-soft)",
        borderRadius: "999px",
        marginBottom: "6px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${percent}%`,
          background: "var(--color-accent)",
          borderRadius: "999px",
          transition: "width 0.3s var(--ease-spring)",
        }}
      />
    </div>
  );
}
