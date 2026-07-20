import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthRoot } from "@presentation/screens/auth/AuthRoot";
import { ResetPasswordScreen } from "@presentation/screens/auth/ResetPasswordScreen";

function ResetRoute() {
  const navigate = useNavigate();
  return <ResetPasswordScreen onDone={() => navigate("/", { replace: true })} />;
}

/**
 * Sprint 1 — surface Auth & Identity complète : connexion, inscription en 3
 * étapes (compte → pseudo → profil physique → niveau + finalisation),
 * mot de passe oublié et définition d'un nouveau mot de passe (/reset).
 * Les écrans applicatifs (Home, Séance…) arrivent aux sprints suivants.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthRoot />} />
        <Route path="/reset" element={<ResetRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
