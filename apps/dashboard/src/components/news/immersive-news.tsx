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
import SoundIcon from "../icons/SoundIcon";
import PlayIcon from "../icons/PlayIcon";
import { motion } from "motion/react";

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
      <div className="relative flex flex-col items-center gap-[6.4375rem]">
        <div className="hidden 2xl:flex fixed top-[56px] 2xl:top-[114px] left:1/2 left-[350px] 2xl:left-[120px] flex-row gap-3">
          <div className="relative top-14 flex w-4.5 flex-col gap-1">
            <motion.div
              animate={{ width: currentIndex === 0 ? "16px" : "9px" }}
              className="h-[0px] w-[16px] border-[1px] border-[#FFF]"
            ></motion.div>

            {tableData.map((item, index) => {
              if (index === 0) return null;
              if (index === tableData.length - 1)
                return (
                  <div key={index} className="flex flex-col gap-[3px]">
                    <div className="h-[0px] w-[6px] border-[1px] border-[#333333]"></div>
                    <div className="h-[0px] w-[6px] border-[1px] border-[#333333]"></div>
                    <div className="h-[0px] w-[6px] border-[1px] border-[#333333]"></div>
                    <div className="h-[0px] w-[6px] border-[1px] border-[#333333]"></div>
                  </div>
                );

              return (
                <div key={index} className="flex flex-col gap-[3px]">
                  <motion.div
                    style={{ willChange: "width" }}
                    animate={{ width: currentIndex === index ? "16px" : "9px" }}
                    transition={{ duration: 0.5, delay: 0.125, ease: [0.4, 0.0, 0.2, 1] }}
                    className="h-[0px] w-[16px] border-[1px] border-[#FFF]"
                  ></motion.div>
                  <div className="h-[0px] w-[6px] border-[1px] border-[#333333]"></div>
                  <div className="h-[0px] w-[6px] border-[1px] border-[#333333]"></div>
                  <div className="h-[0px] w-[6px] border-[1px] border-[#333333]"></div>
                  <div className="h-[0px] w-[6px] border-[1px] border-[#333333]"></div>
                </div>
              );
            })}
            <motion.div
              animate={{ width: currentIndex === tableData.length - 1 ? "16px" : "9px" }}
              className="h-[0px] w-[16px] border-[1px] border-[#FFF]"
            ></motion.div>
          </div>
          <TableOfContent data={tableData} currentIndex={currentIndex} active="Headlines" />
        </div>

        <div className="text-white flex flex-col justify-center max-w-[400px] sm:max-w-[500px] md:max-w-full">
          <div className="mb-4 flex max-w-[400px] sm:max-w-[500px] md:max-w-[39.8125rem] items-center justify-between">
            <div className="flex flex-row gap-1.5 rounded-[40px] bg-[#2A2A2A] px-3 py-2">
              <button>
                <PlayIcon />
              </button>

              <button>
                <SoundIcon />
              </button>
            </div>
            {article ? <BookmarkComp newsId={article?.id} /> : null}
          </div>

          <div id="headlines-section">
            <div className="relative flex h-[356px] max-w-[400px] sm:max-w-[500px] md:max-w-[39.8125rem] w-[637px] items-center justify-center">
              <RemoteImage
                className="max-w-[400px] sm:max-w-[500px] md:max-w-[637px] object-cover"
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
              <p className="mt-12 text-[1.75rem] leading-[1.9rem] font-semibold">{extractedArticle.title}</p>
              <RenderIf condition={!!article?.symbols && article?.symbols.length > 0}>
                <div className="mt-5 flex items-center gap-3">
                  <p className="text-xs text-[#A4A4A4]">Tokens mentioned in article</p>
                  <div className="flex items-center gap-2">
                    {article?.symbols.map((symbol, i) => (
                      <TokenPill symbol={symbol} key={i} />
                    ))}
                  </div>
                </div>
              </RenderIf>
            </div>
            <div className="mt-6 mb-8"></div>

            <p className="pb-4 text-xs text-[#A4A4A4] underline">+{newsSources.length} sources</p>
          </div>

          <div id="article-section">
            <div className="flex flex-col xl:flex-row items-center xl:items-start gap-[6.4375rem]">
              <div className="app_news_content flex max-w-[400px] sm:max-w-[500px] md:max-w-[39.8125rem] flex-col gap-4">{parsedContent}</div>
              <div className="flex w-[25.9375rem]">
                <RelatedArticles symbols={article?.symbols} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
