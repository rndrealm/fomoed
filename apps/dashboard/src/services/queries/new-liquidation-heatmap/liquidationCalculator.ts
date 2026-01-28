import { MergedBar, LiquidationLevel, HeatmapResult, Config } from "./types";

/**
 * Liquidation Heatmap Calculator
 *
 * Estimates liquidation levels based on:
 * - Open Interest changes (where new positions are being opened)
 * - Assumed leverage levels (125x, 100x, 50x, 25x)
 * - Liquidation price formula: liq_price = entry_price * (1 - direction/leverage)
 *
 * Logic:
 * - Bullish candle (close > open) with OI increase → longs entered near low
 * - Bearish candle (close < open) with OI increase → shorts entered near high
 */

interface Liquidation {
  levels: LiquidationLevel[];
  prices: number[];
  direction: 1 | -1;
}

function createLiquidation(direction: 1 | -1): Liquidation {
  return { levels: [], prices: [], direction };
}

function addLevel(liq: Liquidation, level: LiquidationLevel, maxLevels: number): void {
  for (let i = 0; i < liq.levels.length; i++) {
    if (level.priceTop === liq.levels[i].priceTop) {
      liq.levels[i].contracts += level.contracts;
      liq.levels[i].timestamp = level.timestamp;
      return;
    }
  }

  // No overlap - add new level
  if (liq.levels.length >= maxLevels) {
    liq.levels.shift();
    liq.prices.shift();
  }

  liq.levels.push(level);
  liq.prices.push(liq.direction > 0 ? level.priceTop : level.priceBottom);
}

function squeezeLevels(liq: Liquidation, currentLow: number, currentHigh: number): boolean {
  let squeezed = false;
  let i = liq.levels.length - 1;

  while (i >= 0) {
    const price = liq.prices[i];
    const shouldRemove = liq.direction > 0 ? currentLow < price : currentHigh > price;

    if (shouldRemove) {
      liq.levels.splice(i, 1);
      liq.prices.splice(i, 1);
      squeezed = true;
    }
    i--;
  }

  return squeezed;
}

function getTickSize(price: number): number {
  if (price > 10000) return 0.1;
  if (price > 1000) return 0.01;
  if (price > 100) return 0.001;
  if (price > 10) return 0.0001;
  if (price > 1) return 0.00001;
  if (price > 0.1) return 0.000001;
  if (price > 0.01) return 0.000001;
  return 0.0000001;
}

function getLiquidationBoost(price: number): number {
  if (price > 20000) return 1.5; 
  if (price > 5000) return 2;
  if (price > 1000) return 2.5;
  if (price > 100) return 3/5;
  if (price > 10) return 4.5;
  if (price > 1) return 5; 
  return 5.5; 
}

function getLiqPrice(entryPrice: number, leverage: number, direction: 1 | -1): number {
  const boost = getLiquidationBoost(entryPrice);

  return entryPrice * (1 - direction * (1 / leverage) * boost);
}

function getPriceBucket(price: number, scale: number): [number, number] {
  const bottom = Math.floor(price / scale) * scale;
  const top = bottom + scale;
  return [top, bottom];
}

export function calculateLiquidationHeatmap(bars: MergedBar[], config: Config, currentPrice: number): HeatmapResult {
  if (bars.length === 0) {
    return {
      longs: [],
      shorts: [],
      currentPrice,
      priceRange: [0, 0],
    };
  }

  const longs = createLiquidation(1);
  const shorts = createLiquidation(-1);
  const tickSize = getTickSize(currentPrice);
  const scale = tickSize * config.scaleTicks;

  console.log(`Processing ${bars.length} bars with tick_size=${tickSize}, scale=${scale.toFixed(2)}`);

  const totalLeverage = config.leverages.reduce((a, b) => a + b, 0);
  if (totalLeverage === 0) {
    return {
      longs: [],
      shorts: [],
      currentPrice,
      priceRange: [currentPrice, currentPrice],
    };
  }

  const disp = config.dispersion;

  for (const bar of bars) {
    if (bar.oiDelta <= 0) {
      squeezeLevels(longs, bar.low, bar.high);
      squeezeLevels(shorts, bar.low, bar.high);
      continue;
    }

    const isBullish = bar.close > bar.open;

    const lowSrc = (bar.low + bar.open) / 2;
    const highSrc = (bar.high + bar.open) / 2;

    for (const leverage of config.leverages) {
      if (leverage <= 0) continue;

      const weight = leverage / totalLeverage;

      if (isBullish) {
        const longContracts = bar.oiDelta * (1 - disp) * weight;
        const longLiqPrice = getLiqPrice(lowSrc, leverage, 1);
        const [longTop, longBottom] = getPriceBucket(longLiqPrice, scale);

        addLevel(
          longs,
          {
            priceTop: longTop,
            priceBottom: longBottom,
            contracts: longContracts,
            timestamp: bar.timestamp,
            direction: 1,
          },
          config.maxLevels,
        );

        if (disp > 0) {
          const shortContracts = bar.oiDelta * disp * weight;
          const shortLiqPrice = getLiqPrice(highSrc, leverage, -1);
          const [shortTop, shortBottom] = getPriceBucket(shortLiqPrice, scale);

          addLevel(
            shorts,
            {
              priceTop: shortTop,
              priceBottom: shortBottom,
              contracts: shortContracts,
              timestamp: bar.timestamp,
              direction: -1,
            },
            config.maxLevels,
          );
        }
      } else {
        const shortContracts = bar.oiDelta * (1 - disp) * weight;
        const shortLiqPrice = getLiqPrice(highSrc, leverage, -1);
        const [shortTop, shortBottom] = getPriceBucket(shortLiqPrice, scale);

        addLevel(
          shorts,
          {
            priceTop: shortTop,
            priceBottom: shortBottom,
            contracts: shortContracts,
            timestamp: bar.timestamp,
            direction: -1,
          },
          config.maxLevels,
        );

        if (disp > 0) {
          const longContracts = bar.oiDelta * disp * weight;
          const longLiqPrice = getLiqPrice(lowSrc, leverage, 1);
          const [longTop, longBottom] = getPriceBucket(longLiqPrice, scale);

          addLevel(
            longs,
            {
              priceTop: longTop,
              priceBottom: longBottom,
              contracts: longContracts,
              timestamp: bar.timestamp,
              direction: 1,
            },
            config.maxLevels,
          );
        }
      }
    }

    squeezeLevels(longs, bar.low, bar.high);
    squeezeLevels(shorts, bar.low, bar.high);
  }

  const allPrices = [
    ...longs.levels.map((l) => l.priceTop),
    ...longs.levels.map((l) => l.priceBottom),
    ...shorts.levels.map((l) => l.priceTop),
    ...shorts.levels.map((l) => l.priceBottom),
    ...bars.map((b) => b.high),
    ...bars.map((b) => b.low),
  ];

  const priceRange: [number, number] = [Math.min(...allPrices), Math.max(...allPrices)];

  return {
    longs: longs.levels,
    shorts: shorts.levels,
    currentPrice,
    priceRange,
  };
}

export function getMaxContracts(levels: LiquidationLevel[]): number {
  if (levels.length === 0) return 0;
  return Math.max(...levels.map((l) => l.contracts));
}

export function getNormalizedIntensity(contracts: number, maxContracts: number): number {
  if (maxContracts === 0) return 0;
  return contracts / maxContracts;
}
