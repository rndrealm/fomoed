import Chart from "chart.js/auto";
export function commaFormatNumber(val: number) {
  const nf = new Intl.NumberFormat("en-US");
  return nf.format(val);
}

export async function registerChartPluginZoomInBrowser() {
  if (!window) return;

  const pluginZoom = await import("chartjs-plugin-zoom");

  Chart.register(pluginZoom.default);
}
