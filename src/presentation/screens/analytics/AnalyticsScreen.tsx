import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@presentation/components/AppShell";
import { WeeklyBarChart } from "@presentation/components/WeeklyBarChart";
import { SupabaseAnalyticsRepository } from "@infrastructure/supabase/adapters/SupabaseAnalyticsRepository";
import type { WeeklyAnalytics } from "@domain/analytics/ports/AnalyticsRepository";
import { startOfWeek, toBars, weekTotal } from "@domain/analytics/entities/WeeklySeries";
import { brzycki, heaviestSet, loadCategory } from "@domain/analytics/value-objects/Brzycki";
import { type ExerciseProgression, buildProgression } from "@domain/analytics/entities/Progression";
import { useActiveSession } from "@presentation/hooks/activeSessionStore";

const card = {
  background: "var(--color-bg-elevated)",
  borderRadius: "var(--radius-lg)",
  padding: "16px",
  backdropFilter: "var(--blur-glass)",
  WebkitBackdropFilter: "var(--blur-glass)",
} as const;

const eyebrow = {
  color: "var(--color-text-faint)",
  fontSize: "var(--text-caption)",
  fontWeight: "var(--weight-medium)",
  margin: 0,
} as const;

const bigNumber = {
  color: "#fff",
  fontSize: "32px",
  fontWeight: "var(--weight-medium)",
  lineHeight: 1,
  fontVariantNumeric: "tabular-nums",
} as const;

/**
 * Stats — volumes hebdomadaires (tonnage, pas, calories) et 1RM estimé
 * par la formule de Brzycki. Clone du bloc `isRecap` du prototype.
 */
