"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/utils/supabase/browser-client";
import type { Database } from "@/lib/database/supabase";
import { useSupabaseAuth } from "@/components/providers";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

// export default function useUserData() {
//   const { session } = useSupabaseAuth();
//   const [userData, setUserData] = useState<Database["public"]["Tables"]["users"]["Row"] | null>(null);

//   useEffect(() => {
//     if (!session?.user?.id) {
//       setUserData(null);
//       return;
//     }

//     const supabase = createSupabaseBrowserClient();

//     console.log("Fetching user data for ID:", session.user.id);

//     supabase
//       .from("users")
//       .select("*")
//       .eq("user_id", session.user.id)
//       .single()
//       .then(({ data }) => {
//         setUserData(data ?? null);
//       });
//   }, [session?.user?.id]);

//   return userData;
// }

export default function useUserData(): UseQueryResult<Database["public"]["Tables"]["users"]["Row"] | null, Error> {
  const { session } = useSupabaseAuth();
  console.log("session:", session);
  return useQuery({
    queryKey: ["userData", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        return null;
      }

      const supabase = createSupabaseBrowserClient();

      const { data } = await supabase.from("users").select("*").eq("user_id", session.user.id).single();
      console.log("uss:", data);
      return data ?? null;
    },
    enabled: !!session?.user?.id,
    staleTime: Infinity,
    refetchInterval: Infinity,
  });
}
