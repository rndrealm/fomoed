"use client";
import React, { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export default function Page() {
  return (
    <Suspense fallback={<LoginPageSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginPageSkeleton() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#000] px-4 pb-8">
      <div className="flex h-full flex-1 items-center justify-center">
        <div className="flex w-full max-w-[418px] flex-col gap-5">
          <div className="relative flex justify-center">
            <div className="h-12 w-32 animate-pulse rounded bg-gray-800" />
          </div>
          <div className="relative rounded-2xl">
            <div className="relative flex w-full flex-col gap-12 rounded-2xl bg-[#070707] px-6 py-[48px]">
              <div className="mx-auto flex max-w-[313px] flex-col gap-2">
                <div className="mx-auto h-6 w-32 animate-pulse rounded bg-gray-800" />
                <div className="mx-auto h-4 w-48 animate-pulse rounded bg-gray-800" />
              </div>
              <div className="flex flex-col gap-4">
                <div className="h-12 w-full animate-pulse rounded bg-gray-800" />
                <div className="h-12 w-full animate-pulse rounded bg-gray-800" />
                <div className="h-12 w-full animate-pulse rounded bg-gray-800" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
