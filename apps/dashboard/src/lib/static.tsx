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
import TokenNewsWidget from "@/components/widgets/news/token-news/token-news-widget";
import DexWidget from "@/components/widgets/dex/dex-widget";
import CignalsWidget from "@/components/widgets/cignals/cignals-widget";
import CryptocurrencyMarket from "@/components/widgets/cryptocurrency-market/cryptocurrency-market";
import PriceHistory from "@/components/widgets/price-history/price-history";
import Heatmap from "@/components/widgets/heatmap/heatmap";
import NewPriceHistory from "@/components/widgets/price-history/new-price-history";
import { pricePeriodOptions } from "@/constant";
import Dominance from "@/components/widgets/dominance/dominance";
import OrderBook from "@/components/widgets/order-book/order-book";
import { Tour } from "nextstepjs";
import CoinStats from "@/components/widgets/coin-stats/coin-stats";
import SummaryWidget from "@/components/widgets/summary/summary-widget";
import CFGI from "@/components/widgets/cfgi/fear-and-greed/cfgi";
import Screener from "@/components/widgets/screener/screener";
import widgetsPreview from "./assets/widgetsPreview";
import { StaticImageData } from "next/image";
import NewsWidget from "@/components/widgets/news/token-news/news";

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
  // {
  //   name: "Token Price History",
  //   slug: "token-price-history",
  //   image: dashboard.simple,
  //   category: "charts",
  //   tags: ["charts", "new"],
  // },
  {
    id: 8,
    name: "Cignals Chart",
    slug: "cignals-chart",
    image: dashboard.footprint,
    category: "charts",
    tags: ["charts", "new"],
  },
  // {
  //   id: 7,
  //   name: "Cryptocurrency Market",
  //   slug: "cryptocurrency-market",
  //   image: dashboard.simple,
  //   category: "charts",
  //   tags: ["charts", "new"],
  // },
  {
    id: 7,
    name: "Dex",
    slug: "dex",
    image: dashboard.dex,
    category: "charts",
    tags: ["new", "charts"],
  },

  {
    id: 112,
    name: "New Price History",
    slug: "new-price-history",
    image: dashboard.tokenHistory,
    category: "charts",
    tags: ["charts", "new"],
  },

  {
    id: 113,
    name: "BTC Dominance",
    slug: "btc-dominance",
    image: dashboard.bitcoinDominance,
    category: "charts",
    tags: ["charts", "new"],
  },

  {
    id: 114,
    name: "Order Book",
    slug: "order-book",
    image: dashboard.orderBook,
    category: "charts",
    tags: ["charts", "new"],
  },
  {
    id: 115,
    name: "Coin Stats",
    slug: "coin-stats",
    image: dashboard.coinStats,
    category: "charts",
    tags: ["charts", "new"],
  },

  {
    id: 116,
    name: "Summary",
    slug: "summary",
    image: dashboard.summary,
    category: "charts",
    tags: ["charts", "new"],
  },

  // {
  //   id: 117,
  //   name: "CFGI",
  //   slug: "cfgi",
  //   image: dashboard.cfgi3,
  //   category: "charts",
  //   tags: ["charts", "new"],
  // },

  {
    id: 18,
    name: "Screener",
    slug: "screener",
    image: dashboard.screener,
    category: "charts",
    tags: ["new"],
  },

  {
    id: 6,
    name: "Token News",
    slug: "token-news",
    image: dashboard.newsWidget,
    category: "news",
    tags: ["news", "new"],
  },
  {
    id: 4,
    name: "Liquidation Heat Map",
    slug: "liquidation-heat-map",
    image: dashboard.heat,
    category: "charts",
    tags: ["charts"],
  },
  {
    id: 5,
    name: "Exchange Liquidation Map",
    slug: "exchange-liquidation-map",
    image: dashboard.cfgi2,
    category: "charts",
    tags: ["charts"],
  },
  {
    id: 3,
    name: "Liquidation Map",
    slug: "liquidation-map",
    image: dashboard.cfgi2,
    category: "charts",
    tags: ["charts"],
  },
  // {
  //   id: 2,
  //   name: "Simplified Crypto Fear and Greed Map",
  //   slug: "simple-cfgi",
  //   image: dashboard.simple,
  //   category: "charts",
  //   tags: ["charts"],
  // },
  // {
  //   id: 1,
  //   name: "Crypto Fear and Greed Map",
  //   slug: "detailed-cfgi",
  //   image: dashboard.cfgi,
  //   category: "charts",
  //   tags: ["charts"],
  // },

  // {
  //   id: 10,
  //   name: "Heatmap",
  //   slug: "heatmap",
  //   image: dashboard.cfgi,
  //   category: "charts",
  //   tags: ["charts"],
  // },
];

