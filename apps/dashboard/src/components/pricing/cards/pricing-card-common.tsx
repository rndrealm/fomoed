"use client";
import classNames from "clsx";
import { motion } from "motion/react";
import { LoaderCircle } from "lucide-react";
import { RenderIf } from "@/components/shared";
import ArrowRightPricing from "../../icons/ArrowRightPricing";
import useSubscription from "@/hooks/subscription";

interface PricingCardButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  buttonColorProminent?: boolean;
  fullWidth?: boolean;
  className?: string;
  isBusy?: boolean;
}

export const PricingCardButton = ({
  children,
  onClick,
  buttonColorProminent = false,
  fullWidth = false,
  className,
  isBusy,
}: PricingCardButtonProps) => {
  const { userSubscriptionQueryData, isInitialLoading, isAnyUseSubscriptionHookBusy } = useSubscription();

  const getArrowColor = () => {
    if (!!isBusy) return "#0000";
    if (buttonColorProminent) return "black";
    return "#878787";
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={isAnyUseSubscriptionHookBusy}
      className={classNames(
        "flex flex-row justify-between items-center py-2.5 px-4 rounded-[40px] font-semibold duration-500 whitespace-nowrap gap-x-2 min-w-[50%] disabled:opacity-50",
        {
          "w-full": fullWidth,
          "bg-white text-[#373737]": buttonColorProminent,
          "bg-[#131313] text-[#878787]": !buttonColorProminent,
          "!opacity-100": isInitialLoading,

          app_skeleton_loader: isInitialLoading,
        },
        className,
      )}
    >
      <RenderIf condition={!isInitialLoading}>
        {children}

        <span
          className={classNames("duration-500", {
            "opacity-10": !!isBusy && (!fullWidth ? !userSubscriptionQueryData : false),
          })}
        >
          {!!isBusy ? <LoaderCircle className="animate-spin" /> : <ArrowRightPricing color={getArrowColor()} />}
        </span>
      </RenderIf>

      <RenderIf condition={isInitialLoading}>
        <span className="whitespace-pre"> </span>
      </RenderIf>
    </motion.button>
  );
};
