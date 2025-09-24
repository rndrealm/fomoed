import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { TEST_USER_PASSWORD, USER_0_ID } from "./constants";

let adminSupabase: SupabaseClient;

const FORCE_NOT_REQUIRE_LOCALHOST = process.env.FORCE_NOT_REQUIRE_LOCALHOST;

export async function initAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const secret = process.env.PRIVATE_SUPABASE_SECRET!;

  console.info("Using the following Supabase details:");
  console.info("  - URL: ", url);
  console.info("  - SECRET: ", secret.slice(0, 4) + "****" + secret.slice(-4));

  if (!url.includes("localhost") && !FORCE_NOT_REQUIRE_LOCALHOST) {
    console.warn("Supabase URL is not pointing to localhost. ");
    console.info("Aborting tests. Set FORCE_NOT_REQUIRE_LOCALHOST env var to bypass.");

    process.exit(1);
  }

  adminSupabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.PRIVATE_SUPABASE_SECRET!);
}

export function getTestUserEmail(uuid: string) {
  if (uuid === USER_0_ID) {
    return "user@test.com"
  }

  return `user1-${uuid}@test.com`;
}

export async function createUserUtil(uuid: string) {
  await adminSupabase.auth.admin.createUser({
    id: uuid,
    email: getTestUserEmail(uuid),
    password: TEST_USER_PASSWORD,
    // We want the user to be usable right away without email confirmation
    email_confirm: true,
  });
}
