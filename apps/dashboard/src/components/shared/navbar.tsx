"use client";
import React from "react";
import Link from "next/link";
import DashboardButton from "../ui/dashboardButton";
import NavbarProfileButton from "../ui/NavbarProfileButton";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import { Dashboard, Misc, News, Notification } from "../icons/icons";
import { AppRoutes } from "@/lib/routes";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ProfileIcon } from "./profile-icon";

const links = [
  {
    id: 1,
    label: "Dashboard",
    icon: Dashboard,
    href: AppRoutes.dashboard.path,
  },
  { id: 2, label: "News", icon: News, href: AppRoutes.news.path },
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

export const Navbar = () => {
  const pathName = usePathname();

  return (
    <nav className="bg-[#0C0C0C] border-b border-[#161616] py-4 px-10 flex items-center">
      <div className="mx-auto flex justify-between items-center w-full">
        {/* Logo section */}
        <div className="flex items-center gap-10">
          <Link href="/">
            <Image src={dashboard.logo} alt="logo" />
          </Link>

          <div className="flex gap-4 items-center">
            {links.map((item) => {
              console.log(pathName);

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

        {/* Navigation buttons */}
        {/* <div className="flex items-center space-x-4">
          <DashboardButton />
          <NavbarProfileButton />
        </div> */}

        <div className="flex gap-2 items-center">
          <div className="w-[32px] h-[32px] border border-[#0b0b0b] rounded-md flex items-center justify-center">
            <Misc />
          </div>
          <div className="w-[32px] h-[32px] border border-[#444] rounded-md flex items-center justify-center">
            <Notification />
          </div>
          <div className="w-[32px] h-[32px] overflow-hidden rounded-md flex items-center justify-center cursor-pointer">
            <NavbarProfileButton>
              <ProfileIcon />
            </NavbarProfileButton>
          </div>
        </div>
      </div>
    </nav>
  );
};
