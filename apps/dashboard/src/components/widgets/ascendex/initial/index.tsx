import React, { Fragment, useEffect, useState } from "react";
import InitialScreen from "./initial-screen";
import { RenderIf } from "@/components/shared";
import ExchangePicker from "./exchange-picker";
import LoadingScreen from "./loading-screen";

type WidgetState = "initial" | "exchange-picker" | "loading";

interface IProps {
  handleIsLoaded: () => void;
}

export function LandingScreen(props: IProps) {
  const { handleIsLoaded } = props;
  const [state, setState] = useState<WidgetState>("initial");

  useEffect(() => {
    if (state === "loading") {
      const timer = setTimeout(() => {
        handleIsLoaded();
      }, 20000);
      return () => clearTimeout(timer);
    }
  }, [state, handleIsLoaded]);

  return (
    <Fragment>
      <RenderIf condition={state === "initial"}>
        <InitialScreen
          onTradeNowClick={() => {
            setState("exchange-picker");
          }}
        />
      </RenderIf>

      <RenderIf condition={state === "exchange-picker"}>
        <ExchangePicker
          onExchangeSelect={() => {
            setState("loading");
          }}
        />
      </RenderIf>

      <RenderIf condition={state === "loading"}>
        <LoadingScreen />
      </RenderIf>
    </Fragment>
  );
}
