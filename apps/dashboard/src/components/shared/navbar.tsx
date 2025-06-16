"use client";
import React from "react";
import Link from "next/link";
import NavbarProfileButton from "../ui/NavbarProfileButton";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import { Dashboard, Hamburger, Misc, News, Notification } from "../icons/icons";
import { AppRoutes } from "@/lib/routes";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ProfileIcon } from "./profile-icon";
import { utilsAtom } from "@/lib/atoms/utilsAtom";
import { useAtomValue } from "jotai";
import { RenderIf } from "./render-if";

const links = [
  {
    id: 1,
    label: "Dashboard",
    icon: Dashboard,
    href: AppRoutes.dashboard.path,
  },
  { id: 2, label: "News", icon: News, href: "https://app.fomoed.io/news" },
];

interface INavLink {
  label: string;
  href: string;
  icon: React.JSX.Element;
  active: boolean;
}

function NavLink(props: INavLink) {
  const { href, label, icon, active } = props;
  return (
    <Link href={href}>
      <div className="flex items-center gap-2">
        {icon}
        <p
          className={cn(
            "leading-[1.35] text-base",
            active ? "text-white" : "text-[#9b9b9b]"
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

  return (
    <RenderIf condition={!utils.isFullScreen}>
      <nav className="bg-[#0C0C0C] border-b border-[#161616] py-3 px-4 md:px-10 md:py-4 flex items-center">
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
              <div className="w-[24px] h-[24px] md:w-[32px] md:h-[32px] overflow-hidden rounded-md flex items-center justify-center cursor-pointer">
                <NavbarProfileButton>
                  <ProfileIcon />
                </NavbarProfileButton>
              </div>

              <button type="button" className="w-[24px] h-[24px] md:hidden">
                <Hamburger />
              </button>
            </div>
          </RenderIf>
        </div>
      </nav>
    </RenderIf>
  );
};
