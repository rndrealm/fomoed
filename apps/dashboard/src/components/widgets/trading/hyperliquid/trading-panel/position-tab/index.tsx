"use client";
import React, { useMemo, useState } from "react";
import Image from "next/image";
import { useHyperliquidAllMids } from "@/services/queries/hyperliquid-dex";
import { useReadHyperLiquidTokens } from "@/services/queries/hyperliquid";
import { selectedTokenAtom } from "@/lib/atoms/hyperliquid";
import { useSetAtom } from "jotai";
import { useClearingHouseState } from "../../../chart/trading-view/hyperliquid/use-clearinghouse-state";
import dashboard from "@/lib/assets/dashboard";
import { useAllMids } from "../../../chart/trading-view/hyperliquid/use-all-mids";
import { formatNumberToDecimalPoints } from "../../../chart/chart-header/stats";
import { cn } from "@/lib/utils";
import { Pencil } from "lucide-react";
import { ModalContainer, RenderIf } from "@/components/shared";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { getCoinIconUrl } from "../../../chart/chart-header";
import CloseOrder from "../modals/close-order";
import CloseAllOrders from "../modals/close-all-orders";
import { TakeProfit } from "../../modals/take-profit";
import { PerpUniverse, SpotsUniverse } from "@/services/queries/hyperliquid/types";
import { useAccount } from "wagmi";

interface ILeverageTag {
  isLong: boolean;
  leverage: number;
}

function LeverageTag(props: ILeverageTag) {
  const { isLong, leverage } = props;

  const bg = isLong ? "#233A2F" : "#574040";
  const color = isLong ? "#21FF86" : "#F99185";

  return (
    <div
      className={cn("w-[22px] bg-[red] h-[16px] flex items-center justify-center rounded-xs")}
      style={{ backgroundColor: bg }}
    >
      <p className={cn("text-[10px] font-medium leading-[1.35]")} style={{ color }}>
        {leverage}X
      </p>
    </div>
  );
}

export interface IPositionOrder {
  size: string;
  isLong: boolean;
  leverage: number;
  coin: string;
  isSpot: boolean;
  selectedToken: SpotsUniverse | PerpUniverse;
}

export interface ITpSlOrder {
  coin: string;
  positionSize: string;
  entryPrice: string;
  markPrice: string;
  isSpot: boolean;
  selectedToken: SpotsUniverse | PerpUniverse;
  isLong: boolean;
  leverage: number;
}

