import authAssets from "@/lib/assets/auth";
import { AppRoutes } from "@/lib/routes";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Page() {
  return (
    <div className="min-h-screen  bg-[#000] flex items-center justify-center">
      <div className="h-full w-full max-w-[372px] flex flex-col items-center justify-center">
        <div className="pb-8">
          <Image
            src={authAssets.MailIllustration}
            width={90}
            height={41}
            alt="Mail Illustration"
          />
        </div>
        <div>
          <h1 className="text-white text-center text-xl font-semibold pb-[1.14rem]">
            You’ve got Mail.
          </h1>
          <h3 className="text-base font-medium text-center text-[#5C5C5C] leading-[150%]">
            We&apos;ve sent you an email Check your inbox. Check your inbox and
            follow the instructions to reset your account.
          </h3>
        </div>
        <div className="pt-16">
          <p className="text-base text-center font-semibold text-[#5C5C5C]">
            Wrong email address?{" "}
            <Link
              className="text-white"
              href={AppRoutes.auth.forgotPassword.path}
            >
              Change Email.
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
