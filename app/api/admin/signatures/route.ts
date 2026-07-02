import { NextResponse } from "next/server";
import { requireSupabase } from "@/lib/api-guard";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { deleteSignature, fetchSignaturesList } from "@/lib/admin-data";

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const configError = requireSupabase();
  if (configError) return configError;
  return null;
}

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const signatures = await fetchSignaturesList();
    return NextResponse.json({ signatures });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error:
          "Database not set up. Run supabase/SETUP.sql in Supabase SQL Editor.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
  }

  try {
    const deleted = await deleteSignature(id);
    if (!deleted) {
      return NextResponse.json({ error: "Signature not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete signature" },
      { status: 500 }
    );
  }
}
