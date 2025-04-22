import { createSupabaseBrowserClient } from "@/lib/utils/supabase/browser-client";
// import { createUserRow, userWithEmailExists } from "./helpers";
import { LoginUserFunctionResponse, RegisterUserPayload } from "./types";

export async function signUpNewUser(
  body: RegisterUserPayload
): Promise<LoginUserFunctionResponse> {
  const supabase = createSupabaseBrowserClient();

  const { email, password } = body;
  const authRes = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `http://localhost:3000/auth/login`,
    },
  });

  if (
    authRes.data.user &&
    authRes.data.user.identities &&
    authRes.data.user.identities.length === 0
  ) {
    return {
      success: false,
      message: "User with this email already exists",
    };
  }

  if (authRes.error) {
    return {
      success: false,
      message: authRes.error.message || "Failed to create user account",
    };
  }

  const supabaseUserId = authRes.data.user?.id;

  if (!supabaseUserId) {
    return {
      success: false,
      message: "Failed to create user account",
    };
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
    success: true,
    message: "Successfully created user account",
    email,
  };
}

export async function loginUser(
  body: Omit<RegisterUserPayload, "username">
): Promise<LoginUserFunctionResponse> {
  const supabase = createSupabaseBrowserClient();
  try {
    const { email, password } = body;
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      email,
      success: true,
      message: "Successfully logged in",
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Something went wrong",
    };
  }
}

export async function forgotPassword(body: {
  email: string;
}): Promise<{ email: string }> {
  const supabase = createSupabaseBrowserClient();

  const { email } = body;

  // const redirectTo = `${url.protocol}//${url.host}`;
  const redirectTo = `https://localhost:3000`;

  await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  return {
    email,
  };
}
