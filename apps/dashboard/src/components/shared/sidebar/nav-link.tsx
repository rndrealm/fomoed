import React, { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import LinkPopup from "./nav-link-popup";
import { sideMenuVariants } from "./animations";
import { CommandIcon } from "@/components/icons/icons";
import { useSetAtom } from "jotai";
import { profilePopoverAtom } from "@/lib/atoms/profilePopover";

interface BadgeProps {
  text: string;
  borderColor: string;
  backgroundColor: string;
  textColor: string;
  isSideMenuOpen: boolean;
}

function StatusBadge({ text, borderColor, backgroundColor, textColor, isSideMenuOpen }: BadgeProps) {
  return (
    <motion.div
      className={`pointer-events-none mr-3 absolute top-1/2 right-0 hidden translate-y-[-50%] rounded-[8px] border-[1px] px-2 py-1 md:flex`}
      style={{ borderColor, backgroundColor }}
      initial="closed"
      variants={sideMenuVariants}
      animate={isSideMenuOpen ? "open" : "closed"}
    >
      <h3 className="text-xs font-normal text-nowrap" style={{ color: textColor }}>
        {text}
      </h3>
    </motion.div>
  );
}

export interface INavLink {
  label: string;
  href: string;
  icon: React.JSX.Element;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  comingSoon?: boolean;
  beta?: boolean;
  alpha?: boolean;
  keyboardBoxes?: string[];
}

interface INavLinkProps extends INavLink {
  variant: "passive" | "active";
  isSideMenuOpen?: boolean;
  isBottomLink?: boolean;
  setIsSideMenuOpen?: (value: boolean) => void;
}

export function NavLink(props: INavLinkProps) {
  const {
    href,
    label,
    icon,
    active,
    onClick,
    disabled,
    comingSoon,
    beta,
    alpha,
    keyboardBoxes,
    variant,
    isSideMenuOpen,
    isBottomLink,
    setIsSideMenuOpen,
  } = props;

  const setProfilePopoverAtom = useSetAtom(profilePopoverAtom);

  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // have the sidebar still hidden
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
      sidebar.style.overflow = "hidden";
    }

    if (disabled) {
      e.preventDefault();
      return;
    }

    if (isBottomLink) {
      setIsSideMenuOpen?.(false);
    }

    // settings popover
    if (label === "Settings") {
      setProfilePopoverAtom({ open: true, activeTab: "Subscriptions" });
    }

    onClick?.();
  };

  // Passive nav - only icon
  if (variant === "passive") {
    return (
      <Link
        id="popup-trigger-a"
        href={disabled ? "#" : href}
        onClick={handleClick}
        className={cn("w-[48px] flex items-center justify-center", {
          "pointer-events-none cursor-not-allowed opacity-50": disabled,
        })}
        aria-disabled={disabled}
      >
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
            "pointer-events-auto relative flex h-[40px] w-[40px] max-h-[40px] items-center justify-center rounded-[8px] px-0 py-2",
            isHovered && !disabled ? "bg-[#161616]" : "bg-[#0a0a0a]",
            active ? "bg-[#161616] border-[1px] border-[#242424]" : "border-none",
          )}
        >
          {/* icon can be hovered */}
          <div className="pointer-events-none flex items-center gap-3 pt-0 pb-0">
            {/* make the active icon white */}
            <div key={label}>
              {React.cloneElement(icon, {
                ...(active ? { fill: "#ffff" } : disabled ? { fill: "#838383" } : {}),
              })}
            </div>
          </div>

          {/* hover popup */}
          {isHovered && (
            <LinkPopup label={label} className="left-[48px]" beta={beta} alpha={alpha} comingSoon={comingSoon} />
          )}
        </div>
      </Link>
    );
  }

  // Active nav - full content
  return (
    <motion.div
      className={cn(
        "group relative flex max-h-[40px] items-center rounded-[8px] px-0 py-0 bg-transparent",
        isBottomLink
          ? "justify-start gap-2 bg-transparent"
          : active
            ? "justify-between bg-transparent"
            : disabled
              ? "justify-between bg-transparent"
              : "justify-between bg-transparent",
      )}
      initial="closed"
      variants={sideMenuVariants}
      animate={isSideMenuOpen ? "open" : "closed"}
    >
      {/* border */}
      <div className="absolute z-[-1] left-0 px-1 top-0 h-full w-full">
        <div
          className={cn(
            "h-full w-full rounded-[8px] bg-transparent border-[#242424]",
            isBottomLink
              ? "justify-start gap-2 bg-transparent border-[0px] border-[#242424] group-hover:bg-[#131313] group-hover:border-[0px] group-hover:border-[#242424]"
              : active
                ? "justify-between bg-[#161616] border-[1px] border-[#242424]"
                : disabled
                  ? "justify-between bg-transparent border-[0px] border-[#242424]"
                  : "justify-between bg-transparent group-hover:bg-[#131313] group-hover:border-[0px] group-hover:border-[#242424] border-[0px] border-[#242424]",
          )}
        ></div>
      </div>
      <Link
        href={disabled ? "#" : isBottomLink ? "#" : href}
        onClick={handleClick}
        className={cn("w-full py-0", {
          "pointer-events-none cursor-not-allowed opacity-50": disabled,
        })}
        aria-disabled={disabled || isBottomLink}
      >
        <div className="flex items-center gap-0 pt-0 pb-0">
          <div
            className={cn(
              "w-[48px] h-[40px] flex items-center justify-center",
              !active && !isBottomLink && "!opacity-100 md:!opacity-0 md:group-hover:!opacity-100",
              isBottomLink ? "!opacity-100" : "mt-[0px]",
            )}
          >
            <div
              key={label}
              className={cn(
                "h-[40px] w-[40px] flex items-center justify-center",
                disabled && "opacity-100 md:opacity-0",
                // "opacity-100",
              )}
            >
              {React.cloneElement(icon, {
                ...(active && { fill: "#fff" }),
              })}
            </div>
          </div>

          {/* link label */}
          <motion.p
            className={cn(
              "ml-[-6px] text-sm font-normal md:text-[14px]",
              isBottomLink
                ? "text-[#838383] group-hover:text-white"
                : active
                  ? "text-white"
                  : disabled
                    ? "text-[#838383]"
                    : "text-[#838383] group-hover:text-white",
            )}
            initial="closed"
            variants={sideMenuVariants}
            animate={isSideMenuOpen ? "open" : "closed"}
          >
            {label}
          </motion.p>

          {/* keyboard boxes */}
          <div className="absolute flex flex-row gap-1 right-3 top-1/2 translate-y-[-50%]">
            {keyboardBoxes &&
              keyboardBoxes.map((box, index) => {
                if (box === "command") {
                  return (
                    <div
                      key={index}
                      className="flex justify-center items-center px-1 py-1 rounded-[6px] bg-[#161616] border-[1px] border-[#242424]"
                    >
                      <CommandIcon fill="#A6AEB2" />
                    </div>
                  );
                }

                return (
                  <div
                    key={index}
                    className="flex justify-center items-center px-2 py-1 rounded-[6px] bg-[#161616] border-[1px] border-[#242424]"
                  >
                    <span className="text-xs text-[#A6AEB2] font-normal">{box}</span>
                  </div>
                );
              })}
          </div>
        </div>
      </Link>

      {comingSoon && !isBottomLink && (
        <StatusBadge
          text="Coming Soon"
          borderColor="#3A2C4F"
          backgroundColor="#2C233A"
          textColor="#C1A8FF"
          isSideMenuOpen={isSideMenuOpen || false}
        />
      )}

      {beta && !isBottomLink && (
        <StatusBadge
          text="BETA"
          borderColor="#2C4F3A"
          backgroundColor="#233A2C"
          textColor="#A8FFC1"
          isSideMenuOpen={isSideMenuOpen || false}
        />
      )}

      {alpha && !isBottomLink && (
        <StatusBadge
          text="ALPHA"
          borderColor="#4F3A2C"
          backgroundColor="#3A2C23"
          textColor="#FFC1A8"
          isSideMenuOpen={isSideMenuOpen || false}
        />
      )}
    </motion.div>
  );
}
