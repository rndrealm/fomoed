import { Json } from "@/lib/database/supabase";

export interface NewsSource {
  source: string;
  rss: string;
  blocked?: boolean;
}

export interface RssFeedEntry {
  id: string;
  title?: string;
  link?: string;
  published?: string;
}

export interface RssFeed {
  title?: string;
  entries?: RssFeedEntry[];
}

export interface ProcessedArticle {
  id: string;
  original_url: string;
  likes_count: number;
  source: string;
  comments_count: number;
  sentiment: string;
  title: string;
  published_at?: string;
  metadata: Json;
  ai_summary: string[];
  summary: string;
  related_widgets: Array<{ slug: string; props?: { token?: string } }>;
  symbols: string[];
}

export interface ProcessedFeed {
  title?: string;
  entries: ProcessedArticle[];
}

export interface ProcessAllFeedsResult {
  feedsWithSummaries: ProcessedFeed[];
  totalArticles: number;
}
