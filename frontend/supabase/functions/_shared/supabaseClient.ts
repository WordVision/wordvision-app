// frontend/supabase/functions/_shared/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

export function SupabaseClient(req: Request) {
  const isLocal = Deno.env.get("EXPO_PUBLIC_LOCAL_ENV") === "true";

  const supabaseUrl = isLocal
    ? Deno.env.get("EXPO_PUBLIC_LOCAL_URL")!
    : Deno.env.get("SUPABASE_URL")!;

  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: req.headers.get("Authorization")!,
      },
    },
  });
}
