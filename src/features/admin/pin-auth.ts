import { requireSupabase } from "@/lib/supabase";

const PIN_LOGIN_FUNCTION = "crm-pin-login";

type PinLoginResponse = {
  token_hash?: unknown;
  type?: unknown;
};

export class PinAccessError extends Error {
  constructor(readonly reason: "invalid" | "locked" | "unavailable") {
    super(reason);
    this.name = "PinAccessError";
  }
}

export async function signInWithCrmPin(pin: string) {
  const client = requireSupabase();
  const { data, error } = await client.functions.invoke<PinLoginResponse>(PIN_LOGIN_FUNCTION, {
    body: { pin },
  });

  if (error) {
    const status = error.context instanceof Response ? error.context.status : 0;
    if (status === 401) throw new PinAccessError("invalid");
    if (status === 429) throw new PinAccessError("locked");
    throw new PinAccessError("unavailable");
  }

  if (typeof data?.token_hash !== "string" || data.type !== "magiclink") {
    throw new PinAccessError("unavailable");
  }

  const { data: authData, error: authError } = await client.auth.verifyOtp({
    token_hash: data.token_hash,
    type: "magiclink",
  });
  if (authError || !authData.session) throw new PinAccessError("unavailable");

  return authData.session;
}
