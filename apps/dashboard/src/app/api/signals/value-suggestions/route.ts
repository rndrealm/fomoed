import { NextResponse } from "next/server";

async function getBinanceSuggestions(symbol: string) {
  try {
    // Get 24hr ticker price statistics
    const tickerResponse = await fetch(
      `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`
    );
    const tickerData = await tickerResponse.json();

    // Check if the response contains an error
    if (tickerData.code) {
      console.log("🚀 ~ getBinanceSuggestions: ~ tickerData:", tickerData);
      return {
        suggestions: [],
        error: tickerData.msg || "Invalid symbol",
      };
    }

    const currentPrice = parseFloat(tickerData.lastPrice);
    const high24h = parseFloat(tickerData.highPrice);
    const low24h = parseFloat(tickerData.lowPrice);

    // Calculate suggestions based on price ranges
    const suggestions = [
      {
        value: Math.round(currentPrice),
        label: "Current",
      },
      {
        value: Math.round(high24h),
        label: "24h High",
      },
      {
        value: Math.round(low24h),
        label: "24h Low",
      },
    ];

    return { suggestions };
  } catch (error) {
    console.error("Error fetching Binance data:", error);
    return {
      suggestions: [],
      error: "Failed to fetch data from Binance",
    };
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dataSourceId = searchParams.get("dataSourceId");
  const topic = searchParams.get("topic");

  if (!dataSourceId || !topic) {
    return NextResponse.json(
      { error: "dataSourceId and topic are required" },
      { status: 400 }
    );
  }

  // Handle different data sources
  if (dataSourceId === "price") {
    const result = await getBinanceSuggestions(topic);

    if (result.error) {
      return NextResponse.json(
        { suggestions: [], error: result.error },
        { status: 200 }
      );
    }

    return NextResponse.json(result);
  }

  // Default response for unknown data sources
  return NextResponse.json({
    suggestions: [],
    error: "Unsupported data source",
  });
}
