import SimpleCfgiWidget from "@/components/widgets/cfgi/simple-cfgi/simple-cfgi-widget";
import React from "react";

const widgetData = {
  id: "9d7cdcef-b5e1-4b55-bd15-1edc26e68df0",
  meta: {
    h: 2,
    i: "9d7cdcef-b5e1-4b55-bd15-1edc26e68df0@/$simple-cfgi",
    w: 4,
    x: 4,
    y: 0,
  },
  props: {
    meta: {
      h: 2,
      w: 4,
    },
    token: "BTC",
    period: 4,
  },
  token: null,
  layout_id: "86a7c599-e37b-4f1a-be2e-baa2f623d86f",
};

const Test = () => {
  return (
    <div className="h-[500px] w-[500px]">
      <SimpleCfgiWidget widget={widgetData} />
    </div>
  );
};

export default Test;
