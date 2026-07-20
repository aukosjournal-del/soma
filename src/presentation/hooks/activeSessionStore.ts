import { useSyncExternalStore } from "react";
import type { SessionExercise } from "@domain/workout/entities/SessionExercise";

export interface ActiveSession {
  date: string;
  /** ISO — sert à calculer la durée réelle à la clôture. */
  startedAt: string;
  routineId: string | null;
  routineName: string | null;
  exercises: SessionExercise[];
}

const STORAGE_KEY = "soma_active_session";

function today(): string {
  return new Date().toDateString();
}

function load(): ActiveSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as ActiveSession;
    // Une séance n'est reprise que le jour même.
    return saved.date === today() ? saved : null;
  } catch {
    return null;
  }
}

let state: ActiveSession | null = load();
const listeners = new Set<() => void>();

function set(next: ActiveSession | null) {
  state = next;
  try {
    if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* quota / mode privé : la séance reste utilisable en mémoire */
  }
  listeners.forEach((l) => l());
}

/**
 * Séance active — source de vérité unique, offline-first. Alimentée soit par
 * la routine du jour (Supabase), soit par une Séance Libre générée localement.
 */
export const activeSessionStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot(): ActiveSession | null {
    return state;
  },
  start(routineName: string | null, exercises: SessionExercise[], routineId: string | null = null) {
    set({ date: today(), startedAt: new Date().toISOString(), routineId, routineName, exercises });
  },
  updateExercises(updater: (current: SessionExercise[]) => SessionExercise[]) {
    if (!state) return;
    set({ ...state, exercises: updater(state.exercises) });
  },
  clear() {
    set(null);
  },
  /**
   * Invalide la séance du jour uniquement si elle n'a pas été entamée
   * (aucune série validée ou marquée ratée). Elle sera reconstruite depuis
   * le planning au prochain affichage. Une séance en cours n'est jamais
   * détruite : on ne perd pas le travail de l'utilisateur.
   */
  invalidateIfUntouched(): boolean {
    if (!state) return true;
    const touched = state.exercises.some((exo) =>
      exo.sets.some((s) => s.checked || s.failed || s.weight !== "" || s.reps !== ""),
    );
    if (touched) return false;
    set(null);
    return true;
  },
};

export function useActiveSession(): ActiveSession | null {
  return useSyncExternalStore(activeSessionStore.subscribe, activeSessionStore.getSnapshot);
}
