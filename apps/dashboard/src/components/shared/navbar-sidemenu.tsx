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
  isSideMenuOpen?: boolean;
}

function NavLink(props: INavLink) {
  const { href, label, icon, active, onClick, isSideMenuOpen } = props;
  return (
    <Link href={href} onClick={onClick}>
      <div className="flex items-center gap-3 pt-0 pb-0">{icon}</div>
    </Link>
  );
}

const SideNav = ({
  navLinks,
  bottomLinks,
  isSideMenuOpen,
  setIsSideMenuOpen,
}: {
  navLinks: INavLink[];
  bottomLinks: INavLink[];
  isSideMenuOpen: boolean;
  setIsSideMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="fixed inset-0 z-50 h-screen max-h-screen w-[280px] max-w-[280px] overflow-hidden rounded-none bg-[#000000] p-0"
      initial={{ width: "52px" }}
      animate={{ width: isSideMenuOpen ? "280px" : "52px" }}
      transition={{ duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }}
    >
      <PassiveNav navLinks={navLinks} setIsSideMenuOpen={setIsSideMenuOpen} setIsHovered={setIsHovered} />
      <ActiveNav
        navLinks={navLinks}
        bottomLinks={bottomLinks}
        isSideMenuOpen={isSideMenuOpen}
        setIsSideMenuOpen={setIsSideMenuOpen}
        isHovered={isHovered}
      />
    </motion.div>
  );
};

const PassiveNav = ({
  navLinks,
  setIsSideMenuOpen,
  setIsHovered,
}: {
  navLinks: INavLink[];
  setIsSideMenuOpen: (value: boolean) => void;
  setIsHovered: (value: boolean) => void;
}) => {
  return (
    <div
      className="font-inter pointer-events-auto relative z-50 flex h-full w-full max-w-[52px] flex-col items-center justify-between border-l-[1px] border-[#2A2A2A] bg-[#000000] py-[24px]"
      onClick={() => setIsSideMenuOpen(true)}
      onMouseEnter={() => {
        document.body.style.cursor = "pointer";
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        document.body.style.cursor = "default";
        setIsHovered(false);
      }}
    >
      <div className="flex w-full flex-row items-center justify-between px-[10px]">
        <button style={{ opacity: 0 }}>
          <Image height={32} width={32} src={dashboard.logoMobile} alt="logo" />
        </button>
      </div>

      <div className="flex h-full w-full flex-col items-center justify-between px-2 py-14">
        <div className="flex w-full flex-col gap-2">
          {navLinks.map((item, index) => {
            const active = item.label === "News";

            if (item.label === "Community") {
              return (
                <div
                  key={index}
                  className={cn(
                    "flex max-h-[40px] items-center justify-center rounded-[10px] px-0 py-2",
                    active ? "bg-[#1A1A1A]" : "bg-[#000]"
                  )}
                >
                  <NavLink label={item.label} href={item.href} icon={item.icon} active={active} />
                </div>
              );
            }

            return (
              <div key={index} className={cn("flex max-h-[40px] items-center justify-center rounded-[10px] px-0 py-2")}>
                <NavLink label={item.label} href={item.href} icon={item.icon} active={active} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ActiveNav = ({
  navLinks,
  bottomLinks,
  isSideMenuOpen,
  setIsSideMenuOpen,
  isHovered,
}: {
  navLinks: INavLink[];
  bottomLinks: INavLink[];
  isSideMenuOpen: boolean;
  setIsSideMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isHovered: boolean;
}) => {
  return (
    <div
      style={{ pointerEvents: isSideMenuOpen ? "all" : "none" }}
      className="font-inter absolute inset-0 z-50 flex h-full w-full min-w-[280px] flex-col items-center justify-between border-l-[1px] border-[#2A2A2A] bg-transparent py-[24px]"
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
          animate={{ x: isSideMenuOpen ? "-14px" : 0 }}
          transition={{ duration: 0.75, delay: 0, ease: [0.4, 0.0, 0.2, 1] }}
        >
          <MenuIconOpened />
        </motion.button>
      </div>

      <div className="flex h-full w-full flex-col items-center justify-between px-2 py-14">
        <div className="flex w-full flex-col gap-2">
          {navLinks.map((item, index) => {
            const active = item.label === "News";

            if (item.label === "Community") {
              return (
                <motion.div
                  key={index}
                  className={cn(
                    "flex max-h-[40px] items-center justify-between rounded-[10px] px-2 py-2",
                    active ? "bg-[#1A1A1A]" : "bg-transparent"
                  )}
                  initial="closed"
                  variants={sideMenuVariants}
                  animate={isSideMenuOpen ? "open" : "closed"}
                >
                  <Link href={item.href}>
                    <div className="flex items-center gap-3 pt-0 pb-0">
                      <div style={{ opacity: 0 }}>{item.icon}</div>
                      <motion.p
                        className={cn("text-sm font-normal md:text-[14px]", active ? "text-white" : "text-[#838383]")}
                        initial="closed"
                        variants={sideMenuVariants}
                        animate={isSideMenuOpen ? "open" : "closed"}
                      >
                        {item.label}
                      </motion.p>
                    </div>
                  </Link>
                  <motion.div
                    className="rounded-[8px] border-[1px] border-[#3A2C4F] bg-[#2C233A] px-2 py-1"
                    initial="closed"
                    variants={sideMenuVariants}
                    animate={isSideMenuOpen ? "open" : "closed"}
                  >
                    <h3 className="text-xs font-normal text-nowrap text-[#C1A8FF]">Comming Soon</h3>
                  </motion.div>
                </motion.div>
              );
            }

            return (
              <motion.div
                key={index}
                className={cn(
                  "flex max-h-[40px] items-center justify-between rounded-[10px] px-2 py-2",
                  active ? "bg-[#1A1A1A]" : "bg-transparent"
                )}
                initial="closed"
                variants={sideMenuVariants}
                animate={isSideMenuOpen ? "open" : "closed"}
              >
                <Link href={item.href}>
                  <div className="flex items-center gap-3 pt-0 pb-0">
                    <div className="mt-[-2px]" style={{ opacity: active ? 1 : 0 }}>
                      {item.icon}
                    </div>
                    <motion.p
                      className={cn("text-sm font-normal md:text-[14px]", active ? "text-white" : "text-[#838383]")}
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

        <div className="flex w-full flex-col gap-2">
          {bottomLinks.map((item, index) => {
            return (
              <motion.div
                key={index}
                className={cn("flex flex-row items-center justify-start gap-2 rounded-[10px] px-2 py-2", "bg-[#000]")}
                initial="closed"
                variants={sideMenuVariants}
                animate={isSideMenuOpen ? "open" : "closed"}
              >
                <Link href={item.href}>
                  <div className="flex items-center gap-3 pt-0 pb-0">
                    {item.icon}
                    <motion.p
                      className={cn("text-sm font-normal md:text-[14px]", "text-[#838383]")}
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

      <motion.div
        className="flex w-full flex-row gap-5 border-t-[1px] border-[#2E2E2E] px-6 pt-5"
        initial="closed"
        variants={sideMenuVariants}
        animate={isSideMenuOpen ? "open" : "closed"}
      >
        <div className="flex h-full items-center justify-center">
          <StarSvg></StarSvg>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-[14px] font-normal text-white">View Plans</h3>

          <h4 className="text-xs font-normal text-[#A4A4A4]">Unlimited plans and widgets</h4>
        </div>
      </motion.div>
    </div>
  );
};

export default SideNav;
