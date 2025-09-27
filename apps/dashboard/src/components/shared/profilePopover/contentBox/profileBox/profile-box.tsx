import React, { useEffect, useRef, useState } from "react";
import { ProfileIcon } from "../../../profile-icon";
import PlusIcon from "@/components/icons/PlusIcon";
import { Question } from "@/components/icons/icons";
import useUserData from "@/lib/hooks/use-user-data";
import { useUpdateAvatar, useUpdateUsername } from "@/services/queries/tabs";
import { useRouter } from "next/navigation";
import { profilePopoverAtom } from "@/lib/atoms/profilePopover";
import { useAtomValue, useSetAtom } from "jotai";
import useSubscription from "@/hooks/subscription";
import AvatarFileBox from "./avatar-box";
import PlansBox from "./plans-box";

const ProfileBox = ({ isPlans }: { isPlans?: boolean }) => {
  const { data: authUser, isLoading, error } = useUserData();
  const [username, setUsername] = useState("");
  const { updateUsername, isPending, isError } = useUpdateUsername();

  const [avatarFileBox, setAvatarFileBox] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUsername({ username });
    setUsername("");
  };

  const profilePopover = useAtomValue(profilePopoverAtom);
  const setProfilePopoverAtom = useSetAtom(profilePopoverAtom);

  const router = useRouter();
  const { userSubscriptionQueryData } = useSubscription();

  const { updateAvatar, isPending: isAvatarPending, isError: isAvatarError } = useUpdateAvatar();

  const upgradePricing = () => {
    router.push("/pricing");
  };

  const handleDefaultAvatar = () => {
    try {
      const defaultAvatarUrl = `https://api.dicebear.com/6.x/initials/svg?seed=${authUser?.username}&backgroundColor=000000,FFFFFF`;

      const file = new File([defaultAvatarUrl], "profile.png", { type: "image/png" });

      // Prepare form data
      const formData = new FormData();
      formData.append("image", file);

      updateAvatar({ avatar_url: defaultAvatarUrl });
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setAvatarFileBox(false);
    }
  };

  return (
    <>
      <div className="scrollbar relative flex-1 w-full flex flex-col gap-8 bg-[#131313] px-6 md:px-10 pb-6 pt-13 overflow-y-auto">
        <div className="h-full flex flex-col items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="relative w-[108px] max-h-[108px] aspect-square rounded-[12px] overflow-hidden">
              <ProfileIcon user={authUser} className="rounded-[8px]" />
            </div>
            <div className="absolute z-10 overflow-hidden -bottom-2 -right-2 bg-[#131313] rounded-[11px] h-[35px] aspect-square flex items-center justify-center">
              <button
                type="button"
                onClick={() => {
                  setAvatarFileBox(true);
                }}
                className="bg-[#00af58] rounded-[8px] h-[30px] aspect-square flex items-center justify-center"
              >
                <span className="scale-125 origin-center transition-transform hover:scale-110">
                  <PlusIcon fill="#fff" />
                </span>
              </button>
            </div>
          </div>
          <p className="text-[18px] text-white font-medium">{authUser?.username}</p>
        </div>

        {/* Form */}
        <div className="w-full max-w-[360px] mx-auto space-y-4">
          <div className="flex flex-col items-start justify-between gap-2">
            <label className="block text-xs text-white font-normal">Account Name</label>
            <input
              type="text"
              placeholder="Username..."
              className="w-full mt-1 px-3 py-2 bg-[#1A1A1A] border-[1px] border-[#2A2A2A] rounded-[8px] focus:outline-none placeholder:text-[14px] text-[14px] text-white"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <button
              onClick={handleSubmit}
              disabled={isPending || username.length < 1}
              className="w-[100%] mx-auto mt-1 px-3 py-2 bg-[#00AF58] disabled:opacity-50 rounded-[8px] text-[14px] text-black font-semibold"
            >
              {isPending ? "Updating..." : isError ? "Try Again" : "Update Name"}
            </button>
          </div>

          <div className="w-full h-[1px] bg-[#242424]"></div>

          {/* email stuff */}
          {/* <div className="relative flex flex-col items-start justify-between gap-2">
          <label className="block text-xs text-white font-normal">Attached Email</label>
          <input
            type="email"
            placeholder="Jason@ids.company"
            className="w-full mt-1 px-3 py-2 bg-[#1A1A1A] border-[1px] border-[#2A2A2A] rounded-[8px] focus:outline-none placeholder:text-[14px] text-[14px] text-white"
          />
          <div className="absolute right-[-36px] bottom-[10px]">
            <Question />
          </div>
        </div> */}

          {/* <div className="w-full h-[1px] bg-[#242424]"></div> */}

          <div className="flex flex-col items-start justify-between gap-2">
            <p className="block text-xs text-white font-normal">Avatar</p>
            <div className="w-full flex flex-col md:flex-row gap-1 items-center justify-between">
              <button
                onClick={() => {
                  setAvatarFileBox(true);
                }}
                className="bg-white rounded-[8px] flex-1 px-8 md:px-0 py-2 text-[14px] text-black font-semibold"
              >
                Change Avatar
              </button>
              <button
                onClick={() => {
                  handleDefaultAvatar();
                }}
                disabled={isAvatarPending}
                className="bg-[#1A1A1A] rounded-[8px] flex-1 px-5 md:px-0 py-2 text-[14px] text-[#a6aeb2] font-medium"
              >
                Use Name Initials
              </button>
            </div>
          </div>
        </div>

        {/* Avatar Upload Box */}
        <AvatarFileBox avatarFileBox={avatarFileBox} setAvatarFileBox={setAvatarFileBox} />

        {/* Upgrade Banner */}
        <div className="mt-0 lg:mt-3 max-w-[450px] px-4 lg:px-3 py-4 lg:py-3 w-fit lg:w-full mx-auto flex flex-col gap-5 lg:flex-row justify-between items-center border border-neutral-700 rounded-[12px]">
          <p className="text-[14px] ml-1 text-white font-normal">Get more for your money</p>
          <button
            type="button"
            onClick={() => {
              upgradePricing();
              setProfilePopoverAtom({ open: false, activeTab: profilePopover.activeTab });
            }}
            className="px-4 py-2 text-nowrap bg-[#db8844] rounded-[8px] text-[14px] text-black leading-[18px] font-medium"
          >
            {userSubscriptionQueryData?.activePlan !== "basic" ? "Manage Subscription" : "Upgrade Now"}
          </button>
        </div>
      </div>
      {/* Plans Popover */}
      {isPlans && <PlansBox />}
    </>
  );
};

export default ProfileBox;
