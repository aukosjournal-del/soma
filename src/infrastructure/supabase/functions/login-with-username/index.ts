// SOMA · Connexion par @pseudo — DÉPLOYÉE (projet soma, v1, ACTIVE).
// verify_jwt = false : endpoint de login, l'appelant n'est pas encore
// authentifié. La fonction implémente sa propre authentification (mot de passe
// vérifié par signInWithPassword). L'email de l'utilisateur n'est JAMAIS renvoyé
// au client : il ne sert qu'en interne, côté serveur.
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

// Message unique : ne révèle jamais si le pseudo existe (anti-énumération).
const INVALID = { error: "Identifiants incorrects." };

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Méthode non autorisée." }, 405);

  let username = "";
  let password = "";
  try {
    const body = await req.json();
    username = String(body?.username ?? "").replace(/^@+/, "").trim();
    password = String(body?.password ?? "");
  } catch {
    return json({ error: "Requête invalide." }, 400);
  }

  if (username.length < 3 || password.length === 0) return json(INVALID, 400);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // 1) pseudo -> user id (citext : insensible à la casse)
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  if (profileError || !profile) return json(INVALID, 400);

  // 2) user id -> email (usage strictement interne)
  const { data: userData, error: userError } = await admin.auth.admin.getUserById(profile.id);
  const email = userData?.user?.email;
  if (userError || !email) return json(INVALID, 400);

  // 3) vérification réelle du mot de passe
  const anon = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: signIn, error: signInError } = await anon.auth.signInWithPassword({
    email,
    password,
  });
  if (signInError || !signIn.session) return json(INVALID, 400);

  // On ne renvoie que les jetons de session, jamais l'email.
  return json({
    access_token: signIn.session.access_token,
    refresh_token: signIn.session.refresh_token,
  });
});
