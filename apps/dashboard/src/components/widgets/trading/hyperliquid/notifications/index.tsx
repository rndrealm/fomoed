import React, { useEffect } from "react";
import { useAccount } from "wagmi";
import { useNotifications } from "../../chart/trading-view/hyperliquid/use-notifications";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function Notification() {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  const { isConnected, notification } = useNotifications(address);

  // console.log(isConnected, notification, address);

  useEffect(() => {
    if (isConnected && notification) {
      toast.info(notification);
      queryClient.invalidateQueries({ queryKey: ["hyper-liquid-balance"] });
      queryClient.invalidateQueries({ queryKey: ["hyper-liquid-balance-spot"] });
    }
  }, [notification]);

  return null;
}
