"use client";

import React, { ReactNode, useState } from "react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";

import NavbarProfileButtonTrigger from "./NavbarProfileButtonTrigger";
import { ProfileDropdown } from "../shared";
import { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";

interface IProps {
  children?: ReactNode;
  authUser: User | null;
  className?: string;
}

const NavbarProfileButton = (props: IProps) => {
  const { children, authUser, className } = props;
  const [expanded, setExpanded] = useState(false);

  return (
    <DropdownMenu open={expanded} onOpenChange={setExpanded}>
      <DropdownMenuTrigger asChild>
        <div>{children ? children : <NavbarProfileButtonTrigger user={authUser} />}</div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className={cn("border-0 bg-transparent px-0", className)}>
        {/* <ProfileDropdown /> */}
        <ProfileDropdown authUser={authUser} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NavbarProfileButton;
