"use client";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import FomoedIcon from "../icons/FomoedIcon";
import NavBarDashboardIcon from "../icons/NavBarDashboardIcon";
import NavBarNewsIcon from "../icons/NavBarNewsIcon";
import NavBarSignalsIcon from "../icons/NavBarSignalsIcon";
import NavbarProfileButton from "../ui/NavbarProfileButton";
import { ProfileIcon } from "./profile-icon";
import { Notification } from "../icons/icons";
import SignalNotificationsPopover from "../signals/signal-notifications";

const links = [
  {
    name: "Dashboard",
    icon: <NavBarDashboardIcon />,
    path: "/dashboard",
  },
  {
    name: "News",
    icon: <NavBarNewsIcon />,
    path: "/news",
  },
  {
    name: "Signals",
    icon: <NavBarSignalsIcon />,
    path: "/signals",
  },
];

const NavBar = () => {
  const path = usePathname();
  return (
    <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[590px] h-[60px] mx-auto mt-4 p-[0.4px] rounded-[15px] nav-bar-gradient">
      <div className="flex items-center h-full w-full rounded-[15px] bg-black px-6 py-3.5">
        <FomoedIcon />
        <div className="flex items-center gap-4 ml-6">
          {links.map((link) => (
            <a
              href={link.path}
              key={link.name}
              className={cn(
                "flex items-center gap-2 text-xs sm:text-sm font-medium text-white",
                path.startsWith(link.path) ? "text-white" : "text-[#737373]"
              )}
            >
              {link.icon}
              <span className="font-medium">{link.name}</span>
            </a>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="w-[32px] h-[32px] overflow-hidden rounded-md flex items-center justify-center cursor-pointer">
            <SignalNotificationsPopover />
          </div>
          <div className="w-[32px] h-[32px] overflow-hidden rounded-md flex items-center justify-center cursor-pointer">
            <NavbarProfileButton>
              <ProfileIcon />
            </NavbarProfileButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
