import api from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  HyperliquidClearinghouseState,
  HyperliquidPortfolio,
  HyperliquidSpotState,
  HyperliquidOpenOrder,
  HyperliquidFill,
  HyperliquidHistoricalOrder,
  HyperliquidUserFees,
  HyperliquidUserRole,
  HyperliquidSubAccount,
  HyperliquidAllMids,
  HyperliquidMeta,
  HyperliquidSpotMeta,
  HyperliquidTwapSliceFill,
  SpotPriceMap,
} from "./types";
import { HYPERLIQUID_BASE_URL } from "@/components/widgets/trading/utils/constants";

// const HYPERLIQUID_API_URL = "https://api.hyperliquid.xyz/info";
const HYPERLIQUID_API_URL = `${HYPERLIQUID_BASE_URL}/info`;

export const useHyperliquidClearinghouseState = (userAddress: string, enabled: boolean = true) => {
  const hash = ["hyperliquid-clearinghouse-state", userAddress];

  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.post({
        url: HYPERLIQUID_API_URL,
        body: {
          type: "clearinghouseState",
          user: userAddress,
        },
        auth: false,
      });
      return response?.data;
    },
    enabled: enabled && !!userAddress,
    // refetchInterval: 5000,
  });

  return {
    ...res,
    data: res?.data as HyperliquidClearinghouseState,
  };
};

export const useHyperliquidSpotState = (userAddress: string, enabled: boolean = true) => {
  const hash = ["hyperliquid-spot-state", userAddress];

  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.post({
        url: HYPERLIQUID_API_URL,
        body: {
          type: "spotClearinghouseState",
          user: userAddress,
        },
        auth: false,
      });
      return response?.data;
    },
    enabled: enabled && !!userAddress,
    refetchInterval: 5000,
  });

  return {
    ...res,
    data: res?.data as HyperliquidSpotState,
  };
};

export const useHyperliquidPortfolio = (userAddress: string, enabled: boolean = true) => {
  const hash = ["hyperliquid-portfolio-v2", userAddress];

  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.post({
        url: HYPERLIQUID_API_URL,
        body: {
          type: "portfolio",
          user: userAddress,
        },
        auth: false,
      });
      return response?.data;
    },
    enabled: enabled && !!userAddress,
    staleTime: 60000,
  });

  return {
    ...res,
    data: res?.data as HyperliquidPortfolio,
  };
};

export const useHyperliquidAllMids = (enabled: boolean = true) => {
  const hash = ["hyperliquid-all-mids"];

  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.post({
        url: HYPERLIQUID_API_URL,
        body: {
          type: "allMids",
        },
        auth: false,
      });
      return response?.data;
    },
    enabled,
    // refetchInterval: 3000,
  });

  return {
    ...res,
    data: res?.data as HyperliquidAllMids,
  };
};

export const useHyperliquidMeta = () => {
  const hash = ["hyperliquid-meta"];

  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.post({
        url: HYPERLIQUID_API_URL,
        body: {
          type: "meta",
        },
        auth: false,
      });
      return response?.data;
    },
    staleTime: Infinity,
  });

  return {
    ...res,
    data: res?.data as HyperliquidMeta,
  };
};

export const useHyperliquidSpotMeta = () => {
  const hash = ["hyperliquid-spot-meta"];

  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.post({
        url: HYPERLIQUID_API_URL,
        body: {
          type: "spotMeta",
        },
        auth: false,
      });
      return response?.data;
    },
    staleTime: Infinity,
  });

  return {
    ...res,
    data: res?.data as HyperliquidSpotMeta,
  };
};

export const useHyperliquidOpenOrders = (userAddress: string, enabled: boolean = true) => {
  const hash = ["hyperliquid-open-orders", userAddress];

  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.post({
        url: HYPERLIQUID_API_URL,
        body: {
          type: "frontendOpenOrders",
          user: userAddress,
        },
        auth: false,
      });
      return response?.data;
    },
    enabled: enabled && !!userAddress,
    refetchInterval: 3000,
  });

  return {
    ...res,
    data: res?.data as HyperliquidOpenOrder[],
  };
};

export const useHyperliquidHistoricalOrders = (userAddress: string, enabled: boolean = true) => {
  const hash = ["hyperliquid-historical-orders", userAddress];

  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.post({
        url: HYPERLIQUID_API_URL,
        body: {
          type: "historicalOrders",
          user: userAddress,
        },
        auth: false,
      });
      return response?.data;
    },
    enabled: enabled && !!userAddress,
    staleTime: 30000,
  });

  return {
    ...res,
    data: res?.data as HyperliquidHistoricalOrder[],
  };
};

