import { TextInput } from "@/components/auth";
import { TransferIcon } from "@/components/icons/icon2";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGetPerpBalance, useGetSpotBalance } from "@/services/queries/hyperliquid";
import React, { useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { transferSpotPerp } from "../../utils";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { isTestnet } from "../../utils/constants";

interface IProps {
  toPerp: boolean;
  toggleToPerp: () => void;
  toggleModal: () => void;
}

const PerpSpotTransferModal = (props: IProps) => {
  const { toPerp, toggleToPerp, toggleModal } = props;
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const account = useAccount();
  const walletClient = useWalletClient();
  const walletAddress = account?.address || "";
  const { data: perpBalance } = useGetPerpBalance(walletAddress);
  const { data: spotBalance } = useGetSpotBalance(walletAddress);
  const maxValue = toPerp
    ? spotBalance?.balances.find((spt) => spt.coin === "USDC")?.total || "0"
    : perpBalance.withdrawable;

  const handleBalance = async () => {
    try {
      setIsLoading(true);
      const result = await transferSpotPerp(walletClient.data, value, toPerp, isTestnet);
      setIsLoading(false);
      if (result.status === "ok") {
        queryClient.invalidateQueries({ queryKey: ["hyper-liquid-balance"] });
        queryClient.invalidateQueries({ queryKey: ["hyper-liquid-balance-spot"] });
        toggleModal();
        toast("Transfer Successful");
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
    <div className="flex flex-col mt-4">
      <div className="flex justify-center">
        <Button
          type="button"
          onClick={toggleToPerp}
          className=" w-fit bg-[#1F1F21]  text-white font-medium text-[10px] leading-[14px] h-[28px]"
        >
          <span>{toPerp ? "Spot" : "Perp"}</span>
          <TransferIcon className="size-2.5" />
          <span>{toPerp ? "Perp" : "Spot"}</span>
        </Button>
      </div>
      <p className="pt-2 font-medium text-[#B0B0B0] text-xs">
        Move USDC between Perps and Spot so your balance is ready where you trade.
      </p>
      <div className="py-4">
        <TextInput
          type="number"
          className={cn(
            "h-10 w-full rounded-[10px] border border-[#1F1F1F] bg-[#0D0D0D] px-2 pr-4 text-sm text-white placeholder:text-[#5F5F5F] focus:outline-none focus:border-[#f4f4f4]",
            {
              "border-[#FFC26D] focus:border-[#FFC26D]": "",
            },
          )}
          placeholder="$0"
          value={value}
          onChange={(e) => setValue((e.target as HTMLInputElement).value)}
          min="1"
          max={maxValue}
          step="0.1"
          rightPlaceholder={`Max: $${Number(maxValue).toFixed(2)}`}
          rightPlaceholderClassName="text-sm top-[28%] text-[#FFC26D]"
          disableFormikError
        />
      </div>
      <div>
        <Button
          type="button"
          isLoading={isLoading}
          onClick={handleBalance}
          disabled={isLoading || Number(value) > Number(maxValue)}
          className="w-full bg-white hover:bg-[#f4f4f4]  text-[#1E1E1E] font-medium text-[0.875rem] leading-[14px] h-12"
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

export default PerpSpotTransferModal;
