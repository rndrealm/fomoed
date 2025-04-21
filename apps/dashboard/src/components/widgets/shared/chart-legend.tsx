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
        <div className="flex items-center gap-2" key={index}>
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: opt.color }}
          ></div>
          <div className="text-xs text-grey font-inter">{opt.label}</div>
        </div>
      ))}
    </>
  );
};

export default ChartLegend;
