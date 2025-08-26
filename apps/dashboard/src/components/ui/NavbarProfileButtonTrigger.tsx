import { UsersRow } from "@/lib/types/db.types";
import { User } from "@supabase/supabase-js";
import { User as UserIcon } from "lucide-react";

interface IProps {
  user: UsersRow | null;
}

const NavbarProfileButton = (props: IProps) => {
  const { user } = props;
  const hasUser = !!user;
  return (
    <button
      className="grid aspect-square size-[40px] place-items-center rounded-full p-1"
      style={{
        background:
          "radial-gradient(248.97% 177.44% at 50% -53.89%, #020100 18.5%, #631b06 39.5%, #8b2505 57.5%, #bd4618 80%, #f7984b 91.04%)",
      }}
    >
      <div className="grid size-full place-items-center rounded-full border border-[#2B2B2B] bg-[#110F0E]">
        {hasUser && user?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatar_url}
            alt="User avatar"
            className="rounded-full object-cover"
          />
        ) : (
          <UserIcon className="text-white/70" />
        )}
      </div>
    </button>
  );
};

export default NavbarProfileButton;
