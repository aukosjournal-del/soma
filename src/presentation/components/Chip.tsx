export interface ChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  /** "muscle" = accent orange actif ; "equipment" = bleu clair actif, plus compact. */
  variant?: "muscle" | "equipment";
}

/**
 * Chip de filtre de la bibliothèque — pilule 999px.
 * Couleurs actives reprises du prototype : orange (groupes), bleu (équipements).
 */
export function Chip({ label, active, onClick, variant = "muscle" }: ChipProps) {
  const isMuscle = variant === "muscle";
  return (
    <button
      type="button"
      className="soma-press"
      onClick={onClick}
      aria-pressed={active}
      style={{
        flexShrink: 0,
        // Hauteur portée à 36px : une pilule de filtre n'a pas besoin des
        // 48px d'une action destructrice, mais 28px était sous le seuil
        // confortable au pouce.
        minHeight: "36px",
        padding: isMuscle ? "8px 14px" : "6px 12px",
        borderRadius: "var(--radius-pill)",
        fontSize: isMuscle ? "var(--text-label)" : "var(--text-caption)",
        fontWeight: "var(--weight-medium)",
        cursor: "pointer",
        border: "none",
        background: active
          ? isMuscle
            ? "var(--color-accent)"
            : "var(--color-text-secondary)"
          : "rgba(192,235,255,0.05)",
        color: active ? "var(--color-on-accent)" : "var(--color-text-secondary)",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}
