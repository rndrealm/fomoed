import { CookieOptionsWithName } from "@supabase/ssr";

export const supabaseCookieOpts: CookieOptionsWithName = {
  domain: process.env.NEXT_PUBLIC_SUPABASE_COOKIE_DOMAIN,
  path: "/",
  sameSite: "lax",
  secure: true,
  maxAge: 60 * 60 * 24 * 30, // 30 days
};
