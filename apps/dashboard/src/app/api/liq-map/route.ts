import { NextResponse } from "next/server";

async function fetchCoinglassLiqMap(
  range: string,
  exchange: string,
  symbol: string
) {
  const url = `https://open-api-v3.coinglass.com/api/futures/liquidation/map?exchange=${exchange}&symbol=${symbol}&range=${range}`;
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

async function fetchPairMarkets(symbol: string) {
  const url = `https://open-api-v3.coinglass.com/api/futures/pairs-markets?symbol=${symbol}`;
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

//! REQUEST HANDLER FOR /api/liq-map
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const timeframe = searchParams.get("timeframe");
    const exchange = searchParams.get("exchange");
    const instrumentId = searchParams.get("instrumentId");
    const baseAsset = searchParams.get("baseAsset");
    const quoteAsset = searchParams.get("quoteAsset");

    if (!timeframe || !exchange || !instrumentId || !baseAsset || !quoteAsset) {
      return NextResponse.json(
        { error: "Missing required query parameters" },
        { status: 400 }
      );
    }

    const liquidationData = await fetchCoinglassLiqMap(
      timeframe,
      exchange,
      instrumentId
    );
    const pairMarketsData = await fetchPairMarkets(baseAsset);

    const pairMarketData = pairMarketsData.data.data.find(
      (i: any) => i.symbol === baseAsset + "/" + quoteAsset
    );

    if (liquidationData.success === false) {
      return NextResponse.json(
        { error: "Failed to fetch Liquidation data" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: { liquidationData, pairMarketData } });
  } catch (error) {
    // Handle errors gracefully
    console.error("Error fetching liquidation data:", error);
    return NextResponse.json(
      { error: "Failed to fetch Liquidation data" },
      { status: 500 }
    );
  }
}
