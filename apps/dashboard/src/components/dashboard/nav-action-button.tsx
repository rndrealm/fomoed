import React from "react";

interface IProps {
  onClick?: () => void;
  label: string;
  leftIcon: React.JSX.Element;
  rightIcon?: React.JSX.Element;
}

export function NavActionButton(props: IProps) {
  const { label, leftIcon, rightIcon } = props;
  return (
    // <button type="button" onClick={onClick}>
    <div className="flex items-center gap-[6px] px-2 py-1 border border-[rgba(255,255,255,0.1)] rounded-sm">
      {leftIcon}
      <p className="text-[#b8bcbc] text-xs leading-[150%] font-medium">
        {label}
      </p>
      {rightIcon}
    </div>
    // </button>
  );
}
