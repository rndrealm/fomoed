export const PERP_MAX_DECIMALS = 6;
export const SPOT_MAX_DECIMALS = 8;

export const MAX_PRICE_SF = 5;

export const HYPERLIQUID_BUILDER_ADDRESS = "0x4ff046b6b197669a3e04cc0bf1050d371b8c301e";

// export const isTestnet = false;
export const isTestnet = process.env.NEXT_PUBLIC_HYPERLIQUID_IS_TESTNET !== "false";

export const HYPERLIQUID_BASE_URL = isTestnet ? "https://api.hyperliquid-testnet.xyz" : "https://api.hyperliquid.xyz";
