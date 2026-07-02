import { createAdminClient } from "@/lib/supabase/admin";

const RATE_LIMIT_MS = 5000;

export async function checkRateLimit(ip: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("bnb_check_rate_limit", {
    p_ip: ip,
    p_limit_seconds: Math.floor(RATE_LIMIT_MS / 1000),
  });

  if (error) {
    console.error("Rate limit check failed:", error);
    return true;
  }

  return data === true;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}
