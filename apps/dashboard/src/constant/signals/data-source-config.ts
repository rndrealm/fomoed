import { CFGIConfig } from "@/components/signals/data-configs/CFGIConfig";
import { MarketCapConfig } from "@/components/signals/data-configs/MarketCapConfig";
import { PriceTickerConfig } from "@/components/signals/data-configs/PriceTickerConfig";
import { VolumeTickerConfig } from "@/components/signals/data-configs/VolumeTickerConfig";
import { YouTubeChannelConfig } from "@/components/signals/data-configs/YouTubeChannelConfig";

export type DataSource = {
  name: string;
  id: string;
  disabled?: boolean;
};

export type SignalDataSourceGroup = {
  group: string;
  dataSources: DataSource[];
};

export const signalDataSources: SignalDataSourceGroup[] = [
  {
    group: "Market data",
    dataSources: [
      { name: "Price", id: "price" },
      { name: "CFGI", id: "cfgi" },
      { name: "Trading Volume", id: "volume_24h" },
      { name: "Market Capitalization", id: "market_cap" },
    ],
  },
  {
    group: "Technical indicators",
    dataSources: [
      { name: "RSI", id: "rsi", disabled: true },
      { name: "MACD", id: "macd", disabled: true },
    ],
  },
  {
    group: "Social Sentiment",
    dataSources: [{ name: "YouTube Streaming Status", id: "youtube" }],
  },
];

export const topicSelectorMap: Record<
  string,
  {
    component: React.FC<{
      value: string | null;
      onChange: (value: string) => void;
    }>;
    allowedOperators: string[];
    valueType: "string" | "number" | "boolean";
  }
> = {
  price: {
    component: PriceTickerConfig,
    allowedOperators: [">", "<", "==", "!="],
    valueType: "number",
  },
  cfgi: {
    component: CFGIConfig,
    allowedOperators: [">", "<", "==", "!="],
    valueType: "number",
  },
  youtube: {
    component: YouTubeChannelConfig,
    allowedOperators: ["==", "!="],
    valueType: "boolean",
  },
  volume_24h: {
    component: VolumeTickerConfig,
    allowedOperators: [">", "<"],
    valueType: "number",
  },
  market_cap: {
    component: MarketCapConfig,
    allowedOperators: [">", "<"],
    valueType: "number",
  },
};
