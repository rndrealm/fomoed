import React from "react";
import Link from "next/link";
import { Navbar } from "./navbar";
import DotsBackground from "../icons/DotsBackground";
import ElipseBackground from "../icons/ElipseBackground";

interface ErrorContent {
  error: string;
  message: string;
  message2: string;
  label: string;
}

const ErrorComponent = ({ content }: { content: ErrorContent }) => {
  return (
    <div className="absolute inset-x-0 top-0 h-svh w-full flex flex-col gap-8">
      <Navbar isNews />

      <div className="h-full border-[1px] border-[#121212] rounded-[20px] my-4 mx-4 sm:px-10">
        <div className="relative w-fit mx-auto flex flex-col items-center justify-center">
          <div className="relative pointer-events-none">
            <DotsBackground />

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <h1 className="font-inter font-medium leading-[1.35] text-[200px] text-[#212121]">
                {content.error}
              </h1>
            </div>
          </div>

          <div className="relative w-[260px] mx-auto flex flex-col items-center gap-5 mt-4">
            <div className="absolute z-[-10] pointer-events-none bottom-0 translate-y-[120px] left-1/2 -translate-x-1/2 ">
              <ElipseBackground />
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <h2 className="leading-[24px] font-medium text-base text-white">
                {content.message}
              </h2>
              <h3 className="text-center text-wrap leading-[20px] tracking-[0.4%] text-[0.875rem] text-[#9A9E9E]">
                {content.message2}
              </h3>
            </div>

            <Link
              href="/"
              className="inline-block bg-[#FF3B10] rounded-[6px] border-[1px] border-[#464646]
            text-white text-[0.75rem] leading-[18px] py-[7px] px-5 cursor-pointer text-center"
            >
              {content.label}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorComponent;
