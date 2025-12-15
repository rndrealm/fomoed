import { Button } from "@/components/ui/button";
import React from "react";
import { useSupabaseAuth } from "@/components/providers";
import { useExecuteTrade } from "@/services/queries/trading";
import { useAccount } from "wagmi";
import { OrderEnum } from "@/services/queries/trading/types";
import OrderCheckLayout from "../../create-order/order-check-layout";
import { useClearingHouseState } from "../../../chart/trading-view/hyperliquid/use-clearinghouse-state";
import { useQueryClient } from "@tanstack/react-query";

interface IProps {
  toggleModal: () => void;
  tokensData: any;
}

const CloseAllOrders = (props: IProps) => {
  const { toggleModal, tokensData } = props;
  const account = useAccount();
  const { address } = account;
  const userAddress = address || "";
  const queryClient = useQueryClient();

  const { clearingHouse } = useClearingHouseState(userAddress);
  const { session } = useSupabaseAuth();

  const onSuccessCallback = () => {
    queryClient.invalidateQueries({ queryKey: ["hyper-liquid-balance"] });
    queryClient.invalidateQueries({ queryKey: ["hyper-liquid-balance-spot"] });
    toggleModal();
  };

  const { mutate, isPending } = useExecuteTrade(session?.access_token, onSuccessCallback);

  const handleSubmit = () => {
    const orderData: OrderEnum[] = [];

    // Aggregate all open positions
    clearingHouse?.clearinghouseState?.assetPositions?.forEach((item) => {
      const size = parseFloat(item?.position?.szi || "0");
      const isLong = size > 0;
      const absSize = Math.abs(size).toString();
      const coin = item?.position?.coin;
      const isSpot = coin?.includes("/");

      // Find the token in the appropriate list
      const tokensArray = (isSpot ? tokensData?.spot : tokensData?.perp) || [];
      const selectedToken = tokensArray.find((token: any) => token.name === coin);

      if (!selectedToken) return;

      const assetIndex = isSpot ? selectedToken.index + 10000 : selectedToken.index;

      // Add market order to close this position
      orderData.push({
        asset: assetIndex,
        side: isLong ? "sell" : "buy",
        size: absSize,
        type: "market",
        reduceOnly: true,
        isSpot,
      });
    });

    if (orderData.length === 0) {
      toggleModal();
      return;
    }

    mutate({
      provider: "hyperliquid",
      wallet_address: account.address || "",
      grouping: "na",
      orders: orderData,
    });
  };

  const positionCount = clearingHouse?.clearinghouseState?.assetPositions?.length || 0;

  return (
    <div className="flex flex-col">
      <p className="font-medium text-[#B0B0B0] text-center text-xs pt-4">
        This will immediately close all {positionCount} open position{positionCount !== 1 ? "s" : ""} at market price.
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
            disabled={positionCount === 0}
            onClick={handleSubmit}
            isLoading={isPending}
            className="w-full bg-white hover:bg-[#f4f4f4] text-[#1E1E1E] font-medium text-[0.875rem] leading-[14px] h-12"
          >
            Close All Positions
          </Button>
        </OrderCheckLayout>
      </div>
    </div>
  );
};

export default CloseAllOrders;
