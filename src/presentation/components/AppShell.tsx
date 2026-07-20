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
          padding: "0 16px 96px", // place pour la nav flottante
          boxSizing: "border-box",
        }}
      >
        {children}
      </div>
    </div>
  );
}
