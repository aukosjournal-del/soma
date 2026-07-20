import type { CSSProperties, InputHTMLAttributes } from "react";

type Align = "left" | "center";

export interface GlassInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "style"> {
  align?: Align;
  /** 14px par défaut (champs standard), 13px pour les champs date compacts. */
  size?: 13 | 14;
}

/**
 * Champ de saisie "glass" — base commune reprise du prototype :
 * height 48, fond rgba(192,235,255,0.08), bordure rgba(192,235,255,0.15),
 * radius 12, texte blanc 600. `align="center"` + `size=13` = variante date.
 */
export function GlassInput({ align = "left", size = 14, ...rest }: GlassInputProps) {
  const style: CSSProperties = {
    width: "100%",
    minWidth: 0,
    height: "48px",
    background: "var(--color-bg-elevated)",
    border: "1px solid var(--color-border)",
    borderRadius: "12px",
    padding: align === "center" ? "0 10px" : "0 14px",
    color: "#fff",
    fontSize: `${size}px`,
    fontWeight: 600,
    textAlign: align,
    boxSizing: "border-box",
  };
  return <input style={style} {...rest} />;
}
