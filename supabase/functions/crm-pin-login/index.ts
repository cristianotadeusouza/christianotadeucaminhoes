import { createClient } from "npm:@supabase/supabase-js@2.111.0";

const productionOrigin = "https://caminhoes.christianotadeu.workers.dev";
const allowedOrigins = new Set([
  productionOrigin,
  "http://localhost:8080",
  "http://127.0.0.1:8080",
]);

type PinVerification = {
  auth_user_id: string | null;
  retry_after_seconds: number;
};

function responseHeaders(origin: string | null) {
  const allowedOrigin = origin && allowedOrigins.has(origin) ? origin : productionOrigin;
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    Vary: "Origin",
  };
}

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  origin: string | null,
  retryAfterSeconds = 0,
) {
  const headers = new Headers(responseHeaders(origin));
  if (retryAfterSeconds > 0) headers.set("Retry-After", String(retryAfterSeconds));
  return new Response(JSON.stringify(body), { status, headers });
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (request) => {
  const origin = request.headers.get("origin");

  if (request.method === "OPTIONS") {
    if (origin && !allowedOrigins.has(origin)) return new Response(null, { status: 403 });
    return new Response(null, { status: 204, headers: responseHeaders(origin) });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Método não permitido." }, 405, origin);
  }

  if (origin && !allowedOrigins.has(origin)) {
    return jsonResponse({ error: "Origem não permitida." }, 403, origin);
  }

  let pin = "";
  try {
    const body = (await request.json()) as { pin?: unknown };
    pin = typeof body.pin === "string" ? body.pin : "";
  } catch {
    return jsonResponse({ error: "PIN inválido." }, 401, origin);
  }

  if (!/^[0-9]{6}$/.test(pin)) {
    return jsonResponse({ error: "PIN inválido." }, 401, origin);
  }

  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const clientAddress = forwardedFor || request.headers.get("cf-connecting-ip") || "unknown";
  const fingerprintHash = await sha256(clientAddress.slice(0, 128));
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("CRM PIN login is missing its Supabase environment.");
    return jsonResponse({ error: "Acesso temporariamente indisponível." }, 503, origin);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error: verificationError } = await admin.rpc("verify_crm_pin", {
    p_pin: pin,
    p_fingerprint_hash: fingerprintHash,
  });
  pin = "";

  if (verificationError) {
    console.error("CRM PIN verification failed", verificationError.code);
    return jsonResponse({ error: "Acesso temporariamente indisponível." }, 503, origin);
  }

  const verification = (Array.isArray(data) ? data[0] : data) as PinVerification | null;
  const retryAfter = Math.max(0, Number(verification?.retry_after_seconds) || 0);
  if (!verification?.auth_user_id) {
    const status = retryAfter > 0 ? 429 : 401;
    return jsonResponse(
      { error: "PIN inválido.", retry_after_seconds: retryAfter },
      status,
      origin,
      retryAfter,
    );
  }

  const { data: userData, error: userError } = await admin.auth.admin.getUserById(
    verification.auth_user_id,
  );
  const email = userData.user?.email;
  if (userError || !email) {
    console.error("CRM PIN target user is unavailable", userError?.code);
    return jsonResponse({ error: "Acesso temporariamente indisponível." }, 503, origin);
  }

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  const tokenHash = linkData?.properties?.hashed_token;
  if (linkError || !tokenHash) {
    console.error("CRM PIN session generation failed", linkError?.code);
    return jsonResponse({ error: "Acesso temporariamente indisponível." }, 503, origin);
  }

  return jsonResponse({ token_hash: tokenHash, type: "magiclink" }, 200, origin);
});
