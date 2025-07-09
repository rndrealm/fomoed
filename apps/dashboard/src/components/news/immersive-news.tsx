"use client";
import React, { useEffect, useState } from "react";
import parse from "html-react-parser";
import { Footer } from "./footer";
import { calculateReadingTime, formatDate, normalizeHtmlText } from "@/lib/utils";
import { RenderIf } from "../shared";
import { useReadSingleNewslabPost } from "@/services/queries/news";
import { useParams } from "next/navigation";
import { symbol } from "d3";
import { FetchArticleContentType } from "@/services/server-actions";

interface IProps {
  articleData: FetchArticleContentType;
}

export function ImmersiveNews(props: IProps) {
  const { articleData } = props;

  const normalizedContent = articleData?.extractedArticle?.content?.replace(/(&nbsp;)+/g, " ") || "";

  const params = useParams();
  const id = params.id as string;

  const { data: article } = useReadSingleNewslabPost(id);

  return (
    <div className="mx-auto flex max-w-[640px] flex-col gap-10 text-white">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col justify-between gap-2 sm:flex-row">
            <div className="flex items-center gap-2">
              <p className="text-[14px] leading-[1.35] font-medium text-[#9b9b9b]">
                {formatDate(article?.published_at)} by
              </p>
              <p className="text-[14px] leading-[1.35] font-medium text-white">Joshua Jake /</p>
              <p className="text-[14px] leading-[1.35] font-medium text-[#9b9b9b]">
                News{(article?.symbols || []).length > 0 ? "," : ""} {article?.symbols.join(", ")}
              </p>
            </div>
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
