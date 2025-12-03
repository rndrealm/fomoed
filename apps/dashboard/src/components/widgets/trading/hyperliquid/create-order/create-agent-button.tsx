import { useSupabaseAuth } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { useCreateApiAgent } from "@/services/queries/hyperliquid";
import React from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

interface IProps {
  title?: string;
  className?: string;
}

const CreateAgentButton = (props: IProps) => {
  const { title, className } = props;
  const account = useAccount();
  const { session } = useSupabaseAuth();
  const queryClient = useQueryClient();

  const onSuccessCallback = () => {
    queryClient.invalidateQueries({ queryKey: ["agent-address", account.address] });
  };

  const { mutate, isPending } = useCreateApiAgent(session?.access_token, onSuccessCallback);

  const handleCreateAgent = () => {
    if (!account.address) {
      toast("Please connect your wallet!");
      return;
    }
    mutate({ wallet_address: account.address });
  };

  return (
    <Button
      className={cn(
        "flex-1 bg-[#51D2C1] hover:opacity-90 hover:bg-[#51D2C1]  text-[#010101] font-medium text-xxs w-full h-7",
        className,
      )}
      type="button"
      onClick={handleCreateAgent}
      isLoading={isPending}
    >
      {title || "Create Agent"}
    </Button>
  );
};

export default CreateAgentButton;
