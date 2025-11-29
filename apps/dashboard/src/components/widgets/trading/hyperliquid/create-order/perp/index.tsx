import React, { useEffect, useState } from "react";
import { FormContent } from "./form";
import { Overview } from "../overview";
import { Formik } from "formik";
import * as Yup from "yup";
import { useAccount } from "wagmi";
import { useGetAssetData, useGetPerpBalance, useGetSpotBalance } from "@/services/queries/hyperliquid";
import { useExecuteTrade, useUpdateLeveraggeTrade } from "@/services/queries/trading";
import { OrderEnum, TifEnum, TradeExecutionPayload } from "@/services/queries/trading/types";

import { ModalContainer } from "@/components/shared/modal-container";
import { useSupabaseAuth } from "@/components/providers";
import { estimateLiqPrice } from "@/lib/utils";
import { toast } from "sonner";
import TransferButtons from "../transfer-buttons";
import { PerpUniverse, SpotsUniverse } from "@/services/queries/hyperliquid/types";
import LeverageModal from "../../modals/leverage-modal";
import ConfirmModal from "../../modals/confirm-modal";
import MarginModeModal from "../../modals/margin-mode-modal";
import { WsActiveAssetCtx, WsActiveSpotAssetCtx } from "../../../chart/trading-view/hyperliquid/types";

const initialValues = {
  price: "0",
  quantity: "",
  tp: "",
  sl: "",
  gain: "",
  loss: "",
  reduceOnly: false,
  tif: "Gtc",
  tpSl: false,
};

export type TradingFormInitialValues = ReturnType<() => typeof initialValues>;

interface IProps {
  selectedToken: PerpUniverse | SpotsUniverse;
  ticker: WsActiveAssetCtx | WsActiveSpotAssetCtx;
}

