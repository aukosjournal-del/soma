import { todayIndex } from "@domain/workout/entities/Routine";

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export interface DayPickerProps {
  selected: number;
  /** weekday -> routine assignée (pour le point indicateur). */
  assigned: Record<number, string | null>;
  onSelect: (weekday: number) => void;
}

/**
 * Sélecteur de semaine 7 jours. Point indicateur : accent si une routine est
 * assignée, discret si c'est aujourd'hui, invisible sinon. Repris du prototype.
 */
export function DayPicker({ selected, assigned, onSelect }: DayPickerProps) {
  const today = todayIndex();

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "6px" }}>
      {DAYS.map((day, i) => {
        const active = i === selected;
        const hasRoutine = Boolean(assigned[i]);
        const dotColor = hasRoutine
          ? active
            ? "var(--color-on-accent)"
            : "var(--color-accent)"
          : i === today
            ? active
              ? "rgba(0,43,76,0.4)"
              : "rgba(192,235,255,0.4)"
            : "transparent";

        return (
          <button
            key={day}
            type="button"
            className="soma-press"
            onClick={() => onSelect(i)}
            aria-pressed={active}
            aria-label={day}
            style={{
              minHeight: "64px",
              borderRadius: "12px",
              border: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              cursor: "pointer",
              background: active ? "var(--color-accent)" : "var(--color-bg-elevated)",
              // `all` forçait un repaint complet à chaque frame ; seules les
              // couleurs changent réellement ici.
              transition: "background var(--duration-fast) ease",
            }}
          >
            <span
              style={{
                fontSize: "var(--text-micro)",
                fontWeight: "var(--weight-medium)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: active ? "rgba(0,43,76,0.7)" : "var(--color-text-faint)",
              }}
            >
              {day}
            </span>
            <span
              style={{
                fontSize: "var(--text-heading)",
                fontWeight: "var(--weight-medium)",
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
                color: active ? "var(--color-on-accent)" : "#fff",
              }}
            >
              {i + 1}
            </span>
            <span style={{ height: "4px", width: "4px", borderRadius: "50%", background: dotColor }} />
          </button>
        );
      })}
    </div>
  );
}
