"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/utils/supabase/browser-client";

interface GoogleLoginButtonProps {
  redirectTo?: string;
  className?: string;
}

export function GoogleLoginButton({ className }: GoogleLoginButtonProps) {
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
      variant="outline"
      onClick={handleLogin}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 rounded-full animate-spin border-primary border-t-transparent" />
      ) : (
        "Continue with Google"
      )}
    </Button>
  );
}
