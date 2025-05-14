import { createSupabaseBrowserClient } from "@/lib/utils/supabase/browser-client";

export async function fetchPopularNews(token: string) {
  const dayAgo = new Date(new Date().valueOf() - 24 * 60 * 60 * 1000);
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("news")
    .select("*, news_likes(id), news_bookmarks(id)")
    .gte("published_at", dayAgo.toISOString())
    .contains("symbols", [token])
    .order("published_at", { ascending: false });
  // .limit(3);

  if (error) {
    console.log("Error fetching popular news:", error);
    throw new Error(error.message);
  }

  return data;
}
