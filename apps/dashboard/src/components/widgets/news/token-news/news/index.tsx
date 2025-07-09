"use client";
import React, { useState } from "react";
import { LayoutType } from "@/lib/atoms/layoutAtom";
import CaretDown from "@/components/icons/CaretDown";
import { Play, Sound } from "@/components/icons/icons";
import NewsItem from "./news-item";
import dashboard from "@/lib/assets/dashboard";
import Player from "./player";
import { AnimatePresence, motion } from "motion/react";
import { modalSlide } from "@/lib/utils";
import SingleNews from "./single-news";

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

const data = [
  {
    id: 1,
    title: "Coinbase announces Tokenized stocks on the  EVM chain",
    body: "Stocks look set to be the next big things in the cryptocurrency market and once again Ethereum seems to be at the forefront...",
    img: dashboard.news1,
    source: "cryptopanic.com",
  },
  {
    id: 2,
    title: "Coinbase announces Tokenized stocks on the  EVM chain",
    body: "Stocks look set to be the next big things in the cryptocurrency market and once again Ethereum seems to be at the forefront...",
    img: dashboard.news2,
    source: "Yahoofinance.com",
  },
  {
    id: 3,
    title: "Coinbase announces Tokenized stocks on the  EVM chain",
    body: "Stocks look set to be the next big things in the cryptocurrency market and once again Ethereum seems to be at the forefront...",
    img: dashboard.news3,
    source: "X.com",
  },
];

export default function NewsWidget() {
  const [showPlayer, setShowPlayer] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="relative flex h-full max-h-[698px] max-w-[447px] flex-col gap-4 overflow-hidden rounded-3xl bg-[#000000]">
      <div className="flex items-center justify-between px-4 pt-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <p className="text-[20px] leading-[1.35] font-bold text-white">Ethereum</p>
            <div className="flex h-[20px] w-[20px] items-center justify-center">
              <CaretDown />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-base leading-[24px] font-medium text-[#BABABA]">2,500.93</p>
            <p className="text-sm leading-[1.35] font-bold text-[#84EBB4]">+$90.3</p>
          </div>
          <p className="text-[13px] leading-[18px] font-semibold text-[#888888]">Up 0.3%</p>
        </div>

        <button
          type="button"
          className="flex items-center gap-1 rounded-[40px] bg-[#0F0F0F] px-[10px] py-2"
          onClick={() => {
            setShowPlayer(true);
          }}
        >
          <Play />
          <Sound />
        </button>
      </div>
      <div className="flex h-full flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
        {Array(8)
          .fill(0)
          .map((_, index) => {
            const item = data[index % data.length];

            return (
              <NewsItem
                key={index}
                body={item.body}
                img={item.img}
                source={item.source}
                title={item.title}
                onClick={() => {
                  setShowDetails(true);
                }}
                sentiment={index % 2 === 0 ? "Bearish" : "Bullish"}
              />
            );
          })}
      </div>

      <AnimatePresence>
        {showPlayer && (
          <motion.div
            className="absolute top-[0px] right-[0] bottom-[0] left-[0] flex"
            initial="hidden"
            animate={"visible"}
            exit={"hidden"}
            variants={sheetVariants}
          >
            <Player
              handleClose={() => {
                setShowPlayer(false);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            className="absolute top-[0px] right-[0] bottom-[0] left-[0] flex"
            initial="hidden"
            animate={"visible"}
            exit={"hidden"}
            variants={horizontalSheetVariants}
          >
            <SingleNews
              handleClose={() => {
                setShowDetails(false);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
