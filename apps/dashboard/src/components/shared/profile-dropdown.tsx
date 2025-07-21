"use client";
import React, { useEffect, useState } from "react";
import { ProfileIcon } from "./profile-icon";
import { cn } from "@/lib/utils";
import { Logout } from "../icons/icons";
import { createSupabaseBrowserClient } from "@/lib/utils/supabase/browser-client";
import { useRouter } from "next/navigation";
import { useGetUserPlans } from "@/services/queries/subscriptions";
import Link from "next/link";
import { RenderIf } from "./render-if";
import { User } from "@supabase/supabase-js";
import { AppRoutes } from "@/lib/routes";

interface IProps {
  authUser: User | null;
}

export function ProfileDropdown(props: IProps) {
  const { authUser } = props;
  const router = useRouter();

  const [isBeta, setIsBeta] = useState(true);

  const { data } = useGetUserPlans();

  const handleLogout = async () => {
    // First, perform the signOut operation
    const supabaseClient = createSupabaseBrowserClient();
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      console.log("Error signing out:", error);
      return;
    }

    // Navigate after successful logout
    router.push(AppRoutes.auth.login.path);
  };

  function handleGoToPlans() {
    window.location.href = "https://app.fomoed.io/plans";
  }

  useEffect(() => {
    if (!isBeta) {
      window.location.href = process.env.NEXT_PUBLIC_LEGACY_APP_URL!;
    }
  }, [isBeta]);

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
    <div className="w-[280px] rounded-[10px] border border-[#333333] bg-[#121212] py-4">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2 px-5">
          <div className="w-[48px] overflow-hidden rounded-sm">
            <ProfileIcon user={authUser} />
          </div>
          <div className="flex flex-col">
            <h4 className="text-base leading-[1.35] font-medium text-white">{authUser?.user_metadata?.name}</h4>
            <p className="font-regular text-xs leading-[1.35] text-[#A4A4A4]">{authUser?.email}</p>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center justify-between border-y border-[#333333] px-5 py-2">
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
          </div>

          <div className="flex items-center justify-between border-b border-[#333333] px-5 py-2">
            <p className="text-[13px] leading-[1.35] font-medium text-white">BETA Version</p>

            <div className="flex items-center gap-2">
              <p className="text-[13px] leading-[1.35] text-[#A4A4A4]">Enabled</p>

              <div
                className={cn(
                  "flex items-center justify-center gap-1 rounded-lg border border-[#232323] p-[3px]",
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
          </div>

          <div className="px-5 pt-2">
            <button type="button" className="w-full py-2" onClick={handleLogout}>
              <div className="flex gap-2">
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
