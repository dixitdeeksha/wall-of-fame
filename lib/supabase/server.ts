import { createAdminClient } from "@/lib/supabase/admin";
import type { WallSignature } from "@/lib/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function fetchSignatures(): Promise<WallSignature[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("bnb_get_signatures");

  if (error) {
    console.error("Failed to fetch signatures:", error);
    return [];
  }
  return (data as WallSignature[]) ?? [];
}
