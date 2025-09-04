import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/utils/supabase/server-client";
import { AppRoutes } from "@/lib/routes";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";
  // Takes precedence
  const redirectUrl = searchParams.get("redirectUrl");

  if (token_hash && type) {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      // redirect user to specified redirect URL or root of app
      redirect(redirectUrl || next);
    }
    console.log(error);
    redirect(`${AppRoutes.auth.authError.path}?code=400&message=${error.message}.`);
  }

  // redirect the user to an error page with some instructions
  redirect(`${AppRoutes.auth.authError.path}?code=400&message=Invalid token or type provided.`);
}
