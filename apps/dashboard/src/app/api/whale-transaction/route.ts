import { NextResponse } from "next/server";
import { Redis } from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  password: process.env.REDIS_PASSWORD || undefined,
});

const TOP_COINS_KEY = "coinglass_top_10_coins_by_marketcaps";
const CACHE_TTL = 3600; // Cache for 1 hour

async function fetchTopCoins(): Promise<Set<string>> {
  try {
    const cachedCoins = await redis.get(TOP_COINS_KEY);
    if (cachedCoins) {
      console.log("Fetching top coins from Redis cache.");
      return new Set(JSON.parse(cachedCoins));
    }

    console.log("Cache miss. Fetching top coins from CoinGlass API.");
    const url = "https://open-api-v4.coinglass.com/api/futures/coins-markets";
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        "CG-API-KEY": process.env.PRIVATE_COINGLASS_KEY as string,
      },
    };

    const res = await fetch(url, options);
    if (!res.ok) {
      throw new Error("Failed to fetch supported coins from API");
    }
    const data = await res.json();

    const top10 = data.data
      .sort((a: any, b: any) => b.market_cap_usd - a.market_cap_usd)
      .slice(0, 10)
      .map((coin: any) => coin.symbol.toUpperCase());
    await redis.setex(TOP_COINS_KEY, CACHE_TTL, JSON.stringify(top10));

    return new Set(top10);
  } catch (error) {
    console.error("Error in fetchTopCoins:", error);
    return new Set([
      "BTC",
      "ETH",
      "SOL",
      "XRP",
      "DOGE",
      "ADA",
      "SHIB",
      "AVAX",
      "LINK",
      "TRX",
    ]);
  }
}

export async function GET() {
  try {
    const TOP_10_ASSETS = await fetchTopCoins();

    const url = "https://open-api-v4.coinglass.com/api/hyperliquid/whale-alert";
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        "CG-API-KEY": process.env.PRIVATE_COINGLASS_KEY as string,
      },
      cache: "no-store" as RequestCache,
    };

    const res = await fetch(url, options);
    const rawData = await res.json();

    if (!res.ok || !rawData.data) {
      console.error("Failed to fetch whale transaction data:", rawData);
      return NextResponse.json(
        { error: rawData.msg || "Failed to fetch whale transaction data" },
        { status: 500 },
      );
    }

    const filteredAndFormattedData = rawData.data
      .filter((transaction: any) => {
        const isHighValue = transaction.position_value_usd > 500000;
        const isTopAsset = TOP_10_ASSETS.has(transaction.symbol.toUpperCase());
        const isOpenPosition = transaction.position_action === 1;

        return isHighValue && isTopAsset && isOpenPosition;
      })
      .map((transaction: any) => {
        return {
          user: transaction.user,
          token: transaction.symbol,
          time: transaction.create_time,
          direction: transaction.position_size > 0 ? "Long" : "Short",
          entryPrice: transaction.entry_price,
          value: transaction.position_value_usd,
        };
      });

    return NextResponse.json({ data: filteredAndFormattedData });
  } catch (error: any) {
    console.error("Error fetching whale transaction data:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch whale transaction data" },
      { status: 500 },
    );
  }
}
