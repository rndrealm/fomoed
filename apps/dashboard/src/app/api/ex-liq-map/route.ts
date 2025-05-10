import { createSupabaseServerClient } from "@/lib/utils/supabase/server-client";
import { NextRequest, NextResponse } from "next/server";
import { now } from "lodash-es";

const maxCacheAgeSeconds = 120;
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

// Function to fetch the current price of an asset in USD
async function fetchAssetPriceUsd(symbol: string): Promise<number> {
  const pairMarketsData = await fetchPairMarkets(symbol);

  const pairMarketData = pairMarketsData.data.data.find(
    (i: any) => i.symbol === symbol + "/" + "USDT"
  );

  return pairMarketData.price;
}

async function fetchCoinglassSupportedPairs() {
  const url =
    "https://open-api-v3.coinglass.com/api/futures/supported-exchange-pairs";
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "CG-API-KEY": process.env.PRIVATE_COINGLASS_KEY as string,
    },
  };

  const res = await fetch(url, options);
  const data = await res.json();

  if (!res.ok || !data.success) {
    return NextResponse.json(
      { error: "Failed to fetch Liquidation data" },
      { status: 500 }
    );
  }

  return data;
}

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
    console.log(data);
  }

  return data;
}

//! REQUEST HANDLER FOR /api/ex-liq-map
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const timeframe = searchParams.get("timeframe");
    const asset = searchParams.get("asset");

    if (!timeframe || !asset) {
      return NextResponse.json(
        { error: "Missing required query parameters" },
        { status: 400 }
      );
    }
    const currentPriceUsd = await fetchAssetPriceUsd(asset);

    const supabaseServer = await createSupabaseServerClient();

    const cacheAssetId = asset + "-" + timeframe;

    const cached = await supabaseServer
      .from("exchangeLiqMapCache")
      .select()
      .eq("asset", cacheAssetId);

    if (cached.data?.length) {
      const row = cached.data[0];
      const updatedAt = new Date(row.updated_at);
      const ageSeconds = (now() - updatedAt.getTime()) / 1000;

      if (ageSeconds < maxCacheAgeSeconds) {
        return NextResponse.json({
          data: { currentPriceUsd, exLiqData: cached.data[0].data },
        });
      }
    }

    const supportedFuturePairs: Record<
      string,
      { baseAsset: string; instrumentId: string }[]
    > = (await fetchCoinglassSupportedPairs()).data;

    if (!supportedFuturePairs) {
      return NextResponse.json(
        { error: "Failed to fetch Liquidation data" },
        { status: 500 }
      );
    }

    const aggregatedExchanges = ["Binance", "OKX", "Bybit"];

    type ExName = string;
    type TotalExLiqMap = Record<number, number>;

    const totalExLiq: Record<ExName, TotalExLiqMap> = {};

    // Kep only Binance, OKX, Bybit
    for (const exchange of Object.keys(supportedFuturePairs)) {
      if (!aggregatedExchanges.includes(exchange)) {
        delete supportedFuturePairs[exchange];
      } else {
        totalExLiq[exchange] = {};
      }
    }

    // Keep only instruments with requested asset
    for (const [exchange, instruments] of Object.entries(
      supportedFuturePairs
    )) {
      supportedFuturePairs[exchange] = instruments.filter(
        (i) => i.baseAsset === asset
      );
    }

    type CgLiquidationMapData = Record<
      number,
      [number, number, number, null][]
    >;

    for (const [exchange, instruments] of Object.entries(
      supportedFuturePairs
    )) {
      for (const instrument of instruments) {
        console.info(
          "[Exchange Liquidation Map API Fetching instrument:",
          exchange,
          instrument.instrumentId
        );

        const liquidationData: CgLiquidationMapData = (
          await fetchCoinglassLiqMap(
            timeframe,
            exchange,
            instrument.instrumentId
          )
        )?.data?.data;

        // Sometimes data is not returned
        if (!liquidationData) {
          continue;
        }

        for (const [price, liquidations] of Object.entries(liquidationData)) {
          const roundedPrice = parseInt(price);

          for (const liquidation of liquidations) {
            const liqLevel = liquidation[1];

            totalExLiq[exchange][roundedPrice] =
              (totalExLiq[exchange][roundedPrice] || 0) + liqLevel;
          }
        }
      }
    }

    // Cache retrieved data
    await supabaseServer
      .from("exchangeLiqMapCache")
      .upsert({ asset: cacheAssetId, data: totalExLiq });

    return NextResponse.json({
      data: { currentPriceUsd, exLiqData: totalExLiq },
    });
  } catch (error) {
    // Handle errors gracefully
    console.log("Error fetching liquidation data:", error);
    return NextResponse.json(
      { error: "Failed to fetch Liquidation data" },
      { status: 500 }
    );
  }
}
