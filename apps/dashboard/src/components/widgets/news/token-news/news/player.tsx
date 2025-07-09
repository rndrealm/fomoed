import Image from "next/image";
import React from "react";
import {
  Article,
  BigPlay,
  Close,
  Forward10,
  Previous,
  Queue,
  Rewind10,
  Settings,
  Stack,
} from "@/components/icons/icons";
import dashboard from "@/lib/assets/dashboard";

interface IProps {
  handleClose: () => void;
}

function PlayerItem() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-full max-w-[54px]">
        <Image src={dashboard.news2} alt="news" />
      </div>

      <div className="flex flex-col gap-1">
        <p className="line-clamp-2 text-sm leading-[1] text-white">
          Robinhood announces Tokenized stocks on the EVM chain
        </p>
        <p className="text-xs leading-[16px] text-[#A4A4A4]">1:10</p>
      </div>
    </div>
  );
}

export default function Player(props: IProps) {
  const { handleClose } = props;

  return (
    <div className="flex flex-col gap-4 overflow-hidden rounded-3xl bg-[linear-gradient(192deg,_#204894_7.94%,_#132c59_19.83%,_#0b1932_36.62%,_#040a15_51.99%,_#000_61.43%)]">
      <div className="flex flex-col gap-2 px-4 pt-4">
        <div className="flex justify-end">
          <button
            type="button"
            className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[#223F76]"
            onClick={handleClose}
          >
            <Close />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex w-full flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h5 className="text-xs leading-[16px] text-[#A4A4A4]">Play From</h5>
              <p className="line-clamp-2 text-sm leading-[1] text-white">
                Coinbase announces Tokenized stocks on the EVM chain
              </p>
            </div>
            <div className="flex w-full flex-col gap-2">
              <div className="h-[2px] w-full rounded-[1px] bg-[#6E6E6E]"></div>
              <div className="flex items-center justify-between">
                <p className="text-xs leading-[16px] text-[#A4A4A4]">-1:10</p>
                <p className="text-xs leading-[16px] text-[#A4A4A4]">0:03</p>
              </div>
            </div>
          </div>

          <div className="">
            <Image src={dashboard.news1} alt="news" />
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-1 flex-col gap-4 overflow-hidden">
          <div className="flex items-center gap-1 px-4">
            <Queue />
            <p className="text-xs leading-[16px] text-[#BBBBBB]">In Queue</p>
          </div>
          <div className="scrollbar flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
            {Array(10)
              .fill(0)
              .map((_, index) => {
                return <PlayerItem key={index} />;
              })}
          </div>
        </div>
        <div className="flex justify-center bg-[#000000] py-4">
          <div className="flex w-full flex-col items-center gap-[10px] px-8">
            <div className="flex items-center gap-2">
              <button type="button" className="flex h-[32px] w-[32px] items-center justify-center">
                <Previous />
              </button>
              <button type="button" className="flex h-[32px] w-[32px] items-center justify-center">
                <Rewind10 />
              </button>
              <button type="button" className="flex h-[32px] w-[32px] items-center justify-center">
                <BigPlay />
              </button>
              <button type="button" className="flex h-[32px] w-[32px] items-center justify-center">
                <Forward10 />
              </button>
              <button type="button" className="flex h-[32px] w-[32px] items-center justify-center">
                <Previous rotate />
              </button>
            </div>

            <div className="flex w-full flex-col gap-4">
              <div className="flex items-center gap-2">
                <p className="text-xs leading-[16px] text-[#A4A4A4]">2:37</p>
                <div className="h-[4px] w-full rounded-full bg-[#6E6E6E]"></div>
                <p className="text-xs leading-[16px] text-[#A4A4A4]">2:37</p>
              </div>
              <div className="flex items-center justify-center gap-4 px-3 py-2">
                <button type="button" className="flex h-[16px] w-[16px] items-center justify-center">
                  <Article />
                </button>

                <button type="button" className="flex h-[16px] w-[16px] items-center justify-center">
                  <Stack />
                </button>

                <button type="button" className="flex h-[16px] w-[16px] items-center justify-center">
                  <Settings />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
