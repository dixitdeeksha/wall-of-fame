import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { MAX_SIGNATURES } from "@/lib/frames";

export interface AdminStats {
  registeredUsers: number;
  wallSignatures: number;
  framesFilled: number;
  maxFrames: number;
  completionPercentage: number;
}

export async function fetchAdminStats(): Promise<AdminStats | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = createAdminClient();

  const [{ data: registeredCount }, { data: signatureCount }] =
    await Promise.all([
      supabase.rpc("bnb_count_registered_users"),
      supabase.rpc("bnb_count_signatures"),
    ]);

  const framesFilled = (signatureCount as number) ?? 0;

  return {
    registeredUsers: (registeredCount as number) ?? 0,
    wallSignatures: framesFilled,
    framesFilled,
    maxFrames: MAX_SIGNATURES,
    completionPercentage: Math.round((framesFilled / MAX_SIGNATURES) * 100),
  };
}
