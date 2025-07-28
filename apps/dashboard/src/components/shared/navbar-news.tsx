"use client";

import React, { useState, useEffect, Fragment } from "react";
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

const Ham = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#fff">
      <path d="M170-254.62q-12.75 0-21.37-8.63-8.63-8.62-8.63-21.38 0-12.75 8.63-21.37 8.62-8.61 21.37-8.61h620q12.75 0 21.37 8.62 8.63 8.63 8.63 21.39 0 12.75-8.63 21.37-8.62 8.61-21.37 8.61H170ZM170-450q-12.75 0-21.37-8.63-8.63-8.63-8.63-21.38 0-12.76 8.63-21.37Q157.25-510 170-510h620q12.75 0 21.37 8.63 8.63 8.63 8.63 21.38 0 12.76-8.63 21.37Q802.75-450 790-450H170Zm0-195.39q-12.75 0-21.37-8.62-8.63-8.63-8.63-21.39 0-12.75 8.63-21.37 8.62-8.61 21.37-8.61h620q12.75 0 21.37 8.63 8.63 8.62 8.63 21.38 0 12.75-8.63 21.37-8.62 8.61-21.37 8.61H170Z" />
    </svg>
  );
};

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
    <nav className="flex flex-col items-center overflow-hidden bg-[#00000] px-4 py-4">
      <div className="mx-auto flex w-full items-center justify-between">
        <button className="" onClick={() => setIsSideMenuOpen(true)}>
          <span className="md:hidden">
            {/* <MenuIconClosed /> */}
            <Ham />
          </span>
        </button>

        <div className="absolute top-1/2 left-1/2 h-[32px] w-[32px] -translate-x-1/2 -translate-y-1/2 md:hidden">
          <Link href="/">
            <Image src={dashboard.logoMobile} alt="logo" />
          </Link>
        </div>

        <div className="hidden items-center gap-2.5 md:flex">
          <Link href="/">
            <Image src={dashboard.logoV2} width={108} height={22} alt="logo" />
          </Link>

          {isNewsLogo && (
            <div className="py-1">
              <div className="rounded-[4px] bg-[#1F8B4C] px-3 py-1">
                <h2 className="font-inter text-xs font-normal text-white uppercase">News</h2>
              </div>
            </div>
          )}
        </div>

        <div className="hidden items-center gap-[10px] md:flex">
          {/* <div className="flex h-[24px] w-[24px] cursor-pointer items-center justify-center overflow-hidden rounded-[5px] md:h-[32px] md:w-[32px]">
          <NavbarProfileButton authUser={authUser}>
            <ProfileIcon user={authUser} />
          </NavbarProfileButton>
        </div> */}
        </div>
      </div>
    </nav>
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
    <Fragment>
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
    </Fragment>
  );
};
