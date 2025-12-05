import React, { useMemo } from "react";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import { useHyperliquidOpenOrders } from "@/services/queries/hyperliquid-dex";

interface ConditionalOrdersTabProps {
  userAddress: string;
  coinInfoMap: Record<string, { name: string; icon: string }>;
}

const ConditionalOrdersTab = ({ userAddress, coinInfoMap }: ConditionalOrdersTabProps) => {
  const { data: openOrders } = useHyperliquidOpenOrders(userAddress, !!userAddress);

  const orders = useMemo(() => {
    if (!openOrders) return [];
    return openOrders.filter((order) => order.isTrigger || order.isPositionTpsl);
  }, [openOrders]);

  const formatNumber = (num: number | string) => {
    const n = typeof num === "string" ? parseFloat(num) : num;
    if (n === 0) return "0";
    if (n < 0.00000001) return n.toExponential(2);
    return n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 8 });
  };

  const formatPrice = (price: string | number) => {
    const p = typeof price === "string" ? parseFloat(price) : price;
    return `$${p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`;
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCoinInfo = (symbol: string) => {
    return (
      coinInfoMap[symbol] || {
        name: symbol,
        icon: "https://static.coinstats.app/coins/1650455771843.png",
      }
    );
  };

  const getTriggerText = (order: any) => {
    if (!order.triggerPx || order.triggerPx === "0") return "-";

    const condition = order.triggerCondition || ">=";
    const price = formatPrice(order.triggerPx);

    return `Mark ${condition} ${price}`;
  };

  const handleCancelOrder = (oid: number, coin: string) => {
    // TODO: Implement cancel order logic
    console.log("Cancel order:", oid, coin);
  };

  const handleEditOrder = (oid: number, coin: string) => {
    // TODO: Implement edit order logic
    console.log("Edit order:", oid, coin);
  };

  const isPerpetualOrder = (order: any) => {
    return order.reduceOnly || order.coin.includes("-PERP") || order.coin.includes("PERP");
  };

  const getSideLabel = (order: any) => {
    const isBuy = order.side === "B";
    const isPerp = isPerpetualOrder(order);

    if (isPerp) {
      return isBuy ? "Long" : "Short";
    } else {
      return isBuy ? "Buy" : "Sell";
    }
  };

  const getOrderStatus = (order: any) => {
    const remainingSize = parseFloat(order.sz);
    const originalSize = parseFloat(order.origSz);

    if (remainingSize < originalSize && remainingSize > 0) {
      return "Pending";
    }

    if (order.isTrigger && order.triggerPx && order.triggerPx !== "0") {
      return "Pending";
    }

    return "Active";
  };

  const getStatusStyles = (status: string) => {
    const normalizedStatus = status.toLowerCase();

    if (normalizedStatus === "active" || normalizedStatus === "completed") {
      return {
        backgroundColor: "#152F22",
        color: "#21FF86",
      };
    } else if (normalizedStatus === "pending" || normalizedStatus === "loading" || normalizedStatus === "processing") {
      return {
        backgroundColor: "#382B19",
        color: "#FFC26D",
      };
    } else if (normalizedStatus === "cancelled" || normalizedStatus === "failed" || normalizedStatus === "aborted") {
      return {
        backgroundColor: "#422825",
        color: "#F99185",
      };
    }

    return {
      backgroundColor: "#152F22",
      color: "#21FF86",
    };
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div
          className="grid grid-cols-[1.2fr_0.7fr_0.7fr_0.8fr_1.5fr_1fr_0.8fr_1.1fr_0.7fr_0.9fr] gap-4 sticky top-0 z-10 bg-[#121317] border-b border-[#1B1B1B] items-center"
          style={{
            height: "40px",
            paddingTop: "12px",
            paddingBottom: "12px",
            paddingLeft: "12px",
            paddingRight: "12px",
          }}
        >
          <div className="text-[#84858C] text-[12px] font-medium">Coin</div>
          <div className="text-[#84858C] text-[12px] font-medium text-left">Size</div>
          <div className="text-[#84858C] text-[12px] font-medium text-left">Side</div>
          <div className="text-[#84858C] text-[12px] font-medium text-left">Type</div>
          <div className="text-[#84858C] text-[12px] font-medium text-left">Trigger</div>
          <div className="text-[#84858C] text-[12px] font-medium text-left">Order Price</div>
          <div className="text-[#84858C] text-[12px] font-medium text-left">Reduce Only</div>
          <div className="text-[#84858C] text-[12px] font-medium text-left">Created</div>
          <div className="text-[#84858C] text-[12px] font-medium text-left">Status</div>
          <div className="text-[#84858C] text-[12px] font-medium text-left">Actions</div>
        </div>

        {/* Empty State */}
        <div
          className="flex flex-col flex-1 items-center justify-center rounded-[15px] my-1"
          style={{
            backgroundColor: "#191B20",
            border: "1px solid #222327",
          }}
        >
          <Image src={dashboard.noOpenOrders} alt="No data" width={168} height={168} className="mb-4" />
          <p className="text-white text-[20px] font-semibold">No Conditional Orders</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div
        className="grid grid-cols-[1.2fr_0.7fr_0.7fr_0.8fr_1.5fr_1fr_0.8fr_1.1fr_0.7fr_0.9fr] gap-4 sticky top-0 z-10 bg-[#121317] border-b border-[#1B1B1B] items-center"
        style={{
          height: "40px",
          paddingTop: "12px",
          paddingBottom: "12px",
          paddingLeft: "12px",
          paddingRight: "12px",
        }}
      >
        <div className="text-[#84858C] text-[12px] font-medium">Coin</div>
        <div className="text-[#84858C] text-[12px] font-medium text-left">Size</div>
        <div className="text-[#84858C] text-[12px] font-medium text-left">Side</div>
        <div className="text-[#84858C] text-[12px] font-medium text-left">Type</div>
        <div className="text-[#84858C] text-[12px] font-medium text-left">Trigger</div>
        <div className="text-[#84858C] text-[12px] font-medium text-left">Order Price</div>
        <div className="text-[#84858C] text-[12px] font-medium text-left">Reduce Only</div>
        <div className="text-[#84858C] text-[12px] font-medium text-left">Created</div>
        <div className="text-[#84858C] text-[12px] font-medium text-left">Status</div>
        <div className="text-[#84858C] text-[12px] font-medium text-left">Actions</div>
      </div>

      {/* Content */}
      <div
        className="flex-1 overflow-auto no-scrollbar"
        style={{
          backgroundColor: "#191B20",
          borderRadius: "15px",
          border: "1px solid #222327",
          padding: "8px",
          marginTop: "8px",
        }}
      >
        {orders.map((order) => {
          const coinInfo = getCoinInfo(order.coin);
          const isBuy = order.side === "B";
          const sideLabel = getSideLabel(order);
          const status = getOrderStatus(order);

          return (
            <div
              key={`${order.oid}-${order.timestamp}`}
              className="grid grid-cols-[1.2fr_0.7fr_0.7fr_0.8fr_1.5fr_1fr_0.8fr_1.1fr_0.7fr_0.9fr] gap-4 hover:bg-[#1C1D21] transition-colors items-center"
              style={{
                height: "48px",
                paddingLeft: "12px",
                paddingRight: "12px",
              }}
            >
              {/* Coin */}
              <div className="flex items-center gap-2">
                <Image
                  src={coinInfo.icon}
                  alt={coinInfo.name}
                  width={20}
                  height={20}
                  className="rounded-full"
                  onError={(e) => {
                    e.currentTarget.src = "https://static.coinstats.app/coins/1650455771843.png";
                  }}
                />
                <span className="text-white text-[13px] font-medium">{coinInfo.name}</span>
              </div>

              {/* Size */}
              <span className="text-white text-[12px]">{formatNumber(order.sz)}</span>

              {/* Side */}
              <span className={`text-[12px] font-medium ${isBuy ? "text-[#00AF58]" : "text-[#DC2626]"}`}>
                {sideLabel}
              </span>

              {/* Type */}
              <span className="text-white text-[12px]">{order.orderType}</span>

              {/* Trigger */}
              <span className="text-white text-[12px]">{getTriggerText(order)}</span>

              {/* Order Price */}
              <span className="text-white text-[12px]">
                {order.limitPx === "0" ? "Market" : formatPrice(order.limitPx)}
              </span>

              {/* Reduce Only */}
              <span className="text-white text-[12px]">{order.reduceOnly ? "Yes" : "No"}</span>

              {/* Created */}
              <span className="text-white text-[12px]">{formatTime(order.timestamp)}</span>

              {/* Status */}
              <span
                className="inline-flex items-center text-[10px] font-medium w-fit"
                style={{
                  ...getStatusStyles(status),
                  borderRadius: "36px",
                  paddingTop: "5px",
                  paddingRight: "8px",
                  paddingBottom: "5px",
                  paddingLeft: "8px",
                }}
              >
                {status}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1 text-[12px]">
                <button
                  onClick={() => handleCancelOrder(order.oid, order.coin)}
                  className="text-white underline hover:text-[#EF4444] transition-colors"
                >
                  Cancel
                </button>
                <span className="text-[#84858C]">/</span>
                <button
                  onClick={() => handleEditOrder(order.oid, order.coin)}
                  className="text-white underline hover:text-[#7637BA] transition-colors"
                >
                  Edit
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConditionalOrdersTab;
