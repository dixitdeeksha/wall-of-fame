import { NextResponse } from "next/server";
import {
  isSupabaseConfigured,
  SUPABASE_SETUP_MESSAGE,
} from "@/lib/supabase/config";

export function supabaseNotConfiguredResponse() {
  return NextResponse.json(
    {
      error: "not_configured" as const,
      message: SUPABASE_SETUP_MESSAGE,
    },
    { status: 503 }
  );
}

export function requireSupabase() {
  if (!isSupabaseConfigured()) {
    return supabaseNotConfiguredResponse();
  }
  return null;
}
