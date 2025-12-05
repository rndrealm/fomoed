import * as hl from "@nktkas/hyperliquid";
import { formatUnits } from "viem";
import { MAX_PRICE_SF } from "./constants";

/**
 * Transfer funds between Spot and Perpetual accounts on Hyperliquid
 *
 * @param walletClient - The wagmi wallet client from useWalletClient hook
 * @param amount - The amount to transfer (in USDC, e.g., "100" for $100)
 * @param toPerp - true to transfer from Spot to Perp, false to transfer from Perp to Spot
 * @param isTestnet - Whether to use testnet (default: true based on BASE_URL in hyperliquid queries)
 * @returns Promise with the transfer result
 *
 * @example
 * ```ts
 * import { useWalletClient } from "wagmi";
 * import { transferSpotPerp } from "@/components/widgets/ascendex/utils";
 *
 * const { data: walletClient } = useWalletClient();
 *
 * // Transfer $100 from Spot to Perp
 * await transferSpotPerp(walletClient, "100", true);
 *
 * // Transfer $50 from Perp to Spot
 * await transferSpotPerp(walletClient, "50", false);
 * ```
 */
export async function transferSpotPerp(
  walletClient: any | undefined,
  amount: string,
  toPerp: boolean,
  isTestnet: boolean = true,
): Promise<hl.UsdClassTransferSuccessResponse> {
  if (!walletClient) {
    throw new Error("Wallet client is not available. Please connect your wallet first.");
  }

  if (!walletClient.account) {
    throw new Error("No account found in wallet client. Please ensure wallet is connected.");
  }

  // Create HTTP transport for Hyperliquid
  const transport = new hl.HttpTransport({
    isTestnet,
  });

  // Create Exchange client with the wallet client
  const exchangeClient = new hl.ExchangeClient({
    transport,
    wallet: walletClient as any,
  });

  // Execute the transfer
  const result = await exchangeClient.usdClassTransfer({
    amount,
    toPerp,
  });

  return result;
}

/**
 * Approve a Hyperliquid API wallet (agent) to trade on behalf of the main wallet
 *
 * @param walletClient - The wagmi wallet client from useWalletClient hook
 * @param apiWalletAddress - The address of the API wallet to approve (agent address)
 * @param isTestnet - Whether to use testnet (default: true)
 * @returns Promise with the approval result
 *
 * @example
 * ```ts
 * import { useWalletClient } from "wagmi";
 * import { approveApiWallet } from "@/components/widgets/ascendex/utils";
 *
 * const { data: walletClient } = useWalletClient();
 *
 * // Approve an API wallet
 * await approveApiWallet(walletClient, "0x...", true);
 * ```
 */
export async function approveApiWallet(
  walletClient: any | undefined,
  apiWalletAddress: string,
  isTestnet: boolean = true,
): Promise<hl.ApproveAgentSuccessResponse> {
  if (!walletClient) {
    throw new Error("Wallet client is not available. Please connect your wallet first.");
  }

  if (!walletClient.account) {
    throw new Error("No account found in wallet client. Please ensure wallet is connected.");
  }

  if (!apiWalletAddress) {
    throw new Error("API wallet address is required.");
  }

  const transport = new hl.HttpTransport({
    isTestnet,
  });

  const exchangeClient = new hl.ExchangeClient({
    transport,
    wallet: walletClient as any,
  });

  // Approve the agent (API wallet)
  const result = await exchangeClient.approveAgent({
    agentAddress: apiWalletAddress,
    agentName: null,
  });

  return result;
}

/**
 * Withdraw funds from Hyperliquid to an external wallet address
 *
 * @param walletClient - The wagmi wallet client from useWalletClient hook
 * @param destination - The destination wallet address to withdraw to
 * @param amount - The amount to withdraw (in USDC, e.g., "100" for $100)
 * @param isTestnet - Whether to use testnet (default: true based on BASE_URL in hyperliquid queries)
 * @returns Promise with the withdrawal result
 *
 * @example
 * ```ts
 * import { useWalletClient } from "wagmi";
 * import { withdrawFromHyperliquid } from "@/components/widgets/trading/utils";
 *
 * const { data: walletClient } = useWalletClient();
 *
 * // Withdraw $100 to a wallet address
 * await withdrawFromHyperliquid(walletClient, "0x1234...", "100", true);
 * ```
 */
