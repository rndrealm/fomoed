import React, { useEffect, useState } from "react";
import { FormContent } from "./form";
import { Overview } from "./overview";
import { Formik } from "formik";
import * as Yup from "yup";
import { useAccount } from "wagmi";
import { useGetAssetData, useGetPerpBalance } from "@/services/queries/hyperliquid";
import { useExecuteTrade, useUpdateLeveraggeTrade } from "@/services/queries/trading";
import { TradeExecutionPayload } from "@/services/queries/trading/types";
import LeverageModal from "./leverage-modal";
import { ModalContainer } from "@/components/shared/modal-container";
import { useSupabaseAuth } from "@/components/providers";
import ConfirmModal from "./confirm-modal";
import { estimateLiqPrice } from "@/lib/utils";

const initialValues = {
  price: "106945",
  quantity: "",
  reduceOnly: false,
  tif: "Gtc",
};

export type TradingFormInitialValues = ReturnType<() => typeof initialValues>;

// {
//   "provider": "hyperliquid",
//   "wallet_address": "0xYourMasterWalletAddress",
//   "orders": [
//     {
//       "type": "market",
//       "asset": 0,
//       "side": "buy",
//       "size": "0.001",
//       "reduceOnly": false,
//       "slippagePercent": 10
//     }
//   ],
//   "grouping": "na"
// }

const currAsset = 3; // Todo: this is asset id for bitcoin, update later to match the trading view chart
const maxLeverage = 40; // Todo: this is max leverage for btc, update later to trading view data
export default function CreateOrder() {
  const validationSchema = Yup.object().shape({
    price: Yup.number().min(0.01, "Price must be greater than 0").required("Please enter price"),
    quantity: Yup.number().min(0, "Quantity must be a positive number").required("Please enter quantity"),
    reduceOnly: Yup.boolean(),
    tif: Yup.string().oneOf(["Gtc", "Ioc", "Alo"]).required("Please select Time in Force"),
  });

  const account = useAccount();
  const walletAddress = account?.address || "";

  const { data: perpBalance } = useGetPerpBalance(walletAddress);
  const { data: assetData } = useGetAssetData(walletAddress, "BTC");

  const availableBalance = perpBalance?.withdrawable;
  const { session } = useSupabaseAuth();

  const { mutate, isPending } = useExecuteTrade(session?.access_token);

  const [orderType, setOrderType] = useState<"limit" | "market" | "conditional">("limit");
  const [isLong, setIsLong] = useState(true);
  const [leverage, setLeverage] = useState<null | number>(null);
  const [isLeverageModalOpen, setIsLeverageModalOpen] = useState(false);
  const toggleLeverageModal = () => setIsLeverageModalOpen(!isLeverageModalOpen);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const toggleConfirmModal = () => setIsConfirmModalOpen(!isConfirmModalOpen);
  const [pendingOrderPayload, setPendingOrderPayload] = useState<TradeExecutionPayload | null>(null);

  const updateLeverage = (value: number) => {
    setLeverage(value);
    updateLeverageMutation({
      provider: "hyperliquid",
      asset: currAsset,
      leverage: value,
      wallet_address: walletAddress,
    });
  };

  const { mutate: updateLeverageMutation, isPending: updateLeverageLoading } = useUpdateLeveraggeTrade(
    toggleLeverageModal,
    session?.access_token,
  );

  function onSubmit(_values: TradingFormInitialValues) {
    const converter = _values.price; //Todo: make this dynamic based on market price
    const orderPayload = {
      provider: "hyperliquid",
      wallet_address: walletAddress,
      grouping: "na",
      orders: [
        {
          type: orderType,
          asset: currAsset, //Todo: Update later when chart dropdown has been integrated
          side: isLong ? "buy" : "sell",
          price: _values.price,
          size: (Number(_values.quantity) / Number(converter)).toFixed(5),
          reduceOnly: _values.reduceOnly,
          timeInForce: orderType === "market" ? "Ioc" : _values.tif,
        },
      ],
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
      leverage: leverage || 1,
      side: isLong ? "long" : "short",
    });

    return {
      action: isLong,
      size: `${order.size} BTC`,
      price: orderPrice,
      liqPrice: liqPrice ? liqPrice.toFixed(2) : "N/A",
    };
  };

  useEffect(() => {
    if (assetData && !leverage) {
      setLeverage(assetData.leverage.value);
    }
  }, [assetData, leverage]);

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
          const { values, handleChange, handleBlur, handleSubmit } = props;
          return (
            <form onSubmit={handleSubmit} className="w-[210px] h-full block">
              <div className="w-full flex flex-col flex-1 gap-2">
                <div className="bg-[#121317] rounded-[10px] pt-2 px-2 pb-4">
                  <FormContent
                    balance={Number(availableBalance) ? Number(availableBalance) : 0}
                    orderType={orderType}
                    setOrderType={setOrderType}
                    isLong={isLong}
                    setIsLong={setIsLong}
                    leverage={leverage || 1}
                    toggleLeverageModal={toggleLeverageModal}
                    isPending={isPending}
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
        open={isLeverageModalOpen}
        handleClose={toggleLeverageModal}
        title="Leverage"
        headerClassName="text-center w-full text-lg font-medium"
        hideX
        className="!max-w-[462px] px-6 py-8 bg-[#141416] gap-0"
      >
        <LeverageModal
          leverage={leverage || 1}
          updateLeverage={updateLeverage}
          isLoading={updateLeverageLoading}
          maxLeverage={maxLeverage}
        />
      </ModalContainer>

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
