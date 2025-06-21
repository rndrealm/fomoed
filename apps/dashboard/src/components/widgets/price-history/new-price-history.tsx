"use client";
import React, { Fragment, useState } from "react";

import {
  CandleStick,
  Close,
  Delete,
  Ellipsis,
  FullScreen,
  Learn,
  LineChart,
  Question,
} from "@/components/icons/icons";
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
import {
  deleteWidgetAtom,
  LayoutType,
  updateWidgetPropsAtom,
} from "@/lib/atoms/layoutAtom";
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
          <div className="w-[24px] h-[24px] bg-[#161616] rounded-sm flex items-center justify-center">
            <Ellipsis />
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-[210px] mt-4 rounded-lg bg-[#090909] border border-[#333]"
          align="end"
        >
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="text-[#D4D4D4] text-[13px] leading-[1.25] p-[10px] font-normal focus:bg-[#171717] focus:text-[#C3C3C3] cursor-pointer w-full flex items-center justify-between"
              onSelect={() => {
                setDeleteWidget(widget);
                setShowDeleteModal(true);
              }}
            >
              Delete widget
              <Delete fill="#A2A2A2" />
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-[#D4D4D4] text-[13px] leading-[1.25] p-[10px] font-normal focus:bg-[#171717] focus:text-[#C3C3C3] cursor-pointer w-full flex items-center justify-between"
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

  return (
    <Fragment>
      <div className="flex flex-col gap-2 bg-[#000] pt-0 pb-4 rounded-2xl h-full relative">
        <div className="flex flex-col gap-1">
          <div className="cursor-grab flex justify-center pt-4 pb-1">
            <div className="w-[36px] h-[5px] bg-[#444] rounded-[2px]"></div>
          </div>

          <div className="px-2 sm:px-4 flex items-center justify-between mb-3">
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
        <div className="flex justify-between items-end sm:items-center px-2 sm:px-4">
          <LivePrice token={widget?.props?.token} />

          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
            <div className="flex items-center gap-[2px] bg-[#161616] rounded-[5px] p-[1px]">
              <button
                type="button"
                className={cn(
                  "w-[32px] h-[22px] flex items-center justify-center rounded-sm",
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
                  "w-[32px] h-[22px] flex items-center justify-center rounded-sm",
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
            />
          </div>
        </div>
        <div className="flex-1">
          {/* <div className=""></div> */}

          {/* <ChartComponent
            data={data}
            token={widget?.props?.token}
            period={widget?.props?.period}
            isCandleStick={isCandleStick}
          /> */}
          <TestChart
            isCandleStick={isCandleStick}
            token={widget?.props?.token}
            period={widget?.props?.period}
          />
        </div>

        <div
          className="absolute bottom-[16px] right-[9px] w-[28px] h-[28px] rounded-md z-[9] border border-[#1c1c1c]"
          style={{
            background:
              "linear-gradient(180deg, #1b1b1b 0%, rgba(0, 0, 0, 0.38) 72.15%)",
            backdropFilter: "blur(7px)",
          }}
        >
          <button
            className="w-full h-full flex justify-center items-center"
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
          <div className="absolute  bottom-[10px] left-[10px] right-[10px] top-[10px] z-9 flex items-end">
            <motion.div
              className="bg-[#111] rounded-[22px] py-4 px-5 overflow-auto max-h-full scrollbar"
              variants={modalSlide}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-base leading-[1.35] text-white">
                      Price Chart
                    </h3>
                    <p className="font-light text-[13px] leading-[1.25] text-[#878787]">
                      Learn about the Price Chart
                    </p>
                  </div>
                  <p className="font-medium text-[13px] leading-[1.35] text-white">
                    A price chart is a graphical representation of an
                    asset&apos;s price movements over a specific period.
                    It&apos;s a fundamental tool used in financial analysis,
                    particularly in technical analysis, to identify trends,
                    patterns, and potential trading opportunities.
                  </p>

                  <div className="flex flex-col">
                    <p className="text-[#696969] text-xs font-semibold text-[1.25]">
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
                    className="rounded-[40px] bg-[#272727] flex items-center justify-center gap-1 h-[26px] app_widget_button"
                    onClick={() => {
                      setShowInfo(false);
                    }}
                  >
                    <p className="font-medium text-[13px] text-white whitespace-nowrap app_widget_button__text">
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
        className="!max-w-[90%] h-full"
      >
        <TradingViewPriceHistory
          token={widget.props?.token || ""}
          duration={widget?.props?.period}
        />
      </ModalContainer>
    </Fragment>
  );
}
