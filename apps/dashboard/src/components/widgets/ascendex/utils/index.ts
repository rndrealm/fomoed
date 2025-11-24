import * as hl from "@nktkas/hyperliquid";

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
  isTestnet: boolean = true
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
    wallet: walletClient as any, // wagmi's WalletClient is compatible with the SDK's wallet interface
  });

  // Execute the transfer
  const result = await exchangeClient.usdClassTransfer({
    amount,
    toPerp,
  });

  return result;
}

/**
 * Get the balance for both Spot and Perp accounts
 *
 * @param walletAddress - The wallet address to query
 * @param isTestnet - Whether to use testnet (default: true)
 * @returns Promise with spot and perp balance information
 *
 * @example
 * ```ts
 * import { useAccount } from "wagmi";
 * import { getSpotPerpBalances } from "@/components/widgets/ascendex/utils";
 *
 * const { address } = useAccount();
 * const balances = await getSpotPerpBalances(address);
 * console.log("Spot:", balances.spot);
 * console.log("Perp:", balances.perp);
 * ```
 */
export async function getSpotPerpBalances(
  walletAddress: string | undefined,
  isTestnet: boolean = true
): Promise<{
  spot: hl.SpotClearinghouseStateResponse;
  perp: hl.ClearinghouseStateResponse;
}> {
  if (!walletAddress) {
    throw new Error("Wallet address is required");
  }

  // Create HTTP transport for Hyperliquid
  const transport = new hl.HttpTransport({
    isTestnet,
  });

  // Create Info client
  const infoClient = new hl.InfoClient({
    transport,
  });

  // Fetch both balances in parallel
  const [spot, perp] = await Promise.all([
    infoClient.spotClearinghouseState({ user: walletAddress }),
    infoClient.clearinghouseState({ user: walletAddress }),
  ]);

  return { spot, perp };
}
