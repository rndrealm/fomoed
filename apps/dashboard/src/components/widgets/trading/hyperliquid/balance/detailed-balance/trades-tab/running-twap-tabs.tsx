import React, { useMemo } from "react";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import { useHyperliquidOpenOrders } from "@/services/queries/hyperliquid-dex";

interface RunningTwapsTabProps {
  userAddress: string;
  coinInfoMap: Record<string, { name: string; icon: string }>;
}

const RunningTwapsTab = ({ userAddress, coinInfoMap }: RunningTwapsTabProps) => {
  const { data: openOrders } = useHyperliquidOpenOrders(userAddress, !!userAddress);

  const orders = useMemo(() => {
    if (!openOrders) return [];
    return openOrders.filter((order) => order.orderType.includes("TWAP"));
  }, [openOrders]);

  const formatNumber = (num: number | string) => {
    const n = typeof num === "string" ? parseFloat(num) : num;
    if (n === 0) return "0";
    if (n < 0.00000001) return n.toExponential(2);
    return n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 8 });
  };

  const formatPrice = (price: string | number) => {
    const p = typeof price === "string" ? parseFloat(price) : price;
    return `$${p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
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

  const headers = ["Coin", "Side", "Type", "Price", "Size", "Filled", "Time"];

  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div
          className="grid gap-4 sticky top-0 z-10 bg-[#121317] border-b border-[#1B1B1B] items-center"
          style={{
            gridTemplateColumns: `repeat(${headers.length}, 1fr)`,
            height: "32px",
            paddingTop: "8px",
            paddingBottom: "8px",
            paddingLeft: "12px",
            paddingRight: "12px",
          }}
        >
          {headers.map((header, index) => (
            <div
              key={header}
              className={`text-[#84858C] text-[12px] font-medium ${index === 0 || index === 1 ? "text-left" : "text-right"}`}
            >
              {header}
            </div>
          ))}
        </div>
        <div className="flex flex-col flex-1 items-center justify-center bg-[#191B20] rounded-[20px] my-1">
          <Image src={dashboard.noOpenOrders} alt="No data" width={168} height={168} className="mb-4" />
          <p className="text-white text-[20px] font-semibold">No Running TWAPs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div
        className="grid gap-4 sticky top-0 z-10 bg-[#121317] border-b border-[#1B1B1B] items-center"
        style={{
          gridTemplateColumns: `repeat(${headers.length}, 1fr)`,
          height: "32px",
          paddingTop: "8px",
          paddingBottom: "8px",
          paddingLeft: "12px",
          paddingRight: "12px",
        }}
      >
        {headers.map((header, index) => (
          <div
            key={header}
            className={`text-[#84858C] text-[12px] font-medium ${index === 0 || index === 1 ? "text-left" : "text-right"}`}
          >
            {header}
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-auto no-scrollbar">
        {orders.map((order) => {
          const coinInfo = getCoinInfo(order.coin);
          const isBuy = order.side === "B";

          return (
            <div
              key={`${order.oid}-${order.timestamp}`}
              className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 hover:bg-[#1C1D21] transition-colors items-center"
              style={{
                height: "64px",
                paddingTop: "16px",
                paddingBottom: "16px",
                paddingLeft: "12px",
                paddingRight: "12px",
              }}
            >
              <div className="flex items-center gap-[12px] h-[32px]">
                <Image
                  src={coinInfo.icon}
                  alt={coinInfo.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                  onError={(e) => {
                    e.currentTarget.src = "https://static.coinstats.app/coins/1650455771843.png";
                  }}
                />
                <div className="flex flex-col justify-center">
                  <span className="text-white text-[12px] font-medium leading-tight">{coinInfo.name}</span>
                  <span className="text-[#84858C] text-[12px] leading-tight">{order.coin}</span>
                </div>
              </div>

              <div className="flex items-center h-[32px]">
                <span className={`text-[12px] font-medium ${isBuy ? "text-[#00AF58]" : "text-[#DC2626]"}`}>
                  {isBuy ? "Buy" : "Sell"}
                </span>
              </div>

              <div className="flex items-center h-[32px]">
                <span className="text-white text-[12px] block w-full text-right">{order.orderType}</span>
              </div>

              <div className="flex items-center justify-end h-[32px]">
                <span className="text-white text-[12px] font-medium">{formatPrice(order.limitPx)}</span>
              </div>

              <div className="flex items-center justify-end h-[32px]">
                <span className="text-white text-[12px]">{formatNumber(order.sz)}</span>
              </div>

              <div className="flex items-center justify-end h-[32px]">
                <span className="text-white text-[12px]">
                  {formatNumber(Number(order.origSz) - Number(order.sz))} / {formatNumber(order.origSz)}
                </span>
              </div>

              <div className="flex items-center justify-end h-[32px]">
                <span className="text-[#84858C] text-[12px]">{formatTime(order.timestamp)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RunningTwapsTab;
