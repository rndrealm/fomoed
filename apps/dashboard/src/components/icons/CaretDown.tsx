import { cn } from "@/lib/utils";
import React from "react";

interface IProps extends React.SVGProps<SVGSVGElement> {
  open?: boolean;
}

export default function CaretDown(props: IProps) {
  const { open = false } = props;
  return (
    <svg
      className={cn("transform transition-transform duration-300", {
        "rotate-180": open,
      })}
      width="10"
      height="6"
      viewBox="0 0 10 6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 1L5 5L9 1"
        stroke="#717A7A"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
