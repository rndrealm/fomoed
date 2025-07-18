import React from "react";
import { NewsSection } from "./NewsSection";

export default async function Page() {

    return (
        <div className="bg-black pt-[86px]">
            <div className="flex flex-col w-full h-full px-6">

                <div className="relative ml-10">
                    <NewsSection />
                </div>
            </div>

        </div>
    );
}
