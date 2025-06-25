import { NextResponse } from "next/server";

//! REQUEST HANDLER FOR /api/dex/fetch-token
export async function GET(request: Request) {
  try {
    // API key is safely stored on server

    const response = await fetch(
      `https://cfgi.io/api/api_request.php`
      // {
      //   cache: "no-store",
      // }
    );
    const resText = await response.text();
  } catch (error) {
    // Handle errors gracefully
    console.log("Error fetching token data:", error);
    return NextResponse.json(
      { error: "Failed to fetch token data" },
      { status: 500 }
    );
  }
}
