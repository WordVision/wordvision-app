// supabase/functions/generate-image/lib/promptEngineer.ts
import { GoogleGenAI } from "@google/genai";

export async function improvePrompt(
  bookTitle: string,
  passage: string
): Promise<string> {
  const apiKey = Deno.env.get("EXPO_PUBLIC_GEMINI_TOKEN");
  const prompt = `You are an expert AI Visual Prompt Engineer. 
Your mission is to meticulously analyze the provided literary passage and transform its narrative essence into a single, rich, and highly effective prompt suitable for generating a compelling image with an AI text-to-image model, specifically OpenAI's gpt-image medium.

Do not generate an image. Your goal is to create a prompt to be passed to an image generator.

You must read the provided literary passage carefully. Focus on understanding not just the literal descriptions but also the underlying mood, atmosphere, character emotions, any implied visual details, and within the context of the book title and author

From your analysis, identify and prioritize:

Subject(s) & Characters: 
Detailed descriptions of their appearance (physical traits, clothing, species if non-human), expressions, significant characteristics, and any crucial actions they are performing or poses they are holding.

Setting & Environment: 
The specific location (e.g., ancient forest, bustling futuristic market, desolate alien landscape, opulent throne room), time of day (e.g., dawn, twilight, midday sun, dead of night), weather conditions (e.g., misty, stormy, clear), and any defining landmarks or environmental features.

Crucial Objects & Details: 
Any specific items, artifacts, props, or intricate visual details that are essential to the scene's meaning or composition.

Mood & Emotional Tone: 
The dominant feeling or atmosphere the passage evokes (e.g., mysterious, triumphant, melancholic, terrifying, serene, wondrous, epic).

Action & Dynamics: 
If there's movement or a key event unfolding, capture its visual essence.

You must synthesize your extracted elements into a single, coherent, and highly descriptive image prompt. 

This prompt should:

Use vivid and evocative language, rich with adjectives and adverbs that inspire clear visual imagery.

Clearly feature the primary subject(s) and their interaction with the environment.

Artistic Style: 
Suggest a fitting artistic style that complements the passage's tone or genre (e.g., 'photorealistic,' 'cinematic,' 'oil painting,' 'fantasy concept art,' 'watercolor illustration,' 'cyberpunk cityscape,' 'impressionistic,' 'dark fantasy art,' 'Art Nouveau'). If the passage or genre strongly implies a style, incorporate it.

Lighting: 
Describe the lighting conditions clearly (e.g., 'dramatic volumetric lighting,' 'soft golden hour light,' 'eerie moonlight,' 'bright studio lighting,' 'chiaroscuro,' 'bioluminescent glow').

Color Palette (Optional but helpful): 
If specific colors are mentioned or implied by the mood, consider suggesting them (e.g., 'muted earthy tones,' 'vibrant neon palette,' 'monochromatic blues,' 'warm autumn colors').

Composition & Framing (Optional but helpful):
You can suggest camera angles or framing if it significantly enhances the scene (e.g., 'close-up portrait,' 'dynamic low-angle shot,' 'epic wide landscape,' 'detailed macro shot').

Key Details:
Ensure crucial details from the passage that define the scene are included.

Conciseness and Impact:
While detailed, the prompt should be structured effectively for current AI image generators, prioritizing the most impactful information.

Output Requirements:

Your final output must be ONLY the generated image prompt itself with a minimum of 100 tokens and max 300 tokens.
Do not include any explanations, conversational preambles, or any text other than the image prompt.
The prompt should be ready to be directly copied and pasted into a text-to-image AI.
I will give you the literary passage for you to analyze in this format:

${bookTitle} - ${passage}`;

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-05-20",
    contents: prompt,
  });

  const text = response.text;
  if (!text) throw new Error("Gemini returned no text");
  return text.trim();
}
