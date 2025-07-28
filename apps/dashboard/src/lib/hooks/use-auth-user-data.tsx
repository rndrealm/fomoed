"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/utils/supabase/browser-client";
import { User } from "@supabase/supabase-js";

export default function useAuthUserData() {
  const [userData, setUserData] = useState<User | null>(null);

  const getUser = async () => {
    const supabase = createSupabaseBrowserClient();

    const { data } = await supabase.auth.getUser();
    if (data) {
      setUserData(data.user);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  return userData;
}
