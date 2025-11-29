"use client";
import React, { useState } from "react";
import NetworkDropdown from "./network-dropdown";

const SettingsTab = () => {
  const [activeTab, setActiveTab] = useState<"preferences" | "addressBook">("preferences");
  const [selectedNetwork, setSelectedNetwork] = useState("Ethereum");

  return (
    <div className="w-full h-full flex flex-col">
      <p className="text-white text-[22px] px-3 py-2">Settings</p>

      {/* Sub-tabs */}
      <div className="flex items-center px-3 pb-3">
        <div className="flex bg-[#222329] p-[2px] rounded-[6px]">
          <button
            onClick={() => setActiveTab("preferences")}
            className={`text-[12px] px-3 h-[24px] transition rounded-[5px]
        ${activeTab === "preferences" ? "bg-[#2B2C32] text-white" : "text-[#84858C]"}
      `}
          >
            Preferences
          </button>
          <button
            onClick={() => setActiveTab("addressBook")}
            className={`text-[12px] px-3 h-[24px] transition rounded-[5px]
        ${activeTab === "addressBook" ? "bg-[#2B2C32] text-white" : "text-[#84858C]"}
      `}
          >
            Address Book
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-3 no-scrollbar">
        {activeTab === "preferences" ? (
          <div className="space-y-6">
            {/* Account */}
            <div className="flex flex-col gap-[12px]">
              <p className="text-[#84858C] text-[12px]">Account</p>
              <p className="text-white text-[16px] font-medium">Main Account</p>
            </div>

            {/* Futures Position Limit */}
            <div className="flex flex-col gap-[12px]">
              <p className="text-[#84858C] text-[12px]">Futures Position Limit</p>
              <p className="text-white text-[16px] font-medium">US$10,000,000</p>
            </div>

            {/* Borrows Position Limit */}
            <div className="flex flex-col gap-[12px]">
              <p className="text-[#84858C] text-[12px]">Borrows Position Limit</p>
              <p className="text-white text-[16px] font-medium">US$5,000,000</p>
            </div>

            {/* Max Leverage */}
            <div className="flex flex-col gap-[12px]">
              <p className="text-[#84858C] text-[12px]">Max Leverage</p>
              <span className="inline-flex items-center bg-[#222329] rounded-[4px] px-[6px] py-[4px] w-fit">
                <span className="text-white text-[12px] font-medium">10x</span>
              </span>
            </div>
          </div>
        ) : (
          <div>
            {/* Network Section */}
            <div>
              <p className="text-[#84858C] text-[12px] mb-3">Network</p>
              <NetworkDropdown value={selectedNetwork} setValue={setSelectedNetwork} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsTab;
