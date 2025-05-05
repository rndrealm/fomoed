import {
  FourGridPanes,
  FourHorizontalPanes,
  FourVerticalPanes,
  ILayoutSvgProps,
  SinglePane,
  ThreeHorizontalPanes,
  ThreeVerticalPanes,
  TwoHorizontalPanes,
  TwoVerticalPanes,
} from "@/components/icons/LayoutOptions";
import React from "react";
import dashboard from "./assets/dashboard";
import DetailedCfgiWidget from "@/components/widgets/cfgi/detailed-cfgi/detailed-cfgi-widget";
import SimpleCfgiWidget from "@/components/widgets/cfgi/simple-cfgi/simple-cfgi-widget";
import LiquidationWidget from "@/components/widgets/liquidation-map/liquidation/liquidation-widget";
import LiquidationHeatmapWidget from "@/components/widgets/liquidation-map/liquidation-heatmap/liquidation-heatmap-widget";
import LiquidationExchangeWidget from "@/components/widgets/liquidation-map/liquidation-exchange/liquidation-exchange-widget";
import { LayoutType } from "./atoms/layoutAtom";
import {
  CFGI_SUPPORTED_PERIODS_ENUM,
  liquidHeatMapTimeframeOptions,
  liquidTimeframeOptions,
} from "@/constant/cfgi-data";

export const layoutClassMap = {
  SinglePane: "grid-rows-1 grid-cols-1",
  TwoVerticalPanes: "grid-rows-1 grid-cols-2",
  TwoHorizontalPanes: "grid-rows-2 grid-cols-1",
  ThreeVerticalPanes: "grid-rows-1 grid-cols-3",
  ThreeHorizontalPanes: "grid-rows-3 grid-cols-1",
  FourVerticalPanes: "grid-rows-1 grid-cols-4",
  FourHorizontalPanes: "grid-rows-4 grid-cols-1",
  FourGridPanes: "grid-rows-2 grid-cols-2",
};

export const layoutCountMap = {
  SinglePane: 1,
  TwoVerticalPanes: 2,
  TwoHorizontalPanes: 2,
  ThreeVerticalPanes: 3,
  ThreeHorizontalPanes: 3,
  FourVerticalPanes: 4,
  FourHorizontalPanes: 4,
  FourGridPanes: 4,
};

type LayoutName = keyof typeof layoutClassMap;

type LayoutOptions = {
  id: number;
  options: {
    id: number;
    svg: (props: ILayoutSvgProps) => React.JSX.Element;
    name: LayoutName;
  }[];
};

export const layoutOptions: LayoutOptions[] = [
  { id: 1, options: [{ id: 1, svg: SinglePane, name: "SinglePane" }] },

  {
    id: 2,
    options: [
      { id: 1, svg: TwoVerticalPanes, name: "TwoVerticalPanes" },
      { id: 2, svg: TwoHorizontalPanes, name: "TwoHorizontalPanes" },
    ],
  },

  {
    id: 3,
    options: [
      { id: 1, svg: ThreeVerticalPanes, name: "ThreeVerticalPanes" },
      { id: 2, svg: ThreeHorizontalPanes, name: "ThreeHorizontalPanes" },
    ],
  },

  {
    id: 4,
    options: [
      { id: 1, svg: FourVerticalPanes, name: "FourVerticalPanes" },
      { id: 2, svg: FourHorizontalPanes, name: "FourHorizontalPanes" },
      { id: 3, svg: FourGridPanes, name: "FourGridPanes" },
    ],
  },
];

export const layoutOptionsMap = [
  {
    id: 1,
    name: "Crypto Fear and Greed Map",
    slug: "detailed-cfgi",
    image: dashboard.cfgi,
  },
  {
    id: 2,
    name: "Simplify Crypto Fear and Greed Map",
    slug: "simple-cfgi",
    image: dashboard.simpleCfgi,
  },
  {
    id: 3,
    name: "Liquidation Map",
    slug: "liquidation-map",
    image: dashboard.liq,
  },
  {
    id: 4,
    name: "Liquidation Heat Map",
    slug: "liquidation-heat-map",
    image: dashboard.liqHeat,
  },
  {
    id: 5,
    name: "Exchange Liquidation Map",
    slug: "exchange-liquidation-map",
    image: dashboard.exLiq,
  },
];

export type LayoutOptionType = typeof layoutOptionsMap;

// An object that maps chart types to their respective components and extra props including the widget data
export const chartsMap = {
  "detailed-cfgi": {
    name: "Crypto Fear and Greed Map",
    extra: ["period", "token", "chart-tab", "exchange-token"],
    component: (widget: LayoutType["widgets"][0]) => (
      <DetailedCfgiWidget widget={widget} />
    ),
  },
  "simple-cfgi": {
    name: "Simplified Crypto Fear and Greed Map",
    extra: ["period", "token"],
    component: (widget: LayoutType["widgets"][0]) => (
      <SimpleCfgiWidget widget={widget} />
    ),
  },
  "liquidation-map": {
    name: "Liquidation Map",
    extra: ["period", "token", "exchange-token"],
    component: (widget: LayoutType["widgets"][0]) => (
      <LiquidationWidget widget={widget} />
    ),
  },
  "liquidation-heat-map": {
    name: "Liquidation Heat Map",
    extra: ["period", "token", "exchange-token"],
    component: (widget: LayoutType["widgets"][0]) => (
      <LiquidationHeatmapWidget widget={widget} />
    ),
  },
  "exchange-liquidation-map": {
    name: "Exchange Liquidation Map",
    extra: ["period", "token", "exchange-token"],
    component: (widget: LayoutType["widgets"][0]) => (
      <LiquidationExchangeWidget widget={widget} />
    ),
  },
};

export const widgetIdJoin = "@/$";

export const exchangePairDefault = {
  label: "Binance BTC/USDT",
  value: {
    instrumentId: "BTCUSDT",
    baseAsset: "BTC",
    quoteAsset: "USDT",
    exchange: "Binance",
    symbol: "BTCUSDT",
  },
};

export const widgetPropsDefaults = {
  "detailed-cfgi": {
    token: "BTC",
    period: CFGI_SUPPORTED_PERIODS_ENUM.DAY1 as string,
    exchange_token: exchangePairDefault.label,
    sentiment_tab: "both",
  },
  "simple-cfgi": {
    token: "BTC",
    period: CFGI_SUPPORTED_PERIODS_ENUM.DAY1 as string,
  },
  "liquidation-map": {
    token: "BTC",
    period: liquidTimeframeOptions[0].value,
    exchange_token: exchangePairDefault.label,
  },
  "liquidation-heat-map": {
    token: "BTC",
    period: liquidHeatMapTimeframeOptions[0].value,
    exchange_token: exchangePairDefault.label,
  },
  "exchange-liquidation-map": {
    token: "BTC",
    period: liquidTimeframeOptions[0].value,
  },
};
