import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "@presentation/components/AppShell";
import { BiometricsSheet } from "./BiometricsSheet";
import { IndicatorsSheet } from "./IndicatorsSheet";
import { AccountEditSheet } from "./AccountEditSheet";
import { AvatarPickerSheet } from "./AvatarPickerSheet";
import { SupabaseProfileReadRepository } from "@infrastructure/supabase/adapters/SupabaseProfileReadRepository";
import { syncQueueStore } from "@presentation/hooks/syncQueueStore";
import { flushQueue } from "@infrastructure/sync/SyncRunner";
import type { BiometricsPayload } from "@infrastructure/sync/SupabaseMutationExecutor";
import type { AccountUpdate, ProfileSummary } from "@domain/profile/ports/ProfileReadRepository";
import {
  type BodyMetrics,
  BIO_METRIC_CATALOG,
  DEFAULT_VISIBLE_BIO,
  DEFAULT_VISIBLE_INDICATORS,
  ageFromBirthDate,
  bioMetricValue,
  computeIndicators,
  emptyBodyMetrics,
} from "@domain/profile/entities/BodyMetrics";
import type { TrainingHistory } from "@domain/profile/entities/Achievements";
import { DisciplineCard } from "./DisciplineCard";
import { GoalsCard } from "./GoalsCard";
import { SupabaseAuthGateway } from "@infrastructure/supabase/adapters/SupabaseAuthGateway";
import { rememberMe } from "@infrastructure/auth/rememberMe";

const card = {
  background: "var(--color-bg-elevated)",
  border: "1px solid var(--color-border)",
  borderRadius: "24px",
  padding: "16px",
  backdropFilter: "var(--blur-glass)",
  WebkitBackdropFilter: "var(--blur-glass)",
  boxShadow: "var(--shadow-card)",
} as const;

const eyebrow = {
  color: "var(--color-at-prefix)",
  fontSize: "11px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "var(--tracking-eyebrow)",
  margin: 0,
} as const;

const pillButton = {
  height: "30px",
  padding: "0 12px",
  borderRadius: "999px",
  border: "1px solid var(--color-border)",
  background: "var(--color-bg-elevated)",
  color: "var(--color-text-secondary)",
  fontSize: "12px",
  fontWeight: 700,
  cursor: "pointer",
} as const;

const accentButton = {
  flexShrink: 0,
  height: "36px",
  padding: "0 14px",
  borderRadius: "12px",
  background: "var(--color-accent-soft)",
  border: "1px solid rgba(245,158,113,0.3)",
  color: "var(--color-accent)",
  fontSize: "12px",
  fontWeight: 800,
  cursor: "pointer",
} as const;

/**
 * Profil — compte, biométrie et indicateurs, tous configurables via les
 * bottom sheets du prototype (biométrie, indicateurs, compte, avatar).
 */
