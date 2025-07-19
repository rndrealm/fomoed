"use client";
import React from "react";
import parse, { DOMNode, Element } from "html-react-parser";
import { useReadSingleNewsArticle } from "@/services/queries/news";
import { useParams } from "next/navigation";
import { FetchArticleContentType } from "@/services/server-actions";
import { Bookmark, Play, Sound } from "../icons/icons";
import RemoteImage from "../widgets/shared/remote-image";
import { newsSources } from "@/app/api/news/data";
import TableOfContent from "./table-of-content";
import TokenPill from "./token-pill";
import RelatedArticles from "./related-articles";
import { RenderIf } from "../shared";
import { useScrollPercentage } from "@/hooks/useScrollPercentage";
import { SheetContainer } from "../shared/sheet-container";
import BookmarkComp from "./shared/BookmarkComp";
import InlineTokenLink from "./inline-token-link";

const tableData = [
  {
    id: 1,
    name: "Headlines",
    slug: "headlines",
  },
  {
    id: 2,
    name: "Article",
    slug: "article",
  },
  {
    id: 3,
    name: "Charts",
    slug: "charts",
  },
];

interface IProps {
  articleData: FetchArticleContentType;
}

export function ImmersiveNews(props: IProps) {
  const { articleData } = props;
  const { extractedArticle } = articleData;

  const normalizedContent = extractedArticle?.content?.replace(/(&nbsp;)+/g, " ") || "";

  const params = useParams();
  const id = params.id as string;

  const { data: article } = useReadSingleNewsArticle(id);

  const replaceSymbolsInContent = (content: string, symbols: string[]) => {
    if (!symbols || symbols.length === 0) return parse(content);

    return parse(content, {
      replace: (domNode) => {
        if (domNode.type === "text" && domNode.data) {
          const text = domNode.data;
          let hasMatches = false;

          // Check if any symbols exist in this text chunk
          symbols.forEach((symbol) => {
            const regex = new RegExp(`\\b${symbol}\\b`, "gi");
            if (regex.test(text)) {
              hasMatches = true;
            }
          });

          if (hasMatches) {
            // Process the text and replace symbols with React elements
            const processedText = text;
            const elements: (string | React.ReactElement)[] = [];
            let partIndex = 0;

            // Start with the original text
            elements.push(processedText);

            symbols.forEach((symbol) => {
              const regex = new RegExp(`\\b${symbol}\\b`, "gi");
              const newElements: (string | React.ReactElement)[] = [];

              elements.forEach((element) => {
                if (typeof element === "string") {
                  const segments = element.split(regex);
                  const matches = element.match(regex) || [];

                  for (let i = 0; i < segments.length; i++) {
                    if (segments[i]) {
                      newElements.push(segments[i]);
                    }
                    if (matches[i]) {
                      newElements.push(
                        <InlineTokenLink symbol={symbol} key={`${symbol}-${partIndex++}`}>
                          {matches[i]}
                        </InlineTokenLink>
                      );
                    }
                  }
                } else {
                  newElements.push(element);
                }
              });

              elements.splice(0, elements.length, ...newElements);
            });

            return <>{elements}</>;
          }
        }
        return domNode;
      },
    });
  };

  const parsedContent = article?.symbols
    ? replaceSymbolsInContent(normalizedContent, article.symbols)
    : parse(normalizedContent);

  return (
    <>
      <div className="mx-7 flex gap-[6.4375rem]">
        <div className="">
          <TableOfContent data={tableData} active="Headlines" />
        </div>

        <div className="text-white">
          <div className="mb-4 flex max-w-[39.8125rem] items-center justify-between">
            <button
              type="button"
              className="flex items-center gap-1 rounded-[40px] bg-[#1E1E1E] px-[10px] py-2"
              onClick={() => {}}
            >
              <Play />
              <Sound />
            </button>
            {article ? <BookmarkComp newsId={article?.id} /> : null}
          </div>
          <div>
            <RemoteImage width={637} height={356} src={extractedArticle.image || ""} alt={`${article?.title} image`} />
          </div>
          <div className="max-w-[39.8125rem]">
            <p className="mt-6 text-[1.75rem] leading-[1.9rem] font-semibold">{extractedArticle.title}</p>
            <RenderIf condition={!!article?.symbols && article?.symbols.length > 0}>
              <div className="flex items-center gap-3 mt-4">
                <p className="text-xs text-[#A4A4A4]">Tokens mentioned in article</p>
                <div className="flex items-center gap-2">
                  {article?.symbols.map((symbol, i) => (
                    <TokenPill symbol={symbol} key={i} />
                  ))}
                </div>
              </div>
            </RenderIf>
          </div>
          <div className="mt-5 mb-8">
            <p className="text-xs text-[#A4A4A4] underline">+{newsSources.length} sources</p>
          </div>
          <div className="flex items-start gap-[6.4375rem]">
            <div className="app_news_content flex max-w-[39.8125rem] flex-col gap-4">{parsedContent}</div>
            <div className="flex w-[25.9375rem]">
              <RelatedArticles symbols={article?.symbols} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
