"use client";

import { useSearchParams } from "next/navigation";
import LiquidationMapWidget from "@/components/widgets/liquidation-map/liquidation/liquidation-widget";

export default function DetailedCfgiEmbed() {
    const searchParams = useSearchParams();
    const symbol = searchParams.get("symbol");

    return <LiquidationMapWidget isEmbed symbol={symbol ? symbol.toUpperCase() : null} />;
}
