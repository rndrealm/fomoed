"use client";
import React from "react";
import parse from "html-react-parser";
import { Footer } from "./footer";

interface IProps {
  content?: string;
}

export function NewsContent(props: IProps) {
  const { content = "" } = props;

  const normalizedContent = content.replace(/(&nbsp;)+/g, " ");

  return (
    <div className="text-white flex flex-col gap-10 max-w-[640px] mx-auto">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col justify-between gap-2 sm:flex-row">
            <div className="flex items-center gap-2">
              <p className="font-medium text-[#9b9b9b] text-[14px] leading-[1.35]">
                20th May, 2025 by
              </p>
              <p className="font-medium text-white text-[14px] leading-[1.35]">
                Joshua Jake /
              </p>
              <p className="font-medium text-[#9b9b9b] text-[14px] leading-[1.35]">
                News, BTC
              </p>
            </div>

            {/* <p className="font-medium text-[#9b9b9b] text-[14px] leading-[1.35] hidden sm:block">
              24 MIN READ
            </p> */}
          </div>
          <div className="flex flex-col gap-4 app_news_content">
            {parse(normalizedContent)}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
