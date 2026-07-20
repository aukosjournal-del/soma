/** Mesures corporelles saisies par l'utilisateur (table biometric_snapshots). */
export interface BodyMetrics {
  heightCm: number | null;
  weightKg: number | null;
  waistCm: number | null;
  hipCm: number | null;
  neckCm: number | null;
  armCm: number | null;
  restingHr: number | null;
  bodyFatPct: number | null;
  muscleMassKg: number | null;
  bpSys: number | null;
  bpDia: number | null;
  hydrationL: number | null;
}

export type BodyMetricKey = keyof BodyMetrics;

export function emptyBodyMetrics(): BodyMetrics {
  return {
    heightCm: null,
    weightKg: null,
    waistCm: null,
    hipCm: null,
    neckCm: null,
    armCm: null,
    restingHr: null,
    bodyFatPct: null,
    muscleMassKg: null,
    bpSys: null,
    bpDia: null,
    hydrationL: null,
  };
}

export const MAX_VISIBLE_BIO = 6;
export const MAX_VISIBLE_INDICATORS = 4;
export const DEFAULT_VISIBLE_BIO = ["height", "weight", "waist", "hip", "neck", "arm"];
export const DEFAULT_VISIBLE_INDICATORS = ["imc", "whr", "whtr", "restingHr"];

export interface BioMetricDef {
  id: string;
  key: BodyMetricKey | null;
  label: string;
  unit: string;
  /** true = valeur dérivée, non saisissable. */
  readOnly?: boolean;
}

/**
 * Catalogue des 13 mesures. `id` correspond aux valeurs stockées dans
 * `profiles.visible_bio_metrics` (contrainte : 6 maximum).
 * « Masse maigre » est calculée à partir du poids et de la masse grasse.
 */
export const BIO_METRIC_CATALOG: BioMetricDef[] = [
  { id: "height", key: "heightCm", label: "Taille", unit: "cm" },
  { id: "weight", key: "weightKg", label: "Poids", unit: "kg" },
  { id: "waist", key: "waistCm", label: "Tour de taille", unit: "cm" },
  { id: "hip", key: "hipCm", label: "Tour de hanches", unit: "cm" },
  { id: "neck", key: "neckCm", label: "Tour de cou", unit: "cm" },
  { id: "arm", key: "armCm", label: "Tour de bras", unit: "cm" },
  { id: "restingHr", key: "restingHr", label: "FC repos", unit: "bpm" },
  { id: "bodyFat", key: "bodyFatPct", label: "Masse grasse", unit: "%" },
  { id: "leanMass", key: null, label: "Masse maigre", unit: "kg", readOnly: true },
  { id: "muscle", key: "muscleMassKg", label: "Masse musculaire", unit: "kg" },
  { id: "bpSys", key: "bpSys", label: "Pression (sys)", unit: "mmHg" },
  { id: "bpDia", key: "bpDia", label: "Pression (dia)", unit: "mmHg" },
  { id: "hydration", key: "hydrationL", label: "Hydratation", unit: "L" },
];

/** Masse maigre déclarative : poids × (1 − %MG saisi). */
export function leanMassFromInput(m: BodyMetrics): number {
  if (!m.weightKg || m.bodyFatPct === null) return 0;
  return m.weightKg * (1 - m.bodyFatPct / 100);
}

/** Valeur d'une mesure du catalogue, y compris les dérivées. */
export function bioMetricValue(m: BodyMetrics, def: BioMetricDef): number | null {
  if (def.id === "leanMass") {
    const v = leanMassFromInput(m);
    return v > 0 ? Math.round(v * 10) / 10 : null;
  }
  return def.key ? m[def.key] : null;
}

// --- Indicateurs ------------------------------------------------------

export type IndicatorCategory =
  | "Alternatives à l'IMC"
  | "Santé & risques"
  | "Morphologie"
  | "Nutrition & métabolisme";

export interface Indicator {
  id: string;
  label: string;
  value: number;
  unit: string;
  category: IndicatorCategory;
  statusLabel?: string;
  statusColor?: string;
  description?: string;
  /** Seule la FC repos est modifiable directement depuis une carte. */
  editable?: boolean;
}

const NEUTRAL = "#94a3b8";
const round = (v: number, d = 2) => Math.round(v * 10 ** d) / 10 ** d;
const heightM = (m: BodyMetrics) => (m.heightCm ?? 0) / 100;

/** Catégories d'IMC — seuils et libellés exacts du prototype. */
export function bmiCategory(bmi: number): { label: string; color: string } {
  if (bmi <= 0) return { label: "—", color: NEUTRAL };
  if (bmi < 18.5) return { label: "Insuffisance", color: "#C0EBFF" };
  if (bmi < 25) return { label: "Normal", color: "#10B981" };
  if (bmi < 30) return { label: "Surpoids", color: "#F59E71" };
  return { label: "Obésité", color: "#EF4444" };
}

