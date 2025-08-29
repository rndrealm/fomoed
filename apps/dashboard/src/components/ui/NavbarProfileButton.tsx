"use client";

import React, { ReactNode, useState } from "react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";

import NavbarProfileButtonTrigger from "./NavbarProfileButtonTrigger";
import { ProfileDropdown } from "../shared";
import { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import { UsersRow } from "@/lib/types/db.types";

interface IProps {
  children?: ReactNode;
  authUser: UsersRow | null;
  menuClassName?: string;
  buttonClassName?: string;
}

const NavbarProfileButton = (props: IProps) => {
  const { children, authUser, menuClassName, buttonClassName } = props;
  const [expanded, setExpanded] = useState(false);

  return (
    <DropdownMenu open={expanded} onOpenChange={setExpanded}>
      <DropdownMenuTrigger asChild className={buttonClassName}>
        <div>{children ? children : <NavbarProfileButtonTrigger user={authUser} />}</div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className={cn("border-0 bg-transparent px-0", menuClassName)}>
        {/* <ProfileDropdown /> */}
        <ProfileDropdown authUser={authUser} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NavbarProfileButton;
