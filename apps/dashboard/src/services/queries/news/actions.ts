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

export async function fetchNewslabPosts() {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("news")
    .select("*")
    .match({ source: "NewsLab" })
    .order("published_at", { ascending: false });

  if (error) {
    console.log("Error fetching newslab posts:", error);
    throw new Error(error.message);
  }

  return data;
}
export async function fetchSingleNewslabPosts(id: string) {
  const supabase = createSupabaseBrowserClient();

  const { data: newsItem, error } = await supabase
    .from("news")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.log("Error fetching newslab posts:", error);
    throw new Error(error.message);
  }

  return newsItem;
}
