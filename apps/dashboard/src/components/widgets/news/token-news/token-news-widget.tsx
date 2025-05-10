import { LayoutType, updateWidgetPropsAtom } from "@/lib/atoms/layoutAtom";
import React from "react";
import WidgetHeader from "../../shared/widget-header";
import TokenDropdown from "../../shared/token-dropdown";
import { useAtomValue, useSetAtom } from "jotai";
import { useReadCoinList } from "@/services/queries/charts";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";
import dashboard from "@/lib/assets/dashboard";
import Image from "next/image";
import { useReadTokenNews } from "@/services/queries/news";
import { cn, timeAgo } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import AssetPill from "../../shared/asset-pill";

interface IProps {
  widget: LayoutType["widgets"][0];
}

const TokenNewsWidget = (props: IProps) => {
  const { widget } = props;
  const { data: coinData } = useReadCoinList();
  const activeLayout = useAtomValue(activeTabAtom);
  const updateWidgetPropsFromAtom = useSetAtom(updateWidgetPropsAtom);
  const { data: newsData } = useReadTokenNews(widget.props.token);

  return (
    <div className="bg-[#080808] border border-[#1b1b1b] rounded-[12px] px-3 py-3 h-full flex flex-col items-center justify-center flex-1 w-full ">
      <div className="grid items-center w-full grid-cols-3">
        <WidgetHeader widget={widget} />
      </div>
      <div className="flex flex-col  w-full h-full bg-[#121212] rounded-[12px] mt-2 overflow-auto">
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
        {newsData ? (
          <div className="flex flex-col flex-1 gap-5 px-4 py-3">
            {newsData?.map((item, i) => (
              <div key={i}>
                <div className="pb-2">
                  <Image
                    src={dashboard.cryptopanic}
                    alt="News Icon"
                    width={14}
                    height={14}
                  />
                </div>
                <div className="">
                  <span className="text-sm font-medium text-white ">
                    {item.title}
                  </span>{" "}
                  <span className="whitespace-nowrap">
                    <span className="text-[#FF3B10]">•</span>{" "}
                    <span className="text-[#A5A5A5] text-[0.625rem]">
                      {timeAgo(item.published_at)}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <div className="bg-[#202020] rounded-[8px] flex">
                    <p
                      className={cn(
                        "text-[0.625rem] font-medium uppercase  py-1 px-3 text-white",
                        {
                          "text-[#FF3B10]": item.sentiment === "bearish",
                          "text-[#00D743]": item.sentiment === "bullish",
                        }
                      )}
                    >
                      {item.sentiment}
                    </p>
                  </div>
                  <AssetPill symbol={widget.props.token || "BTC"} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Skeleton className="w-full h-full bg-widget-background-200" />
        )}
      </div>
    </div>
  );
};

export default TokenNewsWidget;
