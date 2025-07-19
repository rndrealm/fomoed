import { ImmersiveNews } from "@/components/news/immersive-news";
import { fetchArticleContent } from "@/services/server-actions";
import React from "react";

export default async function Page({ params }: { params?: Promise<{ id: string }> }) {
  const id = (await params)?.id || "";

  const article = await fetchArticleContent(id);

  return (
    <div className="h-full bg-[#000] pt-7 pb-14">
      <ImmersiveNews articleData={article} />
    </div>
  );
}
