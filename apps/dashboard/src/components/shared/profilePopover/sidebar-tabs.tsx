import React, { ReactElement, ReactNode, SVGProps } from "react";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Logout } from "@/components/icons/icons";
import { useRouter } from "next/navigation";
import { AppRoutes } from "@/lib/routes";

export type ActiveTabType =
  | "Profile"
  | "Data and Privacy"
  | "Connections"
  | "Subscriptions"
  | "Billing"
  | "Notifications"
  | "Keyboard Shortcuts";

export type popoverOptionsType = {
  label: string;
  tabs: {
    name: ActiveTabType;
    boxTitle?: string;
    disabled?: boolean;
    icon: ReactElement<SVGProps<SVGSVGElement>>;
    onClick: () => void;
  }[];
};

interface SidebarTabsProps {
  popoverOptions: popoverOptionsType[];
  activeTab: string;
  setActiveTab: (value: { open: boolean; activeTab: ActiveTabType }) => void;
}

const WhattsNewIcon = ({ fill }: { fill?: string }) => {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2.01284 11.1663C1.67506 11.1663 1.39402 11.0541 1.16971 10.8297C0.945405 10.6052 0.833252 10.324 0.833252 9.98592V2.00655C0.833252 1.66863 0.945405 1.38856 1.16971 1.16634C1.39402 0.944119 1.67506 0.833008 2.01284 0.833008H5.44221C5.53721 0.833008 5.61652 0.864397 5.68013 0.927175C5.74374 0.989953 5.77554 1.06822 5.77554 1.16197C5.77554 1.25572 5.74374 1.33544 5.68013 1.40113C5.61652 1.46683 5.53721 1.49967 5.44221 1.49967H2.01284C1.8845 1.49967 1.76693 1.55308 1.66013 1.65988C1.55332 1.76669 1.49992 1.88426 1.49992 2.01259V9.98676C1.49992 10.1151 1.55332 10.2327 1.66013 10.3395C1.76693 10.4463 1.8845 10.4997 2.01284 10.4997H13.987C14.1153 10.4997 14.2329 10.4463 14.3397 10.3395C14.4465 10.2327 14.4999 10.1151 14.4999 9.98676V2.01259C14.4999 1.88426 14.4465 1.76669 14.3397 1.65988C14.2329 1.55308 14.1153 1.49967 13.987 1.49967H10.5576C10.4626 1.49967 10.3833 1.46829 10.3197 1.40551C10.2561 1.34273 10.2243 1.26447 10.2243 1.17072C10.2243 1.07697 10.2561 0.997244 10.3197 0.931549C10.3833 0.865855 10.4626 0.833008 10.5576 0.833008H13.987C14.3248 0.833008 14.6058 0.945229 14.8301 1.16967C15.0544 1.39412 15.1666 1.67537 15.1666 2.01342V9.9928C15.1666 10.3307 15.0544 10.6108 14.8301 10.833C14.6058 11.0552 14.3248 11.1663 13.987 11.1663H2.01284ZM7.66659 7.27842V1.16634C7.66659 1.07134 7.69797 0.992036 7.76075 0.928425C7.82353 0.864814 7.90179 0.833008 7.99554 0.833008C8.08929 0.833008 8.16902 0.864814 8.23471 0.928425C8.3004 0.992036 8.33325 1.07134 8.33325 1.16634V7.27842L10.7051 4.90676C10.783 4.8287 10.8613 4.78704 10.9399 4.78176C11.0184 4.77634 11.1019 4.81801 11.1905 4.90676C11.2793 4.99537 11.3237 5.07627 11.3237 5.14947C11.3237 5.22266 11.2803 5.30259 11.1937 5.38926L8.40867 8.17426C8.29297 8.29509 8.15797 8.35551 8.00367 8.35551C7.8495 8.35551 7.712 8.29509 7.59117 8.17426L4.80617 5.38926C4.7302 5.31329 4.69304 5.23606 4.69471 5.15759C4.69624 5.07898 4.74138 4.99537 4.83013 4.90676C4.91874 4.81801 4.99964 4.77363 5.07284 4.77363C5.14603 4.77363 5.22693 4.81801 5.31554 4.90676L7.66659 7.27842Z"
        fill={fill}
      />
    </svg>
  );
};

