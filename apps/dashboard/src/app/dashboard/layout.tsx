// import Navbar from "@/components/ui/navbar";
"use client";
import { Navbar, RenderIf } from "@/components/shared";
import { utilsAtom } from "@/lib/atoms/utilsAtom";
import { useGetUserPlans } from "@/services/queries/subscriptions";
import { useAtomValue } from "jotai";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const utils = useAtomValue(utilsAtom);
  useGetUserPlans();

  return (
    <>
      <div className="absolute inset-x-0 top-0">
        <RenderIf condition={!utils.isFullScreen}>
          <Navbar />
        </RenderIf>
      </div>
      {children}
    </>
  );
}
