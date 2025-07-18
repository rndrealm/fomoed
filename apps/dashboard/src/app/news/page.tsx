import React, { Suspense } from "react";
import { NewsSection } from "./NewsSection";

export default async function Page() {

    return (
        <div className="bg-black pt-[64px] md:pt-[86px]">
            <div className="relative flex flex-col w-full h-full px-6">

                <div className="ml-11">
                    <Suspense>
                        <NewsSection />
                    </Suspense>
                </div>
            </div>

        </div>
    );
}
