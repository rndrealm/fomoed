"use client";

import React from "react";
import BorderedProfileImage from "./BorderedProfileImage";
import SecondaryButton from "./SecondaryButton";
import LogoutIcon from "../icons/LogoutIcon";

const ProfileDropdown: React.FC = () => {
    // Placeholder data (replace with actual Jotai atoms)
    const authUser = { username: "username" };
    const authEmail = "user@example.com";
    const activeSub = { current_period_end: Date.now() / 1000 + 86400, cancel_at_period_end: false };
    const currentActivePlan = { name: "Pro" };

    // Placeholder function
    const goto = (path: string) => {
        window.location.href = path;
    };

    // Placeholder logout function
    const handleLogout = () => {
        // Implement logout logic here
        console.log("Logging out...");
    };

    return (
        <div className="w-[200px] h-[260px] bg-[#0F0D0DE5] border-[#FFFFFF1A] rounded-[10px] pt-[17px] flex flex-col items-center top-0 border backdrop-blur-lg z-40">
            <div className="w-[62px]">
                <BorderedProfileImage />
            </div>

            <div className="pt-[6px] text-[18px] font-paralucent-demibold">
                {authUser?.username || authEmail.substring(0, 8) + "..."}
            </div>
            <div className="text-[#FFFFFF99] text-xs">{authEmail}</div>

            <div className="pt-4">
                <div className="h-[40px]">
                    <SecondaryButton onClick={() => goto("https://fomoed.io/plans")}>
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
