import { CookieOptionsWithName } from "@supabase/ssr";

const dev = process.env.NODE_ENV === "development";

console.debug("Node environment:", process.env.NODE_ENV);

export const supabaseCookieOpts: CookieOptionsWithName = {
  domain: dev ? undefined : ".fomoed.io",
  path: "/",
  sameSite: "lax",
  secure: true,
  maxAge: 60 * 60 * 24 * 30, // 30 days
};
