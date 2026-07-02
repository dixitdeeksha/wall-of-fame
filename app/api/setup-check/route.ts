import { NextResponse } from "next/server";
import { requireSupabase } from "@/lib/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const configError = requireSupabase();
  if (configError) {
    return NextResponse.json(
      { ok: false, message: "Supabase env vars not set in .env.local" },
      { status: 503 }
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("bnb_count_registered_users");

  if (error) {
    return NextResponse.json({
      ok: false,
      message:
        "Database functions missing. Open supabase/SETUP.sql, copy ALL of it into Supabase SQL Editor, and click Run.",
      detail: error.message,
      dashboard:
        "https://supabase.com/dashboard/project/zxqkloreluzimwaiyuqp/sql/new",
    });
  }

  return NextResponse.json({
    ok: true,
    registeredUsers: data,
    message: "Supabase is connected and database functions are ready.",
  });
}