export function bmi(m: BodyMetrics): number {
  const h = heightM(m);
  if (h <= 0 || !m.weightKg) return 0;
  return m.weightKg / (h * h);
}

export function waistToHip(m: BodyMetrics): number {
  return !m.hipCm || !m.waistCm ? 0 : m.waistCm / m.hipCm;
}

export function waistToHeight(m: BodyMetrics): number {
  return !m.heightCm || !m.waistCm ? 0 : m.waistCm / m.heightCm;
}

/**
 * Masse grasse estimée — méthode US Navy (homme) :
 * 495 / (1.0324 − 0.19077·log10(tourTaille − tourCou) + 0.15456·log10(taille)) − 450.
 * Bornée à 0 : la formule peut devenir négative sur des morphologies extrêmes.
 */
export function usNavyBodyFat(m: BodyMetrics): number {
  if (!m.waistCm || !m.neckCm || !m.heightCm) return 0;
  const diff = m.waistCm - m.neckCm;
  if (diff <= 0) return 0;
  const denominator = 1.0324 - 0.19077 * Math.log10(diff) + 0.15456 * Math.log10(m.heightCm);
  if (denominator <= 0) return 0;
  return Math.max(0, 495 / denominator - 450);
}

/** Masse maigre estimée à partir du % US Navy. */
export function leanMassNavy(m: BodyMetrics): number {
  if (!m.weightKg) return 0;
  const bf = usNavyBodyFat(m);
  return bf > 0 ? m.weightKg * (1 - bf / 100) : 0;
}

/** Masse grasse absolue à partir du % US Navy. */
export function fatMassNavy(m: BodyMetrics): number {
  if (!m.weightKg) return 0;
  return m.weightKg * (usNavyBodyFat(m) / 100);
}

/** Métabolisme de base — Katch-McArdle : 370 + 21.6 × masse maigre. */
export function bmrKatchMcArdle(m: BodyMetrics): number {
  const lean = leanMassNavy(m);
  return lean > 0 ? 370 + 21.6 * lean : 0;
}

/** Indice d'adiposité corporelle : (hanches / taille(m)^1.5) − 18. */
export function bodyAdiposityIndex(m: BodyMetrics): number {
  const h = heightM(m);
  if (h <= 0 || !m.hipCm) return 0;
  return m.hipCm / h ** 1.5 - 18;
}

/** Indice de masse tri-pondérale : poids / taille(m)³. */
export function triPonderalMassIndex(m: BodyMetrics): number {
  const h = heightM(m);
  if (h <= 0 || !m.weightKg) return 0;
  return m.weightKg / h ** 3;
}

const ratio = (a: number | null, b: number | null): number => (!a || !b ? 0 : a / b);

