import React from "react";
import { User as UserIcon } from "lucide-react";
import Image from "next/image";
import { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import { UsersRow } from "@/lib/types/db.types";

interface IProps {
  user: UsersRow | null;
  className?: string;
}

export function ProfileIcon(props: IProps) {
  const { user, className } = props;
  const hasUser = !!user;

  return (
    <div className="flex h-full w-full items-start justify-start">
      {hasUser && user?.avatar_url ? (
        <Image
          src={user?.avatar_url}
          alt="User avatar"
          className={cn("w-full object-cover", className)}
          width={32}
          height={32}
        />
      ) : (
        <UserIcon className="text-white/70" />
      )}
    </div>
  );
}
