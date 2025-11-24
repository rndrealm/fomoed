import React, { useEffect, useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { useAccount } from "wagmi";
import { useGetAssetData, useGetPerpBalance, useGetSpotBalance } from "@/services/queries/hyperliquid";
import { useExecuteTrade, useUpdateLeveraggeTrade } from "@/services/queries/trading";
import { OrderEnum, TifEnum, TradeExecutionPayload } from "@/services/queries/trading/types";
import { useSupabaseAuth } from "@/components/providers";
import { estimateLiqPrice } from "@/lib/utils";
import { toast } from "sonner";
import { useAtomValue } from "jotai";
import { tradingActiveSymbol } from "@/lib/atoms/tradingAtom";
import { selectedTokenAtom } from "@/lib/atoms/hyperliquid";
import { ModalContainer } from "@/components/shared";
import ConfirmModal from "../confirm-modal";
import { SpotFormContent } from "./form";
import { Overview } from "../overview";

// const marketPrice = "91849";

const initialValues = {
  price: "0",
  quantity: "",
  tif: "Gtc",
};

export type TradingFormInitialValues = ReturnType<() => typeof initialValues>;

export default function CreateSpotOrder() {
  const validationSchema = Yup.object().shape({
    price: Yup.number().min(0.01, "Price must be greater than 0").required("Please enter price"),
    quantity: Yup.number().min(0, "Quantity must be a positive number").required("Please enter quantity"),
    tif: Yup.string().oneOf(["Gtc", "Ioc", "Alo"]).required("Please select Time in Force"),
  });

  const account = useAccount();
  const walletAddress = account?.address || "";

  const selectedToken = useAtomValue(selectedTokenAtom);

  const tradingSymbol = selectedToken?.baseTokenName || "";
  const currAsset = (selectedToken?.index || 0) + 10000;
  const marketPrice = selectedToken?.priceVolume?.markPx || "0";

  const { data: spotBalance } = useGetSpotBalance(walletAddress);
  const { data: assetData } = useGetAssetData(walletAddress, tradingSymbol);

  const availableBalance = spotBalance.balances.find((spt) => spt.coin === "USDC")?.total || "0";

  const { session } = useSupabaseAuth();

  const { mutate, isPending } = useExecuteTrade(session?.access_token);

  const [orderType, setOrderType] = useState<"limit" | "market" | "trigger">("limit");
  const [isLong, setIsLong] = useState(true);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const toggleConfirmModal = () => setIsConfirmModalOpen(!isConfirmModalOpen);
  const [pendingOrderPayload, setPendingOrderPayload] = useState<TradeExecutionPayload | null>(null);

  function onSubmit(_values: TradingFormInitialValues) {
    const converter = _values.price; //Todo: make this dynamic based on market price
    const orderSize = (Number(_values.quantity) / Number(converter)).toFixed(5);

    // Create main order
    const orders: OrderEnum[] = [];

    if (orderType === "market") {
      orders.push({
        type: "market",
        asset: currAsset,
        side: isLong ? "buy" : "sell",
        size: orderSize,
        reduceOnly: false,
      });
    } else if (orderType === "limit") {
      orders.push({
        type: "limit",
        asset: currAsset,
        side: isLong ? "buy" : "sell",
        price: String(_values.price),
        size: orderSize,
        reduceOnly: false,
        timeInForce: _values.tif as TifEnum,
      });
    }

    const orderPayload = {
      provider: "hyperliquid",
      wallet_address: walletAddress,
      grouping: "na",
      orders,
    } as TradeExecutionPayload;

    setPendingOrderPayload(orderPayload);
    setIsConfirmModalOpen(true);
  }

  const handleConfirmOrder = () => {
    if (pendingOrderPayload) {
      mutate(pendingOrderPayload);
      setIsConfirmModalOpen(false);
      setPendingOrderPayload(null);
    }
  };

  // Calculate order data for confirmation modal
  const getConfirmationData = () => {
    if (!pendingOrderPayload) {
      return {
        action: isLong,
        size: "0 BTC",
        price: "0",
        liqPrice: "N/A",
      };
    }

    const order = pendingOrderPayload.orders[0];
    // For market orders, use a price estimate (could be current market price in real scenario)
    const orderPrice = order.type === "limit" ? order.price : "Market";

    const liqPrice = estimateLiqPrice({
      entryPrice: Number(orderPrice),
      maintenanceRate: 0.005,
      leverage: 1,
      side: isLong ? "long" : "short",
    });

    return {
      action: isLong,
      size: `${order.size} BTC`,
      price: orderPrice,
      liqPrice: liqPrice ? liqPrice.toFixed(2) : "N/A",
    };
  };

  return (
    <>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        validateOnBlur={false}
        validateOnMount={false}
        validateOnChange={false}
      >
        {(props) => {
          const { handleSubmit } = props;
          return (
            <form onSubmit={handleSubmit} className="w-[210px] h-full block">
              <div className="w-full flex flex-col flex-1 gap-2">
                <div className="bg-[#121317] rounded-[10px] pt-2 px-2 pb-4">
                  <SpotFormContent
                    balance={Number(availableBalance) ? Number(availableBalance) : 0}
                    orderType={orderType}
                    setOrderType={setOrderType}
                    isLong={isLong}
                    setIsLong={setIsLong}
                    isPending={isPending}
                    marketPrice={marketPrice}
                  />
                </div>

                <div className="bg-[#121317] rounded-[10px] p-3 ">
                  <Overview />
                </div>
              </div>
            </form>
          );
        }}
      </Formik>
      <ModalContainer
        open={isConfirmModalOpen}
        handleClose={toggleConfirmModal}
        title="Confirm Order"
        headerClassName=" w-full text-lg font-medium"
        className="!max-w-[462px] px-6 py-6 bg-[#141416] gap-0"
      >
        <ConfirmModal
          toggle={toggleConfirmModal}
          isLoading={isPending}
          onConfirm={handleConfirmOrder}
          orderData={getConfirmationData()}
        />
      </ModalContainer>
    </>
  );
}
