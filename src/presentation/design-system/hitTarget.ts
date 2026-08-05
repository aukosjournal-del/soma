/**
 * Étend la zone tapable d'une commande sans changer son encombrement visuel.
 *
 * Les pastilles d'icône denses (⭐ favori, ✕ retirer, case à cocher) sont
 * dessinées à 22–24 px pour ne pas écraser la ligne qui les porte, mais une
 * cible de 24 px est sous le plancher tactile iOS/Android et se rate au doigt.
 *
 * Le bouton est donc porté à `targetPx` puis ramené à son encombrement
 * d'origine par des marges négatives : la mise en page ne bouge pas, seule la
 * surface qui répond au doigt grandit. Le fond peint passe dans un `<span>`
 * interne — sinon la pastille grossirait avec le bouton.
 *
 * @param visualPx Taille de la pastille dessinée.
 * @param targetPx Cible tactile souhaitée (44 px par défaut, plancher iOS).
 */
export function hitTarget(visualPx: number, targetPx = 44) {
  const inset = (targetPx - visualPx) / 2;
  return {
    height: `${targetPx}px`,
    width: `${targetPx}px`,
    margin: `-${inset}px`,
    padding: 0,
    border: "none",
    background: "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  } as const;
}

/** Pastille peinte interne, dimensionnée indépendamment de la cible tactile. */
export function hitTargetVisual(visualPx: number, radiusPx: number) {
  return {
    height: `${visualPx}px`,
    width: `${visualPx}px`,
    borderRadius: `${radiusPx}px`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  } as const;
}
