"use client";

import Image from "next/image";

export default function Home() {
    return (
        <div className="grid place-items-center bg-[#0D0D0D] min-h-screen">
            <div className="flex flex-col items-center">
                <Image src="/branding/fomoed2.svg" alt="" width={300} height={150} />
            </div>
        </div>
    );
}
