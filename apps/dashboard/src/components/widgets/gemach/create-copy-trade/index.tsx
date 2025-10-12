import React, { useEffect, useState } from "react";
import { FirstStep } from "./first-step";
import { SecondStep } from "./second-step";
import { RenderIf } from "@/components/shared";
import { ThirdStep } from "./third-step";
import { useAccount } from "wagmi";
import { useGemachCreateHyperliquidCopyTrade, useGemachUpdateHyperliquidCopyTrade } from "@/services/queries/gemach";
import { useSupabaseAuth } from "@/components/providers";
import { useAtom, useAtomValue } from "jotai";
import { copyTradeTraderWalletAtom, showEditCopyTradeAtom, singleCopyTradeAtom } from "@/lib/atoms/gemach";
import { toast } from "sonner";
import { copy } from "@testing-library/user-event/dist/cjs/clipboard/copy.js";

interface IProps {
  handleClose: () => void;
}

const firstStepInitialValues = {
  oppositeCopy: false,
  copyTradeName: "",
  traderWallet: "",
};

const secondStepInitialValues = {
  copyMode: 1,
  fixedAmountCostPerOrder: 0,
};

const thirdStepInitialValues = {
  profitPercent: 0,
  lossPercent: 0,
};

export function CreateCopyTrade(props: IProps) {
  const { handleClose } = props;

  const [copyTradeWallet, setCopyTraderWallet] = useAtom(copyTradeTraderWalletAtom);
  const showEditCopyTrade = useAtomValue(showEditCopyTradeAtom);

  const [singleCopyTrade, setSingleCopyTrade] = useAtom(singleCopyTradeAtom);

  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [formValues, setFormValues] = useState({
    oppositeCopy: singleCopyTrade?.oppositeCopy || false,
    copyTradeName: singleCopyTrade?.copyTradeName || "",
    traderWallet: singleCopyTrade?.traderWallet || copyTradeWallet || "",
    copyMode: singleCopyTrade?.copyMode || secondStepInitialValues.copyMode,
    fixedAmountCostPerOrder:
      Number(singleCopyTrade?.fixedAmountCostPerOrder) || secondStepInitialValues.fixedAmountCostPerOrder,
    profitPercent: Number(singleCopyTrade?.profitPercent) || thirdStepInitialValues.profitPercent,
    lossPercent: Number(singleCopyTrade?.lossPercent) || thirdStepInitialValues.lossPercent,
  });

  const { session } = useSupabaseAuth();
  const createCopyTrade = useGemachCreateHyperliquidCopyTrade(session?.access_token);
  const updateCopyTrade = useGemachUpdateHyperliquidCopyTrade(session?.access_token);

  const { address } = useAccount();

  return (
    <div className="w-full h-full bg-[rgb(26,26,26,0.5)] backdrop-blur-2xl border border-[#222222] rounded-[20px]">
      <RenderIf condition={step === 1}>
        <FirstStep
          handleClose={handleClose}
          initialValues={{ ...formValues }}
          handleNext={(values) => {
            setCopyTraderWallet(values?.traderWallet);
            setFormValues((prev) => ({ ...prev, ...values }));
            setStep(2);
          }}
        />
      </RenderIf>

      <RenderIf condition={step === 2}>
        <SecondStep
          handleClose={handleClose}
          initialValues={formValues}
          handleNext={(values) => {
            setFormValues((prev) => ({ ...prev, ...values }));
            setStep(3);
          }}
          handleGoBack={() => {
            setStep(1);
          }}
        />
      </RenderIf>

      <RenderIf condition={step === 3}>
        <ThirdStep
          handleClose={handleClose}
          initialValues={formValues}
          handleNext={(values) => {
            setFormValues((prev) => ({ ...prev, ...values }));
            const data = {
              ...formValues,
              ...values,
              address: address || "",
              lossPercent: values.lossPercent.toString(),
              profitPercent: values.profitPercent.toString(),
              copyMode: formValues.copyMode.toString(),
              fixedAmountCostPerOrder: formValues.fixedAmountCostPerOrder.toString(),
              oppositeCopy: `${formValues.oppositeCopy}`,
            };

            if (showEditCopyTrade) {
              updateCopyTrade.mutate(
                {
                  ...data,
                  copyTradeId: singleCopyTrade?.copyTradeId || "",
                  isChangeStatus: false,
                  isDelete: false,
                },
                {
                  onError() {
                    toast.error("Failed to update copy trade. Please try again.");
                  },
                  onSuccess: () => {
                    toast.success("Copy trade updated successfully.");
                    handleClose();
                  },
                },
              );
            } else {
              createCopyTrade.mutate(data, {
                onSuccess: () => {
                  toast.success("Copy Trade created successfully!");
                  handleClose();
                },
                onError: (error) => {
                  toast.error("Error creating copy trade");
                },
              });
            }
          }}
          handleGoBack={() => {
            setStep(2);
          }}
          isLoading={createCopyTrade.isPending || updateCopyTrade.isPending}
        />
      </RenderIf>
    </div>
  );
}
