"use client";

import React from "react";
import BorderedProfileImage from "./BorderedProfileImage";
import SecondaryButton from "./SecondaryButton";
import LogoutIcon from "../icons/LogoutIcon";
import { useRouter } from "next/navigation";
import { useAtomValue, useSetAtom } from "jotai";
import { supabaseClientAtom } from "@/lib/atoms/supabaseClientAtom";
import {
  authUserAtom,
  publicUserDataAtom,
  isLoadingUserAtom,
  resetAuthState,
} from "@/lib/atoms/userAtom";
import { ProfileIcon } from "../shared";

const ProfileDropdown: React.FC = () => {
  const authUser = useAtomValue(authUserAtom);
  const publicUserData = useAtomValue(publicUserDataAtom);
  const isLoading = useAtomValue(isLoadingUserAtom);
  const supabase = useAtomValue(supabaseClientAtom);
  const router = useRouter();
  const setAuthReset = useSetAtom(resetAuthState);

  // Get user email from auth data
  const authEmail = authUser?.email || "user@example.com";

  // Placeholder subscription data (replace with actual subscription service)
  const activeSub = {
    current_period_end: Date.now() / 1000 + 86400,
    cancel_at_period_end: false,
  };
  const currentActivePlan = { name: "Pro" };

  const goto = (path: string) => {
    router.push(path);
  };

  const handleLogout = async () => {
    try {
      // First, perform the signOut operation
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Error signing out:", error);
        return;
      }

      // Only manually reset if needed as a fallback
      setAuthReset();

      // Navigate after successful logout
      router.push("/login");
    } catch (error) {
      console.error("Unexpected error during logout:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="w-[200px] h-[260px] bg-[#0F0D0DE5] border-[#FFFFFF1A] rounded-[10px] pt-[17px] flex flex-col items-center top-0 border backdrop-blur-lg z-40">
        <div className="animate-pulse flex flex-col items-center w-full">
          <div className="w-[62px] h-[62px] rounded-full bg-gray-700"></div>
          <div className="h-4 bg-gray-700 rounded mt-4 w-20"></div>
          <div className="h-3 bg-gray-700 rounded mt-2 w-32"></div>
        </div>
      </div>
    );
  }

  // If user is not logged in, show login button
  if (!authUser) {
    return (
      <div className="w-[200px] bg-[#0F0D0DE5] border-[#FFFFFF1A] rounded-[10px] p-5 flex flex-col items-center top-0 border backdrop-blur-lg z-40">
        <div className="text-white text-center mb-4">
          <h3 className="font-paralucent-demibold text-base">Not logged in</h3>
          <p className="text-[#FFFFFF99] text-xs mt-1">
            Sign in to access all features
          </p>
        </div>

        <div className="w-full">
          <SecondaryButton onClick={() => goto("/login")}>
            <span className="text-xs">Log in</span>
          </SecondaryButton>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[200px] h-[260px] bg-[#0F0D0DE5] border-[#FFFFFF1A] rounded-[10px] pt-[17px] flex flex-col items-center top-0 border backdrop-blur-lg z-40">
      <div className="w-[62px] h-[62px] rounded-lg overflow-hidden">
        <ProfileIcon />
      </div>

      <div className="pt-[6px] text-[18px] font-paralucent-demibold">
        {publicUserData?.username || authEmail.substring(0, 8) + "..."}
      </div>
      <div className="text-[#FFFFFF99] text-xs">{authEmail}</div>

      <div className="pt-4">
        <div className="h-[40px]">
          <SecondaryButton onClick={() => goto("/plans")}>
            <span className="text-xs">Select Plan</span>
          </SecondaryButton>
        </div>
      </div>

      {activeSub && (
        <div className="pt-[9px] text-[10px] text-[#FFFFFF99] mt-1">
          <span>{currentActivePlan?.name} plan </span>

          {activeSub && !activeSub.cancel_at_period_end ? (
            <>Renews TODO</>
          ) : activeSub && activeSub.cancel_at_period_end ? (
            <>Cancels TODO</>
          ) : null}
        </div>
      )}

      <div className="flex-grow"></div>

      <button
        onClick={handleLogout}
        className="flex gap-x-3 text-start w-full py-3 px-[15px] hover:bg-[#FFFFFF0D] group"
      >
        <LogoutIcon />

        <div className="text-xs font-switzer font-medium group-active:text-[#FFFFFF66] text-white/80">
          Log out
        </div>
      </button>
    </div>
  );
};

export default ProfileDropdown;
