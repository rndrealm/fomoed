"use client";
import authAssets from "@/lib/assets/auth";
import Image from "next/image";
import Link from "next/link";
import { useQueryState } from "nuqs";
import React, { Suspense } from "react";

export default function Page() {
  return (
    <Suspense>
      <AuthError />
    </Suspense>
  );
}

const AuthError = () => {
  const [code] = useQueryState("code", { defaultValue: "500" });
  const [message] = useQueryState("message", {
    defaultValue: "We’re sorry, this doesn’t normally happen, it’s not you its us.",
  });
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#000]">
      <div className="relative flex h-full w-full max-w-[372px] flex-col items-center justify-center">
        <div className="pb-8">
          <Image src={authAssets.ErrorIllustration} width={37} height={66} alt="Mail Illustration" />
        </div>
        <div>
          <h1 className="pb-[1.14rem] text-center text-xl font-semibold text-white">Balls!</h1>
          <h3 className="text-center text-base leading-[150%] font-medium text-[#5C5C5C]">{message}</h3>
        </div>
        <div className="pt-16">
          <p className="text-center text-base font-semibold text-[#5C5C5C]">
            Report this error{" "}
            <Link
              className="text-white"
              type="email"
              href={`mailto:management.fomoed.io?subject=Error%20${code}%20on%20authentication%20(${message})`}
            >
              Error {code}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