export async function withdrawFromHyperliquid(
  walletClient: any | undefined,
  destination: string,
  amount: string,
  isTestnet: boolean = true,
): Promise<hl.Withdraw3SuccessResponse> {
  if (!walletClient) {
    throw new Error("Wallet client is not available. Please connect your wallet first.");
  }

  if (!walletClient.account) {
    throw new Error("No account found in wallet client. Please ensure wallet is connected.");
  }

  if (!destination) {
    throw new Error("Destination address is required.");
  }

  if (!amount || parseFloat(amount) <= 0) {
    throw new Error("Amount must be greater than 0.");
  }

  // Create HTTP transport for Hyperliquid
  const transport = new hl.HttpTransport({
    isTestnet,
  });

  // Create Exchange client with the wallet client
  const exchangeClient = new hl.ExchangeClient({
    transport,
    wallet: walletClient as any,
  });

  // Execute the withdrawal
  const result = await exchangeClient.withdraw3({
    destination,
    amount,
  });

  return result;
}

/**
 *
 * @param displayName - Token display name gotten from hyperliquid meta api eg BTC/USDC
 * @returns - Splits tokens into individual strings eg { from: BTC, to: USDC }
 */
export const getFromAndToToken = (displayName?: string | null) => {
  if (!displayName) return { from: "", to: "" };
  const splitString = displayName.split("/");
  return { from: splitString[0], to: splitString[1] };
};

/**
 * Formats an ERC-20 balance.
 * @param value   The raw BigInt token balance (e.g. 27000000n)
 * @param decimals  The token decimals (e.g. 6 for USDC)
 * @returns string  Human-readable value (e.g. "27")
 */
export function formatToken(value: bigint | undefined, decimals: number | undefined) {
  if (value === undefined || decimals === undefined) return "0";
  return formatUnits(value, decimals); // returns a string
}

/**
 * Formats a number to respect both significant figures and decimal places limits
 * @param num - The number to format
 * @param maxDecimalPlaces - Maximum number of decimal places allowed
 * @returns The formatted number as a string, or the original number if it doesn't exceed limits
 *
 * @example
 * formatNumber(123.456789, 2) // "123.46" (limited by maxDecimalPlaces)
 * formatNumber(0.0012345678, 4) // "0.0012346" (limited by 5 SF)
 * formatNumber(123456789, 2) // "123460000" (limited by 5 SF)
 * formatNumber(123.45, 4) // "123.45" (unchanged, within limits)
 */
export function formatHlPrice(num: number, maxDecimalPlaces: number): string {
  if (!isFinite(num)) return String(num);

  // Handle zero
  if (num === 0) return "0";

  // Apply 5 significant figures limit
  const withSigFigs = Number(num.toPrecision(MAX_PRICE_SF));

  // Apply decimal places limit
  const withMaxDP = Number(withSigFigs.toFixed(maxDecimalPlaces));

  // If the formatted version is the same as original, return original
  if (withMaxDP === num) return num.toString();

  return withMaxDP.toString();
}

/**
 * Truncates a size/quantity to the specified number of decimal places (szDecimals)
 * This ensures the value is valid according to Hyperliquid's size decimal requirements
 * Note: This truncates (floors) rather than rounds
 *
 * @param size - The size/quantity to truncate
 * @param szDecimals - The number of decimal places allowed for this asset
 * @returns The truncated size as a string
 *
 * @example
 * formatHlSize(1.0001, 3) // "1" (truncated to 3 decimals, no trailing zeros)
 * formatHlSize(100.999, 2) // "100.99" (truncated, not rounded to 101)
 * formatHlSize(10.251, 2) // "10.25" (truncated to 2 decimals)
 * formatHlSize(5.6789, 1) // "5.6" (truncated, not rounded to 5.7)
 * formatHlSize(100, 2) // "100" (no decimal needed)
 */
export function formatHlSize(size: number, szDecimals: number): string {
  if (!isFinite(size)) return String(size);

  // Truncate to the specified decimal places by multiplying, flooring, then dividing
  const multiplier = Math.pow(10, szDecimals);
  const truncated = Math.floor(size * multiplier) / multiplier;

  // Return as string without forcing trailing zeros
  return truncated.toString();
}
