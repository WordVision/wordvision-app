// supabase/functions/generate-image/lib/imageGenerator.ts
import { InferenceClient } from "@huggingface/inference";

export async function generateImage(prompt: string): Promise<Blob> {
  const apiKey = Deno.env.get("EXPO_PUBLIC_OPENAI_TOKEN");

  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      prompt,
      model: "gpt-image-1",
      n: 1,
      size: "1024x1024",
      output_format: "jpeg",
      quality: "medium",
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error("❌ OpenAI error:", error);
    throw new Error("Failed to generate image");
  }

  const { data } = await res.json();
  const b64 = data?.[0]?.b64_json;
  if (!b64) throw new Error("Missing b64_json in response");

  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Blob([bytes], { type: "image/jpeg" });
}

export async function generateHFImage(prompt: string): Promise<Blob> {

  console.log("🤖 Calling Hugging Face with prompt:", prompt);
  const hf = new InferenceClient(Deno.env.get("HUGGING_FACE_ACCESS_TOKEN"));
  const image = await hf.textToImage({
    inputs: prompt,
    model: "stabilityai/stable-diffusion-3.5-large"
  });
  console.log("🎨 Hugging Face returned image blob");
  return image;

}

