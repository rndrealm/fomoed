import dashboard from "@/lib/assets/dashboard";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface IProps {
  completeFn: () => void;
  explorerLink: string;
}

const SuccessContent = (props: IProps) => {
  const { completeFn, explorerLink } = props;
  return (
    <div className="bg-[#121212] px-3 py-4 rounded-[16px] mt-[2px] ">
      <div className="flex flex-col items-center justify-center py-11">
        <div className="">
          <Image
            src={dashboard.successCheck}
            alt="Check icon"
            width={154}
            height={153}
          />
        </div>
        <h3 className="py-1 text-base font-medium">Swapping successful</h3>
        <p className="text-[#878787] text-sm text-center">
          Transaction completed. View on{" "}
          <Link href={explorerLink} target="_blank" rel="noreferrer noopener">
            <span className="text-white underline">explorer</span>
          </Link>{" "}
        </p>
      </div>
      <button
        className="w-full h-10 text-xs font-medium bg-[#202020] rounded-[6px]"
        onClick={completeFn}
      >
        Done
      </button>
    </div>
  );
};

export default SuccessContent;
