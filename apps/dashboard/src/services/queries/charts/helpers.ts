import { LiquidationBar, LeverageLiquidationResponse, LiquidExchangeResponse, LiquidMapDataResponse } from "./types";
import { range, maxBy, sumBy } from "lodash-es";

function getLiqBarColorFromLevRatio(leverage: number) {
  if (leverage === 100) {
    return "#ff5e00ff";
  }

  if (leverage === 50) {
    return "#FFC403";
  }

  if (leverage === 25) {
    return "#73D8DA";
  }

  if (leverage === 10) {
    return "#6EC2F0";
  }

  return "#0000";
}

const getPriceBucketSize = (currentPrice: number): number => {
  if (currentPrice >= 10000) return 78; 
  if (currentPrice >= 1000) return 3;  
  if (currentPrice >= 100) return 0.5;  
  if (currentPrice >= 10) return 0.02;  
  return 0.002; 
};

const bucketPrice = (price: number, bucketSize: number): number => {
  return Math.floor(price / bucketSize) * bucketSize;
};

export const formatLiquidationData = (liquidResponse: LiquidMapDataResponse) => {
  const liquidationData = liquidResponse.liquidationData.data.data;
  const pairMarketData = liquidResponse.pairMarketData;
  let currentPrice = null;

  if (currentPrice === null) {
    currentPrice = pairMarketData.current_price;
  }

  const bucketSize = getPriceBucketSize(currentPrice);

  const combinedLiqData: Record<number, [number, number, number, null][]> = {};
  
  for (const [price, arrays] of Object.entries(liquidationData)) {
    const price_ = parseFloat(price);
    const bucketedPrice = bucketPrice(price_, bucketSize);

    if (combinedLiqData[bucketedPrice]) {
      combinedLiqData[bucketedPrice].push(...(arrays as [number, number, number, null][]));
    } else {
      combinedLiqData[bucketedPrice] = arrays as [number, number, number, null][];
    }
  }

  const bucketedPrices = Object.keys(combinedLiqData).map((i) => parseFloat(i));
  const minPrice = Math.min(...bucketedPrices);
  const maxPrice = Math.max(...bucketedPrices);

  const sparseLiqBars = [];

  for (const [bucketedPrice, arrays] of Object.entries(combinedLiqData)) {
    const price_ = parseFloat(bucketedPrice);

    for (const point of arrays) {
      const [_, liqLevel, levRatio, null_] = point;

      const liqBar: LiquidationBar = {
        x: price_,
        y: liqLevel,
        color: getLiqBarColorFromLevRatio(levRatio),
      };

      sparseLiqBars.push(liqBar);
    }
  }

  sparseLiqBars.sort((a, b) => a.x - b.x);

  const liqBars: LiquidationBar[] = [...sparseLiqBars];

  const cumulativeLongLiqLeverage: { x: number; y: number }[] = [];
  const cumulativeShortLiqLeverage: { x: number; y: number }[] = [];
  const lastCurrPriceIdx = liqBars.findLastIndex((i) => i.x < currentPrice) + 1;

  let cumulativeLongLiqLeverageAcc = 0;
  const longBars = liqBars.slice(lastCurrPriceIdx);

  for (const liqBar of longBars) {
    cumulativeLongLiqLeverageAcc += liqBar.y;
    cumulativeLongLiqLeverage.push({
      x: liqBar.x,
      y: Math.round(cumulativeLongLiqLeverageAcc),
    });
  }

  let cumulativeShortLiqLeverageAcc = 0;
  const shortBars = liqBars.slice(0, lastCurrPriceIdx).toReversed();

  for (const liqBar of shortBars) {
    cumulativeShortLiqLeverageAcc += liqBar.y;
    cumulativeShortLiqLeverage.push({
      x: liqBar.x,
      y: Math.round(cumulativeShortLiqLeverageAcc),
    });
  }

  cumulativeShortLiqLeverage.sort((a, b) => a.x - b.x);

  return {
    liqBars: liqBars,
    currentPrice,
    cumulativeLongLiqLeverage,
    cumulativeShortLiqLeverage,
    maxCumulativeValue: Math.max(
      cumulativeLongLiqLeverageAcc, 
      cumulativeShortLiqLeverageAcc,
      1
    ),
    minPrice,
    maxPrice,
  };
};

