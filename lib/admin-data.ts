import { createAdminClient } from "@/lib/supabase/admin";
import type { RegisteredUser, WallSignature } from "@/lib/types";

export async function fetchRegisteredUsersList(): Promise<RegisteredUser[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("bnb_get_registered_users");

  if (error) {
    console.error("fetchRegisteredUsersList:", error);
    throw error;
  }

  return (data as RegisteredUser[]) ?? [];
}

export async function fetchSignaturesList(): Promise<WallSignature[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("bnb_get_signatures");

  if (error) {
    console.error("fetchSignaturesList:", error);
    throw error;
  }

  return (data as WallSignature[]) ?? [];
}

export async function deleteRegisteredUser(id: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("bnb_delete_registered_user", {
    p_id: id,
  });

  if (error) {
    console.error("deleteRegisteredUser:", error);
    throw error;
  }

  return data === true;
}

export async function deleteSignature(id: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("bnb_delete_signature", {
    p_id: id,
  });

  if (error) {
    console.error("deleteSignature:", error);
    throw error;
  }

  return data === true;
}
