import React, { ReactNode } from "react";

interface IProps {
  children: ReactNode;
}

const PremiumOverlay = (props: IProps) => {
  return <>{props.children}</>;
};

export default PremiumOverlay;
