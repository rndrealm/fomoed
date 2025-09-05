import { AppRoutes } from "@/lib/routes";
import {
  createSupabaseServerClient,
  createSupabaseServerComponentClient,
  createSupabaseServerWithAnonKey,
} from "@/lib/utils/supabase/server-client";
import { SupabaseClient, User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { track } from "@vercel/analytics/server";

interface IUserInsert {
  email: string;
  username: string;
  user_id: string;
}

interface IUser extends IUserInsert {
  id: number;
  created_at: string; // ! These will be strings that need to be converted to date
  updated_at: string | null; // ! These will be strings that need to be converted to date
  has_valid_sub: boolean;
  has_had_free_trial: boolean;
  has_trial_active: boolean;
}

async function linkAuthIdToEmail(email: string, authId: string) {
  const supabase = await createSupabaseServerComponentClient();

  const updateRes = await supabase
    .from("users")
    .update({ user_id: authId, email: email.toLowerCase() })
    .ilike("email", email);

  if (updateRes.error) {
    throw new Error(`Failed update auth id for email ${email} to id ${authId}`);
  }
}

async function getUserByEmail(email: string) {
  const supabase = await createSupabaseServerComponentClient();

  const user = await supabase.from("users").select().ilike("email", email).limit(1).single();

  return user.data;
}

async function createOrLinkUserFromOAuth(user: User): Promise<void> {
  const supabase = await createSupabaseServerWithAnonKey();
  if (!user.email) {
    throw new Error("User does not have an email address");
  }

  const existingUser = await getUserByEmail(user.email);

  // If the user exists, link the ID from oauth to the existing user
  if (existingUser) {
    linkAuthIdToEmail(user.email, user.id);
    console.info(`Linked email ${user.email} to auth id ${user.id} when loggin in with OAuth.`);
    return;
  }

  // Otherwise insert a new user
  const newUserData: IUserInsert = {
    email: user.email.toLowerCase(),
    username: user.email?.split("@")[0],
    user_id: user.id,
  };

  const insertRes = await supabase.from("users").insert(newUserData);

  if (insertRes.error) {
    console.error(insertRes.error);
    throw new Error(insertRes.error.message);
  }
  await track("signup", {
    username: newUserData.username,
    email: newUserData.email,
  });
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");

  // if "next" is in param, use it in the redirect URL
  const next = searchParams.get("next") ?? "/";
  const from = searchParams.get("from") ?? "/";

  if (code) {
    const supabase = await createSupabaseServerClient();

    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    console.log("Exchange code for session:", { error, data });

    if (!data.user) {
      return NextResponse.redirect(
        `${origin}${AppRoutes.auth.authError.path}?code=${error?.code}&message=${error?.message}`,
      );
    }

    await createOrLinkUserFromOAuth(data.user);

    if (!error) {
      if (from === "marketing") {
        const marketingUrl = process.env.NEXT_PUBLIC_MARKETING_APP_URL;
        return NextResponse.redirect(marketingUrl || "https://marketing.fomoed.io");
      } else {
        return NextResponse.redirect(`${origin}/news`);
        // return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // TODO: Create this page
  // return the user to an error page with instructions
  return NextResponse.redirect(
    `${origin}${AppRoutes.auth.authError.path}?code=400&message=Login%20attempt%20failed.%20Please%20try%20again.`,
  );
}
