import React from "react";
import { Close } from "@/components/icons/icons";
import { ModalContainer } from "@/components/shared";
import dashboard from "@/lib/assets/dashboard";
import Image, { StaticImageData } from "next/image";

interface IProps {
  open: boolean;
  handleClose: () => void;
}

const data = [
  {
    id: 1,
    title: "Connect wallet - Deposit USDC",
    description: "To start trading, connect your wallet and deposit USDC into your account.",
    icon: dashboard.gemachCopyInfo1,
  },
  {
    id: 2,
    title: "Pick a top trader",
    description: "Explore performance: PnL, ROI, win rate, and followers. Sort and filter to find a leader.",
    icon: dashboard.gemachCopyInfo2,
  },
  {
    id: 3,
    title: "Set allocation",
    description: "Pick a leader, set your allocation (USD), and review risk. You control how much to copy.",
    icon: dashboard.gemachCopyInfo3,
  },
  {
    id: 4,
    title: "Confirm copytrade",
    description: "Review what will be copied.",
    icon: dashboard.gemachCopyInfo4,
  },
  {
    id: 5,
    title: "Track Positions",
    description: "Track open positions, PnL, and performance in real time.",
    icon: dashboard.gemachCopyInfo5,
  },
];

interface IHowItWorksItemProps {
  title: string;
  description: string;
  icon: StaticImageData;
}

function HowItWorksItem(props: IHowItWorksItemProps) {
  const { title, description, icon } = props;

  return (
    <div className="flex gap-2">
      <div className="w-[16px] h-[16px] flex items-center justify-center">
        <Image src={icon} alt="icon" />
      </div>
      <div className="flex flex-col gap-1 flex-1">
        <h4 className="text-[13px] font-medium leading-[1.25] text-[#3E3E3E]">{title}</h4>
        <p className="text-xs leading-[14px] text-[#A6AEB2] tracking-[-0.4%]">{description}</p>
      </div>
    </div>
  );
}

export function HowItWorks(props: IProps) {
  const { open, handleClose } = props;

  return (
    <ModalContainer open={open} handleClose={handleClose} noHeader className="!max-w-[323px] p-0 rounded-lg">
      <div className="w-full bg-white p-4 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h4 className="text-[13px] font-medium leading-[1.25] text-[#3E3E3E]">How Gemach Copy Trading Works</h4>

          <button className="w-[28px] h-[28px] flex items-center justify-center" onClick={handleClose}>
            <Close fill="#8E8E8E" />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {data?.map((item) => {
            return <HowItWorksItem key={item.id} title={item.title} description={item.description} icon={item?.icon} />;
          })}

          <div className="flex justify-center items-center">
            <p className="text-[11px] leading-[14px] text-[#A6AEB2] tracking-[-0.4%]">
              Send a Minimum of <span className="font-semibold">$10USDC</span>
            </p>
          </div>
        </div>
      </div>
    </ModalContainer>
  );
}
