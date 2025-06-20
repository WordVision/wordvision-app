// supabase/functions/generate-image/lib/imageGenerator.ts
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
