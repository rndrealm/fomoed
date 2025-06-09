import NavBar from "@/components/shared/nav-bar";
import React from "react";

type Props = {
  children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  return (
    <div className="w-full pt-14 bg-black min-h-screen p-2 h-full dark text-white">
      <NavBar />

      <div className="w-full max-w-7xl mx-auto mt-10">
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
