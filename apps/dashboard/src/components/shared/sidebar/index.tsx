import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import dashboard from "@/lib/assets/dashboard";
import { MenuIconClosed, MenuIconOpened, StarSvg } from "../../icons/icons";
import { cn } from "@/lib/utils";
import { NavLink, INavLink } from "./nav-link";
import { usePathname } from "next/navigation";
import NavbarProfileButton from "@/components/ui/NavbarProfileButton";
import { ProfileIcon } from "../profile-icon";
import useAuthUserData from "@/lib/hooks/use-auth-user-data";
import { User } from "@supabase/supabase-js";

const sideMenuVariants = {
  open: {
    opacity: 1,
    transition: {
      duration: 0.75,
      ease: [0.4, 0.0, 0.2, 1],
    },
  },
  closed: {
    opacity: 0,
    transition: {
      duration: 0.75,
      ease: [0.4, 0.0, 0.2, 1],
    },
  },
};

interface ISideNavProps {
  navLinks: INavLink[];
  bottomLinks: INavLink[];
  isSideMenuOpen: boolean;
  setIsSideMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  authUser: User | null;
}

const SideNav = (props: ISideNavProps) => {
  const { navLinks, bottomLinks, isSideMenuOpen, setIsSideMenuOpen, authUser } = props;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      id="sidebar"
      className={cn(
        "fixed inset-0 z-50 h-screen max-h-screen w-[280px] max-w-[280px] overflow-hidden rounded-none bg-[#000000] p-0 opacity-100",
        {
          "pointer-events-none opacity-0 md:pointer-events-auto md:opacity-100": !isSideMenuOpen,
        }
      )}
      initial={{ width: "52px" }}
      animate={{ width: isSideMenuOpen ? "280px" : "52px" }}
      transition={{ duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }}
    >
      <PassiveNav
        navLinks={navLinks}
        setIsSideMenuOpen={setIsSideMenuOpen}
        setIsHovered={setIsHovered}
        authUser={authUser}
      />
      <ActiveNav
        navLinks={navLinks}
        bottomLinks={bottomLinks}
        isSideMenuOpen={isSideMenuOpen}
        setIsSideMenuOpen={setIsSideMenuOpen}
        isHovered={isHovered}
        authUser={authUser}
      />
    </motion.div>
  );
};

interface IPassiveNavProps {
  navLinks: INavLink[];
  setIsSideMenuOpen: (value: boolean) => void;
  setIsHovered: (value: boolean) => void;
  authUser: User | null;
}

