import React, { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import NavbarProfileButton from "../ui/NavbarProfileButton";
import dashboard from "@/lib/assets/dashboard";
import { MenuIconClosed, MenuIconOpened, StarSvg } from "../icons/icons";
import { cn } from "@/lib/utils";


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

interface INavLink {
    label: string;
    href: string;
    icon: React.JSX.Element;
    active?: boolean;
    onClick?: () => void;
    isSideMenuOpen?: boolean
}


function NavLink(props: INavLink) {
    const { href, label, icon, active, onClick, isSideMenuOpen } = props;
    return (
        <Link href={href} onClick={onClick}>
            <div className="flex items-center gap-3 pt-0 pb-0"
            >
                {icon}
            </div>
        </Link>
    );
}

const SideNav = ({ navLinks, bottomLinks, isSideMenuOpen, setIsSideMenuOpen }: { navLinks: INavLink[], bottomLinks: INavLink[], isSideMenuOpen: boolean, setIsSideMenuOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {

    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div className="fixed z-50 inset-0 max-w-[280px] w-[280px] rounded-none h-screen max-h-screen
                    p-0 overflow-hidden bg-[#000000]"
            initial={{ width: "52px" }}
            animate={{ width: isSideMenuOpen ? "280px" : "52px" }}
            transition={{ duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }}
        >

            <PassiveNav navLinks={navLinks} setIsSideMenuOpen={setIsSideMenuOpen} setIsHovered={setIsHovered} />
            <ActiveNav navLinks={navLinks} bottomLinks={bottomLinks} isSideMenuOpen={isSideMenuOpen} setIsSideMenuOpen={setIsSideMenuOpen} isHovered={isHovered} />

        </motion.div>
    )
}

const PassiveNav = ({ navLinks, setIsSideMenuOpen, setIsHovered }: { navLinks: INavLink[], setIsSideMenuOpen: (value: boolean) => void, setIsHovered: (value: boolean) => void }) => {
    return (
        <div className="z-50 relative border-l-[1px] border-[#2A2A2A] h-full w-full
                flex flex-col items-center justify-between py-[24px] font-inter max-w-[52px] bg-[#000000] pointer-events-auto
                "
            onClick={() => setIsSideMenuOpen(true)}
            onMouseEnter={() => {
                document.body.style.cursor = "pointer";
                setIsHovered(true)
            }}
            onMouseLeave={() => {
                document.body.style.cursor = "default";
                setIsHovered(false)
            }}

        >
            <div className="px-[10px] w-full flex flex-row items-center justify-between">
                <button style={{ opacity: 0 }}>

                    <Image height={32} width={32} src={dashboard.logoMobile} alt="logo" />
                </button>

            </div>

            <div className="h-full w-full flex flex-col justify-between items-center px-2 py-14">
                <div className="w-full flex flex-col gap-2">
                    {navLinks.map((item, index) => {
                        const active = item.label === "News";


                        if (item.label === "Community") {

                            return (
                                <div key={index} className={cn(
                                    "max-h-[40px] rounded-[10px] px-0 py-2 flex justify-center items-center",
                                    active ? "bg-[#1A1A1A]" : "bg-[#000]"
                                )}
                                >
                                    <NavLink

                                        label={item.label}
                                        href={item.href}
                                        icon={item.icon}
                                        active={active}
                                    />
                                </div>

                            );
                        }

                        return (
                            <div key={index} className={cn(
                                "max-h-[40px] rounded-[10px] px-0 py-2 flex justify-center items-center",
                            )}

                            >
                                <NavLink

                                    label={item.label}
                                    href={item.href}
                                    icon={item.icon}
                                    active={active}
                                />
                            </div>
                        );
                    })}
                </div>

            </div>
        </div>
    )
}

const ActiveNav = ({ navLinks, bottomLinks, isSideMenuOpen, setIsSideMenuOpen, isHovered }: { navLinks: INavLink[], bottomLinks: INavLink[], isSideMenuOpen: boolean, setIsSideMenuOpen: React.Dispatch<React.SetStateAction<boolean>>, isHovered: boolean }) => {

    return (
        <div

            style={{ pointerEvents: isSideMenuOpen ? "all" : "none" }}
            className="z-50 absolute inset-0 bg-transparent border-l-[1px] border-[#2A2A2A] h-full w-full
                flex flex-col items-center justify-between py-[24px] font-inter min-w-[280px]
                "

        >
            <div className="px-[10px] w-full flex flex-row items-center justify-between">
                <motion.button
                    className="h-[32px] w-[32px] flex justify-center items-center"
                    animate={{ x: isSideMenuOpen ? "14px" : 0 }}
                    transition={{ duration: 0.75, delay: 0, ease: [0.4, 0.0, 0.2, 1] }}

                >

                    {isHovered ?
                        <MenuIconClosed />
                        :
                        <Image height={32} width={32} src={dashboard.logoMobile} alt="logo" />
                    }

                </motion.button>
                <motion.button onClick={() => setIsSideMenuOpen(false)}
                    animate={{ x: isSideMenuOpen ? "-14px" : 0 }}
                    transition={{ duration: 0.75, delay: 0, ease: [0.4, 0.0, 0.2, 1] }}
                >

                    <MenuIconOpened />
                </motion.button>
            </div>

            <div className="h-full w-full flex flex-col justify-between items-center px-2 py-14">
                <div className="w-full flex flex-col gap-2">
                    {navLinks.map((item, index) => {
                        const active = item.label === "News";


                        if (item.label === "Community") {

                            return (

                                <div key={index} className={cn(
                                    "max-h-[36px] rounded-[10px] px-2 py-2 flex flex-row gap-2 justify-start items-center",
                                    active ? "bg-[#1A1A1A]" : "bg-transparent"
                                )}

                                >
                                    <Link href={item.href} >
                                        <div className="flex items-center gap-3 pt-0 pb-0"
                                        >
                                            <div style={{ opacity: 0 }}>
                                                {item.icon}

                                            </div>
                                            <motion.p
                                                className={cn(
                                                    "text-sm md:text-[14px] font-normal",
                                                    active ? "text-white" : "text-[#838383]"
                                                )}
                                                initial="closed"
                                                variants={sideMenuVariants}
                                                animate={isSideMenuOpen ? "open" : "closed"}

                                            >
                                                {item.label}
                                            </motion.p>
                                        </div>
                                    </Link>
                                    <motion.div className="bg-[#2C233A] rounded-[8px] px-2 py-1 border-[1px] border-[#3A2C4F]"
                                        initial="closed"
                                        variants={sideMenuVariants}
                                        animate={isSideMenuOpen ? "open" : "closed"}
                                    >
                                        <h3 className="text-[#C1A8FF] text-xs font-normal text-nowrap">Comming Soon</h3>
                                    </motion.div>
                                </div>
                            );
                        }

                        return (
                            <motion.div key={index} className={cn(
                                "max-h-[40px] rounded-[10px] px-2 py-2 flex justify-between items-center",
                                active ? "bg-[#1A1A1A]" : "bg-transparent"
                            )}
                                initial="closed"
                                variants={sideMenuVariants}
                                animate={isSideMenuOpen ? "open" : "closed"}
                            >
                                <Link href={item.href} >
                                    <div className="flex items-center gap-3 pt-0 pb-0"
                                    >
                                        <div className="mt-[-2px]" style={{ opacity: active ? 1 : 0 }}>
                                            {item.icon}

                                        </div>
                                        <motion.p
                                            className={cn(
                                                "text-sm md:text-[14px] font-normal",
                                                active ? "text-white" : "text-[#838383]"
                                            )}
                                            initial="closed"
                                            variants={sideMenuVariants}
                                            animate={isSideMenuOpen ? "open" : "closed"}
                                        >
                                            {item.label}
                                        </motion.p>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="w-full flex flex-col gap-2">
                    {bottomLinks.map((item, index) => {

                        return (
                            <motion.div key={index} className={cn(
                                "rounded-[10px] px-2 py-2 flex flex-row gap-2 justify-start items-center",
                                "bg-[#000]"
                            )}
                                initial="closed"
                                variants={sideMenuVariants}
                                animate={isSideMenuOpen ? "open" : "closed"}
                            >
                                <Link href={item.href} >
                                    <div className="flex items-center gap-3 pt-0 pb-0"
                                    >
                                        {item.icon}
                                        <motion.p
                                            className={cn(
                                                "text-sm md:text-[14px] font-normal",
                                                "text-[#838383]"
                                            )}
                                            initial="closed"
                                            variants={sideMenuVariants}
                                            animate={isSideMenuOpen ? "open" : "closed"}

                                        >
                                            {item.label}
                                        </motion.p>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            <motion.div className="w-full flex flex-row gap-5 border-t-[1px] border-[#2E2E2E] px-6 pt-5"
                initial="closed"
                variants={sideMenuVariants}
                animate={isSideMenuOpen ? "open" : "closed"}

            >
                <div className="h-full flex justify-center items-center">
                    <StarSvg ></StarSvg>
                </div>
                <div className="flex flex-col gap-2">
                    <h3 className="text-white text-[14px] font-normal">View Plans</h3>

                    <h4 className="text-[#A4A4A4] text-xs font-normal">Unlimited plans and widgets</h4>
                </div>
            </motion.div>

        </div>
    )
}

export default SideNav