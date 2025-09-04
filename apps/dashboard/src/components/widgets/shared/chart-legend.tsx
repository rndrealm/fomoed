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
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
      {colorOptions.map((opt, index) => (
        <div className="flex items-center gap-2" key={index}>
          <div className="w-3 h-3" style={{ backgroundColor: opt.color }}></div>
          <div className="text-xs text-gray-400">{opt.label}</div>
        </div>
      ))}
    </div>
  );
};

export default ChartLegend;
