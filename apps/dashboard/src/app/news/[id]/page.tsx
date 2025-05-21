import { Footer, NewsContent } from "@/components/news";
import { normalizeHtmlText } from "@/lib/utils";
import { ResolvingMetadata } from "next";
import React from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const url = new URL(
    `/api/newslab/single-post?id=${id}`,
    "https://dashboard-dev.fomoed.io"
  );

  const res = await fetch(url);
  const post = await res.json();

  const normalizedTitle = normalizeHtmlText(post.title);
  return {
    title: "Fomoed News",
    description: normalizedTitle,
    metadataBase: new URL("https://dashboard-dev.fomoed.io"),
    openGraph: {
      images: "/og3.png",
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const url = new URL(
    `/api/newslab-posts/${id}`,
    process.env.PUBLIC_NEWSLAB_URL
  );

  const res = await fetch(url);

  const text = await res.text();

  return (
    <div className="pt-[96px] bg-[#0C0C0C] h-screen overflow-auto pt-10 pb-14 px-4">
      <NewsContent content={text} />
    </div>
  );
}
