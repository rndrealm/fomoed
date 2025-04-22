import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";

const cln = "text-center font-semibold text-base leading-[1.35] text-[#5c5c5c]";

const _infoText = "Already on Fomoed?";

interface IProps {
  href: string;
  linkText: string;
  infoText?: string;
}

export function FormBottomLink(props: IProps) {
  const { href, linkText, infoText = _infoText } = props;

  return (
    <div className="flex items-center gap-[2px]">
      <p className={cln}>{infoText}</p>
      <Link href={href}>
        <p className={cn(cln, "text-white")}>{linkText}.</p>
      </Link>
    </div>
  );
}
