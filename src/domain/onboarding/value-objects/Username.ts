import { type Result, ok, err } from "@domain/shared/Result";

/**
 * Règles alignées 1:1 sur le Ground Truth :
 *  - prototype : on retire les "@" en tête, minimum 3 caractères ;
 *  - base Supabase : CHECK char_length between 3 and 30 (colonne citext, donc
 *    l'unicité est insensible à la casse).
 * Aucune contrainte de caractères supplémentaire n'est ajoutée (zéro
 * interprétation par rapport au prototype).
 */
export const USERNAME_MIN = 3;
export const USERNAME_MAX = 30;

export type UsernameError = "empty" | "too_short" | "too_long";

export class Username {
  private constructor(public readonly value: string) {}

  /** Normalisation identique au prototype : trim + suppression des "@" en tête. */
  static normalize(raw: string): string {
    return raw.replace(/^@+/, "").trim();
  }

  static validate(raw: string): Result<Username, UsernameError> {
    const v = Username.normalize(raw);
    if (v.length === 0) return err("empty");
    if (v.length < USERNAME_MIN) return err("too_short");
    if (v.length > USERNAME_MAX) return err("too_long");
    return ok(new Username(v));
  }

  toString(): string {
    return this.value;
  }
}
