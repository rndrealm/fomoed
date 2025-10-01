import { profilePopoverAtom } from "@/lib/atoms/profilePopover";
import { useAtomValue, useSetAtom } from "jotai";
import { Router } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const PlansBox = () => {
  return (
    <div className="inset-0 px-6 md:px-10 pb-6 pt-13 bg-[#131313] absolute z-10 h-full w-full flex flex-col">
      {/* <button
        type="button"
        onClick={() => {
          setProfilePopoverAtom({ open: true, activeTab: "Profile" });
        }}
        className="max-w-fit px-2 py-1 text-nowrap bg-[#1A1A1A] rounded-[6px] border-[1px] border-[#2A2A2A] text-xs text-white leading-[18px] font-medium flex flex-row items-center gap-2"
      >
        <span>
          <ArrowLeftIcon />
        </span>
        Back to Profile
      </button> */}
      <div>
        <Cards />
      </div>
    </div>
  );
};

export default PlansBox;

const Cards = () => {
  const router = useRouter();

  const profilePopover = useAtomValue(profilePopoverAtom);
  const setProfilePopoverAtom = useSetAtom(profilePopoverAtom);

  return (
    <div className="flex items-center justify-center py-4">
      <div className="scroll-py-1 overflow-x-hidden overflow-y-auto scrollbar pt-0 max-h-[480px] max-w-[760px] flex flex-col xl:flex-row items-center justify-between gap-4 w-full">
        {/* Voyager Plan */}
        <div className="relative h-fit px-8 py-10 flex-1 flex flex-col gap-4 bg-[#1F1F1F] border-[1px] border-[#242424] rounded-[20px] text-white">
          <div className="w-full flex flex-col gap-2 justify-between items-center">
            <div className="w-full flex flex-row items-center justify-between">
              <h3 className="text-[20px] font-semibold">Voyager</h3>

              <p className="text-[20px] font-semibold">$40.99</p>
            </div>
            <div className="w-full flex flex-row items-center justify-between">
              <p className="text-[14px] font-normal text-[#a4a4a4]">
                <span className="text-white font-semibold">$3.99/</span> month
              </p>
              <p className="text-[14px] text-white font-semibold">For 1 year</p>
            </div>
          </div>

          <ul className="border-t-[1px] border-[#383838] py-6 space-y-2 text-xs text-[#a6aeb2]">
            <li className="flex flex-row items-center gap-1">
              <span>
                <CorrectIcon />
              </span>
              Everything Basic,1 plus;
            </li>
            <li className="flex flex-row items-center gap-1">
              <span>
                <CorrectIcon />
              </span>
              Access to daily data
            </li>
            <li className="flex flex-row items-center gap-1">
              <span>
                <CorrectIcon />
              </span>
              Access to all time Frames
            </li>
            <li className="flex flex-row items-center gap-1">
              <span>
                <CorrectIcon />
              </span>
              Custom alerts and notifications;
            </li>
            <li className="flex flex-row items-center gap-1">
              <span>
                <CorrectIcon />
              </span>
              Access to premium content and resources;
            </li>
            <li className="flex flex-row items-center gap-1">
              <span>
                <CorrectIcon />
              </span>
              Priority customer support and consultation
            </li>
            <li className="flex flex-row items-center gap-1">
              <span>
                <CorrectIcon />
              </span>
              Advanced analytics tools and features;
            </li>
            <li className="flex flex-row items-center gap-1">
              <span>
                <CorrectIcon />
              </span>
              Integration with third-party applications;
            </li>
          </ul>

          <button
            type="button"
            onClick={() => {
              router.push("/pricing");
              setProfilePopoverAtom({ open: false, activeTab: profilePopover.activeTab });
            }}
            className="mt-4 w-full bg-[#343434] text-white text-xs font-medium py-4 rounded-[8px]"
          >
            Choose Voyager
          </button>
        </div>

        {/* Premium Plan */}
        <div className="relative h-fit px-8 py-10 flex-1 flex flex-col gap-4 bg-[#0C0C0C] border-[1px] border-[#242424] rounded-[20px] text-white">
          <div className="w-full flex flex-col gap-2 justify-between items-center">
            <div className="w-full flex flex-row items-center justify-between">
              Premium
              <p className="text-[20px] font-semibold">$480.99</p>
            </div>
            <div className="w-full flex flex-row items-center justify-between">
              <p className="text-[14px] font-normal text-[#a4a4a4]">
                <span className="text-white font-semibold">$23.99/</span> month
              </p>
              <p className="text-[14px] text-white font-semibold">For 1 year</p>
            </div>
          </div>

          <ul className="border-t-[1px] border-[#242424] py-6 space-y-2 text-xs text-[#a6aeb2]">
            <li className="flex flex-row items-center gap-1">
              <span>
                <CorrectIcon />
              </span>
              Everything Voyager
            </li>
            <li className="flex flex-row items-center gap-1">
              <span>
                <CorrectIcon />
              </span>
              Access to daily data
            </li>
            <li className="flex flex-row items-center gap-1">
              <span>
                <CorrectIcon />
              </span>
              Access to all time Frames
            </li>
            <li className="flex flex-row items-center gap-1">
              <span>
                <CorrectIcon />
              </span>
              Custom alerts and notifications;
            </li>
            <li className="flex flex-row items-center gap-1">
              <span>
                <CorrectIcon />
              </span>
              Access to premium content and resources;
            </li>
            <li className="flex flex-row items-center gap-1">
              <span>
                <CorrectIcon />
              </span>
              Priority customer support and consultation
            </li>
            <li className="flex flex-row items-center gap-1">
              <span>
                <CorrectIcon />
              </span>
              Advanced analytics tools and features;
            </li>
            <li className="flex flex-row items-center gap-1">
              <span>
                <CorrectIcon />
              </span>
              Integration with third-party applications;
            </li>
          </ul>
          <button
            type="button"
            onClick={() => {
              router.push("/pricing");
              setProfilePopoverAtom({ open: false, activeTab: profilePopover.activeTab });
            }}
            className="mt-4 w-full bg-[#1A1A1A] text-white text-xs font-medium py-4 rounded-[8px]"
          >
            Choose Premium
          </button>
        </div>
      </div>

      {/* Footer */}
      <p className="absolute bottom-[-36px] text-[#a4a4a4] text-xs font-normal text-center w-full">
        Cancel Anytime. We’ll alert you before a Charge
      </p>
    </div>
  );
};