export const formatMergetLiquidMapData = (resData: LiquidExchangeResponse) => {
  const exLiqData = resData.exLiqData;
  const currentPriceUsd = resData.currentPriceUsd;

  const exToBarColor: Record<string, string> = {
    Binance: "#FF8300",
    OKX: "#FFC403", 
    Bybit: "#73D8DA",
  };

  const allPrices = new Set<number>();
  
  for (const ex in exLiqData) {
    for (const priceStr in exLiqData[ex as keyof typeof exLiqData]) {
      allPrices.add(parseFloat(priceStr)); 
    }
  }

  const prices = Array.from(allPrices).sort((a, b) => a - b);
  
  if (prices.length === 0) {
    return null;
  }

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const combinedLiqBars: LiquidationBar[] = [];

  for (const price of prices) {
    const liqValues = [
      { ex: "Binance", liqValue: exLiqData["Binance"][price] || 0 },
      { ex: "OKX", liqValue: exLiqData["OKX"][price] || 0 },
      { ex: "Bybit", liqValue: exLiqData["Bybit"][price] || 0 },
    ];

    const totalLiquidation = sumBy(liqValues, (i) => i.liqValue);
    
    if (totalLiquidation === 0) continue;

    const maxLiq = maxBy(liqValues, (i) => i.liqValue);
    const color = maxLiq ? exToBarColor[maxLiq.ex] : "#FF8300";

    combinedLiqBars.push({
      color,
      x: price,
      y: totalLiquidation,
    });
  }

  const cumulativeLongLiqLeverage: { x: number; y: number }[] = [];
  const cumulativeShortLiqLeverage: { x: number; y: number }[] = [];

  const longPrices = prices.filter(p => p >= currentPriceUsd).sort((a, b) => a - b);
  const shortPrices = prices.filter(p => p < currentPriceUsd).sort((a, b) => b - a);

  let cumulativeLongLiqLeverageAcc = 0;
  for (const price of longPrices) {
    const totalAtPrice = combinedLiqBars.find(bar => bar.x === price)?.y || 0;
    if (totalAtPrice > 0) {
      cumulativeLongLiqLeverageAcc += totalAtPrice;
      cumulativeLongLiqLeverage.push({
        x: price,
        y: Math.round(cumulativeLongLiqLeverageAcc),
      });
    }
  }

  let cumulativeShortLiqLeverageAcc = 0;
  for (const price of shortPrices) {
    const totalAtPrice = combinedLiqBars.find(bar => bar.x === price)?.y || 0;
    if (totalAtPrice > 0) {
      cumulativeShortLiqLeverageAcc += totalAtPrice;
      cumulativeShortLiqLeverage.push({
        x: price,
        y: Math.round(cumulativeShortLiqLeverageAcc),
      });
    }
  }

  cumulativeShortLiqLeverage.sort((a, b) => a.x - b.x);

  return {
    cumulativeLongLiqLeverage,
    cumulativeShortLiqLeverage,
    liqBars: combinedLiqBars,
    currentPrice: currentPriceUsd,
    minPrice,
    maxPrice,
    maxCumulativeValue: Math.max(
      cumulativeLongLiqLeverageAcc,
      cumulativeShortLiqLeverageAcc,
      1
    ),
  };
};

type LiquidationPoint = [number, number, number, null]; 
type CombinedLiqData = Record<string, LiquidationPoint[]>;

const getAggPriceBucketSize = (currentPrice: number): number => {
  if (currentPrice >= 10000) return 116; 
  if (currentPrice >= 1000) return 4.8;  
  if (currentPrice >= 100) return 0.9;  
  if (currentPrice >= 10) return 0.03;  
  return 0.003; 
};

const bucketAggPrice = (price: number, bucketSize: number): number => {
  return Math.floor(price / bucketSize) * bucketSize;
};

export const formatLeverageLiquidationData = (resData: LeverageLiquidationResponse) => {
  const combinedLiqData = resData.combinedLiqData;
  const currentPriceUsd = resData.currentPriceUsd;

  const prices = Object.keys(combinedLiqData).map((i) => parseFloat(i));
  
  if (prices.length === 0) {
    return null;
  }

  const bucketSize = getAggPriceBucketSize(currentPriceUsd);
  
  const bucketedData: Record<number, LiquidationPoint[]> = {};
  
  for (const [price, arrays] of Object.entries(combinedLiqData)) {
    const price_ = parseFloat(price);
    const bucketedPrice = bucketAggPrice(price_, bucketSize);
    
    if (bucketedData[bucketedPrice]) {
      bucketedData[bucketedPrice].push(...arrays);
    } else {
      bucketedData[bucketedPrice] = [...arrays];
    }
  }

  const bucketedPrices = Object.keys(bucketedData).map((i) => parseFloat(i));
  const minPrice = Math.min(...bucketedPrices);
  const maxPrice = Math.max(...bucketedPrices);

  const sparseLiqBars = [];

  for (const [bucketedPrice, arrays] of Object.entries(bucketedData)) {
    const price_ = parseFloat(bucketedPrice);

    for (const point of arrays) {
      const [_, liqLevel, leverageRatio] = point;

      const liqBar = {
        x: price_,
        y: liqLevel,
        color: getLiqBarColorFromLevRatio(leverageRatio),
      };

      sparseLiqBars.push(liqBar);
    }
  }

  sparseLiqBars.sort((a, b) => a.x - b.x);

  const liqBars = [...sparseLiqBars];

  const cumulativeLongLiqLeverage = [];
  const cumulativeShortLiqLeverage = [];
  
  const lastCurrPriceIdx = liqBars.findLastIndex((i) => i.x < currentPriceUsd) + 1;

  let cumulativeLongLiqLeverageAcc = 0;
  const longBars = liqBars.slice(lastCurrPriceIdx);

  for (const liqBar of longBars) {
    cumulativeLongLiqLeverageAcc += liqBar.y;
    cumulativeLongLiqLeverage.push({
      x: liqBar.x,
      y: Math.round(cumulativeLongLiqLeverageAcc),
    });
  }

  let cumulativeShortLiqLeverageAcc = 0;
  const shortBars = liqBars.slice(0, lastCurrPriceIdx).reverse();

  for (const liqBar of shortBars) {
    cumulativeShortLiqLeverageAcc += liqBar.y;
    cumulativeShortLiqLeverage.push({
      x: liqBar.x,
      y: Math.round(cumulativeShortLiqLeverageAcc),
    });
  }

  cumulativeShortLiqLeverage.sort((a, b) => a.x - b.x);

  return {
    liqBars: liqBars,
    currentPrice: currentPriceUsd,
    cumulativeLongLiqLeverage,
    cumulativeShortLiqLeverage,
    maxCumulativeValue: Math.max(
      cumulativeLongLiqLeverageAcc, 
      cumulativeShortLiqLeverageAcc,
      1
    ),
    minPrice,
    maxPrice,
  };
};
