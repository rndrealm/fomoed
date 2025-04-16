"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { atom, useAtom } from "jotai";

const labelAtom = atom("");

export default function Home() {
    const [label, setLabel] = useAtom(labelAtom);

    return (
        <div className="grid place-items-center bg-[#0D0D0D] min-h-screen">
            <div className="flex flex-col items-center">
                <Image src="/branding/fomoed2.svg" alt="" width={300} height={150} />
                <Button className="mt-4" variant={"destructive"} onClick={() => setLabel("Yay!")}>
                    Start coding!
                </Button>
                {label && <p className="mt-2 text-white">{label}</p>}
            </div>
        </div>
    );
}
