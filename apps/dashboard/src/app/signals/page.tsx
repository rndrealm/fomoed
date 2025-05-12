"use client";

import NavBar from "@/components/shared/nav-bar";
import SmartSignalsMvp from "@/screens/signals/SmartSignalsMvp";

export default function Home() {
  return (
    <div className="bg-black min-h-screen p-2 h-full">
      <NavBar />
      <SmartSignalsMvp />
    </div>
  );
}
