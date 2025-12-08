import { useSupabaseAuth } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { useApproveApiAgent, useCreateApiAgent, useGetAgentAddress } from "@/services/queries/hyperliquid";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAccount, useWalletClient } from "wagmi";
import { approveApiWallet } from "../../utils";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { CreateApiAgentResponse } from "@/services/queries/hyperliquid/types";

interface IProps {
  title?: string;
  className?: string;
}

const ApproveAgentButton = (props: IProps) => {
  const { title, className } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [agentWallet, setAgentWallet] = useState<string | null>(null);
  const account = useAccount();
  const walletClient = useWalletClient();
  const queryClient = useQueryClient();

  const onCreateSuccess = (_data: CreateApiAgentResponse) => {
    setAgentWallet(_data.agent_address);
  };

  const { session } = useSupabaseAuth();
  const { mutate, isPending: agentIsPending } = useCreateApiAgent(session?.access_token, onCreateSuccess);

  useEffect(() => {
    if (!account?.address) return;
    mutate({ wallet_address: account?.address });
  }, []);

  const handleGrantPermission = async () => {
    if (!account.address) {
      toast("Please connect your wallet!");
      return;
    }

    if (!agentWallet) {
      toast("Agent wallet not available, please refresh the page!");
      return;
    }

    try {
      setIsLoading(true);
      const result = await approveApiWallet(walletClient.data, agentWallet, true);
      if (result.status === "ok") {
        queryClient.invalidateQueries({ queryKey: ["agent-address"] });
        // queryClient.invalidateQueries({ queryKey: ["hyper-liquid-agent-role"] });
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
      disabled={!agentWallet}
      isLoading={isLoading || agentIsPending}
    >
      {title || "Grant Permission"}
    </Button>
  );
};

export default ApproveAgentButton;
