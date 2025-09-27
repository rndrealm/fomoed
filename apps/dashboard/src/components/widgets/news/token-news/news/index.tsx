"use client";
import React, { useState } from "react";
import { LayoutType, updateWidgetPropsAtom } from "@/lib/atoms/layoutAtom";
import { CoinStats, Play, Sound, Question, Close } from "@/components/icons/icons";
import NewsItem from "./news-item";
import Player from "./player";
import { AnimatePresence, motion } from "motion/react";
import SingleNews from "./single-news";
import { useReadNewsFeed } from "@/services/queries/news";
import { useReadCoinList } from "@/services/queries/charts";
import { NewsTokenDropdown } from "./news-token-dropdown";
import Star from "@/components/icons/Star";
import { OptionsDropdown } from "@/components/widgets/shared/options-dropwdown";
import { useAtomValue, useSetAtom } from "jotai";
import { activeTabAtom } from "@/lib/atoms/tabsAtom";
import { RenderIf } from "@/components/shared";
import { settingAtom, updateSettingAtom } from "@/lib/atoms/settingsAtom";
import { splitWidgetSlug, modalSlide } from "@/lib/utils";
import StarFilled from "@/components/icons/StarFilled";
import { audioRefAtom, setPlaylistAtom } from "@/lib/atoms/audio";

const sheetVariants = {
  hidden: {
    y: "100%",
    transition: {
      ease: [0.4, 0.0, 0.2, 1], // standard material-like ease
      duration: 0.4,
    },
  },
  visible: {
    y: 0,
    transition: {
      ease: [0.4, 0.0, 0.2, 1],
      duration: 0.4,
    },
  },
};

const horizontalSheetVariants = {
  hidden: {
    x: "100%",
    transition: {
      ease: [0.4, 0.0, 0.2, 1], // standard material-like ease
      duration: 0.4,
    },
  },
  visible: {
    x: 0,
    transition: {
      ease: [0.4, 0.0, 0.2, 1],
      duration: 0.4,
    },
  },
};

// const data = [
//   {
//     id: 1,
//     title: "Coinbase announces Tokenized stocks on the  EVM chain",
//     body: "Stocks look set to be the next big things in the cryptocurrency market and once again Ethereum seems to be at the forefront...",
//     img: dashboard.news1,
//     source: "cryptopanic.com",
//   },
//   {
//     id: 2,
//     title: "Coinbase announces Tokenized stocks on the  EVM chain",
//     body: "Stocks look set to be the next big things in the cryptocurrency market and once again Ethereum seems to be at the forefront...",
//     img: dashboard.news2,
//     source: "Yahoofinance.com",
//   },
//   {
//     id: 3,
//     title: "Coinbase announces Tokenized stocks on the  EVM chain",
//     body: "Stocks look set to be the next big things in the cryptocurrency market and once again Ethereum seems to be at the forefront...",
//     img: dashboard.news3,
//     source: "X.com",
//   },
// ];

interface IProps {
  widget: LayoutType["widgets"][0];
}

