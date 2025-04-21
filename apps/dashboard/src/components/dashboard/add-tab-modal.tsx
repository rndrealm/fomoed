import React from "react";
import { Input } from "../ui/input";
import SearchIcon from "../icons/SearchIcon";
import PlusIcon from "../icons/PlusIcon";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import { useSetAtom } from "jotai";
import { activeTabAtom, tabsAtom } from "@/lib/atoms/layoutAtom";

const tempLayouts = [
  { id: 1, label: "Current Layout" },
  { id: 2, label: "Untitled Tab" },
  { id: 3, label: "Untitled Tab" },
  { id: 4, label: "Untitled Tab" },
  { id: 5, label: "Untitled Tab" },
  { id: 6, label: "Untitled Tab" },
];

interface IProps {
  handleTabAdded?: () => void;
}

export function AddTabModal(props: IProps) {
  const { handleTabAdded = () => {} } = props;

  const setTabAtom = useSetAtom(tabsAtom);
  const setActiveTabAtom = useSetAtom(activeTabAtom);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <span className="absolute left-2 top-[50%] -translate-y-1/2">
              <SearchIcon />
            </span>
            <Input
              placeholder="Search Layout"
              className="h-[32px] pl-7 pr-[9px] py-[1px] rounded-[4px] border border-white/10 text-sm placeholder:text-white/40 bg-transparent text-white
    focus:outline-none focus:ring-0 focus:ring-offset-0 focus:shadow-none focus:border-white/15 focus:bg-white/2
    [&:focus-visible]:outline-none [&:focus]:outline-none transition-all w-full"
            />
          </div>

          <button type="button">
            <div className="flex gap-2 items-center px-2 bg-[#171A1C] rounded-sm h-[32px]">
              <p className="text-[#717a7a] text-xs">Create New Tab</p>
              <PlusIcon />
            </div>
          </button>
        </div>

        <p className="text-white text-xs">
          Select from your saved layouts below
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {tempLayouts.map((item) => {
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                const newTab = {
                  id: Date.now(),
                  label: item.label,
                  editMode: false,
                };
                setTabAtom((prev) => {
                  return [...prev, newTab];
                });
                setActiveTabAtom(newTab);
                handleTabAdded();
              }}
            >
              <div className="flex flex-col gap-1">
                <div className="">
                  <Image src={dashboard.layoutPlaceholder} alt="placeholder" />
                </div>
                <p className="text-center text-xs text-white">{item.label}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
