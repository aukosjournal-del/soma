import { useEffect, useMemo, useState } from "react";
import { AuthShell } from "@presentation/components/AuthShell";
import { BrandHeader } from "@presentation/components/BrandHeader";
import { GlassInput } from "@presentation/components/GlassInput";
import { SupabaseAuthGateway } from "@infrastructure/supabase/adapters/SupabaseAuthGateway";

type Status = "checking" | "ready" | "invalid" | "submitting" | "done" | "error";

const MIN_PASSWORD = 6; // minimum imposé par Supabase Auth

/**
 * Écran de définition d'un nouveau mot de passe, atteint via le lien de
 * réinitialisation (route /reset). N'existe pas dans le prototype : ajouté
 * car requis par le flux de reset réel — à valider par le Co-founder.
 */
export function ResetPasswordScreen({ onDone }: { onDone: () => void }) {
  const auth = useMemo(() => new SupabaseAuthGateway(), []);
  const [status, setStatus] = useState<Status>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string>();

  useEffect(() => {
    // Le lien de récupération ouvre une session temporaire (detectSessionInUrl).
    auth
      .hasSession()
      .then((ok) => setStatus(ok ? "ready" : "invalid"))
      .catch(() => setStatus("invalid"));
  }, [auth]);

  const submit = async () => {
    setError(undefined);
    if (password.length < MIN_PASSWORD) {
      setError(`Mot de passe trop court (${MIN_PASSWORD} caractères minimum).`);
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setStatus("submitting");
    try {
      await auth.updatePassword(password);
      setStatus("done");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Mise à jour impossible.");
    }
  };

  if (status === "checking") {
    return (
      <AuthShell>
        <BrandHeader />
        <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-label)", textAlign: "center", margin: 0 }}>
          Vérification du lien…
        </p>
      </AuthShell>
    );
  }

  if (status === "invalid") {
    return (
      <AuthShell>
        <BrandHeader />
        <h1 style={{ color: "#fff", fontSize: "20px", fontWeight: "var(--weight-medium)", margin: "0 0 4px" }}>
          Lien expiré
        </h1>
        <p style={{ color: "var(--color-at-prefix)", fontSize: "var(--text-label)", margin: "0 0 20px" }}>
          Ce lien de réinitialisation n'est plus valide. Demandes-en un nouveau.
        </p>
        <button type="button" onClick={onDone} style={primaryButton}>
          RETOUR À LA CONNEXION
        </button>
      </AuthShell>
    );
  }

  if (status === "done") {
    return (
      <AuthShell>
        <BrandHeader />
        <h1 style={{ color: "#fff", fontSize: "20px", fontWeight: "var(--weight-medium)", margin: "0 0 4px" }}>
          Mot de passe mis à jour
        </h1>
        <p style={{ color: "var(--color-success)", fontSize: "var(--text-label)", margin: "0 0 20px" }}>
          Tu peux maintenant te connecter avec ton nouveau mot de passe.
        </p>
        <button type="button" onClick={onDone} style={primaryButton}>
          SE CONNECTER
        </button>
      </AuthShell>
    );
  }

  const submitting = status === "submitting";

  return (
    <AuthShell>
      <BrandHeader />

      <h1 style={{ color: "#fff", fontSize: "20px", fontWeight: "var(--weight-medium)", margin: "0 0 4px" }}>
        Nouveau mot de passe
      </h1>
      <p style={{ color: "var(--color-at-prefix)", fontSize: "var(--text-label)", margin: "0 0 20px" }}>
        Choisis un mot de passe d'au moins {MIN_PASSWORD} caractères.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <GlassInput
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nouveau mot de passe"
          autoComplete="new-password"
        />
        <GlassInput
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirme le mot de passe"
          autoComplete="new-password"
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={submitting}
        style={{ ...primaryButton, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.6 : 1 }}
      >
        {submitting ? "Mise à jour…" : "Valider"}
      </button>

      {error && (
        <p style={{ color: "var(--color-error)", fontSize: "var(--text-label)", margin: "12px 0 0", textAlign: "center" }}>
          {error}
        </p>
      )}
    </AuthShell>
  );
}

const primaryButton = {
  width: "100%",
  minHeight: "52px",
  marginTop: "16px",
  fontWeight: "var(--weight-medium)",
  fontSize: "var(--text-body)",
  borderRadius: "12px",
  background: "var(--color-accent)",
  color: "var(--color-on-accent)",
  border: "none",
  cursor: "pointer",
  boxSizing: "border-box",
} as const;
