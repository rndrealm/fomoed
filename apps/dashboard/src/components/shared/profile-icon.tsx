import React from "react";
import { User as UserIcon } from "lucide-react";
import Image from "next/image";
import { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import { UsersRow } from "@/lib/types/db.types";
import { Database } from "@/lib/database/supabase";
import RemoteImage from "../widgets/shared/remote-image";

interface IProps {
  user: Database["public"]["Tables"]["users"]["Row"] | null | undefined;
  className?: string;
}

export function ProfileIcon(props: IProps) {
  const { user, className } = props;
  const hasUser = !!user;

  return (
    <div className="relative flex h-full w-full items-start justify-start">
      {hasUser && user?.avatar_url ? (
        <RemoteImage
          src={user?.avatar_url}
          alt="User avatar"
          className={cn("w-full h-full object-cover", className)}
          fill
        />
      ) : (
        <div className="relative flex h-full w-full items-center justify-center">
          <RemoteImage
            src="/media/images/auth/avatar1.png"
            alt="User avatar"
            className={cn("w-full h-full object-cover", className)}
            fill
          />
        </div>
      )}
    </div>
  );
}
