import { formatCoinPrice, getChangeTextColor } from "@/lib/utils";
import { useReadCoinList } from "@/services/queries/charts";
import React, { useMemo } from "react";

interface IProps {
  symbol: string;
}

const AssetPill = ({ symbol }: IProps) => {
  const { data } = useReadCoinList();
  const coinData = useMemo(() => {
    const findData = data?.find((dt) => dt.symbol === symbol);
    return {
      changeIn24h: findData?.priceChange,
      currPrice: formatCoinPrice(findData?.price.toString() || "0"),
    };
  }, [data, symbol]);

  const textColor =
    coinData?.changeIn24h !== undefined
      ? getChangeTextColor(coinData?.changeIn24h)
      : "";

  return (
    <div className="text-white font-medium text-[0.625rem] bg-[#202020] rounded-[8px] py-1 px-3">
      {symbol} - <span className="text-[#00D743]">{coinData.currPrice}</span>{" "}
      <span>•</span>{" "}
      {coinData?.changeIn24h !== undefined ? (
        <span className="font-medium" style={{ color: textColor }}>
          {coinData?.changeIn24h >= 0 ? "+" : ""}
          {coinData?.changeIn24h.toFixed(2)}%
        </span>
      ) : (
        <span className="font-medium text-[#BBBBBB]">+0.00%</span>
      )}
    </div>
  );
};

export default AssetPill;
