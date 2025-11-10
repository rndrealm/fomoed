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
import WeightedSentiment from "@/components/widgets/weighted-sentiment/weighted-sentiment";
import WeightedPriceSentiment from "@/components/widgets/weighted-price-sentiment/weighted-price-sentiment";
import DuckGame from "@/components/widgets/duck-game";
import OrderbookDeltaWidget from "@/components/widgets/delta/delta-widget";
import WhaleTransactionWidget from "@/components/widgets/whale-transaction/whale-transaction-widget";
import TradingEconomicsWidget from "@/components/widgets/trading-economics/economic-calendar-widget";
import GemachCopyTrading from "@/components/widgets/gemach/gemach-copy-trading";

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

const disabledWgSlugs = process.env.NEXT_PUBLIC_DISABLED_WG_SLUGS?.split(",") || [];

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
    name: "Footprint Chart",
    slug: "footprint-chart",
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
    showId: 5,
    name: "DEX",
    slug: "dex",
    description: "Trade directly from your dashboard seamless swaps, real-time prices, and execution built in.",
    image: dashboard.dexV2,
    category: "charts",
    tags: ["new", "charts"],
  },

  {
    id: 112,
    showId: 0,
    name: "Price Chart Widget",
    slug: "new-price-history",
    description: "See price trends unfold in real time, with a clean chart built for clarity.",
    image: dashboard.tokenHistoryV2,
    category: "charts",
    tags: ["charts", "new"],
  },

  {
    id: 113,
    showId: 8,
    name: "Bitcoin Dominance",
    slug: "btc-dominance",
    description: "Track Bitcoin’s market share  a clear view of dominance shaping sentiment.",
    image: dashboard.btcDominanceV2,
    category: "charts",
    tags: ["charts", "new"],
  },

  {
    id: 114,
    showId: 10,
    name: "Order Book",
    slug: "order-book",
    description: "See market depth in real time bids and asks displayed with precision and balance.",
    image: dashboard.orderBookV2,
    category: "charts",
    tags: ["charts", "new"],
  },
  {
    id: 115,
    showId: 6,
    name: "Coin Stats",
    slug: "coin-stats",
    description: "Stay informed at a glance  market cap, volume, and supply, presented with clear precision.",
    image: dashboard.coinStatsV2,
    category: "charts",
    tags: ["charts", "new"],
  },

  {
    id: 116,
    showId: 4,
    name: "Summary",
    slug: "summary",
    description: "Your trading day at a glance key positions, performance, and insights distilled into clarity.",
    image: dashboard.summaryV2,
    category: "charts",
    tags: ["charts", "new"],
  },

  {
    id: 117,
    showId: 1,
    name: "Crypto Fear and Greed Widget",
    slug: "cfgi",
    description: "Measure market sentiment instantly a clear index revealing when fear or greed drives decisions.",
    image: dashboard.cfgiV2,
    category: "charts",
    tags: ["charts", "new"],
  },

  {
    id: 18,
    showId: 3,
    name: "Screener",
    slug: "screener",
    description: "Discover opportunities fast filter tokens by performance, volume, and trend with precision.",
    image: dashboard.screenerV2,
    category: "charts",
    tags: ["new"],
  },

  {
    id: 6,
    showId: 9,
    name: "News",
    slug: "token-news",
    description: "Stay ahead with curated crypto headlines market-moving updates with clarity and focus.",
    image: dashboard.newsV2,
    category: "news",
    tags: ["news", "new"],
  },
  {
    id: 4,
    showId: 7,
    name: "Liquidation Heat Map",
    slug: "liquidation-heat-map",
    description: "Visualize liquidations in real time  spot market pressure zones with clarity andcontext pairs.",
    image: dashboard.heatMapV2,
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
  {
    id: 2,
    name: "Simplified Crypto Fear and Greed Map",
    slug: "simple-cfgi",
    image: dashboard.simple,
    category: "charts",
    tags: ["charts"],
  },

  {
    id: 1,
    name: "Crypto Fear and Greed Map",
    slug: "detailed-cfgi",
    image: dashboard.cfgi,
    category: "charts",
    tags: ["charts"],
  },

  {
    id: 210,
    name: "Weighted Sentiment",
    slug: "weighted-sentiment",
    image: dashboard.weightedSentiment,
    category: "charts",
    tags: ["charts", "new"],
  },

  {
    id: 211,
    name: "Weighted Price Sentiment",
    slug: "weighted-price-sentiment",
    image: dashboard.weightedPriceSentiment,
    category: "charts",
    tags: ["charts", "new"],
  },

  {
    id: 213,
    showId: 2,
    name: "Duck Game",
    slug: "duck-game",
    image: dashboard.duckGame,
    category: "games",
    tags: ["new", "games"],
  },
  {
    id: 212,
    name: "Delta Spread",
    slug: "orderbook-delta",
    image: dashboard.deltaSpread,
    category: "charts",
    tags: ["charts", "new"],
  },

  {
    id: 213,
    name: "Whale Transaction Tracker",
    slug: "whale-transaction-tracker",
    image: dashboard.whaleTracker,
    category: "charts",
    tags: ["charts", "new"],
  },
  {
    id: 214,
    name: "Trading Economics",
    slug: "trading-economics",
    image: dashboard.tradingCalendar,
    category: "charts",
    tags: ["charts", "new", "events"],
  },
  // {
  //   id: 215,
  //   name: "Gemach Copy Trading",
  //   slug: "gemach-copy-trading",
  //   image: dashboard.tradingCalendar,
  //   category: "charts",
  //   tags: ["new"],
  // },

  // {
  //   id: 10,
  //   name: "Heatmap",
  //   slug: "heatmap",
  //   image: dashboard.cfgi,
  //   category: "charts",
  //   tags: ["charts"],
  // },
].filter((i) => !disabledWgSlugs.includes(i.slug));

