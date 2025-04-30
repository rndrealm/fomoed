import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabOptions } from "@/constant/cfgi-data";

interface IProps {
  value: string;
  setValue: (value: string) => void;
}

const ChartTab = (props: IProps) => {
  const { value, setValue } = props;
  return (
    <Tabs value={value}>
      <TabsList className="rounded-sm bg-widget-background-400 py-[2px] h-8">
        {TabOptions.map((option) => (
          <TabsTrigger
            key={option.value}
            value={option.value}
            onClick={() => {
              setValue(option.value);
            }}
            className="text-[13px] cursor-pointer px-[13.5px] py-0 h-[28px] font-medium  font-inter text-grey-500 data-[state=active]:text-grey-300 rounded-[5px] data-[state=active]:bg-widget-background-300"
          >
            {option.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default ChartTab;
