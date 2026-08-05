import { useEffect, useState } from "react";
import { BottomSheet } from "@presentation/components/BottomSheet";
import type { Difficulty, Exercise } from "@domain/workout/entities/Exercise";
import { DIFFICULTY_COLOR, DIFFICULTY_LABEL, DIFFICULTY_ORDER, distinctValues, ALL_FILTER } from "@domain/workout/entities/Exercise";
import type { NewExercise } from "@domain/workout/ports/ExerciseRepository";

const field = {
  width: "100%",
  height: "48px",
  background: "var(--color-bg-elevated)",
  borderRadius: "12px",
  padding: "0 12px",
  color: "#fff",
  fontSize: "var(--text-body)",
  fontWeight: "var(--weight-medium)",
  boxSizing: "border-box",
} as const;

const label = {
  color: "var(--color-text-muted)",
  fontSize: "var(--text-label)",
  fontWeight: "var(--weight-medium)",
  letterSpacing: "0.04em",
  marginBottom: "4px",
} as const;

export interface CustomExerciseSheetProps {
  open: boolean;
  /** Sert à proposer les groupes et équipements déjà existants. */
  library: Exercise[];
  onClose: () => void;
  onCreate: (exercise: NewExercise) => Promise<void>;
}

/** Création d'un exercice personnalisé (appartenant à l'utilisateur). */
export function CustomExerciseSheet({ open, library, onClose, onCreate }: CustomExerciseSheetProps) {
  const groups = distinctValues(library, "muscleGroup").filter((g) => g !== ALL_FILTER);
  const equipments = distinctValues(library, "equipment").filter((e) => e !== ALL_FILTER);

  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");
  const [equipment, setEquipment] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("intermediaire");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!open) return;
    setName("");
    setMuscleGroup(groups[0] ?? "");
    setEquipment(equipments[0] ?? "");
    setDescription("");
    setDifficulty("intermediaire");
    setError(undefined);
    // groups/equipments dérivent de `library`, stable pendant l'ouverture.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, library]);

  const submit = async () => {
    if (!name.trim()) {
      setError("Donne un nom à l'exercice.");
      return;
    }
    setSaving(true);
    setError(undefined);
    try {
      await onCreate({
        name: name.trim(),
        muscleGroup: muscleGroup.trim() || "Autre",
        equipment: equipment.trim() || "Autre",
        difficulty,
        description: description.trim(),
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Création impossible.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <BottomSheet open={open} title="Nouvel exercice" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <label style={{ display: "block" }}>
          <div style={label}>Nom</div>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Rowing haltère" style={field} />
        </label>

        <label style={{ display: "block" }}>
          <div style={label}>Groupe musculaire</div>
          <select value={muscleGroup} onChange={(e) => setMuscleGroup(e.target.value)} style={field}>
            {groups.length === 0 && <option value="">Autre</option>}
            {groups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "block" }}>
          <div style={label}>Équipement</div>
          <select value={equipment} onChange={(e) => setEquipment(e.target.value)} style={field}>
            {equipments.length === 0 && <option value="">Autre</option>}
            {equipments.map((eq) => (
              <option key={eq} value={eq}>
                {eq}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "block" }}>
          <div style={label}>Exécution</div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décris le mouvement, la position de départ, les points d'attention…"
            style={{
              width: "100%",
              height: "80px",
              background: "var(--color-bg-elevated)",
              borderRadius: "12px",
              padding: "10px 12px",
              color: "#fff",
              fontSize: "var(--text-label)",
              fontWeight: "var(--weight-medium)",
              boxSizing: "border-box",
              resize: "none",
              fontFamily: "inherit",
            }}
          />
        </label>

        <div>
          <div style={label}>GIF de démonstration</div>
          <div
            style={{
              width: "100%",
              height: "72px",
              borderRadius: "12px",
              // Tiret conservé : convention des zones vides / à venir, seule
              // exception à la suppression des bordures 1px.
              border: "1px dashed rgba(192,235,255,0.2)",
              background:
                "repeating-linear-gradient(45deg, rgba(192,235,255,0.06) 0px, rgba(192,235,255,0.06) 4px, rgba(192,235,255,0.03) 4px, rgba(192,235,255,0.03) 8px)",
              color: "var(--color-text-muted)",
              fontSize: "var(--text-label)",
              fontWeight: "var(--weight-medium)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxSizing: "border-box",
            }}
          >
            + Importer un GIF (à venir)
          </div>
        </div>

        <div>
          <div style={label}>Difficulté</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "6px" }}>
            {DIFFICULTY_ORDER.map((lvl) => {
              const active = difficulty === lvl;
              return (
                <button
                  key={lvl}
                  type="button"
                  className="soma-press"
                  onClick={() => setDifficulty(lvl)}
                  aria-pressed={active}
                  style={{
                    height: "36px",
                    borderRadius: "10px",
                    border: "none",
                    background: active ? DIFFICULTY_COLOR[lvl] : "rgba(192,235,255,0.05)",
                    color: active ? "var(--color-on-accent)" : "var(--color-text-secondary)",
                    fontSize: "var(--text-caption)",
                    fontWeight: "var(--weight-medium)",
                    cursor: "pointer",
                  }}
                >
                  {DIFFICULTY_LABEL[lvl]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {error && (
        <p style={{ color: "var(--color-error)", fontSize: "var(--text-label)", margin: "12px 0 0", textAlign: "center" }}>{error}</p>
      )}

      <button
        type="button"
        className="soma-press"
        onClick={submit}
        disabled={saving}
        style={{
          width: "100%",
          minHeight: "52px",
          marginTop: "20px",
          fontWeight: "var(--weight-medium)",
          fontSize: "var(--text-body)",
          borderRadius: "12px",
          background: "var(--color-accent)",
          color: "var(--color-on-accent)",
          border: "none",
          cursor: saving ? "not-allowed" : "pointer",
          boxSizing: "border-box",
          opacity: saving ? 0.6 : 1,
        }}
      >
        {saving ? "Création…" : "Ajouter à la bibliothèque"}
      </button>
    </BottomSheet>
  );
}
