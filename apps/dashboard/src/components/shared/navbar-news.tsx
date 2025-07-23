"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import dashboard from "@/lib/assets/dashboard";
import {
  NewsIcon,
  WidgetDashboardIcon,
  SmartSignalsIcon,
  CommunityIcon,
  HelpSupportIcon,
  HowToUseIcon,
  SettingsIcon,
  MenuIconClosed,
} from "../icons/icons";
import { AppRoutes } from "@/lib/routes";
import { ProfileIcon } from "./profile-icon";
import useAuthUserData from "@/lib/hooks/use-auth-user-data";
import { User } from "@supabase/supabase-js";
import SideNav from "./sidebar";
import { RenderIf } from "./render-if";
import { useAtom, useAtomValue } from "jotai";
import { isSidebarOpenAtom } from "@/lib/atoms/utilsAtom";

const navLinks = [
  {
    label: "Widget Dashboard",
    icon: <WidgetDashboardIcon />,
    href: AppRoutes.dashboard.path,
    active: false,
  },
  {
    label: "News",
    icon: <NewsIcon />,
    href: AppRoutes.news.path,
    active: false,
  },

  {
    label: "Smart Signals",
    icon: <SmartSignalsIcon />,
    href: AppRoutes.signals.path,
    active: false,
    disabled: true,
  },
  {
    label: "Community",
    icon: <CommunityIcon />,
    href: AppRoutes.dashboard.path,
    active: false,
    disabled: true,
  },
];

const bottomLinks = [
  {
    label: "Help & Support",
    icon: <HelpSupportIcon />,
    href: "/",
    disabled: true,
  },
  {
    label: "How to use Fomoed",
    icon: <HowToUseIcon />,
    href: AppRoutes.dashboard.path,
    disabled: true,
  },
  {
    label: "Settings",
    icon: <SettingsIcon />,
    href: AppRoutes.dashboard.path,
    disabled: true,
  },
];

const NavigationTop = ({
  authUser,
  isNewsLogo,
  setIsSideMenuOpen,
}: {
  authUser: User | null;
  isNewsLogo: boolean;
  setIsSideMenuOpen: (value: boolean) => void;
}) => {
  return (
    <div className="mx-auto flex w-full items-center justify-between">
      <button className="" onClick={() => setIsSideMenuOpen(true)}>
        <span className="md:hidden">
          <MenuIconClosed />
        </span>
      </button>

      <div className="h-[24px] w-[24px] md:hidden">
        <Link href="/">
          <Image src={dashboard.logoMobile} alt="logo" />
        </Link>
      </div>

      <div className="hidden items-center gap-2.5 md:flex">
        <Link href="/">
          <Image src={dashboard.logoV2} width={108} height={22} alt="logo" />
        </Link>

        {isNewsLogo && (
          <div className="rounded-[4px] bg-[#1F8B4C] px-3 py-1">
            <h2 className="font-inter text-xs font-normal text-white uppercase">News</h2>
          </div>
        )}
      </div>

      <div className="flex items-center gap-[10px]">
        {/* <div className="flex h-[24px] w-[24px] cursor-pointer items-center justify-center overflow-hidden rounded-[5px] md:h-[32px] md:w-[32px]">
          <NavbarProfileButton authUser={authUser}>
            <ProfileIcon user={authUser} />
          </NavbarProfileButton>
        </div> */}
      </div>
    </div>
  );
};

interface IProps {
  isNews?: boolean;
}

export const NavbarNews = (props: IProps) => {
  const { isNews } = props;
  // const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useAtom(isSidebarOpenAtom);
  const [isNewsLogo, setIsNewsLogo] = useState(false);
  const authUser = useAuthUserData();
  const pathname = usePathname();

  // Close sidebar when pathname changes (route navigation)
  useEffect(() => {
    setIsSideMenuOpen(false);
  }, [pathname, setIsSideMenuOpen]);

  // Set the active link based on the pathname
  useEffect(() => {
    function findActive(linkLabel: string) {
      navLinks.find((item) => {
        if (item.label.includes(linkLabel)) {
          item.active = true;
        } else {
          item.active = false;
        }
      });
    }

    if (pathname === "/dashboard") {
      findActive("Dashboard");
    } else if (pathname === "/news") {
      findActive("News");
      setIsNewsLogo(true);
    }
  }, [pathname]);

  return (
    <nav className="flex flex-col items-center overflow-hidden bg-[#00000] px-2 py-3 sm:px-4 md:px-8 md:py-4">
      {/* Top Nav */}
      <RenderIf condition={!!isNews}>
        <NavigationTop authUser={authUser} isNewsLogo={isNewsLogo} setIsSideMenuOpen={setIsSideMenuOpen} />
      </RenderIf>

      {/* Blur Layer */}
      <motion.div
        onClick={() => setIsSideMenuOpen(false)}
        className="fixed inset-0 z-40 bg-[rgba(165,165,165,0.02)] backdrop-blur-[4px]"
        initial={{ opacity: 0 }}
        animate={{ pointerEvents: isSideMenuOpen ? "all" : "none", opacity: isSideMenuOpen ? 1 : 0 }}
        transition={{ duration: 0.25, ease: "linear" }}
      ></motion.div>

      {/* Side Nav */}
      <SideNav
        navLinks={navLinks}
        bottomLinks={bottomLinks}
        isSideMenuOpen={isSideMenuOpen}
        setIsSideMenuOpen={setIsSideMenuOpen}
        authUser={authUser}
      />
    </nav>
  );
};
