"use client";

import { ReactNode, useEffect } from "react";
import { useSetAtom } from "jotai";
import useSession from "@/lib/hooks/use-session";
import { authUserAtom, isLoadingUserAtom } from "@/lib/atoms/userAtom";

interface UserProviderProps {
    children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
    const session = useSession();
    const setAuthUser = useSetAtom(authUserAtom);
    const setIsLoadingUser = useSetAtom(isLoadingUserAtom);

    useEffect(() => {
        setIsLoadingUser(true);

        if (session) {
            setAuthUser(session.user);
        } else {
            setAuthUser(null);
        }

        setIsLoadingUser(false);
    }, [session, setAuthUser, setIsLoadingUser]);

    return <>{children}</>;
}
