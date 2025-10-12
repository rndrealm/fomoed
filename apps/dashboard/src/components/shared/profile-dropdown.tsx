"use client";
import classNames from "clsx";

import { ProfileIcon } from "./profile-icon";
import { BasicPlanIcon, Logout, YellowStarSvg, EditIcon } from "../icons/icons";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppRoutes } from "@/lib/routes";
import { UsersRow } from "@/lib/types/db.types";
import useSubscription from "@/hooks/subscription";
import { capitalize } from "lodash-es";
import { useMemo } from "react";
import { RenderIf } from "./render-if";
import { useSetAtom } from "jotai";
import { profilePopoverAtom } from "@/lib/atoms/profilePopover";
import { Database } from "@/lib/database/supabase";

interface IProps {
  authUser: Database["public"]["Tables"]["users"]["Row"] | null | undefined;
}

export function ProfileDropdown(props: IProps) {
  const { authUser } = props;
  const router = useRouter();

  const setProfilePopoverAtom = useSetAtom(profilePopoverAtom);

  const { userSubscriptionQueryData } = useSubscription();

  const planLabel = useMemo(() => {
    if (!userSubscriptionQueryData) {
      return "";
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
    <div className="min-w-max w-[240px] rounded-[10px] border border-[#242424] bg-[#131313] py-0">
      <div className="flex flex-col gap-0">
        <div className="flex flex-row gap-3 px-3 py-3 border-b-[1px] border-[#242424]">
          <div className="w-[40px] h-[40px] max-w-[40px] max-h-[40px] rounded-[8px] overflow-hidden">
            <ProfileIcon user={authUser} className="rounded-[8px]" />
          </div>
          <div className="flex flex-col justify-center gap-0.5 py-0.5">
            <h4 className="text-[13px] leading-[1.35] font-normal text-white">{authUser?.username}</h4>
            <p className="font-regular text-xs leading-[1.35] text-[#656565]">{authUser?.email}</p>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="relative px-2 py-2 h-24">
            <div className="realtive z-10">
              <div
                style={{ boxShadow: "0px 4px 4px 0px #00000040" }}
                className={classNames(
                  "min-h-[48px] max-h-[52px] w-full bg-[#1A1A1A] flex cursor-default flex-row items-center justify-start gap-2.5 rounded-sm px-3 py-2 h-full",
                  {
                    app_skeleton_loader: !userSubscriptionQueryData,
                  },
                )}
              >
                <RenderIf condition={!!userSubscriptionQueryData}>
                  {userSubscriptionQueryData?.activePlan !== "basic" ? <YellowStarSvg /> : <BasicPlanIcon />}

                  <div className="flex flex-col">
                    <div className="text-[13px] leading-[1.35] font-normal text-white">{planLabel}</div>
                    {planSubtitle ? (
                      <div className="font-normal text-[#656565] text-xs">{planSubtitle}</div>
                    ) : (
                      <div className="font-normal text-[#656565] text-xs">Explore other plans</div>
                    )}
                  </div>
                </RenderIf>
              </div>
            </div>
            {/* view plans thing */}
            <div className="pointer-events-auto z-[0] absolute bottom-[10px] left-1/2 translate-x-[-50%] w-full h-fit px-6 flex justify-center items-center">
              <a
                href="/pricing"
                className="currsor-pointer hover:bg-[#202020] bg-[#1A1A1A] w-full rounded-b-sm px-2 py-1 flex justify-center items-center"
              >
                <h4 className="text-[13px] leading-[1.35] font-normal text-white">View 2+ plans</h4>
              </a>
            </div>
          </div>

          {/* <div className="px-3 py-0">
            <div className="px-2 py-4 border-t-[1px] border-[#242424] flex flex-row items-center justify-center">
              <button
                type="button"
                className="w-full"
                onClick={() => setProfilePopoverAtom({ open: true, activeTab: "Profile" })}
              >
                <div className="flex flex-row items-center justify-start gap-2">
                  <div className="h-5 aspect-square flex justify-center items-center">
                    <EditIcon />
                  </div>

                  <p className="text-[13px] leading-[1.35] font-normal text-white">Edit Profile</p>
                </div>
              </button>
            </div>
          </div> */}

          <div className="px-3 py-0">
            <div className="px-2 py-4 border-t-[1px] border-[#242424] flex flex-row items-center justify-center">
              <button type="button" className="w-full" onClick={handleLogout}>
                <div className="flex flex-row items-center justify-start gap-2">
                  <div className="h-5 aspect-square flex justify-center items-center">
                    <Logout fill="#fff" />
                  </div>

                  <p className="text-[13px] leading-[1.35] font-normal text-white">Logout</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
