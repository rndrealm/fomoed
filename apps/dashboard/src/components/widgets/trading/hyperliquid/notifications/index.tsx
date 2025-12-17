import React, { useEffect } from "react";
import { useAccount } from "wagmi";
import { useNotifications } from "../../chart/trading-view/hyperliquid/use-notifications";
import { toast } from "sonner";

export default function Notification() {
  const { address } = useAccount();

  const { isConnected, notification } = useNotifications(address);

  console.log(isConnected, notification, address);

  useEffect(() => {
    if (isConnected && notification) {
      toast.info(notification);
    }
  }, [notification]);

  return null;
}