export default function OpenPositionsTab() {
  const { address } = useAccount();
  const userAddress = address || "";

  const { clearingHouse, isConnected } = useClearingHouseState(userAddress);
  const { allMids, isConnected: midsConnected } = useAllMids();

  const { data: tokensData } = useReadHyperLiquidTokens();
  const setSelectedToken = useSetAtom(selectedTokenAtom);

  const isLoading = !isConnected || !midsConnected;

  const [isMarket, setIsMarket] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<IPositionOrder | null>(null);
  const [isCloseOrderModalOpen, setIsCloseOrderModalOpen] = useState(false);
  const [isTakeProfitModalOpen, setIsTakeProfitModalOpen] = useState(false);
  const [isCloseAllOrdersModalOpen, setIsCloseAllOrdersModalOpen] = useState(false);

  const toggleModalOrderOpwn = () => {
    setIsCloseOrderModalOpen(!isCloseOrderModalOpen);
  };

  const openCloseOrderModal = (type: "limit" | "market", order: IPositionOrder) => {
    setIsMarket(type === "market");
    setSelectedOrder(order);
    setIsCloseOrderModalOpen(true);
  };

  const [selectedTpSlOrder, setSelectedTpSlOrder] = useState<ITpSlOrder | null>(null);

  const toggleModalOrderTpSl = () => {
    setIsTakeProfitModalOpen(!isTakeProfitModalOpen);
  };

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Table */}
        <div className="flex-1 overflow-auto px-3 no-scrollbar">
          <div className="bg-[#191B20] my-2 rounded-[15px] border border-[#222327] p-2">
            <table className="w-full" style={{ borderSpacing: "0 6px", borderCollapse: "separate" }}>
              <thead>
                <tr className="">
                  <th className="text-left text-[#84858C] text-[12px] font-normal px-2 py-2 whitespace-nowrap">Coin</th>
                  <th className="text-left text-[#84858C] text-[12px] font-normal px-2 py-2 whitespace-nowrap">Size</th>
                  <th className="text-left text-[#84858C] text-[12px] font-normal px-2 py-2 whitespace-nowrap">
                    Position Value
                  </th>
                  <th className="text-left text-[#84858C] text-[12px] font-normal px-2 py-2 whitespace-nowrap">
                    Entry Price
                  </th>
                  <th className="text-left text-[#84858C] text-[12px] font-normal px-2 py-2 whitespace-nowrap">
                    Mark Price
                  </th>
                  <th className="text-left text-[#84858C] text-[12px] font-normal px-2 py-2 whitespace-nowrap">
                    PNL ROE%
                  </th>
                  <th className="text-left text-[#84858C] text-[12px] font-normal px-2 py-2 whitespace-nowrap">
                    Liq Price
                  </th>
                  <th className="text-left text-[#84858C] text-[12px] font-normal px-2 py-2 whitespace-nowrap">
                    Margin
                  </th>
                  <th className="text-left text-[#84858C] text-[12px] font-normal px-2 py-2 whitespace-nowrap">
                    Funding
                  </th>
                  <th className="text-left text-[#84858C] text-[12px] font-normal px-2 py-2 whitespace-nowrap">
                    TP/SL
                  </th>
                  <th className="text-left text-[#84858C] text-[12px] font-normal px-2 py-2 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setIsCloseAllOrdersModalOpen(true)}
                      disabled={clearingHouse?.clearinghouseState?.assetPositions?.length === 0 || isLoading}
                      className="text-[#FFF0D3] leading-[1.35] text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Close All
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                <RenderIf condition={isLoading}>
                  <tr>
                    <td colSpan={11} className="py-10">
                      <div className="flex justify-center w-full">
                        <Spinner variant="circle" className="text-[rgb(255,59,16)]" size={24} />
                      </div>
                    </td>
                  </tr>
                </RenderIf>
                <RenderIf condition={!isLoading && clearingHouse?.clearinghouseState?.assetPositions?.length !== 0}>
                  {clearingHouse?.clearinghouseState?.assetPositions?.map((item, index) => {
                    const size = parseFloat(item?.position?.szi || "0");
                    const isLong = size > 0;
                    const formattedSize = formatNumberToDecimalPoints(Math.abs(size));
                    const orderSize = Math.abs(size);
                    const positionValue = formatNumberToDecimalPoints(
                      parseFloat(item?.position?.positionValue) || 0,
                      2,
                    );

                    const entryPrice = parseFloat(item?.position?.entryPx);
                    const formattedEntryPrice = formatNumberToDecimalPoints(entryPrice);

                    const markPrice = parseFloat(allMids?.mids?.[item?.position?.coin] || "0");
                    const formattedMarkPrice = formatNumberToDecimalPoints(
                      parseFloat(allMids?.mids?.[item?.position?.coin] || "0"),
                    );

                    const pnl = parseFloat(item?.position?.unrealizedPnl) || 0;
                    const formattedPnl = formatNumberToDecimalPoints(Math.abs(pnl), 2) || "0.00";
                    const isPnlPositive = pnl >= 0;
                    const pnlSign = isPnlPositive ? "+" : "-";

                    const marginUsed = parseFloat(item?.position?.marginUsed);
                    const formattedMarginUsed = formatNumberToDecimalPoints(marginUsed, 2);

                    const pnlPercentage = parseFloat(item?.position?.returnOnEquity || "0");
                    const formattedPnlPercentage =
                      formatNumberToDecimalPoints(Math.abs(pnlPercentage * 100), 2) || "0.00";

                    const liquidationPrice = parseFloat(item?.position?.liquidationPx || "0");
                    const formattedLiquidationPrice = formatNumberToDecimalPoints(
                      liquidationPrice,
                      liquidationPrice > 1 ? 2 : 6,
                    );

                    const fundingSinceOpen = parseFloat(item?.position?.cumFunding?.sinceOpen) || 0;
                    const formattedFundingSinceOpen =
                      formatNumberToDecimalPoints(Math.abs(fundingSinceOpen), 2) || "0.00";
                    const isFundingPositive = fundingSinceOpen > 0;

                    const isSpot = item?.position?.coin?.includes("/");

                    return (
                      <tr
                        key={index}
                        className="h-[24px] relative bg-[linear-gradient(90deg,#00af58_0%,#0d633b_80px,#191b20_104px)]"
                      >
                        <td className="rounded-l-[10px] p-2">
                          <button
                            className="flex items-center gap-2"
                            type="button"
                            onClick={() => {
                              const currentToken = tokensData?.perp?.find(
                                (token) => token.name === item?.position?.coin,
                              );
                              if (!currentToken) return;
                              setSelectedToken(currentToken);
                            }}
                          >
                            <div className="w-[16px] h-[16px]">
                              <Image
                                src={getCoinIconUrl(item?.position?.coin)}
                                alt={item?.position?.coin}
                                width={16}
                                height={16}
                              />
                            </div>
                            <p className="text-white text-xs font-medium leading-[1.35%]">{item?.position?.coin}</p>
                            <LeverageTag isLong={isLong} leverage={item?.position?.leverage?.value} />
                          </button>
                        </td>
                        <td
                          className={cn(
                            "text-white leading-[1.35] text-xs font-medium p-2 whitespace-nowrap",
                            isLong ? "text-[#00AF58]" : "text-[#F99185]",
                          )}
                        >
                          {formattedSize} {item?.position?.coin}
                        </td>
                        <td className="text-white leading-[1.35] text-xs font-medium p-2 whitespace-nowrap">
                          {positionValue} USDC
                        </td>

                        <td className="text-white leading-[1.35] text-xs font-medium p-2 whitespace-nowrap">
                          {formattedEntryPrice}
                        </td>
                        <td className="text-white leading-[1.35] text-xs font-medium p-2 whitespace-nowrap">
                          {formattedMarkPrice}
                        </td>
                        <td
                          className={cn(
                            "text-white leading-[1.35] text-xs font-medium p-2 whitespace-nowrap",
                            isPnlPositive ? "text-[#00AF58]" : "text-[#F99185]",
                          )}
                        >
                          {pnlSign}${formattedPnl} ({pnlSign}
                          {formattedPnlPercentage}%)
                        </td>
                        <td className="text-white leading-[1.35] text-xs font-medium p-2 whitespace-nowrap">
                          {formattedLiquidationPrice || "N/A"}
                        </td>
                        <td className="text-white leading-[1.35] text-xs font-medium p-2 whitespace-nowrap">
                          ${formattedMarginUsed} ({item?.position?.leverage?.type})
                        </td>
                        <td
                          className={cn(
                            "text-white leading-[1.35] text-xs font-medium p-2 whitespace-nowrap",
                            isPnlPositive ? "text-[#00AF58]" : "text-[#F99185]",
                          )}
                        >
                          {isFundingPositive ? "+" : "-"}${formattedFundingSinceOpen}
                        </td>
                        <td className="text-white leading-[1.35] text-xs font-medium p-2 whitespace-nowrap">
                          <div className="flex gap-1 items-center">
                            --/--
                            <button
                              type="button"
                              onClick={() => {
                                const tokensArray = (isSpot ? tokensData?.spot : tokensData?.perp) || [];
                                const currentToken = tokensArray.find((token) => token.name === item?.position?.coin);
                                if (!currentToken) return;
                                setSelectedTpSlOrder({
                                  coin: item?.position?.coin,
                                  positionSize: orderSize.toString(),
                                  entryPrice: formattedEntryPrice,
                                  markPrice: formattedMarkPrice,
                                  isSpot: isSpot,
                                  selectedToken: currentToken,
                                  isLong: isLong,
                                  leverage: item?.position?.leverage?.value,
                                });
                                setIsTakeProfitModalOpen(true);
                              }}
                            >
                              <Pencil size={15} />
                            </button>
                          </div>
                        </td>
                        <td className="text-[#FFF0D3] leading-[1.35] text-xs font-medium p-2 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const tokensArray = (isSpot ? tokensData?.spot : tokensData?.perp) || [];
                                const currentToken = tokensArray.find((token) => token.name === item?.position?.coin);
                                if (!currentToken) return;
                                openCloseOrderModal("limit", {
                                  size: orderSize.toString(),
                                  isLong: isLong,
                                  leverage: item?.position?.leverage?.value,
                                  coin: item?.position?.coin,
                                  isSpot: isSpot,
                                  selectedToken: currentToken,
                                });
                              }}
                            >
                              Limit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const tokensArray = (isSpot ? tokensData?.spot : tokensData?.perp) || [];
                                const currentToken = tokensArray.find((token) => token.name === item?.position?.coin);
                                if (!currentToken) return;
                                openCloseOrderModal("market", {
                                  size: orderSize.toString(),
                                  isLong: isLong,
                                  leverage: item?.position?.leverage?.value,
                                  coin: item?.position?.coin,
                                  isSpot: isSpot,
                                  selectedToken: currentToken,
                                });
                              }}
                            >
                              Market
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </RenderIf>
              </tbody>
            </table>
          </div>

          <RenderIf condition={!isLoading && clearingHouse?.clearinghouseState?.assetPositions?.length === 0}>
            <div className="flex flex-col min-h-[300px] h-full items-center justify-center bg-[#191B20] rounded-[6px] my-1">
              <Image src={dashboard.noDeposits} alt="No balances" width={168} height={168} className="mb-4" />
              <p className="text-white text-[20px] font-semibold">No Positions</p>
            </div>
          </RenderIf>
        </div>

        {/* Summary Footer */}
        {/* {positions.length > 0 && (
        <div className="border-t border-[#0C0C0C] px-3 py-2 bg-[#0E0E0E]">
          <div className="flex justify-between items-center">
            <span className="text-[#84858C] text-[12px]">Total Positions: {positions.length}</span>
            <div className="flex gap-4">
              <div>
                <span className="text-[#84858C] text-[12px]">Total Value: </span>
                <span className="text-white text-[12px] font-medium">
                  ${positions.reduce((sum, p) => sum + p.positionValue, 0).toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-[#84858C] text-[12px]">Total PNL: </span>
                <span
                  className="text-[12px] font-medium"
                  style={{
                    color: positions.reduce((sum, p) => sum + p.unrealizedPnl, 0) >= 0 ? "#00AF58" : "#DC2626",
                  }}
                >
                  ${positions.reduce((sum, p) => sum + p.unrealizedPnl, 0) >= 0 ? "+" : ""}
                  {positions.reduce((sum, p) => sum + p.unrealizedPnl, 0).toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-[#84858C] text-[12px]">Total Margin: </span>
                <span className="text-white text-[12px] font-medium">
                  ${positions.reduce((sum, p) => sum + p.marginUsed, 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )} */}
      </div>

      {selectedOrder ? (
        <ModalContainer
          open={isCloseOrderModalOpen}
          handleClose={toggleModalOrderOpwn}
          headerClassName="text-center w-full text-lg font-medium"
          hideX
          title={isMarket ? "Market Close" : "Limit Close"}
          className="!max-w-[462px] px-6 py-8 bg-[#141416] gap-0"
        >
          <CloseOrder toggleModal={toggleModalOrderOpwn} isMarket={isMarket} order={selectedOrder} />
        </ModalContainer>
      ) : null}

      {selectedTpSlOrder ? (
        <RenderIf condition={isTakeProfitModalOpen}>
          <ModalContainer
            open={isTakeProfitModalOpen}
            handleClose={() => {
              setIsTakeProfitModalOpen(false);
            }}
            headerClassName="text-center w-full text-lg font-medium"
            hideX
            title="TP/SL for Position"
            className="!max-w-[462px] px-6 py-8 bg-[#141416] gap-0 scrollbar"
          >
            <TakeProfit order={selectedTpSlOrder} toggleModal={toggleModalOrderTpSl} />
          </ModalContainer>
        </RenderIf>
      ) : null}

      <RenderIf condition={isCloseAllOrdersModalOpen}>
        <ModalContainer
          open={isCloseAllOrdersModalOpen}
          handleClose={() => {
            setIsCloseAllOrdersModalOpen(false);
          }}
          headerClassName="text-center w-full text-lg font-medium"
          hideX
          title="Close All Positions"
          className="!max-w-[462px] px-6 py-8 bg-[#141416] gap-0"
        >
          <CloseAllOrders toggleModal={() => setIsCloseAllOrdersModalOpen(false)} tokensData={tokensData} />
        </ModalContainer>
      </RenderIf>
    </>
  );
}
