import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch all news articles with their slugs or IDs
  const { data: newsArticles } = await supabase
    .from("news")
    .select("id, slug, published_at, updated_at")
    .eq("metadata->>region", "en")
    .not("original_url", "ilike", "%youtube%")
    .not("source", "eq", "BeInCrypto")
    .order("published_at", { ascending: false });

  const newsUrls: MetadataRoute.Sitemap = (newsArticles || []).map((article) => ({
    url: `https://dashboard.fomoed.io/news/${article.slug || article.id}`,
    lastModified: article.updated_at || article.published_at,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  // Add static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: "https://dashboard.fomoed.io",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: "https://dashboard.fomoed.io/news",
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: "https://dashboard.fomoed.io/pricing",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  return [...staticPages, ...newsUrls];
}
