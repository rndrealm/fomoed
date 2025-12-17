import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { useSupabaseAuth } from "@/components/providers";
import { useExecuteTrade } from "@/services/queries/trading";
import { useAccount, useWalletClient } from "wagmi";
import { OrderEnum } from "@/services/queries/trading/types";
import { useQueryClient } from "@tanstack/react-query";
import OrderCheckLayout from "../create-order/order-check-layout";
import { approveBuilderFeeFn } from "../../utils";
import { HYPERLIQUID_BUILDER_ADDRESS, isTestnet } from "../../utils/constants";
import { toast } from "sonner";

interface IProps {
  toggleModal: () => void;
}

const ApproveBuilderModal = (props: IProps) => {
  const { toggleModal } = props;
  const [isLoading, setIsLoading] = useState(false);
  const walletClient = useWalletClient();
  const account = useAccount();

  const queryClient = useQueryClient();

  const { session } = useSupabaseAuth();

  const handleGrant = async () => {
    try {
      setIsLoading(true);
      const result = await approveBuilderFeeFn(walletClient.data, HYPERLIQUID_BUILDER_ADDRESS, isTestnet);
      setIsLoading(false);
      if (result.status === "ok") {
        queryClient.invalidateQueries({ queryKey: ["get-builder-fee"] });
        toggleModal();
        toast("Approval Successful");
      } else {
        toast("Something went wrong");
      }
    } catch (error) {
      console.log(error);
      toast("Something went wrong");
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <p className="font-medium text-[#B0B0B0] text-center text-xs pt-4">
        {/* This will immediately close all open position at market price. */}
      </p>

      <div className="pt-8">
        <OrderCheckLayout
          buttonClassName="w-full bg-[#E7E7E7] hover:bg-[#E7E7E7] text-[#010101] font-medium text-sm h-11"
          buttonContainerClassName="w-full"
          buttonWrapperClassName="w-full"
          approveClassName="h-11 !text-[0.875rem]"
        >
          <Button
            type="button"
            onClick={handleGrant}
            isLoading={isLoading}
            className="w-full bg-white hover:bg-[#f4f4f4] text-[#1E1E1E] font-medium text-[0.875rem] leading-[14px] h-12"
          >
            Approve
          </Button>
        </OrderCheckLayout>
      </div>
    </div>
  );
};

export default ApproveBuilderModal;
