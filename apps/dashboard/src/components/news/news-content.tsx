"use client";
import React, { useEffect, useState } from "react";
import parse from "html-react-parser";
import { Footer } from "./footer";
import {
  calculateReadingTime,
  formatDate,
  normalizeHtmlText,
} from "@/lib/utils";
import { RenderIf } from "../shared";
import { useReadSingleNewslabPost } from "@/services/queries/news";
import { useParams } from "next/navigation";
import { symbol } from "d3";

interface IProps {
  content?: string;
}

export function NewsContent(props: IProps) {
  const { content = "" } = props;
  const [mins, setMins] = useState("");

  const normalizedContent = content.replace(/(&nbsp;)+/g, " ");

  useEffect(() => {
    const readingTime = calculateReadingTime(content);
    setMins(`${readingTime}`);
  }, [content]);

  const params = useParams();
  const id = params.id as string;

  const { data: article } = useReadSingleNewslabPost(id);

  return (
    <div className="text-white flex flex-col gap-10 max-w-[640px] mx-auto">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col justify-between gap-2 sm:flex-row">
            <div className="flex items-center gap-2">
              <p className="font-medium text-[#9b9b9b] text-[14px] leading-[1.35]">
                {formatDate(article?.published_at)} by
              </p>
              <p className="font-medium text-white text-[14px] leading-[1.35]">
                Joshua Jake /
              </p>
              <p className="font-medium text-[#9b9b9b] text-[14px] leading-[1.35]">
                News{(article?.symbols || []).length > 0 ? "," : ""}{" "}
                {article?.symbols.join(", ")}
              </p>
            </div>

            <RenderIf condition={!!mins}>
              <p className="font-medium text-[#9b9b9b] text-[14px] leading-[1.35] hidden sm:block">
                {mins} MIN READ
              </p>
            </RenderIf>
          </div>
          <div className="flex flex-col gap-4 app_news_content">
            {/* {parse(normalizeHtmlText(content))} */}
            {parse(normalizedContent)}
          </div>
        </div>
      </div>
      <Footer article={article} />
    </div>
  );
}
