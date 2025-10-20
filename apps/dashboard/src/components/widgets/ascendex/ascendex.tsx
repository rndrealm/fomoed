"use client";
import React, { useState, Fragment } from "react";
import { LayoutType } from "@/lib/atoms/layoutAtom";
import { cn } from "@/lib/utils";
import AscendexHeader from "./header";
import CreateOrder from "./create-order";
import OrderBookAndTrade from "./order-book-and-trade";
import { RenderIf } from "@/components/shared";
import { LandingScreen } from "./initial";
import ChartHeader from "./chart/chart-header";

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
            <AscendexHeader widget={widget} />

            <div className="flex h-full w-full flex-1 overflow-hidden gap-3 px-2 pb-2">
              <div className="flex-1 flex flex-col gap-2 min-w-0 overflow-hidden">
                <ChartHeader />
                
                {/* Chart placeholder */}
                <div className="flex-1 bg-[#121317] rounded-[6px]">
                  {/* Add chart here*/}
                </div>
              </div>

              <OrderBookAndTrade />

              <CreateOrder />
            </div>
          </div>
        </div>
      </RenderIf>
    </Fragment>
  );
}