import React, { ReactNode } from "react";
import { DexProvider, NotificationProvider, QueryProvider, SupabaseAuthProvider } from ".";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import { config } from "@/config/wagmi";

interface IProps {
  children: ReactNode;
}

export default async function GeneralProvider(props: IProps) {
  const { children } = props;

  const headersStore = await headers();
  const cookie = headersStore.get("cookie") ?? "";

  const initialState = cookieToInitialState(config, cookie);

  return (
    <DexProvider initialState={initialState}>
      <NuqsAdapter>
        <SupabaseAuthProvider>
          <NotificationProvider>{children}</NotificationProvider>
        </SupabaseAuthProvider>
      </NuqsAdapter>
    </DexProvider>
  );
}
