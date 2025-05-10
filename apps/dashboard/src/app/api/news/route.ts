import { CryptopanicNewsApiResponse } from "@/services/queries/news/types";
import { NextResponse } from "next/server";

async function fetchNews() {
  const url = new URL("https://cryptopanic.com/api/posts/");

  url.searchParams.set("auth_token", process.env.PRIVATE_CRYPTOPANIC_KEY!);
  url.searchParams.set("metadata", "true");
  url.searchParams.set("approved", "true");

  const res = await fetch(url);

  if (!res.ok) {
    console.log(await res.text());
    throw new Error("Failed to fetch news from CryptoPanic");
  }

  const json: CryptopanicNewsApiResponse = await res.json();
  const news = json.results;

  return news;
}

//! REQUEST HANDLER FOR /api/news
export async function GET(request: Request) {
  try {
    const data = await fetchNews();

    return NextResponse.json({ success: "true", data });
  } catch (error) {
    // Handle errors gracefully
    console.log("Error fetching news data:", error);
    return NextResponse.json(
      { error: "Failed to fetch News data" },
      { status: 500 }
    );
  }
}
