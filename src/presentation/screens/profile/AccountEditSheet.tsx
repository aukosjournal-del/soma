import { useEffect, useState } from "react";
import { BottomSheet } from "@presentation/components/BottomSheet";
import type { AccountUpdate, ProfileSummary } from "@domain/profile/ports/ProfileReadRepository";
import { SupabaseAuthGateway } from "@infrastructure/supabase/adapters/SupabaseAuthGateway";
import { Username } from "@domain/onboarding/value-objects/Username";

const field = {
  width: "100%",
  height: "48px",
  background: "var(--color-bg-elevated)",
  border: "1px solid var(--color-border)",
  borderRadius: "12px",
  padding: "0 12px",
  color: "#fff",
  fontSize: "14px",
  fontWeight: 600,
  boxSizing: "border-box",
} as const;

const eyebrow = {
  color: "var(--color-at-prefix)",
  fontSize: "11px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "var(--tracking-eyebrow)",
  margin: "16px 0 8px",
} as const;

export interface AccountEditSheetProps {
  open: boolean;
  summary: ProfileSummary | null;
  onClose: () => void;
  onSave: (update: AccountUpdate) => Promise<void>;
}

/**
 * Modifier le compte — identité et changement de mot de passe.
 * Le mot de passe passe par l'auth Supabase, jamais par la table profils.
 */
export function AccountEditSheet({ open, summary, onClose, onSave }: AccountEditSheetProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [displayNamePref, setDisplayNamePref] = useState("prenom");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();

  useEffect(() => {
    if (!open) return;
    setFirstName(summary?.firstName ?? "");
    setLastName(summary?.lastName ?? "");
    setUsername(summary?.username ?? "");
    setDisplayNamePref(summary?.displayNamePref ?? "prenom");
    void new SupabaseAuthGateway().currentEmail().then(setEmail);
    setNewPassword("");
    setConfirmPassword("");
    setError(undefined);
    setMessage(undefined);
  }, [open, summary]);

  const submit = async () => {
    setError(undefined);
    setMessage(undefined);

    const validation = Username.validate(username);
    if (!validation.ok) {
      setError("Le pseudo doit faire entre 3 et 30 caractères.");
      return;
    }
    if (newPassword && newPassword.length < 6) {
      setError("Mot de passe trop court (6 caractères minimum).");
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setSaving(true);
    try {
      await onSave({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: validation.value.value,
        displayNamePref,
      });
      if (newPassword) {
        await new SupabaseAuthGateway().updatePassword(newPassword);
        setMessage("Compte et mot de passe mis à jour.");
      }
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <BottomSheet open={open} title="Modifier le compte" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Prénom" autoComplete="given-name" style={field} />
        <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Nom" autoComplete="family-name" style={field} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
            padding: "0 12px",
            height: "48px",
          }}
        >
          <span style={{ color: "var(--color-at-prefix)", fontWeight: 700, marginRight: "2px" }}>@</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(Username.normalize(e.target.value))}
            placeholder="pseudo"
            autoCapitalize="none"
            spellCheck={false}
            aria-label="Nom d'utilisateur"
            style={{
              flex: 1,
              minWidth: 0,
              height: "100%",
              background: "transparent",
              border: "none",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 600,
              outline: "none",
            }}
          />
        </div>
        <input
          type="email"
          value={email}
          readOnly
          placeholder="Adresse email"
          aria-label="Adresse email"
          title="L'email se change depuis les paramètres de sécurité du compte."
          style={{ ...field, color: "var(--color-text-muted)", cursor: "not-allowed" }}
        />
      </div>

      <p style={eyebrow}>Nom affiché dans l'application</p>
      <div style={{ display: "flex", gap: "8px" }}>
        {[
          { id: "prenom", label: "Prénom" },
          { id: "nom", label: "Nom" },
          { id: "pseudo", label: "Pseudo" },
        ].map((option) => {
          const active = displayNamePref === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setDisplayNamePref(option.id)}
              aria-pressed={active}
              style={{
                flex: 1,
                height: "40px",
                borderRadius: "999px",
                border: `2px solid ${active ? "#7DD3FC" : "var(--color-border)"}`,
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 700,
                background: active ? "var(--color-accent)" : "rgba(192,235,255,0.05)",
                color: active ? "var(--color-on-accent)" : "var(--color-text-secondary)",
                boxSizing: "border-box",
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <p style={eyebrow}>Modifier le mot de passe</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nouveau mot de passe" autoComplete="new-password" style={field} />
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirme le mot de passe" autoComplete="new-password" style={field} />
      </div>
      <p style={{ color: "var(--color-text-faint)", fontSize: "11px", margin: "8px 0 0" }}>
        Laisse vide pour conserver ton mot de passe actuel.
      </p>

      {error && (
        <p style={{ color: "var(--color-error)", fontSize: "12px", margin: "12px 0 0", textAlign: "center" }}>{error}</p>
      )}
      {message && (
        <p style={{ color: "var(--color-success)", fontSize: "12px", margin: "12px 0 0", textAlign: "center" }}>{message}</p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={saving}
        style={{
          width: "100%",
          minHeight: "52px",
          marginTop: "20px",
          fontWeight: 800,
          fontSize: "15px",
          borderRadius: "12px",
          background: "var(--color-accent)",
          color: "var(--color-on-accent)",
          border: "none",
          cursor: saving ? "not-allowed" : "pointer",
          boxSizing: "border-box",
          opacity: saving ? 0.6 : 1,
        }}
      >
        {saving ? "ENREGISTREMENT…" : "ENREGISTRER"}
      </button>
    </BottomSheet>
  );
}
