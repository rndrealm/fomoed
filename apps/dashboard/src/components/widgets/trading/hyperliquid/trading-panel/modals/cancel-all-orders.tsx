import { Button } from "@/components/ui/button";
import React from "react";
import { useSupabaseAuth } from "@/components/providers";
import { useCancelOrder } from "@/services/queries/trading";
import { useAccount } from "wagmi";
import { PerpUniverse, SpotsUniverse } from "@/services/queries/hyperliquid/types";
import OrderCheckLayout from "../../create-order/order-check-layout";

interface IProps {
  toggleModal: () => void;
  tokensData:
    | {
        spot: SpotsUniverse[];
        perp: PerpUniverse[];
        allTokens: (SpotsUniverse | PerpUniverse)[];
      }
    | undefined;
  openOrders: any;
}

const CancelAllOrders = (props: IProps) => {
  const { toggleModal, tokensData, openOrders } = props;
  // console.log(tokensData);
  const { address } = useAccount();
  const { session } = useSupabaseAuth();

  const onSuccessCallback = () => {
    toggleModal();
  };

  const { mutate, isPending } = useCancelOrder(session?.access_token, onSuccessCallback);

  const handleSubmit = async () => {
    const cancelData: { orderId: number; assetId: number }[] = [];

    // Aggregate all open orders
    openOrders?.orders?.forEach((item: any) => {
      const coin = item.coin;
      const isSpot = coin.includes("/") || coin.includes("@");
      const tokensArray = (isSpot ? tokensData?.spot : tokensData?.perp) || [];
      const currentToken = tokensArray.find((token) => token.name === coin);
      console.log(isSpot);
      if (!currentToken) return;

      const assetId = isSpot ? currentToken.index + 10000 : currentToken.index;

      cancelData.push({
        orderId: item.oid,
        assetId: assetId,
      });
    });

    if (cancelData.length === 0) {
      toggleModal();
      return;
    }

    mutate({
      provider: "hyperliquid",
      wallet_address: address || "",
      orders: cancelData,
    });
  };

  const orderCount = openOrders?.orders?.length || 0;

  return (
    <div className="flex flex-col">
      <p className="font-medium text-[#B0B0B0] text-center text-xs pt-4">
        Are you sure you want to cancel {orderCount === 1 ? "this" : `all ${orderCount}`} open order{orderCount !== 1 ? "s" : ""}? This action cannot be
        undone.
      </p>

      <div className="pt-8">
        <OrderCheckLayout
          buttonClassName="w-full bg-[#E7E7E7]  hover:bg-[#E7E7E7]  text-[#010101] font-medium text-sm h-11 "
          buttonContainerClassName="w-full"
          buttonWrapperClassName="w-full"
          approveClassName="h-11 !text-[0.875rem]"
        >
          <Button
            type="button"
            disabled={orderCount === 0}
            onClick={handleSubmit}
            isLoading={isPending}
            className="w-full bg-white hover:bg-white  text-black font-medium text-[0.875rem] leading-[14px] h-12"
          >
            Confirm
          </Button>
        </OrderCheckLayout>
      </div>
    </div>
  );
};

export default CancelAllOrders;
