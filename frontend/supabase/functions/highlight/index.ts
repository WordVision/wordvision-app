import { HfInference } from "@huggingface/inference";
import { createClient } from "@supabase/supabase-js";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

Deno.serve(async (req: Request) => {

  // Get request body data
  const { book_id, text, location, visualize } = await req.json();

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

  // If the user wants to visualize, check if they are within their allowed quota
  // Note: We make this check first so that in case they exceeded their limit, the given highlight also doesn't get saved.
  if (visualize) {
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
      return new Response(JSON.stringify({
          error: `Image generation limit exceeded. You only have ${limit} requests per day`
        }), {
          status: 429,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
    }
  }

  // ========
  // If the user DOES NOT want to "visualize" or they are WITHIN their image generation quota, 
  // the following code will run.
  // ========

  // Save highlight to database
  const saveHighlightRes = await supabase
    .from("highlights")
    .insert({ user_id, book_id, text, location });

  // Handle any database errors
  if (saveHighlightRes.error) {
    return new Response(
      JSON.stringify(saveHighlightRes.error),
      {
        status: saveHighlightRes.status,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  // Get newly created highlight id
  const selHighIdRes = await supabase
    .from("highlights")
    .select("id")
    .eq("location", location)
    .is("img_url", null)
    .limit(1)
    .single();

  // Handle any database errors
  if (selHighIdRes.error) {
    return new Response(
      JSON.stringify(selHighIdRes.error),
      {
        status: selHighIdRes.status,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  // if user wants to visualize
  if (visualize) {

    // Generate image
    const image = await generateImage(text);

    // save image to storage with highlight id as name
    const uploadToStorageRes = await supabase.storage
      .from("images")
      .upload(`${selHighIdRes.data.id}.jpg`, image, {
        contentType: "image/jpeg",
        cacheControl: "3600",
        upsert: false,
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
    const imgUrlRes = supabase.storage.from("images").getPublicUrl(
      uploadToStorageRes.data.path!,
    );

    // Update highlight with imgurl
    const updateHighlightRes = await supabase
      .from("highlights")
      .update({ img_url: imgUrlRes.data.publicUrl })
      .eq("id", selHighIdRes.data.id);

    // Handle any database errors
    if (updateHighlightRes.error) {
      return new Response(
        JSON.stringify(updateHighlightRes.error),
        {
          status: updateHighlightRes.status,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Return newly created highlight metadata as success
    return Response.json({
      id: selHighIdRes.data.id,
      user_id: user_id,
      book_id: book_id,
      text: text,
      location: location,
      imgUrl: imgUrlRes.data.publicUrl,
    });
  }

  // Return newly created highlight metadata as success
  return Response.json({
    id: selHighIdRes.data.id,
    user_id: user_id,
    book_id: book_id,
    text: text,
    location: location,
    imgUrl: null,
  });
});

// This function can be changed as needed
// (e.g. if we need to switch AI models or providers)
async function generateImage(prompt: string) {
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
