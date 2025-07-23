"use client";
import React, { useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/utils/supabase/browser-client";
import { useRouter } from "next/navigation";
import { AppRoutes } from "@/lib/routes";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const handleLogout = async () => {
      // First, perform the signOut operation
      const supabaseClient = createSupabaseBrowserClient();
      const { error } = await supabaseClient.auth.signOut();

      if (error) {
        console.log("Error signing out:", error);
        return;
      }

      // Navigate after successful logout
      router.push(AppRoutes.auth.login.path);
    };

    handleLogout();

    // eslint-disable-next-line
  }, []);

  return (
    <div>
      <p className="">Hello from logout page</p>
    </div>
  );
}
