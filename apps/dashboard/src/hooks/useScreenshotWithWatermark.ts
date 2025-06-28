import { RefObject, useCallback } from "react";
import html2canvas from "html2canvas-pro";

interface ScreenshotOptions {
  watermarkText?: string;
  font?: string;
  color?: string;
  margin?: number;
  file?: string;
}

export function useScreenshotWithWatermark({
  watermarkText = "app.fomoed.io",
  font = "46px sans-serif",
  color = "#ff0000",
  // color = "rgba(255, 255, 255, 0.5)",
  file = "chart.png",
}: ScreenshotOptions = {}) {
  const takeScreenshot = useCallback(
    async (elementRef: RefObject<HTMLElement | null>) => {
      if (!elementRef?.current) return;

      const canvas = await html2canvas(elementRef.current, {
        backgroundColor: null,
        scale: 1,
      });

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Add watermark
      ctx.font = font;
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(watermarkText, 0, 0);
      // ctx.fillText(watermarkText, canvas.width / 2, canvas.height / 2);

      const link = document.createElement("a");
      link.download = file;
      link.href = canvas.toDataURL("image/png");
      link.click();
    },
    [watermarkText, font, color, file]
  );

  return takeScreenshot;
}
