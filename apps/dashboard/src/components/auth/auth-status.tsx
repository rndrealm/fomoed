"use client";

import React from "react";
import { useSupabaseAuth } from "@/components/providers";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { Button } from "@/components/ui/button";

export function AuthStatus() {
  const { session, isLoading, signOut } = useSupabaseAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Spinner variant="circle" className="text-[rgb(255,59,16)]" size={24} />
        <span className="ml-2">Loading authentication status...</span>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-4 rounded-md bg-amber-50 text-amber-700">
        <p>You are not logged in.</p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-md bg-green-50 text-green-700">
      <p className="mb-2">
        {/* Logged in as: <strong>{user.email}</strong> */}
      </p>
      <Button
        variant="outline"
        onClick={() => signOut()}
        className="text-red-600 border-red-300 hover:bg-red-50"
      >
        Sign out
      </Button>
    </div>
  );
}
