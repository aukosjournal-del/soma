import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Filet de sécurité applicatif — sans lui, une erreur de rendu (ex. réponse
 * Supabase inattendue) fait planter tout l'arbre React vers un écran blanc,
 * sans message ni moyen de s'en sortir. Doit être une classe : c'est le seul
 * type de composant React qui peut implémenter `componentDidCatch` /
 * `getDerivedStateFromError`, aucun hook ne remplace ça.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[SOMA] erreur non interceptée", error, info.componentStack);
  }

  private reset = () => {
    // Un recharger complet plutôt qu'un simple reset d'état : l'erreur peut
    // venir d'un store externe (activeSessionStore, syncQueueStore) resté
    // dans un état incohérent que le remontage seul ne corrigerait pas.
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          padding: "24px",
          textAlign: "center",
          background: "var(--color-bg, #002B4C)",
          color: "#fff",
          fontFamily: "var(--font-sans, sans-serif)",
          boxSizing: "border-box",
        }}
      >
        <h1 style={{ fontSize: "var(--text-title, 19px)", fontWeight: "var(--weight-medium)", margin: 0 }}>
          Un problème est survenu
        </h1>
        <p style={{ fontSize: "13px", color: "rgba(192,235,255,0.75)", margin: 0, maxWidth: "320px" }}>
          L'application a rencontré une erreur inattendue. Tes données restent en sécurité — la
          reprise se fait automatiquement dès le retour en ligne.
        </p>
        <button
          type="button"
          onClick={this.reset}
          style={{
            marginTop: "8px",
            height: "48px",
            padding: "0 24px",
            fontWeight: "var(--weight-medium)",
            fontSize: "14px",
            borderRadius: "12px",
            background: "var(--color-accent, #F5A276)",
            color: "var(--color-on-accent, #002B4C)",
            border: "none",
            cursor: "pointer",
          }}
        >
          Recharger l'application
        </button>
      </div>
    );
  }
}
