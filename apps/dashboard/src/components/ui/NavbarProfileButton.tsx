"use client";

import React, { useState } from "react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import ProfileDropdown from "./ProfileDropdown";
import NavbarProfileButtonTrigger from "./NavbarProfileButtonTrigger";

const NavbarProfileButton: React.FC = () => {
    const [expanded, setExpanded] = useState(false);

    return (
        <DropdownMenu open={expanded} onOpenChange={setExpanded}>
            <DropdownMenuTrigger asChild>
                <div>
                    <NavbarProfileButtonTrigger />
                </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="bg-transparent border-0">
                <ProfileDropdown />
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default NavbarProfileButton;
