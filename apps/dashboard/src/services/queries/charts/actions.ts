import { createSupabaseBrowserClient } from "@/lib/utils/supabase/browser-client";

export async function fetchFearAndGreed(token: string) {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("cfgi_data")
    .select("*")
    .match({ token });

  if (error) {
    throw new Error(error.message);
  }
  return data;
}
