import { TextInput } from "@/components/auth";
import { TransferIcon } from "@/components/icons/icon2";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGetPerpBalance, useGetSpotBalance } from "@/services/queries/hyperliquid";
import React, { useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { transferSpotPerp, withdrawFromHyperliquid } from "../../utils";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import { isTestnet } from "../../utils/constants";

interface IProps {
  toggleModal: () => void;
}

const WithdrawalModal = (props: IProps) => {
  const { toggleModal } = props;
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const account = useAccount();
  const walletClient = useWalletClient();
  const walletAddress = account?.address || "";
  const { data: perpBalance } = useGetPerpBalance(walletAddress);
  const maxValue = perpBalance.withdrawable;

  const handleBalance = async () => {
    try {
      setIsLoading(true);
      const result = await withdrawFromHyperliquid(walletClient.data, walletAddress, value, isTestnet);
      setIsLoading(false);
      if (result.status === "ok") {
        queryClient.invalidateQueries({ queryKey: ["hyper-liquid-balance"] });
        toggleModal();
        toast("Withdrawal Successful");
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
    <div className="flex flex-col ">
      <div className="flex justify-center">
        <Image src={dashboard.usdc} alt="USDC icon" width={30} height={30} />
      </div>
      <h3 className="text-lg font-medium py-4 text-center text-white">Withdraw USDC to Arbitrum</h3>
      <p className=" font-medium text-[#B0B0B0] text-xs">
        USDC Will be sent to your address over the arbitrum network, a 1 USDC fee will be deducted from the amount
        you’re about to send
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
          disabled={isLoading || !value || Number(value) <= 0 || Number(value) > Number(maxValue)}
          className="w-full bg-white hover:bg-[#f4f4f4]  text-[#1E1E1E] font-medium text-[0.875rem] leading-[14px] h-12"
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

export default WithdrawalModal;
