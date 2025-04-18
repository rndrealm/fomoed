import React from "react";

export interface ILayoutSvgProps extends React.SVGProps<SVGSVGElement> {
  active?: boolean;
}

export function SinglePane(props: ILayoutSvgProps) {
  const { active = false } = props;
  const stroke = active ? "#ffffff" : "#7A7A7A";

  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0.5" y="0.5" width="17" height="17" rx="2.5" stroke={stroke} />
    </svg>
  );
}

export function TwoVerticalPanes(props: ILayoutSvgProps) {
  const { active = false } = props;
  const stroke = active ? "#ffffff" : "#7A7A7A";

  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0.5" y="0.5" width="17" height="17" rx="2.5" stroke={stroke} />
      <path d="M9 0L9 17" stroke={stroke} />
    </svg>
  );
}

export function TwoHorizontalPanes(props: ILayoutSvgProps) {
  const { active = false } = props;
  const stroke = active ? "#ffffff" : "#7A7A7A";

  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0.5" y="0.5" width="17" height="17" rx="2.5" stroke={stroke} />
      <path d="M17.5 8.5L0.5 8.5" stroke={stroke} />
    </svg>
  );
}

export function ThreeVerticalPanes(props: ILayoutSvgProps) {
  const { active = false } = props;
  const stroke = active ? "#ffffff" : "#7A7A7A";

  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0.5" y="0.5" width="17" height="17" rx="2.5" stroke={stroke} />
      <path d="M17.5 6L0.5 6" stroke={stroke} />
      <path d="M17.5 12L0.5 12" stroke={stroke} />
    </svg>
  );
}

export function ThreeHorizontalPanes(props: ILayoutSvgProps) {
  const { active = false } = props;
  const stroke = active ? "#ffffff" : "#7A7A7A";

  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0.5" y="0.5" width="17" height="17" rx="2.5" stroke={stroke} />
      <path d="M6 0L6 17" stroke={stroke} />
      <path d="M12 0L12 17" stroke={stroke} />
    </svg>
  );
}

export function FourVerticalPanes(props: ILayoutSvgProps) {
  const { active = false } = props;
  const stroke = active ? "#ffffff" : "#7A7A7A";

  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0.5" y="0.5" width="17" height="17" rx="2.5" stroke={stroke} />
      <path d="M18 5L1 5" stroke={stroke} />
      <path d="M18 9L1 9" stroke={stroke} />
      <path d="M18 13L1 13" stroke={stroke} />
    </svg>
  );
}

export function FourHorizontalPanes(props: ILayoutSvgProps) {
  const { active = false } = props;
  const stroke = active ? "#ffffff" : "#7A7A7A";

  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0.5" y="0.5" width="17" height="17" rx="2.5" stroke={stroke} />
      <path d="M5 1L5 18" stroke={stroke} />
      <path d="M9 1L9 18" stroke={stroke} />
      <path d="M13 1L13 18" stroke={stroke} />
    </svg>
  );
}

export function FourGridPanes(props: ILayoutSvgProps) {
  const { active = false } = props;
  const stroke = active ? "#ffffff" : "#7A7A7A";

  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0.5" y="0.5" width="17" height="17" rx="2.5" stroke={stroke} />
      <path d="M9 1L9 18" stroke={stroke} />
      <path d="M17.5 9.5L0.5 9.5" stroke={stroke} />
    </svg>
  );
}
