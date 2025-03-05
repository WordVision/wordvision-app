// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { Client } from "npm:@gradio/client";

console.log("Hello from Functions!")

Deno.serve(async (req) => {

  // Things we need:
  // - hugging face
  // - supabase storage
  // - supabase database

  // TODO
  // - generate image using hugging face
  // - store image in storage and get url
  // - create highlight and attach imgurl to highlight
  //


  const client = await Client.connect("black-forest-labs/FLUX.1-dev");
  const result = await client.predict("/infer", { 		
      prompt: "Hello!!", 		
      seed: 0, 		
      randomize_seed: true, 		
      width: 256, 		
      height: 256, 		
      guidance_scale: 1, 		
      num_inference_steps: 1, 
  });

  console.log(result.data);


  const { name } = await req.json()
  const data = {
    message: `Hello ${name}!`,
  }

  return new Response(
    JSON.stringify(data),
    { headers: { "Content-Type": "application/json" } },
  )
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/hello-world' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
