"use client";
import React, { Fragment, useState } from "react";

import { CandleStick, Close, Delete, Ellipsis, FullScreen, Learn, LineChart, Question } from "@/components/icons/icons";
import { cn, modalSlide, splitWidgetSlug } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PeriodDropdown from "../shared/period-dropdown";
import { useFetchBinanceTokens } from "@/services/queries/charts";
import { LivePrice } from "./live-price";
import { deleteWidgetAtom, LayoutType, updateWidgetPropsAtom } from "@/lib/atoms/layoutAtom";
import { useAtomValue, useSetAtom } from "jotai";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";
import { pricePeriodOptions } from "@/constant";
import PriceTokenDropdown from "../shared/price-token-dropdown";
import { ConfirmationModal } from "@/components/modals";
import { chartsMap } from "@/lib/static";
import TestChart from "./test-chart";
import { geoLocationAtom } from "@/lib/atoms/geoLocation";
import { ModalContainer } from "@/components/shared";
import { TradingViewPriceHistory } from "./price-history";
import { AnimatePresence, motion } from "motion/react";
import Star from "@/components/icons/Star";
import { settingAtom, updateSettingAtom } from "@/lib/atoms/settingsAtom";
import StarFilled from "@/components/icons/StarFilled";

interface IOptionsDropdown {
  widget: LayoutType["widgets"][0];
}

function OptionsDropdown(props: IOptionsDropdown) {
  const { widget } = props;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteWidget, setDeleteWidget] = useState<LayoutType["widgets"][0]>();

  const deleteWidgetFromAtom = useSetAtom(deleteWidgetAtom);
  const activeLayout = useAtomValue(activeTabAtom);

  return (
    <Fragment>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex h-[24px] w-[24px] items-center justify-center">
            <Ellipsis />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="mt-4 w-[210px] rounded-lg border border-[#333] bg-[#090909]" align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="flex w-full cursor-pointer items-center justify-between p-[10px] text-[13px] leading-[1.25] font-normal text-[#D4D4D4] focus:bg-[#171717] focus:text-[#C3C3C3]"
              onSelect={() => {
                setDeleteWidget(widget);
                setShowDeleteModal(true);
              }}
            >
              Delete widget
              <Delete fill="#A2A2A2" />
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex w-full cursor-pointer items-center justify-between p-[10px] text-[13px] leading-[1.25] font-normal text-[#D4D4D4] focus:bg-[#171717] focus:text-[#C3C3C3]"
              onSelect={(e) => {
                e.preventDefault();
              }}
            >
              Learn more
              <Learn />
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmationModal
        handleCloseModal={() => {
          setShowDeleteModal(false);
          setDeleteWidget(undefined);
        }}
        open={showDeleteModal}
        title={`Delete ${chartsMap[splitWidgetSlug(deleteWidget?.meta.i || "").slug as keyof typeof chartsMap]?.name}?`}
        details="You can always add new widgets to your dashboard after widgets are deleted"
        cancelBtnText="Cancel"
        confirmBtnText="Delete Widget"
        handleConfirm={() => {
          if (!deleteWidget) return;
          deleteWidgetFromAtom({
            tabId: activeLayout.id,
            widgetId: deleteWidget.id,
          });
          setDeleteWidget(undefined);
          setShowDeleteModal(false);
        }}
      />
    </Fragment>
  );
}

interface IProps {
  widget: LayoutType["widgets"][0];
}

