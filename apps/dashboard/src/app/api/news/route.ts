import { NextRequest, NextResponse } from "next/server";
import { extract, FeedData, FeedEntry } from "@extractus/feed-extractor";
import { extract as extractArticle } from "@extractus/article-extractor";
import { newsSources } from "./data";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import crypto from "crypto";
import { NewsSource, ProcessedArticle } from "./types";
import { createSupabaseServerWithAnonKey } from "@/lib/utils/supabase/server-client";

/**
 * Generates a URL-safe base64 encoded ID from a URL string using SHA-256 hashing
 */
function generateUrlId(url: string): string {
  const hash = crypto.createHash("sha256").update(url).digest();
  return hash.toString("base64url"); // URL-safe, no +, /, or =
}

/**
 * Checks if an article was published within the last 6 hours
 */
function isArticleRecent(publishedDate: string | undefined): boolean {
  if (!publishedDate) return false;

  const articleDate = new Date(publishedDate);
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

  return articleDate >= sixHoursAgo;
}

const SummarySchema = z.object({
  summary: z.array(z.string()).min(3).max(5),
  relatedWidgets: z
    .array(
      z.object({
        slug: z.string(),
        props: z
          .object({
            token: z.string().optional(),
          })
          .optional(),
      })
    )
    .min(0)
    .max(3),
  symbols: z.array(z.string()).min(0).max(5),
});

const aiPrompt = `
You are an expert at summarizing crypto and financial news articles and identifying related widgets.
Given an article title and content, generate:
1. 3-5 key points that capture the most essential information
2. 1-3 related widgets based on the article content
3. 1-5 cryptocurrency symbols mentioned or related to the article

Available widgets:
- "new-price-history": Shows price chart for a specific token (requires token prop with symbols like BTC, ETH, SOL)
- "btc-dominance": Shows BTC dominance chart (no props needed)
- "order-book": Shows order book for a specific token (requires token prop with symbols like BTC, ETH, SOL)
- "coin-stats": Shows coin statistics (requires token prop with full names like bitcoin, ethereum, solana)
- "summary": Shows market summary (no props needed)
- "cfgi": Shows crypto fear & greed index for a token (requires token prop with symbols like BTC, ETH, SOL)
- "screener": Shows crypto screener (no props needed)
- "liquidation-heat-map": Shows liquidation heatmap for a token (requires token prop with symbols like BTC, ETH, SOL)
- "exchange-liquidation-map": Shows exchange liquidation map for a token (requires token prop with symbols like BTC, ETH, SOL)
- "liquidation-map": Shows liquidation map for a token (requires token prop with symbols like BTC, ETH, SOL)
- "simple-cfgi": Shows simplified crypto fear & greed index for a token (requires token prop with symbols like BTC, ETH, SOL)
- "detailed-cfgi": Shows detailed crypto fear & greed index for a token (requires token prop with symbols like BTC, ETH, SOL)

For most widgets, use symbols like: BTC, ETH, SOL, ADA, DOT, MATIC, AVAX, LINK, UNI, etc.
For coin-stats widget specifically, use full names like: bitcoin, ethereum, solana, cardano, polkadot, polygon, avalanche, chainlink, uniswap, etc.

For symbols array, use uppercase symbols like: BTC, ETH, SOL, ADA, DOT, MATIC, AVAX, LINK, UNI, etc.

Choose widgets that are most relevant to the article content. If the article mentions specific cryptocurrencies, include widgets with those tokens.

Return the points as an array of strings, widgets as an array of objects with slug and props fields, and symbols as an array of cryptocurrency symbols.
`;

/**
 * Generates AI-powered summary, related widgets, and cryptocurrency symbols for an article
 */
async function generateArticleSummary(
  title: string,
  content: string
): Promise<{
  summary: string[];
  relatedWidgets: Array<{ slug: string; props?: { token?: string } }>;
  symbols: string[];
}> {
  const { object } = await generateObject({
    model: openai("gpt-4o"),
    system: aiPrompt,
    prompt: `Title: ${title}\n\nContent: ${content?.substring(0, 2000) || "No content available"}`,
    schema: SummarySchema,
  });

  return {
    summary: object.summary,
    relatedWidgets: object.relatedWidgets,
    symbols: object.symbols,
  };
}

