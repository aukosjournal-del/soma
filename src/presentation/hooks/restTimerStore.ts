import { useSyncExternalStore } from "react";

export interface RestState {
  /** null = minuteur masqué ; 0 = récupération terminée. */
  seconds: number | null;
  total: number;
}

const STORAGE_KEY = "soma_rest_timer";
const DEFAULT_REST = 90;

function load(): RestState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { seconds: null, total: DEFAULT_REST };
    const saved = JSON.parse(raw) as { seconds: number | null; total: number; at?: number };
    if (saved.seconds === null || saved.seconds === undefined) {
      return { seconds: null, total: saved.total || DEFAULT_REST };
    }
    // Rattrape le temps écoulé pendant que l'app était fermée.
    const elapsed = saved.at ? Math.floor((Date.now() - saved.at) / 1000) : 0;
    const seconds = Math.max(0, saved.seconds - elapsed);
    return { seconds, total: saved.total || DEFAULT_REST };
  } catch {
    return { seconds: null, total: DEFAULT_REST };
  }
}

let state: RestState = load();
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ seconds: state.seconds, total: state.total, at: Date.now() }),
    );
  } catch {
    /* quota / mode privé : le minuteur reste fonctionnel en mémoire */
  }
}

function set(next: RestState) {
  state = next;
  persist();
  listeners.forEach((l) => l());
}

/**
 * Minuteur de repos GLOBAL et PERSISTANT : vit hors de React, survit aux
 * changements d'écran, aux remontages et à la fermeture de l'app.
 */
export const restTimerStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot(): RestState {
    return state;
  },
  start(duration?: number) {
    const d = duration && duration > 0 ? duration : DEFAULT_REST;
    set({ seconds: d, total: d });
  },
  close() {
    set({ ...state, seconds: null });
  },
  tick() {
    if (state.seconds === null || state.seconds === 0) return;
    set({ ...state, seconds: state.seconds <= 1 ? 0 : state.seconds - 1 });
  },
};

// Un seul intervalle pour toute l'application.
if (typeof window !== "undefined") {
  window.setInterval(() => restTimerStore.tick(), 1000);
}

export function useRestTimer(): RestState {
  return useSyncExternalStore(restTimerStore.subscribe, restTimerStore.getSnapshot);
}
