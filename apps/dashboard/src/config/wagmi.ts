"use client";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  bsc,
  gnosis,
  zksync,
  polygonZkEvm,
  mantle,
  mode,
  avalanche,
  inkSepolia,
  linea,
  blast,
  scroll,
  zora,
  aurora,
} from "wagmi/chains";

// Get projectId from https://cloud.walletconnect.com
export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID;

if (!projectId) throw new Error("Project ID is not defined");

// Create wagmiConfig
export const supportedChains = [
  mainnet,
  optimism,
  bsc,
  gnosis,
  polygon,
  zksync,
  polygonZkEvm,
  mantle,
  base,
  mode,
  arbitrum,
  avalanche,
  inkSepolia,
  linea,
  blast,
  scroll,
  zora,
  aurora,
] as const;
export const config = getDefaultConfig({
  appName: "Fomoed",
  projectId,
  chains: supportedChains,
  transports: supportedChains.reduce(
    (obj, chain) => ({ ...obj, [chain.id]: http() }),
    {}
  ),
  ssr: true,
});
