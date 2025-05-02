import {
  DataSource,
  Operator,
  SignalDefinition,
} from "@/lib/types/signal.types";

export const mockDataSources: DataSource[] = [
  // Market Data
  {
    id: "price",
    name: "Price",
    type: "number",
    category: "Market Data",
  },
  {
    id: "volume",
    name: "Trading Volume",
    type: "number",
    category: "Market Data",
  },
  {
    id: "marketCap",
    name: "Market Capitalization",
    type: "number",
    category: "Market Data",
  },

  // Technical Indicators
  {
    id: "rsi",
    name: "RSI",
    type: "number",
    category: "Technical Indicators",
  },
  {
    id: "macd",
    name: "MACD",
    type: "number",
    category: "Technical Indicators",
  },
  {
    id: "fgi",
    name: "Fear & Greed Index",
    type: "number",
    category: "Technical Indicators",
  },
  {
    id: "trendsUp",
    name: "Trending Upward",
    type: "boolean",
    category: "Technical Indicators",
  },
  {
    id: "trendsDown",
    name: "Trending Downward",
    type: "boolean",
    category: "Technical Indicators",
  },

  // Social Sentiment
  {
    id: "sentiment",
    name: "Social Media Sentiment",
    type: "enum",
    category: "Social Sentiment",
    enumValues: ["Bullish", "Neutral", "Bearish"],
  },
  {
    id: "mentions",
    name: "Social Media Mentions",
    type: "number",
    category: "Social Sentiment",
  },

  // Streaming Activity
  {
    id: "youtubeStreaming",
    name: "YouTube Streaming",
    type: "boolean",
    category: "Streaming Activity",
  },
  {
    id: "twitterStreaming",
    name: "X (Twitter) Streaming",
    type: "boolean",
    category: "Streaming Activity",
  },

  // Other
  {
    id: "ticker",
    name: "Asset Ticker",
    type: "string",
    category: "Market Data",
  },
];

export const mockOperators: Operator[] = [
  {
    id: "greater",
    symbol: ">",
    name: "Greater Than",
    applicableTypes: ["number"],
  },
  {
    id: "less",
    symbol: "<",
    name: "Less Than",
    applicableTypes: ["number"],
  },
  {
    id: "greaterEqual",
    symbol: ">=",
    name: "Greater Than or Equal To",
    applicableTypes: ["number"],
  },
  {
    id: "lessEqual",
    symbol: "<=",
    name: "Less Than or Equal To",
    applicableTypes: ["number"],
  },
  {
    id: "equal",
    symbol: "==",
    name: "Equal To",
    applicableTypes: ["number", "string", "boolean"],
  },
  {
    id: "notEqual",
    symbol: "!=",
    name: "Not Equal To",
    applicableTypes: ["number", "string", "boolean"],
  },
  {
    id: "contains",
    symbol: "contains",
    name: "Contains",
    applicableTypes: ["string"],
  },
  {
    id: "startsWith",
    symbol: "startsWith",
    name: "Starts With",
    applicableTypes: ["string"],
  },
  {
    id: "endsWith",
    symbol: "endsWith",
    name: "Ends With",
    applicableTypes: ["string"],
  },
];

export const mockSignals: SignalDefinition[] = [
  {
    id: "signal1",
    name: "BTC Bull Run Alert",
    description:
      "Alert when Bitcoin price exceeds $100,000 and social sentiment is positive",
    rootCondition: {
      id: "root1",
      type: "group",
      operator: "AND",
      conditions: [
        {
          id: "condition1",
          type: "simple",
          dataSource: "price",
          operator: "greater",
          value: 100000,
        },
        {
          id: "condition2",
          type: "simple",
          dataSource: "sentiment",
          operator: "equal",
          value: "Bullish",
        },
      ],
    },
    notifications: {
      email: true,
      inApp: true,
    },
    createdAt: "2023-04-15T10:30:00Z",
    updatedAt: "2023-04-15T10:30:00Z",
  },
  {
    id: "signal2",
    name: "Market Volatility Warning",
    description: "Alert when price drops more than 5% with high trading volume",
    rootCondition: {
      id: "root2",
      type: "group",
      operator: "AND",
      conditions: [
        {
          id: "condition3",
          type: "simple",
          dataSource: "price",
          operator: "less",
          value: 0.95,
        },
        {
          id: "condition4",
          type: "simple",
          dataSource: "volume",
          operator: "greater",
          value: 1000000,
        },
      ],
    },
    notifications: {
      email: true,
      inApp: false,
    },
    createdAt: "2023-04-20T14:45:00Z",
    updatedAt: "2023-04-21T09:15:00Z",
  },
];

// Helper function to find a data source by ID
export const getDataSourceById = (id: string): DataSource | undefined => {
  return mockDataSources.find((ds) => ds.id === id);
};

// Helper function to find an operator by ID
export const getOperatorById = (id: string): Operator | undefined => {
  return mockOperators.find((op) => op.id === id);
};

// Helper to get compatible operators for a data source
export const getCompatibleOperators = (dataSourceId: string): Operator[] => {
  const dataSource = getDataSourceById(dataSourceId);
  if (!dataSource) return [];

  return mockOperators.filter((op) =>
    op.applicableTypes.includes(dataSource.type)
  );
};

// Helper to get data sources grouped by category
export const getDataSourcesByCategory = (): Record<string, DataSource[]> => {
  const categorized: Record<string, DataSource[]> = {};

  mockDataSources.forEach((source) => {
    if (!categorized[source.category]) {
      categorized[source.category] = [];
    }
    categorized[source.category].push(source);
  });

  return categorized;
};

// Helper to get enum values for a data source if applicable
export const getEnumValuesForDataSource = (dataSourceId: string): string[] => {
  const dataSource = getDataSourceById(dataSourceId);
  if (dataSource && dataSource.type === "enum" && dataSource.enumValues) {
    return dataSource.enumValues;
  }
  return [];
};

// Get suggested/default values for a data source
export const getSuggestedValuesForDataSource = (
  dataSourceId: string
): (string | number | boolean)[] => {
  const dataSource = getDataSourceById(dataSourceId);

  if (!dataSource) return [];

  switch (dataSourceId) {
    case "price":
      return [10000, 20000, 50000, 100000];
    case "volume":
      return [1000000, 5000000, 10000000];
    case "rsi":
      return [30, 50, 70];
    case "fgi":
      return [25, 50, 75];
    case "mentions":
      return [100, 500, 1000];
    default:
      return [];
  }
};
