"use client";

import { useSearchParams } from "next/navigation";
import DetailedCfgiWidget from "@/components/widgets/cfgi/detailed-cfgi/detailed-cfgi-widget";
import { Suspense } from "react";

function Suspensed() {
  const searchParams = useSearchParams();
  const symbol = searchParams.get("symbol");

  // return <DetailedCfgiWidget isEmbed symbol={symbol ? symbol.toUpperCase() : null} />;
  return <></>;
}

export default function DetailedCfgiEmbed() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Suspensed />
    </Suspense>
  );
}
