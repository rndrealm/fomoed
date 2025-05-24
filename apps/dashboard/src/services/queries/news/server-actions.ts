import { createSupabaseServerComponentClient } from "@/lib/utils/supabase/server-client";
import {
  ApiNewsLabPost,
  CryptopanicNewsApiResponse,
  NewsFeedResponseData,
  NewsRowInsert,
} from "@/services/queries/news/types";

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
  const url = new URL("https://cryptopanic.com/api/posts/");

  url.searchParams.set("auth_token", process.env.PRIVATE_CRYPTOPANIC_KEY!);
  url.searchParams.set("metadata", "true");
  url.searchParams.set("approved", "true");

  const res = await fetch(url);
  console.log("Fetching news from CryptoPanic:", res);
  if (!res.ok) {
    console.log(await res.text());
    throw new Error("Failed to fetch news from CryptoPanic");
  }

  const json: CryptopanicNewsApiResponse = await res.json();
  const news = json.results;

  const newsRows: Partial<NewsRowInsert>[] = [];
  const ids: string[] = [];

  for (const i of news) {
    const appId = `cryptopanic-${i.id}`;

    newsRows.push({
      id: appId,
      original_url: i.source.url,
      published_at: i.published_at,
      source: i.source.title,
      image_url: null,
      sentiment:
        i.votes.positive > i.votes.negative
          ? "bullish"
          : i.votes.positive < i.votes.negative
            ? "bearish"
            : "neutral",
      summary: i.metadata?.description,
      symbols: i.currencies?.map((c) => c.code) || [],
      title: i.title,
    });

    ids.push(appId);
  }

  // Append news from newslab from
  // const newsLabPosts = await fetchRowsFromNewsLab();

  // const concatPostUpserts = [...newsRows, ...newsLabPosts];
  const concatPostUpserts = [...newsRows];
  const supabase = await createSupabaseServerComponentClient();
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

export async function fetchNewsData() {
  const data = await fetchNews();
  return data;
}
