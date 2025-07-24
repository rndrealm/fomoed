import React, { ReactNode } from "react";

interface IProps {
  children: ReactNode;
}

const AuthLayout = (props: IProps) => {
  const { children } = props;
  return <div className="relative">{children}</div>;
};

export default AuthLayout;
