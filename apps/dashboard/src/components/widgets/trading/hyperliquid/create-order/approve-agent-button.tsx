import { useSupabaseAuth } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { useApproveApiAgent, useGetAgentAddress } from "@/services/queries/hyperliquid";
import React, { useState } from "react";
import { toast } from "sonner";
import { useAccount, useWalletClient } from "wagmi";
import { approveApiWallet } from "../../utils";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

interface IProps {
  title?: string;
  className?: string;
}

const ApproveAgentButton = (props: IProps) => {
  const { title, className } = props;
  const [isLoading, setIsLoading] = useState(false);
  const account = useAccount();
  const walletClient = useWalletClient();
  const queryClient = useQueryClient();

  const { session } = useSupabaseAuth();
  const { data, isPending: agentIsPending } = useGetAgentAddress(account?.address, session?.access_token);

  const handleGrantPermission = async () => {
    if (!account.address) {
      toast("Please connect your wallet!");
      return;
    }

    try {
      setIsLoading(true);
      const result = await approveApiWallet(walletClient.data, data.agent_wallet, true);
      if (result.status === "ok") {
        queryClient.invalidateQueries({ queryKey: ["hyper-liquid-agent-role", data.agent_wallet] });
      } else {
        toast("Something went wrong!");
      }
    } catch (error: any) {
      console.log(error);
      toast(error.message?.split(".")?.[0] || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Button
      className={cn(
        "flex-1 bg-[#51D2C1] hover:opacity-90 hover:bg-[#51D2C1]  text-[#010101] font-medium text-xxs w-full h-7",
        className,
      )}
      type="button"
      onClick={handleGrantPermission}
      isLoading={isLoading || agentIsPending}
    >
      {title || "Grant Permission"}
    </Button>
  );
};

export default ApproveAgentButton;
