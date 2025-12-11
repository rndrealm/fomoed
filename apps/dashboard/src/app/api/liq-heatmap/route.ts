import { NextResponse } from "next/server";

async function fetchCoinglassHeatmap(range: string, exchange: string, symbol: string) {
  const url = `https://open-api-v4.coinglass.com/api/futures/liquidation/heatmap/model1?exchange=${exchange}&symbol=${symbol}&range=${range}`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "CG-API-KEY": process.env.PRIVATE_COINGLASS_KEY as string,
    },
  };

  const res = await fetch(url, options);

  if (!res.ok) {
    const data = await res.json();
    console.error("Failed to fetch liquidation heatmap from CoinGlass:", data);
    throw new Error(data.msg || "Failed to fetch liquidation heatmap data");
  }

  return res.json();
}

//! REQUEST HANDLER FOR /api/liq-heatmap
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const timeframe = searchParams.get("timeframe");
    const exchange = searchParams.get("exchange");
    const symbol = searchParams.get("symbol");

    if (!timeframe || !exchange || !symbol) {
      return NextResponse.json({ error: "Missing required query parameters" }, { status: 400 });
    }

    const data = await fetchCoinglassHeatmap(timeframe, exchange, symbol);

    if (!data.data) {
      return NextResponse.json({ error: "Failed to fetch Liquidation data" }, { status: data.status || 500 });
    }
    return NextResponse.json({ data: data.data });
  } catch (error) {
    // Handle errors gracefully
    console.log("Error fetching liquidation data:", error);
    return NextResponse.json({ error: "Failed to fetch Liquidation data" }, { status: 500 });
  }
}
