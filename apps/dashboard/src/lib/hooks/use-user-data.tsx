"use client";

import { useEffect, useState } from "react";
import useSession from "./use-session";
import { createSupabaseBrowserClient } from "@/lib/utils/supabase/browser-client";
import type { UsersRow } from "@/lib/types/db.types";

export default function useUserData() {
  const session = useSession();
  const [userData, setUserData] = useState<UsersRow | null>(null);

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
