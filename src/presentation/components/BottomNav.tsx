import type { ReactNode } from "react";
import { useCompactOnScroll } from "@presentation/hooks/useCompactOnScroll";

export type AppTab = "planning" | "workout" | "home" | "recap" | "profile";

export interface BottomNavProps {
  active: AppTab;
  onChange: (tab: AppTab) => void;
}

// 24px : bas de la fourchette 24-26px recommandée pour une icône de nav basse
// (16-20px se lisait mal une fois la zone de touche portée à 48px).
const icon = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
} as const;

/** Icônes SVG reprises trait pour trait du prototype. */
const TABS: { id: AppTab; label: string; svg: ReactNode }[] = [
  {
    id: "planning",
    label: "Planning",
    svg: (
      <svg {...icon} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="16" y1="2" x2="16" y2="6" />
      </svg>
    ),
  },
  {
    id: "workout",
    label: "Séance",
    svg: (
      <svg {...icon} strokeLinecap="round" aria-hidden="true">
        <rect x="1" y="9" width="3" height="6" rx="1" />
        <rect x="20" y="9" width="3" height="6" rx="1" />
        <rect x="5" y="7" width="3" height="10" rx="1" />
        <rect x="16" y="7" width="3" height="10" rx="1" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
  },
  {
    id: "home",
    label: "Accueil",
    svg: (
      <svg {...icon} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 11l9-8 9 8" />
        <path d="M5 10v10h14V10" />
      </svg>
    ),
  },
  {
    id: "recap",
    label: "Récap",
    svg: (
      <svg {...icon} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 19V10" />
        <path d="M10 19V5" />
        <path d="M16 19V13" />
        <path d="M4 19h16" />
      </svg>
    ),
  },
  {
    id: "profile",
    label: "Profil",
    svg: (
      <svg {...icon} aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
      </svg>
    ),
  },
];

/**
 * Navigation basse — 5 onglets en icônes, ordre exact du prototype :
 * Planning · Séance · Accueil · Récap · Profil.
 *
 * Toujours visible, jamais masquée. En défilant vers le bas, la pilule passe
 * en mode compact (plus fine, légèrement translucide) pour libérer de la
 * place de lecture ; elle se redéploie dès qu'on remonte, instantanément sur
 * un balayage rapide, et reste déployée en haut de page et près du bas.
 */
export function BottomNav({ active, onChange }: BottomNavProps) {
  const isCompact = useCompactOnScroll();

  return (
    <nav
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        marginInline: "auto",
        // Décollée du bord, jamais chevauchée par la barre d'accueil iOS.
        bottom: "calc(16px + env(safe-area-inset-bottom))",
        zIndex: 40,
        width: "calc(100% - 32px)",
        maxWidth: "416px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          background: "var(--color-bg-elevated)",
          backdropFilter: "var(--blur-glass)",
          WebkitBackdropFilter: "var(--blur-glass)",
          border: "1px solid var(--color-border)",
          borderRadius: "999px",
          padding: isCompact ? "3px" : "5px",
          opacity: isCompact ? 0.7 : 1,
          boxShadow: "var(--shadow-card)",
          transition: "padding 0.25s ease, opacity 0.25s ease",
        }}
      >
        {TABS.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
              style={{
                // 48px déployé : zone de touche minimale recommandée
                // (iOS/Android). Réduite en mode compact — état transitoire
                // qui redevient 48px dès qu'on cesse de défiler vers le bas.
                height: isCompact ? "40px" : "48px",
                minWidth: isCompact ? "40px" : "48px",
                flex: 1,
                borderRadius: "999px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                cursor: "pointer",
                transition: "background 0.25s ease, color 0.25s ease, height 0.25s ease, min-width 0.25s ease",
                background: isActive ? "var(--color-accent)" : "transparent",
                color: isActive ? "var(--color-on-accent)" : "rgba(192,235,255,0.65)",
              }}
            >
              {tab.svg}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
