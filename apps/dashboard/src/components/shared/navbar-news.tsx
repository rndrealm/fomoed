"use client";

import React, { useEffect, Fragment } from "react";
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
  Hamburger,
} from "../icons/icons";
import { AppRoutes } from "@/lib/routes";
import useAuthUserData from "@/lib/hooks/use-auth-user-data";
import { User } from "@supabase/supabase-js";
import SideNav, { INavLink } from "./sidebar";
import { RenderIf } from "./render-if";
import { useAtom } from "jotai";
import { isSidebarOpenAtom } from "@/lib/atoms/utilsAtom";

const navLinks: INavLink[] = [
  {
    label: "Widget Dashboard",
    icon: <WidgetDashboardIcon />,
    href: AppRoutes.dashboard.path,
    disabled: false,
    beta: false,
    comingSoon: false,
  },
  {
    label: "News",
    icon: <NewsIcon />,
    href: AppRoutes.news.path,
    disabled: false,
    beta: false,
    comingSoon: false,
  },

  {
    label: "Smart Signals",
    icon: <SmartSignalsIcon />,
    href: AppRoutes.signals.path,
    disabled: false,
    beta: false,
    comingSoon: true,
  },
  {
    label: "Community",
    icon: <CommunityIcon />,
    href: "Community",
    disabled: true,
    beta: false,
    comingSoon: true,
  },
];

// const bottomLinks = [
//   {
//     label: "Help & Support",
//     icon: <HelpSupportIcon />,
//     href: "/",
//     disabled: true,
//   },
//   {
//     label: "How to use Fomoed",
//     icon: <HowToUseIcon />,
//     href: "/",
//     disabled: true,
//   },
//   {
//     label: "Settings",
//     icon: <SettingsIcon />,
//     href: "/",
//     disabled: true,
//   },
// ];

const bottomLinks = [] as any[];

interface IProps {
  isNews?: boolean;
}

export const NavbarNews = (props: IProps) => {
  const { isNews } = props;
  // const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useAtom(isSidebarOpenAtom);
  const authUser = useAuthUserData();
  const pathname = usePathname();

  // Close sidebar when pathname changes (route navigation)
  useEffect(() => {
    setIsSideMenuOpen(false);
  }, [pathname, setIsSideMenuOpen]);

  // Set the active link based on the pathname
  useEffect(() => {
    function findActive(linkHref: string) {
      navLinks.find((item) => {
        if (item.href === linkHref) {
          item.active = true;
        } else {
          item.active = false;
        }
      });
    }

    if (pathname === AppRoutes.dashboard.path) {
      findActive(AppRoutes.dashboard.path);
    } else if (pathname === AppRoutes.news.path) {
      findActive(AppRoutes.news.path);
    } else if (pathname === AppRoutes.signals.path) {
      findActive(AppRoutes.signals.path);
    }
  }, [pathname]);

  return (
    <Fragment>
      {/* Top Nav */}
      <RenderIf condition={!!isNews}>
        <NavigationTop
          authUser={authUser}
          isNews={isNews}
          setIsSideMenuOpen={setIsSideMenuOpen}
        />
      </RenderIf>

      {/* Blur Layer */}
      <motion.div
        onClick={() => setIsSideMenuOpen(false)}
        className="fixed inset-0 z-[100] bg-[rgba(165,165,165,0.02)] backdrop-blur-[4px]"
        initial={{ opacity: 0 }}
        animate={{
          pointerEvents: isSideMenuOpen ? "all" : "none",
          opacity: isSideMenuOpen ? 1 : 0,
        }}
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

const NavigationTop = ({
  authUser,
  isNews,
  setIsSideMenuOpen,
}: {
  authUser: User | null;
  isNews: boolean | undefined;
  setIsSideMenuOpen: (value: boolean) => void;
}) => {
  return (
    <nav className="flex flex-col items-center overflow-hidden bg-[#00000] px-4 py-4">
      <div className="mx-auto flex w-full items-center justify-between">
        <button className="" onClick={() => setIsSideMenuOpen(true)}>
          <span className="md:hidden">
            {/* <MenuIconClosed /> */}
            <Hamburger />
          </span>
        </button>

        <div className="absolute top-1/2 left-1/2 h-[40px] w-[120px] -translate-x-1/2 -translate-y-1/2 md:hidden">
          <Link href="/">
            <Image src={dashboard.logo} fill alt="logo" />
          </Link>
        </div>

        <div className="hidden items-center gap-2.5 md:flex">
          <Link href="/">
            <Image src={dashboard.logoV2} width={108} height={22} alt="logo" />
          </Link>

          {isNews && (
            <div className="py-1">
              <div className="rounded-[4px] bg-[#1F8B4C] px-3 py-1">
                <h2 className="font-inter text-xs font-normal text-white uppercase">
                  News
                </h2>
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
