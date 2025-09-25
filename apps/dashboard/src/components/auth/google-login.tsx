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
  nextUrl?: string;
  fromUrl?: string;
  referralCode?: string | null;
}

export function GoogleLogin({ className, nextUrl, fromUrl, referralCode }: GoogleLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    const supabase = createSupabaseBrowserClient();

    // Build callback URL with next parameter if provided
    const baseCallbackUrl = `${window.location.origin}/auth/callback`;
    const urlParams = new URLSearchParams();

    if (fromUrl) {
      urlParams.append('from', fromUrl);
    }
    if (nextUrl) {
      urlParams.append('next', nextUrl);
    }
    if (referralCode) {
      urlParams.append('referral', referralCode);
    }

    const callbackUrl = urlParams.toString() 
      ? `${baseCallbackUrl}?${urlParams.toString()}`
      : baseCallbackUrl;

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl,
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
      className={cn("bg-transparent p-0 hover:bg-transparent", className)}
      aria-label="Sign in with Google"
    >
      <RenderIf condition={isLoading}>
        <Loader2 className="animate-spin text-[#b1b1b1]" />
      </RenderIf>

      <RenderIf condition={!isLoading}>
        <div className="flex items-center gap-5">
          <GoogleIcon />
          <p className="text-[15px] leading-[1.35] font-medium text-[#b1b1b1]">Sign In with Google</p>
        </div>
      </RenderIf>
    </Button>
  );
}
