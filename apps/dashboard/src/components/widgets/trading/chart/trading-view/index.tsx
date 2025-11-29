import React, { Fragment, useEffect, useState } from "react";
import Script from "next/script";
import dynamic from "next/dynamic";
import { RenderIf, SkeletonLoader } from "@/components/shared";

const TradingViewChart = dynamic(() => import("./trading-view").then((mod) => mod.TradingViewChart), {
  ssr: false,
  loading: () => <SkeletonLoader widthFull heightFull backgroundColor="#121317" borderRadius={0} />,
});

export function TradingView() {
  const [isScriptReady, setIsScriptReady] = useState(false);

  return (
    <Fragment>
      <Script
        src="/static/datafeeds/udf/dist/bundle.js"
        strategy="lazyOnload"
        onReady={() => {
          setIsScriptReady(true);
        }}
      />

      {/* <RenderIf condition={isScriptReady}> */}
      <TradingViewChart />
      {/* </RenderIf> */}
    </Fragment>
  );
}
