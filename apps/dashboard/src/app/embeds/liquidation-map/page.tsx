"use client";

import { useSearchParams } from "next/navigation";
import LiquidationMapWidget from "@/components/widgets/liquidation-map/liquidation/liquidation-widget";
import { Suspense } from "react";

function Suspensed() {
    const searchParams = useSearchParams();
    const symbol = searchParams.get("symbol");

    return <LiquidationMapWidget isEmbed symbol={symbol ? symbol.toUpperCase() : null} />;
}

export default function DetailedCfgiEmbed() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Suspensed />
        </Suspense>
    );
}
