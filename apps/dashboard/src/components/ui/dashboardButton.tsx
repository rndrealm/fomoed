import React from "react";
import Link from "next/link";
import DashboardIcon from "../icons/DashboardIcon";

const DashboardButton: React.FC = () => {
    return (
        <Link
            href="/"
            className={`
            px-4 h-[40px] transition-colors rounded-full border
            border-[#2B2B2B] font-inter font-semibold inline-flex
            items-center gap-x-2 text-sm text-white`}
        >
            <DashboardIcon />

            <div className="-desktop:hidden">Dashboard</div>
        </Link>
    );
};

export default DashboardButton;
