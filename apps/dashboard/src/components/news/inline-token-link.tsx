import React from "react";
import { useReadCoinList } from "@/services/queries/charts";
import Link from "next/link";
import RemoteImage from "../widgets/shared/remote-image";

interface InlineTokenLinkProps {
  symbol: string;
  children: React.ReactNode;
}

const InlineTokenLink = ({ symbol, children }: InlineTokenLinkProps) => {
  const { data } = useReadCoinList();
  const token = data?.find((item) => item.symbol.toLowerCase() === symbol.toLowerCase());

  if (!token || !token.explorer || token.explorer.length === 0) {
    return <>{children}</>;
  }

  const explorerUrl = token.explorer[0];

  return (
    <span className="relative inline group">
      <RemoteImage
        src={token.icon}
        alt={token.name}
        width={24}
        height={24}
        className="absolute left-0 transition-opacity opacity-0 bottom-1 group-hover:opacity-100"
      />
      <Link href={explorerUrl} target="_blank" rel="noopener noreferrer" className="text-[#9391F7] transition-colors">
        {children}
      </Link>
    </span>
  );
};

export default InlineTokenLink;
