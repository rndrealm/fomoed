import { NextResponse } from "next/server";

//! REQUEST HANDLER FOR /api/newslab/:id
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const url = new URL(
      `/api/newslab-posts/${id}`,
      process.env.PUBLIC_NEWSLAB_URL
    );

    console.log("URL:", url.toString());

    const res = await fetch(url);

    const json = await res.text();

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
