import React, { Fragment } from "react";
import { SearchPopup } from "./SearchPopup";

export default async function Page() {
  return (
    <div className="bg-black pt-[86px]">
      <div className="relative flex flex-col w-full h-full px-6">
        <SearchPopup />
      </div>
    </div>
  );
}
