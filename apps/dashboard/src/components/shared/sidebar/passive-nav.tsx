import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import { NavLink, INavLink } from "./nav-link";
import { User } from "@supabase/supabase-js";
import { UsersRow } from "@/lib/types/db.types";

interface IPassiveNavProps {
  navLinks: INavLink[];
  setIsSideMenuOpen: (value: boolean) => void;
  setIsHovered: (value: boolean) => void;
  authUser: UsersRow | null;
}

// This component renders the passive navigation when the side menu is closed.
const PassiveNav = (props: IPassiveNavProps) => {
  const { navLinks, setIsSideMenuOpen, setIsHovered, authUser } = props;

  return (
    <div
      id="passive-nav-active"
      className={
        "font-inter pointer-events-auto relative z-50 hidden h-full w-full max-w-[52px] flex-col items-center justify-between border-l-[0px] border-[#2A2A2A] bg-[#000000] py-4 md:flex"
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
        className="pointer-events-auto flex w-full flex-row items-center justify-between px-[10px]"
      >
        <button style={{ opacity: 0 }} className="pointer-events-none">
          <Image height={32} width={32} src={dashboard.logoMobile} alt="logo" />
        </button>
      </div>

      <div
        id="passive-nav-active"
        className="flex h-full w-full flex-col items-center justify-between px-2 py-14"
      >
        <div className="pointer-events-none flex w-full flex-col gap-2">
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
    </div>
  );
};

export default PassiveNav;
