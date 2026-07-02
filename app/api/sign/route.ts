import { NextResponse } from "next/server";
import { requireSupabase } from "@/lib/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { sanitizeName, validateName } from "@/lib/normalize";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { MAX_SIGNATURES } from "@/lib/frames";

export async function POST(request: Request) {
  try {
    const configError = requireSupabase();
    if (configError) return configError;

    const ip = getClientIp(request);
    const allowed = await checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: "rate_limited" as const },
        { status: 429 }
      );
    }

    const body = await request.json();
    const rawName = typeof body?.name === "string" ? body.name : "";
    const validationError = validateName(rawName);
    if (validationError) {
      return NextResponse.json(
        { error: "invalid_name" as const, message: validationError },
        { status: 400 }
      );
    }

    const sanitized = sanitizeName(rawName);
    const supabase = createAdminClient();

    const { data: sigCount, error: countError } = await supabase.rpc(
      "bnb_count_signatures"
    );

    if (countError) {
      console.error(countError);
      return NextResponse.json(
        { error: "server_error" as const },
        { status: 500 }
      );
    }

    if ((sigCount as number) >= MAX_SIGNATURES) {
      return NextResponse.json(
        { error: "wall_full" as const },
        { status: 403 }
      );
    }

    const { data: canonicalName, error: regError } = await supabase.rpc(
      "bnb_find_registered_user",
      { p_name: sanitized }
    );

    if (regError) {
      console.error(regError);
      return NextResponse.json(
        { error: "server_error" as const },
        { status: 500 }
      );
    }

    if (!canonicalName) {
      return NextResponse.json(
        { error: "not_registered" as const },
        { status: 403 }
      );
    }

    const { data: alreadySigned, error: signedError } = await supabase.rpc(
      "bnb_is_name_signed",
      { p_name: canonicalName as string }
    );

    if (signedError) {
      console.error(signedError);
      return NextResponse.json(
        { error: "server_error" as const },
        { status: 500 }
      );
    }

    if (alreadySigned) {
      return NextResponse.json(
        { error: "already_signed" as const },
        { status: 409 }
      );
    }

    const { data: inserted, error: insertError } = await supabase.rpc(
      "bnb_insert_signature",
      { p_name: sanitized }
    );

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "already_signed" as const },
          { status: 409 }
        );
      }
      console.error(insertError);
      return NextResponse.json(
        { error: "server_error" as const },
        { status: 500 }
      );
    }

    const row = Array.isArray(inserted) ? inserted[0] : inserted;
    if (!row) {
      return NextResponse.json(
        { error: "already_signed" as const },
        { status: 409 }
      );
    }

    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "server_error" as const },
      { status: 500 }
    );
  }
}
