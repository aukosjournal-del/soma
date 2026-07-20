/**
 * Niveau d'expérience — Étape 3/3. Valeurs alignées sur l'enum Postgres
 * `experience_level` (debutant, intermediaire, avance, expert) ; le prototype
 * n'expose que les trois premiers.
 */
export type ExperienceLevel = "debutant" | "intermediaire" | "avance";

/** Coefficient de charge repris du prototype (selectExperience). */
export const EXPERIENCE_COEFFICIENT: Record<ExperienceLevel, number> = {
  debutant: 0.7,
  intermediaire: 1,
  avance: 1.3,
};

export interface ExperienceOption {
  level: ExperienceLevel;
  title: string;
  description: string;
}

/** Contenu exact des cartes du prototype (bloc signupStepIs4). */
export const EXPERIENCE_OPTIONS: ExperienceOption[] = [
  {
    level: "debutant",
    title: "Débutant",
    description: "Moins de 6 mois : focus sur l'apprentissage des mouvements.",
  },
  {
    level: "intermediaire",
    title: "Intermédiaire",
    description: "1 à 3 ans : focus sur la régularité et les charges de travail.",
  },
  {
    level: "avance",
    title: "Avancé",
    description: "Plus de 3 ans : focus sur la surcharge progressive et l'optimisation.",
  },
];
