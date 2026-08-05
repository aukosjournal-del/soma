import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ErrorBoundary } from "@presentation/components/ErrorBoundary";
import "@presentation/design-system/globals.css";

// Repère de diagnostic : dit quelle version est réellement servie.
console.info(`[SOMA] build ${__BUILD_STAMP__}`);

const container = document.getElementById("root");
if (!container) throw new Error("Élément #root introuvable dans index.html");

createRoot(container).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
