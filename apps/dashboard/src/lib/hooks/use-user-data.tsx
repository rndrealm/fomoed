"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/utils/supabase/browser-client";
import type { Database } from "@/lib/database/supabase";
import { useSupabaseAuth } from "@/components/providers";

export default function useUserData() {
  const { session } = useSupabaseAuth();
  const [userData, setUserData] = useState<Database["public"]["Tables"]["users"]["Row"] | null>(null);

  useEffect(() => {
    if (!session?.user?.id) {
      setUserData(null);
      return;
    }

    const supabase = createSupabaseBrowserClient();

    console.log("Fetching user data for ID:", session.user.id);

    supabase
      .from("users")
      .select("*")
      .eq("user_id", session.user.id)
      .single()
      .then(({ data }) => {
        setUserData(data ?? null);
      });
  }, [session?.user?.id]);

  return userData;
}
