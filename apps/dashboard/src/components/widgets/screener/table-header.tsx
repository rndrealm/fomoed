import React from "react";
import { TableHeaderArrow } from "@/components/icons/icons";

interface ITableHeader {
  onClick: () => void;
  title?: string;
  isActive: boolean;
  direction: "desc" | "asc";
}

export const TableHeader = (props: ITableHeader) => {
  const { onClick, title, isActive, direction } = props;
  return (
    <th className="p-3">
      <button
        type="button"
        onClick={onClick}
        className="ml-auto flex items-center gap-1"
      >
        <div
          style={{
            opacity: isActive ? 1 : 0,
          }}
        >
          <TableHeaderArrow up={direction === "desc"} />
        </div>

        <p className="text-right text-sm leading-[1] whitespace-nowrap text-[#8E8E93]">
          {title}
        </p>
      </button>
    </th>
  );
};
