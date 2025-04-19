import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TabOptions = [
  { value: "sentiment", label: "Sentiment Only" },
  { value: "price", label: "Price Only" },
  { value: "both", label: "Both" },
];

const CifTab = () => {
  return (
    <Tabs defaultValue="both">
      <TabsList className="rounded-sm bg-widget-background-200 py-[2px] h-8">
        {TabOptions.map((option) => (
          <TabsTrigger
            key={option.value}
            value={option.value}
            className="text-[10px] px-[13.5px] py-0 h-[28px] font-normal data-[state=active]:font-bold font-inter text-grey-200 data-[state=active]:text-grey-300 rounded-[5px] data-[state=active]:bg-widget-background"
          >
            {option.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default CifTab;
