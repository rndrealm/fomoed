"use client";
import React, { useState, Fragment } from "react";
import { LayoutType } from "@/lib/atoms/layoutAtom";
import { RenderIf } from "@/components/shared";

import { LandingScreen } from "./initial";
import HyperliquidWidget from "./hyperliquid";

interface IProps {
  widget: LayoutType["widgets"][0];
}

const selectedExchange = "hyperliquid";

export default function Trading(props: IProps) {
  const { widget } = props;

  const [isLoaded, setIsLoaded] = useState(true);

  return (
    <Fragment>
      <RenderIf condition={!isLoaded}>
        <LandingScreen
          widget={widget}
          handleIsLoaded={() => {
            setIsLoaded(true);
          }}
        />
      </RenderIf>

      <RenderIf condition={isLoaded && selectedExchange === "hyperliquid"}>
        <HyperliquidWidget widget={widget} />
      </RenderIf>
    </Fragment>
  );
}
