import { createSupabaseServerClient } from "@/lib/utils/supabase/server-client";
import { NextRequest, NextResponse } from "next/server";
import { now } from "lodash-es";

const maxCacheAgeSeconds = 120;
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
  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch Liquidation data1" }, { status: 500 });
  }

  return data;
}

async function fetchAssetPriceUsd(symbol: string): Promise<number> {
  const pairMarketsData = await fetchPairMarkets(symbol);

  const pairMarketData = pairMarketsData.data.find((i: any) => i.symbol === symbol + "/" + "USDT");
  return pairMarketData.current_price;
}

async function fetchCoinglassSupportedPairs() {
  const url = "https://open-api-v4.coinglass.com/api/futures/supported-exchange-pairs";
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "CG-API-KEY": process.env.PRIVATE_COINGLASS_KEY as string,
    },
  };

  const res = await fetch(url, options);
  const data = await res.json();

  if (!res.ok || !data.data) {
    return NextResponse.json({ error: "Failed to fetch Liquidation data2" }, { status: 500 });
  }
  return data;
}

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
  const data = await res.json();

  if (!res.ok) {
    console.log(data);
  }

  return data;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const timeframe = searchParams.get("timeframe");
    const asset = searchParams.get("asset");

    if (!timeframe || !asset) {
      return NextResponse.json({ error: "Missing required query parameters" }, { status: 400 });
    }
    const currentPriceUsd = await fetchAssetPriceUsd(asset);

    const supabaseServer = await createSupabaseServerClient();

    const cacheAssetId = asset + "-" + timeframe;

    const cached = await supabaseServer.from("exchangeLiqMapCache").select().eq("asset", cacheAssetId);

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

    const supportedFuturePairs: Record<string, { base_asset: string; instrument_id: string }[]> = (
      await fetchCoinglassSupportedPairs()
    ).data;

    if (!supportedFuturePairs) {
      return NextResponse.json({ error: "Failed to fetch Liquidation data3" }, { status: 500 });
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

    for (const [exchange, instruments] of Object.entries(supportedFuturePairs)) {
      supportedFuturePairs[exchange] = instruments.filter((i) => i.base_asset === asset);
    }

    const fetchPromises = [];

    for (const [exchange, instruments] of Object.entries(supportedFuturePairs)) {
      for (const instrument of instruments) {
        fetchPromises.push(
          fetchCoinglassLiqMap(timeframe, exchange, instrument.instrument_id)
            .then((response) => ({
              exchange,
              instrumentId: instrument.instrument_id,
              data: response?.data?.data,
            }))
            .catch((err) => {
              console.error(`Error fetching data for ${exchange}/${instrument.instrument_id}:`, err);
              return null;
            })
        );
      }
    }

    const results = await Promise.all(fetchPromises);

    for (const result of results) {
      if (!result || !result.data) continue;

      const { exchange, data } = result;

      for (const [price, liquidations] of Object.entries(data)) {
        const roundedPrice = parseFloat(price);

        if (Array.isArray(liquidations)) {
          for (const liquidation of liquidations as [number, number, number, null][]) {
            const liqLevel = liquidation[1];
            totalExLiq[exchange][roundedPrice] = (totalExLiq[exchange][roundedPrice] || 0) + liqLevel;
          }
        }
      }
    }

    await supabaseServer.from("exchangeLiqMapCache").upsert({ asset: cacheAssetId, data: totalExLiq });

    return NextResponse.json({
      data: { currentPriceUsd, exLiqData: totalExLiq },
    });
  } catch (error) {
    console.log("Error fetching liquidation data:", error);
    return NextResponse.json({ error: "Failed to fetch Liquidation data4" }, { status: 500 });
  }
}