"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import waitlist from "@/lib/assets/waitlist";
import { AppRoutes } from "@/lib/routes";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

export default function Page() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const entry = searchParams.get("entry");

  // useEffect(() => {
  //   if (!entry || isNaN(Number(entry))) {
  //     router.push(AppRoutes.eventPhotos.path);
  //   }
  // }, [entry, router]);

  // if (!entry) {
  //   return (
  //     <div className="flex items-center justify-center pt-10">
  //       <Spinner className="text-[rgb(255,59,16)]" size={36} />
  //     </div>
  //   );
  // }

  return (
    <div className="bg-[#0C0C0C] flex flex-col py-8 h-full w-full min-h-[100vh] gap-9 sm:gap-12">
      <div className="flex justify-between items-center pb-4 px-4 sm:px-8 border-b border-[rgba(255,255,255,0.12)]">
        {/* <Link
          href={AppRoutes.eventPhotos.path}
          className="text-sm leading-[20px] tracking-[-0.6%] font-medium text-white invisible"
        >
          Skip
        </Link> */}
      </div>

      <div className="flex flex-1 flex-col items-center gap-12 px-4">
        <div className="max-w-[472px] w-full flex flex-col gap-8 items-center">
          <div className="w-[40px] h-[40px]">
            <Image src={dashboard.logoMobile} alt="logo" />
          </div>

          <div className="flex flex-col gap-4 w-full">
            <p className="text-white text-sm tracking-[6%] leading-[20px] font-medium uppercase text-center">
              fomeod e-sports trading
            </p>

            <div className="flex flex-col gap-6 items-center w-full">
              <div className="w-[128px] h-[128px]">
                <Image src={waitlist.confetti} alt="confetti" className="" />
              </div>
              <div className="flex flex-col gap-4">
                <h2 className="text-[#F2F2F2] tracking-[-4.5%] text-3xl sm:text-5xl leading-[40px] sm:leading-[56px] font-medium text-center">
                  You&apos;re <span className="text-[#F2F2F280]">#{(1000 + Number(entry)).toLocaleString()}</span> on
                  the waitlist
                </h2>

                <p className="text-center text-[#F2F2F2B2] opacity-[0.7] text-sm leading-[20px] tracking-[-0.6%]">
                  We&apos;ll let you know as soon as Fomeod E-sports is ready for you!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* <Link
          href={AppRoutes.eventPhotos.path}
          className="bg-white rounded-[12px] h-[40px] max-w-[372px] w-full flex items-center justify-center"
        >
          <p className="text-[#000] text-xs leading-[16px] tracking-[-0.4%] font-medium">Go to Dashboard</p>
        </Link> */}
      </div>
    </div>
  );
}
