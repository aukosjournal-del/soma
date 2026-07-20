/**
 * Deux halos radiaux flous fixes en arrière-plan — repris à l'identique du
 * prototype (SOMA.dc.html, lignes 25-28). Valeurs figées, NE PAS réinterpréter.
 */
export function RadialHalos() {
  return (
    <div
      aria-hidden
      style={{
        pointerEvents: "none",
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        zIndex: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-160px",
          left: "-128px",
          height: "320px",
          width: "320px",
          borderRadius: "50%",
          opacity: 0.3,
          filter: "blur(64px)",
          background: "radial-gradient(circle, #F59E71 0%, transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "33%",
          right: "-128px",
          height: "384px",
          width: "384px",
          borderRadius: "50%",
          opacity: 0.2,
          filter: "blur(64px)",
          background: "radial-gradient(circle, #C0EBFF 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
