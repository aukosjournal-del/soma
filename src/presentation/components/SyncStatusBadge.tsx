import { useEffect, useState } from "react";
import { useSyncQueue, syncQueueStore } from "@presentation/hooks/syncQueueStore";
import { isExhausted } from "@domain/sync/entities/PendingMutation";
import { flushQueue } from "@infrastructure/sync/SyncRunner";

/**
 * Bandeau d'état de la synchronisation. Invisible quand tout est à jour.
 * Placé au-dessus de la navigation basse.
 */
export function SyncStatusBadge() {
  const queue = useSyncQueue();
  const [online, setOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);

  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);

  if (queue.length === 0) return null;

  const blocked = queue.filter(isExhausted).length;
  const failing = blocked > 0;

  const label = !online
    ? `Hors ligne — ${queue.length} modification${queue.length > 1 ? "s" : ""} en attente`
    : failing
      ? `${blocked} synchronisation${blocked > 1 ? "s" : ""} en échec`
      : `Synchronisation — ${queue.length} en attente`;

  const accent = failing ? "var(--color-error)" : online ? "var(--color-accent)" : "var(--color-text-secondary)";

  return (
    <div
      role="status"
      style={{
        position: "fixed",
        left: "50%",
        transform: "translateX(-50%)",
        bottom: "calc(78px + env(safe-area-inset-bottom))",
        zIndex: 44,
        width: "calc(100% - 32px)",
        maxWidth: "416px",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          pointerEvents: "auto",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: "rgba(0,20,36,0.95)",
          backdropFilter: "var(--blur-glass)",
          WebkitBackdropFilter: "var(--blur-glass)",
          border: `1px solid ${failing ? "var(--color-error-border)" : "var(--color-border)"}`,
          borderRadius: "999px",
          padding: "8px 14px",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <span style={{ height: "8px", width: "8px", borderRadius: "50%", background: accent, flexShrink: 0 }} />
        <span style={{ flex: 1, minWidth: 0, color: "var(--color-text-secondary)", fontSize: "12px", fontWeight: 600 }}>
          {label}
        </span>
        {failing && (
          <button
            type="button"
            onClick={() => {
              syncQueueStore.retryExhausted();
              void flushQueue();
            }}
            style={{
              flexShrink: 0,
              border: "none",
              background: "var(--color-accent-soft)",
              color: "var(--color-accent)",
              borderRadius: "999px",
              padding: "5px 12px",
              fontSize: "11px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Réessayer
          </button>
        )}
      </div>
    </div>
  );
}
