// supabase/functions/generate-image/lib/uploader.ts
import type { SupabaseClient } from "@supabase/supabase-js";

export async function uploadImage(
  supabase: SupabaseClient,
  imageId: string,
  image: Blob
): Promise<string> {
  const { error, data } = await supabase.storage
    .from("images")
    .upload(`${imageId}.jpg`, image, {
      contentType: "image/jpeg",
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    console.error("📦 Upload error:", error);
    throw new Error("Failed to upload image");
  }

  const { publicUrl } = supabase.storage
    .from("images")
    .getPublicUrl(data.path).data;

  return publicUrl;
}
