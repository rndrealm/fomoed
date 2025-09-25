export interface HyperLiquidLeaderboard {
  ethAddress: string;
  accountValue: string;
  windowPerformances: [
    [
      "day",
      {
        pnl: string;
        roi: string;
        vlm: string;
      },
    ],
    [
      "week",
      {
        pnl: string;
        roi: string;
        vlm: string;
      },
    ],
    [
      "month",
      {
        pnl: string;
        roi: string;
        vlm: string;
      },
    ],
    [
      "allTime",
      {
        pnl: string;
        roi: string;
        vlm: string;
      },
    ],
  ];
  prize: number;
  displayName: string;
}

export interface GemachUserData {
  address: string;
  isNewUser: boolean;
  autoBuy: number;
  refCode: string;
  holdList: any[];
  balance: number;
  setting: Setting;
  chainId: string;
}

interface Setting {
  quickBuyAmount: string;
  quickBuySlippage: number;
  quickSellPercent: number;
  quickSellSlippage: number;
  buyPriorityFee: number;
  sellPriorityFee: number;
}

export interface GemachUserBalance {
  gdexBalance: number;
  hyperliquidBalance: number;
}

export interface CopyTrade {
  _id: string;
  copyTradeId: string;
  copyTradeName: string;
  copyMode: number;
  isActive: boolean;
  userId: string;
  userWallet: string;
  traderWallet: string;
  lossPercent: number;
  profitPercent: number;
  fixedAmountCostPerOrder: string;
  createdAt: number;
  lastUpdated: number;
  oppositeCopy: boolean;
  __v: number;
  totalTrades: number;
  totalVolumes: number;
  totalPnl: number;
}

export type TimeWindow = "day" | "week" | "month" | "allTime";
