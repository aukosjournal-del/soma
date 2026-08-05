/**
 * En-tête de marque : logo 56×56 (radius 16, bord accent) + wordmark "SOMA".
 * Repris du prototype (SOMA.dc.html, lignes 33-37). Le logo sert aussi
 * d'avatar par défaut ailleurs dans l'app.
 */
export function BrandHeader() {
  return (
    <div style={{ textAlign: "center", marginBottom: "24px" }}>
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "16px",
          overflow: "hidden",
          margin: "0 auto 12px",
          border: "1px solid var(--color-accent-border)",
          background: "var(--color-bg)",
        }}
      >
        <img
          src="/soma-logo-orange-navy.png"
          alt="Logo SOMA"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            transform: "scale(1.9)",
          }}
        />
      </div>
      <div
        style={{
          color: "var(--color-text)",
          fontSize: "var(--text-title)",
          // Seule exception assumée à la graisse 500 : le wordmark est un
          // logotype, pas du texte d'interface.
          fontWeight: "var(--weight-strong)",
          letterSpacing: "var(--tracking-logo)",
        }}
      >
        SOMA
      </div>
    </div>
  );
}