export default function NewPriceHistory(props: IProps) {
  const { widget } = props;

  const [isCandleStick, setIsCandleStick] = useState(false);
  const [isFullScreen, setIsFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const location = useAtomValue(geoLocationAtom);

  const { data: coinData = [] } = useFetchBinanceTokens(location?.country);

  const activeLayout = useAtomValue(activeTabAtom);
  const updateWidgetPropsFromAtom = useSetAtom(updateWidgetPropsAtom);

  const settings = useAtomValue(settingAtom);
  const updateSettings = useSetAtom(updateSettingAtom);

  const widgetSlug = splitWidgetSlug(widget.meta.i).slug;

  return (
    <Fragment>
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
                  const isFavorite = settings.favorite_widgets.includes(widgetSlug);

                  let newWidgetArray: string[] = [];

                  if (isFavorite) {
                    newWidgetArray = settings.favorite_widgets.filter((item) => item !== widgetSlug);
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
                  setShowInfo(true);
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
            <div className="flex items-center justify-between px-4">
              <LivePrice token={widget?.props?.token} />

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-[2px] rounded-[5px] bg-[#161616] p-[1px]">
                  <button
                    type="button"
                    className={cn(
                      "flex h-[22px] w-[32px] items-center justify-center rounded-sm",
                      isCandleStick ? "bg-[#434343]" : ""
                    )}
                    onClick={() => {
                      setIsCandleStick(true);
                    }}
                  >
                    <CandleStick active={isCandleStick} />
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "flex h-[22px] w-[32px] items-center justify-center rounded-sm",
                      !isCandleStick ? "bg-[#434343]" : ""
                    )}
                    onClick={() => {
                      setIsCandleStick(false);
                    }}
                  >
                    <LineChart active={!isCandleStick} />
                  </button>
                </div>

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
            <TestChart isCandleStick={isCandleStick} token={widget?.props?.token} period={widget?.props?.period} />
          </div>
          {/* <div className=""></div> */}

          {/* <ChartComponent
            data={data}
            token={widget?.props?.token}
            period={widget?.props?.period}
            isCandleStick={isCandleStick}
          /> */}
          {/* <TestChart
            isCandleStick={isCandleStick}
            token={widget?.props?.token}
            period={widget?.props?.period}
          /> */}
        </div>

        <div
          className="absolute right-[9px] bottom-[16px] z-[9] h-[28px] w-[28px] rounded-md border border-[#1c1c1c]"
          style={{
            background: "linear-gradient(180deg, #1b1b1b 0%, rgba(0, 0, 0, 0.38) 72.15%)",
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
        </div>
      </div>
      {/* <div className="fixed top-[0] bottom-[0] left-[0] right-[0] bg-[blue] z-[999]"></div> */}

      <AnimatePresence>
        {showInfo && (
          <div className="absolute top-[10px] right-[10px] bottom-[10px] left-[10px] z-9 flex items-end">
            <motion.div
              className="scrollbar max-h-full overflow-auto rounded-[22px] bg-[#111] px-5 py-4"
              variants={modalSlide}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col">
                    <h3 className="text-base leading-[1.35] font-semibold text-white">Price Chart</h3>
                    <p className="text-[13px] leading-[1.25] font-light text-[#878787]">Learn about the Price Chart</p>
                  </div>
                  <p className="text-[13px] leading-[1.35] font-medium text-white">
                    A price chart is a graphical representation of an asset&apos;s price movements over a specific
                    period. It&apos;s a fundamental tool used in financial analysis, particularly in technical analysis,
                    to identify trends, patterns, and potential trading opportunities.
                  </p>

                  <div className="flex flex-col">
                    <p className="text-xs font-semibold text-[#696969] text-[1.25]">
                      We use data from{" "}
                      <a href="https://www.binance.com/" target="_blank">
                        Binance.com
                      </a>{" "}
                      &{" "}
                      <a href="https://www.binance.us/" target="_blank">
                        Binance.us
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    type="button"
                    className="app_widget_button flex h-[26px] items-center justify-center gap-1 rounded-[40px] bg-[#272727]"
                    onClick={() => {
                      setShowInfo(false);
                    }}
                  >
                    <p className="app_widget_button__text text-[13px] font-medium whitespace-nowrap text-white">
                      Close
                    </p>
                    <div className="app_widget_button__icon">
                      <Close fill="#878787" />
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ModalContainer
        open={isFullScreen}
        handleClose={() => {
          setIsFullscreen(false);
        }}
        className="!sm:w-[100%] h-[100%] max-h-[100%] !w-[100%] !max-w-[100%] rounded-[0] !p-4"
      >
        <TradingViewPriceHistory token={widget.props?.token || ""} duration={widget?.props?.period} />
      </ModalContainer>
    </Fragment>
  );
}
