import { useEffect, useRef, useState } from "react";

const SHOW_HIDE_THRESHOLD_PX = 12; // tolérance avant de déclencher un masquage/affichage
const NEAR_EDGE_SLACK_PX = 24; // marge tolérée pour considérer "en haut" / "en bas"
const FLICK_VELOCITY_PX_PER_MS = 1.2; // vitesse au-delà de laquelle un balayage vers le haut réaffiche instantanément

/**
 * Affiche/masque un élément flottant (ex. la nav basse) selon le sens du
 * défilement — comportement standard des barres de navigation mobiles.
 *
 *  - un petit défilement ne déclenche rien (tolérance `SHOW_HIDE_THRESHOLD_PX`) ;
 *  - défiler vers le bas au-delà du seuil masque l'élément ;
 *  - défiler vers le haut le réaffiche, instantanément si le geste est rapide ;
 *  - toujours visible en haut de page et à l'approche du bas (jamais de
 *    navigation bloquée en fin de contenu).
 *
 * Écoute le défilement du document : les écrans applicatifs n'ont pas de
 * conteneur scrollable propre, c'est la fenêtre qui défile.
 */
export function useHideOnScroll(): boolean {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const lastT = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    lastY.current = window.scrollY;
    lastT.current = performance.now();

    const evaluate = () => {
      ticking.current = false;
      const y = window.scrollY;
      const doc = document.documentElement;
      const maxScroll = Math.max(0, doc.scrollHeight - doc.clientHeight);
      const now = performance.now();

      const atTop = y <= 0;
      const atBottom = maxScroll - y <= NEAR_EDGE_SLACK_PX;
      if (atTop || atBottom) {
        setHidden(false);
        lastY.current = y;
        lastT.current = now;
        return;
      }

      const deltaY = y - lastY.current;
      const deltaT = Math.max(now - lastT.current, 1);
      const velocity = deltaY / deltaT; // px/ms — positif vers le bas

      if (deltaY > SHOW_HIDE_THRESHOLD_PX) {
        setHidden(true);
      } else if (deltaY < -SHOW_HIDE_THRESHOLD_PX || velocity < -FLICK_VELOCITY_PX_PER_MS) {
        setHidden(false);
      }

      lastY.current = y;
      lastT.current = now;
    };

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(evaluate);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return hidden;
}
