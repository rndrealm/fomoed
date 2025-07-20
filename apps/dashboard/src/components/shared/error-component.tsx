import React from "react";
import Link from "next/link";
import { Navbar } from "./navbar";
import DotsBackground from "../icons/DotsBackground";
import ElipseBackground from "../icons/ElipseBackground";
import LinkBroken from "../icons/LinkBroken";
import ErrorOutline from "../icons/ErrorOutline";

interface ErrorContent {
  error: string;
  message: string;
  message2: string;
  label: string;
}

const ErrorComponent = ({ content }: { content: ErrorContent }) => {
  return (
    <div className="absolute inset-x-0 top-0 flex flex-col w-full gap-8 h-svh">
      <Navbar isNews />

      <div className="mx-4 my-4 h-full rounded-[20px] border-[1px] border-[#121212] sm:px-10">
        <div className="relative flex flex-col items-center justify-center mx-auto w-fit">
          <div className="relative pointer-events-none">
            <DotsBackground />

            <div className="absolute top-1/2 left-1/2 z-[1] -translate-x-1/2 -translate-y-1/2">
              <h1 className="font-inter pointer-events-auto text-[200px] leading-[1.35] font-medium text-[#212121]">
                {content.error}
              </h1>
            </div>

            <div className="absolute top-0 left-0">{content.error === "404" ? <LinkBroken /> : <ErrorOutline />}</div>
          </div>

          <div className="relative mx-auto mt-4 flex w-[260px] items-center">
            <div className="pointer-events-none absolute bottom-0 left-1/2 z-[0] -translate-x-1/2 translate-y-[120px]">
              <ElipseBackground />
            </div>
            <div className="relative z-[1] flex flex-col items-center justify-center gap-5">
              <div className="flex flex-col items-center gap-1.5">
                <h2 className="text-base leading-[24px] font-medium text-white">{content.message}</h2>
                <p className="px-4 text-center text-[0.875rem] leading-[20px] tracking-[0.4%] text-wrap text-[#9A9E9E]">
                  {content.message2}
                </p>
              </div>
              {content.error === "500" ? (
                <button
                  className="inline-block cursor-pointer rounded-[6px] border-[1px] border-[#464646] bg-[#FF3B10] px-5 py-[7px] text-center text-[0.75rem] leading-[18px] text-white"
                  onClick={() => window.location.reload()}
                >
                  {content.label}
                </button>
              ) : (
                <Link
                  href="/"
                  className="inline-block cursor-pointer rounded-[6px] border-[1px] border-[#464646] bg-[#FF3B10] px-5 py-[7px] text-center text-[0.75rem] leading-[18px] text-white"
                >
                  {content.label}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorComponent;
