"use client";
import React from "react";
import { motion } from "motion/react";
import PriceTokenDropdown from "../shared/price-token-dropdown";
import { LayoutType, updateWidgetPropsAtom } from "@/lib/atoms/layoutAtom";
import { useAtomValue, useSetAtom } from "jotai";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";
import { useFetchBinanceTokens } from "@/services/queries/charts";
import { geoLocationAtom } from "@/lib/atoms/geoLocation";
import { settingAtom, updateSettingAtom } from "@/lib/atoms/settingsAtom";
import { splitWidgetSlug } from "@/lib/utils";
import StarFilled from "@/components/icons/StarFilled";
import Star from "@/components/icons/Star";
import { Question } from "@/components/icons/icons";
import { OptionsDropdown } from "../shared/options-dropwdown";
import PeriodDropdown from "../shared/period-dropdown";
import WeightedChart from "./chart";
import { useReadSantimentTokenList } from "@/services/queries/santiment";
import useSession from "@/lib/hooks/use-session";

const pricePeriodOptions = [
  { value: "5m", label: "5M" },
  { value: "1h", label: "1H" },
  { value: "8h", label: "8H" },
  { value: "1d", label: "1D" },
];

interface IProps {
  widget: LayoutType["widgets"][0];
}

export default function WeightedSentiment(props: IProps) {
  const { widget } = props;

  const user = useSession();

  const location = useAtomValue(geoLocationAtom);
  const { data: coinData = [] } = useFetchBinanceTokens(location?.country);

  const { data: tokenList = [] } = useReadSantimentTokenList({
    auth_token: user?.access_token,
  });

  console.log(tokenList);

  const activeLayout = useAtomValue(activeTabAtom);
  const updateWidgetPropsFromAtom = useSetAtom(updateWidgetPropsAtom);

  const settings = useAtomValue(settingAtom);
  const updateSettings = useSetAtom(updateSettingAtom);

  const widgetSlug = splitWidgetSlug(widget.meta.i).slug;

  return (
    <div className="relative flex h-full flex-col gap-0 rounded-2xl bg-[#000] pt-0 pb-2">
      <div className="flex flex-col gap-1">
        <div className="flex cursor-grab justify-center pt-4 pb-1">
          <div className="h-[5px] w-[36px] rounded-[2px] bg-[#444]"></div>
        </div>

        <div className="mb-1 flex items-center justify-between px-4">
          <div className="">
            <PriceTokenDropdown
              options={coinData}
              setValue={(coin: string) => {
                // setSelectedPair(newPairs[0]);
                updateWidgetPropsFromAtom({
                  tabId: activeLayout.id,
                  widgetId: widget.id,
                  widgetProps: {
                    ...widget.props,
                    token: coin,
                  },
                });
              }}
              value={widget?.props?.token}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const isFavorite =
                  settings.favorite_widgets.includes(widgetSlug);

                let newWidgetArray: string[] = [];

                if (isFavorite) {
                  newWidgetArray = settings.favorite_widgets.filter(
                    (item) => item !== widgetSlug,
                  );
                } else {
                  newWidgetArray = [...settings.favorite_widgets, widgetSlug];
                }
                updateSettings({
                  ...settings,
                  favorite_widgets: newWidgetArray,
                });
              }}
            >
              {settings.favorite_widgets.includes(widgetSlug) ? (
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: [-30, 30, -15, 15, 0] }}
                  transition={{
                    duration: 1,
                    times: [0, 0.2, 0.4, 0.8, 1],
                  }}
                >
                  <StarFilled />
                </motion.div>
              ) : (
                <Star />
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                // setShowInfo(true);
              }}
            >
              <Question />
            </button>
            <OptionsDropdown widget={widget} />
          </div>
        </div>
      </div>
      <div className="relative flex flex-1">
        <div className="absolute top-[4px] right-0 left-0 z-[999]">
          <div className="flex items-center justify-between px-4 pt-3">
            <div className=""></div>
            {/* <LivePrice token={widget?.props?.token} /> */}

            <div className="flex items-center gap-2">
              <PeriodDropdown
                options={pricePeriodOptions}
                value={widget?.props?.period}
                setValue={(value: string) => {
                  updateWidgetPropsFromAtom({
                    tabId: activeLayout.id,
                    widgetId: widget.id,
                    widgetProps: { ...widget.props, period: value },
                  });
                }}
                triggerClassName="h-6 w-15"
              />
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 bottom-0 left-0">
          <WeightedChart />
        </div>
      </div>

      {/* <div
        className="absolute right-[9px] bottom-[16px] z-[9] h-[28px] w-[28px] rounded-md border border-[#1c1c1c]"
        style={{
          background:
            "linear-gradient(180deg, #1b1b1b 0%, rgba(0, 0, 0, 0.38) 72.15%)",
          backdropFilter: "blur(7px)",
        }}
      >
        <button
            className="flex h-full w-full items-center justify-center"
            onClick={() => {
              setIsFullscreen(true);
            }}
          >
            <FullScreen />
          </button>
      </div> */}
    </div>
  );
}
