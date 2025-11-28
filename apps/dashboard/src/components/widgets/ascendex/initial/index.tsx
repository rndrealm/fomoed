import React, { Fragment, useEffect, useState } from "react";
import InitialScreen from "./initial-screen";
import { RenderIf } from "@/components/shared";
import ExchangePicker from "./exchange-picker";
import LoadingScreen from "./loading-screen";
import { LayoutType } from "@/lib/atoms/layoutAtom";
import { WidgetWrapper } from "../../shared";
import HyperliquidAuth from "./hyperliquid-auth";
import HyperliquidEnd from "./hyperliquid-end";

type WidgetState =
  | "initial"
  | "exchange-picker"
  | "bybit"
  | "hyperliquid"
  | "hyperliquid-end"
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
  // const [state, setState] = useState<WidgetState>("hyperliquid-end");
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
            onExchangeSelect={(exchange) => {
              setState(exchange);
            }}
            onBack={() => {
              setState("exchange-picker");
            }}
          />
        </RenderIf>

        <RenderIf condition={state === "hyperliquid-end"}>
          <HyperliquidEnd
            onStart={() => {
              handleIsLoaded();
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
