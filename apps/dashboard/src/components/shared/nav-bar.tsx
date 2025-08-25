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
import useUserData from "@/lib/hooks/use-user-data";

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
  const authUser = useUserData();
  return (
    <div className="nav-bar-gradient fixed top-0 left-1/2 mx-auto mt-4 h-[60px] w-full max-w-[590px] -translate-x-1/2 rounded-[15px] p-[0.4px]">
      <div className="flex h-full w-full items-center rounded-[15px] bg-black px-6 py-3.5">
        <FomoedIcon />
        <div className="ml-6 flex items-center gap-4">
          {links.map((link) => (
            <a
              href={link.path}
              key={link.name}
              className={cn(
                "flex items-center gap-2 text-xs font-medium text-white sm:text-sm",
                path.startsWith(link.path) ? "text-white" : "text-[#737373]",
              )}
            >
              {link.icon}
              <span className="font-medium">{link.name}</span>
            </a>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="flex h-[32px] w-[32px] cursor-pointer items-center justify-center overflow-hidden rounded-md">
            <SignalNotificationsPopover />
          </div>
          <div className="flex h-[32px] w-[32px] cursor-pointer items-center justify-center overflow-hidden rounded-md">
            <NavbarProfileButton authUser={authUser}>
              <ProfileIcon user={authUser} />
            </NavbarProfileButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
