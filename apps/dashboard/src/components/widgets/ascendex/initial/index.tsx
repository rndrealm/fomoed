import React, { Fragment, useEffect, useState } from "react";
import InitialScreen from "./initial-screen";
import { RenderIf } from "@/components/shared";
import ExchangePicker from "./exchange-picker";
import LoadingScreen from "./loading-screen";
import { LayoutType } from "@/lib/atoms/layoutAtom";
import { WidgetWrapper } from "../../shared";
import HyperliquidAuth from "./hyperliquid-auth";

type WidgetState =
  | "initial"
  | "exchange-picker"
  | "hyperliquid"
  | "bybit"
  | "coinw"
  | "backpack"
  | "ascendex"
  | "binance"
  | "loading";

interface IProps {
  handleIsLoaded: () => void;
  widget: LayoutType["widgets"][0];
}

export function LandingScreen(props: IProps) {
  const { handleIsLoaded, widget } = props;
  const [state, setState] = useState<WidgetState>("exchange-picker");

  // useEffect(() => {
  //   if (state === "loading") {
  //     const timer = setTimeout(() => {
  //       handleIsLoaded();
  //     }, 20000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [state]);

  return (
    <Fragment>
      <WidgetWrapper
        title="Hyperliquid"
        widget={widget}
        handleLearnMore={() => {
          // setShowInfo(true);
        }}
        className=""
        headerClassName=""
        titleIcon="coinstats"
      >
        <RenderIf condition={state === "initial"}>
          <InitialScreen
            onTradeNowClick={() => {
              setState("exchange-picker");
            }}
          />
        </RenderIf>

        <RenderIf condition={state === "exchange-picker"}>
          <ExchangePicker
            onExchangeSelect={(exchange) => {
              setState(exchange);
            }}
          />
        </RenderIf>

        <RenderIf condition={state === "hyperliquid"}>
          <HyperliquidAuth
            onExchangeSelect={() => {
              setState("loading");
            }}
          />
        </RenderIf>

        <RenderIf condition={state === "loading"}>
          <LoadingScreen />
        </RenderIf>
      </WidgetWrapper>
    </Fragment>
  );
}
