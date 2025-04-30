import React from "react";

interface IProps {
  colorOptions: {
    label: string;
    color: string;
  }[];
}

const ChartLegend = (props: IProps) => {
  const { colorOptions } = props;
  return (
    <>
      {colorOptions.map((opt, index) => (
        <div className="flex items-center gap-1" key={index}>
          <div
            className="w-2 h-2 rounded-[2px]"
            style={{ backgroundColor: opt.color }}
          ></div>
          <div className="text-xs font-semibold text-grey font-inter">
            {opt.label}
          </div>
        </div>
      ))}
    </>
  );
};

export default ChartLegend;
