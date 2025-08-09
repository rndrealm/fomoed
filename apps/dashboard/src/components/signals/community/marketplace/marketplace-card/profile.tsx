import React from "react";
import Image from "next/image";
import { MarketplaceProfile, RatingStar } from "@/components/icons/icons";
import marketplace from "@/lib/assets/signals/community/marketplace";
import { marketplaceData } from "@/lib/static";

const avatars = [marketplace.avatar, marketplace.avatar2, marketplace.avatar3];

interface IProps {
  index?: number;
  data: (typeof marketplaceData)[0];
}

export function Profile(props: IProps) {
  const { data, index = 0 } = props;

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-3">
        <div className="w-[24px] h-[24px]">
          <Image
            src={avatars[index % avatars.length]}
            alt="avatar"
            className="w-full h-full"
          />
        </div>

        <div className="flex items-center gap-1">
          <p className="text-[#737373] font-xs leading-[20px] ">
            By {data?.author ? data.author : "Unknown"}
          </p>

          <div className="w-[3px] h-[3px] bg-[#737373] rounded-full"></div>

          <div className="w-[24px] h-[24px] flex items-center justify-center">
            <MarketplaceProfile />
          </div>

          <p className="text-[#737373] font-xs leading-[20px] ">
            {data?.followers}
          </p>
        </div>
      </div>

      <div className="flex items-center">
        {Array(data?.rating || 0)
          .fill(0)
          .map((_, index) => (
            <div
              key={index}
              className="w-[18px] h-[18px] flex items-center justify-center"
            >
              <RatingStar />
            </div>
          ))}
      </div>
    </div>
  );
}
