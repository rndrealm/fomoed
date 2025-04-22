"use client";
import { Nav, WidgetContainer } from "@/components/dashboard";

export default function Home() {
  return (
    <div className="bg-[#0D0D0D] h-screen pt-[96px] px-4 flex flex-col gap-2 overflow-hidden">
      <Nav />

      <WidgetContainer />

      <div className="p-4"></div>
    </div>
  );
}