export function AnalyticsScreen() {
  const repository = useMemo(() => new SupabaseAnalyticsRepository(), []);
  const weekStart = useMemo(() => startOfWeek(), []);
  const [data, setData] = useState<WeeklyAnalytics>();
  const [progressions, setProgressions] = useState<ExerciseProgression[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  // La séance en cours n'est pas encore persistée : on l'ajoute au 1RM du jour.
  const session = useActiveSession();

  useEffect(() => {
    let cancelled = false;
    Promise.all([repository.getWeeklyAnalytics(weekStart), repository.getExerciseHistory()])
      .then(([weekly, history]) => {
        if (cancelled) return;
        setData(weekly);
        setProgressions(
          Object.entries(history)
            .map(([name, entries]) => buildProgression(name, entries))
            .filter((p): p is ExerciseProgression => p !== null),
        );
      })
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : "Chargement impossible."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [repository, weekStart]);

  const liveSets = (session?.exercises ?? []).flatMap((exo) =>
    exo.sets
      .filter((s) => s.checked)
      .map((s) => ({
        exerciseName: exo.name,
        weightKg: parseFloat(s.weight || s.weightPlaceholder) || 0,
        reps: parseInt(s.reps || s.repsPlaceholder, 10) || 0,
      })),
  );

  // Brzycki n'est fiable que jusqu'à 10 répétitions : au-delà, la série est ignorée.
  const allTodaySets = [...(data?.todaySets ?? []), ...liveSets].filter(
    (s) => s.weightKg > 0 && s.reps > 0 && s.reps <= 10,
  );
  const best = heaviestSet(allTodaySets);
  const oneRM = best ? brzycki(best.weightKg, best.reps) : 0;
  const intensity = best && oneRM > 0 ? loadCategory(best.weightKg / oneRM) : null;

  const volumeBars = toBars(data?.volume ?? [0, 0, 0, 0, 0, 0, 0]);
  const stepsBars = toBars(data?.steps ?? [0, 0, 0, 0, 0, 0, 0]);
  const kcalBars = toBars(data?.kcal ?? [0, 0, 0, 0, 0, 0, 0]);

  return (
    <AppShell>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingBottom: "24px" }}>
        <header style={{ padding: "8px 0 0" }}>
          <p style={eyebrow}>Analytique</p>
          <h1 style={{ color: "#fff", fontSize: "var(--text-display)", fontWeight: "var(--weight-medium)", margin: "2px 0 0" }}>
            Récap
          </h1>
        </header>

        {loading && <Muted>Chargement des statistiques…</Muted>}
        {!loading && error && <Muted>{error}</Muted>}

        {!loading && !error && (
          <>
            <div style={card}>
              <p style={eyebrow}>Progression</p>
              <p style={{ color: "var(--color-text-faint)", fontSize: "var(--text-label)", margin: "4px 0 14px" }}>
                Évolution de la charge sur tes exercices
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {progressions.length === 0 && (
                  <p style={{ color: "var(--color-text-faint)", fontSize: "var(--text-label)", textAlign: "center", padding: "12px 0", margin: 0 }}>
                    Valide des séries pour suivre ta progression.
                  </p>
                )}
                {progressions.map((p) => (
                  <div
                    key={p.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "8px",
                      padding: "10px 12px",
                      borderRadius: "12px",
                      background: "var(--color-bg-elevated)",
                      border: "none",
                    }}
                  >
                    <span style={{ color: "#fff", fontSize: "var(--text-label)", fontWeight: "var(--weight-medium)", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.name}
                    </span>
                    <div style={{ flexShrink: 0, textAlign: "right" }}>
                      <div>
                        <span style={{ color: "var(--color-at-prefix)", fontSize: "var(--text-label)", fontVariantNumeric: "tabular-nums" }}>
                          {p.firstKg}kg → {p.lastKg}kg
                        </span>
                        <span style={{ marginLeft: "6px", fontSize: "var(--text-caption)", fontWeight: "var(--weight-medium)", color: p.deltaColor }}>
                          {p.deltaLabel}
                        </span>
                      </div>
                      {p.rmLabel && (
                        <div style={{ color: "#A855F7", fontSize: "var(--text-caption)", marginTop: "2px" }}>
                          {p.rmLabel}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={card}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <div style={{ minWidth: 0 }}>
                  <p style={eyebrow}>Volume d'exercice hebdo</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginTop: "4px" }}>
                    <span style={bigNumber}>{weekTotal(data?.volume ?? []).toLocaleString("fr-FR")}</span>
                    <span style={{ color: "var(--color-at-prefix)", fontSize: "13px", fontWeight: "var(--weight-medium)" }}>kg de tonnage</span>
                  </div>
                </div>
                <div
                  style={{
                    flexShrink: 0,
                    height: "44px",
                    width: "44px",
                    borderRadius: "12px",
                    background: "var(--color-accent-soft)",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="#F59E71" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="2,12 7,6 10,9 14,3" />
                    <polyline points="10,3 14,3 14,7" />
                  </svg>
                </div>
              </div>
              <WeeklyBarChart bars={volumeBars} />
            </div>

            <div style={card}>
              <p style={eyebrow}>Volume de pas hebdo</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginTop: "4px" }}>
                <span style={bigNumber}>{weekTotal(data?.steps ?? []).toLocaleString("fr-FR")}</span>
                <span style={{ color: "var(--color-at-prefix)", fontSize: "13px", fontWeight: "var(--weight-medium)" }}>pas</span>
              </div>
              <WeeklyBarChart bars={stepsBars} color="var(--color-text-secondary)" />
            </div>

            <div style={card}>
              <p style={eyebrow}>Volume calorique hebdo</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginTop: "4px" }}>
                <span style={bigNumber}>{weekTotal(data?.kcal ?? []).toLocaleString("fr-FR")}</span>
                <span style={{ color: "var(--color-at-prefix)", fontSize: "13px", fontWeight: "var(--weight-medium)" }}>kcal</span>
              </div>
              <WeeklyBarChart bars={kcalBars} color="#A855F7" />
            </div>

            <div style={card}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <div style={{ minWidth: 0 }}>
                  <p style={eyebrow}>1RM estimé (Formule de Brzycki)</p>
                  <p style={{ color: "var(--color-at-prefix)", fontSize: "var(--text-label)", margin: "4px 0 0" }}>
                    Basé sur ta plus lourde série validée aujourd'hui
                  </p>
                </div>
                <div
                  style={{
                    flexShrink: 0,
                    height: "44px",
                    width: "44px",
                    borderRadius: "12px",
                    background: "rgba(168,85,247,0.15)",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 16 16" fill="#A855F7" aria-hidden="true">
                    <polygon points="8,1 3,9 7,9 6,15 13,6 9,6 8,1" />
                  </svg>
                </div>
              </div>

              <div style={{ marginTop: "12px", display: "flex", alignItems: "end", justifyContent: "space-between", gap: "12px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                    <span style={{ ...bigNumber, fontSize: "40px" }}>{Math.round(oneRM)}</span>
                    <span style={{ color: "var(--color-at-prefix)", fontSize: "14px", fontWeight: "var(--weight-medium)" }}>kg</span>
                  </div>
                  <p style={{ color: "var(--color-text-faint)", fontSize: "11px", margin: "4px 0 0" }}>
                    {best
                      ? `${best.exerciseName} — ${best.weightKg} kg × ${best.reps}`
                      : "Valide une série pour estimer ton 1RM."}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      display: "block",
                      color: "var(--color-success)",
                      fontSize: "11px",
                      fontWeight: "var(--weight-medium)",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Force pure
                  </span>
                {intensity && (
                  <span
                    style={{
                      color: intensity.color,
                      fontSize: "11px",
                      fontWeight: "var(--weight-medium)",
                      letterSpacing: "0.06em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Charge {intensity.label} · {Math.round((best!.weightKg / oneRM) * 100)}% du 1RM
                  </span>
                )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

function Muted({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ color: "var(--color-text-faint)", fontSize: "13px", textAlign: "center", padding: "16px 0", margin: 0 }}>
      {children}
    </p>
  );
}
