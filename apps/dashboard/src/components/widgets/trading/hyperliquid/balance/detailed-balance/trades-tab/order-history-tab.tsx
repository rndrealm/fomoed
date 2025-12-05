import React, { useMemo } from "react";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import { useHyperliquidHistoricalOrders, useHyperliquidUserFills } from "@/services/queries/hyperliquid-dex";

interface OrderHistoryTabProps {
  userAddress: string;
  coinInfoMap: Record<string, { name: string; icon: string }>;
}

const OrderHistoryTab = ({ userAddress, coinInfoMap }: OrderHistoryTabProps) => {
  const { data: historicalOrders } = useHyperliquidHistoricalOrders(userAddress, !!userAddress);
  const { data: fills } = useHyperliquidUserFills(userAddress, !!userAddress);

  const avgFillPriceMap = useMemo(() => {
    if (!fills) return {};
    
    const fillsByOrder: Record<number, { totalValue: number; totalSize: number }> = {};
    
    fills.forEach((fill) => {
      if (!fillsByOrder[fill.oid]) {
        fillsByOrder[fill.oid] = { totalValue: 0, totalSize: 0 };
      }
      const size = parseFloat(fill.sz);
      const price = parseFloat(fill.px);
      fillsByOrder[fill.oid].totalValue += size * price;
      fillsByOrder[fill.oid].totalSize += size;
    });
    
    const avgPrices: Record<number, number> = {};
    Object.keys(fillsByOrder).forEach((oidStr) => {
      const oid = parseInt(oidStr);
      const data = fillsByOrder[oid];
      if (data.totalSize > 0) {
        avgPrices[oid] = data.totalValue / data.totalSize;
      }
    });
    
    return avgPrices;
  }, [fills]);

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
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    
    return `${month}/${day}/${year} - ${hours}:${minutes}:${seconds}`;
  };

  const getCoinInfo = (symbol: string) => {
    return (
      coinInfoMap[symbol] || {
        name: symbol,
        icon: "https://static.coinstats.app/coins/1650455771843.png",
      }
    );
  };

  const isSpotOrder = (coin: string) => {
    return coin.startsWith("@");
  };

  const getSideLabel = (side: string, coin: string) => {
    const isBuy = side === "B";
    const isSpot = isSpotOrder(coin);
    
    if (isSpot) {
      return isBuy ? "Buy" : "Sell";
    } else {
      return isBuy ? "Long" : "Short";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "filled":
        return { bg: "#152F22", text: "#21FF86" };
      case "canceled":
      case "marginCanceled":
      case "vaultWithdrawalCanceled":
      case "openInterestCapCanceled":
      case "selfTradeCanceled":
      case "reduceOnlyCanceled":
      case "siblingFilledCanceled":
      case "delistedCanceled":
      case "liquidatedCanceled":
      case "scheduledCancel":
      case "rejected":
        return { bg: "#422825", text: "#F99185" };
      case "open":
      case "triggered":
        return { bg: "#382B19", text: "#FFC26D" };
      default:
        return { bg: "#2A2A2A", text: "#84858C" };
    }
  };

  const getFilledAmount = (order: any) => {
    const filled = parseFloat(order.origSz) - parseFloat(order.sz);
    const total = parseFloat(order.origSz);
    return { filled, total };
  };

  if (!historicalOrders || historicalOrders.length === 0) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div
          className="grid grid-cols-[1.2fr_1fr_0.7fr_1fr_1fr_1fr_1fr_0.8fr_0.8fr] gap-4 sticky top-0 z-10 bg-[#121317] border-b border-[#1B1B1B] items-center"
          style={{
            height: "40px",
            paddingTop: "12px",
            paddingBottom: "12px",
            paddingLeft: "12px",
            paddingRight: "12px",
          }}
        >
          <div className="text-[#84858C] text-[12px] font-medium">Time</div>
          <div className="text-[#84858C] text-[12px] font-medium text-left">Market Pair</div>
          <div className="text-[#84858C] text-[12px] font-medium text-left">Side</div>
          <div className="text-[#84858C] text-[12px] font-medium text-left">Size</div>
          <div className="text-[#84858C] text-[12px] font-medium text-left">Price</div>
          <div className="text-[#84858C] text-[12px] font-medium text-left">Filled</div>
          <div className="text-[#84858C] text-[12px] font-medium text-left">Avg Price</div>
          <div className="text-[#84858C] text-[12px] font-medium text-left">Status</div>
          <div className="text-[#84858C] text-[12px] font-medium text-left">Order ID</div>
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
          <p className="text-white text-[20px] font-semibold">No Order History</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div
        className="grid grid-cols-[1.2fr_1fr_0.7fr_1fr_1fr_1fr_1fr_0.8fr_0.8fr] gap-4 sticky top-0 z-10 bg-[#121317] border-b border-[#1B1B1B] items-center"
        style={{
          height: "40px",
          paddingTop: "12px",
          paddingBottom: "12px",
          paddingLeft: "12px",
          paddingRight: "12px",
        }}
      >
        <div className="text-[#84858C] text-[12px] font-medium">Time</div>
        <div className="text-[#84858C] text-[12px] font-medium text-left">Market Pair</div>
        <div className="text-[#84858C] text-[12px] font-medium text-left">Side</div>
        <div className="text-[#84858C] text-[12px] font-medium text-left">Size</div>
        <div className="text-[#84858C] text-[12px] font-medium text-left">Price</div>
        <div className="text-[#84858C] text-[12px] font-medium text-left">Filled</div>
        <div className="text-[#84858C] text-[12px] font-medium text-left">Avg Price</div>
        <div className="text-[#84858C] text-[12px] font-medium text-left">Status</div>
        <div className="text-[#84858C] text-[12px] font-medium text-left">Order ID</div>
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
        {historicalOrders.map((item, index) => {
          const order = item.order;
          const coinInfo = getCoinInfo(order.coin);
          const isBuy = order.side === "B";
          const isSpot = isSpotOrder(order.coin);
          const statusColors = getStatusColor(item.status);
          const { filled, total } = getFilledAmount(order);
          const avgPrice = avgFillPriceMap[order.oid];

          return (
            <div
              key={`${order.oid}-${item.status}-${item.statusTimestamp}-${index}`}
              className="grid grid-cols-[1.2fr_1fr_0.7fr_1fr_1fr_1fr_1fr_0.8fr_0.8fr] gap-4 hover:bg-[#1C1D21] transition-colors items-center"
              style={{
                height: "48px",
                paddingLeft: "12px",
                paddingRight: "12px",
              }}
            >
              {/* Time */}
              <span className="text-white text-[12px]">{formatTime(item.statusTimestamp)}</span>

              {/* Market Pair */}
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

              {/* Side - Long/Short for perps, Buy/Sell for spot */}
              <span className={`text-[12px] font-medium ${isBuy ? "text-[#00AF58]" : "text-[#DC2626]"}`}>
                {getSideLabel(order.side, order.coin)}
              </span>

              {/* Size */}
              <span className="text-white text-[12px]">
                {formatNumber(order.origSz)} {order.coin}
              </span>

              {/* Price */}
              <span className="text-white text-[12px]">
                {order.limitPx === "0" ? "Market" : formatPrice(order.limitPx)}
              </span>

              {/* Filled */}
              <span className="text-white text-[12px]">
                {formatNumber(filled)} / {formatNumber(total)}
              </span>

              {/* Avg Price */}
              <span className="text-white text-[12px]">
                {avgPrice ? formatPrice(avgPrice) : "-"}
              </span>

              {/* Status */}
              <span 
                className="inline-flex items-center text-[10px] font-medium w-fit capitalize"
                style={{
                  backgroundColor: statusColors.bg,
                  color: statusColors.text,
                  borderRadius: "36px",
                  paddingTop: "5px",
                  paddingRight: "8px",
                  paddingBottom: "5px",
                  paddingLeft: "8px",
                }}
              >
                {item.status}
              </span>

              {/* Order ID */}
              <span className="text-white text-[12px] font-mono">{order.oid}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderHistoryTab;