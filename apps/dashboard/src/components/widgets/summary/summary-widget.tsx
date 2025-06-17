"use client";
import React, { useEffect, useState } from "react";
import { Delete, Ellipsis, Summary } from "@/components/icons/icons";
import { cn, formatSummaryDate } from "@/lib/utils";
import { Mover } from "./mover";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Loser } from "./loser";
import { useReadCoinList } from "@/services/queries/charts";
import { News } from "./news";
import { OptionsDropdown } from "../shared/options-dropwdown";
import { LayoutType } from "@/lib/atoms/layoutAtom";

interface IProps {
  widget: LayoutType["widgets"][0];
}

export default function SummaryWidget(props: IProps) {
  const { widget } = props;
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = React.useState(0);

  const { data: coinData = [] } = useReadCoinList(true);

  const { date, weekday } = formatSummaryDate();

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <div className="bg-[#000] p-4 pt-0 flex flex-col gap-4 rounded-2xl justify-between">
      <div className="flex flex-col gap-1">
        <div className="flex justify-center pt-4 pb-1 cursor-grab">
          <div className="w-[36px] h-[5px] bg-[#444] rounded-[2px]"></div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 gap-4">
            <Summary />
            <h3 className="font-semibold text-base text-[#878787] leading-[1.35] select-none">
              SUMMARY
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <OptionsDropdown widget={widget} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-[10px] flex-1">
        <div className="">
          <p className="text-semibold text-[13px] leading-[1.25] text-[#878787] select-none">
            {date}
          </p>
          <p className="text-semibold text-[13px] leading-[1.25] text-[#4B4B4B] select-none">
            {weekday}
          </p>
        </div>

        <Carousel setApi={setApi} className="select-none">
          <CarouselContent>
            <CarouselItem>
              <Mover data={coinData?.[0]} />
            </CarouselItem>
            <CarouselItem>
              <Loser data={coinData?.[coinData?.length - 1]} />
            </CarouselItem>
            <CarouselItem>
              <News />
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </div>

      <div className="flex justify-center gap-[2px] items-center mt-2">
        {Array(count)
          .fill(0)
          .map((_, index) => {
            const bg = index + 1 === current ? "bg-white" : "bg-[#373737]";

            return (
              <div
                key={index}
                className={cn("w-[6px] h-[6px] rounded-[50%]", bg)}
              ></div>
            );
          })}
      </div>
    </div>
  );
}
