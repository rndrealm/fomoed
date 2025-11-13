import React, { useState } from "react";
import { FormContent } from "./form";
import { Overview } from "./overview";
import { Formik } from "formik";
import * as Yup from "yup";
import { useAccount } from "wagmi";
import { useGetPerpBalance } from "@/services/queries/hyperliquid";
import { useExecuteTrade } from "@/services/queries/trading";
import { TradeExecutionPayload } from "@/services/queries/trading/types";
import LeverageModal from "./leverage-modal";
import { ModalContainer } from "@/components/shared/modal-container";
import { useSupabaseAuth } from "@/components/providers";

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

  const availableBalance = perpBalance.withdrawable;
  const { session } = useSupabaseAuth();

  const { mutate, isPending } = useExecuteTrade(session?.access_token);

  const [orderType, setOrderType] = useState<"limit" | "market" | "conditional">("limit");
  const [isLong, setIsLong] = useState(true);
  const [leverage, setLeverage] = useState(2);
  const [isLeverageModalOpen, setIsLeverageModalOpen] = useState(false);

  const toggleLeverageModal = () => setIsLeverageModalOpen(!isLeverageModalOpen);
  const updateLeverage = (value: number) => setLeverage(value);

  function onSubmit(_values: TradingFormInitialValues) {
    const converter = _values.price; //Todo: make this dynamic based on market price
    const orderPayload = {
      provider: "hyperliquid",
      wallet_address: walletAddress,
      grouping: "na",
      orders: [
        {
          type: orderType,
          asset: 3, //Todo: Update later when chart dropdown has been integrated
          side: isLong ? "buy" : "sell",
          size: (Number(_values.quantity) / Number(converter)).toString(),
          reduceOnly: _values.reduceOnly,
          timeInForce: orderType === "market" ? "Ioc" : _values.tif,
        },
      ],
    } as TradeExecutionPayload;

    mutate(orderPayload);
  }

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
                <div className="bg-[#121317] rounded-[10px] pt-2 px-3 pb-4">
                  <FormContent
                    balance={Number(availableBalance) ? Number(availableBalance) : 0}
                    orderType={orderType}
                    setOrderType={setOrderType}
                    isLong={isLong}
                    setIsLong={setIsLong}
                    leverage={leverage}
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
          isOpen={isLeverageModalOpen}
          toggle={toggleLeverageModal}
          leverage={leverage}
          updateLeverage={updateLeverage}
        />
      </ModalContainer>
    </>
  );
}
