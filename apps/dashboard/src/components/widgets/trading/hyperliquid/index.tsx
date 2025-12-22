import { cn } from "@/lib/utils";
import React, { Fragment, useEffect, useState } from "react";
import AscendexHeader from "./header";
import { LayoutType } from "@/lib/atoms/layoutAtom";
import { useSupabaseAuth } from "@/components/providers";
import { useTicker } from "../chart/trading-view/hyperliquid/use-ticker";
import { useAtomValue } from "jotai";
import { selectedTokenAtom } from "@/lib/atoms/hyperliquid";
import { ModalContainer, RenderIf, SkeletonLoader } from "@/components/shared";
import ChartHeader from "../chart/chart-header";
import TradingPanel from "./trading-panel";
import OrderBookAndTrade from "../order-book-and-trade";
import Balance from "./balance";
import { TradingView } from "../chart/trading-view";
import CreateSpotOrder from "./create-order/spot";
import CreateOrder from "./create-order/perp";
import ConfirmModal from "./modals/confirm-modal";
import ApproveBuilderModal from "./modals/approve-builder-modal";
import { useGetBuilderFee } from "@/services/queries/hyperliquid";
import { useAccount } from "wagmi";

interface IProps {
  widget: LayoutType["widgets"][0];
}

type ViewType = "futures" | "spot" | "lend" | "conditional" | "balance" | "settings";

function CreateOrderComponent() {
  const selectedToken = useAtomValue(selectedTokenAtom);
  const { isConnected, ticker } = useTicker(selectedToken?.name);
  const isSpot = selectedToken?.isSpot;

  return (
    <Fragment>
      {selectedToken && isConnected && ticker ? (
        <div>
          {isSpot ? (
            <CreateSpotOrder selectedToken={selectedToken} ticker={ticker} />
          ) : (
            <CreateOrder selectedToken={selectedToken} ticker={ticker} />
          )}
        </div>
      ) : (
        <SkeletonLoader width={210} heightFull backgroundColor="#121317" borderRadius={10} />
      )}
    </Fragment>
  );
}

const HyperliquidWidget = ({ widget }: IProps) => {
  const handleViewChange = (view: ViewType) => {
    setActiveView(view);
  };

  const [activeView, setActiveView] = useState<ViewType>("futures");

  const showTradingInterface = ["futures", "spot", "lend", "conditional"].includes(activeView);
  const account = useAccount();
  const { data: builderData } = useGetBuilderFee(account.address);

  const [isOpen, setIsOpen] = useState(false);
  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (!isOpen && builderData === 0) {
      setIsOpen(true);
    }
  }, [builderData]);

  return (
    <>
      <div className="relative flex h-full w-full justify-center items-center">
        <div
          className={cn(
            "relative flex h-full w-full flex-col gap-2 overflow-hidden rounded-2xl",
            "px-0 pb-2 bg-[#000]",
          )}
        >
          <AscendexHeader widget={widget} activeView={activeView} onViewChange={handleViewChange} />

          {/* Trading*/}
          <RenderIf condition={showTradingInterface}>
            <div className="flex h-full w-full flex-1 overflow-y-auto scrollbar gap-3 px-2 pb-2">
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex-1 flex gap-3 min-h-[600px]">
                  <div className="flex flex-1 flex-col gap-2">
                    <ChartHeader widget={widget} />
                    <div
                      className="bg-[#121317] rounded-[6px] flex items-center justify-center relative overflow-hidden flex-1 "
                      style={{ height: "500px" }}
                    >
                      <TradingView />
                    </div>
                  </div>

                  <OrderBookAndTrade />
                </div>
                <div className="h-[280px]">
                  <TradingPanel />
                </div>
              </div>
              <div className="max-w-[210px] w-full">
                <CreateOrderComponent />
              </div>
            </div>
          </RenderIf>

          {/* Balance */}
          <RenderIf condition={activeView === "balance"}>
            <div className="flex h-full w-full flex-1 overflow-hidden gap-3 px-2 pb-2">
              <div className="flex-1 flex flex-col gap-2 min-w-0 overflow-hidden">
                <Balance />
              </div>
            </div>
          </RenderIf>

          {/* Settings */}
          <RenderIf condition={activeView === "settings"}>
            <div className="flex h-full w-full flex-1 overflow-hidden gap-3 px-2 pb-2">
              <div className="flex-1 flex flex-col gap-2 min-w-0 overflow-hidden">
                <div className="bg-[#121317] rounded-[10px] p-6 flex-1">
                  <h2 className="text-white text-xl font-semibold mb-4">Settings</h2>
                  <p className="text-[#9CA3AF]">Settings component will go here</p>
                </div>
              </div>
            </div>
          </RenderIf>
        </div>
      </div>

      <ModalContainer
        open={isOpen}
        handleClose={toggleModal}
        title="Confirm Trading Preferences."
        headerClassName=" w-full text-lg text-center font-medium"
        className="!max-w-[462px] px-6 py-6 bg-[#141416] gap-0"
        hideX
        // preventOutsideClick
      >
        <ApproveBuilderModal toggleModal={toggleModal} />
      </ModalContainer>
    </>
  );
};

export default HyperliquidWidget;
