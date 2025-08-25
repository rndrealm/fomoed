import { CookieOptionsWithName } from "@supabase/ssr";

export const supabaseCookieOpts: CookieOptionsWithName = {
  domain: undefined,
  path: "/",
  sameSite: "lax",
  secure: true,
  maxAge: 60 * 60 * 24 * 30, // 30 days
};
