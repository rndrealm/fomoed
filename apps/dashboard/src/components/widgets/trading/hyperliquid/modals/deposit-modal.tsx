import { TextInput } from "@/components/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGetPerpBalance } from "@/services/queries/hyperliquid";
import React, { useEffect, useState } from "react";
import { useAccount, useWriteContract, useSwitchChain, useBalance } from "wagmi";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import { parseUnits } from "viem";
import { arbitrum, arbitrumSepolia } from "viem/chains";
import { formatToken } from "../../utils";
import { isTestnet } from "../../utils/constants";

interface IProps {
  toggleModal: () => void;
}

// Constants for Hyperliquid bridge
const HYPERLIQUID_BRIDGE_MAINNET = "0x2Df1c51E09aECF9cacB7bc98cB1742757f163dF7";
const HYPERLIQUID_BRIDGE_TESTNET = "0x08cfc1B6b2dCF36A1480b99353A354AA8AC56f89";
const ARBITRUM_USDC_MAINNET = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
const ARBITRUM_USDC_TESTNET = "0x1baAbB04529D43a73232B713C0FE471f7c7334d5";

// ERC-20 transfer ABI
const erc20TransferAbi = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

const DepositModal = (props: IProps) => {
  const { toggleModal } = props;

  // Use testnet for now - change to false for mainnet

  const BRIDGE_ADDRESS = isTestnet ? HYPERLIQUID_BRIDGE_TESTNET : HYPERLIQUID_BRIDGE_MAINNET;
  const USDC_ADDRESS = isTestnet ? ARBITRUM_USDC_TESTNET : ARBITRUM_USDC_MAINNET;

  // Chain IDs
  const ARBITRUM_MAINNET_CHAIN_ID = arbitrum.id; // 42161
  const ARBITRUM_SEPOLIA_CHAIN_ID = arbitrumSepolia.id; // 421614
  const requiredChainId = isTestnet ? ARBITRUM_SEPOLIA_CHAIN_ID : ARBITRUM_MAINNET_CHAIN_ID;

  const [value, setValue] = useState("");
  const queryClient = useQueryClient();
  const account = useAccount();
  const balance = useBalance({
    address: account?.address,
    token: USDC_ADDRESS, // ERC-20 token address
    chainId: requiredChainId,
  });
  const walletAddress = account?.address || "";
  const maxValue = formatToken(balance.data?.value, balance.data?.decimals);

  // Check if user is on the correct Arbitrum network
  const isOnCorrectChain = account.chainId === requiredChainId;

  const { writeContract, isPending, isError, isSuccess, error } = useWriteContract();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const handleSwitchChain = async () => {
    try {
      await switchChain({ chainId: requiredChainId });
      toast.success(`Switched to ${isTestnet ? "Arbitrum Sepolia" : "Arbitrum"}`);
    } catch (err) {
      console.error("Chain switch error:", err);
      toast.error("Failed to switch network. Please switch manually in your wallet.");
    }
  };

  const handleBalance = async () => {
    const amount = parseFloat(value);

    if (!value || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (amount < 5) {
      toast.error("Minimum deposit amount is 5 USDC");
      return;
    }

    try {
      // Convert amount to USDC units (6 decimals)
      const amountInUnits = parseUnits(value, 6);

      // Execute the ERC-20 transfer to Hyperliquid bridge
      writeContract({
        address: USDC_ADDRESS as `0x${string}`,
        abi: erc20TransferAbi,
        functionName: "transfer",
        args: [BRIDGE_ADDRESS as `0x${string}`, amountInUnits],
      });
    } catch (err) {
      console.error("Deposit error:", err);
      toast.error("Failed to initiate deposit");
    }
  };

  useEffect(() => {
    if (isError) {
      console.error("Transaction error:", error);
      toast.error((error as any)?.shortMessage || "Transaction failed. Please try again.");
    }
    if (isSuccess) {
      toast.success("Deposit transaction sent successfully! Funds will appear in ~1 minute.");
      setValue("");
      toggleModal();

      // Invalidate queries to refresh balances
      queryClient.invalidateQueries({ queryKey: ["hyper-liquid-balance"] });
      queryClient.invalidateQueries({ queryKey: ["hyper-liquid-balance-spot"] });
    }
  }, [isError, isSuccess]);

  return (
    <div className="flex flex-col ">
      <div className="flex justify-center">
        <Image src={dashboard.usdc} alt="USDC icon" width={30} height={30} />
      </div>
      <h3 className="text-lg font-medium py-4 text-center text-white">Deposit USDC</h3>
      <p className=" font-medium text-[#B0B0B0] text-xs">
        Deposit USDC from Arbitrum to Hyperliquid. Minimum deposit: 5 USDC. Deposits less than 5 USDC will not be
        credited and will be lost.
      </p>
      <div className="py-4">
        <TextInput
          type="number"
          className={cn(
            "h-10 w-full rounded-[10px] border border-[#1F1F1F] bg-[#0D0D0D] px-2 pr-4 text-sm text-white placeholder:text-[#5F5F5F] focus:outline-none focus:border-[#f4f4f4]",
            {
              "border-[#FFC26D] focus:border-[#FFC26D]": "",
            },
          )}
          placeholder="$5 (minimum)"
          value={value}
          onChange={(e) => setValue((e.target as HTMLInputElement).value)}
          min="5"
          step="0.1"
          rightPlaceholder={`Max: $${Number(maxValue).toFixed(2)}`}
          rightPlaceholderClassName="text-sm top-[28%] text-[#FFC26D]"
          disableFormikError
        />
      </div>
      <div>
        <Button
          type="button"
          isLoading={isPending || isSwitching}
          onClick={isOnCorrectChain ? handleBalance : handleSwitchChain}
          disabled={isPending || isSwitching || (!isOnCorrectChain ? false : !value || Number(value) < 5)}
          className="w-full bg-white hover:bg-[#f4f4f4]  text-[#1E1E1E] font-medium text-[0.875rem] leading-[14px] h-12"
        >
          {isOnCorrectChain ? "Deposit" : `Switch to ${isTestnet ? "Arbitrum Sepolia" : "Arbitrum"}`}
        </Button>
      </div>
    </div>
  );
};

export default DepositModal;