export type LayoutOptionType = typeof layoutOptionsMap;

// An object that maps chart types to their respective components and extra props including the widget data
export const chartsMap = {
  "detailed-cfgi": {
    name: "Crypto Fear and Greed Map",
    extra: ["period", "token", "chart-tab", "exchange-token"],
    component: (widget: LayoutType["widgets"][0]) => <DetailedCfgiWidget widget={widget} fullScreenButton />,
  },
  "simple-cfgi": {
    name: "Simplified Crypto Fear and Greed Map",
    extra: ["period", "token"],
    component: (widget: LayoutType["widgets"][0]) => <SimpleCfgiWidget widget={widget} fullScreenButton />,
  },
  "liquidation-map": {
    name: "Liquidation Map",
    extra: ["period", "token", "exchange-token"],
    component: (widget: LayoutType["widgets"][0]) => <LiquidationWidget widget={widget} fullScreenButton />,
  },
  "liquidation-heat-map": {
    name: "Liquidation Heat Map",
    extra: ["period", "token", "exchange-token"],
    component: (widget: LayoutType["widgets"][0]) => <LiquidationHeatmapWidget widget={widget} fullScreenButton />,
  },
  "exchange-liquidation-map": {
    name: "Exchange Liquidation Map",
    extra: ["period", "token", "exchange-token"],
    component: (widget: LayoutType["widgets"][0]) => <LiquidationExchangeWidget widget={widget} fullScreenButton />,
  },
  "token-news": {
    name: "Token News",
    extra: ["token"],
    component: (widget: LayoutType["widgets"][0]) => <NewsWidget widget={widget} />,
  },
  dex: {
    name: "Dex",
    extra: [""],
    component: (widget: LayoutType["widgets"][0]) => <DexWidget widget={widget} />,
  },
  "cignals-chart": {
    name: "Cignals Chart",
    extra: [""],
    component: (widget: LayoutType["widgets"][0]) => <CignalsWidget widget={widget} />,
  },
  "cryptocurrency-market": {
    name: "Cryptocurrency Market",
    extra: [""],
    component: (widget: LayoutType["widgets"][0]) => <CryptocurrencyMarket widget={widget} />,
  },
  "token-price-history": {
    name: "Token Price History",
    extra: [""],
    component: (widget: LayoutType["widgets"][0]) => <PriceHistory widget={widget} />,
  },
  heatmap: {
    name: "Token Price History",
    extra: [""],
    component: (widget: LayoutType["widgets"][0]) => <Heatmap widget={widget} />,
  },
  "new-price-history": {
    name: "New Price History",
    extra: ["period", "token"],
    component: (widget: LayoutType["widgets"][0]) => <NewPriceHistory widget={widget} />,
  },
  "btc-dominance": {
    name: "BTC Dominance",
    extra: [""],
    component: (widget: LayoutType["widgets"][0]) => <Dominance widget={widget} />,
  },

  "order-book": {
    name: "Order Book",
    extra: ["token"],
    component: (widget: LayoutType["widgets"][0]) => <OrderBook widget={widget} />,
  },

  "coin-stats": {
    name: "Coin Stats",
    extra: [""],
    component: (widget: LayoutType["widgets"][0]) => <CoinStats widget={widget} />,
  },

  summary: {
    name: "Summary",
    extra: [""],
    component: (widget: LayoutType["widgets"][0]) => <SummaryWidget widget={widget} />,
  },

  cfgi: {
    name: "CFGI",
    extra: ["token"],
    component: (widget: LayoutType["widgets"][0]) => <CFGI widget={widget} />,
  },

  screener: {
    name: "Screener",
    extra: [""],
    component: (widget: LayoutType["widgets"][0]) => <Screener widget={widget} />,
  },
};

