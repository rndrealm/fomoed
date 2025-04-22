"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/utils/supabase/browser-client";
import GoogleIcon from "../icons/GoogleIcon";
import { cn } from "@/lib/utils";
import { RenderIf } from "../shared";
import { Loader2 } from "lucide-react";

interface GoogleLoginButtonProps {
  redirectTo?: string;
  className?: string;
}

export function GoogleLogin({ className }: GoogleLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    const supabase = createSupabaseBrowserClient();

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
  };

  const handleLogin = async () => {
    setIsLoading(true);
    await handleSignIn();
    // No need to handle the redirect as Supabase will handle it
    // The setIsLoading(false) won't be called as the page will be redirected
  };

  return (
    <Button
      variant="ghost"
      onClick={handleLogin}
      disabled={isLoading}
      className={cn("bg-transparent hover:bg-transparent p-0", className)}
    >
      <RenderIf condition={isLoading}>
        <Loader2 className="animate-spin text-[#b1b1b1]" />
      </RenderIf>

      <RenderIf condition={!isLoading}>
        <div className="flex items-center gap-5">
          <GoogleIcon />
          <p className="font-medium text-[15px] leading-[1.35] text-[#b1b1b1]">
            Sign In with Google
          </p>
        </div>
      </RenderIf>
    </Button>
  );
}
