"use client";
import React from "react";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { FormStep, WaitlistForm } from "@/components/waitlist";
import dashboard from "@/lib/assets/dashboard";
import waitlist from "@/lib/assets/waitlist";
import { AppRoutes } from "@/lib/routes";
import Link from "next/link";

export default function Page() {
  return (
    <div className="bg-[#0C0C0C] flex flex-col py-8 h-full w-full min-h-[100vh] gap-9 sm:gap-12">
      <div className="flex justify-between items-center pb-4 px-4 sm:px-8 border-b border-[rgba(255,255,255,0.12)]">
        <button type="button" className="sm:invisible">
          <ArrowLeft color="#fff" />
        </button>

        <FormStep />

        {/* <Link
          href={AppRoutes.eventPhotos.path}
          className="text-sm leading-[20px] tracking-[-0.6%] font-medium text-white"
        >
          Skip
        </Link> */}
      </div>

      <div className="flex flex-1 flex-col items-center gap-12 px-4">
        <div className="max-w-[472px] w-full flex flex-col gap-8 items-center">
          <div className="w-[40px] h-[40px]">
            <Image src={dashboard.logoMobile} alt="logo" />
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-white text-sm tracking-[6%] leading-[20px] font-medium uppercase text-center">
              fomeod e-sports trading
            </p>
            <h2 className="text-[#F2F2F2] tracking-[-4.5%] text-3xl sm:text-5xl leading-[40px] sm:leading-[56px] font-medium text-center">
              Get Early Access
            </h2>
            <p className="text-center text-[#F2F2F2B2] opacity-[0.7] text-sm leading-[20px] tracking-[-0.6%]">
              Compete on the world’s first live e-sports trading platform. <br /> 1v1 battles. Real-time data. Perp
              leverage. Cash prizes. <br />
              Think you’re good enough to trade on stage? <br /> Join the waitlist.
            </p>
          </div>
        </div>

        <WaitlistForm />
      </div>
      <div className="flex justify-center px-4">
        <div className="flex flex-col gap-7 max-w-[296px] w-full">
          <div className="w-full px-5">
            <Image src={waitlist.gradientBorder} alt="border" />
          </div>
          <div className="flex items-center gap-2 w-full">
            <div className="h-[24px]">
              <Image src={waitlist.groupedAvatar} alt="grouped-avatar" className="h-full w-full" />
            </div>
            <p className="text-xs leading-[16px] tracking-[0.4%] text-[#F2F2F2B2] opacity-[0.7]">
              Join 1,000+ Traders on the waitlist
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