export default function CreateOrder(props: IProps) {
  const { selectedToken, ticker } = props;

  const validationSchema = Yup.object().shape({
    price: Yup.number().min(0.01, "Price must be greater than 0").required("Please enter price"),
    quantity: Yup.number().min(0, "Quantity must be a positive number").required("Please enter quantity"),
    reduceOnly: Yup.boolean(),
    tpSl: Yup.boolean(),
    tp: Yup.number().min(0, "Take Profit must be a positive number"),
    sl: Yup.number().min(0, "Stop Loss must be a positive number"),
    gain: Yup.number().min(0, "Gain must be a positive number"),
    loss: Yup.number().min(0, "Loss must be a positive number"),
    tif: Yup.string().oneOf(["Gtc", "Ioc", "Alo"]).required("Please select Time in Force"),
  });

  const account = useAccount();
  const walletAddress = account?.address || "";

  const tradingSymbol = selectedToken?.baseTokenName || "";
  const currAsset = selectedToken?.index || 0;
  const maxLeverage = selectedToken?.maxLeverage || 0;

  const { data: perpBalance } = useGetPerpBalance(walletAddress);
  const { data: assetData } = useGetAssetData(walletAddress, tradingSymbol);

  const availableBalance = perpBalance?.withdrawable;

  const currentPosition =
    perpBalance?.assetPositions?.find((fn) => fn.position.coin === tradingSymbol)?.position.szi || "0.00";

  const { session } = useSupabaseAuth();

  const { mutate, isPending } = useExecuteTrade(session?.access_token);

  const [orderType, setOrderType] = useState<"limit" | "market" | "trigger">("limit");
  const [isLong, setIsLong] = useState(true);
  const [leverage, setLeverage] = useState<null | number>(null);
  const [isCross, setIsCross] = useState<boolean>(false);

  const selectOptions =
    selectedToken?.displayName?.split("-").map((ed) => {
      return {
        label: ed,
        value: ed,
      };
    }) || [];

  const [orderBy, setOrderBy] = useState(selectOptions[1]?.value || "");
  const [isLeverageModalOpen, setIsLeverageModalOpen] = useState(false);
  const toggleLeverageModal = () => setIsLeverageModalOpen(!isLeverageModalOpen);

  const [isMarginModeModalOpen, setIsMarginModeModalOpen] = useState(false);
  const toggleMarginModeModal = () => setIsMarginModeModalOpen(!isMarginModeModalOpen);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const toggleConfirmModal = () => setIsConfirmModalOpen(!isConfirmModalOpen);
  const [pendingOrderPayload, setPendingOrderPayload] = useState<TradeExecutionPayload | null>(null);

  const closeAllLeverageModals = () => {
    setIsMarginModeModalOpen(false);
    setIsConfirmModalOpen(false);
  };

  const updateLeverage = (value: number) => {
    setLeverage(value);
    updateLeverageMutation({
      provider: "hyperliquid",
      asset: currAsset,
      leverage: value,
      wallet_address: walletAddress,
      isCross,
    });
  };

  const updateMarginMode = (crossMode: boolean) => {
    setIsCross(crossMode);
    updateLeverageMutation({
      provider: "hyperliquid",
      asset: currAsset,
      leverage: leverage || 1,
      wallet_address: walletAddress,
      isCross: crossMode,
    });
  };

  const { mutate: updateLeverageMutation, isPending: updateLeverageLoading } = useUpdateLeveraggeTrade(
    closeAllLeverageModals,
    session?.access_token,
  );

  const marketPrice = ticker?.ctx?.midPx?.toString() || "0";

  function validateTpSl(values: TradingFormInitialValues, isLong: boolean): boolean {
    if (!values.tpSl) return true;

    // const orderPrice = Number(values.price);

    const orderPrice = orderType === "market" ? Number(marketPrice) : Number(values.price);

    const tpPrice = Number(values.tp);
    const slPrice = Number(values.sl);

    // Check if TP and SL are greater than 0
    if (tpPrice && tpPrice <= 0) {
      toast.error("Take Profit price must be greater than 0");
      return false;
    }
    if (slPrice && slPrice <= 0) {
      toast.error("Stop Loss price must be greater than 0");
      return false;
    }

    if (isLong) {
      // For long positions: TP must be higher than order price, SL must be lower
      if (tpPrice && tpPrice <= orderPrice) {
        toast.error("Take Profit price must be greater than order price for long positions");
        return false;
      }
      if (slPrice && slPrice >= orderPrice) {
        toast.error("Stop Loss price must be lower than order price for long positions");
        return false;
      }
    } else {
      // For short positions: TP must be lower than order price, SL must be higher
      if (tpPrice && tpPrice >= orderPrice) {
        toast.error("Take Profit price must be lower than order price for short positions");
        return false;
      }
      if (slPrice && slPrice <= orderPrice) {
        toast.error("Stop Loss price must be greater than order price for short positions");
        return false;
      }
    }

    return true;
  }
  function onSubmit(_values: TradingFormInitialValues) {
    // Validate trigger order TP/SL prices
    if (!validateTpSl(_values, isLong)) {
      return;
    }

    const converter = marketPrice;
    const orderSize =
      orderBy === selectOptions[0].value ? _values.quantity : (Number(_values.quantity) / Number(converter)).toFixed(5);
    const hasTP = _values.tpSl && _values.tp && Number(_values.tp) > 0;
    const hasSL = _values.tpSl && _values.sl && Number(_values.sl) > 0;

    // Create main order
    const orders: OrderEnum[] = [];

    if (orderType === "market") {
      orders.push({
        type: "market",
        asset: currAsset,
        side: isLong ? "buy" : "sell",
        size: orderSize,
        reduceOnly: _values.reduceOnly,
      });
    } else if (orderType === "limit") {
      orders.push({
        type: "limit",
        asset: currAsset,
        side: isLong ? "buy" : "sell",
        price: String(_values.price),
        size: orderSize,
        reduceOnly: _values.reduceOnly,
        timeInForce: _values.tif as TifEnum,
      });
    }

    // Add TP order if exists
    if (hasTP) {
      orders.push({
        type: "trigger",
        asset: currAsset,
        side: isLong ? "sell" : "buy", // Opposite side to close position
        triggerPrice: _values.tp,
        size: orderSize,
        isMarket: true,
        reduceOnly: true,
        tpsl: "tp",
      });
    }

    // Add SL order if exists
    if (hasSL) {
      orders.push({
        type: "trigger",
        asset: currAsset,
        side: isLong ? "sell" : "buy", // Opposite side to close position
        triggerPrice: _values.sl,
        size: orderSize,
        isMarket: true,
        reduceOnly: true,
        tpsl: "sl",
      });
    }

    const orderPayload = {
      provider: "hyperliquid",
      wallet_address: walletAddress,
      grouping: hasTP || hasSL ? "normalTpsl" : "na",
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
    if (assetData) {
      if (!leverage) {
        setLeverage(assetData.leverage.value);
      }
      if (assetData.leverage.type !== undefined) {
        setIsCross(assetData.leverage.type === "cross");
      }
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
                    currentPosition={currentPosition}
                    setOrderType={setOrderType}
                    isLong={isLong}
                    setIsLong={setIsLong}
                    leverage={leverage || 1}
                    isCross={isCross}
                    toggleLeverageModal={toggleLeverageModal}
                    toggleMarginModeModal={toggleMarginModeModal}
                    isPending={isPending}
                    marketPrice={marketPrice}
                    selectOptions={selectOptions}
                    orderBy={orderBy}
                    setOrderBy={setOrderBy}
                  />

                  <TransferButtons toPerp />
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
          onClose={toggleLeverageModal}
        />
      </ModalContainer>

      <ModalContainer
        open={isMarginModeModalOpen}
        handleClose={toggleMarginModeModal}
        title={`${selectedToken?.displayName} Margin Mode`}
        headerClassName="text-center w-full text-lg font-medium"
        hideX
        className="!max-w-[462px] px-6 py-8 bg-[#141416] gap-0"
      >
        <MarginModeModal
          isCross={isCross}
          updateMarginMode={updateMarginMode}
          isLoading={updateLeverageLoading}
          onClose={toggleMarginModeModal}
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
