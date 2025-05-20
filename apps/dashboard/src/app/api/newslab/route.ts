import { NextResponse } from "next/server";

//! REQUEST HANDLER FOR /api/newslab
export async function GET(request: Request) {
  try {
    const url = new URL("/api/newslab-posts", process.env.PUBLIC_NEWSLAB_URL);

    const res = await fetch(url);

    const json = await res.json();

    return NextResponse.json({ success: "true", data: json });
  } catch (error) {
    // Handle errors gracefully
    console.log("Error fetching news data:", error);
    return NextResponse.json(
      { error: "Failed to fetch News data" },
      { status: 500 }
    );
  }
}
