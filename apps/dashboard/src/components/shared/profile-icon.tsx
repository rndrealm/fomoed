import React from "react";
import { authUserAtom } from "@/lib/atoms/userAtom";
import { useAtomValue } from "jotai";
import { User } from "lucide-react";
import Image from "next/image";

export function ProfileIcon() {
  const user = useAtomValue(authUserAtom);
  const hasUser = !!user;

  return (
    <div className="w-full h-full flex items-center justify-center">
      {hasUser && user?.user_metadata?.avatar_url ? (
        <Image
          src={user.user_metadata.avatar_url}
          alt="User avatar"
          className="object-cover w-full"
          width={32}
          height={32}
        />
      ) : (
        <User className="text-white/70" />
      )}
    </div>
  );
}
