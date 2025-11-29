import { NextRequest, NextResponse } from "next/server";
import { CoinStatsTokenInfo } from "@/services/queries/charts/types";
import { getRedisInstance } from "@/lib/utils/server.utils";

const COIN_KEY_PREFIX = "coin-v4-new-prefix:";
const COIN_LIST_KEY = "coinstats_coinlist-v4";
const CACHE_TTL = 18000; 
const API_KEY = "WvGNSh8jIvpDJ0hjsgNZu1MFMYeohhiYMqDuzcZplTk=";

async function fetchSingleToken(token: string): Promise<CoinStatsTokenInfo | null> {
  const redis = getRedisInstance();

  try {
    const cachedCoin = await redis.get(`${COIN_KEY_PREFIX}${token}`);
    if (cachedCoin) {
      return JSON.parse(cachedCoin);
    }

    console.log(`Fetching single token: ${token}`);
    const response = await fetch(`https://openapiv1.coinstats.app/coins/${token}`, {
      headers: {
        "X-API-KEY": API_KEY,
      },
    });

    if (!response.ok) {
      console.error(`API error for token ${token}: ${response.status} ${response.statusText}`);
      return null;
    }

    const coin = (await response.json()) as CoinStatsTokenInfo;

    await redis.setex(`${COIN_KEY_PREFIX}${token}`, CACHE_TTL, JSON.stringify(coin));

    return coin;
  } catch (err) {
    console.error(`Error fetching single token ${token}:`, err);
    return null;
  }
}

async function fetchCoinList(): Promise<CoinStatsTokenInfo[]> {
  const redis = getRedisInstance();

  try {
    const cachedCoinList = await redis.get(COIN_LIST_KEY);

    if (cachedCoinList) {
      const coinSlugs: string[] = JSON.parse(cachedCoinList);

      const pipeline = redis.pipeline();
      coinSlugs.forEach((slug) => {
        pipeline.get(`${COIN_KEY_PREFIX}${slug}`);
      });

      const results = await pipeline.exec();
      const cachedCoins: CoinStatsTokenInfo[] = [];

      if (results) {
        for (const [err, result] of results) {
          if (!err && result) {
            cachedCoins.push(JSON.parse(result as string));
          }
        }
      }

      if (cachedCoins.length === coinSlugs.length) {
        return cachedCoins;
      }
    }

    console.log("Cache miss or incomplete, fetching coin list from API");
    const response = await fetch("https://openapiv1.coinstats.app/coins?limit=200", {
      headers: {
        "X-API-KEY": API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const coins = (data?.result as CoinStatsTokenInfo[]) || [];

    const pipeline = redis.pipeline();
    const coinSlugs: string[] = [];

    coins.forEach((coin) => {
      const key = `${COIN_KEY_PREFIX}${coin.id}`;
      pipeline.set(key, JSON.stringify(coin), "EX", CACHE_TTL, "NX");
      coinSlugs.push(coin.id);
    });

    pipeline.setex(COIN_LIST_KEY, CACHE_TTL, JSON.stringify(coinSlugs));

    await pipeline.exec();
    console.log(`Cached ${coins.length} coins individually`);

    return coins;
  } catch (err) {
    console.error("Error fetching coin list:", err);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (token) {
      const coin = await fetchSingleToken(token);

      if (!coin) {
        return NextResponse.json({ error: `Token '${token}' not found` }, { status: 404 });
      }

      return NextResponse.json(coin);
    }

    // Otherwise, fetch the full list
    const coins = await fetchCoinList();
    if (!coins || coins.length === 0) {
      return NextResponse.json({ error: "No coins available" }, { status: 500 });
    }
    return NextResponse.json(coins);
  } catch (err) {
    console.error("Endpoint error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
