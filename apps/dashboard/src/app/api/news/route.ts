import { logger } from "@/lib/utils/logger";
import { createSupabaseServerWithAnonKey } from "@/lib/utils/supabase/server-client";
import { CryptopanicNewsApiResponse, NewsFeedResponseData, NewsRowInsert } from "@/services/queries/news/types";
import { NextResponse } from "next/server";

type PartialExcept<T, K extends keyof T> = Partial<Omit<T, K>> & Pick<T, K>;

// async function fetchRowsFromNewsLab() {
//   const newsRows: Partial<NewsRowInsert>[] = [];

//   const url = new URL("/api/newslab-posts", process.env.PUBLIC_NEWSLAB_URL);

//   let res: Response;

//   try {
//     res = await fetch(url);
//   } catch (error) {
//     console.log("Failed to fetch newslab posts:", error);
//     return [];
//   }

//   let json: ApiNewsLabPost[];

//   try {
//     json = await res.json();
//   } catch (error) {
//     console.log("Failed to parse newslab posts:", error);
//     return [];
//   }

//   for (const post of json) {
//     const originalUrl =
//       process.env.PUBLIC_NEWSLAB_URL + "/api/newslab-posts/" + post.id;

//     const contentWithoutTitle = post.content.replace(/<h1[^>]*>.*?<\/h1>/, "");
//     const contentWithoutMarkup = contentWithoutTitle.replace(/<[^>]+>/g, "");
//     const contentWithoutNewlines = contentWithoutMarkup
//       .replace(/\n/g, " ")
//       .trim();
//     const briefContent = contentWithoutNewlines.substring(0, 200) + "...";

//     const rowInsert: Partial<NewsRowInsert> = {
//       id: post.id,
//       original_url: originalUrl,
//       published_at: post.created_at,
//       source: "NewsLab",
//       image_url: null,
//       sentiment: "neutral",
//       summary: briefContent,
//       symbols: post.metadata.ref_tokens,
//       title: post.title,
//     };

//     newsRows.push(rowInsert);
//   }

//   return newsRows;
// }

async function fetchNews() {
  const url = new URL("https://cryptopanic.com/api/growth/v2/posts/");

  url.searchParams.set("auth_token", process.env.PRIVATE_CRYPTOPANIC_KEY!);
  // url.searchParams.set("metadata", "true");
  // url.searchParams.set("approved", "true");

  const res = await fetch(url);

  if (!res.ok) {
    logger.error(res.statusText);
    logger.error(await res.text());
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

  // Append news from newslab from
  // const newsLabPosts = await fetchRowsFromNewsLab();
  // const concatPostUpserts = [...newsRows, ...newsLabPosts];

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

    const monitorUrl = process.env.KUMA_MONITOR_PUSH_URL_CRONJOB_NEWS;

    if (monitorUrl) {
      await fetch(monitorUrl);
    }

    return NextResponse.json({ success: "true", data });
  } catch (error) {
    // Handle errors gracefully
    console.log("Error fetching news data:", error);
    return NextResponse.json({ error: "Failed to fetch News data" }, { status: 500 });
  }
}
