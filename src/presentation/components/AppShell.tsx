import type { ReactNode } from "react";
import { RadialHalos } from "./RadialHalos";

/**
 * Coquille des écrans applicatifs (authentifié) : fond navy plein, halos
 * radiaux fixes, contenu scrollable centré. Reprise du shell du prototype.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg)",
        color: "var(--color-text-secondary)",
        fontFamily: "var(--font-sans)",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <RadialHalos />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "var(--content-max-width)",
          margin: "0 auto",
          /*
           * `viewport-fit=cover` + barre d'état translucide (iOS) : le contenu
           * passe sous l'heure et les icônes réseau. On repousse donc le haut
           * de la zone sûre, et on garde en bas la place de la nav flottante
           * augmentée de l'indicateur d'accueil. Les marges latérales couvrent
           * l'encoche en orientation paysage.
           */
          // 16 px de respiration en plus de la zone sûre : la Dynamic Island
          // est un bloc opaque bien plus épais qu'une encoche, et le titre en
          // 26 px gras butait contre elle.
          paddingTop: "calc(16px + env(safe-area-inset-top, 0px))",
          paddingBottom: "calc(96px + env(safe-area-inset-bottom, 0px))",
          paddingLeft: "calc(16px + env(safe-area-inset-left, 0px))",
          paddingRight: "calc(16px + env(safe-area-inset-right, 0px))",
          boxSizing: "border-box",
        }}
      >
        {children}
      </div>
    </div>
  );
}
