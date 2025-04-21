import { ExchangePairOption } from "@/charts/types";
import {
  InstrumentInfo,
  SupportedPairsData,
} from "@/services/queries/charts/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
