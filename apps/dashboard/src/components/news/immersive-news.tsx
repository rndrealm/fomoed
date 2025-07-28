"use client";
import React, { useEffect, useRef, useState } from "react";
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
import Link from "next/link";
import { ShareButton } from "../widgets/news/token-news/news/share-button";

const tableData = [
  {
    id: 1,
    name: "Headlines",
    slug: "headlines",
    sectionId: "headlines-section",
    yOffset: 200,
  },
  {
    id: 2,
    name: "Article",
    slug: "article",
    sectionId: "article-section",
    yOffset: 55,
  },
  // {
  //   id: 3,
  //   name: "Related Articles",
  //   slug: "related-articles",
  //   sectionId: "related-articles-section",
  //   yOffset: 15,
  // },
  // {
  //   id: 4,
  //   name: "Charts",
  //   slug: "charts",
  // },
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

  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    const handleScroll = () => {
      const viewportCenter = window.scrollY + window.innerHeight / 2;

      tableData.forEach((item, index) => {
        const section = document.getElementById(item.sectionId);
        if (!section) return;

        const rect = section.getBoundingClientRect();
        const top = rect.top + window.scrollY;
        const bottom = top + section.offsetHeight;

        if (viewportCenter >= top && viewportCenter <= bottom) {
          setCurrentIndex(index);
        }
      });
      // console.log(activeIndex);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className="mac:gap-[6.4375rem] relative flex justify-center gap-[2.4375rem]">
        <TableOfContent data={tableData} currentIndex={currentIndex} active="Headlines" />

        <div className="flex max-w-[400px] flex-col justify-center text-white sm:max-w-[500px] md:max-w-full">
          <div className="mb-4 flex max-w-[400px] items-center justify-between sm:max-w-[500px] md:max-w-[39.8125rem]">
            {/* <div className="flex flex-row gap-1.5 rounded-[40px] bg-[#2A2A2A] px-3 py-2">
              <button>
                <PlayIcon />
              </button>

              <button>
                <SoundIcon />
              </button>
            </div> */}
            <div />
            {article ? (
              <div className="flex items-center">
                <ShareButton newsId={article.id} width={14} height={14} />
                <BookmarkComp newsId={article.id} />
              </div>
            ) : null}
          </div>

          <div id="headlines-section">
            <div className="relative flex h-[356px] w-full max-w-full items-center justify-center sm:max-w-[500px] md:w-[637px] md:max-w-[39.8125rem]">
              <RemoteImage
                className="w-full object-cover"
                width={637}
                height={356}
                src={extractedArticle.image || ""}
                alt={`${article?.title} image`}
              />

              {/* Blur */}
              <div className="absolute inset-0 z-0 h-full w-[100%]">
                <div className="gradient-blur">
                  <div className="hidden"></div>
                  <div className="hidden"></div>
                  <div></div>
                  <div></div>
                  {/* <div></div> */}
                  {/* <div></div> */}
                </div>
              </div>

              {/* Dark */}

              <div
                className="absolute inset-0 z-0 h-full w-full"
                style={{
                  background: `linear-gradient(
                                to bottom,
                                rgba(0, 0, 0, 0) 0%,
                                rgba(0, 0, 0, 0.125) 12.56%,
                                rgba(0, 0, 0, 0.325) 32.33%,
                                rgba(0, 0, 0, 0.5) 45.58%,
                                rgba(0, 0, 0, 1) 100%
                                )`,
                }}
              />
            </div>

            <div className="max-w-[500px] md:max-w-[39.8125rem]">
              <p className="mt-12 text-[1.2rem] leading-[1.6rem] font-semibold md:text-[1.75rem] md:leading-[1.9rem]">
                {extractedArticle.title}
              </p>
              <RenderIf condition={!!article?.symbols && article?.symbols.length > 0}>
                <div className="mt-5 flex flex-col items-start gap-3 md:flex-row md:items-center">
                  <p className="text-xs text-[#A4A4A4]">Tokens mentioned in article</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {article?.symbols.map((symbol, i) => (
                      <TokenPill symbol={symbol} key={i} />
                    ))}
                  </div>
                </div>
              </RenderIf>
            </div>
            <div className="mt-6 mb-8"></div>
            <div className="flex items-center gap-2 pb-4">
              <Link href={article?.original_url || "/"} target="_blank" rel="noopener noreferrer">
                <p className="text-xs font-semibold">{article?.source}</p>
              </Link>
              <p className="text-xs text-[#A4A4A4] underline">+{newsSources.length} sources</p>
            </div>
          </div>

          <div id="article-section">
            <div className="mac:items-start mac:flex-row flex flex-col items-start gap-[6.4375rem]">
              <div className="app_news_content flex max-w-[400px] flex-col gap-4 sm:max-w-[500px] md:max-w-[39.8125rem]">
                {parsedContent}
              </div>
              <div id="related-articles-section" className="flex max-w-[25.9375rem]">
                <RelatedArticles symbols={article?.symbols} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
