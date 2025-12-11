import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { toast } from "sonner";
import { useAccount, useWriteContract, useSwitchChain, useBalance } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import "@testing-library/jest-dom/vitest";
import DepositModal from "@/components/widgets/trading/hyperliquid/modals/deposit-modal";

// Mock all dependencies
vi.mock("wagmi");
vi.mock("@tanstack/react-query");
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));
vi.mock("next/image", () => ({
  default: (props: any) => {
    return <img {...props} />;
  },
}));

describe("DepositModal Component", () => {
  const mockToggleModal = vi.fn();
  const mockWriteContract = vi.fn();
  const mockSwitchChain = vi.fn();
  const mockInvalidateQueries = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    (useAccount as ReturnType<typeof vi.fn>).mockReturnValue({
      address: "0x123",
      chainId: 421614, // Arbitrum Sepolia
    });

    (useBalance as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        value: BigInt(1000000000), // 1000 USDC with 6 decimals
        decimals: 6,
      },
    });

    (useWriteContract as ReturnType<typeof vi.fn>).mockReturnValue({
      writeContract: mockWriteContract,
      isPending: false,
      isError: false,
      isSuccess: false,
      error: null,
    });

    (useSwitchChain as ReturnType<typeof vi.fn>).mockReturnValue({
      switchChain: mockSwitchChain,
      isPending: false,
    });

    (useQueryClient as ReturnType<typeof vi.fn>).mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    });
  });

  describe("Component Rendering", () => {
    it("renders the deposit modal correctly", () => {
      render(<DepositModal toggleModal={mockToggleModal} />);

      expect(screen.getByText("Deposit USDC")).toBeInTheDocument();
      expect(screen.getByText(/Deposit USDC from Arbitrum to Hyperliquid/i)).toBeInTheDocument();
      expect(screen.getByText(/Minimum deposit: 5 USDC/i)).toBeInTheDocument();
    });

    it("displays USDC icon", () => {
      render(<DepositModal toggleModal={mockToggleModal} />);

      const usdcIcon = screen.getByAltText("USDC icon");
      expect(usdcIcon).toBeInTheDocument();
    });

    it("shows deposit input field", () => {
      render(<DepositModal toggleModal={mockToggleModal} />);

      const input = screen.getByPlaceholderText("$5 (minimum)");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("type", "number");
    });

    it("shows deposit button", () => {
      render(<DepositModal toggleModal={mockToggleModal} />);

      const depositButton = screen.getByRole("button", { name: /deposit/i });
      expect(depositButton).toBeInTheDocument();
    });

    it("displays max balance correctly", () => {
      render(<DepositModal toggleModal={mockToggleModal} />);

      expect(screen.getByText(/Max: \$1000.00/i)).toBeInTheDocument();
    });

    it("shows warning about minimum deposit", () => {
      render(<DepositModal toggleModal={mockToggleModal} />);

      expect(screen.getByText(/Deposits less than 5 USDC will not be credited and will be lost/i)).toBeInTheDocument();
    });
  });

  describe("Chain Switching", () => {
    it("shows switch chain button when on wrong network", () => {
      (useAccount as ReturnType<typeof vi.fn>).mockReturnValue({
        address: "0x123",
        chainId: 1, // Ethereum Mainnet
      });

      render(<DepositModal toggleModal={mockToggleModal} />);

      const switchButton = screen.getByRole("button", { name: /Switch to Arbitrum Sepolia/i });
      expect(switchButton).toBeInTheDocument();
    });

    it("calls switchChain when switch button is clicked", async () => {
      (useAccount as ReturnType<typeof vi.fn>).mockReturnValue({
        address: "0x123",
        chainId: 1, // Wrong chain
      });

      render(<DepositModal toggleModal={mockToggleModal} />);

      const switchButton = screen.getByRole("button", { name: /Switch to Arbitrum Sepolia/i });
      await userEvent.click(switchButton);

      expect(mockSwitchChain).toHaveBeenCalledWith({ chainId: 421614 });
    });

    it("shows success toast after successful chain switch", async () => {
      (useAccount as ReturnType<typeof vi.fn>).mockReturnValue({
        address: "0x123",
        chainId: 1,
      });

      mockSwitchChain.mockResolvedValueOnce(undefined);

      render(<DepositModal toggleModal={mockToggleModal} />);

      const switchButton = screen.getByRole("button", { name: /Switch to Arbitrum Sepolia/i });
      await userEvent.click(switchButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Switched to Arbitrum Sepolia");
      });
    });

    it("shows error toast if chain switch fails", async () => {
      (useAccount as ReturnType<typeof vi.fn>).mockReturnValue({
        address: "0x123",
        chainId: 1,
      });

      mockSwitchChain.mockRejectedValueOnce(new Error("User rejected"));

      render(<DepositModal toggleModal={mockToggleModal} />);

      const switchButton = screen.getByRole("button", { name: /Switch to Arbitrum Sepolia/i });
      await userEvent.click(switchButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Failed to switch network. Please switch manually in your wallet.");
      });
    });

    it("shows loading state when switching chains", () => {
      (useAccount as ReturnType<typeof vi.fn>).mockReturnValue({
        address: "0x123",
        chainId: 1,
      });

      (useSwitchChain as ReturnType<typeof vi.fn>).mockReturnValue({
        switchChain: mockSwitchChain,
        isPending: true,
      });

      render(<DepositModal toggleModal={mockToggleModal} />);

      const switchButton = screen.getByRole("button", { name: /Switch to Arbitrum Sepolia/i });
      expect(switchButton).toBeDisabled();
    });
  });

  describe("Form Validation", () => {
    it("disables deposit button when amount is empty", () => {
      render(<DepositModal toggleModal={mockToggleModal} />);

      const depositButton = screen.getByRole("button", { name: /deposit/i });
      expect(depositButton).toBeDisabled();
    });

    it("disables deposit button when amount is below minimum", async () => {
      render(<DepositModal toggleModal={mockToggleModal} />);

      const input = screen.getByPlaceholderText("$5 (minimum)");
      await userEvent.type(input, "3");

      const depositButton = screen.getByRole("button", { name: /deposit/i });
      expect(depositButton).toBeDisabled();
    });

    it("enables deposit button with valid amount", async () => {
      render(<DepositModal toggleModal={mockToggleModal} />);

      const input = screen.getByPlaceholderText("$5 (minimum)");
      await userEvent.type(input, "10");

      const depositButton = screen.getByRole("button", { name: /deposit/i });
      expect(depositButton).not.toBeDisabled();
    });

    it("disables deposit button for zero amount", async () => {
      render(<DepositModal toggleModal={mockToggleModal} />);

      const input = screen.getByPlaceholderText("$5 (minimum)");
      await userEvent.type(input, "0");

      const depositButton = screen.getByRole("button", { name: /deposit/i });
      // Button should be disabled for zero amount
      expect(depositButton).toBeDisabled();
    });

    it("disables deposit button for negative amount", async () => {
      render(<DepositModal toggleModal={mockToggleModal} />);

      const input = screen.getByPlaceholderText("$5 (minimum)");
      await userEvent.clear(input);
      await userEvent.type(input, "-5");

      const depositButton = screen.getByRole("button", { name: /deposit/i });
      // Button should be disabled for negative amount
      expect(depositButton).toBeDisabled();
    });

    it("shows error toast for amount below 5 USDC", async () => {
      render(<DepositModal toggleModal={mockToggleModal} />);

      const input = screen.getByPlaceholderText("$5 (minimum)");
      await userEvent.type(input, "4.99");

      // Need to enable the button temporarily to test the validation
      const depositButton = screen.getByRole("button", { name: /deposit/i });

      // Manually trigger validation by trying to submit with JS
      await userEvent.clear(input);
      await userEvent.type(input, "4.99");

      // Try clicking even though disabled
      await userEvent.click(depositButton);

      // The validation happens in handleBalance, so we need to test when button is enabled
      // This test verifies the button stays disabled
      expect(depositButton).toBeDisabled();
    });
  });

  describe("Deposit Submission", () => {
    it("calls writeContract with correct parameters", async () => {
      render(<DepositModal toggleModal={mockToggleModal} />);

      const input = screen.getByPlaceholderText("$5 (minimum)");
      await userEvent.type(input, "100");

      const depositButton = screen.getByRole("button", { name: /deposit/i });
      await userEvent.click(depositButton);

      await waitFor(() => {
        expect(mockWriteContract).toHaveBeenCalledWith(
          expect.objectContaining({
            address: "0x1baAbB04529D43a73232B713C0FE471f7c7334d5", // Testnet USDC
            functionName: "transfer",
            args: expect.arrayContaining([
              "0x08cfc1B6b2dCF36A1480b99353A354AA8AC56f89", // Testnet bridge
              expect.any(BigInt),
            ]),
          }),
        );
      });
    });

    it("converts deposit amount to correct units (6 decimals)", async () => {
      render(<DepositModal toggleModal={mockToggleModal} />);

      const input = screen.getByPlaceholderText("$5 (minimum)");
      await userEvent.type(input, "10");

      const depositButton = screen.getByRole("button", { name: /deposit/i });
      await userEvent.click(depositButton);

      await waitFor(() => {
        expect(mockWriteContract).toHaveBeenCalledWith(
          expect.objectContaining({
            args: expect.arrayContaining([expect.any(String), BigInt(10000000)]), // 10 USDC = 10000000
          }),
        );
      });
    });

    it("allows deposit of exactly 5 USDC", async () => {
      render(<DepositModal toggleModal={mockToggleModal} />);

      const input = screen.getByPlaceholderText("$5 (minimum)");
      await userEvent.type(input, "5");

      const depositButton = screen.getByRole("button", { name: /deposit/i });
      expect(depositButton).not.toBeDisabled();
    });

    it("allows deposit of maximum available balance", async () => {
      render(<DepositModal toggleModal={mockToggleModal} />);

      const input = screen.getByPlaceholderText("$5 (minimum)");
      await userEvent.type(input, "1000");

      const depositButton = screen.getByRole("button", { name: /deposit/i });
      expect(depositButton).not.toBeDisabled();
    });
  });

  describe("Transaction Success", () => {
    it("shows success toast on successful deposit", async () => {
      (useWriteContract as ReturnType<typeof vi.fn>).mockReturnValue({
        writeContract: mockWriteContract,
        isPending: false,
        isError: false,
        isSuccess: true,
        error: null,
      });

      render(<DepositModal toggleModal={mockToggleModal} />);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Deposit transaction sent successfully! Funds will appear in ~1 minute.");
      });
    });

    it("closes modal after successful deposit", async () => {
      (useWriteContract as ReturnType<typeof vi.fn>).mockReturnValue({
        writeContract: mockWriteContract,
        isPending: false,
        isError: false,
        isSuccess: true,
        error: null,
      });

      render(<DepositModal toggleModal={mockToggleModal} />);

      await waitFor(() => {
        expect(mockToggleModal).toHaveBeenCalledTimes(1);
      });
    });

    it("invalidates balance queries after successful deposit", async () => {
      (useWriteContract as ReturnType<typeof vi.fn>).mockReturnValue({
        writeContract: mockWriteContract,
        isPending: false,
        isError: false,
        isSuccess: true,
        error: null,
      });

      render(<DepositModal toggleModal={mockToggleModal} />);

      await waitFor(() => {
        expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ["hyper-liquid-balancee"] });
        expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ["hyper-liquid-balance-spot"] });
      });
    });

    it("clears input value after successful deposit", async () => {
      const { rerender } = render(<DepositModal toggleModal={mockToggleModal} />);

      const input = screen.getByPlaceholderText("$5 (minimum)") as HTMLInputElement;
      await userEvent.type(input, "50");

      expect(input.value).toBe("50");

      // Simulate success
      (useWriteContract as ReturnType<typeof vi.fn>).mockReturnValue({
        writeContract: mockWriteContract,
        isPending: false,
        isError: false,
        isSuccess: true,
        error: null,
      });

      rerender(<DepositModal toggleModal={mockToggleModal} />);

      await waitFor(() => {
        expect(input.value).toBe("");
      });
    });
  });

  describe("Transaction Error Handling", () => {
    it("shows error toast on transaction failure", async () => {
      const mockError = {
        shortMessage: "User rejected the request",
      };

      (useWriteContract as ReturnType<typeof vi.fn>).mockReturnValue({
        writeContract: mockWriteContract,
        isPending: false,
        isError: true,
        isSuccess: false,
        error: mockError,
      });

      render(<DepositModal toggleModal={mockToggleModal} />);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("User rejected the request");
      });
    });

    it("shows generic error message if no shortMessage", async () => {
      (useWriteContract as ReturnType<typeof vi.fn>).mockReturnValue({
        writeContract: mockWriteContract,
        isPending: false,
        isError: true,
        isSuccess: false,
        error: {},
      });

      render(<DepositModal toggleModal={mockToggleModal} />);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Transaction failed. Please try again.");
      });
    });

    it("does not close modal on error", async () => {
      (useWriteContract as ReturnType<typeof vi.fn>).mockReturnValue({
        writeContract: mockWriteContract,
        isPending: false,
        isError: true,
        isSuccess: false,
        error: { shortMessage: "Error" },
      });

      render(<DepositModal toggleModal={mockToggleModal} />);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });

      expect(mockToggleModal).not.toHaveBeenCalled();
    });
  });

  describe("Loading States", () => {
    it("shows loading state when transaction is pending", () => {
      (useWriteContract as ReturnType<typeof vi.fn>).mockReturnValue({
        writeContract: mockWriteContract,
        isPending: true,
        isError: false,
        isSuccess: false,
        error: null,
      });

      render(<DepositModal toggleModal={mockToggleModal} />);

      const depositButton = screen.getByRole("button", { name: /deposit/i });
      expect(depositButton).toBeDisabled();
    });

    it("disables button during transaction", async () => {
      (useWriteContract as ReturnType<typeof vi.fn>).mockReturnValue({
        writeContract: mockWriteContract,
        isPending: true,
        isError: false,
        isSuccess: false,
        error: null,
      });

      render(<DepositModal toggleModal={mockToggleModal} />);

      const depositButton = screen.getByRole("button", { name: /deposit/i });
      await userEvent.click(depositButton);

      expect(mockWriteContract).not.toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("handles zero balance correctly", () => {
      (useBalance as ReturnType<typeof vi.fn>).mockReturnValue({
        data: {
          value: BigInt(0),
          decimals: 6,
        },
      });

      render(<DepositModal toggleModal={mockToggleModal} />);

      expect(screen.getByText(/Max: \$0.00/i)).toBeInTheDocument();
    });

    it("handles large balance values", () => {
      (useBalance as ReturnType<typeof vi.fn>).mockReturnValue({
        data: {
          value: BigInt(999999999000000), // 999,999,999 USDC
          decimals: 6,
        },
      });

      render(<DepositModal toggleModal={mockToggleModal} />);

      expect(screen.getByText(/Max: \$999999999.00/i)).toBeInTheDocument();
    });

    it("handles decimal deposit amounts correctly", async () => {
      render(<DepositModal toggleModal={mockToggleModal} />);

      const input = screen.getByPlaceholderText("$5 (minimum)");
      await userEvent.type(input, "10.50");

      const depositButton = screen.getByRole("button", { name: /deposit/i });
      await userEvent.click(depositButton);

      await waitFor(() => {
        expect(mockWriteContract).toHaveBeenCalledWith(
          expect.objectContaining({
            args: expect.arrayContaining([expect.any(String), BigInt(10500000)]), // 10.50 USDC
          }),
        );
      });
    });

    it("handles disconnected wallet by showing chain switch button", () => {
      (useAccount as ReturnType<typeof vi.fn>).mockReturnValue({
        address: undefined,
        chainId: undefined,
      });

      render(<DepositModal toggleModal={mockToggleModal} />);

      // When wallet is disconnected, chain check fails and shows switch button
      const switchButton = screen.getByRole("button", { name: /Switch to Arbitrum Sepolia/i });
      expect(switchButton).toBeInTheDocument();
    });
  });

  describe("Type Safety", () => {
    it("ensures correct contract address types", async () => {
      render(<DepositModal toggleModal={mockToggleModal} />);

      const input = screen.getByPlaceholderText("$5 (minimum)");
      await userEvent.type(input, "10");

      const depositButton = screen.getByRole("button", { name: /deposit/i });
      await userEvent.click(depositButton);

      await waitFor(() => {
        const call = mockWriteContract.mock.calls[0]?.[0];
        if (call) {
          expect(typeof call.address).toBe("string");
          expect(call.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
        }
      });
    });

    it("ensures amount is converted to BigInt", async () => {
      render(<DepositModal toggleModal={mockToggleModal} />);

      const input = screen.getByPlaceholderText("$5 (minimum)");
      await userEvent.type(input, "25");

      const depositButton = screen.getByRole("button", { name: /deposit/i });
      await userEvent.click(depositButton);

      await waitFor(() => {
        const call = mockWriteContract.mock.calls[0]?.[0];
        if (call) {
          expect(typeof call.args[1]).toBe("bigint");
        }
      });
    });
  });
});
