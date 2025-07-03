import authAssets from "@/lib/assets/auth";
import { AppRoutes } from "@/lib/routes";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#000]">
      <div className="relative flex h-full w-full max-w-[372px] flex-col items-center justify-center">
        <div className="pb-8">
          <Image src={authAssets.MailIllustration} width={90} height={41} alt="Mail Illustration" />
        </div>
        <div>
          <h1 className="pb-[1.14rem] text-center text-xl font-semibold text-white">You’ve got Mail.</h1>
          <h3 className="text-center text-base leading-[150%] font-medium text-[#5C5C5C]">
            We&apos;ve sent you an email Check your inbox. Click the link to authenticate your account
          </h3>
        </div>
        <div className="pt-16">
          <p className="text-center text-base font-semibold text-[#5C5C5C]">
            Wrong email address?{" "}
            <Link className="text-white" href={AppRoutes.auth.path}>
              Change Email.
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
