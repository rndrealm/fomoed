import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { toast } from "sonner";
import { useApproveApiAgent, useGetAgentAddress } from "@/services/queries/hyperliquid";
import { useSupabaseAuth } from "@/components/providers";
import { approveApiWallet } from "../../../utils";
import { isTestnet } from "../../../utils/constants";

interface IProps {
  updateStep: (step: number) => void;
  toggleModal: () => void;
  onConfirm: () => void;
}

const AuthorizeModal = (props: IProps) => {
  const { updateStep, toggleModal, onConfirm } = props;
  const [isLoading, setIsLoading] = useState(false);
  const account = useAccount();
  const walletClient = useWalletClient();

  const { session } = useSupabaseAuth();

  const { data, isPending: agentIsPending } = useGetAgentAddress(account.address, session?.access_token);

  const onMutateSuccess = () => {
    toggleModal();
    onConfirm();
  };

  const { mutate, isPending } = useApproveApiAgent(session?.access_token, onMutateSuccess);

  const handleGrantPermission = async () => {
    if (!account.address) {
      toast.error("Please connect your wallet!");
      return;
    }

    if (!walletClient.data) {
      toast.error("Please reconnect your wallet!");
      return;
    }

    try {
      setIsLoading(true);
      const result = await approveApiWallet(walletClient.data, data.agent_wallet, isTestnet);
      if (result.status === "ok") {
        mutate({ wallet_address: account.address });
      } else {
        toast.error("Something went wrong!");
      }
    } catch (error: any) {
      console.log(error.message);
      toast.error(error.message?.split(".")?.[0] || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div>
      <h1 className="text-center text-white font-medium text-lg pt-5 pb-9">Authorize API Access</h1>
      <p className="text-[#B0B0B0] font-medium  text-xs">
        Allow this agent wallet to execute trades, read balances, and automate actions securely. It operates with
        restricted privileges and does not have the ability to move or withdraw assets.
      </p>

      <div className="flex items-center gap-2 pt-8">
        <Button
          className="flex-1 bg-[#171717] hover:opacity-90 border-[#1F1F1F] border  text-white font-medium text-sm h-11"
          onClick={toggleModal}
          disabled={isLoading || isPending}
        >
          Decline
        </Button>
        <Button
          className="flex-1 bg-[#51D2C1] hover:opacity-90 hover:bg-[#51D2C1]  text-[#010101] font-medium text-sm h-11"
          onClick={handleGrantPermission}
          isLoading={isPending || isLoading || agentIsPending}
        >
          Grant Permission
        </Button>
      </div>
    </div>
  );
};

export default AuthorizeModal;
