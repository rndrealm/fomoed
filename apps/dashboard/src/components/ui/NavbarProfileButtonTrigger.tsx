import { User } from "lucide-react";
import { useAtomValue } from "jotai";
import { authUserAtom } from "@/lib/atoms/userAtom";
import { useEffect } from "react";

const NavbarProfileButton = () => {
    const user = useAtomValue(authUserAtom);
    const hasUser = !!user;

    useEffect(() => {
        console.log("User value changed:", user);
    }, [user]);

    return (
        <button
            className="size-[40px] aspect-square rounded-full grid place-items-center p-1"
            style={{
                background:
                    "radial-gradient(248.97% 177.44% at 50% -53.89%, #020100 18.5%, #631b06 39.5%, #8b2505 57.5%, #bd4618 80%, #f7984b 91.04%)",
            }}
        >
            <div className="border border-[#2B2B2B] bg-[#110F0E] rounded-full size-full grid place-items-center">
                {hasUser && user?.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="User avatar" className="rounded-full object-cover" />
                ) : (
                    <User className="text-white/70" />
                )}
            </div>
        </button>
    );
};

export default NavbarProfileButton;
