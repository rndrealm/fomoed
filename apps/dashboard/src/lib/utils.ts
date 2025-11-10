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
  excludeOptions: boolean = true,
) {
  if (!supportedExchangePairs) {
    return [];
  }

  const options: ExchangePairOption[] = [];

  for (const [exchangeName, instruments] of Object.entries(supportedExchangePairs)) {
    for (const instrument of instruments) {
      if (excludeOptions && isInstrumentIdAnOption(instrument.instrument_id)) {
        continue;
      }

      options.push({
        label: exchangeName + " " + instrument.base_asset + "/" + instrument.quote_asset,
        value: {
          ...instrument,
          exchange: exchangeName,
          symbol: instrument.base_asset + instrument.quote_asset,
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
  FREE: 1,
  PLUS: 3,
  PRO: 11,
};

export const capitalizeFirst = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

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
  imageCount += (normalizedContent.match(/<img-placeholder[^>]+>/gi) || []).length;

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
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
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
  const imgRegex = /<img[\s\S]*?src=["'](.*?)["'][\s\S]*?(?:alt=["'](.*?)["'])?[\s\S]*?>/;
  const imgMatch = htmlString.match(imgRegex);

  // If no img tag found, look for [IMAGE: ...] pattern
  const imageBracketRegex = /\[IMAGE: ([\s\S]*?)\]/;
  const imageBracketMatch = !imgMatch && htmlString.match(imageBracketRegex);

  return {
    title,
    image: {
      src: imgMatch ? imgMatch[1] : null,
      alt: imgMatch && imgMatch[2] ? imgMatch[2] : imageBracketMatch ? imageBracketMatch[1] : null,
    },
  };
}

/**
 * Shortens a wallet address to the format 0xV1W2...X3Y4
 * @param address The full wallet address
 * @param startChars Number of characters to keep at the beginning (including 0x)
 * @param endChars Number of characters to keep at the end
 * @returns The shortened address string
 */
export const shortenAddress = (address: string, startChars = 6, endChars = 4): string => {
  if (!address) return "";
  if (address.length <= startChars + endChars) return address;

  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

/**
 * Function to truncate text to a specified length and append ellipsis if it exceeds the limit
 * @param text
 * @param maxLength defaults to 100
 * @returns
 */
export const truncateText = (text: string | null, maxLength: number = 100): string => {
  if (!text || text.length <= maxLength) return text || "";
  return text.substring(0, maxLength).trim() + "...";
};

/**
 * Swaps 'from' and 'to' slugs
 * @param slug
 * @returns
 */
export const swapFromTo = (slug: "from" | "to") => {
  return slug === "from" ? "to" : "from";
};
export function formatPriceSignificant(value: string | number, fixedNum = 8) {
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
    let fixed = num.toFixed(fixedNum);
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

  const [{ value: month }, , { value: day }] = monthDayFormatter.formatToParts(date);
  const weekday = weekdayFormatter.format(date);

  return {
    date: `${month}’ ${day}`,
    weekday,
  };
}

/**
 * Function to format a string so that it only contains numbers, only has one decimal places and it removes other decimal places
 * @param value string
 * @returns string
 */
export const formatNumber = (value: string) => {
  const cleanValue = value.replace(/[^0-9.]/g, "");

  const [integerPart, decimalPart] = cleanValue.split(".");

  const formattedInteger = integerPart || "";
  return decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
};

/**
 * Function to append decimal places to an amount
 * @param amount amount to be operated on
 * @param decimal decimal places to be added
 * @returns
 */
export const appendDecimal = (amount?: string, decimal?: number): string => {
  if (!amount) return "0";
  if (!decimal) return amount;
  const multiplier = Math.pow(10, decimal);
  const fixed = parseFloat(amount) * multiplier;
  return fixed.toLocaleString("fullwide", { useGrouping: false });
};

export function formatNewsDate(date: Date = new Date(), timeZone?: string): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone,
  });

  const parts = formatter.formatToParts(date);

  const month = parts.find((p) => p.type === "month")?.value?.toUpperCase();
  const day = parts.find((p) => p.type === "day")?.value;
  const year = parts.find((p) => p.type === "year")?.value;

  return `${month} ${day}, ${year}`;
}

export function formatChartTooltipDate(dateInput: Date | string | number): string {
  const date = new Date(dateInput);

  const optionsDate: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const optionsTime: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };

  const datePart = date.toLocaleDateString("en-US", optionsDate);
  const timePart = date.toLocaleTimeString("en-US", optionsTime);
  return `${datePart}, ${timePart}`;
}
/**
 * Function to remove decimal places from an amount based on the decimal param
 * @param decimal the decimal places to be removed
 * @param amount amount to be operated on
 * @returns
 */
export const removeDecimal = (amount: string | number, decimal: number): string => {
  if (!amount || amount === "0") return "0.0";
  if (isNaN(Number(amount))) return "0.0";
  const strAmount = amount.toString();
  let isNegative = false;
  if (amount.toString().split("")[0] === "-") {
    isNegative = true;
  }

  const absStrAmount = Math.abs(Number(strAmount)).toString();
  const position = absStrAmount.length - decimal;

  let retValue;
  if (position <= 0) {
    retValue = "0." + "0".repeat(Math.abs(position)) + absStrAmount;
  } else {
    retValue = absStrAmount.slice(0, position) + "." + absStrAmount.slice(position);
  }
  return isNegative ? "-" + retValue : retValue;
};

/**
 * Cleans special HTML entities and characters from a text string.
 * @param text The input text containing special characters/entities.
 * @returns The cleaned, human-readable string.
 */
export function cleanSpecialChars(text: string): string {
  if (!text) return "";
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&#x60;/g, "`")
    .replace(/&#x3D;/g, "=")
    .replace(/&#x27;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"');
}

function _formatMarketCapNumber(num: number) {
  const abs = Math.abs(num);

  if (abs >= 1_000_000_000_000) {
    return `${(num / 1_000_000_000_000).toFixed(2).replace(/\.00$/, "")}T`;
  } else if (abs >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(2).replace(/\.00$/, "")}B`;
  } else if (abs >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2).replace(/\.00$/, "")}M`;
  } else if (abs >= 1_000) {
    return `${(num / 1_000).toFixed(2).replace(/\.00$/, "")}K`;
  } else {
    return num.toString();
  }
}

export function formatMarketCapNumber(value: number | string, withCurrency = true) {
  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num)) return "";

  if (!withCurrency) {
    return _formatMarketCapNumber(num);
  }

  return `$${_formatMarketCapNumber(num)}`;
}

export const modalSlide = {
  hidden: {
    y: 100,
    opacity: 0,
  },
  visible: {
    y: "0%",
    opacity: 1,
    transition: {
      type: "tween",
      ease: "easeInOut",
      duration: 0.2,
    },
  },
  exit: {
    y: 100,
    opacity: 0,
    transition: {
      ease: "easeInOut",
      duration: 0.2,
    },
  },
};

export function handleFearGreedLabel(value: number) {
  if (!value || value < 0 || value > 100) {
    return "";
  }

  if (value <= 19) return "EXTREME FEAR";
  if (value <= 39) return "FEAR";
  if (value <= 59) return "NEUTRAL";
  if (value <= 79) return "GREED";
  return "EXTREME GREED";
}

export function getOverlayRoot(): HTMLElement | null {
  if (typeof window === "undefined") return null;
  return document.getElementById("overlay-root");
}

export function formatNewsWidgetTime(date?: string) {
  if (!date) return "";
  const _date = new Date(date);
  const timeString = _date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return timeString;
}

export function generateSocialLinks(newsUrl: string) {
  const encodedUrl = encodeURIComponent(newsUrl);

  return {
    x: `https://twitter.com/intent/tweet?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}`,
  };
}

export function generateAudioLink(newsId: string) {
  return `https://storage.googleapis.com/fomoed_news_summary_audio/${newsId}.mp3`;
}

export function formatAudioTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function formatCountdown(timeSlot: Date | string | number) {
  if (!timeSlot) return "00:00";
  const targetDate = new Date(timeSlot);
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();

  if (diff <= 0) return "00:00";

  const totalSeconds = Math.floor(diff / 1000);

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");

  return `${pad(minutes)}:${pad(seconds)}`;
}

export function getAvatarUrl(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
}

/**
 * Save data to localStorage with JSON serialization
 * @param key - The key to store the data under
 * @param value - The value to store (will be JSON stringified)
 * @returns boolean - true if successful, false if failed
 */
export function saveToLocalStorage<T>(key: string, value: T): boolean {
  try {
    if (typeof window === "undefined") {
      console.warn("localStorage is not available in this environment");
      return false;
    }

    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
    return true;
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
    return false;
  }
}

/**
 * Retrieve data from localStorage with JSON deserialization
 * @param key - The key to retrieve data for
 * @param defaultValue - Default value to return if key doesn't exist or parsing fails
 * @returns The parsed value or defaultValue
 */
export function getFromLocalStorage(key: string) {
  try {
    if (typeof window === "undefined") {
      console.warn("localStorage is not available in this environment");
      return null;
    }

    const item = localStorage.getItem(key);

    if (!item) {
      return null;
    }

    return JSON.parse(item);
  } catch (error) {
    console.error("Failed to retrieve from localStorage:", error);
    return null;
  }
}

/**
 * Check if a token has expired based on its expiresAt timestamp
 * @param expiresAt - ISO date string indicating when the token expires
 * @param bufferMinutes - Optional buffer time in minutes to consider token expired before actual expiry (default: 0)
 * @returns boolean - true if token is expired, false if still valid
 */
export function isTokenExpired(expiresAt: string, bufferMinutes: number = 0): boolean {
  try {
    if (!expiresAt) return true;

    const expiryDate = new Date(expiresAt);
    const now = new Date();

    // Add buffer time if specified (convert minutes to milliseconds)
    const bufferMs = bufferMinutes * 60 * 1000;
    const effectiveExpiryTime = expiryDate.getTime() - bufferMs;

    return now.getTime() >= effectiveExpiryTime;
  } catch (error) {
    console.error("Failed to parse expiry date:", error);
    return true; // Consider expired if we can't parse the date
  }
}

/**
 * Remove data from localStorage
 * @param key - The key to remove from localStorage
 * @returns boolean - true if successful, false if failed
 */
export function removeFromLocalStorage(key: string): boolean {
  try {
    if (typeof window === "undefined") {
      console.warn("localStorage is not available in this environment");
      return false;
    }

    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error("Failed to remove from localStorage:", error);
    return false;
  }
}

/**
 * CryptoUtils formatting functions for currency, percentage, and large numbers
 */
export class CryptoUtils {
  /**
   * Format a number as currency with commas and dollar sign
   * @param value - The number or string to format
   * @param currency - Currency symbol (default: '$')
   * @param locale - Locale for formatting (default: 'en-US')
   * @returns Formatted currency string
   */
  static formatCurrency(value: number | string, currency: string = "$", locale: string = "en-US"): string {
    const numValue = typeof value === "string" ? parseFloat(value) : value;

    if (typeof numValue !== "number" || isNaN(numValue)) {
      return `${currency}0.00`;
    }

    const formatter = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return `${currency}${formatter.format(numValue)}`;
  }

  /**
   * Format a number as percentage
   * @param value - The number or string to format (e.g., 25.5 for 25.5%)
   * @param decimals - Number of decimal places (default: 2)
   * @returns Formatted percentage string
   */
  static formatPercentage(value: number | string, decimals: number = 2): string {
    const numValue = typeof value === "string" ? parseFloat(value) : value;

    if (typeof numValue !== "number" || isNaN(numValue)) {
      return "0.00";
    }

    return `${(numValue * 100).toFixed(decimals)}`;
  }

  /**
   * Format large numbers with K, M, B, T suffixes
   * @param value - The number or string to format
   * @param decimals - Number of decimal places (default: 2)
   * @returns Formatted large number string
   */
  static formatLargeNumber(value: number | string, decimals: number = 2): string {
    const numValue = typeof value === "string" ? parseFloat(value) : value;

    if (typeof numValue !== "number" || isNaN(numValue)) {
      return "0";
    }

    const absValue = Math.abs(numValue);
    const sign = numValue < 0 ? "-" : "";

    if (absValue >= 1e12) {
      return `${sign}${(absValue / 1e12).toFixed(decimals)}T`;
    } else if (absValue >= 1e9) {
      return `${sign}${(absValue / 1e9).toFixed(decimals)}B`;
    } else if (absValue >= 1e6) {
      return `${sign}${(absValue / 1e6).toFixed(decimals)}M`;
    } else if (absValue >= 1e3) {
      return `${sign}${(absValue / 1e3).toFixed(decimals)}K`;
    } else {
      return `${sign}${absValue.toFixed(decimals)}`;
    }
  }
}

export function formatDateMMDDYYFromUnix(unixSeconds: number) {
  // convert seconds → milliseconds
  const date = new Date(unixSeconds * 1000);

  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yy = String(date.getFullYear()).slice(-2);

  return `${mm}/${dd}/${yy}`;
}

export function shortenString(str: string, maxLength = 10): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "..";
}

