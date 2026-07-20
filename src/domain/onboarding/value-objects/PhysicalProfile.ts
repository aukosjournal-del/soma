/**
 * Profil physique collecté à l'Étape 2/3 (date de naissance, taille, poids).
 * Champs facultatifs — le prototype autorise « Passer cette étape ».
 */
export interface PhysicalProfileInput {
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  heightCm: string;
  weightKg: string;
}

export const emptyPhysicalProfile = (): PhysicalProfileInput => ({
  birthDay: "",
  birthMonth: "",
  birthYear: "",
  heightCm: "",
  weightKg: "",
});

/**
 * Dérive l'âge à partir de la date de naissance — logique identique au
 * prototype (finalizeSignup) : année courante - année, moins 1 si
 * l'anniversaire n'est pas encore passé. Retourne null si date incomplète.
 */
export function computeAge(input: PhysicalProfileInput, today: Date = new Date()): number | null {
  const d = parseInt(input.birthDay, 10);
  const m = parseInt(input.birthMonth, 10);
  const y = parseInt(input.birthYear, 10);
  if (!d || !m || !y) return null;
  let age = today.getFullYear() - y;
  const monthNow = today.getMonth() + 1;
  if (monthNow < m || (monthNow === m && today.getDate() < d)) age -= 1;
  return age;
}

/** N'autorise que des chiffres dans les champs numériques (garde-fou saisie). */
export const digitsOnly = (raw: string): string => raw.replace(/[^0-9]/g, "");

/**
 * Convertit la date de naissance saisie en ISO 'YYYY-MM-DD' pour la colonne
 * `profiles.birth_date` (date). Retourne null si incomplète ou invalide.
 */
export function birthDateISO(input: PhysicalProfileInput): string | null {
  const d = parseInt(input.birthDay, 10);
  const m = parseInt(input.birthMonth, 10);
  const y = parseInt(input.birthYear, 10);
  if (!d || !m || !y) return null;
  const currentYear = new Date().getFullYear();
  if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1900 || y > currentYear) return null;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${y}-${pad(m)}-${pad(d)}`;
}

/** Taille/poids en nombre, ou null si non renseigné. */
export const toNumberOrNull = (raw: string): number | null => {
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : null;
};
