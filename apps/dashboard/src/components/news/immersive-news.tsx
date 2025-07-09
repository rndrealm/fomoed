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
import { Play, Sound } from "../icons/icons";
import Image from "next/image";
import RemoteImage from "../widgets/shared/remote-image";

interface IProps {
  articleData: FetchArticleContentType;
}

export function ImmersiveNews(props: IProps) {
  const { articleData } = props;
  const { extractedArticle } = articleData;

  const normalizedContent = extractedArticle?.content?.replace(/(&nbsp;)+/g, " ") || "";

  const params = useParams();
  const id = params.id as string;

  const { data: article } = useReadSingleNewslabPost(id);

  return (
    <div className="mx-auto max-w-[640px] text-white">
      <div className="mb-4">
        <button
          type="button"
          className="flex items-center gap-1 rounded-[40px] bg-[#1E1E1E] px-[10px] py-2"
          onClick={() => {}}
        >
          <Play />
          <Sound />
        </button>
      </div>
      <div>
        <RemoteImage width={637} height={356} src={extractedArticle.image || ""} alt={`${article?.title} image`} />
      </div>
      <p className="text-[1.75rem] font-semibold">{extractedArticle.title}</p>
      <div>
        <p></p>
      </div>
    </div>
  );
}
