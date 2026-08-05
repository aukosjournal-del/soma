import type { CSSProperties, InputHTMLAttributes } from "react";

type Align = "left" | "center";

export interface GlassInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "style"> {
  align?: Align;
  /** 14px par défaut (champs standard), 13px pour les champs date compacts. */
  size?: 13 | 14;
}

/**
 * Champ de saisie "glass". La bordure est retirée : le champ se détache déjà
 * par son fond, et l'empilement bordure-de-carte + bordure-de-champ créait le
 * bruit visuel que la refonte cherche à supprimer.
 */
export function GlassInput({ align = "left", size = 14, ...rest }: GlassInputProps) {
  const style: CSSProperties = {
    width: "100%",
    minWidth: 0,
    height: "var(--hit-target)",
    background: "var(--color-bg-elevated)",
    border: "none",
    borderRadius: "12px",
    padding: align === "center" ? "0 10px" : "0 14px",
    color: "#fff",
    fontSize: `${size}px`,
    fontWeight: "var(--weight-medium)" as CSSProperties["fontWeight"],
    textAlign: align,
    boxSizing: "border-box",
  };
  return <input style={style} {...rest} />;
}
