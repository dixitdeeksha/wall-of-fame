export function normalizeName(str: string): string {
  return str.trim().toLowerCase().replace(/\s+/g, " ");
}

export function sanitizeName(raw: string): string {
  return raw.replace(/[<>]/g, "").trim();
}

export function validateName(name: string): string | null {
  const sanitized = sanitizeName(name);
  if (!sanitized) return "Name cannot be empty.";
  if (sanitized.length > 50) return "Name must be 50 characters or fewer.";
  return null;
}
