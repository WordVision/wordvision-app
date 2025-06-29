// supabase/functions/generate-image/lib/rateLimiter.ts

import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

export function createRateLimiter() {
  const redis = new Redis({
    url: Deno.env.get("UPSTASH_REDIS_REST_URL")!,
    token: Deno.env.get("UPSTASH_REDIS_REST_TOKEN")!,
  });

  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "24h"),
    analytics: true,
    prefix: "@upstash/ratelimit",
  });

  return ratelimit;
}

export async function checkRateLimit(ratelimit: Ratelimit, userId: string) {
  console.log("📊 Checking rate limit for:", userId);

  const { success } = await ratelimit.limit(userId);

  if (!success) {
    const { reset } = await ratelimit.getRemaining(userId);
    console.warn(`🚫 Rate limit exceeded. Resets at: ${reset}`);
    throw new RateLimitError(
      `Image generation limit exceeded. You only have 10 requests per day`,
      reset
    );
  }

  console.log("✅ Rate limit passed");
}

export class RateLimitError extends Error {
  reset: number;
  constructor(message: string, reset: number) {
    super(message);
    this.name = "RateLimitError";
    this.reset = reset;
  }
}