const ArrowLeftIcon = () => {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4.33491 6.00029L8.04253 9.70804C8.10795 9.77338 8.14228 9.85734 8.14553 9.95992C8.1487 10.0625 8.11757 10.1465 8.05216 10.2118C7.98682 10.2772 7.90286 10.3099 7.80028 10.3099C7.6977 10.3099 7.61374 10.2772 7.54841 10.2118L3.83966 6.49354C3.76724 6.42113 3.71661 6.34359 3.68778 6.26092C3.65895 6.17817 3.64453 6.09129 3.64453 6.00029C3.64453 5.90929 3.65895 5.82242 3.68778 5.73967C3.71661 5.657 3.76724 5.57946 3.83966 5.50704L7.54841 1.79842C7.61374 1.733 7.69611 1.69871 7.79553 1.69554C7.89486 1.69229 7.9772 1.72338 8.04253 1.78879C8.10795 1.85413 8.14066 1.93808 8.14066 2.04067C8.14066 2.14325 8.10795 2.22721 8.04253 2.29254L4.33491 6.00029Z"
        fill="white"
      />
    </svg>
  );
};

const CorrectIcon = () => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7.12427 9.16144L5.8936 7.94744C5.83116 7.88499 5.77132 7.85166 5.7141 7.84744C5.65677 7.8431 5.59266 7.87644 5.52177 7.94744C5.45077 8.01832 5.41527 8.08305 5.41527 8.1416C5.41527 8.20016 5.45077 8.26488 5.52177 8.33577L6.79744 9.61144C6.89399 9.70799 7.00293 9.75627 7.12427 9.75627C7.2456 9.75627 7.3546 9.70799 7.45127 9.61144L10.4524 6.61027C10.5149 6.54782 10.5482 6.48521 10.5524 6.42243C10.5568 6.35955 10.5234 6.29266 10.4524 6.22177C10.3815 6.15077 10.3196 6.11527 10.2666 6.11527C10.2136 6.11527 10.1517 6.15077 10.0808 6.22177L7.12427 9.16144ZM8.0021 13.7333C7.21688 13.7333 6.47571 13.5842 5.7786 13.2859C5.0816 12.9877 4.47127 12.577 3.9476 12.0539C3.42393 11.5308 3.01288 10.921 2.71443 10.2246C2.41588 9.52827 2.2666 8.78744 2.2666 8.0021C2.2666 7.20577 2.41571 6.46182 2.71393 5.77027C3.01216 5.07882 3.42282 4.47127 3.94593 3.9476C4.46905 3.42393 5.07882 3.01288 5.77527 2.71443C6.4716 2.41588 7.21244 2.2666 7.99777 2.2666C8.7941 2.2666 9.53805 2.41571 10.2296 2.71394C10.921 3.01216 11.5286 3.42282 12.0523 3.94594C12.5759 4.46905 12.987 5.07605 13.2854 5.76694C13.584 6.45771 13.7333 7.20132 13.7333 7.99777C13.7333 8.78299 13.5842 9.52416 13.2859 10.2213C12.9877 10.9183 12.577 11.5286 12.0539 12.0523C11.5308 12.5759 10.9238 12.987 10.2329 13.2854C9.54216 13.584 8.79855 13.7333 8.0021 13.7333ZM7.99994 13.1999C9.44438 13.1999 10.6722 12.6944 11.6833 11.6833C12.6944 10.6722 13.1999 9.44438 13.1999 7.99994C13.1999 6.55549 12.6944 5.32771 11.6833 4.3166C10.6722 3.30549 9.44438 2.79993 7.99994 2.79993C6.55549 2.79993 5.32771 3.30549 4.3166 4.3166C3.30549 5.32771 2.79993 6.55549 2.79993 7.99994C2.79993 9.44438 3.30549 10.6722 4.3166 11.6833C5.32771 12.6944 6.55549 13.1999 7.99994 13.1999Z"
        fill="#A6AEB2"
      />
    </svg>
  );
};