export type LayoutOptionType = typeof layoutOptionsMap;

// An object that maps chart types to their respective components and extra props including the widget data
export const chartsMap = {
  "detailed-cfgi": {
    name: "Crypto Fear and Greed Map",
    extra: ["period", "token", "chart-tab", "exchange-token"],
    component: (widget: LayoutType["widgets"][0]) => <DetailedCfgiWidget widget={widget} />,
    isResizable: true,
  },
  "simple-cfgi": {
    name: "Simplified Crypto Fear and Greed Map",
    extra: ["period", "token"],
    component: (widget: LayoutType["widgets"][0]) => <SimpleCfgiWidget widget={widget} />,
    isResizable: true,
  },
  "liquidation-map": {
    name: "Liquidation Map",
    extra: ["period", "token", "exchange-token"],
    component: (widget: LayoutType["widgets"][0]) => <LiquidationWidget widget={widget} />,
    isResizable: true,
  },
  "liquidation-heat-map": {
    name: "Liquidation Heat Map",
    extra: ["period", "token", "exchange-token"],
    component: (widget: LayoutType["widgets"][0]) => <LiquidationHeatmapWidget widget={widget} />,
    isResizable: true,
  },
  "exchange-liquidation-map": {
    name: "Exchange Liquidation Map",
    extra: ["period", "token", "exchange-token"],
    component: (widget: LayoutType["widgets"][0]) => <LiquidationExchangeWidget widget={widget} />,
    isResizable: true,
  },
  "token-news": {
    name: "Token News",
    extra: ["token"],
    component: (widget: LayoutType["widgets"][0]) => <NewsWidget widget={widget} />,
    isResizable: true,
  },
  dex: {
    name: "Dex",
    extra: [""],
    component: (widget: LayoutType["widgets"][0]) => <DexWidget widget={widget} />,
    isResizable: true,
  },
  "footprint-chart": {
    name: "Cignals Chart",
    extra: [""],
    component: (widget: LayoutType["widgets"][0]) => <CignalsWidget widget={widget} />,
    isResizable: true,
  },
  "cryptocurrency-market": {
    name: "Cryptocurrency Market",
    extra: [""],
    component: (widget: LayoutType["widgets"][0]) => <CryptocurrencyMarket widget={widget} />,
    isResizable: true,
  },
  "token-price-history": {
    name: "Token Price History",
    extra: [""],
    component: (widget: LayoutType["widgets"][0]) => <PriceHistory widget={widget} />,
    isResizable: true,
  },
  heatmap: {
    name: "Token Price History",
    extra: [""],
    component: (widget: LayoutType["widgets"][0]) => <Heatmap widget={widget} />,
    isResizable: true,
  },
  "new-price-history": {
    name: "New Price History",
    extra: ["period", "token"],
    component: (widget: LayoutType["widgets"][0]) => <NewPriceHistory widget={widget} />,
    isResizable: true,
  },
  "btc-dominance": {
    name: "BTC Dominance",
    extra: [""],
    component: (widget: LayoutType["widgets"][0]) => <Dominance widget={widget} />,
    isResizable: true,
  },

  "order-book": {
    name: "Order Book",
    extra: ["token"],
    component: (widget: LayoutType["widgets"][0]) => <OrderBook widget={widget} />,
    isResizable: true,
  },

  "coin-stats": {
    name: "Coin Stats",
    extra: [""],
    component: (widget: LayoutType["widgets"][0]) => <CoinStats widget={widget} />,
    isResizable: true,
  },

  summary: {
    name: "Summary",
    extra: [""],
    component: (widget: LayoutType["widgets"][0]) => <SummaryWidget widget={widget} />,
    isResizable: true,
  },

  cfgi: {
    name: "CFGI",
    extra: ["token"],
    component: (widget: LayoutType["widgets"][0]) => <CFGI widget={widget} />,
    isResizable: true,
  },

  screener: {
    name: "Screener",
    extra: [""],
    component: (widget: LayoutType["widgets"][0]) => <Screener widget={widget} />,
    isResizable: true,
  },

  "weighted-sentiment": {
    name: "Weighted Sentiment",
    extra: ["period", "token"],
    component: (widget: LayoutType["widgets"][0]) => <WeightedSentiment widget={widget} />,
    isResizable: true,
  },

  "weighted-price-sentiment": {
    name: "Weighted Price Sentiment",
    extra: ["period", "token"],
    component: (widget: LayoutType["widgets"][0]) => <WeightedPriceSentiment widget={widget} />,
    isResizable: true,
  },

  "duck-game": {
    name: "Duck Game",
    extra: [""],
    component: (widget: LayoutType["widgets"][0]) => <DuckGame widget={widget} />,
    isResizable: true,
  },
  "orderbook-delta": {
    name: "Delta Spread",
    extra: ["interval", "range", "token", "exchange_token"],
    component: (widget: LayoutType["widgets"][0]) => <OrderbookDeltaWidget widget={widget} />,
    isResizable: true,
  },
  "whale-transaction-tracker": {
    name: "Whale Transaction Tracker",
    extra: [],
    component: (widget: LayoutType["widgets"][0]) => <WhaleTransactionWidget widget={widget} />,
    isResizable: true,
  },
  "trading-economics": {
    name: "Trading Economics",
    extra: [],
    component: (widget: LayoutType["widgets"][0]) => <TradingEconomicsWidget widget={widget} />,
    isResizable: true,
  },
  "gemach-copy-trading": {
    name: "Gemach Copy Trading",
    extra: [],
    component: (widget: LayoutType["widgets"][0]) => <GemachCopyTrading widget={widget} />,
    isResizable: true,
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
  "footprint-chart": {
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

  "weighted-sentiment": {
    token: "bitcoin",
    period: "1h",
    meta: {
      w: 8,
      h: 4,
      minW: 8,
      minH: 4,
      maxW: Infinity,
      maxH: Infinity,
    },
  },

  "weighted-price-sentiment": {
    token: "bitcoin",
    period: "1h",
    meta: {
      w: 8,
      h: 4,
      minW: 8,
      minH: 4,
      maxW: Infinity,
      maxH: Infinity,
    },
  },

  "duck-game": {
    meta: {
      w: 8,
      h: 4,
      minW: 6,
      minH: 2,
      maxW: Infinity,
      maxH: Infinity,
    },
  },
  "orderbook-delta": {
    token: "BTC",
    interval: "1h",
    range: "1",
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
  "whale-transaction-tracker": {
    meta: {
      w: 8,
      h: 4,
      minW: 6,
      minH: 4,
      maxW: Infinity,
      maxH: Infinity,
    },
  },
  "trading-economics": {
    meta: {
      w: 8,
      h: 4,
      minW: 6,
      minH: 4,
      maxW: Infinity,
      maxH: Infinity,
    },
  },
  // "gemach-copy-trading": {
  //   meta: {
  //     w: 8,
  //     h: 4,
  //     minW: 8,
  //     minH: 4,
  //     maxW: Infinity,
  //     maxH: Infinity,
  //   },
  // },
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

export const analyticsTrackEvents = {
  widgetAdded: "widget_added",
  signup: "signup",
};

export const marketplaceData = [
  {
    id: 1,
    title: "Noah Shiffman's Liquidity threshold Indicator",
    description:
      "Track the precise liquidity zones that matter most. This smart signal scans market depth in real-time, highlighting thresholds where large buy or sell walls are likely to trigger significant price reactions. By identifying these liquidity 'pressure points,' traders can anticipate moves before they happen — filtering out market noise and focusing only on high-impact levels.",
    author: "Noah Shiffman",
    followers: 690,
    rating: 5,
  },
  {
    id: 2,
    title: "Volume Indicator",
    description:
      "Measure the strength behind every price move. This smart signal tracks traded volume in real-time, revealing when momentum is building or fading. Spot surges that confirm breakouts, detect low-volume pullbacks, and gauge overall market participation to fine-tune your entries and exits.",
    author: "Jakub Blaha",
    followers: 69,
    rating: 3,
  },

  {
    id: 3,
    title: "Price Chart Triggers",
    description:
      "Identify key support and resistance levels with pinpoint accuracy. This advanced signal automatically detects and visualizes critical price zones where market reactions are most likely to occur. By analyzing historical price action and current market structure, it highlights potential reversal points, breakout levels, and accumulation zones — giving traders a strategic edge in positioning entries and exits at optimal price points.",
    author: "Ansem",
    followers: 420,
    rating: 4,
  },

  {
    id: 4,
    title: "Social Sentiment Analyzer",
    description:
      "Get ahead of market moves by monitoring social sentiment across multiple platforms. This signal aggregates and analyzes real-time data from Twitter, Reddit, Discord, and other crypto communities, identifying emerging narratives before they impact price action. The proprietary algorithm filters out noise and weighs influencer impact to deliver actionable sentiment insights with minimal false signals.",
    author: "Emma Chen",
    followers: 843,
    rating: 5,
  },

  {
    id: 5,
    title: "Whale Alert Pro",
    description:
      "Track institutional money movements with precision. This advanced signal detects large wallet transactions across multiple blockchains, identifying accumulation and distribution patterns from known whales and institutional players. Get instant notifications when significant funds move to exchanges (potential selling pressure) or to cold storage (possible long-term accumulation), giving you critical time to position accordingly.",
    author: "Blockchain Sentinel",
    followers: 1257,
    rating: 4,
  },

  {
    id: 6,
    title: "Volatility Breakout Detector",
    description:
      "Capitalize on volatility compression and expansion cycles with mathematical precision. This signal identifies periods of unusually low volatility (often preceding major moves) and alerts you the moment a confirmed breakout occurs. Using advanced Bollinger Band analysis combined with volume verification, it helps you enter early in new trend formations while avoiding false breakouts that trap most traders.",
    author: "Marcus Trading Labs",
    followers: 578,
    rating: 4,
  },
];
