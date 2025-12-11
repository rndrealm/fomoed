import React, { useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { useAccount } from "wagmi";
import { useGetSpotBalance } from "@/services/queries/hyperliquid";
import { useExecuteTrade } from "@/services/queries/trading";
import { OrderEnum, TifEnum, TradeExecutionPayload } from "@/services/queries/trading/types";
import { useSupabaseAuth } from "@/components/providers";
import { toast } from "sonner";
import { ModalContainer } from "@/components/shared";
import ConfirmModal from "../../modals/confirm-modal";
import { SpotFormContent } from "./form";
import { getFromAndToToken } from "../../../utils";
import TransferButtons from "../transfer-buttons";
import { PerpUniverse, SpotsUniverse } from "@/services/queries/hyperliquid/types";
import { WsActiveAssetCtx, WsActiveSpotAssetCtx } from "../../../chart/trading-view/hyperliquid/types";

const initialValues = {
  price: "0",
  quantity: "",
  tif: "Gtc",
};

export type TradingFormInitialValues = ReturnType<() => typeof initialValues>;

interface IProps {
  selectedToken: PerpUniverse | SpotsUniverse;
  ticker: WsActiveAssetCtx | WsActiveSpotAssetCtx;
}

export default function CreateSpotOrder(props: IProps) {
  const { selectedToken, ticker } = props;
  const validationSchema = Yup.object().shape({
    price: Yup.number().min(0.01, "Price must be greater than 0").required("Please enter price"),
    quantity: Yup.number().min(0, "Quantity must be a positive number").required("Please enter quantity"),
    tif: Yup.string().oneOf(["Gtc", "Ioc", "Alo"]).required("Please select Time in Force"),
  });
  const [isLong, setIsLong] = useState(true);
  const account = useAccount();
  const walletAddress = account?.address || "";

  const displayName = selectedToken?.displayName || "";
  const { from, to } = getFromAndToToken(displayName);
  const currAsset = (selectedToken?.index || 0) + 10000;
  const marketPrice = ticker?.ctx?.midPx?.toString() || "0";
  // console.log(ticker);

  const { data: spotBalance } = useGetSpotBalance(walletAddress);

  const fromBalance = spotBalance?.balances.find((spt) => spt.coin === from);
  const toBalance = spotBalance?.balances.find((spt) => spt.coin === to);

  const availableBalance =
    (!isLong
      ? Number(fromBalance?.total) - Number(fromBalance?.hold)
      : Number(toBalance?.total) - Number(toBalance?.hold)) || "0";

  const selectOptions =
    selectedToken?.displayName?.split("/").map((ed) => {
      return {
        label: ed,
        value: ed,
      };
    }) || [];

  const [orderBy, setOrderBy] = useState(selectOptions[1]?.value || "");

  const { session } = useSupabaseAuth();

  const [orderType, setOrderType] = useState<"limit" | "market" | "trigger">("limit");

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const toggleConfirmModal = () => setIsConfirmModalOpen(!isConfirmModalOpen);
  const [pendingOrderPayload, setPendingOrderPayload] = useState<TradeExecutionPayload | null>(null);

  const onSuccessExecute = () => {
    toggleConfirmModal();
    setPendingOrderPayload(null);
  };

  const { mutate, isPending } = useExecuteTrade(session?.access_token, onSuccessExecute);
  function onSubmit(_values: TradingFormInitialValues) {
    const converter = orderType === "limit" ? _values.price : marketPrice;
    const toDecimal = selectedToken.szDecimals;
    const orderSize = (
      orderBy === selectOptions[0].value ? Number(_values.quantity) : Number(_values.quantity) / Number(converter)
    ).toFixed(toDecimal);

    if (Number(orderSize) * Number(converter) < 10) {
      toast.error("Quantity must be greater than 10");
      return;
    }

    // Create main order
    const orders: OrderEnum[] = [];

    if (orderType === "market") {
      orders.push({
        type: "market",
        asset: currAsset,
        side: isLong ? "buy" : "sell",
        size: Number(orderSize).toFixed(toDecimal),
        reduceOnly: false,
        isSpot: true,
      });
    } else if (orderType === "limit") {
      orders.push({
        type: "limit",
        asset: currAsset,
        side: isLong ? "buy" : "sell",
        price: Number(_values.price).toFixed(toDecimal),
        size: Number(orderSize).toFixed(toDecimal),
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
      // setIsConfirmModalOpen(false);
      // setPendingOrderPayload(null);
    }
  };

  // Calculate order data for confirmation modal
  const getConfirmationData = () => {
    if (!pendingOrderPayload) {
      return {
        action: isLong,
        size: "0",
        price: "0",
      };
    }

    const order = pendingOrderPayload.orders[0];
    // For market orders, use a price estimate (could be current market price in real scenario)
    const orderPrice = order.type === "limit" ? order.price : "Market";

    return {
      action: isLong,
      size: `${order.size} ${from}`,
      price: orderPrice,
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
            <form onSubmit={handleSubmit} className="w-full h-full block">
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
                    selectOptions={selectOptions}
                    orderBy={orderBy}
                    setOrderBy={setOrderBy}
                    selectedToken={selectedToken}
                  />
                  <TransferButtons toPerp={false} />
                </div>

                {/* <div className="bg-[#121317] rounded-[10px] p-3 ">
                  <Overview />
                </div> */}
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
