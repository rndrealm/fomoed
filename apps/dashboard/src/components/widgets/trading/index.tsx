"use client";
import React, { useState, Fragment } from "react";
import { LayoutType } from "@/lib/atoms/layoutAtom";
import { RenderIf } from "@/components/shared";

import { LandingScreen } from "./initial";
import HyperliquidWidget from "./hyperliquid";
import { useAtomValue } from "jotai";
import { settingAtom } from "@/lib/atoms/settingsAtom";

interface IProps {
  widget: LayoutType["widgets"][0];
}

const selectedExchange = "hyperliquid";

export default function Trading(props: IProps) {
  const { widget } = props;
  const settings = useAtomValue(settingAtom);
  const [isLoaded, setIsLoaded] = useState(!!settings.exchange);

  return (
    <Fragment>
      <RenderIf condition={false}>
        <LandingScreen
          widget={widget}
          handleIsLoaded={() => {
            setIsLoaded(true);
          }}
        />
      </RenderIf>

      {/* <RenderIf condition={isLoaded && selectedExchange === "hyperliquid"}> */}
      <HyperliquidWidget widget={widget} />
      {/* </RenderIf> */}
    </Fragment>
  );
}
