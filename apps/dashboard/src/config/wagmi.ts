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
} from "viem/chains";

import { cookieStorage, createConfig, createStorage, http } from "wagmi";

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

console.log("supported chains number", supportedChains.length);

export const config = createConfig({
  chains: supportedChains,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: Object.fromEntries(supportedChains.map((chain) => [chain.id, http()])) as Record<
    (typeof supportedChains)[number]["id"],
    ReturnType<typeof http>
  >,
});
