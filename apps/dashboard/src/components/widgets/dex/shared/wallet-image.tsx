/* eslint-disable @next/next/no-img-element */
import dashboard from "@/lib/assets/dashboard";
import Image from "next/image";
import React from "react";

interface IProps {
  icon?: string;
  width?: number;
  height?: number;
}

const WalletImage = (props: IProps) => {
  const { icon, width, height } = props;
  return (
    <div>
      {icon ? (
        <img
          src={icon}
          alt="Wallet Connector Icon"
          className="rounded-full"
          style={{ width: width || 16, height: height || 16 }}
        />
      ) : (
        <Image
          src={dashboard.token}
          alt="Wallet Connector Icon"
          priority
          width={width || 16}
          height={height || 16}
        />
      )}
    </div>
  );
};

export default WalletImage;
