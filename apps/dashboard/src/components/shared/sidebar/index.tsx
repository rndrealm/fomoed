import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { NavLink, INavLink } from "./nav-link";
import { User } from "@supabase/supabase-js";
import PassiveNav from "./passive-nav";
import ActiveNav from "./active-nav";
import { sideMenuAnimProps } from "./animations";

interface ISideNavProps {
  navLinks: INavLink[];
  bottomLinks: INavLink[];
  isSideMenuOpen: boolean;
  setIsSideMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  authUser: User | null;
}

const SideNav = (props: ISideNavProps) => {
  const { navLinks, bottomLinks, isSideMenuOpen, setIsSideMenuOpen, authUser } =
    props;
  const [isHovered, setIsHovered] = useState(false);

  // class that targets both active and passive nav container with likns (gap)
  const className = "gap-1";

  return (
    // sliding background
    <motion.div
      id="sidebar"
      className={cn(
        "fixed inset-0 z-[49] h-[100dvh] max-h-[100dvh] w-[292px] max-w-[292px] overflow-hidden rounded-none bg-[#0A0A0A] border-r-[1px] border-[#111111] p-0 opacity-100 font-inter",
        {
          "pointer-events-none opacity-0 md:pointer-events-auto md:opacity-100":
            !isSideMenuOpen,
        },
      )}
      initial={{ width: "64px" }}
      animate={{ width: isSideMenuOpen ? "292px" : "64px" }}
      transition={sideMenuAnimProps}
    >
      <PassiveNav
        navLinks={navLinks}
        setIsSideMenuOpen={setIsSideMenuOpen}
        setIsHovered={setIsHovered}
        authUser={authUser}
        className={className}
      />
      <ActiveNav
        navLinks={navLinks}
        bottomLinks={bottomLinks}
        isSideMenuOpen={isSideMenuOpen}
        setIsSideMenuOpen={setIsSideMenuOpen}
        isHovered={isHovered}
        authUser={authUser}
        className={className}
      />
    </motion.div>
  );
};

export default SideNav;
export { NavLink, type INavLink };
