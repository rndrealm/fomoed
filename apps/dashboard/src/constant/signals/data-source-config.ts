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
