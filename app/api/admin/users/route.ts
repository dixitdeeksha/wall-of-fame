import { NextResponse } from "next/server";
import { requireSupabase } from "@/lib/api-guard";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  deleteRegisteredUser,
  fetchRegisteredUsersList,
} from "@/lib/admin-data";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeName, sanitizeName } from "@/lib/normalize";

function parseNames(body: {
  name?: string;
  names?: string;
}): string[] {
  const result: string[] = [];
  if (typeof body.name === "string" && body.name.trim()) {
    result.push(sanitizeName(body.name));
  }
  if (typeof body.names === "string" && body.names.trim()) {
    const bulk = body.names
      .split(/[\n,]/)
      .map((s) => sanitizeName(s))
      .filter(Boolean);
    result.push(...bulk);
  }
  return result;
}

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
    const users = await fetchRegisteredUsersList();
    return NextResponse.json({ users });
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
    const deleted = await deleteRegisteredUser(id);
    if (!deleted) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await request.json();
  const incoming = parseNames(body);

  if (!incoming.length) {
    return NextResponse.json(
      { error: "No names provided" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const { data: existingRows, error: fetchError } = await supabase.rpc(
    "bnb_get_registered_names"
  );

  if (fetchError) {
    console.error(fetchError);
    return NextResponse.json(
      {
        error:
          "Database not set up. Open supabase/SETUP.sql → copy all → Supabase SQL Editor → Run. Then visit /api/setup-check",
      },
      { status: 500 }
    );
  }

  const existingNormalized = new Set(
    ((existingRows as string[]) ?? []).map((name) => normalizeName(name))
  );

  const toInsert: string[] = [];
  let duplicates = 0;

  for (const name of incoming) {
    const norm = normalizeName(name);
    if (!norm) continue;
    if (existingNormalized.has(norm)) {
      duplicates++;
      continue;
    }
    existingNormalized.add(norm);
    toInsert.push(name);
  }

  if (!toInsert.length) {
    return NextResponse.json({
      added: 0,
      duplicates,
      total: existingNormalized.size,
    });
  }

  const { data: added, error: insertError } = await supabase.rpc(
    "bnb_insert_registered_users",
    { p_names: toInsert }
  );

  if (insertError) {
    console.error(insertError);
    return NextResponse.json(
      {
        error:
          "Failed to save users. Run supabase/SETUP.sql in Supabase SQL Editor, then check /api/setup-check",
      },
      { status: 500 }
    );
  }

  const { data: total } = await supabase.rpc("bnb_count_registered_users");

  return NextResponse.json({
    added: (added as number) ?? toInsert.length,
    duplicates,
    total: (total as number) ?? 0,
  });
}
