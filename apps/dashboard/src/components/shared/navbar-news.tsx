"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import NavbarProfileButton from "../ui/NavbarProfileButton";
import dashboard from "@/lib/assets/dashboard";
import { NewsIcon, WidgetDashboardIcon, SmartSignalsIcon, CommunityIcon, HelpSupportIcon, HowToUseIcon, SettingsIcon, MenuIconClosed } from "../icons/icons";
import { AppRoutes } from "@/lib/routes";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ProfileIcon } from "./profile-icon";
import { utilsAtom } from "@/lib/atoms/utilsAtom";
import { useAtomValue } from "jotai";
import { RenderIf } from "./render-if";
import useAuthUserData from "@/lib/hooks/use-auth-user-data";
import { ModalContainer } from "./modal-container";
import { User } from "@supabase/supabase-js";
import SideNav from "./navbar-sidemenu";


const navLinks = [
    {
        label: "News",
        icon: <NewsIcon />,
        href: "/news",
    },
    {
        label: "Widget Dashboard",
        icon: <WidgetDashboardIcon />,
        href: AppRoutes.dashboard.path,
    },
    {
        label: "Smart Signals",
        icon: <SmartSignalsIcon />,
        href: AppRoutes.dashboard.path,
    },
    {
        label: "Community",
        icon: <CommunityIcon />,
        href: AppRoutes.dashboard.path,
    },

];

const bottomLinks = [
    {
        label: "Help & Support",
        icon: <HelpSupportIcon />,
        href: "https://app.fomoed.io/news"
    },
    {
        label: "How to use Fomoed",
        icon: <HowToUseIcon />,
        href: AppRoutes.dashboard.path,
    },
    {
        label: "Settings",
        icon: <SettingsIcon />,
        href: AppRoutes.dashboard.path,
    },

];


interface IProps {
    isNews?: boolean;
}

const NavigationTop = ({ authUser, setIsSideMenuOpen }: { authUser: User | null, setIsSideMenuOpen: (value: boolean) => void }) => {
    return (
        <div className="mx-auto flex w-full items-center justify-between">
            <button style={{ opacity: 0 }} onClick={() => setIsSideMenuOpen(true)}>
                <MenuIconClosed />
            </button>

            <div className="h-[24px] w-[24px] md:hidden">
                <Link href="/">
                    <Image src={dashboard.logoMobile} alt="logo" />
                </Link>
            </div>

            <div className="hidden items-center gap-2.5 md:flex">
                <Link href="/">
                    <Image src={dashboard.logo} alt="logo" />
                </Link>

                <div className="rounded-[4px] bg-[#1F8B4C] px-3 py-1">
                    <h2 className="text-xs font-normal font-inter text-white uppercase">News</h2>
                </div>

            </div>


            <div className="flex items-center gap-[10px]">

                <div className="flex h-[24px] w-[24px] cursor-pointer items-center justify-center overflow-hidden rounded-[5px] md:h-[32px] md:w-[32px]">
                    <NavbarProfileButton authUser={authUser}>
                        <ProfileIcon user={authUser} />
                    </NavbarProfileButton>
                </div>


            </div>

        </div>
    )
}

export const NavbarNews = (props: IProps) => {
    const { isNews = false } = props;
    const pathName = usePathname();
    const utils = useAtomValue(utilsAtom);

    const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
    const authUser = useAuthUserData();


    const logoRef = useRef<HTMLImageElement | null>(null);

    return (
        <nav className="flex flex-col items-center overflow-hidden border-b border-[#000000] bg-[#00000] px-2 py-3 sm:px-4 md:px-10 md:py-5">

            {/* Top Nav */}
            <NavigationTop authUser={authUser} setIsSideMenuOpen={setIsSideMenuOpen} />

            {/* Blur Layer */}
            <motion.div onClick={() => setIsSideMenuOpen(false)} className="fixed inset-0 z-40 
                    backdrop-blur-[4px] bg-[rgba(165,165,165,0.02)]"
                initial={{ opacity: 0 }}
                animate={{ pointerEvents: isSideMenuOpen ? "all" : "none", opacity: isSideMenuOpen ? 1 : 0 }}
                transition={{ duration: 0.25, ease: "linear" }}
            >
            </motion.div>

            {/* Side Nav */}
            <SideNav navLinks={navLinks} bottomLinks={bottomLinks} isSideMenuOpen={isSideMenuOpen} setIsSideMenuOpen={setIsSideMenuOpen} />

        </nav>
    );
};


