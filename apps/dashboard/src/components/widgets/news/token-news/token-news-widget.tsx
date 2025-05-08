import { LayoutType, updateWidgetPropsAtom } from "@/lib/atoms/layoutAtom";
import React from "react";
import WidgetHeader from "../../shared/widget-header";
import TokenDropdown from "../../shared/token-dropdown";
import { useAtomValue, useSetAtom } from "jotai";
import { useReadCoinList } from "@/services/queries/charts";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";
import dashboard from "@/lib/assets/dashboard";
import Image from "next/image";

interface IProps {
  widget: LayoutType["widgets"][0];
}

const newsData = [
  {
    name: "Bitcoin Ledger Bug Patched After  Flaw Spotted in XRPL Library",
    date: "APR 5, 2025",
    sentiment: "BULLISH",

    image: dashboard.news,
  },
  {
    name: "Bitcoin Ledger Bug Patched After  Flaw Spotted in XRPL Library",
    date: "APR 5, 2025",
    sentiment: "BULLISH",

    image: dashboard.news,
  },
  {
    name: "Bitcoin Ledger Bug Patched After  Flaw Spotted in XRPL Library",
    date: "APR 5, 2025",
    sentiment: "BULLISH",

    image: dashboard.news,
  },
];

const TokenNewsWidget = (props: IProps) => {
  const { widget } = props;
  const { data: coinData } = useReadCoinList();
  const activeLayout = useAtomValue(activeTabAtom);
  const updateWidgetPropsFromAtom = useSetAtom(updateWidgetPropsAtom);
  return (
    <div className="bg-[#080808] border border-[#1b1b1b] rounded-[12px] px-3 py-3 flex flex-col gap-4 h-full">
      <div className="flex flex-col items-center justify-center w-full h-full">
        <div className="grid items-center w-full grid-cols-3">
          <WidgetHeader widget={widget} />
        </div>
        <div className="flex flex-col justify-center w-full h-full bg-[#121212] rounded-[12px] mt-2">
          {coinData ? (
            <div className="px-[0.875rem] py-3 border-b border-[#1E1E1E] flex items-center justify-between">
              {/* <h3 className="text-sm font-medium text-white">Popular</h3> */}
              <TokenDropdown
                options={coinData || []}
                value={widget.props?.token}
                setValue={(coin: string) => {
                  updateWidgetPropsFromAtom({
                    tabId: activeLayout.id,
                    widgetId: widget.id,
                    widgetProps: { ...widget.props, token: coin },
                  });
                }}
              />
            </div>
          ) : null}
          <div className="flex flex-col flex-grow gap-5 px-4 py-3">
            {newsData.map((item, i) => (
              <div key={i}>
                <div className="pb-2">
                  <Image
                    src={item.image}
                    alt="News Icon"
                    width={14}
                    height={14}
                  />
                </div>
                <div className="">
                  <span className="text-sm font-medium text-white ">
                    {item.name}
                  </span>{" "}
                  <span>
                    <span className="text-[#FF3B10]">•</span>{" "}
                    <span className="text-[#A5A5A5] text-[0.625rem]">
                      {item.date}
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenNewsWidget;
