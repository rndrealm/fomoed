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
  arbitrumSepolia,
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
  arbitrumSepolia,
] as const;

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
