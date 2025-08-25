import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { NavLink, INavLink } from "./nav-link";
import { User } from "@supabase/supabase-js";
import PassiveNav from "./passive-nav";
import ActiveNav from "./active-nav";
import { sideMenuAnimProps } from "./animations";
import { UsersRow } from "@/lib/types/db.types";

interface ISideNavProps {
  navLinks: INavLink[];
  bottomLinks: INavLink[];
  isSideMenuOpen: boolean;
  setIsSideMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  authUser: UsersRow | null;
}

const SideNav = (props: ISideNavProps) => {
  const { navLinks, bottomLinks, isSideMenuOpen, setIsSideMenuOpen, authUser } =
    props;
  const [isHovered, setIsHovered] = useState(false);

  return (
    // sliding background
    <motion.div
      id="sidebar"
      className={cn(
        "fixed inset-0 z-[49] h-screen max-h-screen w-[280px] max-w-[280px] overflow-hidden rounded-none bg-[#000000] border-r-[1px] border-[#2A2A2A] p-0 opacity-100 font-inter",
        {
          "pointer-events-none opacity-0 md:pointer-events-auto md:opacity-100":
            !isSideMenuOpen,
        },
      )}
      initial={{ width: "54px" }}
      animate={{ width: isSideMenuOpen ? "282px" : "54px" }}
      transition={sideMenuAnimProps}
    >
      <PassiveNav
        navLinks={navLinks}
        setIsSideMenuOpen={setIsSideMenuOpen}
        setIsHovered={setIsHovered}
        authUser={authUser}
      />
      <ActiveNav
        navLinks={navLinks}
        bottomLinks={bottomLinks}
        isSideMenuOpen={isSideMenuOpen}
        setIsSideMenuOpen={setIsSideMenuOpen}
        isHovered={isHovered}
        authUser={authUser}
      />
    </motion.div>
  );
};

export default SideNav;
export { NavLink, type INavLink };
