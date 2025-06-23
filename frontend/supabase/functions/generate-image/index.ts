// supabase/functions/generate-image/index.ts
import { SupabaseClient } from "../_shared/supabaseClient.ts";
import { getUserFromRequest } from "./lib/auth.ts";
import { generateImage } from "./lib/imageGenerator.ts";
import { improvePrompt } from "./lib/promptEngineer.ts";
import { uploadImage } from "./lib/uploader.ts";

Deno.serve(async (req: Request) => {
  // This is needed for invoking from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("📩 Received request");

    const { image_id, passage, book_title, book_author, chapter } =
      await req.json();
    console.log("📝 Request body parsed:", {
      image_id,
      passage,
      book_title,
      book_author,
      chapter,
    });

    const supabase = SupabaseClient(req);
    console.log("🔑 Supabase client initialized");

    const user_id = await getUserFromRequest(supabase);
    console.log("👤 Authenticated user ID:", user_id);

    const improvedPrompt = await improvePrompt(
      book_title,
      book_author,
      passage,
      chapter
    );
    console.log("✨ Improved prompt:", improvedPrompt);

    const image = await generateImage(improvedPrompt);
    console.log("🖼️ Image generated");

    const publicUrl = await uploadImage(supabase, image_id, image);
    console.log("📤 Image uploaded:", publicUrl);

    return Response.json({ img_url: publicUrl });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("💥 Error:", message);
    return new Response(JSON.stringify({ status: 500, message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
