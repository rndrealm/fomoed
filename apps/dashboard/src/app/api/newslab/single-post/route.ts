import { createSupabaseServerClient } from "@/lib/utils/supabase/server-client";
import { NextResponse } from "next/server";

//! REQUEST HANDLER FOR /api/newslab/:id
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const supabase = await createSupabaseServerClient();

    const { data: newsItem, error } = await supabase
      .from("news")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch news item" },
        { status: 500 }
      );
    }

    if (!newsItem) {
      return NextResponse.json(
        { error: "News item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(newsItem);
  } catch (error) {
    // Handle errors gracefully
    console.log("Error fetching news data:", error);
    return NextResponse.json(
      { error: "Failed to fetch News data" },
      { status: 500 }
    );
  }
}
