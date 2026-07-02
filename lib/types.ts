export interface WallSignature {
  id: string;
  name: string;
  signed_at: string;
}

export interface RegisteredUser {
  id: string;
  name: string;
  email: string | null;
  created_at: string;
}

export type SignError =
  | "not_registered"
  | "already_signed"
  | "wall_full"
  | "rate_limited"
  | "invalid_name"
  | "server_error";
