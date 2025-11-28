// Environment determination for Supabase auth
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

export const getAuthHeaders = (auth_token?: string) => ({
  ...(auth_token ? { Authorization: `Bearer ${auth_token}` } : {}),
  "x-auth-env": IS_PRODUCTION ? "production" : "development",
  "x-db-origin": SUPABASE_URL,
});
