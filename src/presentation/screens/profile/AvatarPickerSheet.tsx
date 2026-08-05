import { useEffect, useState } from "react";
import { BottomSheet } from "@presentation/components/BottomSheet";

/** Emojis proposés — liste exacte du prototype. */
const AVATAR_EMOJIS = ["💪", "🔥", "⚡", "🏋️", "🐺", "🦁"];

const eyebrow = {
  color: "var(--color-at-prefix)",
  fontSize: "11px",
  fontWeight: "var(--weight-medium)",
  letterSpacing: "var(--tracking-eyebrow)",
  margin: "0 0 10px",
} as const;

export interface AvatarPickerSheetProps {
  open: boolean;
  current: string;
  onClose: () => void;
  onPick: (avatar: string) => Promise<void>;
}

/** Choisir un avatar — emoji prédéfini, emoji libre, ou logo SOMA par défaut. */
export function AvatarPickerSheet({ open, current, onClose, onPick }: AvatarPickerSheetProps) {
  const [customEmoji, setCustomEmoji] = useState("");
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!open) return;
    setCustomEmoji("");
    setError(undefined);
  }, [open]);

  const pick = async (avatar: string) => {
    setError(undefined);
    try {
      await onPick(avatar);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Mise à jour impossible.");
    }
  };

  return (
    <BottomSheet open={open} title="Choisir un avatar" onClose={onClose}>
      <p style={eyebrow}>Photo</p>
      <button
        type="button"
        disabled
        title="Import de photo à venir"
        style={{
          width: "100%",
          height: "56px",
          borderRadius: "12px",
          // Tiret conservé : convention des zones vides / à venir, seule
          // exception à la suppression des bordures 1px.
          border: "1px dashed rgba(192,235,255,0.25)",
          background: "rgba(192,235,255,0.05)",
          color: "var(--color-text-muted)",
          fontSize: "13px",
          fontWeight: "var(--weight-medium)",
          cursor: "not-allowed",
          marginBottom: "18px",
          boxSizing: "border-box",
        }}
      >
        + Importer une photo
      </button>

      <p style={eyebrow}>Emoji</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px" }}>
        {AVATAR_EMOJIS.map((emoji) => {
          const active = current === emoji;
          return (
            <button
              key={emoji}
              type="button"
              className="soma-press"
              onClick={() => void pick(emoji)}
              aria-label={`Avatar ${emoji}`}
              aria-pressed={active}
              style={{
                aspectRatio: "1",
                borderRadius: "12px",
                border: "none",
                background: active ? "var(--color-accent-soft)" : "var(--color-bg-elevated)",
                fontSize: "26px",
                lineHeight: 1,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {emoji}
            </button>
          );
        })}
      </div>

      <p style={{ ...eyebrow, marginTop: "18px" }}>Ou choisis avec le clavier emoji</p>
      <div style={{ display: "flex", gap: "8px" }}>
        <input
          type="text"
          value={customEmoji}
          onChange={(e) => setCustomEmoji(e.target.value.slice(0, 4))}
          placeholder="😀 Tape un emoji"
          aria-label="Emoji personnalisé"
          style={{
            flex: 1,
            height: "48px",
            background: "var(--color-bg-elevated)",
            borderRadius: "12px",
            padding: "0 12px",
            color: "#fff",
            fontSize: "18px",
            fontWeight: "var(--weight-medium)",
            boxSizing: "border-box",
          }}
        />
        <button
          type="button"
          className="soma-press"
          onClick={() => customEmoji.trim() && void pick(customEmoji.trim())}
          style={{
            flexShrink: 0,
            height: "48px",
            padding: "0 16px",
            borderRadius: "12px",
            border: "none",
            background: "var(--color-accent-soft)",
            color: "var(--color-accent)",
            fontWeight: "var(--weight-medium)",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          Utiliser
        </button>
      </div>

      <p style={{ ...eyebrow, marginTop: "18px" }}>Par défaut</p>
      <button
        type="button"
        className="soma-press"
        onClick={() => void pick("logo")}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "10px 12px",
          borderRadius: "12px",
          border: "none",
          background: current === "logo" ? "var(--color-accent-soft)" : "var(--color-bg-elevated)",
          cursor: "pointer",
          boxSizing: "border-box",
        }}
      >
        <span
          style={{
            height: "44px",
            width: "44px",
            borderRadius: "12px",
            overflow: "hidden",
            background: "var(--color-bg)",
            flexShrink: 0,
          }}
        >
          <img
            src="/soma-logo-orange-navy.png"
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transform: "scale(1.9)" }}
          />
        </span>
        <span style={{ color: "#fff", fontSize: "14px", fontWeight: "var(--weight-medium)" }}>Logo SOMA</span>
      </button>

      {error && (
        <p style={{ color: "var(--color-error)", fontSize: "12px", margin: "12px 0 0", textAlign: "center" }}>{error}</p>
      )}
    </BottomSheet>
  );
}
