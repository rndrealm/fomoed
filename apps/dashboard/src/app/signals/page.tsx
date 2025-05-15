"use client";

import MySignals from "@/components/signals/my-smart-signals";
import { Plus } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-black min-h-screen p-2 h-full w-full">
      <div className="flex items-center justify-between my-6">
        <h1 className="font-medium text-xl">My Smart Signals</h1>

        <button className="bg-fomoed-red text-white px-2 py-1 rounded flex items-center text-sm">
          <Plus size={12} />
          New Signal
        </button>
      </div>

      <MySignals />
    </div>
  );
}
