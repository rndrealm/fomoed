import { User } from "lucide-react";
import Image from "next/image";

const NavbarProfileButton = () => {
    // Hardcoded to false as requested
    const hasUser = false;

    return (
        <button
            className="size-[40px] aspect-square rounded-full grid place-items-center p-1"
            style={{
                background:
                    "radial-gradient(248.97% 177.44% at 50% -53.89%, #020100 18.5%, #631b06 39.5%, #8b2505 57.5%, #bd4618 80%, #f7984b 91.04%)",
            }}
        >
            <div className="border border-[#2B2B2B] bg-[#110F0E] rounded-full size-full grid place-items-center">
                {hasUser ? (
                    <Image
                        src="https://picsum.photos/200/200"
                        alt="User avatar"
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                    />
                ) : (
                    <User className="text-white/70" />
                )}
            </div>
        </button>
    );
};

export default NavbarProfileButton;
