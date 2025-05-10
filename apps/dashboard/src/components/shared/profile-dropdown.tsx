"use client";
import React, { useState } from "react";
import { ProfileIcon } from "./profile-icon";
import { authUserAtom, resetAuthState } from "@/lib/atoms/userAtom";
import { useAtomValue, useSetAtom } from "jotai";
import { cn } from "@/lib/utils";
import { Logout } from "../icons/icons";
import { createSupabaseBrowserClient } from "@/lib/utils/supabase/browser-client";
import { useRouter } from "next/navigation";
import { useGetUserPlans } from "@/services/queries/subscriptions";
import Link from "next/link";

export function ProfileDropdown() {
  const router = useRouter();

  const authUser = useAtomValue(authUserAtom);
  const setAuthReset = useSetAtom(resetAuthState);

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

    // Only manually reset if needed as a fallback
    setAuthReset();

    // Navigate after successful logout
    router.push("/login");
  };

  function handleGoToPlans() {
    window.location.href =
      "https://fomoed-git-development-fomoed-00ef5fc1.vercel.app/plans";
  }

  if (!authUser) {
    return (
      <div className="py-2 px-5">
        <Link
          href="/login"
          className="px-2 py-1 bg-white rounded-sm font-medium text-[#333] leading-[1.35] text-[13px] w-full block text-center"
        >
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-[280px] py-4 bg-[#121212] rounded-[10px] border border-[#333333]">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2 px-5">
          <div className="w-[48px] rounded-sm overflow-hidden">
            <ProfileIcon />
          </div>
          <div className="flex flex-col">
            <h4 className="font-medium text-white leading-[1.35] text-base">
              {authUser?.user_metadata?.name}
            </h4>
            <p className="font-regular text-[#A4A4A4] leading-[1.35] text-xs">
              {authUser?.email}
            </p>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="py-2 border-y border-[#333333] flex justify-between items-center px-5">
            <p className="font-medium text-white leading-[1.35] text-[13px]">
              Fomoed {data?.planType}
            </p>

            <button
              type="button"
              className="px-2 py-1 bg-white rounded-sm font-medium text-[#333] leading-[1.35] text-[13px]"
              onClick={handleGoToPlans}
            >
              Upgrade Plan
            </button>
          </div>

          <div className="py-2 border-b border-[#333333] flex justify-between items-center px-5">
            <p className="font-medium text-white leading-[1.35] text-[13px]">
              Version
            </p>

            <div className="flex items-center gap-2">
              <p className="text-[#A4A4A4] leading-[1.35] text-[13px]">Beta</p>

              <div
                className={cn(
                  "flex items-center justify-center gap-1 p-[3px] rounded-lg border border-[#232323]",
                  isBeta ? "bg-[#FF3B10] flex-row-reverse" : "bg-[#141414]"
                )}
                onClick={() => {
                  setIsBeta(false);
                }}
              >
                <div
                  className={cn(
                    "w-[16px] h-[16px] rounded-sm",
                    isBeta ? "bg-white" : "bg-[#373737]"
                  )}
                ></div>
                <p
                  className={cn(
                    "text-[8px] font-medium w-[16px] text-right",
                    isBeta ? "text-white" : "text-[#9B9B9B]"
                  )}
                ></p>
              </div>
            </div>
          </div>

          <div className="pt-2 px-5">
            <button
              type="button"
              className="py-2 w-full"
              onClick={handleLogout}
            >
              <div className="flex gap-2">
                <Logout />

                <p className="font-medium text-white leading-[1.35] text-[13px]">
                  Logout
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
