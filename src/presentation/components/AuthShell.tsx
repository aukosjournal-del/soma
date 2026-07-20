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
        padding: "24px",
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
          border: "1px solid var(--color-border)",
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
