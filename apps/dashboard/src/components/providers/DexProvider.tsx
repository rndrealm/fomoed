"use client";

import React, { ReactNode } from "react";
import { config } from "@/config/wagmi";
import "@rainbow-me/rainbowkit/styles.css";
import { State, WagmiProvider } from "wagmi";
import { darkTheme, RainbowKitProvider, Theme } from "@rainbow-me/rainbowkit";
import merge from "lodash.merge";
import { QueryProvider } from ".";

// if (!projectId) throw new Error("Project ID is not defined");

export default function DexProvider({ children, initialState }: { children: ReactNode; initialState?: State }) {
  const myTheme = merge(darkTheme() as Theme);

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryProvider>
        <RainbowKitProvider theme={myTheme}>{children}</RainbowKitProvider>
      </QueryProvider>
    </WagmiProvider>
  );
}
