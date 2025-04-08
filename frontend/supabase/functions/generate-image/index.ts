import { HfInference } from "@huggingface/inference";
import { createClient } from "@supabase/supabase-js";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

Deno.serve(async (req: Request) => {

  // Get request body data
  const { image_id, prompt } = await req.json();

  // Setup supabase client
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    },
  );

  // Get user session
  const getUserRes = await supabase.auth.getUser();

  // Handle any auth errors
  if (getUserRes.error) {
    return new Response(
      JSON.stringify(getUserRes.error),
      {
        status: getUserRes.error?.status,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  // Get user id from session
  const user_id = getUserRes.data.user.id;

  // Check rate limits if user is allowed to generate an image
  const limit: number = 2; // 2 requests
  const rate: string = "24h"; // per 24 hours

  const redis = new Redis({
    url: Deno.env.get("UPSTASH_REDIS_REST_URL")!,
    token: Deno.env.get("UPSTASH_REDIS_REST_TOKEN")!,
  })

  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, rate),
    analytics: true,
    prefix: "@upstash/ratelimit",
  });

  const identifier = user_id;
  const { success } = await ratelimit.limit(identifier);

  if (!success) {
    const { reset } = await ratelimit.getRemaining(identifier);

    return new Response(JSON.stringify({
        status: 429,
        message: `Image generation limit exceeded. You only have ${limit} requests per day`,
        reset
      }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
  }

  // The code below runs only if user passes rate limit check
  const image = await generateImage(prompt);

  // save image to storage with highlight id as name
  const uploadToStorageRes = await supabase.storage
    .from("images")
    .upload(`${image_id}.jpg`, image, {
      contentType: "image/jpeg",
      cacheControl: "3600",
      upsert: true,
    });

  // Handle any storage errors
  if (uploadToStorageRes.error) {
    return new Response(
      JSON.stringify(uploadToStorageRes.error),
      {
        status: 500, // server error
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  // Get image public url
  const imgPath = uploadToStorageRes.data.path;
  const { data: { publicUrl }} = supabase.storage.from("images").getPublicUrl(imgPath);

  return Response.json({
    img_url: publicUrl
  });

});

// This function can be changed as needed
// (e.g. if we need to switch AI models or providers)
async function generateImage(prompt: string): Promise<Blob> {
  const hf = new HfInference(Deno.env.get("HUGGING_FACE_ACCESS_TOKEN"));

  const image = await hf.textToImage(
    {
      inputs: prompt,
      model: "stabilityai/stable-diffusion-3.5-large-turbo",
    },
    {
      use_cache: false,
    },
  );

  return image;
}
