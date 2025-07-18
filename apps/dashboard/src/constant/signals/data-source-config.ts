import { TopicSelectorSymbol } from "@/components/signals/topic-selectors/topic-selector-symbol";
import { TopicSelectorYtChannel } from "@/components/signals/topic-selectors/topic-selector-yt-channel";
// import { MarketCapConfig } from "@/components/signals/data-configs/MarketCapConfig";
// import { PriceTickerConfig } from "@/components/signals/data-configs/PriceTickerConfig";
// import { SocialDominanceConfig } from "@/components/signals/data-configs/SocialDominanceConfig";
// import { VolumeTickerConfig } from "@/components/signals/data-configs/VolumeTickerConfig";
// import { YouTubeChannelConfig } from "@/components/signals/data-configs/YouTubeChannelConfig";

export type DataSource = {
  name: string;
  id: string;
  disabled?: boolean;
  suggestionsEnabled?: boolean;
};

export type SignalDataSourceGroup = {
  group: string;
  dataSources: DataSource[];
};

/**
 * @deprecated This is newly dynamically loaded from the backend.
 */
export const signalDataSources: SignalDataSourceGroup[] = [
  {
    group: "Market data",
    dataSources: [
      { name: "Price", id: "price", suggestionsEnabled: true },
      { name: "Fear & Greed Index", id: "cfgi" },
      { name: "Trading Volume", id: "volume_24h" },
      { name: "Market Capitalization", id: "market_cap" },
      // {
      //   name: "Active Addresses 24h",
      //   id: "active_addresses_24h",
      //   disabled: false,
      // },
    ],
  },
  // Commented out, because they are disabled
  // {
  //   group: "Technical indicators",
  //   dataSources: [
  //     { name: "RSI", id: "rsi", disabled: true },
  //     { name: "MACD", id: "macd", disabled: true },
  //   ],
  // },
  {
    group: "Social Networks",
    dataSources: [
      { name: "YouTube Streaming Status", id: "isStreamingYoutube" },
      // {
      //   name: "Social Dominance",
      //   id: "social_dominance_total",
      //   // disabled: true,
      // },
      // {
      //   name: "Weighted Sentiment",
      //   id: "weighted_sentiment",
      //   disabled: false,
      // },
    ],
  },
];

export type TopicSelectorProps = {
  selectedTopic: string | null;
  onChange: (value: string | null) => void;
  dataSourcePrefix: string;
};

type TopicSelectorT = React.FC<TopicSelectorProps>;

export const topicSelectorMap: Record<
  string,
  {
    component: TopicSelectorT;
  }
> = {
  cfgi: {
    component: TopicSelectorSymbol,
  },
  youtube_streaming_status: {
    component: TopicSelectorYtChannel,
  },
  active_addresses_24h: {
    component: TopicSelectorSymbol,
  },
  santiment_market_cap: {
    component: TopicSelectorSymbol,
  },
  santiment_rsi_4h: {
    component: TopicSelectorSymbol,
  },
  santiment_rsi_1d: {
    component: TopicSelectorSymbol,
  },
  santiment_rsi_7d: {
    component: TopicSelectorSymbol,
  },
  ticker: {
    component: TopicSelectorSymbol,
  },
  weighted_sentiment: {
    component: TopicSelectorSymbol,
  },
  social_dominance: {
    component: TopicSelectorSymbol,
  },
};
