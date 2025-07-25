import React, { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import LinkPopup from "./nav-link-popup";

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

export interface INavLink {
  label: string;
  href: string;
  icon: React.JSX.Element;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  comingSoon?: boolean;
}

interface INavLinkProps extends INavLink {
  variant: "passive" | "active";
  isSideMenuOpen?: boolean;
  isBottomLink?: boolean;
}

export function NavLink(props: INavLinkProps) {
  const { href, label, icon, active, onClick, disabled, comingSoon, variant, isSideMenuOpen, isBottomLink } = props;

  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    onClick?.();
  };

  // Passive nav - only icon
  if (variant === "passive") {
    return (
      <div
        onMouseEnter={() => {
          //in order to see the icons the sidebar element overflow needs to be visible
          const sidebar = document.getElementById("sidebar");
          if (sidebar) {
            sidebar.style.overflow = "visible";
          }
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          const sidebar = document.getElementById("sidebar");
          if (sidebar) {
            sidebar.style.overflow = "hidden";
          }
          setIsHovered(false);
        }}
        id="popup-trigger-div"
        className={cn(
          "pointer-events-auto relative flex max-h-[40px] items-center justify-center rounded-[10px] px-0 py-2",
          isHovered ? "bg-[#1A1A1A]" : "bg-[#000]"
        )}
      >
        {/* icon can be hovered */}
        <Link
          id="popup-trigger-a"
          href={disabled ? "#" : href}
          onClick={handleClick}
          className={cn("", {
            "pointer-events-none cursor-not-allowed opacity-50": disabled,
          })}
          aria-disabled={disabled}
        >
          <div className="pointer-events-none flex items-center gap-3 pt-0 pb-0">
            {/* make the active icon white */}
            <div key={label}>
              {React.cloneElement(icon, {
                ...(active && { color: "#fff" }),
              })}
            </div>
          </div>
        </Link>

        {/* hover popup */}
        {isHovered && <LinkPopup label={label} className="left-[42px]" />}
      </div>
    );
  }

  // Active nav - full content
  return (
    <motion.div
      className={cn(
        "relative flex max-h-[40px] items-center rounded-[10px] px-2 py-2",
        isBottomLink
          ? "justify-start gap-2 bg-[#000]"
          : active
            ? "justify-between bg-[#1A1A1A]"
            : "justify-between bg-transparent"
      )}
      initial="closed"
      variants={sideMenuVariants}
      animate={isSideMenuOpen ? "open" : "closed"}
    >
      <Link
        href={disabled ? "#" : href}
        onClick={handleClick}
        className={cn("w-full", {
          "pointer-events-none cursor-not-allowed opacity-50": disabled,
        })}
        aria-disabled={disabled}
      >
        <div className="flex items-center gap-3 pt-0 pb-0">
          <div
            className={cn(!active && !isBottomLink && "!opacity-100 md:!opacity-0", isBottomLink ? "" : "mt-[-2px]")}
            style={{ opacity: !isBottomLink && active ? 1 : isBottomLink ? 1 : 0 }}
          >
            <div key={label}>
              {React.cloneElement(icon, {
                ...(active && { color: "#fff" }),
              })}
            </div>
          </div>
          <motion.p
            className={cn(
              "text-sm font-normal md:text-[14px]",
              isBottomLink ? "text-[#838383]" : active ? "text-white" : "text-[#838383]"
            )}
            initial="closed"
            variants={sideMenuVariants}
            animate={isSideMenuOpen ? "open" : "closed"}
          >
            {label}
          </motion.p>
        </div>
      </Link>

      {comingSoon && !isBottomLink && (
        <motion.div
          className="absolute top-1/2 right-0 translate-y-[-50%] rounded-[8px] border-[1px] border-[#3A2C4F] bg-[#2C233A] px-2 py-1"
          initial="closed"
          variants={sideMenuVariants}
          animate={isSideMenuOpen ? "open" : "closed"}
        >
          <h3 className="text-xs font-normal text-nowrap text-[#C1A8FF]">Coming Soon</h3>
        </motion.div>
      )}
    </motion.div>
  );
}
