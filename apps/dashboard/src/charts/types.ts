import { InstrumentInfo } from "@/services/queries/charts/types";

interface LabelingOptions {
  scaleId: string;
  label: string;
  widthComputeString?: string;

  // Chart JS somehow automatically calls the function when the plugin option is a function,
  // That is why these are functions returning functions.

  getTextColor?: () => (val: any) => string;
  getText: () => (val: number) => string;
}

export interface CrosshairPluginConfig {
  labels: LabelingOptions[];
  crosshairEnableDelay?: number;
  labelStackDirection: "horizontal" | "vertical";
}

export interface ExchangePairOption {
  label: string;
  value: InstrumentInfo;
}
