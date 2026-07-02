import { NextResponse } from "next/server";
import { requireSupabase } from "@/lib/api-guard";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { fetchAdminStats } from "@/lib/admin-stats";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const configError = requireSupabase();
  if (configError) return configError;

  const stats = await fetchAdminStats();
  if (!stats) {
    return NextResponse.json(
      { error: "Failed to load stats" },
      { status: 500 }
    );
  }

  return NextResponse.json(stats);
}
