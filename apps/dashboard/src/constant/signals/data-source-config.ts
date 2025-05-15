import { CFGIConfig } from "@/components/signals/data-configs/CFGIConfig";
import { PriceTickerConfig } from "@/components/signals/data-configs/PriceTickerConfig";

export type DataSource = {
  name: string;
  id: string;
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
      { name: "Trading Volume", id: "volume" },
      { name: "Market Capitalization", id: "market_cap" },
    ],
  },
  {
    group: "Technical indicators",
    dataSources: [
      { name: "RSI", id: "rsi" },
      { name: "MACD", id: "macd" },
    ],
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
  }
> = {
  price: {
    component: PriceTickerConfig,
    allowedOperators: [">", "<", "==", "!="],
  },
  cfgi: {
    component: CFGIConfig,
    allowedOperators: [">", "<", "==", "!="],
  },
};
