import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "@presentation/components/AppShell";
import { ProgressRings } from "@presentation/components/ProgressRings";
import { QuickEntrySheet } from "./QuickEntrySheet";
import { StepsSheet } from "./StepsSheet";
import { SupabaseDailyLogRepository } from "@infrastructure/supabase/adapters/SupabaseDailyLogRepository";
import { SupabaseProfileReadRepository } from "@infrastructure/supabase/adapters/SupabaseProfileReadRepository";
import {
  type DailySummary,
  type NutritionEntry,
  computeRatios,
  emptyNutrition,
  pct,
} from "@domain/home/entities/DailySummary";
import { useActiveSession } from "@presentation/hooks/activeSessionStore";
import { syncQueueStore } from "@presentation/hooks/syncQueueStore";
import { flushQueue } from "@infrastructure/sync/SyncRunner";
import { localISODate } from "@domain/home/ports/DailyLogRepository";
import type { NutritionPayload, StepsPayload } from "@infrastructure/sync/SupabaseMutationExecutor";
import { sessionProgress } from "@domain/workout/entities/SessionExercise";

const card = {
  background: "var(--color-bg-elevated)",
  borderRadius: "var(--radius-lg)",
  padding: "16px",
  backdropFilter: "var(--blur-glass)",
  WebkitBackdropFilter: "var(--blur-glass)",
} as const;

/** Sur-titre de carte : discret, il nomme la section sans lui voler la vedette. */
const eyebrow = {
  color: "var(--color-text-faint)",
  fontSize: "var(--text-caption)",
  fontWeight: "var(--weight-medium)",
  margin: 0,
} as const;

const ghostButton = {
  width: "100%",
  minHeight: "var(--hit-target)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  fontWeight: "var(--weight-medium)",
  fontSize: "var(--text-body)",
  borderRadius: "12px",
  background: "var(--color-bg-elevated)",
  border: "none",
  color: "var(--color-text-secondary)",
  cursor: "pointer",
  boxSizing: "border-box",
} as const;

/** Chiffre dominant d'une carte de suivi (kcal, pas). */
const bigNumber = {
  color: "#fff",
  fontSize: "34px",
  fontWeight: "var(--weight-medium)",
  lineHeight: 1,
  fontVariantNumeric: "tabular-nums",
} as const;

const MACROS = [
  { key: "proteinG", label: "Protéines", color: "#C0EBFF" },
  { key: "carbsG", label: "Glucides", color: "#F59E71" },
  { key: "fatG", label: "Lipides", color: "#A855F7" },
  { key: "saltG", label: "Sel", color: "#EF4444" },
] as const;

/**
 * Accueil — clone du bloc `isHome` : anneaux de progression du jour,
 * routine du jour, suivi nutritionnel avec macros, suivi des pas.
 */
