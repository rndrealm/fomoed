import { logger } from "@/lib/utils/logger";

// NOT TESTED
export async function fetchCoinglassHeatmap(range: string, exchange: string, symbol: string) {
  const url = `https://open-api-v3.coinglass.com/api/futures/liquidation/heatmap?exchange=${exchange}&symbol=${symbol}&range=${range}`;
  const options = {
    method: "GET",
    headers: { accept: "application/json", "CG-API-KEY": process.env.PRIVATE_COINGLASS_KEY as string },
  };

  const res = await fetch(url, options);
  const data = await res.json();

  if (!res.ok) {
    console.error(data);
  }

  return data;
}

// NOT TESTED
export async function fetchCoinglassLiqMap(range: string, exchange: string, symbol: string) {
  const url = `https://open-api-v3.coinglass.com/api/futures/liquidation/map?exchange=${exchange}&symbol=${symbol}&range=${range}`;
  const options = {
    method: "GET",
    headers: { accept: "application/json", "CG-API-KEY": process.env.PRIVATE_COINGLASS_KEY as string },
  };

  const res = await fetch(url, options);
  const data = await res.json();

  if (!res.ok) {
    console.error(data);
  }

  return data;
}

export async function fetchCoinglassSupportedPairs(): Promise<any | null> {
  const url = "https://open-api-v3.coinglass.com/api/futures/supported-exchange-pairs";
  const options = {
    method: "GET",
    headers: { accept: "application/json", "CG-API-KEY": process.env.PRIVATE_COINGLASS_KEY as string },
  };

  const res = await fetch(url, options);
  const data = await res.json();

  if (!res.ok || !data.success) {
    logger.error("Failed to fetch Coinglass supported pairs:");
    logger.error(logger.serialize(data));

    return null;
  }

  return data;
}

// NOT TESTED
export async function fetchPairMarkets(symbol: string): Promise<any | null> {
  const url = `https://open-api-v3.coinglass.com/api/futures/pairs-markets?symbol=${symbol}`;
  const options = {
    method: "GET",
    headers: { accept: "application/json", "CG-API-KEY": process.env.PRIVATE_COINGLASS_KEY as string },
  };

  const res = await fetch(url, options);
  const data = await res.json();

  if (!res.ok) {
    return null;
  }

  return data;
}

// NOT TESTED
export async function fetchAssetPriceUsd(symbol: string): Promise<number> {
  const pairMarketsData = await fetchPairMarkets(symbol);

  const pairMarketData = pairMarketsData.data.data.find((i: any) => i.symbol === symbol + "/" + "USDT");

  return pairMarketData.price;
}
