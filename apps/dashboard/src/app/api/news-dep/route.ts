import { createSupabaseServerWithAnonKey } from "@/lib/utils/supabase/server-client";
import { CryptopanicNewsApiResponse, NewsFeedResponseData, NewsRowInsert } from "@/services/queries/news/types";
import { NextResponse } from "next/server";

type PartialExcept<T, K extends keyof T> = Partial<Omit<T, K>> & Pick<T, K>;

async function fetchNews() {
  const url = new URL("https://cryptopanic.com/api/growth/v2/posts/");

  url.searchParams.set("auth_token", process.env.PRIVATE_CRYPTOPANIC_KEY!);
  // url.searchParams.set("metadata", "true");
  // url.searchParams.set("approved", "true");

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Failed to fetch news from CryptoPanic");
  }

  const json: CryptopanicNewsApiResponse = await res.json();
  const news = json.results;

  const newsRows: PartialExcept<NewsRowInsert, "id">[] = [];
  const ids: string[] = [];

  for (const i of news) {
    const appId = `cryptopanic-${i.id}`;
    if (i.source.region !== "en") {
      // Skip non-English news
      continue;
    }

    newsRows.push({
      id: appId,
      original_url: i.original_url,
      published_at: i.published_at,
      source: i.source.title,
      image_url: null,
      sentiment:
        i.votes.positive > i.votes.negative ? "bullish" : i.votes.positive < i.votes.negative ? "bearish" : "neutral",
      summary: i.description,
      symbols: i.instruments?.map((c) => c.code) || [],
      title: i.title,
      metadata: { region: i.source.region, ...i.votes },
    });

    ids.push(appId);
  }

  const concatPostUpserts = [...newsRows];
  const supabase = await createSupabaseServerWithAnonKey();
  const { error } = await supabase.from("news").upsert(concatPostUpserts);
  if (error) {
    console.log("Error inserting news:", error);
    throw new Error(error.message);
  }

  const responseData: NewsFeedResponseData = {
    count: json.count,
    next: json.next,
    previous: json.previous,
    postIds: ids,
  };

  return responseData;
}

//! REQUEST HANDLER FOR /api/news
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  try {
    const data = await fetchNews();

    await fetch("https://kuma.fomoed.io/api/push/FJSwB7iaUW?status=up&msg=OK&ping=");

    return NextResponse.json({ success: "true", data });
  } catch (error) {
    // Handle errors gracefully
    console.log("Error fetching news data:", error);
    return NextResponse.json({ error: "Failed to fetch News data" }, { status: 500 });
  }
}
