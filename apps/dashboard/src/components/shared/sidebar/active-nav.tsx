import { MenuIconClosed, MenuIconOpened, SideBarClosedIcon, SideBarOpenIcon } from "@/components/icons/icons";
import Image from "next/image";
import { INavLink, NavLink } from "./nav-link";
import { sideMenuAnimProps, sideMenuVariants } from "./animations";
import { motion } from "motion/react";
import NavbarProfileButton from "@/components/ui/NavbarProfileButton";
import { ProfileIcon } from "../profile-icon";
import dashboard from "@/lib/assets/dashboard";
import { cn } from "@/lib/utils";
import { UsersRow } from "@/lib/types/db.types";

interface IActiveNavProps {
  navLinks: INavLink[];
  bottomLinks: INavLink[];
  isSideMenuOpen: boolean;
  setIsSideMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isHovered: boolean;
  authUser: UsersRow | null;
  className?: string;
}

// This component renders the active navigation when the side menu is open.
const ActiveNav = (props: IActiveNavProps) => {
  const { navLinks, bottomLinks, isSideMenuOpen, setIsSideMenuOpen, isHovered, authUser, className } = props;

  return (
    <div
      style={{ pointerEvents: isSideMenuOpen ? "all" : "none" }}
      className="font-inter absolute left-[0px] inset-0 z-50 flex h-full w-full min-w-[292px] flex-col items-center justify-between border-l-[0px] border-[#2A2A2A] bg-transparent py-0"
    >
      <div
        style={{ borderColor: isHovered ? "transparent" : "#111111" }}
        className="max-h-[63px] border-b-[1px] border-[#111111] box-content flex w-full flex-row items-center justify-between px-[0px]"
      >
        <motion.button
          className="relative flex h-[64px] w-[64px] items-center justify-center"
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
            <SideBarClosedIcon />
          </div>
          <div
            style={{
              display: isHovered ? "none" : "flex",
            }}
            className="flex justify-center items-center h-full w-full"
          >
            <RectFomoedLogo />
            {/* <Image
              height={32}
              width={32}
              src={dashboard.logoMobile}
              alt="logo"
            /> */}
          </div>
        </motion.button>
        <motion.button
          onClick={() => setIsSideMenuOpen(false)}
          animate={{
            opacity: isSideMenuOpen ? 1 : 0,
            x: isSideMenuOpen ? "-8px" : 0,
          }}
          className="relative flex h-[64px] w-[64px] items-center justify-center"
          transition={{
            delay: 0.1,
            ease: sideMenuAnimProps.ease,
            duration: sideMenuAnimProps.duration,
          }}
        >
          <SideBarOpenIcon />
        </motion.button>
      </div>

      <div className="flex h-full w-full flex-col items-center justify-between px-2 py-14">
        {/* top links */}
        <div className={cn("flex w-full flex-col gap-2", className)}>
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
                keyboardBoxes={item.keyboardBoxes}
                beta={item.beta}
                alpha={item.alpha}
                variant="active"
                isSideMenuOpen={isSideMenuOpen}
              />
            );
          })}
        </div>

        {/* bottom links */}
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
          borderTopColor: isSideMenuOpen ? "#111111" : "#111111",
        }}
        transition={sideMenuAnimProps}
        className="pointer-events-none flex w-full flex-row min-h-[64px] items-center gap-3 border-t-[1px] border-[#111111] px-[0px] pt-0"
      >
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: isSideMenuOpen ? "8px" : 0 }}
          transition={{
            delay: 0.1,
            ease: sideMenuAnimProps.ease,
            duration: sideMenuAnimProps.duration,
          }}
          className="flex h-[24px] w-[24px] mx-[18px] md:mx-[0px] md:h-[64px] md:w-[64px] cursor-pointer items-center justify-center overflow-hidden rounded-[4px]"
        >
          <NavbarProfileButton
            authUser={authUser}
            buttonClassName="pointer-events-auto"
            menuClassName="pr-0 pb-2.5 pl-3"
          >
            <ProfileIcon user={authUser} />
          </NavbarProfileButton>
        </motion.div>

        <motion.div
          initial="closed"
          variants={sideMenuVariants}
          animate={isSideMenuOpen ? "open" : "closed"}
          className="flex flex-col gap-1"
        >
          <h3 className="text-[14px] font-normal text-white">{authUser?.username}</h3>
          <h4 className="text-xs font-normal text-[#A4A4A4]">{authUser?.email}</h4>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ActiveNav;

const RectFomoedLogo = () => {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#filter0_i_478_104359)">
        <rect width="32" height="32" fill="url(#paint0_radial_478_104359)" />
      </g>
      <mask id="mask0_478_104359" mask-type="alpha" maskUnits="userSpaceOnUse" x="-1" y="0" width="33" height="32">
        <rect x="-0.0078125" width="32" height="32" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_478_104359)">
        <g filter="url(#filter1_f_478_104359)">
          <ellipse cx="15.9959" cy="-1.60047" rx="12.16" ry="2.88" fill="#BF340A" fillOpacity="0.5" />
        </g>
      </g>
      <g filter="url(#filter2_d_478_104359)">
        <path
          d="M22.2607 8.62134L21.2081 8.45463C18.9441 8.09604 16.818 9.64072 16.4594 11.9048L15.0731 20.6576C14.7145 22.9217 12.5884 24.4664 10.3243 24.1078L9.60417 23.9937"
          stroke="white"
          strokeWidth="2.69224"
        />
        <path d="M12.1797 13.7295L19.6584 14.914" stroke="white" strokeWidth="2.69224" />
        <path
          d="M17.3047 14.877L16.8835 17.536C16.8835 17.536 17.0111 16.7304 17.7252 16.3317C18.3942 15.9581 19.4122 16.2708 19.4122 16.2708L19.576 15.2367L17.3047 14.877Z"
          fill="white"
          stroke="white"
          strokeWidth="0.112177"
        />
      </g>
      <defs>
        <filter
          id="filter0_i_478_104359"
          x="0"
          y="-3.84"
          width="32"
          height="35.84"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="-5.12" />
          <feGaussianBlur stdDeviation="1.92" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.921569 0 0 0 0 0.584314 0 0 0 0 0.333333 0 0 0 0.3 0" />
          <feBlend mode="normal" in2="shape" result="effect1_innerShadow_478_104359" />
        </filter>
        <filter
          id="filter1_f_478_104359"
          x="-4.61206"
          y="-12.9285"
          width="41.2158"
          height="22.6558"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="4.224" result="effect1_foregroundBlur_478_104359" />
        </filter>
        <filter
          id="filter2_d_478_104359"
          x="9.1692"
          y="7.05664"
          width="13.9751"
          height="19.571"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="0.224353" dy="0.67306" />
          <feGaussianBlur stdDeviation="0.224353" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_478_104359" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_478_104359" result="shape" />
        </filter>
        <radialGradient
          id="paint0_radial_478_104359"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(16 6.15384) rotate(90) scale(28.3077 39.7201)"
        >
          <stop offset="0.339415" stopColor="#020100" />
          <stop offset="0.631104" stopColor="#631B06" />
          <stop offset="0.719585" stopColor="#8B2505" />
          <stop offset="0.835125" stopColor="#BD4618" />
          <stop offset="0.91044" stopColor="#F7984B" />
        </radialGradient>
      </defs>
    </svg>
  );
};
