import { NextResponse } from "next/server";
import { BUNGEE_API_BASE_URL } from "../static";

//! REQUEST HANDLER FOR /api/dex/supported-chains
export async function GET() {
  try {
    const response = await fetch(`${BUNGEE_API_BASE_URL}/supported-chains`, {
      headers: {
        "x-api-key": process.env.BUNGEE_API_KEY!, // Ensure the API key is set in your environment variables
      },
    });

    if (response.status !== 200) {
      return NextResponse.json(
        { error: "Failed to fetch chain data" },
        { status: response.status }
      );
    } else {
      const resJson = await response.json();

      return NextResponse.json(resJson);
    }
  } catch (error) {
    // Handle errors gracefully
    console.log("Error fetching chain data:", error);
    return NextResponse.json(
      { error: "Failed to fetch chain data" },
      { status: 500 }
    );
  }
}
