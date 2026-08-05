import { useRef, useState } from "react";
import type { SessionSet } from "@domain/workout/entities/SessionExercise";

export interface SetRowProps {
  set: SessionSet;
  onWeight: (value: string) => void;
  onReps: (value: string) => void;
  onCheck: () => void;
  onFail: () => void;
}

/** Largeur de l'action révélée sous la ligne. */
const ACTION_WIDTH = 84;
/** Au-delà, on relâche sur l'action ouverte ; en deçà, la ligne revient. */
const OPEN_THRESHOLD = ACTION_WIDTH * 0.5;
/** Un geste vertical au-delà de cette pente est un défilement, pas un swipe. */
const SLOPE_GUARD = 1;

/**
 * Résistance progressive : le doigt tire, la ligne suit de moins en moins.
 * Au-delà de la largeur d'action on n'avance plus qu'au tiers, ce qui donne
 * la butée élastique iOS plutôt qu'un glissement infini.
 */
function withResistance(dx: number): number {
  if (dx <= 0) return 0;
  if (dx <= ACTION_WIDTH) return dx;
  return ACTION_WIDTH + (dx - ACTION_WIDTH) / 3;
}

/**
 * Ligne de série.
 *
 * VERROUILLAGE : dès que la série est validée (`checked`), les deux inputs
 * passent en `disabled` — plus aucune saisie possible, comme le prototype.
 *
 * Grille à 4 colonnes (n° / charge / reps / valider). L'action « échec »,
 * rare, sort du chemin de l'action fréquente : elle se révèle par un
 * glissement vers la gauche, ce qui rend les champs de saisie deux fois plus
 * larges — la contrainte réelle quand on saisit en salle, à une main.
 */
export function SetRow({ set, onWeight, onReps, onCheck, onFail }: SetRowProps) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const start = useRef<{ x: number; y: number; locked: boolean } | null>(null);

  const close = () => setOffset(0);

  const onPointerDown = (e: React.PointerEvent) => {
    // Ne pas capter le geste sur les champs : l'utilisateur vise le curseur.
    if ((e.target as HTMLElement).closest("input, button")) return;
    start.current = { x: e.clientX, y: e.clientY, locked: false };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const s = start.current;
    if (!s) return;
    const dx = s.x - e.clientX;
    const dy = Math.abs(e.clientY - s.y);

    if (!s.locked) {
      // Tant que la direction n'est pas tranchée, on laisse filer : un doigt
      // qui part à la verticale doit défiler la page, pas ouvrir l'action.
      if (Math.abs(dx) < 6 && dy < 6) return;
      if (dy > Math.abs(dx) * SLOPE_GUARD) {
        start.current = null;
        return;
      }
      s.locked = true;
      setDragging(true);
    }
    setOffset(withResistance(dx));
  };

  const onPointerUp = () => {
    if (start.current?.locked) setOffset(offset >= OPEN_THRESHOLD ? ACTION_WIDTH : 0);
    start.current = null;
    setDragging(false);
  };

  const inputStyle = {
    height: "44px",
    minWidth: 0,
    width: "100%",
    background: set.checked ? "rgba(16,185,129,0.10)" : "var(--color-bg-elevated)",
    border: "none",
    borderRadius: "10px",
    padding: "0 8px",
    textAlign: "center",
    fontWeight: 500,
    fontSize: "15px",
    color: set.checked ? "#fff" : "var(--color-text-secondary)",
    boxSizing: "border-box",
    fontVariantNumeric: "tabular-nums",
    // iOS zoome sur tout champ sous 16px : on compense à la saisie.
    WebkitTextSizeAdjust: "100%",
  } as const;

  return (
    <div style={{ position: "relative", borderRadius: "10px", overflow: "hidden" }}>
      <button
        type="button"
        onClick={() => {
          onFail();
          close();
        }}
        tabIndex={offset > 0 ? 0 : -1}
        aria-hidden={offset === 0}
        style={{
          position: "absolute",
          inset: "0 0 0 auto",
          width: `${ACTION_WIDTH}px`,
          border: "none",
          borderRadius: "10px",
          background: set.failed ? "var(--color-error)" : "rgba(239,68,68,0.85)",
          color: "#fff",
          fontSize: "13px",
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        {set.failed ? "Annuler" : "Échec"}
      </button>

      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: "18px 1fr 1fr 48px",
          alignItems: "center",
          gap: "8px",
          borderRadius: "10px",
          background: "var(--color-bg)",
          transform: `translateX(-${offset}px)`,
          // Pendant le glissement on colle au doigt (aucune transition) ;
          // au relâchement le ressort ramène la ligne.
          transition: dragging ? "none" : `transform var(--duration-med) var(--ease-spring)`,
          touchAction: "pan-y",
        }}
      >
        <span
          style={{
            fontSize: "13px",
            color: set.failed ? "var(--color-error)" : "var(--color-text-faint)",
            fontVariantNumeric: "tabular-nums",
            textAlign: "center",
          }}
        >
          {set.id}
        </span>

        <input
          type="text"
          inputMode="decimal"
          disabled={set.checked}
          value={set.weight}
          onChange={(e) => onWeight(e.target.value)}
          placeholder={set.weightPlaceholder}
          aria-label={`Charge en kilos, série ${set.id}`}
          style={inputStyle}
        />
        <input
          type="text"
          inputMode="numeric"
          disabled={set.checked}
          value={set.reps}
          onChange={(e) => onReps(e.target.value)}
          placeholder={set.repsPlaceholder}
          aria-label={`Répétitions, série ${set.id}`}
          style={inputStyle}
        />

        <button
          type="button"
          className="soma-press"
          onClick={onCheck}
          aria-label={`Valider la série ${set.id}`}
          aria-pressed={set.checked}
          style={{
            height: "48px",
            width: "48px",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            // Plus de halo néon : l'état validé se lit au remplissage du
            // bouton et à la teinte des champs, pas à une lueur diffuse.
            background: set.checked ? "var(--color-success)" : "var(--color-bg-elevated)",
            color: set.checked ? "var(--color-on-accent)" : "var(--color-text-faint)",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="3,8 6.5,11.5 13,4" />
          </svg>
        </button>
      </div>
    </div>
  );
}
