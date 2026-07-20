import type { ReactNode } from "react";
import { RadialHalos } from "./RadialHalos";

/**
 * Coquille des écrans d'authentification : fond navy plein, halos fixes,
 * carte glassmorphism centrée (max 400px). Valeurs reprises du prototype
 * (SOMA.dc.html, lignes 24-31).
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
          maxWidth: "400px",
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
