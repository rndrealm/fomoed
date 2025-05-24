import { createSupabaseBrowserClient } from "@/lib/utils/supabase/browser-client";
import { getPaginationMeta } from "../utils";

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

export async function fetchNewslabPosts(page: number = 1, limit: number = 20) {
  const supabase = createSupabaseBrowserClient();

  const { from, to } = getPaginationMeta(page, limit);
  console.log("from", from, "to", to);
  console.log("page", page, "limit", limit);

  const { data, error, count } = await supabase
    .from("news")
    .select("*", { count: "exact" })
    .match({ source: "NewsLab" })
    .range(from, to)
    .order("published_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return { data, count };
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
