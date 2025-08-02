import React, { Fragment, useState } from "react";
import Image from "next/image";
import {
  BigPlay,
  Bookmark,
  Close,
  Ellipsis,
  Fire,
  FullArticle,
  Play,
  Sound,
} from "@/components/icons/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ImageWithFallback, RenderIf } from "@/components/shared";
import { useReadSingleNewsArticle } from "@/services/queries/news";
import { formatNewsWidgetTime } from "@/lib/utils";
import { PlayButton } from "./play-button";
import { ShareButton } from "./share-button";
import { AnimatePresence, motion } from "motion/react";
import Player from "./player";

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

interface IProps {
  handleClose: () => void;
  id: string;
}

function Options() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex h-[24px] w-[24px] items-center justify-center">
          <Ellipsis />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[195px] rounded-[10px] bg-[rgba(19,19,19,0.5)] p-1 shadow-[inset_-1px_0_0_0_rgba(255,255,255,0.25),_inset_1px_0_0_0_rgba(255,255,255,0.25),_0_1px_0_0_rgba(205,205,205,0.25)] backdrop-blur-[5px]"
        align="end"
      >
        <DropdownMenuItem className="group flex items-center gap-2 rounded-lg p-2 text-[13px] leading-[1.25] text-white focus:bg-[#1c1c1c] focus:text-[#fff]">
          <div className="!group-focus:text-white !group-hover:text-white flex h-[20px] w-[20px] items-center justify-center text-white">
            <BigPlay />
          </div>
          Listen to summary
        </DropdownMenuItem>

        <DropdownMenuItem className="group flex items-center gap-2 rounded-lg p-2 text-[13px] leading-[1.25] text-white focus:bg-[#1c1c1c] focus:text-[#fff]">
          <div className="!group-focus:text-white !group-hover:text-white flex h-[20px] w-[20px] items-center justify-center text-white">
            <FullArticle />
          </div>
          Listen to full article
        </DropdownMenuItem>

        <DropdownMenuItem className="group flex items-center gap-2 rounded-lg p-2 text-[13px] leading-[1.25] text-white focus:bg-[#1c1c1c] focus:text-[#fff]">
          <div className="!group-focus:text-white !group-hover:text-white flex h-[20px] w-[20px] items-center justify-center text-white">
            <Bookmark />
          </div>
          Bookmark article
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Tokens() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative cursor-pointer">
          <div className="absolute top-[-1px] right-[-1px] bottom-[-1px] left-[-1px] rounded-sm bg-[radial-gradient(circle,_#FF8970,_#84EBB4,_#FFDB43)]"></div>
          <div className="relative rounded-sm bg-[#1E1E1E] px-[6px] py-[2px]">
            <p className="text-xs leading-[16px] text-white">tokens</p>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[195px] rounded-[10px] bg-[rgba(19,19,19,0.5)] p-1 shadow-[inset_-1px_0_0_0_rgba(255,255,255,0.25),_inset_1px_0_0_0_rgba(255,255,255,0.25),_0_1px_0_0_rgba(205,205,205,0.25)] backdrop-blur-[5px]"
        align="end"
      >
        <DropdownMenuItem className="group flex items-center gap-2 rounded-lg p-2 text-[13px] leading-[1.25] text-white focus:bg-[#1c1c1c] focus:text-[#fff]">
          <div className="!group-focus:text-white !group-hover:text-white flex h-[20px] w-[20px] items-center justify-center text-white">
            <BigPlay />
          </div>
          Dex
        </DropdownMenuItem>

        <DropdownMenuItem className="group flex items-center gap-2 rounded-lg p-2 text-[13px] leading-[1.25] text-white focus:bg-[#1c1c1c] focus:text-[#fff]">
          <div className="!group-focus:text-white !group-hover:text-white flex h-[20px] w-[20px] items-center justify-center text-white">
            <FullArticle />
          </div>
          Orderbook
        </DropdownMenuItem>

        <DropdownMenuItem className="group flex items-center gap-2 rounded-lg p-2 text-[13px] leading-[1.25] text-white focus:bg-[#1c1c1c] focus:text-[#fff]">
          <div className="!group-focus:text-white !group-hover:text-white flex h-[20px] w-[20px] items-center justify-center text-white">
            <Bookmark />
          </div>
          Screener
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function SingleNews(props: IProps) {
  const { handleClose, id } = props;

  const [showPlayer, setShowPlayer] = useState(false);

  const { data } = useReadSingleNewsArticle(id);

  return (
    <Fragment>
      <div className="flex flex-1 flex-col overflow-hidden rounded-3xl bg-[#000]">
        <div className="relative h-[250px]">
          <ImageWithFallback
            src={data?.image_url || ""}
            alt="news"
            width={450}
            height={250}
            className="h-full w-full object-cover blur-[2px]"
          />

          <div className="absolute top-[0] right-[0] bottom-[0] left-[0] flex flex-col justify-between bg-[rgba(0,0,0,0.4)] p-4">
            <div className="flex items-center justify-between">
              <div className="invisible flex items-center gap-1 rounded-full bg-[#0F0F0F] px-2 py-[6px]">
                <Fire />
                <p className="text-xs leading-[16px] text-white">Hot</p>
              </div>

              <button
                type="button"
                className="flex h-[24px] w-[24px] items-center justify-center rounded-sm bg-[rgba(14,14,14,0.2)]"
                onClick={() => {
                  handleClose();
                }}
              >
                <Close />
                {/* <Expand /> */}
              </button>
            </div>

            <div className="flex max-w-[full] flex-col gap-1">
              <a href={data?.original_url} target="_blank">
                <p className="line-clamp-1 text-xs leading-[16px] text-[#A4A4A4]">
                  {data?.source}
                </p>
              </a>
              <div className="flex flex-col gap-2">
                <p className="text-[18px] leading-[26px] font-medium text-white">
                  {data?.title}
                  {/* Coinbase announces Tokenized stocks on the EVM chain */}
                </p>
                <p className="text-xs leading-[16px] text-[#A4A4A4]">
                  {formatNewsWidgetTime(data?.published_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex flex-col gap-1">
            <p className="text-xs leading-[16px] text-white">Summary</p>
            {/* <p className="text-xs leading-[16px] text-[#A4A4A4]">Saves you 5 minutes</p> */}
          </div>

          <div className="flex items-center justify-end flex-1 gap-1">
            <RenderIf condition={true}>
              <ShareButton newsId={data?.id} newsSlug={data?.slug} />
              <PlayButton
                handleShowPlayer={() => {
                  setShowPlayer(true);
                }}
                // isSpeaking={isSpeaking}
                // isPaused={isPaused}
              />

              {/* <Tokens /> */}
              <Options />
            </RenderIf>

            <RenderIf condition={false}>
              <div className="flex h-[16px] w-[16px] items-center justify-center">
                <Play />
              </div>

              <p className="text-xs leading-[16px] text-[#A4A4A4]">2:30</p>
              <div className="h-[2px] w-full max-w-[125px] rounded-full bg-white"></div>
              <Sound />
            </RenderIf>
          </div>
        </div>

        <div className="flex flex-col flex-1 gap-2 px-4 py-4 pb-8 overflow-y-auto scrollbar">
          {data?.ai_summary?.map((summary, index) => {
            return (
              <div key={index} className="flex items-center gap-2">
                <div className="h-[5px] w-[5px] rounded-full bg-[#6200DA]"></div>
                <p className="flex-1 text-xs leading-[16px] text-white">
                  {summary}
                </p>
              </div>
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
              news={data ? [{ ...data, image_url: data?.image_url || "" }] : []}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Fragment>
  );
}