export const useHyperliquidOrderStatus = () => {
  return useMutation({
    mutationFn: async (props: { userAddress: string; oid: number | string }) => {
      const { userAddress, oid } = props;
      const res = await api.post({
        url: HYPERLIQUID_API_URL,
        body: {
          type: "orderStatus",
          user: userAddress,
          oid,
        },
        auth: false,
      });
      return res?.data;
    },
  });
};

export const useHyperliquidUserFills = (userAddress: string, enabled: boolean = true) => {
  const hash = ["hyperliquid-user-fills", userAddress];

  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.post({
        url: HYPERLIQUID_API_URL,
        body: {
          type: "userFills",
          user: userAddress,
          aggregateByTime: false,
        },
        auth: false,
      });
      return response?.data;
    },
    enabled: enabled && !!userAddress,
    staleTime: 10000,
  });

  return {
    ...res,
    data: res?.data as HyperliquidFill[],
  };
};

export const useHyperliquidUserFillsByTime = () => {
  return useMutation({
    mutationFn: async (props: {
      userAddress: string;
      startTime: number;
      endTime?: number;
      aggregateByTime?: boolean;
    }) => {
      const { userAddress, startTime, endTime, aggregateByTime = false } = props;
      const res = await api.post({
        url: HYPERLIQUID_API_URL,
        body: {
          type: "userFillsByTime",
          user: userAddress,
          startTime,
          ...(endTime && { endTime }),
          aggregateByTime,
        },
        auth: false,
      });
      return res?.data as HyperliquidFill[];
    },
  });
};

export const useHyperliquidTwapSliceFills = (userAddress: string, enabled: boolean = true) => {
  const hash = ["hyperliquid-twap-slice-fills", userAddress];

  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.post({
        url: HYPERLIQUID_API_URL,
        body: {
          type: "userTwapSliceFills",
          user: userAddress,
        },
        auth: false,
      });
      return response?.data;
    },
    enabled: enabled && !!userAddress,
    staleTime: 30000,
  });

  return {
    ...res,
    data: res?.data as HyperliquidTwapSliceFill[],
  };
};

export const useHyperliquidUserFees = (userAddress: string, enabled: boolean = true) => {
  const hash = ["hyperliquid-user-fees", userAddress];

  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.post({
        url: HYPERLIQUID_API_URL,
        body: {
          type: "userFees",
          user: userAddress,
        },
        auth: false,
      });
      return response?.data;
    },
    enabled: enabled && !!userAddress,
    staleTime: 300000,
  });

  return {
    ...res,
    data: res?.data as HyperliquidUserFees,
  };
};

export const useHyperliquidUserRole = (userAddress: string, enabled: boolean = true) => {
  const hash = ["hyperliquid-user-role", userAddress];

  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.post({
        url: HYPERLIQUID_API_URL,
        body: {
          type: "userRole",
          user: userAddress,
        },
        auth: false,
      });
      return response?.data;
    },
    enabled: enabled && !!userAddress,
    staleTime: Infinity,
  });

  return {
    ...res,
    data: res?.data as HyperliquidUserRole,
  };
};

export const useHyperliquidSubAccounts = (userAddress: string, enabled: boolean = true) => {
  const hash = ["hyperliquid-subaccounts", userAddress];

  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.post({
        url: HYPERLIQUID_API_URL,
        body: {
          type: "subAccounts",
          user: userAddress,
        },
        auth: false,
      });
      return response?.data;
    },
    enabled: enabled && !!userAddress,
    staleTime: 60000,
  });

  return {
    ...res,
    data: res?.data as HyperliquidSubAccount[],
  };
};

export const useHyperliquidUserRateLimit = (userAddress: string, enabled: boolean = true) => {
  const hash = ["hyperliquid-user-rate-limit", userAddress];

  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.post({
        url: HYPERLIQUID_API_URL,
        body: {
          type: "userRateLimit",
          user: userAddress,
        },
        auth: false,
      });
      return response?.data;
    },
    enabled: enabled && !!userAddress,
    staleTime: 30000,
  });

  return {
    ...res,
    data: res?.data as {
      cumVlm: string;
      nRequestsUsed: number;
      nRequestsCap: number;
      nRequestsSurplus: number;
    },
  };
};

export const useHyperliquidCandleSnapshot = () => {
  return useMutation({
    mutationFn: async (props: {
      coin: string;
      interval: "1m" | "3m" | "5m" | "15m" | "30m" | "1h" | "2h" | "4h" | "8h" | "12h" | "1d" | "3d" | "1w" | "1M";
      startTime: number;
      endTime: number;
    }) => {
      const { coin, interval, startTime, endTime } = props;
      const res = await api.post({
        url: HYPERLIQUID_API_URL,
        body: {
          type: "candleSnapshot",
          req: {
            coin,
            interval,
            startTime,
            endTime,
          },
        },
        auth: false,
      });
      return res?.data;
    },
  });
};

