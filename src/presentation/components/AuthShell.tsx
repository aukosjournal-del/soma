import type { ReactNode } from "react";
import { RadialHalos } from "./RadialHalos";

/**
 * Coquille des écrans d'authentification : fond navy plein, halos fixes,
 * carte glassmorphism centrée. La largeur suit `--content-max-width`, la
 * même colonne que les écrans applicatifs : sans ça la carte de connexion
 * était visiblement plus étroite que le reste de l'app.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg)",
        color: "var(--color-text-secondary)",
        fontFamily: "var(--font-sans)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // Zone sûre iOS : la carte ne doit pas passer sous la barre d'état
        // ni sous l'indicateur d'accueil.
        padding:
          "calc(24px + env(safe-area-inset-top, 0px)) calc(24px + env(safe-area-inset-right, 0px)) calc(24px + env(safe-area-inset-bottom, 0px)) calc(24px + env(safe-area-inset-left, 0px))",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <RadialHalos />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "var(--content-max-width)",
          background: "var(--color-bg-elevated)",
          borderRadius: "24px",
          padding: "28px 24px",
          backdropFilter: "var(--blur-glass)",
          WebkitBackdropFilter: "var(--blur-glass)",
          boxShadow: "var(--shadow-card)",
          boxSizing: "border-box",
        }}
      >
        {children}
      </div>
    </div>
  );
}
