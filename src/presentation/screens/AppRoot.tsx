import { useEffect, useState } from "react";
import { SyncStatusBadge } from "@presentation/components/SyncStatusBadge";
import { startSync } from "@infrastructure/sync/SyncRunner";
import { HomeScreen } from "./home/HomeScreen";
import { WorkoutScreen } from "./workout/WorkoutScreen";
import { PlanningScreen } from "./planning/PlanningScreen";
import { AnalyticsScreen } from "./analytics/AnalyticsScreen";
import { ProfileScreen } from "./profile/ProfileScreen";
import { BottomNav, type AppTab } from "@presentation/components/BottomNav";
import { activeSessionStore } from "@presentation/hooks/activeSessionStore";
import { buildSessionFromDraft } from "@domain/workout/entities/SessionExercise";
import type { RoutineDraftExercise } from "@domain/workout/ports/RoutineRepository";

/**
 * Racine applicative (post-authentification).
 * Onglets et ordre repris du prototype : Planning · Séance · Accueil · Récap · Profil,
 * l'Accueil étant l'écran d'entrée.
 */
export function AppRoot() {
  const [tab, setTab] = useState<AppTab>("home");

  // Rejeu des écritures en attente : au montage, au retour du réseau et
  // au retour de l'app au premier plan.
  useEffect(() => {
    startSync();
  }, []);

  const launchFreeSession = (exercises: RoutineDraftExercise[]) => {
    // La Séance Libre remplace la séance active du jour, puis on bascule.
    activeSessionStore.start("Libre", buildSessionFromDraft(exercises), null, "free");
    setTab("workout");
  };

  return (
    <>
      {tab === "home" && <HomeScreen onStartSession={() => setTab("workout")} />}
      {tab === "workout" && <WorkoutScreen onFinished={() => setTab("recap")} />}
      {tab === "planning" && <PlanningScreen onLaunchFreeSession={launchFreeSession} />}
      {tab === "recap" && <AnalyticsScreen />}
      {tab === "profile" && <ProfileScreen />}
      <SyncStatusBadge />
      <BottomNav active={tab} onChange={setTab} />
    </>
  );
}