export function getNextBarTime(barTime: number, resolution: string) {
  const date = new Date(barTime);

  switch (resolution) {
    case "1D":
    case "1440":
      date.setUTCDate(date.getUTCDate() + 1);
      date.setUTCHours(0, 0, 0, 0);
      break;

    case "1W":
    case "10080":
      date.setUTCDate(date.getUTCDate() + 7);
      date.setUTCHours(0, 0, 0, 0);
      break;

    case "1M":
    case "43200":
      date.setUTCMonth(date.getUTCMonth() + 1);
      date.setUTCDate(1);
      date.setUTCHours(0, 0, 0, 0);
      break;

    default:
      const interval = parseInt(resolution);
      if (!isNaN(interval)) {
        date.setUTCMinutes(date.getUTCMinutes() + interval);
      }
      break;
  }

  return date.getTime();
}

export function hyperliquidFormatPriceChange(
  current: number | string,
  previous: number | string,
  volume?: number | string,
  openInterest?: number | string,
) {
  // Convert inputs to numbers
  const currentNum = Number(current);
  const previousNum = Number(previous);
  const volumeNum = volume !== undefined ? Number(volume) : undefined;
  const openInterestNum = openInterest !== undefined ? Number(openInterest) : undefined;

  // Handle invalid inputs
  if (isNaN(currentNum) || isNaN(previousNum)) {
    return {
      currentPrice: "0",
      priceChange: "0",
      priceChangePercent: "0.00%",
      volume: volumeNum ? volumeNum.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "0",
      openInterest: openInterestNum ? openInterestNum.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "0",
      isPositive: false,
    };
  }

  // Calculate price change and percent change
  const priceChange = currentNum - previousNum;
  const priceChangePercent = (priceChange / previousNum) * 100;
  const isPositive = priceChange > 0;

  // Determine decimal places based on current price
  const currentDecimals = current.toString().split(".")[1]?.length || 0;

  // Format numbers
  const formattedCurrent = currentNum.toLocaleString(undefined, {
    minimumFractionDigits: currentDecimals,
    maximumFractionDigits: currentDecimals,
  });

  const formattedChange = priceChange.toLocaleString(undefined, {
    minimumFractionDigits: currentDecimals,
    maximumFractionDigits: currentDecimals,
  });

  const formattedPercent = `${priceChangePercent.toFixed(2)}%`;

  const formattedVolume =
    volumeNum !== undefined && !isNaN(volumeNum)
      ? `$${volumeNum.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
      : "-";

  const formattedOpenInterest =
    openInterestNum !== undefined && !isNaN(openInterestNum)
      ? `$${openInterestNum.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
      : "-";

  return {
    currentPrice: formattedCurrent,
    priceChange: formattedChange,
    priceChangePercent: formattedPercent,
    volume: formattedVolume,
    openInterest: formattedOpenInterest,
    isPositive,
  };
}

type PositionSide = "long" | "short";

export function calcMargin({ positionSize, leverage }: { positionSize: number; leverage: number }) {
  const marginRequired = positionSize / leverage;

  return marginRequired;
}

/**
 * Returns estimated liquidation price (mark-based) for isolated margin positions.
 * Returns `null` when calculation is not applicable (e.g., leverage <= 1).
 */
export function estimateLiqPrice({
  entryPrice,
  leverage,
  maintenanceRate,
  side,
}: {
  entryPrice: number; // E
  leverage: number; // >= 1 (exchanges usually treat 1x as non-margin)
  maintenanceRate: number; // mmr, e.g. 0.005
  side: PositionSide;
}): number | null {
  if (!isFinite(entryPrice) || entryPrice <= 0) return null;
  if (!isFinite(leverage) || leverage <= 1) return null; // treat 1x as NA
  if (!isFinite(maintenanceRate) || maintenanceRate < 0 || maintenanceRate >= 1) return null;

  const invLev = 1 / leverage;

  if (side === "long") {
    const denom = 1 - maintenanceRate;
    if (denom <= 0) return null;
    const numerator = 1 - invLev; // (1 - 1/lev)
    return entryPrice * (numerator / denom);
  } else {
    // short
    const denom = 1 + maintenanceRate;
    const numerator = 1 + invLev; // (1 + 1/lev)
    return entryPrice * (numerator / denom);
  }
}
