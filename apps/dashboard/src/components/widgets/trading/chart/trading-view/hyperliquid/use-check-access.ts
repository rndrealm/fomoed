import { useMemo, useRef } from "react";
import { useGetAgentAddress, useGetHyperliquidAgentRole } from "@/services/queries/hyperliquid";
import { useAccount } from "wagmi";
import { useSupabaseAuth } from "@/components/providers";

type CheckAccessResult = {
  connected: boolean;
  blocker: "wallet" | "api" | null;
  isPending: boolean;
};

/**
 * This hook checks the access level of a user.
 * First check is for wallet connection
 * Second check is if api agent has access
 * If all pass you're good to go
 */
export const useCheckAccess = (): CheckAccessResult => {
  const { isConnected, isConnecting, isReconnecting, address } = useAccount();
  const { session } = useSupabaseAuth();
  const { data: agentAddress } = useGetAgentAddress(address, session?.access_token);
  const { data, isPending } = useGetHyperliquidAgentRole(agentAddress?.agent_wallet);

  const role = data?.role;
  const resultRef = useRef<CheckAccessResult>({
    connected: false,
    blocker: null,
    isPending: false,
  });

  return useMemo(() => {
    let newResult: CheckAccessResult;

    if (!isConnected) {
      newResult = {
        connected: false,
        blocker: "wallet" as const,
        isPending: isPending || isConnecting || isReconnecting,
      };
    } else if (role === "missing") {
      newResult = {
        connected: false,
        blocker: "api" as const,
        isPending: isPending || isConnecting || isReconnecting,
      };
    } else {
      newResult = {
        connected: true,
        blocker: null,
        isPending: false,
      };
    }

    // Only return a new object if the values actually changed
    if (
      resultRef.current.connected === newResult.connected &&
      resultRef.current.blocker === newResult.blocker &&
      resultRef.current.isPending === newResult.isPending
    ) {
      return resultRef.current;
    }

    resultRef.current = newResult;
    return newResult;
  }, [isConnected, isConnecting, isReconnecting, role, isPending]);
};
