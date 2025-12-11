import { NextResponse } from "next/server";

async function fetchCoinglassLiqMap(range: string, exchange: string, symbol: string) {
  const url = `https://open-api-v4.coinglass.com/api/futures/liquidation/map?exchange=${exchange}&symbol=${symbol}&range=${range}`;
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
    console.error("Failed to fetch liquidation map from CoinGlass:", data);
    throw new Error(data.msg || "Failed to fetch liquidation map data");
  }

  return res.json();
}

async function fetchPairMarkets(symbol: string) {
  const url = `https://open-api-v4.coinglass.com/api/futures/pairs-markets?symbol=${symbol}`;
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
    console.error("Failed to fetch pair markets from CoinGlass:", data);
    throw new Error(data.msg || "Failed to fetch pair markets data");
  }

  return res.json();
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
      return NextResponse.json({ error: "Missing required query parameters" }, { status: 400 });
    }

    const liquidationData = await fetchCoinglassLiqMap(timeframe, exchange, instrumentId);
    const pairMarketsData = await fetchPairMarkets(baseAsset);

    // Validate pairMarketsData structure
    if (!pairMarketsData || !Array.isArray(pairMarketsData.data)) {
      console.error("Invalid pair markets data structure:", pairMarketsData);
      throw new Error("Invalid response format from CoinGlass pair markets API");
    }

    const pairMarketData = pairMarketsData.data.find((i: any) => i.symbol === baseAsset + "/" + quoteAsset);

    if (liquidationData.success === false) {
      return NextResponse.json({ error: "Failed to fetch Liquidation data" }, { status: 500 });
    }

    return NextResponse.json({ data: { liquidationData, pairMarketData } });
  } catch (error) {
    // Handle errors gracefully
    console.log("Error fetching liquidation data:", error);
    return NextResponse.json({ error: "Failed to fetch Liquidation data" }, { status: 500 });
  }
}
