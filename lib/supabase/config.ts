function clean(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  if (
    trimmed === "your-anon-key" ||
    trimmed === "your-service-role-key" ||
    trimmed === "your-project.supabase.co"
  ) {
    return undefined;
  }
  return trimmed;
}

export function getSupabaseUrl(): string | undefined {
  return clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
}

/** Supports legacy anon JWT and newer Supabase publishable keys (sb_publishable_...) */
export function getSupabaseAnonKey(): string | undefined {
  return clean(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

/** Supports legacy service_role JWT and newer Supabase secret keys (sb_secret_...) */
export function getSupabaseServiceRoleKey(): string | undefined {
  return clean(
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
  );
}

/** Server key: prefers secret/service role, falls back to publishable/anon */
export function getSupabaseServerKey(): string | undefined {
  return getSupabaseServiceRoleKey() ?? getSupabaseAnonKey();
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

export const SUPABASE_SETUP_MESSAGE =
  "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local, then restart the dev server.";
