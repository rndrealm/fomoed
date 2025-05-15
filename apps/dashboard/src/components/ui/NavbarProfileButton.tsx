"use client";

import React, { ReactNode, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
// import ProfileDropdown from "./ProfileDropdown";
import NavbarProfileButtonTrigger from "./NavbarProfileButtonTrigger";
import { ProfileDropdown } from "../shared";

interface IProps {
  children?: ReactNode;
}

const NavbarProfileButton = (props: IProps) => {
  const { children } = props;
  const [expanded, setExpanded] = useState(false);

  return (
    <DropdownMenu open={expanded} onOpenChange={setExpanded}>
      <DropdownMenuTrigger asChild>
        <div>{children ? children : <NavbarProfileButtonTrigger />}</div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="bg-transparent border-0">
        {/* <ProfileDropdown /> */}
        <ProfileDropdown />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NavbarProfileButton;
