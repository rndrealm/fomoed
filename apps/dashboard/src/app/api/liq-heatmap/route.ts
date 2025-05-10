import { NextResponse } from "next/server";

async function fetchCoinglassHeatmap(
  range: string,
  exchange: string,
  symbol: string
) {
  const url = `https://open-api-v3.coinglass.com/api/futures/liquidation/heatmap?exchange=${exchange}&symbol=${symbol}&range=${range}`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "CG-API-KEY": process.env.PRIVATE_COINGLASS_KEY as string,
    },
  };

  const res = await fetch(url, options);
  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch Liquidation data" },
      { status: 500 }
    );
  }

  return data;
}

//! REQUEST HANDLER FOR /api/liq-heatmap
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const timeframe = searchParams.get("timeframe");
    const exchange = searchParams.get("exchange");
    const symbol = searchParams.get("symbol");

    if (!timeframe || !exchange || !symbol) {
      return NextResponse.json(
        { error: "Missing required query parameters" },
        { status: 400 }
      );
    }

    const data = await fetchCoinglassHeatmap(timeframe, exchange, symbol);
    if (data.success === false) {
      return NextResponse.json(
        { error: "Failed to fetch Liquidation data" },
        { status: 500 }
      );
    }
    return NextResponse.json({ data: data.data });
  } catch (error) {
    // Handle errors gracefully
    console.log("Error fetching liquidation data:", error);
    return NextResponse.json(
      { error: "Failed to fetch Liquidation data" },
      { status: 500 }
    );
  }
}