export const useHyperliquidL2Book = () => {
  return useMutation({
    mutationFn: async (props: { coin: string; nSigFigs?: number; mantissa?: number }) => {
      const { coin, nSigFigs, mantissa } = props;
      const res = await api.post({
        url: HYPERLIQUID_API_URL,
        body: {
          type: "l2Book",
          coin,
          ...(nSigFigs && { nSigFigs }),
          ...(mantissa && { mantissa }),
        },
        auth: false,
      });
      return res?.data;
    },
  });
};

export const useHyperliquidUserFunding = () => {
  return useMutation({
    mutationFn: async (props: { userAddress: string; startTime: number; endTime?: number }) => {
      const { userAddress, startTime, endTime } = props;
      const res = await api.post({
        url: HYPERLIQUID_API_URL,
        body: {
          type: "userFunding",
          user: userAddress,
          startTime,
          ...(endTime && { endTime }),
        },
        auth: false,
      });
      return res?.data;
    },
  });
};

export const useHyperliquidUserNonFundingLedgerUpdates = () => {
  return useMutation({
    mutationFn: async (props: { userAddress: string; startTime: number; endTime?: number }) => {
      const { userAddress, startTime, endTime } = props;
      const res = await api.post({
        url: HYPERLIQUID_API_URL,
        body: {
          type: "userNonFundingLedgerUpdates",
          user: userAddress,
          startTime,
          ...(endTime && { endTime }),
        },
        auth: false,
      });
      return res?.data;
    },
  });
};

export const useHyperliquidFundingHistory = () => {
  return useMutation({
    mutationFn: async (props: { coin: string; startTime: number; endTime?: number }) => {
      const { coin, startTime, endTime } = props;
      const res = await api.post({
        url: HYPERLIQUID_API_URL,
        body: {
          type: "fundingHistory",
          coin,
          startTime,
          ...(endTime && { endTime }),
        },
        auth: false,
      });
      return res?.data;
    },
  });
};

export const useHyperliquidPredictedFundings = (enabled: boolean = true) => {
  const hash = ["hyperliquid-predicted-fundings"];

  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.post({
        url: HYPERLIQUID_API_URL,
        body: {
          type: "predictedFundings",
        },
        auth: false,
      });
      return response?.data;
    },
    enabled,
    refetchInterval: 60000,
  });

  return {
    ...res,
    data: res?.data as [string, [string, { fundingRate: string; nextFundingTime: number }][]][] | null,
  };
};

export const useHyperliquidMetaAndAssetCtxs = (enabled: boolean = true) => {
  const hash = ["hyperliquid-meta-asset-ctxs"];

  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.post({
        url: HYPERLIQUID_API_URL,
        body: {
          type: "metaAndAssetCtxs",
        },
        auth: false,
      });
      return response?.data;
    },
    enabled,
    refetchInterval: 10000,
  });

  return {
    ...res,
    data: res?.data as
      | [
          { universe: Array<{ name: string; szDecimals: number; maxLeverage: number }> },
          Array<{
            dayNtlVlm: string;
            funding: string;
            impactPxs: [string, string];
            markPx: string;
            midPx: string;
            openInterest: string;
            oraclePx: string;
            premium: string;
            prevDayPx: string;
          }>,
        ]
      | null,
  };
};

export const useHyperliquidSpotPrices = (enabled: boolean = true) => {
  const res = useQuery({
    queryKey: ["hyperliquid-spot-prices"],
    queryFn: async () => {
      const response = await api.post({
        url: HYPERLIQUID_API_URL,
        body: {
          type: "spotMetaAndAssetCtxs",
        },
        auth: false,
      });

      const [meta, assetCtxs] = response?.data || [];

      if (!meta || !assetCtxs) return {};

      const universe = meta.universe || [];
      const prices: SpotPriceMap = {};

      universe.forEach((pair: any, i: number) => {
        const ctx = assetCtxs[i];
        if (!ctx) return;

        const [baseTokenIndex] = pair.tokens;
        const price = parseFloat(ctx.midPx || ctx.markPx || "0");

        prices[baseTokenIndex] = price;
      });

      return prices;
    },
    enabled,
    // refetchInterval: 3000
  });
  return {
    ...res,
    spotPrices: res.data as SpotPriceMap,
  };
};