/** Les 15 indicateurs du catalogue, dans l'ordre du prototype. */
export function allIndicators(m: BodyMetrics): Indicator[] {
  const bmiValue = bmi(m);
  const bmiCat = bmiCategory(bmiValue);
  const whr = waistToHip(m);
  const whtr = waistToHeight(m);
  const hr = m.restingHr;
  const navyBf = usNavyBodyFat(m);
  const bai = bodyAdiposityIndex(m);
  const waistNeck = ratio(m.waistCm, m.neckCm);
  const hipNeck = ratio(m.hipCm, m.neckCm);
  const armHeight = ratio(m.armCm, m.heightCm);
  const armNeck = ratio(m.armCm, m.neckCm);
  const armWaist = ratio(m.armCm, m.waistCm);

  return [
    {
      id: "imc",
      label: "IMC",
      value: round(bmiValue, 1),
      unit: "kg/m²",
      category: "Alternatives à l'IMC",
      statusLabel: bmiCat.label,
      statusColor: bmiCat.color,
    },
    {
      id: "whr",
      label: "Rapport Taille/Hanches",
      value: round(whr),
      unit: "",
      category: "Santé & risques",
      description: ">0.90 (H) / >0.85 (F) = risque accru",
    },
    {
      id: "whtr",
      label: "Rapport Taille/Taille",
      value: round(whtr),
      unit: "",
      category: "Alternatives à l'IMC",
      statusLabel: whtr === 0 ? "—" : whtr < 0.5 ? "Ratio favorable" : "À surveiller",
      statusColor: whtr === 0 ? NEUTRAL : whtr < 0.5 ? "#10B981" : "#F59E71",
    },
    {
      id: "restingHr",
      label: "Fréquence cardiaque repos",
      value: hr ?? 0,
      unit: "bpm",
      category: "Santé & risques",
      editable: true,
      statusLabel: !hr ? "—" : hr < 60 ? "Excellente forme" : hr <= 100 ? "Normale" : "Élevée",
      statusColor: !hr ? NEUTRAL : hr < 60 ? "#10B981" : hr <= 100 ? "#C0EBFF" : "#EF4444",
    },
    {
      id: "waistNeck",
      label: "Rapport Taille/Cou",
      value: round(waistNeck),
      unit: "",
      category: "Morphologie",
      statusLabel: waistNeck === 0 ? "—" : waistNeck < 2 ? "Normal" : "À surveiller",
      statusColor: waistNeck === 0 ? NEUTRAL : waistNeck < 2 ? "#10B981" : "#F59E71",
    },
    {
      id: "hipNeck",
      label: "Rapport Hanches/Cou",
      value: round(hipNeck),
      unit: "",
      category: "Morphologie",
      description: "Morphologie générale",
    },
    {
      id: "armHeight",
      label: "Rapport Bras/Taille",
      value: round(armHeight, 3),
      unit: "",
      category: "Morphologie",
      description: "Prise de masse aux bras",
    },
    {
      id: "armNeck",
      label: "Rapport Bras/Cou",
      value: round(armNeck),
      unit: "",
      category: "Morphologie",
      statusLabel: armNeck === 0 ? "—" : armNeck >= 0.85 ? "Équilibré" : "En évolution",
      statusColor: armNeck === 0 ? NEUTRAL : armNeck >= 0.85 ? "#10B981" : "#F59E71",
    },
    {
      id: "armWaist",
      label: "Rapport Bras/Tour de taille",
      value: round(armWaist),
      unit: "",
      category: "Morphologie",
      description: "Équilibre bras / tronc",
    },
    {
      id: "tmi",
      label: "Indice Masse Tri-Pondérale",
      value: round(triPonderalMassIndex(m), 1),
      unit: "kg/m³",
      category: "Alternatives à l'IMC",
      description: "Plus précis que l'IMC chez les jeunes adultes",
    },
    {
      id: "bai",
      label: "Indice Adiposité Corporelle",
      value: round(bai, 1),
      unit: "%",
      category: "Alternatives à l'IMC",
      statusLabel: bai <= 0 ? "—" : bai >= 25 ? "Surpoids" : "Normal",
      statusColor: bai <= 0 ? NEUTRAL : bai >= 25 ? "#F59E71" : "#10B981",
    },
    {
      id: "navyBodyFat",
      label: "Masse Grasse Estimée (US Navy)",
      value: round(navyBf, 1),
      unit: "%",
      category: "Santé & risques",
      statusLabel: navyBf === 0 ? "—" : navyBf >= 25 ? "Élevé" : "Normal",
      statusColor: navyBf === 0 ? NEUTRAL : navyBf >= 25 ? "#EF4444" : "#10B981",
    },
    {
      id: "leanMassNavy",
      label: "Masse Maigre Estimée",
      value: round(leanMassNavy(m), 1),
      unit: "kg",
      category: "Nutrition & métabolisme",
      description: "Muscles, os et organes",
    },
    {
      id: "fatMassNavy",
      label: "Masse Grasse Absolue",
      value: round(fatMassNavy(m), 1),
      unit: "kg",
      category: "Nutrition & métabolisme",
      description: "Poids total × % MG estimé",
    },
    {
      id: "bmrKatch",
      label: "Métabolisme de Base (Katch-McArdle)",
      value: Math.round(bmrKatchMcArdle(m)),
      unit: "kcal/j",
      category: "Nutrition & métabolisme",
      description: "Énergie minimale requise au repos",
    },
  ];
}

/** Indicateurs retenus par l'utilisateur, dans l'ordre du catalogue. */
export function computeIndicators(
  m: BodyMetrics,
  visibleIds: string[] = DEFAULT_VISIBLE_INDICATORS,
): Indicator[] {
  const selected = new Set(visibleIds);
  return allIndicators(m).filter((i) => selected.has(i.id));
}

/** Âge à partir de la date de naissance ISO (null si absente). */
export function ageFromBirthDate(birthDate: string | null, now: Date = new Date()): number | null {
  if (!birthDate) return null;
  const d = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  let age = now.getFullYear() - d.getFullYear();
  const monthDiff = now.getMonth() - d.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < d.getDate())) age -= 1;
  return age;
}

/**
 * Applique une sélection en respectant le plafond : si la limite est atteinte,
 * cocher un nouvel élément est refusé (le décochage reste toujours possible).
 */
export function toggleSelection(current: string[], id: string, max: number): string[] {
  if (current.includes(id)) return current.filter((x) => x !== id);
  if (current.length >= max) return current;
  return [...current, id];
}
