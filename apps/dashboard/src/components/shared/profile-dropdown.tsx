"use client";

import { ProfileIcon } from "./profile-icon";
import { Logout } from "../icons/icons";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { AppRoutes } from "@/lib/routes";
import { UsersRow } from "@/lib/types/db.types";
import useSubscription from "@/hooks/subscription";
import { capitalize } from "lodash-es";
import { useMemo } from "react";

interface IProps {
  authUser: UsersRow | null;
}

export function ProfileDropdown(props: IProps) {
  const { authUser } = props;
  const router = useRouter();

  const { userSubscriptionQueryData } = useSubscription();

  const planLabel = useMemo(() => {
    if (!userSubscriptionQueryData) {
      return "Loading...";
    }

    return capitalize(userSubscriptionQueryData.activePlan);
  }, [userSubscriptionQueryData]);

  const handleLogout = async () => {
    router.push(AppRoutes.logout.path);
  };

  const planSubtitle = useMemo(() => {
    if (!userSubscriptionQueryData || userSubscriptionQueryData.activePlan === "basic") {
      return "";
    }

    const usdAmount = (userSubscriptionQueryData.renewsForUsd || 0) / 100;

    if (userSubscriptionQueryData.trialEndsIn && userSubscriptionQueryData.renewsIn) {
      return `Trial (Pro) ends in ${userSubscriptionQueryData.trialEndsIn}, then $${usdAmount}`;
    }

    if (userSubscriptionQueryData.trialEndsIn && !userSubscriptionQueryData.renewsIn) {
      return `Trial (Pro) ends in ${userSubscriptionQueryData.trialEndsIn}, then cancels`;
    }

    if (userSubscriptionQueryData.renewsIn) {
      const renewsToString =
        userSubscriptionQueryData.activePlan === userSubscriptionQueryData.nextPeriodPlan
          ? ""
          : `; switches to ${capitalize(userSubscriptionQueryData.nextPeriodPlan)}`;

      return `Renews in ${userSubscriptionQueryData?.renewsIn}${renewsToString}`;
    }

    return `Expires in ${userSubscriptionQueryData?.cancelsIn}`;
  }, [userSubscriptionQueryData]);

  if (!authUser) {
    const currentUrl = typeof window !== "undefined" ? window.location.pathname + window.location.search : "";

    return (
      <div className="px-5 py-2">
        <Link
          href={AppRoutes.auth.login.withNext(currentUrl)}
          className="block w-full rounded-sm bg-white px-2 py-1 text-center text-[13px] leading-[1.35] font-medium text-[#333]"
        >
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-w-max w-[280px] rounded-[10px] border border-[#353535] bg-[#1A1A1A] py-0">
      <div className="flex flex-col gap-0">
        <div className="flex flex-row gap-2 px-4 py-4">
          <div className="w-[20px] overflow-hidden p-0.5 py-1">
            <ProfileIcon user={authUser} className="rounded-[4px]" />
          </div>
          <div className="flex flex-col justify-center gap-1">
            <h4 className="text-base leading-[1.35] font-medium text-white">{authUser?.username}</h4>
            <p className="font-regular text-xs leading-[1.35] text-[#A4A4A4]">{authUser?.email}</p>
          </div>
        </div>

        <div className="flex flex-col">
          {/* <div className="flex items-center justify-between border-y border-[#212121] px-5 py-4">
            <p className="text-[13px] leading-[1.35] font-medium text-white">Fomoed {data?.planType}</p>

            <RenderIf condition={data?.planType !== "PRO"}>
              <button
                type="button"
                className="rounded-sm bg-white px-2 py-1 text-[13px] leading-[1.35] font-medium text-[#333]"
                onClick={handleGoToPlans}
              >
                Upgrade Plan
              </button>
            </RenderIf>
          </div> */}

          <div className="border-y border-[#212121] px-2 py-2">
            <a
              href="/pricing"
              className="flex cursor-pointer flex-row items-center justify-start gap-2 rounded-sm px-2 py-2 hover:bg-white/10"
            >
              <YellowStarSvg />

              <div className="flex flex-col">
                <div className="text-[13px] leading-[1.35] font-medium text-white">{planLabel}</div>
                {planSubtitle && <div className="font-medium text-white/50 text-xs">{planSubtitle}</div>}
              </div>
            </a>
          </div>

          {/* <div className="cursor-not-allowed border-y border-[#212121] px-4 py-4">
            <div className="flex flex-row items-center justify-start gap-2">
              <Settings />

              <p className="text-[13px] leading-[1.35] font-medium text-white">Settings</p>
            </div>
          </div> */}

          {/* <div className="flex items-center justify-between border-b border-[#212121] px-5 py-4">
            <p className="text-[13px] leading-[1.35] font-medium text-white">BETA Version</p>

            <div className="flex items-center gap-2">
              <p className="text-[13px] leading-[1.35] text-[#A4A4A4]">Enabled</p>

              <div
                className={cn(
                  "flex items-center justify-center gap-1 rounded-lg border border-[#212121] p-[3px]",
                  isBeta ? "flex-row-reverse bg-[#FF3B10]" : "bg-[#141414]"
                )}
                onClick={() => {
                  setIsBeta(false);
                }}
              >
                <div className={cn("h-[16px] w-[16px] rounded-sm", isBeta ? "bg-white" : "bg-[#373737]")}></div>
                <p
                  className={cn("w-[16px] text-right text-[8px] font-medium", isBeta ? "text-white" : "text-[#9B9B9B]")}
                ></p>
              </div>
            </div>
          </div> */}

          <div className="px-5 py-4">
            <button type="button" className="w-full" onClick={handleLogout}>
              <div className="flex flex-row items-center justify-start gap-2">
                <Logout />

                <p className="text-[13px] leading-[1.35] font-medium text-white">Logout</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const YellowStarSvg = () => {
  return (
    <svg width="20" height="19" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8.69397 2.1472C8.9669 1.40962 10.0101 1.40963 10.283 2.1472L11.9161 6.56041C12.0019 6.7923 12.1847 6.97513 12.4166 7.06094L16.8298 8.69397C17.5674 8.9669 17.5674 10.0101 16.8298 10.283L12.4166 11.9161C12.1847 12.0019 12.0019 12.1847 11.9161 12.4166L10.283 16.8298C10.0101 17.5674 8.9669 17.5674 8.69397 16.8298L7.06094 12.4166C6.97513 12.1847 6.7923 12.0019 6.56041 11.9161L2.1472 10.283C1.40962 10.0101 1.40963 8.9669 2.1472 8.69397L6.56041 7.06094C6.7923 6.97513 6.97513 6.7923 7.06094 6.56041L8.69397 2.1472Z"
        fill="#9D9D9D"
      />
      <path
        d="M9.71741 2.1472C9.99034 1.40962 11.0336 1.40963 11.3065 2.1472L12.9395 6.56041C13.0253 6.7923 13.2082 6.97513 13.4401 7.06094L17.8533 8.69397C18.5908 8.9669 18.5908 10.0101 17.8533 10.283L13.44 11.9161C13.2082 12.0019 13.0253 12.1847 12.9395 12.4166L11.3065 16.8298C11.0336 17.5674 9.99034 17.5674 9.71741 16.8298L8.08438 12.4166C7.99857 12.1847 7.81574 12.0019 7.58385 11.9161L3.17064 10.283C2.43306 10.0101 2.43306 8.9669 3.17064 8.69397L7.58385 7.06094C7.81574 6.97513 7.99857 6.7923 8.08438 6.56041L9.71741 2.1472Z"
        fill="#FFC700"
      />
    </svg>
  );
};