export function HomeScreen({ onStartSession }: { onStartSession: () => void }) {
  const dailyLog = useMemo(() => new SupabaseDailyLogRepository(), []);
  const profiles = useMemo(() => new SupabaseProfileReadRepository(), []);

  const [summary, setSummary] = useState<DailySummary>();
  const [firstName, setFirstName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [quickOpen, setQuickOpen] = useState(false);
  const [stepsOpen, setStepsOpen] = useState(false);

  const session = useActiveSession();
  const progress = sessionProgress(session?.exercises ?? []);

  const refresh = useCallback(async () => {
    try {
      const [today, profile] = await Promise.all([dailyLog.getToday(), profiles.getSummary()]);
      setSummary(today);
      setFirstName(profile?.firstName || profile?.username || "");
      setError(undefined);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chargement impossible.");
    } finally {
      setLoading(false);
    }
  }, [dailyLog, profiles]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const data = summary ?? { steps: 0, nutrition: emptyNutrition(), goals: { stepsGoal: 10000, kcalGoal: 2800 } };
  const ratios = computeRatios(data, progress.done, progress.total);
  const nutritionPct = pct(ratios.nutrition);
  const stepsPct = pct(ratios.steps);

  const todayLong = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const routineName = session?.routineName ?? null;
  // Nom de routine seul, comme en Séance : le jour est déjà affiché juste
  // au-dessus dans l'en-tête, et par le téléphone lui-même.
  const routineTitle = routineName ?? "Repos / Séance libre";
  const routineCta = routineName ? "Démarrer la séance" : "Lancer une séance libre";

  // Écriture optimiste : l'UI se met à jour immédiatement et la donnée part
  // dans la file — la saisie fonctionne donc entièrement hors-ligne.
  const saveNutrition = async (entry: NutritionEntry) => {
    setSummary((s) => ({ ...(s ?? data), nutrition: entry }));
    syncQueueStore.push<NutritionPayload>("nutrition.save", { entry, date: localISODate() });
    void flushQueue();
  };
  const saveSteps = async (steps: number) => {
    setSummary((s) => ({ ...(s ?? data), steps }));
    syncQueueStore.push<StepsPayload>("steps.save", { steps, date: localISODate() });
    void flushQueue();
  };

  return (
    <>
      <AppShell>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingBottom: "24px" }}>
          <header style={{ padding: "8px 0 0" }}>
            <p
              style={{
                color: "var(--color-text-faint)",
                fontSize: "var(--text-label)",
                textTransform: "capitalize",
                margin: 0,
              }}
            >
              {todayLong}
            </p>
            <h1
              style={{
                color: "#fff",
                fontSize: "var(--text-display)",
                fontWeight: "var(--weight-medium)",
                margin: "2px 0 0",
              }}
            >
              Bonjour, {firstName || "—"}
            </h1>
          </header>

          {error && <Muted>{error}</Muted>}

          <div style={card}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <ProgressRings ratios={ratios} />

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", width: "100%", marginTop: "16px" }}>
                <Metric
                  label="Pas"
                  value={data.steps.toLocaleString("fr-FR")}
                  goal={`/ ${data.goals.stepsGoal.toLocaleString("fr-FR")}`}
                  tint="rgba(245,158,113,0.13)"
                  color="#F59E71"
                  svg={
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                      <ellipse cx="6" cy="4.5" rx="2.2" ry="3" />
                      <ellipse cx="10.5" cy="10.5" rx="2.2" ry="3" />
                    </svg>
                  }
                />
                <Metric
                  label="Kcal"
                  value={String(data.nutrition.kcal)}
                  goal={`/ ${data.goals.kcalGoal}`}
                  tint="rgba(192,235,255,0.13)"
                  color="#C0EBFF"
                  svg={
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                      <path d="M8 1c1 3-2 3.5-2 6a2 2 0 004 0c0-1-.5-1.5-.5-1.5 1.5.5 3 2.5 3 4.5a4.5 4.5 0 01-9 0C3.5 6 6 4 8 1z" />
                    </svg>
                  }
                />
                <Metric
                  label="Séries"
                  value={String(progress.done)}
                  goal={`/ ${progress.total}`}
                  tint="rgba(16,185,129,0.13)"
                  color="#10B981"
                  svg={
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="1,8 5,8 6.5,4 9,12 10.5,8 15,8" />
                    </svg>
                  }
                />
              </div>
            </div>
          </div>

          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <div style={{ minWidth: 0 }}>
                <p style={eyebrow}>Routine du jour</p>
                <h2
                  style={{
                    color: "#fff",
                    fontSize: "var(--text-title)",
                    fontWeight: "var(--weight-medium)",
                    margin: "2px 0 0",
                  }}
                >
                  {routineTitle}
                </h2>
                <p
                  style={{
                    color: "var(--color-text-muted)",
                    fontSize: "var(--text-label)",
                    margin: "2px 0 0",
                  }}
                >
                  {routineName ? "Séance prête à démarrer" : "Aucune routine planifiée aujourd'hui"}
                </p>
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
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E71" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <rect x="1" y="9" width="3" height="6" rx="1" />
                  <rect x="20" y="9" width="3" height="6" rx="1" />
                  <rect x="5" y="7" width="3" height="10" rx="1" />
                  <rect x="16" y="7" width="3" height="10" rx="1" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
              </div>
            </div>
            <button
              type="button"
              className="soma-press"
              onClick={onStartSession}
              style={{
                width: "100%",
                minHeight: "52px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                fontWeight: "var(--weight-medium)",
                fontSize: "var(--text-body)",
                borderRadius: "12px",
                background: "var(--color-accent)",
                color: "var(--color-on-accent)",
                border: "none",
                cursor: "pointer",
                // Ombre accent conservée : c'est le seul appel à l'action
                // principal de l'écran, elle le fait sortir du plan.
                boxShadow: "var(--shadow-accent-cta)",
                boxSizing: "border-box",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <polygon points="3,2 14,8 3,14" fill="currentColor" />
              </svg>
              <span>{routineCta}</span>
            </button>
          </div>

          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <p style={eyebrow}>Nutrition</p>
              <span
                style={{
                  color: "var(--color-text-muted)",
                  fontSize: "var(--text-label)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {nutritionPct}%
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
              <span style={bigNumber}>{data.nutrition.kcal}</span>
              <span style={{ color: "var(--color-text-faint)", fontSize: "var(--text-body)" }}>
                / {data.goals.kcalGoal} kcal
              </span>
            </div>
            <Bar percent={nutritionPct} />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px", margin: "16px 0" }}>
              {MACROS.map((macro) => (
                <div
                  key={macro.key}
                  style={{
                    // Fond plus sourd que la carte parente : sans bordure, la
                    // sous-carte doit se distinguer par le contraste seul.
                    background: "var(--color-bg-elevated-strong)",
                    borderRadius: "12px",
                    padding: "10px",
                    border: "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
                    <span style={{ height: "6px", width: "6px", borderRadius: "50%", background: macro.color }} />
                    <span style={{ color: "var(--color-text-faint)", fontSize: "var(--text-micro)" }}>
                      {macro.label}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
                    <span
                      style={{
                        color: "#fff",
                        fontSize: "var(--text-heading)",
                        fontWeight: "var(--weight-medium)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {data.nutrition[macro.key]}
                    </span>
                    <span style={{ color: "var(--color-text-faint)", fontSize: "var(--text-caption)" }}>g</span>
                  </div>
                </div>
              ))}
            </div>

            <button type="button" className="soma-press" onClick={() => setQuickOpen(true)} style={ghostButton}>
              <PlusIcon />
              <span>Saisie rapide</span>
            </button>
          </div>

          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <p style={eyebrow}>Pas</p>
              <span
                style={{
                  color: "var(--color-text-muted)",
                  fontSize: "var(--text-label)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {stepsPct}%
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
              <span style={bigNumber}>{data.steps.toLocaleString("fr-FR")}</span>
              <span style={{ color: "var(--color-text-faint)", fontSize: "var(--text-body)" }}>
                / {data.goals.stepsGoal.toLocaleString("fr-FR")} pas
              </span>
            </div>
            <Bar percent={stepsPct} />

            <button
              type="button"
              className="soma-press"
              onClick={() => setStepsOpen(true)}
              style={{ ...ghostButton, marginTop: "16px" }}
            >
              <PlusIcon />
              <span>Saisir mes pas</span>
            </button>
          </div>

          {loading && <Muted>Chargement…</Muted>}
        </div>
      </AppShell>

      <QuickEntrySheet open={quickOpen} initial={data.nutrition} onClose={() => setQuickOpen(false)} onSave={saveNutrition} />
      <StepsSheet open={stepsOpen} initial={data.steps} onClose={() => setStepsOpen(false)} onSave={saveSteps} />
    </>
  );
}

function Bar({ percent }: { percent: number }) {
  return (
    <div style={{ height: "6px", width: "100%", background: "var(--color-border)", borderRadius: "999px", marginTop: "12px", overflow: "hidden" }}>
      <div style={{ height: "100%", background: "var(--color-accent)", borderRadius: "999px", transition: "width 0.7s ease", width: `${percent}%` }} />
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <line x1="8" y1="2" x2="8" y2="14" />
      <line x1="2" y1="8" x2="14" y2="8" />
    </svg>
  );
}

function Metric({
  label,
  value,
  goal,
  tint,
  color,
  svg,
}: {
  label: string;
  value: string;
  goal: string;
  tint: string;
  color: string;
  svg: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
      <div
        style={{
          height: "28px",
          width: "28px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: tint,
          color,
        }}
      >
        {svg}
      </div>
      <span style={{ color: "var(--color-text-faint)", fontSize: "var(--text-micro)" }}>{label}</span>
      <div style={{ textAlign: "center", lineHeight: 1.2 }}>
        <div
          style={{
            color: "#fff",
            fontSize: "var(--text-label)",
            fontWeight: "var(--weight-medium)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {value}
        </div>
        <div
          style={{
            color: "var(--color-text-faint)",
            fontSize: "var(--text-micro)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {goal}
        </div>
      </div>
    </div>
  );
}

function Muted({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ color: "var(--color-text-faint)", fontSize: "13px", textAlign: "center", padding: "16px 0", margin: 0 }}>
      {children}
    </p>
  );
}
