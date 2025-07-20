"use server";

import { CreateUserRowPayload } from "./types";
import { createSupabaseServerWithAnonKey } from "@/lib/utils/supabase/server-client";

export async function createUserRow(
  data: CreateUserRowPayload,
  supabase: Awaited<ReturnType<typeof createSupabaseServerWithAnonKey>>
) {
  data.email = data.email.toLowerCase();

  const insertRes = await supabase.from("users").insert([data]);

  if (insertRes.error) {
    throw new Error("Failed to create new user row. User data: " + JSON.stringify(data));
  }

  console.info("Created new user record in database. Data: ", JSON.stringify(data));
}

export async function userWithEmailExists(
  email: string,
  supabase: Awaited<ReturnType<typeof createSupabaseServerWithAnonKey>>
) {
  const maybeUserWithEmail = await supabase.from("users").select().ilike("email", email);

  if (maybeUserWithEmail.error) {
    throw new Error(maybeUserWithEmail.error.message);
  }

  if (maybeUserWithEmail.data?.length != 0) {
    return true;
  }

  return false;
}
