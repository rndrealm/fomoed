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
    <div className="h-full  mt-[2px] pt-4 pb-0 flex flex-col justify-between ">
      <div className="flex flex-col items-center justify-center px-3 py-11">
        <div className="pb-4">
          <Image
            src={dashboard.successCheckV2}
            alt="Check icon"
            width={80}
            height={80}
          />
        </div>
        <h3 className="py-1 text-base font-semibold">Swap successful</h3>
        <p className="text-[#878787] text-mid font-medium text-center">
          Transaction completed. View on{" "}
          <Link href={explorerLink} target="_blank" rel="noreferrer noopener">
            <span className="text-white underline">explorer</span>
          </Link>{" "}
        </p>
      </div>
      <button
        className="w-full h-16 text-base text-white font-semibold bg-[#202020] !backdrop-opacity-10 rounded-[24px]"
        onClick={completeFn}
      >
        Done
      </button>
    </div>
  );
};

export default SuccessContent;
