import { useEffect, type ReactNode } from "react";

export interface BottomSheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /**
   * Sheet long : hauteur fixe 82vh, corps scrollable et pied collant.
   * Utilisé par les listes de sélection (biométrie, indicateurs).
   */
  tall?: boolean;
  /** Pied collant, rendu hors de la zone scrollable. */
  footer?: ReactNode;
}

/**
 * Bottom sheet glassmorphism — scrim flouté + panneau montant.
 * Repris à l'identique du prototype (radius top 28, somaSlideUp 0.3s).
 */
export function BottomSheet({ open, title, onClose, children, tall, footer }: BottomSheetProps) {
  // Fige le défilement de la page derrière le sheet. La gouttière d'ascenseur
  // étant réservée en permanence (globals.css), le contenu ne se décale pas.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Échap ferme le sheet — attendu de tout dialogue modal.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
          animation: "somaFadeIn 0.3s ease-out",
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          zIndex: 60,
          left: "50%",
          transform: "translateX(-50%)",
          bottom: 0,
          width: "100%",
          maxWidth: "var(--content-max-width)",
          background: "var(--color-bg)",
          borderTop: "1px solid var(--color-border)",
          borderTopLeftRadius: "28px",
          borderTopRightRadius: "28px",
          // Marge basse : 32 px, augmentés de la zone sûre (encoche/barre iOS).
          padding: "12px 16px calc(32px + env(safe-area-inset-bottom, 0px))",
          boxSizing: "border-box",
          boxShadow: "0 -20px 60px rgba(0,0,0,0.5)",
          animation: "somaSlideUp 0.3s ease-out",
          ...(tall
            ? { height: "82vh", display: "flex", flexDirection: "column" as const }
            : { maxHeight: "85vh", overflowY: "auto" as const }),
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px", flexShrink: 0 }}>
          <div style={{ height: "4px", width: "40px", borderRadius: "999px", background: "rgba(192,235,255,0.2)" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexShrink: 0 }}>
          <h3 style={{ color: "#fff", fontSize: "18px", fontWeight: 900, margin: 0 }}>{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            style={{
              height: "36px",
              width: "36px",
              borderRadius: "12px",
              background: "var(--color-bg-elevated)",
              border: "1px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-text-secondary)",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="4" y1="4" x2="12" y2="12" />
              <line x1="12" y1="4" x2="4" y2="12" />
            </svg>
          </button>
        </div>

        {tall ? (
          <>
            <div style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingBottom: "12px" }}>{children}</div>
            {footer && (
              <div
                style={{
                  flexShrink: 0,
                  paddingTop: "12px",
                  boxShadow: "0 -12px 24px rgba(0,43,76,0.6)",
                  background: "var(--color-bg)",
                }}
              >
                {footer}
              </div>
            )}
          </>
        ) : (
          <>
            {children}
            {footer}
          </>
        )}
      </div>
    </>
  );
}
