import { useEffect, useRef, useState } from "react";

const THRESHOLD_PX = 12; // tolérance avant de déclencher un changement d'état
const NEAR_EDGE_SLACK_PX = 24; // marge tolérée pour considérer "en haut" / "en bas"
const FLICK_VELOCITY_PX_PER_MS = 1.2; // vitesse au-delà de laquelle un balayage vers le haut redéploie instantanément

/**
 * Bascule un élément flottant (ex. la nav basse) entre un état déployé et un
 * état compact selon le sens du défilement. Contrairement à un masquage,
 * l'élément reste toujours visible et cliquable — seule sa taille change.
 *
 *  - un petit défilement ne déclenche rien (tolérance `THRESHOLD_PX`) ;
 *  - défiler vers le bas au-delà du seuil passe en mode compact ;
 *  - défiler vers le haut redéploie, instantanément si le geste est rapide ;
 *  - toujours déployé en haut de page et à l'approche du bas.
 *
 * Écoute le défilement du document : les écrans applicatifs n'ont pas de
 * conteneur scrollable propre, c'est la fenêtre qui défile.
 */
export function useCompactOnScroll(): boolean {
  const [isCompact, setIsCompact] = useState(false);
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
        setIsCompact(false);
        lastY.current = y;
        lastT.current = now;
        return;
      }

      const deltaY = y - lastY.current;
      const deltaT = Math.max(now - lastT.current, 1);
      const velocity = deltaY / deltaT; // px/ms — positif vers le bas

      if (deltaY > THRESHOLD_PX) {
        setIsCompact(true);
      } else if (deltaY < -THRESHOLD_PX || velocity < -FLICK_VELOCITY_PX_PER_MS) {
        setIsCompact(false);
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

  return isCompact;
}
