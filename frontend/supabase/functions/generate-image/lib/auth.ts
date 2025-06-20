// supabase/functions/generate-image/lib/auth.ts
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getUserFromRequest(
  supabase: SupabaseClient
): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user?.id) {
    console.error("❌ Auth error:", error);
    throw new Error("Unauthorized");
  }
  return data.user.id;
}