export function ProfileScreen() {
  const repository = useMemo(() => new SupabaseProfileReadRepository(), []);
  const [summary, setSummary] = useState<ProfileSummary | null>(null);
  const [metrics, setMetrics] = useState<BodyMetrics>(emptyBodyMetrics());
  const [history, setHistory] = useState<TrainingHistory>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const [bioOpen, setBioOpen] = useState(false);
  const [indicatorsOpen, setIndicatorsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [s, m, h] = await Promise.all([
        repository.getSummary(),
        repository.getLatestMetrics(),
        repository.getTrainingHistory(),
      ]);
      setSummary(s);
      setMetrics(m);
      setHistory(h);
      setError(undefined);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chargement impossible.");
    } finally {
      setLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const visibleBio = summary?.visibleBioMetrics?.length ? summary.visibleBioMetrics : DEFAULT_VISIBLE_BIO;
  const visibleIndicators = summary?.visibleIndicators?.length ? summary.visibleIndicators : DEFAULT_VISIBLE_INDICATORS;

  const age = ageFromBirthDate(summary?.birthDate ?? null);
  const indicators = computeIndicators(metrics, visibleIndicators);
  const fullName = [summary?.firstName, summary?.lastName].filter(Boolean).join(" ");
  const shownMetrics = BIO_METRIC_CATALOG.filter((m) => visibleBio.includes(m.id));

  // Le relevé passe par la file (utilisable hors-ligne) ; l'affichage local
  // est mis à jour immédiatement.
  const saveBiometrics = async (values: BodyMetrics, ids: string[]) => {
    setMetrics(values);
    syncQueueStore.push<BiometricsPayload>("biometrics.save", { metrics: values });
    void flushQueue();
    await repository.updateVisibleBioMetrics(ids);
    await refresh();
  };
  const saveIndicators = async (ids: string[]) => {
    await repository.updateVisibleIndicators(ids);
    await refresh();
  };
  const saveAccount = async (update: AccountUpdate) => {
    await repository.updateAccount(update);
    await refresh();
  };
  const saveAvatar = async (avatar: string) => {
    await repository.updateAvatar(avatar);
    await refresh();
  };
  const saveGoals = async (goals: { stepsGoal: number; kcalGoal: number }) => {
    await repository.updateGoals(goals);
    await refresh();
  };
  const logout = async () => {
    // Se déconnecter annule « rester connecté » : sinon la case cochée
    // relancerait l'app directement sur l'Accueil au prochain démarrage.
    rememberMe.clear();
    await new SupabaseAuthGateway().signOut();
    // Recharge l'app : on repart proprement sur l'écran de connexion.
    window.location.assign("/");
  };

  return (
    <>
      <AppShell>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingBottom: "24px" }}>
          <header style={{ padding: "8px 0 0" }}>
            <p style={eyebrow}>Profil</p>
            <h1 style={{ color: "#fff", fontSize: "26px", fontWeight: 900, letterSpacing: "-0.02em", margin: "2px 0 0" }}>
              {summary?.firstName || summary?.username || "—"}
            </h1>
          </header>

          {loading && <Muted>Chargement du profil…</Muted>}
          {!loading && error && <Muted>{error}</Muted>}

          {!loading && (
            <>
              <div style={card}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                  <p style={eyebrow}>Compte</p>
                  <button type="button" onClick={() => setAccountOpen(true)} style={pillButton}>
                    Modifier
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => setAvatarOpen(true)}
                    aria-label="Changer d'avatar"
                    style={{
                      position: "relative",
                      width: "128px",
                      height: "128px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      flexShrink: 0,
                      border: "1px solid var(--color-border)",
                      background: "var(--color-bg)",
                      cursor: "pointer",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {summary?.avatar && summary.avatar !== "logo" ? (
                      <span style={{ fontSize: "64px", lineHeight: 1 }}>{summary.avatar}</span>
                    ) : (
                      <img
                        src="/soma-logo-orange-navy.png"
                        alt="Avatar"
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transform: "scale(1.9)" }}
                      />
                    )}
                    <span
                      style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: "var(--color-accent)",
                        border: "2px solid var(--color-bg)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--color-on-accent)",
                      }}
                    >
                      <svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M11 2l3 3-8 8-3.5 0.5L3 10z" />
                      </svg>
                    </span>
                  </button>

                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: "#fff", fontSize: "18px", fontWeight: 800 }}>@{summary?.username || "—"}</div>
                    <div style={{ color: "rgba(192,235,255,0.7)", fontSize: "15px", marginTop: "2px" }}>{fullName || "—"}</div>
                    <div style={{ color: "var(--color-text-muted)", fontSize: "14px", fontWeight: 700, marginTop: "2px", fontVariantNumeric: "tabular-nums" }}>
                      {age !== null ? `${age} ans` : "Âge non renseigné"}
                    </div>
                  </div>
                </div>
              </div>

              <div style={card}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                  <div
                    style={{
                      height: "48px",
                      width: "48px",
                      borderRadius: "12px",
                      background: "var(--color-accent-soft)",
                      border: "1px solid rgba(245,158,113,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F59E71" strokeWidth="2" aria-hidden="true">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
                    </svg>
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h2 style={{ color: "#fff", fontSize: "18px", fontWeight: 900, margin: 0 }}>Biométrie</h2>
                    <p style={{ color: "var(--color-at-prefix)", fontSize: "12px", margin: "2px 0 0" }}>Utilisées dans les calculs</p>
                  </div>
                  <button type="button" onClick={() => setBioOpen(true)} style={accentButton}>
                    Compléter
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "6px" }}>
                  {shownMetrics.map((field) => (
                    <div
                      key={field.id}
                      style={{
                        background: "var(--color-bg-elevated)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "12px",
                        padding: "8px 6px",
                        boxSizing: "border-box",
                      }}
                    >
                      <div
                        style={{
                          color: "var(--color-text-muted)",
                          fontSize: "9px",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.02em",
                          marginBottom: "3px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {field.label}
                      </div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
                        <span style={{ color: "#fff", fontSize: "15px", fontWeight: 900, fontVariantNumeric: "tabular-nums" }}>
                          {bioMetricValue(metrics, field) ?? "—"}
                        </span>
                        <span style={{ color: "var(--color-text-faint)", fontSize: "9px", flexShrink: 0 }}>{field.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={eyebrow}>Indicateurs</p>
                <button type="button" onClick={() => setIndicatorsOpen(true)} style={accentButton}>
                  Modifier
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {indicators.map((indicator) => (
                  <div key={indicator.id} style={card}>
                    <p style={eyebrow}>{indicator.label}</p>
                    <div style={{ marginTop: "8px", display: "flex", alignItems: "baseline", gap: "4px" }}>
                      <span style={{ color: "#fff", fontSize: "32px", fontWeight: 900, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                        {indicator.value || "—"}
                      </span>
                      <span style={{ color: "var(--color-at-prefix)", fontSize: "12px", fontWeight: 500 }}>{indicator.unit}</span>
                    </div>
                    {indicator.statusLabel && (
                      <p style={{ color: indicator.statusColor, fontSize: "11px", fontWeight: 700, margin: "8px 0 0", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        {indicator.statusLabel}
                      </p>
                    )}
                    {indicator.description && (
                      <p style={{ color: "var(--color-text-faint)", fontSize: "11px", margin: "8px 0 0", lineHeight: 1.4 }}>
                        {indicator.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {history && <DisciplineCard history={history} />}

              <GoalsCard
                stepsGoal={summary?.stepsGoal ?? 10000}
                kcalGoal={summary?.kcalGoal ?? 2800}
                onSave={saveGoals}
              />

              <button
                type="button"
                onClick={logout}
                style={{
                  width: "100%",
                  minHeight: "52px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  fontWeight: 800,
                  fontSize: "15px",
                  borderRadius: "12px",
                  background: "rgba(239,68,68,0.12)",
                  border: "1px solid rgba(239,68,68,0.35)",
                  color: "var(--color-error)",
                  cursor: "pointer",
                  boxSizing: "border-box",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                  <polyline points="16,17 21,12 16,7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>DÉCONNEXION</span>
              </button>
            </>
          )}
        </div>
      </AppShell>

      <BiometricsSheet open={bioOpen} metrics={metrics} visibleIds={visibleBio} onClose={() => setBioOpen(false)} onSave={saveBiometrics} />
      <IndicatorsSheet open={indicatorsOpen} metrics={metrics} visibleIds={visibleIndicators} onClose={() => setIndicatorsOpen(false)} onSave={saveIndicators} />
      <AccountEditSheet open={accountOpen} summary={summary} onClose={() => setAccountOpen(false)} onSave={saveAccount} />
      <AvatarPickerSheet open={avatarOpen} current={summary?.avatar ?? "logo"} onClose={() => setAvatarOpen(false)} onPick={saveAvatar} />
    </>
  );
}

function Muted({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ color: "var(--color-text-faint)", fontSize: "13px", textAlign: "center", padding: "16px 0", margin: 0 }}>
      {children}
    </p>
  );
}
