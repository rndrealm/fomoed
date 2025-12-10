import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { toast } from "sonner";
import { useAccount, useWalletClient } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import "@testing-library/jest-dom/vitest";
import WithdrawalModal from "@/components/widgets/trading/hyperliquid/modals/withdrawal-modal";
import { useGetPerpBalance } from "@/services/queries/hyperliquid";
import { withdrawFromHyperliquid } from "@/components/widgets/trading/utils";

// Mock all dependencies
vi.mock("wagmi");
vi.mock("@tanstack/react-query");
vi.mock("@/services/queries/hyperliquid");
vi.mock("@/components/widgets/trading/utils");
vi.mock("sonner", () => ({
  toast: vi.fn(),
}));
vi.mock("next/image", () => ({
  default: (props: any) => {
    return <img {...props} />;
  },
}));

describe("WithdrawalModal Component", () => {
  const mockToggleModal = vi.fn();
  const mockInvalidateQueries = vi.fn();
  const mockWalletClient = { data: "mock-wallet-client" };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    (useAccount as ReturnType<typeof vi.fn>).mockReturnValue({
      address: "0x123",
    });

    (useWalletClient as ReturnType<typeof vi.fn>).mockReturnValue(mockWalletClient);

    (useGetPerpBalance as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        withdrawable: "1000",
      },
    });

    (useQueryClient as ReturnType<typeof vi.fn>).mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    });

    (withdrawFromHyperliquid as ReturnType<typeof vi.fn>).mockResolvedValue({
      status: "ok",
    });
  });

  describe("Component Rendering", () => {
    it("renders the withdrawal modal correctly", () => {
      render(<WithdrawalModal toggleModal={mockToggleModal} />);

      expect(screen.getByText("Withdraw USDC to Arbitrum")).toBeInTheDocument();
      expect(screen.getByText(/USDC Will be sent to your address/i)).toBeInTheDocument();
    });

    it("displays USDC icon", () => {
      render(<WithdrawalModal toggleModal={mockToggleModal} />);

      const usdcIcon = screen.getByAltText("USDC icon");
      expect(usdcIcon).toBeInTheDocument();
    });

    it("shows withdrawal input field", () => {
      render(<WithdrawalModal toggleModal={mockToggleModal} />);

      const input = screen.getByPlaceholderText("$0");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("type", "number");
    });

    it("shows submit button", () => {
      render(<WithdrawalModal toggleModal={mockToggleModal} />);

      const submitButton = screen.getByRole("button", { name: /submit/i });
      expect(submitButton).toBeInTheDocument();
    });

    it("displays max withdrawable balance", () => {
      render(<WithdrawalModal toggleModal={mockToggleModal} />);

      expect(screen.getByText(/Max: \$1000.00/i)).toBeInTheDocument();
    });

    it("shows 1 USDC fee notice", () => {
      render(<WithdrawalModal toggleModal={mockToggleModal} />);

      expect(screen.getByText(/a 1 USDC fee will be deducted/i)).toBeInTheDocument();
    });
  });

  describe("Input Validation", () => {
    it("disables submit button when amount is empty", () => {
      render(<WithdrawalModal toggleModal={mockToggleModal} />);

      const submitButton = screen.getByRole("button", { name: /submit/i });
      expect(submitButton).toBeDisabled();
    });

    it("disables submit button when amount exceeds max balance", async () => {
      render(<WithdrawalModal toggleModal={mockToggleModal} />);

      const input = screen.getByPlaceholderText("$0");
      await userEvent.type(input, "1500");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      expect(submitButton).toBeDisabled();
    });

    it("enables submit button with valid amount", async () => {
      render(<WithdrawalModal toggleModal={mockToggleModal} />);

      const input = screen.getByPlaceholderText("$0");
      await userEvent.type(input, "100");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      expect(submitButton).not.toBeDisabled();
    });

    it("allows withdrawal of maximum available balance", async () => {
      render(<WithdrawalModal toggleModal={mockToggleModal} />);

      const input = screen.getByPlaceholderText("$0");
      await userEvent.type(input, "1000");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      expect(submitButton).not.toBeDisabled();
    });

    it("accepts decimal amounts", async () => {
      render(<WithdrawalModal toggleModal={mockToggleModal} />);

      const input = screen.getByPlaceholderText("$0");
      await userEvent.type(input, "50.50");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      expect(submitButton).not.toBeDisabled();
    });

    it("handles zero balance correctly", () => {
      (useGetPerpBalance as ReturnType<typeof vi.fn>).mockReturnValue({
        data: {
          withdrawable: "0",
        },
      });

      render(<WithdrawalModal toggleModal={mockToggleModal} />);

      expect(screen.getByText(/Max: \$0.00/i)).toBeInTheDocument();
    });
  });

  describe("Withdrawal Submission", () => {
    it("calls withdrawFromHyperliquid with correct parameters", async () => {
      render(<WithdrawalModal toggleModal={mockToggleModal} />);

      const input = screen.getByPlaceholderText("$0");
      await userEvent.type(input, "100");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(withdrawFromHyperliquid).toHaveBeenCalledWith(
          mockWalletClient.data,
          "0x123",
          "100",
          true,
        );
      });
    });

    it("shows loading state during withdrawal", async () => {
      (withdrawFromHyperliquid as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ status: "ok" }), 100)),
      );

      render(<WithdrawalModal toggleModal={mockToggleModal} />);

      const input = screen.getByPlaceholderText("$0");
      await userEvent.type(input, "50");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      // Button should be disabled during loading
      expect(submitButton).toBeDisabled();

      await waitFor(() => {
        expect(withdrawFromHyperliquid).toHaveBeenCalled();
      });
    });

    it("allows withdrawal of minimum amount (1 USDC)", async () => {
      render(<WithdrawalModal toggleModal={mockToggleModal} />);

      const input = screen.getByPlaceholderText("$0");
      await userEvent.type(input, "1");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      expect(submitButton).not.toBeDisabled();
    });

    it("handles decimal precision correctly", async () => {
      render(<WithdrawalModal toggleModal={mockToggleModal} />);

      const input = screen.getByPlaceholderText("$0");
      await userEvent.type(input, "99.99");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(withdrawFromHyperliquid).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          "99.99",
          true,
        );
      });
    });
  });

  describe("Withdrawal Success", () => {
    it("shows success toast on successful withdrawal", async () => {
      render(<WithdrawalModal toggleModal={mockToggleModal} />);

      const input = screen.getByPlaceholderText("$0");
      await userEvent.type(input, "100");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith("Withdrawal Successful");
      });
    });

    it("closes modal after successful withdrawal", async () => {
      render(<WithdrawalModal toggleModal={mockToggleModal} />);

      const input = screen.getByPlaceholderText("$0");
      await userEvent.type(input, "100");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockToggleModal).toHaveBeenCalledTimes(1);
      });
    });

    it("invalidates balance query after successful withdrawal", async () => {
      render(<WithdrawalModal toggleModal={mockToggleModal} />);

      const input = screen.getByPlaceholderText("$0");
      await userEvent.type(input, "100");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ["hyper-liquid-balance"] });
      });
    });

    it("handles successful withdrawal with exact max balance", async () => {
      render(<WithdrawalModal toggleModal={mockToggleModal} />);

      const input = screen.getByPlaceholderText("$0");
      await userEvent.type(input, "1000");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith("Withdrawal Successful");
        expect(mockToggleModal).toHaveBeenCalled();
      });
    });
  });

  describe("Error Handling", () => {
    it("shows error toast on withdrawal failure", async () => {
      (withdrawFromHyperliquid as ReturnType<typeof vi.fn>).mockResolvedValue({
        status: "error",
      });

      render(<WithdrawalModal toggleModal={mockToggleModal} />);

      const input = screen.getByPlaceholderText("$0");
      await userEvent.type(input, "100");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith("Something went wrong");
      });
    });

    it("does not close modal on withdrawal failure", async () => {
      (withdrawFromHyperliquid as ReturnType<typeof vi.fn>).mockResolvedValue({
        status: "error",
      });

      render(<WithdrawalModal toggleModal={mockToggleModal} />);

      const input = screen.getByPlaceholderText("$0");
      await userEvent.type(input, "100");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith("Something went wrong");
      });

      expect(mockToggleModal).not.toHaveBeenCalled();
    });

    it("handles network errors gracefully", async () => {
      (withdrawFromHyperliquid as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Network error"),
      );

      render(<WithdrawalModal toggleModal={mockToggleModal} />);

      const input = screen.getByPlaceholderText("$0");
      await userEvent.type(input, "100");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith("Something went wrong");
      });
    });

    it("re-enables button after error", async () => {
      (withdrawFromHyperliquid as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Network error"),
      );

      render(<WithdrawalModal toggleModal={mockToggleModal} />);

      const input = screen.getByPlaceholderText("$0");
      await userEvent.type(input, "100");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith("Something went wrong");
      });

      // Button should be enabled again after error
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe("Loading States", () => {
    it("disables input during withdrawal", async () => {
      (withdrawFromHyperliquid as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ status: "ok" }), 100)),
      );

      render(<WithdrawalModal toggleModal={mockToggleModal} />);

      const input = screen.getByPlaceholderText("$0");
      await userEvent.type(input, "50");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      expect(submitButton).toBeDisabled();
    });

    it("prevents multiple simultaneous withdrawals", async () => {
      (withdrawFromHyperliquid as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ status: "ok" }), 100)),
      );

      render(<WithdrawalModal toggleModal={mockToggleModal} />);

      const input = screen.getByPlaceholderText("$0");
      await userEvent.type(input, "50");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);
      await userEvent.click(submitButton);
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(withdrawFromHyperliquid).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("Balance Display", () => {
    it("displays balance with 2 decimal places", () => {
      (useGetPerpBalance as ReturnType<typeof vi.fn>).mockReturnValue({
        data: {
          withdrawable: "1234.567",
        },
      });

      render(<WithdrawalModal toggleModal={mockToggleModal} />);

      expect(screen.getByText(/Max: \$1234.57/i)).toBeInTheDocument();
    });

    it("displays small balances correctly", () => {
      (useGetPerpBalance as ReturnType<typeof vi.fn>).mockReturnValue({
        data: {
          withdrawable: "0.01",
        },
      });

      render(<WithdrawalModal toggleModal={mockToggleModal} />);

      expect(screen.getByText(/Max: \$0.01/i)).toBeInTheDocument();
    });

    it("displays large balances correctly", () => {
      (useGetPerpBalance as ReturnType<typeof vi.fn>).mockReturnValue({
        data: {
          withdrawable: "999999.99",
        },
      });

      render(<WithdrawalModal toggleModal={mockToggleModal} />);

      expect(screen.getByText(/Max: \$999999.99/i)).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles missing wallet address", () => {
      (useAccount as ReturnType<typeof vi.fn>).mockReturnValue({
        address: undefined,
      });

      render(<WithdrawalModal toggleModal={mockToggleModal} />);

      expect(screen.getByPlaceholderText("$0")).toBeInTheDocument();
    });

    it("handles missing wallet client", () => {
      (useWalletClient as ReturnType<typeof vi.fn>).mockReturnValue({
        data: undefined,
      });

      render(<WithdrawalModal toggleModal={mockToggleModal} />);

      expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
    });

    it("handles undefined withdrawable balance", () => {
      (useGetPerpBalance as ReturnType<typeof vi.fn>).mockReturnValue({
        data: {
          withdrawable: undefined,
        },
      });

      render(<WithdrawalModal toggleModal={mockToggleModal} />);

      expect(screen.getByPlaceholderText("$0")).toBeInTheDocument();
    });

    it("handles very small withdrawal amounts", async () => {
      render(<WithdrawalModal toggleModal={mockToggleModal} />);

      const input = screen.getByPlaceholderText("$0");
      await userEvent.type(input, "0.01");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      expect(submitButton).not.toBeDisabled();
    });

    it("handles rapid input changes", async () => {
      render(<WithdrawalModal toggleModal={mockToggleModal} />);

      const input = screen.getByPlaceholderText("$0");

      await userEvent.type(input, "100");
      await userEvent.clear(input);
      await userEvent.type(input, "200");
      await userEvent.clear(input);
      await userEvent.type(input, "50");

      const inputElement = input as HTMLInputElement;
      expect(inputElement.value).toBe("50");
    });

    it("handles clearing input after error", async () => {
      (withdrawFromHyperliquid as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Error"),
      );

      render(<WithdrawalModal toggleModal={mockToggleModal} />);

      const input = screen.getByPlaceholderText("$0");
      await userEvent.type(input, "100");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith("Something went wrong");
      });

      // Clear input and try again
      await userEvent.clear(input);
      await userEvent.type(input, "50");

      expect((input as HTMLInputElement).value).toBe("50");
    });
  });

  describe("Fee Information", () => {
    it("displays fee information prominently", () => {
      render(<WithdrawalModal toggleModal={mockToggleModal} />);

      expect(screen.getByText(/a 1 USDC fee will be deducted from the amount you're about to send/i)).toBeInTheDocument();
    });

    it("shows that withdrawal goes to Arbitrum network", () => {
      render(<WithdrawalModal toggleModal={mockToggleModal} />);

      expect(screen.getByText(/USDC Will be sent to your address over the arbitrum network/i)).toBeInTheDocument();
    });
  });

  describe("Type Safety", () => {
    it("passes string value to withdrawal function", async () => {
      render(<WithdrawalModal toggleModal={mockToggleModal} />);

      const input = screen.getByPlaceholderText("$0");
      await userEvent.type(input, "75.50");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(withdrawFromHyperliquid).toHaveBeenCalledWith(
          expect.anything(),
          expect.any(String),
          "75.50",
          true,
        );
      });
    });

    it("validates max value is number comparison", async () => {
      (useGetPerpBalance as ReturnType<typeof vi.fn>).mockReturnValue({
        data: {
          withdrawable: "100",
        },
      });

      render(<WithdrawalModal toggleModal={mockToggleModal} />);

      const input = screen.getByPlaceholderText("$0");
      await userEvent.type(input, "150");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe("User Flow", () => {
    it("completes full withdrawal flow successfully", async () => {
      render(<WithdrawalModal toggleModal={mockToggleModal} />);

      // Step 1: Enter amount
      const input = screen.getByPlaceholderText("$0");
      await userEvent.type(input, "250");

      // Step 2: Submit
      const submitButton = screen.getByRole("button", { name: /submit/i });
      expect(submitButton).not.toBeDisabled();
      await userEvent.click(submitButton);

      // Step 3: Verify withdrawal called
      await waitFor(() => {
        expect(withdrawFromHyperliquid).toHaveBeenCalledWith(
          mockWalletClient.data,
          "0x123",
          "250",
          true,
        );
      });

      // Step 4: Verify success actions
      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith("Withdrawal Successful");
        expect(mockToggleModal).toHaveBeenCalled();
        expect(mockInvalidateQueries).toHaveBeenCalled();
      });
    });

    it("allows retry after failed withdrawal", async () => {
      // First attempt fails
      (withdrawFromHyperliquid as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: "error",
      });

      render(<WithdrawalModal toggleModal={mockToggleModal} />);

      const input = screen.getByPlaceholderText("$0");
      await userEvent.type(input, "100");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith("Something went wrong");
      });

      // Second attempt succeeds
      (withdrawFromHyperliquid as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: "ok",
      });

      await userEvent.clear(input);
      await userEvent.type(input, "100");
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith("Withdrawal Successful");
      });
    });
  });

  describe("Withdrawal Parameters", () => {
    it("passes correct wallet client to withdrawal function", async () => {
      render(<WithdrawalModal toggleModal={mockToggleModal} />);

      const input = screen.getByPlaceholderText("$0");
      await userEvent.type(input, "100");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(withdrawFromHyperliquid).toHaveBeenCalledWith(
          "mock-wallet-client",
          expect.anything(),
          expect.anything(),
          expect.anything(),
        );
      });
    });

    it("passes correct wallet address to withdrawal function", async () => {
      render(<WithdrawalModal toggleModal={mockToggleModal} />);

      const input = screen.getByPlaceholderText("$0");
      await userEvent.type(input, "100");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(withdrawFromHyperliquid).toHaveBeenCalledWith(
          expect.anything(),
          "0x123",
          expect.anything(),
          expect.anything(),
        );
      });
    });

    it("passes true as final parameter", async () => {
      render(<WithdrawalModal toggleModal={mockToggleModal} />);

      const input = screen.getByPlaceholderText("$0");
      await userEvent.type(input, "100");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(withdrawFromHyperliquid).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          expect.anything(),
          true,
        );
      });
    });
  });
});
