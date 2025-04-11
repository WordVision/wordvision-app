import { HfInference } from "@huggingface/inference";
import { createClient } from "@supabase/supabase-js";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { SupabaseClient } from "../_shared/supabaseClient.ts";

Deno.serve(async (req: Request) => {
  try {
    console.log("📩 Received request");

    const { image_id, prompt } = await req.json();
    console.log("📝 Request body parsed:", { image_id, prompt });

    const supabase = SupabaseClient(req);
    console.log("🔑 Supabase client initialized");

    const getUserRes = await supabase.auth.getUser();
    console.log("🙋‍♂️ Fetched user session:", getUserRes);

    if (getUserRes.error) {
      const status = getUserRes.error.status ?? 401;
      console.error("❌ Auth error:", getUserRes.error);
      return new Response(
        JSON.stringify({ error: getUserRes.error.message ?? "Unauthorized" }),
        {
          status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const user_id = getUserRes.data.user.id;
    console.log("👤 Authenticated user ID:", user_id);

    // const limit = 2;
    // const rate = "24h";

    // const redis = new Redis({
    //   url: Deno.env.get("UPSTASH_REDIS_REST_URL")!,
    //   token: Deno.env.get("UPSTASH_REDIS_REST_TOKEN")!,
    // });

    // const ratelimit = new Ratelimit({
    //   redis,
    //   limiter: Ratelimit.slidingWindow(limit, rate),
    //   analytics: true,
    //   prefix: "@upstash/ratelimit",
    // });

    // console.log("📊 Checking rate limit for:", user_id);
    // const { success } = await ratelimit.limit(user_id);

    // if (!success) {
    //   const { reset } = await ratelimit.getRemaining(user_id);
    //   console.warn("🚫 Rate limit exceeded. Reset at:", reset);

    //   return new Response(
    //     JSON.stringify({
    //       status: 429,
    //       message: `Image generation limit exceeded. You only have ${limit} requests per day`,
    //       reset,
    //     }),
    //     {
    //       status: 429,
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //     }
    //   );
    // }

    // console.log("✅ Rate limit passed. Generating image...");

    const image = await generateImage(prompt);
    console.log("🖼️ Image generated");

    const uploadToStorageRes = await supabase.storage
      .from("images")
      .upload(`${image_id}.jpg`, image, {
        contentType: "image/jpeg",
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadToStorageRes.error) {
      console.error("📦 Upload to storage failed:", uploadToStorageRes.error);
      return new Response(JSON.stringify(uploadToStorageRes.error), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("📤 Image uploaded to storage");

    const imgPath = uploadToStorageRes.data.path;
    const {
      data: { publicUrl },
    } = supabase.storage.from("images").getPublicUrl(imgPath);

    console.log("🌐 Public image URL generated:", publicUrl);

    return Response.json({
      img_url: publicUrl,
    });
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Unhandled error occurred";
    console.error("💥 Top-level error:", err);

    return new Response(
      JSON.stringify({
        status: 500,
        message: "Unhandled server error",
        error: errorMessage,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});

async function generateImage(prompt: string): Promise<Blob> {
  console.log("🤖 Calling Hugging Face with prompt:", prompt);
  const hf = new HfInference(Deno.env.get("HUGGING_FACE_ACCESS_TOKEN"));
  console.log("🔐 Loaded HF token:", Deno.env.get("HUGGING_FACE_ACCESS_TOKEN"));

  const image = await hf.textToImage(
    {
      inputs: prompt,
      model: "stabilityai/stable-diffusion-3.5-large-turbo",
    },
    {
      use_cache: false,
    }
  );
  console.log("🎨 Hugging Face returned image blob");
  return image;
}
