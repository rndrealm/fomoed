import { ImmersiveNews } from "@/components/news/immersive-news";
import { fetchArticleContent } from "@/services/server-actions";
import React from "react";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await fetchArticleContent(id);

  return {
    title: "Fomoed News",
    description: article.title,
    metadataBase: new URL("https://dashboard-dev.fomoed.io"),
    openGraph: {
      images: "/og3.png",
    },
    twitter: {
      card: "summary",
    },
  };
}

export default async function Page({ params }: { params?: Promise<{ id: string }> }) {
  const id = (await params)?.id || "";

  const article = await fetchArticleContent(id);

  return (
    <div className="h-full bg-[#000] pt-7 pb-14">
      <ImmersiveNews articleData={article} />
    </div>
  );
}
