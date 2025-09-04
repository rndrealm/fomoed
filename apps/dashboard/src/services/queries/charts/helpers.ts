import { LiquidationBar, LiquidExchangeResponse, LiquidMapDataResponse } from "./types";
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

export const formatLiquidationData = (liquidResponse: LiquidMapDataResponse) => {
  const combinedLiqData: Record<number, [number, number, number, null][]> = {};
  const liquidationData = liquidResponse.liquidationData.data.data;
  const pairMarketData = liquidResponse.pairMarketData;
  let currentPrice = null;
  
  for (const [price, arrays] of Object.entries(liquidationData)) {
    const price_ = parseFloat(price);

    if (combinedLiqData[price_]) {
      combinedLiqData[price_].push(...(arrays as any));
    } else {
      combinedLiqData[price_] = arrays as any;
    }
  }

  if (currentPrice === null) {
    currentPrice = pairMarketData.current_price;
  }

  const prices = Object.keys(combinedLiqData).map((i) => parseFloat(i));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const sparseLiqBars = [];

  // Extract liquidation bars
  for (const [price, arrays] of Object.entries(combinedLiqData)) {
    const price_ = parseFloat(price);

    for (const point of arrays as any) {
      const [_, liqLevel, levRatio, null_] = point;

      const liqBar: LiquidationBar = {
        x: price_,
        y: liqLevel,
        color: getLiqBarColorFromLevRatio(levRatio),
      };

      sparseLiqBars.push(liqBar);
    }
  }

  // Sort the liqBars, important
  sparseLiqBars.sort((a, b) => a.x - b.x);

  const liqBars: LiquidationBar[] = [...sparseLiqBars];

  const cumulativeLongLiqLeverage: { x: number; y: number }[] = [];
  const cumulativeShortLiqLeverage: { x: number; y: number }[] = [];
  const lastCurrPriceIdx = liqBars.findLastIndex((i) => i.x < currentPrice) + 1;

  // Long cumulative 
  let cumulativeLongLiqLeverageAcc = 0;
  const longBars = liqBars.slice(lastCurrPriceIdx);

  for (const liqBar of longBars) {
    cumulativeLongLiqLeverageAcc += liqBar.y;
    cumulativeLongLiqLeverage.push({
      x: liqBar.x,
      y: Math.round(cumulativeLongLiqLeverageAcc),
    });
  }

  // Short cumulative
  let cumulativeShortLiqLeverageAcc = 0;
  const shortBars = liqBars.slice(0, lastCurrPriceIdx).toReversed();

  for (const liqBar of shortBars) {
    cumulativeShortLiqLeverageAcc += liqBar.y;
    cumulativeShortLiqLeverage.push({
      x: liqBar.x,
      y: Math.round(cumulativeShortLiqLeverageAcc),
    });
  }

  // Sort short cumulative by x-value for proper line rendering
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

  const minPrices = [];
  const maxPrices = [];

  for (const ex in exLiqData) {
    const exPrices = Object.keys(exLiqData[ex as keyof typeof exLiqData]).map((i) => parseInt(i));

    minPrices.push(Math.min(...exPrices));
    maxPrices.push(Math.max(...exPrices));
  }

  const minPrice = Math.min(...minPrices);
  const maxPrice = Math.max(...maxPrices);

  if (minPrice === Infinity) {
    // No data
    return null;
  }

  const cumulativeLongLiqLeverage: { x: number; y: number }[] = [];
  const cumulativeShortLiqLeverage: { x: number; y: number }[] = [];

  let cumulativeLongLiqLeverageAcc = 0;
  for (const price of range(Math.ceil(currentPriceUsd), maxPrice + 1)) {
    const accBefore = cumulativeLongLiqLeverageAcc;

    for (const ex in exLiqData) {
      cumulativeLongLiqLeverageAcc += exLiqData[ex as keyof typeof exLiqData][price] || 0;
    }
    if (cumulativeLongLiqLeverageAcc === accBefore) {
      continue;
    }

    cumulativeLongLiqLeverage.push({
      x: price,
      y: Math.round(cumulativeLongLiqLeverageAcc),
    });
  }

  let cumulativeShortLiqLeverageAcc = 0;

  for (const price of range(Math.ceil(currentPriceUsd), minPrice - 1, -1)) {
    const accBefore = cumulativeShortLiqLeverageAcc;

    for (const ex in exLiqData) {
      cumulativeShortLiqLeverageAcc += exLiqData[ex as keyof typeof exLiqData][price] || 0;
    }

    if (cumulativeShortLiqLeverageAcc === accBefore) {
      continue;
    }

    cumulativeShortLiqLeverage.push({
      x: price,
      y: Math.round(cumulativeShortLiqLeverageAcc),
    });
  }

  const exToBarColor: Record<string, string> = {
    Binance: "#FF8300",
    OKX: "#FFC403",
    Bybit: "#73D8DA",
  };

  const combinedLiqBars: LiquidationBar[] = [];

  for (const price of range(minPrice, maxPrice + 1)) {
    const liqValues = [
      { ex: "Binance", liqValue: exLiqData["Binance"][price] },
      { ex: "OKX", liqValue: exLiqData["OKX"][price] },
      { ex: "Bybit", liqValue: exLiqData["Bybit"][price] },
    ];
    const maxLiq = maxBy(liqValues, (i) => i.liqValue);

    if (!maxLiq) {
      continue;
    }

    const color = exToBarColor[maxLiq.ex];

    combinedLiqBars.push({
      color,
      x: price,
      y: sumBy(liqValues, (i) => i.liqValue),
    });
  }
  return {
    cumulativeLongLiqLeverage,
    cumulativeShortLiqLeverage,
    liqBars: combinedLiqBars,
    currentPrice: currentPriceUsd,
    minPrice,
    maxPrice,
    maxCumulativeValue: maxBy([...cumulativeLongLiqLeverage, ...cumulativeShortLiqLeverage], (i) => i.y)?.y || 0,
  };
};