export default function NewsWidget(props: IProps) {
  const { widget } = props;
  const [showPlayer, setShowPlayer] = useState(false);
  const [showDetails, setShowDetails] = useState("");

  const { data: news = [] } = useReadNewsFeed(widget?.props?.token, 1, 20);
  const { data: coinData = [] } = useReadCoinList();

  const [showInfo, setShowInfo] = useState(false);

  const activeLayout = useAtomValue(activeTabAtom);
  const updateWidgetPropsFromAtom = useSetAtom(updateWidgetPropsAtom);
  const settings = useAtomValue(settingAtom);
  const updateSettings = useSetAtom(updateSettingAtom);

  const setPlaylist = useSetAtom(setPlaylistAtom);

  const widgetSlug = splitWidgetSlug(widget.meta.i).slug;

  const handleFavourite = () => {
    const isFavorite = settings.favorite_widgets.includes(widgetSlug);

    let newWidgetArray: string[] = [];

    if (isFavorite) {
      newWidgetArray = settings.favorite_widgets.filter((item) => item !== widgetSlug);
    } else {
      newWidgetArray = [...settings.favorite_widgets, widgetSlug];
    }
    updateSettings({
      ...settings,
      favorite_widgets: newWidgetArray,
    });
  };

  return (
    <div className="relative flex h-full flex-col gap-1 overflow-hidden rounded-3xl bg-[#000000]">
      <div className="flex flex-col gap-1 px-4">
        <div className="flex cursor-grab justify-center pt-4 pb-1">
          <div className="h-[5px] w-[36px] rounded-[2px] bg-[#444]"></div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CoinStats />
            <h4 className="text-base leading-[1.35] font-semibold text-[#878787]">News</h4>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={handleFavourite}>
              <RenderIf condition={settings.favorite_widgets.includes(widgetSlug)}>
                <StarFilled />
              </RenderIf>

              <RenderIf condition={!settings.favorite_widgets.includes(widgetSlug)}>
                <Star />
              </RenderIf>
            </button>
            <button type="button" onClick={() => setShowInfo(true)}>
              <Question />
            </button>
            <OptionsDropdown widget={widget} />
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-0">
          <NewsTokenDropdown
            options={coinData}
            setValue={(coin) => {
              updateWidgetPropsFromAtom({
                tabId: activeLayout.id,
                widgetId: widget.id,
                widgetProps: {
                  ...widget.props,
                  token: coin,
                },
              });
            }}
            value={widget?.props?.token}
            align="start"
          />

          <button
            type="button"
            className="flex items-center gap-1 rounded-[40px] bg-[#0F0F0F] px-[10px] py-2"
            onClick={() => {
              setShowPlayer(true);
            }}
            disabled={false}
          >
            <Play />
            <Sound />
          </button>
        </div>
        <div className="scrollbar flex h-full flex-1 flex-col gap-5 overflow-y-auto px-4 py-4">
          {news?.map((data, index) => {
            return (
              <NewsItem
                key={data.id}
                data={data}
                onClick={() => {
                  setShowDetails(data.id);
                }}
                sentiment={index % 2 === 0 ? "Bearish" : "Bullish"}
              />
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {showPlayer && (
          <motion.div
            className="absolute top-[0px] right-[0] bottom-[0] left-[0] z-[3] flex"
            initial="hidden"
            animate={"visible"}
            exit={"hidden"}
            variants={sheetVariants}
          >
            <Player
              handleClose={() => {
                setShowPlayer(false);
              }}
              news={news}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!!showDetails && (
          <motion.div
            className="absolute top-[0px] right-[0] bottom-[0] left-[0] z-[2] flex"
            initial="hidden"
            animate={"visible"}
            exit={"hidden"}
            variants={horizontalSheetVariants}
          >
            <SingleNews
              id={showDetails}
              handleClose={() => {
                setShowDetails("");
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showInfo && (
          <div className="absolute top-[10px] right-[10px] bottom-[10px] left-[10px] z-[19] flex items-end">
            <motion.div
              className="scrollbar max-h-full overflow-auto rounded-[22px] bg-[#111] px-5 py-4 flex-1 text-white"
              variants={modalSlide}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="flex flex-col gap-4 justify-between flex-1 h-full">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col">
                    <h3 className="text-base leading-[1.35] font-semibold">About the News Widget</h3>
                    <p className="text-[13px] leading-[1.25] font-light text-[#878787]">
                      Stay ahead of the market with real-time information.
                    </p>
                  </div>
                  <div className="text-[13px] leading-[1.4] font-medium flex flex-col gap-3">
                    <p>
                      This widget delivers a live feed of cryptocurrency news, allowing you to filter by specific coins
                      to see only the information that matters to you.
                    </p>
                    <p>
                      <strong>Sentiment Analysis:</strong> Each article is analyzed for sentiment (Bullish/Bearish) to
                      give you a quick glance at the market&apos;s mood.
                    </p>
                    <p>
                      <strong>Audio Player:</strong> Don&apos;t have time to read? Press the play icon to listen to the
                      latest headlines on the go, turning your news feed into a personalized podcast.
                    </p>
                  </div>
                </div>

                <div className="flex justify-center mt-4">
                  <button
                    type="button"
                    className="app_widget_button flex h-[26px] items-center justify-center gap-1 rounded-[40px] bg-[#272727]"
                    onClick={() => {
                      setShowInfo(false);
                    }}
                  >
                    <p className="app_widget_button__text text-[13px] font-medium whitespace-nowrap text-white">
                      Close
                    </p>
                    <div className="app_widget_button__icon">
                      <Close fill="#878787" />
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
