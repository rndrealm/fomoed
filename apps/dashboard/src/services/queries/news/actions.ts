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
    .eq("metadata->>region", "en") // filter for region 'en'
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

  const { data: newsItem, error } = await supabase.from("news").select("*").eq("id", id).single();

  if (error) {
    console.log("Error fetching newslab posts:", error);
    throw new Error(error.message);
  }

  return newsItem;
}

export async function fetchNewsFeed(token?: string, page: number = 1, limit: number = 20) {
  const supabase = createSupabaseBrowserClient();
  // const twoDaysAgo = new Date(new Date().valueOf() - 2 * 24 * 60 * 60 * 1000);

  const { from, to } = getPaginationMeta(page, limit);

  let query = supabase
    .from("news")
    .select("id, published_at, image_url, source, title, summary, symbols", { count: "exact" })
    // .gte("published_at", twoDaysAgo.toISOString())
    .order("published_at", { ascending: false })
    .eq("metadata->>region", "en")
    .range(from, to)
    .not("original_url", "ilike", "%youtube%")
    .not("source", "eq", "BeInCrypto");

  // If token is provided, filter by symbols array
  if (token) {
    query = query.contains("symbols", [token]);
  }

  const { data: newsItem, error } = await query;

  if (error) {
    console.log("Error fetching news feed:", error);
    throw new Error(error.message);
  }

  return newsItem;
}

export async function fetchInfiniteNewsFeed(page: number = 1, limit: number = 20, token?: string) {
  const supabase = createSupabaseBrowserClient();
  const twoDaysAgo = new Date(new Date().valueOf() - 2 * 24 * 60 * 60 * 1000);

  const { from, to } = getPaginationMeta(page, limit);

  let query = supabase
    .from("news")
    .select("id, published_at, image_url, source, title, summary, symbols", { count: "exact" })
    .gte("published_at", twoDaysAgo.toISOString())
    .order("published_at", { ascending: false })
    .eq("metadata->>region", "en")
    .range(from, to)
    .not("original_url", "ilike", "%youtube%")
    .not("source", "eq", "BeInCrypto");

  if (token) {
    query = query.contains("symbols", [token]);
  }

  const { data: feedData, error } = await query;

  if (error) {
    console.log("Error fetching news feed:", error);
    throw new Error(error.message);
  }

  return feedData;
}

export async function fetchSingleNewsArticle(id: string) {
  const supabase = createSupabaseBrowserClient();

  const { data: article, error } = await supabase.from("news").select("*").eq("id", id).single();

  if (error) {
    console.log("Error fetching single news article:", error);
    throw new Error(error.message);
  }

  return article;
}
