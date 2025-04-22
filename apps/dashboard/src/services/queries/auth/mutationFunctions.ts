import { createSupabaseBrowserClient } from "@/lib/utils/supabase/browser-client";
// import { createUserRow, userWithEmailExists } from "./helpers";
import { RegisterUserPayload, SignUpResponse } from "./types";

export async function signUpNewUser(
  body: RegisterUserPayload
): Promise<SignUpResponse> {
  const supabase = createSupabaseBrowserClient();

  const { email, password } = body;
  const authRes = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (
    authRes.data.user &&
    authRes.data.user.identities &&
    authRes.data.user.identities.length === 0
  ) {
    throw new Error("User with this email already exists");
  }

  if (authRes.error) {
    console.error("Failed to create a new supabase user!", authRes.error);
    throw new Error(authRes.error.message);
  }

  const supabaseUserId = authRes.data.user?.id;

  if (!supabaseUserId) {
    console.error("Did not receive new auth user ID from supabase!");
    throw new Error("Failed to create user account");
  }

  //   const isUserExists = await userWithEmailExists(email);
  //   console.log("olad:", isUserExists);
  //   if (isUserExists) {
  //     console.info(`Linking supabase id ${supabaseUserId} to email ${email}`);

  //     const updateRes = await supabase
  //       .from("users")
  //       .update({
  //         user_id: supabaseUserId,
  //         username,
  //       })
  //       .ilike("email", email.toLowerCase());

  //     if (updateRes.error) {
  //       console.error("Failed to link new supabase user to existing user!");
  //       throw new Error("Failed to link account");
  //     }

  //     console.info("Linked new auth login to existing user. Email: ", email);
  //   } else {
  //     await createUserRow({
  //       email,
  //       username,
  //       user_id: supabaseUserId,
  //     });
  //   }

  return {
    userId: supabaseUserId,
    email,
  };
}

export async function loginUser(
  body: Omit<RegisterUserPayload, "username">
): Promise<{ email: string }> {
  const supabase = createSupabaseBrowserClient();

  const { email, password } = body;
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Login Error: ", error);

    throw new Error(error.message);
  }

  return {
    email,
  };
}

export async function forgotPassword(body: {
  email: string;
}): Promise<{ email: string }> {
  const supabase = createSupabaseBrowserClient();

  const { email } = body;

  // const redirectTo = `${url.protocol}//${url.host}`;
  const redirectTo = `https://localhost:3000`;

  console.log("Redirecting to: ", redirectTo);

  await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  return {
    email,
  };
}
