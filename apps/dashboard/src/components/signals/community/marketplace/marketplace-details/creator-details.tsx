import React, { useState } from "react";
import Image from "next/image";
import {
  Discord,
  MarketplaceLink,
  RatingStar,
  Twitter,
} from "@/components/icons/icons";
import marketplace from "@/lib/assets/signals/community/marketplace";

function RateProduct() {
  const [rating, setRating] = useState(0);

  return (
    <div className="flex flex-col gap-1">
      <h3 className="text-white text-sm leading-[1.35] tracking-[-0.4%] font-semibold">
        Rate this product
      </h3>

      <div className="flex items-center">
        {Array(5)
          .fill(0)
          .map((_, index) => {
            const isRated = index < rating;

            return (
              <button
                key={index}
                className="w-[18px] h-[18px] flex items-center justify-center"
                onClick={() => setRating(index + 1)}
              >
                <RatingStar fill={isRated ? "#FFD700" : "#444444"} />
              </button>
            );
          })}
      </div>
    </div>
  );
}

export function CreatorDetails() {
  return (
    <div className="flex flex-col gap-6 max-w-[261px] w-full">
      <div className="flex flex-col gap-2">
        <h3 className="text-white text-lg leading-[1.35] tracking-[-0.4%] font-medium">
          Creator Details---
        </h3>

        <div className="flex items-center">
          <div className="w-[24px] h-[24px]">
            <Image
              src={marketplace.avatar}
              alt="avatar"
              className="w-full h-full"
            />
          </div>
          <p className="px-[10px] text-white text-sm leading-[1.35] tracking-[-0.4%] ">
            Noah Shiffman
          </p>
        </div>

        <div className="flex items-center py-2">
          <div className="w-[24px] h-[24px]">
            <Image
              src={marketplace.avatar2}
              alt="avatar"
              className="w-full h-full"
            />
          </div>
          <p className="px-[10px] text-white text-sm leading-[1.35] tracking-[-0.4%] ">
            A Fomoed Exclusive
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-white text-lg leading-[1.35] tracking-[-0.4%] font-medium">
          Share
        </h3>

        <div className="flex gap-2 items-center">
          <button
            type="button"
            className="w-[32px] h-[32px] flex items-center justify-center bg-[#181818] rounded-sm"
          >
            <MarketplaceLink />
          </button>
          <button
            type="button"
            className="w-[32px] h-[32px] flex items-center justify-center bg-[#181818] rounded-sm"
          >
            <Twitter />
          </button>

          <button
            type="button"
            className="w-[32px] h-[32px] flex items-center justify-center bg-[#181818] rounded-sm"
          >
            <Discord />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-white text-xs leading-[1.35] tracking-[-0.4%] font-semibold">
            Uploaded
          </p>
          <p className="text-[#D4D4D4] text-xs leading-[1.35] tracking-[-0.4%]">
            4th Aug, 2025
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-white text-xs leading-[1.35] tracking-[-0.4%] font-semibold">
            Last Updated
          </p>
          <p className="text-[#D4D4D4] text-xs leading-[1.35] tracking-[-0.4%]">
            6th Aug, 2025
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-white text-sm leading-[1.35] tracking-[-0.4%] font-semibold">
          Disclaimer
        </h3>
        <p className="text-[#989898] text-xs leading-[1.35] tracking-[-0.4%]">
          This is a disclaimer section, which legally absolves fomoed of any
          wrongdoing, needs Content from the project manager and then its
          curtains. Read more in{" "}
          <a href="#" className="text-[#2B74FF]">
            Terms of use
          </a>
        </p>
      </div>

      <RateProduct />
    </div>
  );
}
