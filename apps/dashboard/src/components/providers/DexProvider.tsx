"use client";

import React, { ReactNode } from "react";
import { config, projectId } from "@/config/wagmi";

import { State, WagmiProvider } from "wagmi";
import { darkTheme, RainbowKitProvider, Theme } from "@rainbow-me/rainbowkit";
import merge from "lodash.merge";

if (!projectId) throw new Error("Project ID is not defined");

export default function DexProvider({
  children,
}: {
  children: ReactNode;
  initialState?: State;
}) {
  const myTheme = merge(darkTheme(), {
    colors: {
      accentColor: "red",
    },
  } as Theme);

  return (
    <WagmiProvider config={config}>
      <RainbowKitProvider theme={myTheme}>{children}</RainbowKitProvider>
    </WagmiProvider>
  );
}
