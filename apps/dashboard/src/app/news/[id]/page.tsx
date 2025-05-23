import { NewsContent } from "@/components/news";
import { extractNewsContent, normalizeHtmlText } from "@/lib/utils";
import { fetchPostContent } from "@/services/server-actions";
import React, { Fragment } from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const text = await fetchPostContent(id);

  const extractedText = extractNewsContent(text);

  const title = normalizeHtmlText(extractedText.title || "") || "Untitled";
  console.log("extractedText", title);
  return {
    title: "Fomoed News",
    description: title,
    metadataBase: new URL("https://dashboard-dev.fomoed.io"),
    openGraph: {
      images: "/og3.png",
    },
    twitter: {
      card: "summary",
    },
  };
}

export default async function Page({
  params,
}: {
  params?: Promise<{ id: string }>;
}) {
  const id = (await params)?.id || "";

  const text = await fetchPostContent(id);

  return (
    <div className="pt-[96px] bg-[#0C0C0C] h-screen overflow-auto pt-10 pb-14 px-4">
      <NewsContent content={text} />
    </div>
  );
}