export const widgetIdJoin = "@/$";

export const exchangePairDefault = {
  label: "Binance BTC/USDT",
  value: {
    instrument_id: "BTCUSDT",
    base_asset: "BTC",
    quote_asset: "USDT",
    exchange: "Binance",
    symbol: "BTCUSDT",
    onboard_date: Date.now(),
  },
};

export const widgetPropsDefaults = {
  "detailed-cfgi": {
    token: "BTC",
    period: CFGI_SUPPORTED_PERIODS_ENUM.DAY1 as string,
    exchange_token: exchangePairDefault.label,
    sentiment_tab: "both",
    meta: {
      w: 8,
      h: 4,
      minW: 8,
      minH: 4,
      maxW: Infinity,
      maxH: Infinity,
    },
  },
  "simple-cfgi": {
    token: "BTC",
    period: CFGI_SUPPORTED_PERIODS_ENUM.DAY1 as string,
    meta: {
      w: 8,
      h: 4,
      minW: 8,
      minH: 4,
      maxW: Infinity,
      maxH: Infinity,
    },
  },
  "liquidation-map": {
    token: "BTC",
    period: liquidTimeframeOptions[0].value,
    exchange_token: exchangePairDefault.label,
    meta: {
      w: 8,
      h: 4,
      minW: 8,
      minH: 4,
      maxW: Infinity,
      maxH: Infinity,
    },
  },
  "liquidation-heat-map": {
    token: "BTC",
    period: liquidHeatMapTimeframeOptions[0].value,
    exchange_token: exchangePairDefault.label,
    meta: {
      w: 8,
      h: 4,
      minW: 8,
      minH: 4,
      maxW: Infinity,
      maxH: Infinity,
    },
  },
  "exchange-liquidation-map": {
    token: "BTC",
    period: liquidTimeframeOptions[0].value,
    meta: {
      w: 8,
      h: 4,
      minW: 8,
      minH: 4,
      maxW: Infinity,
      maxH: Infinity,
    },
  },
  "token-news": {
    token: "BTC",
    meta: {
      w: 4,
      h: 4,
      minW: 4,
      minH: 4,
      maxW: Infinity,
      maxH: Infinity,
    },
  },
  dex: {
    token: "BTC",
    meta: {
      w: 4,
      h: 4,
      minW: 4,
      minH: 4,
      maxW: Infinity,
      maxH: Infinity,
    },
  },
  "cignals-chart": {
    token: "BTC",
    instrument: null,
    timeInterval: "5m",
    priceStep: 10,
    meta: {
      w: 8,
      h: 4,
      minW: 8,
      minH: 4,
      maxW: Infinity,
      maxH: Infinity,
    },
  },
  "cryptocurrency-market": {
    token: "BTC",
    meta: {
      w: 8,
      h: 4,
      minW: 8,
      minH: 4,
      maxW: Infinity,
      maxH: Infinity,
    },
  },

  "token-price-history": {
    token: "BTC",
    meta: {
      w: 8,
      h: 4,
      minW: 8,
      minH: 4,
      maxW: Infinity,
      maxH: Infinity,
    },
  },
  heatmap: {
    token: "BTC",
    meta: {
      w: 8,
      h: 4,
      minW: 8,
      minH: 4,
      maxW: Infinity,
      maxH: Infinity,
    },
  },

  "new-price-history": {
    token: "BTC",
    period: pricePeriodOptions[11].value,
    meta: {
      w: 8,
      h: 4,
      minW: 5,
      minH: 3,
      maxW: Infinity,
      maxH: Infinity,
    },
  },

  "btc-dominance": {
    // token: "BTC",
    // period: pricePeriodOptions[11].value,
    meta: {
      w: 6,
      h: 2,
      minW: 4,
      minH: 2,
      maxW: 8,
      maxH: 2,
    },
  },
  "order-book": {
    token: "BTC",
    // period: pricePeriodOptions[11].value,
    meta: {
      w: 4,
      h: 4,
      minW: 4,
      minH: 4,
      maxW: 6,
      maxH: 6,
    },
  },

  "coin-stats": {
    token: "bitcoin",
    // period: pricePeriodOptions[11].value,
    meta: {
      w: 4,
      h: 4,
      minW: 3,
      minH: 4,
      maxW: 5,
      maxH: 4,
    },
  },

  summary: {
    // token: "BTC",
    // period: pricePeriodOptions[11].value,
    meta: {
      w: 6,
      h: 2,
      minW: 5,
      minH: 2,
      maxW: 6,
      maxH: 2,
    },
  },

  cfgi: {
    token: "BTC",
    // period: pricePeriodOptions[11].value,
    meta: {
      w: 4,
      h: 4,
      minW: 4,
      minH: 4,
      maxW: 4,
      maxH: 4,
    },
  },

  screener: {
    meta: {
      w: 8,
      h: 4,
      minW: 6,
      minH: 2,
      maxW: Infinity,
      maxH: Infinity,
    },
  },
};