/**
 * Extracts the full text content from an article URL
 */
async function extractArticleContent(url: string): Promise<string> {
  const extractedArticle = await extractArticle(url).catch((error) => {
    // console.log(`Error extracting article content for: ${url}`, error.message);
    return null;
  });

  return extractedArticle?.content || "";
}

/**
 * Processes a single RSS feed entry into a structured article with AI analysis
 * Returns null if content cannot be extracted
 */
async function processArticleEntry(entry: FeedEntry, feedTitle: string): Promise<ProcessedArticle | null> {
  // let fullContent = "";

  // if (entry.link) {
  //   fullContent = await extractArticleContent(entry.link);
  // }

  // Skip processing if no content can be extracted
  // if (!fullContent) {
  //   return null;
  // }

  // const result = await generateArticleSummary(entry.title || "", fullContent).catch((error) => {
  //   // console.log(`Error generating summary for article: ${entry.title}`, error.message);
  //   return {
  //     summary: ["Summary generation failed"],
  //     relatedWidgets: [],
  //     symbols: [],
  //   };
  // });

  return {
    id: generateUrlId(entry.id),
    original_url: entry.link || entry.id || "",
    likes_count: 0,
    source: feedTitle.split("-")[0].trim() || "",
    comments_count: 0,
    sentiment: "neutral",
    title: entry.title || "",
    published_at: entry.published,
    metadata: {
      region: "en",
    },
    summary: entry.description || "",
    ai_summary: [""],
    related_widgets: [],
    symbols: [],
  };
}

/**
 * Processes all entries in an RSS feed, filtering for recent articles and processing them
 */
async function processFeedEntries(feed: FeedData) {
  // Filter entries to only include articles from the last 6 hours
  const recentEntries = feed.entries?.filter((entry) => isArticleRecent(entry.published)) || [];

  const entriesWithSummaries = await Promise.all(
    recentEntries.map((entry) => processArticleEntry(entry, feed.title || ""))
  );

  // Filter out null results (articles that couldn't be processed)
  const successfulEntries = entriesWithSummaries.filter((result): result is ProcessedArticle => result !== null);

  return {
    title: feed.title,
    entries: successfulEntries,
  };
}

/**
 * Extracts and parses RSS feed data from a news source
 */
async function extractRssFeed(source: NewsSource) {
  const feed = await extract(source.rss).catch((error) => {
    // console.log(`Error extracting RSS feed for ${source.source}: ${source.rss}`, error.message);
    return null;
  });

  if (!feed) {
    // console.log(`Failed to fetch RSS feed for ${source.source}: ${source.rss}`);
    return null;
  }

  return feed;
}

/**
 * Processes all RSS feeds from multiple sources and returns aggregated statistics
 */
async function processAllFeeds(sources: NewsSource[]) {
  const feedPromises = sources.map(extractRssFeed);
  const results = await Promise.all(feedPromises);
  const successfulFeeds = results.filter((result) => result !== null);

  const feedsWithSummaries = await Promise.all(successfulFeeds.map(processFeedEntries));

  // Flatten all articles from all feeds into a single array
  const allArticles = feedsWithSummaries.flatMap((feed) => feed.entries);

  return allArticles;
}

/**
 * Main API endpoint that processes RSS feeds and returns article analysis results
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  const sourcesWithRss = newsSources.filter((source) => source.rss && !source.blocked);

  const articles = await processAllFeeds(sourcesWithRss);

  // Remove duplicates based on ID before sending to database
  const uniqueArticles = articles.filter(
    (article, index, self) => index === self.findIndex((a) => a.id === article.id)
  );

  const supabase = await createSupabaseServerWithAnonKey();
  const { error } = await supabase.from("news").upsert(uniqueArticles, {
    onConflict: "original_url",
  });
  if (error) {
    console.log("Error inserting news:", error);
    throw new Error(error.message);
  }
  await fetch("https://kuma.fomoed.io/api/push/FJSwB7iaUW?status=up&msg=OK&ping=");
  return NextResponse.json(articles, { status: 200 });
}
