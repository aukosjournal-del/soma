/**
 * Amorçage des tests — fournit un `localStorage` minimal.
 *
 * Pourquoi ne pas utiliser l'environnement jsdom : il s'appliquait sous Linux
 * mais pas sur macOS (Node exposant alors un `localStorage` natif indisponible
 * sans `--localstorage-file`), et les tests passaient d'une machine à l'autre
 * sans raison lisible. Les seuls tests qui touchent au DOM sont ceux des
 * stores, et ils n'ont besoin que de cette API-là : un stub de vingt lignes
 * remplace une dépendance lourde et rend le résultat identique partout.
 */
class MemoryStorage implements Storage {
  private map = new Map<string, string>();

  get length(): number {
    return this.map.size;
  }
  clear(): void {
    this.map.clear();
  }
  getItem(key: string): string | null {
    return this.map.get(key) ?? null;
  }
  key(index: number): string | null {
    return Array.from(this.map.keys())[index] ?? null;
  }
  removeItem(key: string): void {
    this.map.delete(key);
  }
  setItem(key: string, value: string): void {
    this.map.set(key, String(value));
  }
}

// `defineProperty` plutôt qu'une affectation : sur Node récent `localStorage`
// est un accesseur non inscriptible qui lève à la lecture.
Object.defineProperty(globalThis, "localStorage", {
  value: new MemoryStorage(),
  writable: true,
  configurable: true,
});

// Le code applicatif teste `typeof window !== "undefined"` (restTimerStore).
// En environnement node il n'y a pas de window : on n'en fabrique pas, la
// branche est simplement inactive, ce qui est le comportement voulu ici.
