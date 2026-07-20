import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckUsernameAvailability, type UsernameCheck } from "@domain/onboarding/use-cases/CheckUsernameAvailability";
import { SupabaseUsernameAvailability } from "@infrastructure/supabase/adapters/SupabaseUsernameAvailability";
import { Username } from "@domain/onboarding/value-objects/Username";

const DEBOUNCE_MS = 500; // identique au prototype (SOMA.dc.html, setSignupUsernameDebounced)

/**
 * Vérification de disponibilité du pseudo, debounced, branchée sur le RPC réel.
 * Reproduit le comportement du prototype : "checking" immédiat, résolution
 * après 500 ms d'inactivité, annulation de la requête précédente.
 */
export function useUsernameAvailability() {
  const useCase = useMemo(() => new CheckUsernameAvailability(new SupabaseUsernameAvailability()), []);
  const [username, setUsername] = useState("");
  const [check, setCheck] = useState<UsernameCheck>({ status: "idle" });

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abort = useRef<AbortController | null>(null);

  const onChange = useCallback((raw: string) => {
    // Normalisation identique au prototype : on retire les "@" en tête à la saisie.
    const value = Username.normalize(raw);
    setUsername(value);

    if (timer.current) clearTimeout(timer.current);
    if (abort.current) abort.current.abort();

    if (value.length === 0) {
      setCheck({ status: "idle" });
      return;
    }

    setCheck({ status: "checking" });
    timer.current = setTimeout(async () => {
      const controller = new AbortController();
      abort.current = controller;
      const result = await useCase.execute(value, controller.signal);
      if (!controller.signal.aborted) setCheck(result);
    }, DEBOUNCE_MS);
  }, [useCase]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
      if (abort.current) abort.current.abort();
    };
  }, []);

  return { username, onChange, check, isAvailable: check.status === "available" };
}
