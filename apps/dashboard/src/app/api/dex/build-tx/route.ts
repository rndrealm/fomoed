import { NextResponse } from "next/server";
import { BUNGEE_API_BASE_URL } from "../static";

//! REQUEST HANDLER FOR /api/dex/build-transaction
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const quoteId = searchParams.get("quoteId");

    // Ensure required parameters are present
    if (!quoteId) {
      return NextResponse.json(
        { error: "Missing required query parameters" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${BUNGEE_API_BASE_URL}/bungee/build-tx?quoteId=${quoteId}`,
      {
        headers: {
          "x-api-key": process.env.BUNGEE_API_KEY!, // Ensure the API key is set in your environment variables
        },
      }
    );

    if (response.status !== 200) {
      return NextResponse.json(
        { error: "Failed to fetch token data" },
        { status: response.status }
      );
    } else {
      const resJson = await response.json();

      return NextResponse.json(resJson);
    }
  } catch (error) {
    // Handle errors gracefully
    console.log("Error fetching token data:", error);
    return NextResponse.json(
      { error: "Failed to fetch token data" },
      { status: 500 }
    );
  }
}
