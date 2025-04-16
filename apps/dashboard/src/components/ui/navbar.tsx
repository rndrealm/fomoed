import React from "react";
import ProfileButton from "./NavbarProfileButton";
import DashboardButton from "./dashboardButton";
import NewNavbarLogo from "./newNavbarLogo";

const Navbar: React.FC = () => {
    const navStyle = {
        borderBottom: "0.5px solid",
        borderImageSource: "linear-gradient(90deg, rgba(255, 59, 16, 0.75) 0%, rgba(243, 193, 17, 0.75) 100%)",
        borderImageSlice: "1",
    };

    return (
        <nav className="shadow-md px-4 -desktop:px-0 bg-[#131313] h-[80px] flex items-center" style={navStyle}>
            <div className="px-4 lg:px-12 mx-auto flex justify-between items-center w-full">
                {/* Logo section */}
                <div className="flex items-center">
                    <a href="/" className="">
                        <NewNavbarLogo />
                    </a>
                </div>

                {/* Navigation buttons */}
                <div className="flex items-center space-x-4">
                    <DashboardButton />
                    <ProfileButton />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
