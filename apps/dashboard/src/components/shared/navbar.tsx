"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import NavbarProfileButton from "../ui/NavbarProfileButton";
import dashboard from "@/lib/assets/dashboard";
import { Close, Dashboard, Hamburger, News, Signals } from "../icons/icons";
import { AppRoutes } from "@/lib/routes";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ProfileIcon } from "./profile-icon";
import { utilsAtom } from "@/lib/atoms/utilsAtom";
import { useAtomValue } from "jotai";
import { RenderIf } from "./render-if";
import SignalNotificationsPopover from "../signals/signal-notifications";

const links = [
  {
    id: 1,
    label: "Dashboard",
    icon: Dashboard,
    href: AppRoutes.dashboard.path,
  },
  { id: 2, label: "News", icon: News, href: "https://app.fomoed.io/news" },
  { id: 3, label: "Signals", icon: Signals, href: AppRoutes.signals.path },
];

interface INavLink {
  label: string;
  href: string;
  icon: React.JSX.Element;
  active: boolean;
  onClick?: () => void;
}

function NavLink(props: INavLink) {
  const { href, label, icon, active, onClick } = props;
  return (
    <Link href={href} onClick={onClick}>
      <div className="flex items-center gap-2 pt-[6px] pb-[10px] md:pt-0 md:pb-0">
        {icon}
        <p
          className={cn(
            "leading-[1.35] text-sm md:text-base",
            active ? "text-white" : "md:text-[#9b9b9b] text-[#5F5F5F]",
          )}
        >
          {label}
        </p>
      </div>
    </Link>
  );
}

interface IProps {
  isNews?: boolean;
}

export const Navbar = (props: IProps) => {
  const { isNews = false } = props;
  const pathName = usePathname();
  const utils = useAtomValue(utilsAtom);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <RenderIf condition={!utils.isFullScreen}>
      <nav className="bg-[#0C0C0C] border-b border-[#161616] py-3 px-4 md:px-10 md:py-4 flex flex-col items-center overflow-hidden">
        <div className="flex items-center justify-between w-full mx-auto">
          <div className="w-[24px] h-[24px] md:hidden">
            <Link href="/">
              <Image src={dashboard.logoMobile} alt="logo" />
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-10">
            <Link href="/">
              <Image src={dashboard.logo} alt="logo" />
            </Link>

            <div className="flex items-center gap-4">
              {links.map((item) => {
                const active = pathName === item.href;
                return (
                  <NavLink
                    key={item.id}
                    label={item.label}
                    href={item.href}
                    icon={<item.icon active={active} />}
                    active={active}
                  />
                );
              })}
            </div>
          </div>

          <RenderIf condition={!isNews}>
            <div className="flex items-center gap-[10px]">
              {/* <div className="w-[32px] h-[32px] border border-[#0b0b0b] rounded-md flex items-center justify-center">
              <Misc />
            </div> */}
              {/* <div className="w-[32px] h-[32px] border border-[#444] rounded-md flex items-center justify-center">
              <Notification />
            </div> */}
              <div className="w-[32px] h-[32px] overflow-hidden rounded-md flex items-center justify-center cursor-pointer">
                <SignalNotificationsPopover />
              </div>

              <div className="w-[24px] h-[24px] md:w-[32px] md:h-[32px] overflow-hidden rounded-md flex items-center justify-center cursor-pointer">
                <NavbarProfileButton>
                  <ProfileIcon />
                </NavbarProfileButton>
              </div>

              <button
                type="button"
                className="w-[24px] h-[24px] md:hidden"
                onClick={() => {
                  setIsMenuOpen(!isMenuOpen);
                }}
              >
                <RenderIf condition={!isMenuOpen}>
                  <Hamburger />
                </RenderIf>

                <RenderIf condition={isMenuOpen}>
                  <Close fill="#5F5F5F" />
                </RenderIf>
              </button>
            </div>
          </RenderIf>
        </div>

        <motion.div
          className="w-full overflow-hidden h-[0]"
          animate={{
            height: !isMenuOpen ? 0 : "unset",
            transition: {
              ease: [0.645, 0.045, 0.355, 1.0],
            },
          }}
        >
          <div className="flex flex-col gap-1 pb-4 mt-6">
            {links.map((item) => {
              const active = pathName === item.href;
              return (
                <NavLink
                  key={item.id}
                  label={item.label}
                  href={item.href}
                  icon={<item.icon active={active} />}
                  active={active}
                  onClick={() => {
                    setIsMenuOpen(false);
                  }}
                />
              );
            })}
          </div>
        </motion.div>
      </nav>
    </RenderIf>
  );
};
