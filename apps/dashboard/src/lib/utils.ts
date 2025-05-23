import { ExchangePairOption } from "@/charts/types";
import {
  InstrumentInfo,
  SupportedPairsData,
} from "@/services/queries/charts/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { widgetIdJoin } from "./static";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isLettersOnly(str: string) {
  return /^[a-zA-Z]+$/.test(str);
}

function isInstrumentIdAnOption(instrumendId: string) {
  return !isLettersOnly(instrumendId);
}

export function supportedExchangePairsToOptions(
  supportedExchangePairs: SupportedPairsData,
  excludeOptions: boolean = true
) {
  if (!supportedExchangePairs) {
    return [];
  }

  const options: ExchangePairOption[] = [];

  for (const [exchangeName, instruments] of Object.entries(
    supportedExchangePairs
  )) {
    for (const instrument of instruments as any) {
      if (excludeOptions && isInstrumentIdAnOption(instrument.instrumentId)) {
        continue;
      }

      options.push({
        label:
          exchangeName +
          " " +
          instrument.baseAsset +
          "/" +
          instrument.quoteAsset,
        value: {
          ...instrument,
          exchange: exchangeName,
          symbol: instrument.baseAsset + instrument.quoteAsset,
        },
      });
    }
  }

  return options;
}

export function humanizeNumber(num: number) {
  if (num < 1000) {
    return num.toString(); // Less than 1000, return the number as it is
  } else if (num >= 1000 && num < 1000000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K"; // Thousand (K)
  } else if (num >= 1000000 && num < 1000000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M"; // Million (M)
  } else if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1).replace(/\.0$/, "") + "B"; // Billion (B)
  }

  return num.toString();
}

export const joinWidgetSlug = (widgetId: string, slug: string) => {
  return `${widgetId}${widgetIdJoin}${slug}`;
};

export const splitWidgetSlug = (widgetSlug: string) => {
  const [widgetId, slug] = widgetSlug.split(widgetIdJoin);
  return {
    widgetId,
    slug,
  };
};

export function timeAgo(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals: { label: string; seconds: number }[] = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count !== 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
}

export const formatCoinPrice = (price: string) => {
  return price !== undefined
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(Number(price))
    : "$0.00";
};

export function getChangeTextColor(change: number): string {
  return change > 0 ? "#00D743" : change < 0 ? "#D00416" : "#ffffff";
}

export const maxTabsByPlan = {
  FREE: 3,
  PLUS: 6,
  PRO: 11,
};

export const capitalizeFirst = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export function getLoginUrl(): string {
  const legacyAppUrl = process.env.NEXT_PUBLIC_LEGACY_APP_URL;
  const useNewLogin = process.env.NEXT_PUBLIC_USE_NEW_LOGIN;

  if (legacyAppUrl && !useNewLogin) {
    return `${legacyAppUrl}/auth`;
  } else {
    const currentUrlCopy = new URL(window.location.href);

    currentUrlCopy.pathname = "/login";

    return currentUrlCopy.toString();
  }
}