const SidebarTabs = ({ popoverOptions, activeTab, setActiveTab }: SidebarTabsProps) => {
  const router = useRouter();

  const handleLogout = async () => {
    router.push(AppRoutes.logout.path);
  };

  return (
    <Command className="rounded-[0px] w-[160px] md:w-[234px] max-w-[234px] h-full border-r-[1px] border-[#242424] bg-[#111111]">
      <CommandList className="scrollbar px-2 max-h-full w-full outline-none">
        {popoverOptions?.map((item, index) => {
          return (
            <CommandGroup
              key={index}
              className="flex flex-col gap-0 px-0 pb-0 pt-2 [&_[cmdk-group-heading]]:px-[18px] [&_[cmdk-group-heading]]:py-3 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:leading-[16px] [&_[cmdk-group-heading]]:text-[#A4A4A4]"
              heading={item.label}
            >
              {/* tab item */}

              <div className="flex flex-col gap-2 w-full">
                {item.tabs.map((tab, index) => {
                  const isActive = activeTab === tab.name;

                  return (
                    <CommandItem
                      key={index}
                      aria-disabled={tab.disabled}
                      className={cn(
                        "group cursor-pointer w-full h-[38px] px-4 flex flex-row items-center justify-start gap-2 max-h-[40px] rounded-[8px] bg-transparent data-[selected=true]:bg-[#151515]",
                        isActive && "!bg-[#1A1A1A]",
                        tab.disabled && "cursor-not-allowed opacity-50 data-[selected=true]:bg-transparent",
                      )}
                      onSelect={(e) => {
                        // stops selection if disabled
                        if (tab.disabled) {
                          return;
                        }
                        setActiveTab({ open: true, activeTab: tab.name });
                      }}
                    >
                      <div className="h-5 aspect-square flex items-center justify-center">
                        {React.cloneElement(tab.icon, { fill: isActive ? "#fff" : "#A6AEB2" })}
                      </div>
                      <h2 className="text-[14px] leading-[18px] font-normal text-white">{tab.name}</h2>
                    </CommandItem>
                  );
                })}
              </div>
            </CommandGroup>
          );
        })}

        {/* last items */}
        <div className="mt-3 px-1 flex flex-col gap-0 items-start justify-between">
          <CommandItem
            className={cn(
              "group px-3 cursor-pointer w-full h-[52px] border-t-[1px] rounded-[0px] border-[#242424] flex flex-row items-center justify-start gap-2 bg-transparent data-[selected=true]:bg-transparent hover:opacity-80",
            )}
          >
            <div className="h-5 aspect-square flex items-center justify-center">
              {React.cloneElement(<WhattsNewIcon />, { fill: "#fff" })}
            </div>
            <h2 className="text-[14px] leading-[18px] font-normal text-white">Whats New</h2>
          </CommandItem>
          <CommandItem
            onSelect={() => handleLogout()}
            className={cn(
              "group px-3 cursor-pointer w-full h-[52px] border-t-[1px] rounded-[0px] border-[#242424] flex flex-row items-center justify-start gap-2 bg-transparent data-[selected=true]:bg-transparent hover:opacity-80",
            )}
          >
            <div className="h-5 aspect-square flex items-center justify-center">
              {React.cloneElement(<Logout />, { fill: "#FF8970" })}
            </div>
            <h2 className="text-[14px] leading-[18px] font-normal text-[#FF8970]">Logout</h2>
          </CommandItem>
        </div>
      </CommandList>
    </Command>
  );
};

export default SidebarTabs;
