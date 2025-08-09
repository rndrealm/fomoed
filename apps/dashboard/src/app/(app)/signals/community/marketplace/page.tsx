"use client";
import React, { Fragment, useState } from "react";
import {
  Breadcumb,
  BrowseMarketplace,
  Header,
  MarketplaceCard,
  MarketplaceDetails,
} from "@/components/signals/community/marketplace";
import { Crown, Globe, PopularFire } from "@/components/icons/icons";
import { marketplaceData } from "@/lib/static";
import { ModalContainer } from "@/components/shared";

export default function Page() {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Fragment>
      <div className="mx-2 h-full w-full bg-[#101010] flex flex-col overflow-hidden">
        <Header />

        <div className="flex-1 overflow-y-auto pt-4 pb-14 px-6 flex flex-col gap-8">
          <div className="w-full flex items-center justify-between">
            <Breadcumb />

            <div className="bg-[#171717] px-2 py-[6px] flex items-center rounded-lg gap-1">
              <div className="w-[20px] h-[20px] flex items-center justify-center ">
                <Globe fill="#fff" />
              </div>
              <p className="text-[#737373] text-sm leading-[20px]">
                Marketplace
              </p>
            </div>
          </div>

          <BrowseMarketplace />

          <div className="flex flex-col gap-10">
            <div className="flex flex-col">
              <div className="flex gap-1 px-[10px] py-3">
                <div className="w-[20px] h-[20px] flex items-center justify-center ">
                  <Crown />
                </div>
                <p className="text-[#989898] text-sm tracking-[-0.4%] font-medium">
                  From Top Creators
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 ">
                {marketplaceData?.map((item, index) => (
                  <MarketplaceCard
                    key={item.id}
                    data={item}
                    index={index}
                    onClick={() => {
                      setShowDetails(true);
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex gap-1 px-[10px] py-3">
                <div className="w-[20px] h-[20px] flex items-center justify-center ">
                  <PopularFire />
                </div>
                <p className="text-[#989898] text-sm tracking-[-0.4%] font-medium">
                  Popular
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 ">
                {marketplaceData?.map((item) => (
                  <MarketplaceCard
                    key={item.id}
                    data={item}
                    onClick={() => {
                      console.log(item);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ModalContainer
        open={showDetails}
        handleClose={() => {
          setShowDetails(false);
        }}
        className="h-full p-0 rounded-[30px] !max-w-[1000px] !max-h-[700px] overflow-hidden"
        title="Marketplace Details"
        noHeader
      >
        <MarketplaceDetails handleClose={() => setShowDetails(false)} />
      </ModalContainer>
    </Fragment>
  );
}
