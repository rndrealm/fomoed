import React from "react";
import { User as UserIcon } from "lucide-react";
import Image from "next/image";
import { User } from "@supabase/supabase-js";

interface IProps {
  user: User | null;
}

export function ProfileIcon(props: IProps) {
  const { user } = props;
  const hasUser = !!user;

  return (
    <div className="flex h-full w-full items-start justify-start">
      {hasUser && user?.user_metadata?.avatar_url ? (
        <Image
          src={user.user_metadata.avatar_url}
          alt="User avatar"
          className="w-full object-cover"
          width={32}
          height={32}
        />
      ) : (
        <UserIcon className="text-white/70" />
      )}
    </div>
  );
}
