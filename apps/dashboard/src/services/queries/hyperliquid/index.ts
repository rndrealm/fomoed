import api from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  HyperliquidPerpListResponse,
  HyperliquidSpotListResponse,
  PerpBalanceResponse,
  PerpUniverse,
  SpotsUniverse,
} from "./types";
import { AxiosResponse } from "axios";
import { AssetDataResponse, HyperliquidMetaResponse } from "./types";

const BASE_URL = "https://api.hyperliquid.xyz";

export const useReadHyperLiquidTokens = () => {
  const hash = ["hyperliquid-tokens"];

  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const [spotResponse, perpResponse] = await Promise.all([
        api.gemachPost({
          url: `${BASE_URL}/info`,
          auth: false,
          body: {
            type: "spotMetaAndAssetCtxs",
          },
        }) as Promise<AxiosResponse<HyperliquidSpotListResponse>>,
        api.gemachPost({
          url: `${BASE_URL}/info`,
          auth: false,
          body: {
            type: "metaAndAssetCtxs",
          },
        }) as Promise<AxiosResponse<HyperliquidPerpListResponse>>,
      ]);

      const formattedSpots: SpotsUniverse[] = spotResponse?.data?.[0]?.universe?.map((item) => {
        const baseToken = spotResponse.data?.[0]?.tokens[item.tokens[0]];
        const quoteToken = spotResponse.data?.[0]?.tokens[item.tokens[1]];

        const priceVolume = spotResponse?.data?.[1]?.[item?.index];

        const tradingViewData = {
          baseTokenName: baseToken?.name,
          quoteTokenName: quoteToken?.name,
          price: priceVolume.markPx,
          isSpot: true,
          name: item?.name,
        };

        const tradingViewName = JSON.stringify(tradingViewData);

        return {
          ...baseToken,
          ...item,
          baseTokenName: baseToken?.name,
          symbol: `${baseToken?.name}/${quoteToken?.name}`,
          isSpot: true,
          priceVolume: priceVolume,
          tradingViewName,
          quoteTokenName: quoteToken?.name,
          displayName: `${baseToken?.name}/${quoteToken?.name}`,
        };
      });

      const formattedPerps: PerpUniverse[] = [];

      perpResponse?.data?.[0]?.universe?.forEach((item, index) => {
        const priceVolume = perpResponse?.data?.[1]?.[index];

        const tradingViewData = {
          baseTokenName: item?.name,
          quoteTokenName: "USDC",
          price: priceVolume.markPx,
          isSpot: false,
          name: item?.name,
        };

        const tradingViewName = JSON.stringify(tradingViewData);

        if (!item?.isDelisted) {
          formattedPerps.push({
            ...item,
            symbol: item?.name,
            isSpot: false,
            baseTokenName: item?.name,
            quoteTokenName: "USDC",
            tradingViewName,
            priceVolume,
            displayName: `${item?.name}-USDC`,
          });
        }
      });

      return {
        spot: formattedSpots,
        perp: formattedPerps,
        allTokens: [...formattedPerps, ...formattedSpots],
      };
    },
  });

  return {
    ...res,
  };
};

export const useReadHyperLiquidTest = () => {
  const hash = ["hyperliquid-test"];

  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const [spotResponse] = await Promise.all([
        api.gemachPost({
          url: `${BASE_URL}/info`,
          auth: false,
          body: {
            type: "spotMetaAndAssetCtxs",
          },
        }),
      ]);

      console.log(spotResponse);

      return {
        spotResponse,
      };
    },
  });

  return res;
};

export const useGetPerpBalance = (wallet_address: string) => {
  const hash = ["hyper-liquid-balance", wallet_address];

  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.post({
        url: `${BASE_URL}/info`,
        auth: true,
        body: {
          user: wallet_address,
          type: "clearinghouseState",
        },
      });
      return response;
    },
    enabled: !!wallet_address,
  });
  return {
    ...res,
    data: res?.data as PerpBalanceResponse,
  };
};

export const useGetAssetData = (wallet_address: string, asset: string) => {
  const hash = ["hyper-liquid-asset-data", wallet_address, asset];

  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.post({
        url: `${BASE_URL}/info`,
        auth: true,
        body: {
          user: wallet_address,
          type: "activeAssetData",
          coin: asset,
        },
      });
      return response;
    },
    enabled: !!wallet_address,
  });
  return {
    ...res,
    data: res?.data as AssetDataResponse,
  };
};

export const useGetHyperliquidMetaData = () => {
  const hash = ["hyper-liquid-meta-data"];

  const res = useQuery({
    queryKey: hash,
    queryFn: async () => {
      const response = await api.post({
        url: `${BASE_URL}/info`,
        auth: true,
        body: {
          type: "meta",
        },
      });
      return response;
    },
  });
  return {
    ...res,
    data: res?.data as HyperliquidMetaResponse,
  };
};
