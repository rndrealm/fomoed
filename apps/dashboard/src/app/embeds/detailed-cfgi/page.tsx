"use client";

import { useSearchParams } from "next/navigation";
import DetailedCfgiWidget from "@/components/widgets/cfgi/detailed-cfgi/detailed-cfgi-widget";

export default function DetailedCfgiEmbed() {
    const searchParams = useSearchParams();
    const symbol = searchParams.get("symbol");

    return <DetailedCfgiWidget isEmbed symbol={symbol} />;
}
