import { ExchangePairOption } from "@/charts/types";
import { SupportedPairsData } from "@/services/queries/charts/types";
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

export function getLegacyLoginUrl(): string {
  const legacyAppUrl = process.env.NEXT_PUBLIC_LEGACY_APP_URL;

  if (legacyAppUrl) {
    return `${legacyAppUrl}/auth`;
  } else {
    const currentUrlCopy = new URL(window.location.href);

    currentUrlCopy.pathname = "/login";

    return currentUrlCopy.toString();
  }
}

/**
 * Converts HTML entities and non-breaking spaces to regular text
 * @param htmlText Text with HTML entities
 * @returns Normalized plain text
 */
export function normalizeHtmlText(htmlText: string): string {
  if (!htmlText) return "";

  return htmlText
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export function calculateReadingTime(htmlContent: string) {
  const normalizedContent = normalizeHtmlText(htmlContent);

  const wordsPerMinute = 250; // Average reading speed
  let wordCount = 0;
  let imageCount = 0;

  // Use a DOM parser or regex to extract text and count images
  const text = normalizedContent.replace(/<[^>]+>/g, " "); // Strip HTML tags
  wordCount = text.split(/\s+/).filter((word) => word.length > 0).length;
  imageCount = (normalizedContent.match(/<img[^>]+>/gi) || []).length;
  imageCount += (normalizedContent.match(/<img-placeholder[^>]+>/gi) || [])
    .length;

  // Calculate reading time: words / WPM + image adjustments
  let readingTime = wordCount / wordsPerMinute;
  for (let i = 0; i < imageCount; i++) {
    readingTime += (12 - i) / 60; // Convert seconds to minutes
  }

  return Math.ceil(readingTime);
}

/**
 * Formats an ISO date string to "MONTH DD, YYYY" format
 * @param isoDateString ISO formatted date string
 * @returns Formatted date string (e.g., "MAY 20, 2025")
 */
export function formatDate(isoDateString?: string): string {
  if (!isoDateString) return "";

  const date = new Date(isoDateString);

  // Get month name and convert to uppercase
  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  const month = months[date.getMonth()];

  // Get day and year
  const day = date.getDate();
  const year = date.getFullYear();

  return `${month} ${day}, ${year}`;
}

/**
 * Extracts the first h1 content and first image from HTML content
 * @param htmlString The HTML content as a string
 * @returns Object containing heading content and image information
 */
export function extractNewsContent(htmlString: string): {
  title: string | null;
  image: {
    src: string | null;
    alt: string | null;
  };
} {
  // Extract h1 content
  const h1Regex = /<h1>([\s\S]*?)<\/h1>/;
  const h1Match = htmlString.match(h1Regex);
  const title = h1Match ? h1Match[1] : null;

  // Try to find a proper img tag first
  const imgRegex =
    /<img[\s\S]*?src=["'](.*?)["'][\s\S]*?(?:alt=["'](.*?)["'])?[\s\S]*?>/;
  const imgMatch = htmlString.match(imgRegex);

  // If no img tag found, look for [IMAGE: ...] pattern
  const imageBracketRegex = /\[IMAGE: ([\s\S]*?)\]/;
  const imageBracketMatch = !imgMatch && htmlString.match(imageBracketRegex);

  return {
    title,
    image: {
      src: imgMatch ? imgMatch[1] : null,
      alt:
        imgMatch && imgMatch[2]
          ? imgMatch[2]
          : imageBracketMatch
            ? imageBracketMatch[1]
            : null,
    },
  };
}

export function formatPriceSignificant(value: string) {
  const num = Number(value);
  if (num === 0) return "0";

  if (num >= 1) {
    // For numbers >= 1, format with commas and exactly 2 decimals
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } else {
    // For small numbers < 1, show up to 8 decimals, trimming trailing zeros
    let fixed = num.toFixed(8);
    fixed = fixed.replace(/\.?0+$/, ""); // remove trailing zeros and dot if integer
    return fixed;
  }
}

export function formatSummaryDate(date = new Date()) {
  const monthDayFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
  });

  const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
  });

  const [{ value: month }, , { value: day }] =
    monthDayFormatter.formatToParts(date);
  const weekday = weekdayFormatter.format(date);

  return {
    date: `${month}’ ${day}`,
    weekday,
  };
}
