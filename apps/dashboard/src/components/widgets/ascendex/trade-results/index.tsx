import React, { useState } from "react";
import Tabs from "./tabs";

const TradeResults = () => {
  const [tab, setTab] = useState("balance");
  return (
    <div>
      <Tabs currTab={tab} updateTab={(_tab: string) => setTab(_tab)} />
    </div>
  );
};

export default TradeResults;
