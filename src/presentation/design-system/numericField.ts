import type { FocusEvent } from "react";

/**
 * Sélectionne le contenu d'un champ numérique posé à zéro, pour que la
 * première frappe le remplace au lieu de s'ajouter à côté.
 *
 * Sans ça, un champ affichant `0` oblige à effacer ce zéro avant de saisir :
 * taper « 8 » sur un champ à 0 donnait « 08 ». Un champ portant déjà une
 * vraie valeur (60 kg) est laissé intact — le curseur s'y place normalement,
 * pour ne pas risquer d'effacer une saisie utile d'une simple frappe.
 */
export function selectZeroOnFocus(event: FocusEvent<HTMLInputElement>) {
  const input = event.currentTarget;
  const value = input.value.trim();
  if (value !== "" && Number(value) !== 0) return;

  // Safari iOS replace le curseur après l'événement `focus` : sélectionner
  // dans le même tick n'a aucun effet visible sur mobile.
  window.setTimeout(() => input.select(), 0);
}