export const tourSteps = [
  {
    tour: "mainTour",
    steps: [
      {
        icon: "👋",
        selector: "#first-step",
        content: "Click here to add a new widget to your dashboard.",
        title: "Adding a New Widget",
        side: "bottom",
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 10,
      },
      {
        icon: "👋",
        selector: "#second-step",
        content: "Pick a widget to add to your dashboard. You can start with the ** widget if you’re not sure",
        title: "Pick a Widget",
        side: "left",
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 10,
      },
      {
        icon: "👋",
        selector: "#third-step",
        content: "Click this ‘Save’ icon to lock in your layout so you can always return to it.",
        title: "Looks good! Now Save Your Layout",
        side: "bottom-right",
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 10,
      },
      {
        icon: "👋",
        selector: "#fourth-step",
        content: "You can now name your layout. This will help you identify it later.",
        title: "Name your layout",
        side: "left",
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 10,
      },
      {
        icon: "👋",
        selector: "#fifth-step",
        content: "Click here to view all your saved layouts, you can switch between them or create new ones anytime",
        title: "Access Saved Layouts Anytime",
        side: "bottom-right",
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 10,
      },
    ],
  },
] satisfies Tour[];

export type WidgetPreviewItem = {
  id: number;
  descripton: string;
  img: StaticImageData;
  name: string;
  slug: string;
  size: "sm" | "md" | "lg";
};

type IWidgetPreviewData = {
  id: number;
  group: string;
  options: WidgetPreviewItem[];
};

export const widgetPreviewData: IWidgetPreviewData[] = [
  {
    id: 1,
    group: "Charts",
    options: [
      {
        id: 1,
        descripton: "Get a quick overview of top movers & losers within the space",
        img: widgetsPreview.summary,
        name: "Summary",
        slug: "summary",
        size: "sm",
      },

      {
        id: 2,
        descripton: "Coins and Tokens alll at your fingertips everytime.",
        img: widgetsPreview.screener,
        name: "Screener",
        slug: "screener",
        size: "lg",
      },

      {
        id: 3,
        descripton: "Live token swaps, volume, and trading pairs.",
        img: widgetsPreview.dex,
        name: "Dex",
        slug: "dex",
        size: "md",
      },

      {
        id: 4,
        descripton: "View real-time token prices and trends to help guide your trading decisions.",
        img: widgetsPreview.priceChart,
        name: "Price Chart",
        slug: "new-price-history",
        size: "sm",
      },

      {
        id: 5,
        descripton: "Bitcoins influence and size in the current market",
        img: widgetsPreview.btcDominance,
        name: "BTC Dominance",
        slug: "btc-dominance",
        size: "lg",
      },

      {
        id: 6,
        descripton: "Live token swaps, volume, and trading pairs.",
        img: widgetsPreview.liquidationHeatMap,
        name: "Liquidation Heat Map",
        slug: "liquidation-heat-map",
        size: "md",
      },

      {
        id: 7,
        descripton: "Live token swaps, volume, and trading pairs.",
        img: widgetsPreview.cfgi,
        name: "CFGI",
        slug: "cfgi",
        size: "md",
      },
    ],
  },
];
