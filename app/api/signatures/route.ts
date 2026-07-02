import { NextResponse } from "next/server";
import { fetchSignatures } from "@/lib/supabase/server";

export async function GET() {
  const signatures = await fetchSignatures();
  return NextResponse.json(signatures);
}
