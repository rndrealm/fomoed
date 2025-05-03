"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { authUserAtom, isLoadingUserAtom } from "@/lib/atoms/userAtom";
import { Loader2 } from "lucide-react";

export default function Home() {
    const authUser = useAtomValue(authUserAtom);
    const isLoadingUser = useAtomValue(isLoadingUserAtom);
    const router = useRouter();

    useEffect(() => {
        if (!authUser && !isLoadingUser) {
            router.replace("/login");
        } else if (authUser && !isLoadingUser) {
            router.replace("/dashboard");
        }
    }, [authUser, router, isLoadingUser]);

    return (
        <div className="grid place-items-center bg-[#0D0D0D] min-h-screen">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span>Loading...</span>
            </div>
        </div>
    );
}
