import { Kline, OpenInterestData, MergedBar, MergedDataResult } from './types';

const BASE_URL = '/api/binance-heatmap';

export async function fetchKlines(
  symbol: string,
  interval: string,
  limit: number = 500,
  startTime?: number
): Promise<Kline[]> {
  const params = new URLSearchParams({
    symbol,
    interval,
    limit: limit.toString(),
  });

  if (startTime) {
    params.append('startTime', startTime.toString());
  }

  const url = `${BASE_URL}/fapi/v1/klines?${params}`;
  console.log('Fetching klines:', url);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch klines: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log(`Got ${data.length} klines`);

  return data.map((k: (string | number)[]): Kline => ({
    openTime: Number(k[0]),
    open: parseFloat(k[1] as string),
    high: parseFloat(k[2] as string),
    low: parseFloat(k[3] as string),
    close: parseFloat(k[4] as string),
    volume: parseFloat(k[5] as string),
    closeTime: Number(k[6]),
  }));
}

export async function fetchOpenInterestHist(
  symbol: string,
  period: string,
  limit: number = 500,
  startTime?: number
): Promise<OpenInterestData[]> {
  const params = new URLSearchParams({
    symbol,
    period,
    limit: limit.toString(),
  });

  if (startTime) {
    params.append('startTime', startTime.toString());
  }

  const url = `${BASE_URL}/futures/data/openInterestHist?${params}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch OI: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  return data.map((d: { timestamp: number; sumOpenInterest: string; sumOpenInterestValue: string }): OpenInterestData => ({
    timestamp: d.timestamp,
    sumOpenInterest: parseFloat(d.sumOpenInterest),
    sumOpenInterestValue: parseFloat(d.sumOpenInterestValue),
  }));
}

function calculateBarsNeeded(interval: string, lookbackHours: number): number {
  const intervalMinutes: Record<string, number> = {
    '1m': 1,
    '3m': 3,
    '5m': 5,
    '15m': 15,
    '30m': 30,
    '1h': 60,
    '2h': 120,
    '4h': 240,
    '6h': 360,
    '8h': 480,
    '12h': 720,
    '1d': 1440,
  };
  const minutes = intervalMinutes[interval] || 1;
  return Math.ceil((lookbackHours * 60) / minutes);
}

async function fetchKlinesPaginated(
  symbol: string,
  interval: string,
  lookbackHours: number
): Promise<Kline[]> {
  const barsNeeded = calculateBarsNeeded(interval, lookbackHours);
  const maxPerRequest = 1500; 


  if (barsNeeded <= maxPerRequest) {
    const klines = await fetchKlines(symbol, interval, barsNeeded);
    console.log(`Single fetch: got ${klines.length} klines, last close time: ${klines.length > 0 ? new Date(klines[klines.length - 1].closeTime).toISOString() : 'N/A'}`);
    return klines;
  }


  const allKlines: Kline[] = [];
  let endTime: number | undefined = undefined; 
  let remaining = barsNeeded;

  while (remaining > 0) {
    const limit = Math.min(remaining, maxPerRequest);

    const params = new URLSearchParams({
      symbol,
      interval,
      limit: limit.toString(),
    });
    if (endTime) {
      params.append('endTime', endTime.toString());
    }

    const url = `${BASE_URL}/fapi/v1/klines?${params}`;
    console.log('Fetching klines (paginated):', url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch klines: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const klines: Kline[] = data.map((k: (string | number)[]): Kline => ({
      openTime: Number(k[0]),
      open: parseFloat(k[1] as string),
      high: parseFloat(k[2] as string),
      low: parseFloat(k[3] as string),
      close: parseFloat(k[4] as string),
      volume: parseFloat(k[5] as string),
      closeTime: Number(k[6]),
    }));

    if (klines.length === 0) break;

    allKlines.unshift(...klines);
    remaining -= klines.length;

    endTime = klines[0].openTime - 1;

    console.log(`Paginated fetch: got ${klines.length} klines, total so far: ${allKlines.length}`);

    if (klines.length < limit) break;
  }

  console.log(`Total klines fetched: ${allKlines.length}, last close time: ${allKlines.length > 0 ? new Date(allKlines[allKlines.length - 1].closeTime).toISOString() : 'N/A'}`);
  return allKlines;
}

export async function fetchMergedData(
  symbol: string,
  interval: string,
  lookbackHours: number
): Promise<MergedDataResult> {
  const startTime = Date.now() - lookbackHours * 60 * 60 * 1000;
  const barsNeeded = calculateBarsNeeded(interval, lookbackHours);

  console.log(`Fetching ${interval} klines for ${symbol} (need ~${barsNeeded} bars)...`);

  const [klines, currentPrice] = await Promise.all([
    fetchKlinesPaginated(symbol, interval, lookbackHours),
    fetchCurrentPrice(symbol),
  ]);

  console.log(`Got ${klines.length} klines, current price: ${currentPrice}, fetching OI...`);
  let oiData: OpenInterestData[] = [];

  const oiLimit = Math.min(barsNeeded, 500); 
  try {
    oiData = await fetchOpenInterestHist(symbol, interval, oiLimit, startTime);
    console.log(`Got ${oiData.length} OI data points`);
  } catch (error) {
    console.warn('Could not fetch OI data, using volume as proxy:', error);
  }

  const oiMap = new Map<number, number>();
  oiData.forEach((oi) => {
    oiMap.set(oi.timestamp, oi.sumOpenInterest);
  });

  const merged: MergedBar[] = [];
  let prevOi = 0;

  for (const kline of klines) {
    const oi = oiMap.get(kline.openTime) ?? prevOi;
    const oiDelta = prevOi > 0 ? oi - prevOi : 0;
    prevOi = oi;

    merged.push({
      timestamp: kline.openTime,
      open: kline.open,
      high: kline.high,
      low: kline.low,
      close: kline.close,
      volume: kline.volume,
      oiDelta: oiDelta > 0 ? oiDelta : kline.volume * 0.1,
    });
  }

  console.log(`Returning ${merged.length} merged bars`);
  return { bars: merged, currentPrice };
}

export async function fetchCurrentPrice(symbol: string): Promise<number> {
  const url = `${BASE_URL}/fapi/v1/ticker/price?symbol=${symbol}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch price: ${response.status}`);
  }

  const data = await response.json();
  return parseFloat(data.price);
}
