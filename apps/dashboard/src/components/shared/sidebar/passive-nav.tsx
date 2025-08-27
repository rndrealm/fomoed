import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import { NavLink, INavLink } from "./nav-link";
import { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";

interface IPassiveNavProps {
  navLinks: INavLink[];
  setIsSideMenuOpen: (value: boolean) => void;
  setIsHovered: (value: boolean) => void;
  authUser: User | null;
  className?: string;
}

// This component renders the passive navigation when the side menu is closed.
const PassiveNav = (props: IPassiveNavProps) => {
  const { navLinks, setIsSideMenuOpen, setIsHovered, authUser, className } =
    props;

  return (
    <div
      id="passive-nav-active"
      className={
        "font-inter pointer-events-auto relative z-50 hidden h-full w-full max-w-[64px] flex-col items-center justify-between border-l-[0px] border-[#111111] bg-[#0A0A0A] py-0 md:flex"
      }
      onClick={(e) => {
        // check for the click on icon - no open of the sidebar
        const target = e.target as HTMLElement;
        // console.log("Target ID:", target);

        if (
          target.id === "popup-trigger-a" ||
          target.id === "popup-trigger-div"
        ) {
          setIsSideMenuOpen(false);
        } else {
          if (target.id === "passive-nav-active") {
            setIsSideMenuOpen(true);
          }
        }
      }}
      onMouseEnter={() => {
        document.body.style.cursor = "pointer";
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        document.body.style.cursor = "default";
        setIsHovered(false);
      }}
    >
      <div
        id="passive-nav-active"
        className="max-h-[64px] pointer-events-auto flex w-full flex-row items-center justify-between px-[16px]"
      >
        <button
          style={{ opacity: 0 }}
          className="h-[64px] w-[64px] pointer-events-none"
        >
          {/* <Image height={32} width={32} src={dashboard.logoMobile} alt="logo" /> */}
        </button>
      </div>

      <div
        id="passive-nav-active"
        className="flex h-full w-full flex-col items-center justify-between px-2 py-14"
      >
        <div
          className={cn(
            "pointer-events-none flex w-full flex-col gap-2",
            className,
          )}
        >
          {navLinks.map((item, index) => {
            return (
              <NavLink
                key={index}
                label={item.label}
                href={item.href}
                icon={item.icon}
                active={item.active}
                disabled={item.disabled}
                comingSoon={item.comingSoon}
                beta={item.beta}
                alpha={item.alpha}
                variant="passive"
              />
            );
          })}
        </div>
      </div>

      <div
        id="passive-nav-active"
        className="h-[64px] pointer-events-auto flex w-full flex-row items-center justify-between px-[16px]"
      ></div>
    </div>
  );
};

export default PassiveNav;
