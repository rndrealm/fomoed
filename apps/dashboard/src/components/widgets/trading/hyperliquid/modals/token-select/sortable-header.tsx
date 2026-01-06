import React from "react";
import { TableHeaderArrow } from "@/components/icons/icons";
import { SortField } from ".";
import { RenderIf } from "@/components/shared";

interface IProps {
  direction: "asc" | "desc";
  onClick: (field: SortField) => void;
  label: string;
  field: SortField;
  isActive: boolean;
}

export function SortableHeader(props: IProps) {
  const { direction, onClick, label, field, isActive } = props;
  return (
    <th className="px-1 py-3  bg-[101012]">
      <button
        type="button"
        onClick={() => {
          onClick(field);
        }}
        className="flex"
      >
        <div className="flex flex-1 items-center gap-1">
          <p className="text-left text-[10px] leading-[1.0] flex-1 tracking-[-0.4%] whitespace-nowrap text-[#B0B0B0]">
            {label}
          </p>

          <RenderIf condition={isActive}>
            <TableHeaderArrow up={direction === "desc"} />
          </RenderIf>
        </div>
      </button>
    </th>
  );
}
