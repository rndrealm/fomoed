import { MenuIconClosed, MenuIconOpened } from "@/components/icons/icons";
import Image from "next/image";
import { INavLink, NavLink } from "./nav-link";
import { sideMenuAnimProps, sideMenuVariants } from "./animations";
import { User } from "@supabase/supabase-js";
import { motion } from "motion/react";
import NavbarProfileButton from "@/components/ui/NavbarProfileButton";
import { ProfileIcon } from "../profile-icon";
import dashboard from "@/lib/assets/dashboard";

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
  const {
    navLinks,
    bottomLinks,
    isSideMenuOpen,
    setIsSideMenuOpen,
    isHovered,
    authUser,
  } = props;

  return (
    <div
      style={{ pointerEvents: isSideMenuOpen ? "all" : "none" }}
      className="font-inter absolute inset-0 z-50 flex h-full w-full min-w-[280px] flex-col items-center justify-between border-l-[0px] border-[#2A2A2A] bg-transparent py-4"
    >
      <div className="flex w-full flex-row items-center justify-between px-[10px]">
        <motion.button
          className="relative flex h-[32px] w-[32px] items-center justify-center"
          animate={{ x: isSideMenuOpen ? "8px" : 0 }}
          transition={{
            delay: 0.1,
            ease: sideMenuAnimProps.ease,
            duration: sideMenuAnimProps.duration,
          }}
        >
          <div
            style={{
              display: isHovered ? "flex" : "none",
            }}
            className="flex justify-center items-center h-full w-full"
          >
            <MenuIconClosed />
          </div>
          <div
            style={{
              display: isHovered ? "none" : "flex",
            }}
            className="flex justify-center items-center h-full w-full"
          >
            <Image
              height={32}
              width={32}
              src={dashboard.logoMobile}
              alt="logo"
            />
          </div>
        </motion.button>
        <motion.button
          onClick={() => setIsSideMenuOpen(false)}
          animate={{
            opacity: isSideMenuOpen ? 1 : 0,
            x: isSideMenuOpen ? "-8px" : 0,
          }}
          transition={{
            delay: 0.1,
            ease: sideMenuAnimProps.ease,
            duration: sideMenuAnimProps.duration,
          }}
        >
          <MenuIconOpened />
        </motion.button>
      </div>

      <div className="flex h-full w-full flex-col items-center justify-between px-2 py-14">
        <div className="flex w-full flex-col gap-2">
          {navLinks.map((item, index) => {
            return (
              <NavLink
                key={index}
                label={item.label}
                href={item.href}
                icon={item.icon}
                active={item.active}
                disabled={item.disabled}
                comingSoon={item.comingSoon}
                beta={item.beta}
                alpha={item.alpha}
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
        transition={sideMenuAnimProps}
        id="popup-trigger-div"
        className="flex w-full flex-row items-center gap-6.5 border-t-[1px] border-[#2E2E2E] px-[10px] pt-5"
      >
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: isSideMenuOpen ? "8px" : 0 }}
          transition={{
            delay: 0.1,
            ease: sideMenuAnimProps.ease,
            duration: sideMenuAnimProps.duration,
          }}
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
          <h3 className="text-[14px] font-normal text-white">
            {authUser?.user_metadata?.name}
          </h3>
          <h4 className="text-xs font-normal text-[#A4A4A4]">
            {authUser?.email}
          </h4>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ActiveNav;
