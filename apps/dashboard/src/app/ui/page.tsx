import CoinStats from "@/components/widgets/coin-stats/coin-stats";
import Dominance from "@/components/widgets/dominance/dominance";
import NewsWidget from "@/components/widgets/news/token-news/news-widget";
import OrderBook from "@/components/widgets/order-book/order-book";
import SummaryWidget from "@/components/widgets/summary/summary-widget";
import React from "react";

export default function Page() {
  return (
    <div className="p-10 flex flex-col gap-5">
      <SummaryWidget />
      <Dominance />
      <CoinStats />
      <OrderBook />
      <NewsWidget />
    </div>
  );
}
