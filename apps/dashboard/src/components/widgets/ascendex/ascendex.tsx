"use client";
import React, { useState, Fragment } from "react";
import { LayoutType } from "@/lib/atoms/layoutAtom";
import { cn } from "@/lib/utils";
import AscendexHeader from "./header";
import CreateOrder from "./create-order";
import OrderBookAndTrade from "./order-book-and-trade";
import { RenderIf } from "@/components/shared";
import { LandingScreen } from "./initial";

interface IProps {
  widget: LayoutType["widgets"][0];
}

export default function Ascendex(props: IProps) {
  const { widget } = props;
  const [isLoaded, setIsLoaded] = useState(true);

  return (
    <Fragment>
      <RenderIf condition={!isLoaded}>
        <LandingScreen
          handleIsLoaded={() => {
            setIsLoaded(true);
          }}
        />
      </RenderIf>

      <RenderIf condition={isLoaded}>
        <div className="relative flex h-full w-full justify-center items-center">
          <div
            className={cn(
              "relative flex h-full w-full flex-col gap-2 overflow-hidden rounded-2xl",
              "px-0 pb-0 bg-[#000]",
            )}
          >
            {/* Header */}
            <AscendexHeader widget={widget} />

            {/* Content */}
            <div className="flex h-full w-full flex-1 overflow-hidden gap-3 px-2 pb-2">
              <div className="flex-1">
                <p className="text-white">HELLO FROM ASCENDEX</p>
              </div>

              {/* Order Book and Trades Component */}
              <OrderBookAndTrade />

              {/* Create Order Component */}
              <CreateOrder />
            </div>
          </div>
        </div>
      </RenderIf>
    </Fragment>
  );
}