// This component renders the passive navigation when the side menu is closed.
const PassiveNav = (props: IPassiveNavProps) => {
  const { navLinks, setIsSideMenuOpen, setIsHovered, authUser } = props;

  return (
    <div
      id="passive-nav-active"
      className={
        "font-inter pointer-events-auto relative z-50 hidden h-full w-full max-w-[52px] flex-col items-center justify-between border-l-[1px] border-[#2A2A2A] bg-[#000000] py-4 md:flex"
      }
      onClick={(e) => {
        // check for the click on icon - no open of the sidebar
        const target = e.target as HTMLElement;
        // console.log("Target ID:", target);

        if (target.id === "popup-trigger-a" || target.id === "popup-trigger-div") {
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

      <div id="passive-nav-active" className="flex h-full w-full flex-col items-center justify-between px-2 py-14">
        <div className="pointer-events-none flex w-full flex-col gap-2">
          {navLinks.map((item, index) => {
            // const active = item.label === "News";

            return (
              <NavLink
                key={index}
                label={item.label}
                href={item.href}
                icon={item.icon}
                active={item.active}
                disabled={item.disabled}
                variant="passive"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface IActiveNavProps {
  navLinks: INavLink[];
  bottomLinks: INavLink[];
  isSideMenuOpen: boolean;
  setIsSideMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isHovered: boolean;
  authUser: User | null;
}

// This component renders the active navigation when the side menu is open.
const ActiveNav = (props: IActiveNavProps) => {
  const { navLinks, bottomLinks, isSideMenuOpen, setIsSideMenuOpen, isHovered, authUser } = props;

  return (
    <div
      style={{ pointerEvents: isSideMenuOpen ? "all" : "none" }}
      className="font-inter absolute inset-0 z-50 flex h-full w-full min-w-[280px] flex-col items-center justify-between border-l-[1px] border-[#2A2A2A] bg-transparent py-4"
    >
      <div className="flex w-full flex-row items-center justify-between px-[10px]">
        <motion.button
          className="flex h-[32px] w-[32px] items-center justify-center"
          animate={{ x: isSideMenuOpen ? "14px" : 0 }}
          transition={{ duration: 0.75, delay: 0, ease: [0.4, 0.0, 0.2, 1] }}
        >
          {isHovered ? <MenuIconClosed /> : <Image height={32} width={32} src={dashboard.logoMobile} alt="logo" />}
        </motion.button>
        <motion.button
          onClick={() => setIsSideMenuOpen(false)}
          animate={{ opacity: isSideMenuOpen ? 1 : 0, x: isSideMenuOpen ? "-14px" : 0 }}
          transition={{ duration: 0.75, delay: 0, ease: [0.4, 0.0, 0.2, 1] }}
        >
          <MenuIconOpened />
        </motion.button>
      </div>

      <div className="flex h-full w-full flex-col items-center justify-between px-2 py-14">
        <div className="flex w-full flex-col gap-2">
          {navLinks.map((item, index) => {
            // const active = item.label === "Widget Dashboard";

            const comingSoon = item.label === "Community";
            const beta = item.label === "Smart Signals"

            return (
              <NavLink
                key={index}
                label={item.label}
                href={item.href}
                icon={item.icon}
                active={item.active}
                disabled={item.disabled}
                comingSoon={comingSoon}
                beta={beta}
                variant="active"
                isSideMenuOpen={isSideMenuOpen}
              />
            );
          })}
        </div>

        <div className="flex w-full flex-col gap-2">
          {bottomLinks.map((item, index) => {
            return (
              <NavLink
                key={index}
                label={item.label}
                href={item.href}
                icon={item.icon}
                active={false}
                disabled={item.disabled}
                comingSoon={item.comingSoon}
                variant="active"
                isSideMenuOpen={isSideMenuOpen}
                isBottomLink={true}
              />
            );
          })}
        </div>
      </div>

      <motion.div
        initial={{ borderTopColor: "#000" }}
        animate={{
          borderTopColor: isSideMenuOpen ? "#2E2E2E" : "#000",
        }}
        transition={{ duration: 0.75, delay: 0, ease: [0.4, 0.0, 0.2, 1] }}
        id="popup-trigger-div"
        className="flex w-full flex-row items-center gap-8 border-t-[1px] border-[#2E2E2E] px-[10px] pt-5"
      >
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: isSideMenuOpen ? "14px" : 0 }}
          transition={{ duration: 0.75, delay: 0, ease: [0.4, 0.0, 0.2, 1] }}
          className="pointer-events-auto flex h-[24px] w-[24px] cursor-pointer items-center justify-center overflow-hidden rounded-[4px] md:h-[32px] md:w-[32px]"
        >
          <NavbarProfileButton authUser={authUser} className="pr-0 pb-2.5 pl-3">
            <ProfileIcon user={authUser} />
          </NavbarProfileButton>
        </motion.div>

        <motion.div
          initial="closed"
          variants={sideMenuVariants}
          animate={isSideMenuOpen ? "open" : "closed"}
          className="flex flex-col gap-1.5"
        >
          <h3 className="text-[14px] font-normal text-white">{authUser?.user_metadata?.name}</h3>
          <h4 className="text-xs font-normal text-[#A4A4A4]">{authUser?.email}</h4>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SideNav;
export { NavLink, type INavLink };
