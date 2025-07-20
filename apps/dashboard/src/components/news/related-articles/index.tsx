import React, { useState } from "react";
import { useReadSimilarNewsFeed } from "@/services/queries/news";
import { SheetContainer } from "../../shared/sheet-container";
import { RenderIf } from "../../shared";
import { SheetTitle } from "../../ui/sheet";
import { RelatedArticleCard } from "./related-articles-card";
import { RelatedArticleCardV2 } from "./related-articles-card-v2";

interface IProps {
  symbols?: string[];
}

const RelatedArticles = (props: IProps) => {
  const { symbols } = props;
  const { data } = useReadSimilarNewsFeed(symbols, 20);
  const [open, setOpen] = useState(false);
  const handleOpenChange = (open: boolean) => {
    setOpen(open);
  };
  return data && data.length > 0 ? (
    <>
      <aside>
        <h1 className="text-2xl font-semibold">Related Articles</h1>
        <div className="mt-8">
          {data?.slice(0, 4)?.map((article, index) => (
            <RelatedArticleCard key={index} article={article} />
          ))}
        </div>
        <RenderIf condition={data?.length > 3}>
          <div className="pt-1">
            <button className="bg-transparent" onClick={() => handleOpenChange(true)}>
              <p className="text-ideal font-semibold underline">View all articles</p>
            </button>
          </div>
        </RenderIf>
      </aside>
      <SheetContainer open={open} onOpenChange={handleOpenChange}>
        <div className="scrollbar-small-dark overflow-y-auto border-l border-[#2A2A2A] bg-[#000000] p-6 text-white">
          <SheetTitle className="pb-6 text-[1.75rem] font-semibold text-white">Related Articles</SheetTitle>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {data?.map((article, index) => (
              <RelatedArticleCardV2 key={index} article={article} />
            ))}
          </div>
        </div>
      </SheetContainer>
    </>
  ) : null;
};

export default RelatedArticles;
