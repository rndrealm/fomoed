import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAccount } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import "@testing-library/jest-dom/vitest";
import CloseOrder from "@/components/widgets/trading/hyperliquid/trading-panel/modals/close-order";
import { useSupabaseAuth } from "@/components/providers";
import { useExecuteTrade } from "@/services/queries/trading";
import { useTicker } from "@/components/widgets/trading/chart/trading-view/hyperliquid/use-ticker";
import { formatHlPrice, formatHlSize } from "@/components/widgets/trading/utils";
import { PERP_MAX_DECIMALS, SPOT_MAX_DECIMALS } from "@/components/widgets/trading/utils/constants";

// Mock all dependencies
vi.mock("wagmi");
vi.mock("@tanstack/react-query");
vi.mock("@/components/providers");
vi.mock("@/services/queries/trading");
vi.mock("@/components/widgets/trading/chart/trading-view/hyperliquid/use-ticker");
vi.mock("@/components/widgets/trading/hyperliquid/create-order/order-check-layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("CloseOrder Modal Component", () => {
  const mockToggleModal = vi.fn();
  const mockMutate = vi.fn();
  const mockInvalidateQueries = vi.fn();

  const mockSelectedToken = {
    szDecimals: 5,
    name: "BTC",
    maxLeverage: 40,
    marginTableId: 54,
    symbol: "BTC",
    isSpot: false,
    baseTokenName: "BTC",
    quoteTokenName: "USDC",
    tradingViewName: '{"baseTokenName":"BTC","quoteTokenName":"USDC","price":"86031.0","isSpot":false,"name":"BTC"}',
    priceVolume: {
      funding: "-0.0000507921",
      openInterest: "64.04052",
      prevDayPx: "89822.0",
      dayNtlVlm: "4489981.5206300002",
      premium: "-0.0010947168",
      oraclePx: "86141.0",
      markPx: "86031.0",
      midPx: "86025.0",
      impactPxs: ["85928.0", "86046.7"],
      dayBaseVlm: "51.72342",
    },
    displayName: "BTC-USDC",
    index: 3,
  };

  const defaultOrder = {
    coin: "BTC",
    size: "1.5",
    isLong: true,
    leverage: 10,
    selectedToken: mockSelectedToken,
    isSpot: false,
  };

  // Helper function to calculate maxDecimal based on asset type and szDecimals
  const getMaxDecimal = (isSpot: boolean, szDecimals: number) => {
    return (isSpot ? SPOT_MAX_DECIMALS : PERP_MAX_DECIMALS) - szDecimals;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (useAccount as ReturnType<typeof vi.fn>).mockReturnValue({
      address: "0x123",
    });

    (useQueryClient as ReturnType<typeof vi.fn>).mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    });

    (useSupabaseAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      session: {
        access_token: "mock-token",
      },
    });

    (useExecuteTrade as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    (useTicker as ReturnType<typeof vi.fn>).mockReturnValue({
      ticker: {
        coin: "BTC",
        ctx: {
          midPx: "86025.0",
        },
      },
    });
  });

  describe("Component Rendering", () => {
    it("renders market order modal correctly", () => {
      render(<CloseOrder toggleModal={mockToggleModal} isMarket={true} order={defaultOrder} />);

      expect(screen.getByText("This will attempt to immediately close the position.")).toBeInTheDocument();
      expect(screen.getByText("Size")).toBeInTheDocument();
      expect(screen.getByText("Price")).toBeInTheDocument();
    });

    it("renders limit order modal correctly", () => {
      render(<CloseOrder toggleModal={mockToggleModal} isMarket={false} order={defaultOrder} />);

      expect(screen.getByText("Ask $86025.0 (Live Ask)")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Price")).toBeInTheDocument();
    });

    it("displays order information for market order", () => {
      render(<CloseOrder toggleModal={mockToggleModal} isMarket={true} order={defaultOrder} />);

      expect(screen.getByText("1.5 BTC")).toBeInTheDocument();
      expect(screen.getByText("Market ($86025.0)")).toBeInTheDocument();
    });

    it("displays long position in red color", () => {
      render(<CloseOrder toggleModal={mockToggleModal} isMarket={true} order={defaultOrder} />);

      const sizeElement = screen.getByText("1.5 BTC");
      expect(sizeElement).toHaveClass("text-[#FF6B6B]");
    });

    it("displays short position in green color", () => {
      const shortOrder = { ...defaultOrder, isLong: false };
      render(<CloseOrder toggleModal={mockToggleModal} isMarket={true} order={shortOrder} />);

      const sizeElement = screen.getByText("1.5 BTC");
      expect(sizeElement).toHaveClass("text-[#4ADE80]");
    });

    it("shows size input field", () => {
      render(<CloseOrder toggleModal={mockToggleModal} isMarket={true} order={defaultOrder} />);

      const sizeInput = screen.getByPlaceholderText("Size");
      expect(sizeInput).toBeInTheDocument();
      expect(sizeInput).toHaveAttribute("type", "text");
    });

    it("shows price input field for limit orders", () => {
      render(<CloseOrder toggleModal={mockToggleModal} isMarket={false} order={defaultOrder} />);

      const priceInput = screen.getByPlaceholderText("Price");
      expect(priceInput).toBeInTheDocument();
      expect(priceInput).toHaveAttribute("type", "text");
    });

    it("displays submit button", () => {
      render(<CloseOrder toggleModal={mockToggleModal} isMarket={true} order={defaultOrder} />);

      const submitButton = screen.getByRole("button", { name: "Submit" });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute("type", "button");
    });

    it("displays slider for size adjustment", () => {
      render(<CloseOrder toggleModal={mockToggleModal} isMarket={true} order={defaultOrder} />);

      const slider = document.querySelector('[role="slider"]');
      expect(slider).toBeInTheDocument();
    });
  });

  describe("Market Order Functionality", () => {
    it("initializes with correct default size", () => {
      render(<CloseOrder toggleModal={mockToggleModal} isMarket={true} order={defaultOrder} />);

      const sizeInput = screen.getByPlaceholderText("Size") as HTMLInputElement;
      expect(sizeInput.value).toBe("1.5");
    });

    it("allows changing size via input", async () => {
      const user = userEvent.setup();
      render(<CloseOrder toggleModal={mockToggleModal} isMarket={true} order={defaultOrder} />);

      const sizeInput = screen.getByPlaceholderText("Size");
      await user.clear(sizeInput);
      await user.type(sizeInput, "0.5");

      expect(sizeInput).toHaveValue("0.5");
    });

    it("formats size input based on szDecimals", async () => {
      const user = userEvent.setup();
      render(<CloseOrder toggleModal={mockToggleModal} isMarket={true} order={defaultOrder} />);

      const sizeInput = screen.getByPlaceholderText("Size");
      await user.clear(sizeInput);
      // Try to input more decimals than allowed
      await user.type(sizeInput, "1.123456789");

      // Should be truncated based on szDecimals (5) - actual behavior depends on formatHlSizeInput
      const value = (sizeInput as HTMLInputElement).value;
      expect(value.split(".")[1]?.length || 0).toBeLessThanOrEqual(5);
    });

    it("submits market order with correct payload", async () => {
      const user = userEvent.setup();
      render(<CloseOrder toggleModal={mockToggleModal} isMarket={true} order={defaultOrder} />);

      const submitButton = screen.getByRole("button", { name: "Submit" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          expect.objectContaining({
            provider: "hyperliquid",
            wallet_address: "0x123",
            grouping: "na",
            orders: expect.arrayContaining([
              expect.objectContaining({
                asset: 3, // Perp asset index
                side: "sell", // Long position closes with sell
                size: formatHlSize(Number(defaultOrder.size), mockSelectedToken.szDecimals),
                type: "market",
                reduceOnly: true,
                isSpot: false,
              }),
            ]),
          }),
        );
      });
    });

    it("uses buy side for short positions", async () => {
      const user = userEvent.setup();
      const shortOrder = { ...defaultOrder, isLong: false };
      render(<CloseOrder toggleModal={mockToggleModal} isMarket={true} order={shortOrder} />);

      const submitButton = screen.getByRole("button", { name: "Submit" });
      await user.click(submitButton);

      await waitFor(() => {
        const call = mockMutate.mock.calls[0][0];
        expect(call.orders[0].side).toBe("buy"); // Short position closes with buy
      });
    });

    it("disables submit button when size is zero", () => {
      const zeroOrder = { ...defaultOrder, size: "0" };
      render(<CloseOrder toggleModal={mockToggleModal} isMarket={true} order={zeroOrder} />);

      const submitButton = screen.getByRole("button", { name: "Submit" });
      expect(submitButton).toBeDisabled();
    });

    it("disables submit button when size is negative", async () => {
      const user = userEvent.setup();
      render(<CloseOrder toggleModal={mockToggleModal} isMarket={true} order={defaultOrder} />);

      const sizeInput = screen.getByPlaceholderText("Size");
      await user.clear(sizeInput);
      await user.type(sizeInput, "-1");

      const submitButton = screen.getByRole("button", { name: "Submit" });
      expect(submitButton).toBeDisabled();
    });
  });

  describe("Limit Order Functionality", () => {
    it("shows price input for limit orders", () => {
      render(<CloseOrder toggleModal={mockToggleModal} isMarket={false} order={defaultOrder} />);

      const priceInput = screen.getByPlaceholderText("Price");
      expect(priceInput).toBeInTheDocument();
    });

    it("allows setting price via input", async () => {
      const user = userEvent.setup();
      render(<CloseOrder toggleModal={mockToggleModal} isMarket={false} order={defaultOrder} />);

      const priceInput = screen.getByPlaceholderText("Price");
      await user.type(priceInput, "86500");

      expect(priceInput).toHaveValue("86500");
    });

    it("formats price input based on maxDecimal", async () => {
      const user = userEvent.setup();
      render(<CloseOrder toggleModal={mockToggleModal} isMarket={false} order={defaultOrder} />);

      const priceInput = screen.getByPlaceholderText("Price");
      // Try to input more decimals than allowed (maxDecimal = PERP_MAX_DECIMALS(6) - szDecimals(5) = 1)
      await user.type(priceInput, "86500.999");

      const value = (priceInput as HTMLInputElement).value;
      // Should be truncated to 1 decimal place
      expect(value.split(".")[1]?.length || 0).toBeLessThanOrEqual(1);
    });

    it("shows 'Mid' button to set current price", async () => {
      const user = userEvent.setup();
      render(<CloseOrder toggleModal={mockToggleModal} isMarket={false} order={defaultOrder} />);

      const midButton = screen.getByText("Mid");
      expect(midButton).toBeInTheDocument();

      await user.click(midButton);

      const priceInput = screen.getByPlaceholderText("Price") as HTMLInputElement;
      expect(priceInput.value).toBe("86025");
    });

    it("submits limit order with correct payload", async () => {
      const user = userEvent.setup();
      render(<CloseOrder toggleModal={mockToggleModal} isMarket={false} order={defaultOrder} />);

      const priceInput = screen.getByPlaceholderText("Price");
      await user.type(priceInput, "86500");

      const submitButton = screen.getByRole("button", { name: "Submit" });
      await user.click(submitButton);

      await waitFor(() => {
        const maxDecimal = getMaxDecimal(defaultOrder.isSpot, mockSelectedToken.szDecimals);
        expect(mockMutate).toHaveBeenCalledWith(
          expect.objectContaining({
            provider: "hyperliquid",
            wallet_address: "0x123",
            grouping: "na",
            orders: expect.arrayContaining([
              expect.objectContaining({
                asset: 3,
                side: "sell",
                size: formatHlSize(Number(defaultOrder.size), mockSelectedToken.szDecimals),
                type: "limit",
                reduceOnly: true,
                price: formatHlPrice(86500, maxDecimal),
              }),
            ]),
          }),
        );
      });
    });

    it("disables submit button when price is not set for limit orders", () => {
      render(<CloseOrder toggleModal={mockToggleModal} isMarket={false} order={defaultOrder} />);

      const submitButton = screen.getByRole("button", { name: "Submit" });
      expect(submitButton).toBeDisabled();
    });

    it("enables submit button when both price and size are set", async () => {
      const user = userEvent.setup();
      render(<CloseOrder toggleModal={mockToggleModal} isMarket={false} order={defaultOrder} />);

      const priceInput = screen.getByPlaceholderText("Price");
      await user.type(priceInput, "86500");

      const submitButton = screen.getByRole("button", { name: "Submit" });
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe("Slider Functionality", () => {
    it("updates size when slider changes", async () => {
      const user = userEvent.setup();
      render(<CloseOrder toggleModal={mockToggleModal} isMarket={true} order={defaultOrder} />);

      const slider = document.querySelector('[role="slider"]') as HTMLElement;
      expect(slider).toBeInTheDocument();

      // Slider percentage should start at 100% since size equals order size
      const percentageInput = screen.getByDisplayValue("100") as HTMLInputElement;
      expect(percentageInput).toBeInTheDocument();
    });

    it("calculates correct percentage for current size", () => {
      render(<CloseOrder toggleModal={mockToggleModal} isMarket={true} order={defaultOrder} />);

      // Size is 1.5, orderSize is 1.5, so percentage should be 100%
      const percentageInput = screen.getByDisplayValue("100");
      expect(percentageInput).toBeInTheDocument();
    });

    it("allows changing percentage via input", async () => {
      const user = userEvent.setup();
      render(<CloseOrder toggleModal={mockToggleModal} isMarket={true} order={defaultOrder} />);

      const percentageInput = screen.getByDisplayValue("100");
      await user.clear(percentageInput);
      await user.type(percentageInput, "50");

      expect(percentageInput).toHaveValue("50");
    });

    it("updates size when percentage changes", async () => {
      const user = userEvent.setup();
      render(<CloseOrder toggleModal={mockToggleModal} isMarket={true} order={defaultOrder} />);

      const percentageInput = screen.getByDisplayValue("100");
      await user.clear(percentageInput);
      await user.type(percentageInput, "50");

      // Size should be 50% of 1.5 = 0.75
      const sizeInput = screen.getByPlaceholderText("Size") as HTMLInputElement;
      expect(parseFloat(sizeInput.value)).toBeCloseTo(0.75, 2);
    });
  });

  describe("Spot vs Perp Asset Index", () => {
    it("uses correct asset index for perp", async () => {
      const user = userEvent.setup();
      render(<CloseOrder toggleModal={mockToggleModal} isMarket={true} order={defaultOrder} />);

      const submitButton = screen.getByRole("button", { name: "Submit" });
      await user.click(submitButton);

      await waitFor(() => {
        const call = mockMutate.mock.calls[0][0];
        expect(call.orders[0].asset).toBe(3); // Perp uses index directly
      });
    });

    it("uses correct asset index for spot (index + 10000)", async () => {
      const user = userEvent.setup();
      const spotOrder = { ...defaultOrder, isSpot: true };
      render(<CloseOrder toggleModal={mockToggleModal} isMarket={true} order={spotOrder} />);

      const submitButton = screen.getByRole("button", { name: "Submit" });
      await user.click(submitButton);

      await waitFor(() => {
        const call = mockMutate.mock.calls[0][0];
        expect(call.orders[0].asset).toBe(10003); // Spot uses index + 10000
      });
    });
  });

  describe("Precision Formatting", () => {
    it("formats size correctly based on szDecimals", async () => {
      const user = userEvent.setup();
      render(<CloseOrder toggleModal={mockToggleModal} isMarket={true} order={defaultOrder} />);

      const submitButton = screen.getByRole("button", { name: "Submit" });
      await user.click(submitButton);

      await waitFor(() => {
        const call = mockMutate.mock.calls[0][0];
        const expectedSize = formatHlSize(Number(defaultOrder.size), mockSelectedToken.szDecimals);
        expect(call.orders[0].size).toBe(expectedSize);
      });
    });

    it("formats price correctly based on maxDecimal for perp", async () => {
      const user = userEvent.setup();
      render(<CloseOrder toggleModal={mockToggleModal} isMarket={false} order={defaultOrder} />);

      const priceInput = screen.getByPlaceholderText("Price");
      await user.type(priceInput, "86500.5");

      const submitButton = screen.getByRole("button", { name: "Submit" });
      await user.click(submitButton);

      await waitFor(() => {
        const call = mockMutate.mock.calls[0][0];
        const maxDecimal = getMaxDecimal(false, mockSelectedToken.szDecimals); // PERP_MAX_DECIMALS(6) - 5 = 1
        const expectedPrice = formatHlPrice(86500.5, maxDecimal);
        expect(call.orders[0].price).toBe(expectedPrice);
      });
    });

    it("formats price correctly based on maxDecimal for spot", async () => {
      const user = userEvent.setup();
      const spotOrder = { ...defaultOrder, isSpot: true };
      render(<CloseOrder toggleModal={mockToggleModal} isMarket={false} order={spotOrder} />);

      const priceInput = screen.getByPlaceholderText("Price");
      await user.type(priceInput, "86500.123");

      const submitButton = screen.getByRole("button", { name: "Submit" });
      await user.click(submitButton);

      await waitFor(() => {
        const call = mockMutate.mock.calls[0][0];
        const maxDecimal = getMaxDecimal(true, mockSelectedToken.szDecimals); // SPOT_MAX_DECIMALS(8) - 5 = 3
        const expectedPrice = formatHlPrice(86500.123, maxDecimal);
        expect(call.orders[0].price).toBe(expectedPrice);
      });
    });
  });

  describe("Loading States", () => {
    it("shows loading state when isPending is true", () => {
      (useExecuteTrade as ReturnType<typeof vi.fn>).mockReturnValue({
        mutate: mockMutate,
        isPending: true,
      });

      render(<CloseOrder toggleModal={mockToggleModal} isMarket={true} order={defaultOrder} />);

      const submitButton = screen.getByRole("button", { name: "Submit" });
      expect(submitButton).toBeDisabled();
    });

    it("enables submit button when not loading and form is valid", () => {
      render(<CloseOrder toggleModal={mockToggleModal} isMarket={true} order={defaultOrder} />);

      const submitButton = screen.getByRole("button", { name: "Submit" });
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe("Callback Functionality", () => {
    it("calls onSuccess callback and invalidates queries after successful submission", async () => {
      let successCallback: (() => void) | undefined;

      (useExecuteTrade as ReturnType<typeof vi.fn>).mockImplementation((_token: any, onSuccess: () => void) => {
        successCallback = onSuccess;
        return {
          mutate: mockMutate,
          isPending: false,
        };
      });

      const user = userEvent.setup();
      render(<CloseOrder toggleModal={mockToggleModal} isMarket={true} order={defaultOrder} />);

      const submitButton = screen.getByRole("button", { name: "Submit" });
      await user.click(submitButton);

      // Simulate success
      if (successCallback) {
        successCallback();
      }

      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ["hyper-liquid-balance"] });
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ["hyper-liquid-balance-spot"] });
      expect(mockToggleModal).toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("handles missing ticker data gracefully", () => {
      (useTicker as ReturnType<typeof vi.fn>).mockReturnValue({
        ticker: null,
      });

      render(<CloseOrder toggleModal={mockToggleModal} isMarket={false} order={defaultOrder} />);

      // Should still render but with 0 as current price
      expect(screen.getByPlaceholderText("Price")).toBeInTheDocument();
    });

    it("handles very small position sizes", async () => {
      const user = userEvent.setup();
      const smallOrder = { ...defaultOrder, size: "0.00001" };
      render(<CloseOrder toggleModal={mockToggleModal} isMarket={true} order={smallOrder} />);

      const submitButton = screen.getByRole("button", { name: "Submit" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled();
      });
    });

    it("handles very large position sizes", () => {
      const largeOrder = { ...defaultOrder, size: "999999.99999" };
      render(<CloseOrder toggleModal={mockToggleModal} isMarket={true} order={largeOrder} />);

      expect(screen.getByText("999999.99999 BTC")).toBeInTheDocument();
    });

    it("handles empty size input gracefully", async () => {
      const user = userEvent.setup();
      render(<CloseOrder toggleModal={mockToggleModal} isMarket={true} order={defaultOrder} />);

      const sizeInput = screen.getByPlaceholderText("Size");
      await user.clear(sizeInput);

      const submitButton = screen.getByRole("button", { name: "Submit" });
      expect(submitButton).toBeDisabled();
    });

    it("handles decimal point only in size input", async () => {
      const user = userEvent.setup();
      render(<CloseOrder toggleModal={mockToggleModal} isMarket={true} order={defaultOrder} />);

      const sizeInput = screen.getByPlaceholderText("Size");
      await user.clear(sizeInput);
      await user.type(sizeInput, ".");

      const submitButton = screen.getByRole("button", { name: "Submit" });
      expect(submitButton).toBeDisabled();
    });

    it("handles decimal point only in price input", async () => {
      const user = userEvent.setup();
      render(<CloseOrder toggleModal={mockToggleModal} isMarket={false} order={defaultOrder} />);

      const priceInput = screen.getByPlaceholderText("Price");
      await user.type(priceInput, ".");

      const submitButton = screen.getByRole("button", { name: "Submit" });
      expect(submitButton).toBeDisabled();
    });
  });

  describe("Type Safety", () => {
    it("ensures size is formatted as string", async () => {
      const user = userEvent.setup();
      render(<CloseOrder toggleModal={mockToggleModal} isMarket={true} order={defaultOrder} />);

      const submitButton = screen.getByRole("button", { name: "Submit" });
      await user.click(submitButton);

      await waitFor(() => {
        const call = mockMutate.mock.calls[0][0];
        expect(typeof call.orders[0].size).toBe("string");
      });
    });

    it("ensures price is formatted as string for limit orders", async () => {
      const user = userEvent.setup();
      render(<CloseOrder toggleModal={mockToggleModal} isMarket={false} order={defaultOrder} />);

      const priceInput = screen.getByPlaceholderText("Price");
      await user.type(priceInput, "86500");

      const submitButton = screen.getByRole("button", { name: "Submit" });
      await user.click(submitButton);

      await waitFor(() => {
        const call = mockMutate.mock.calls[0][0];
        expect(typeof call.orders[0].price).toBe("string");
      });
    });

    it("ensures asset is a number", async () => {
      const user = userEvent.setup();
      render(<CloseOrder toggleModal={mockToggleModal} isMarket={true} order={defaultOrder} />);

      const submitButton = screen.getByRole("button", { name: "Submit" });
      await user.click(submitButton);

      await waitFor(() => {
        const call = mockMutate.mock.calls[0][0];
        expect(typeof call.orders[0].asset).toBe("number");
      });
    });

    it("ensures boolean flags are booleans", async () => {
      const user = userEvent.setup();
      render(<CloseOrder toggleModal={mockToggleModal} isMarket={true} order={defaultOrder} />);

      const submitButton = screen.getByRole("button", { name: "Submit" });
      await user.click(submitButton);

      await waitFor(() => {
        const call = mockMutate.mock.calls[0][0];
        expect(typeof call.orders[0].reduceOnly).toBe("boolean");
        expect(typeof call.orders[0].isSpot).toBe("boolean");
      });
    });
  });

  describe("Different Token Decimals", () => {
    it("handles token with szDecimals=3", async () => {
      const user = userEvent.setup();
      const tokenWith3Decimals = { ...mockSelectedToken, szDecimals: 3 };
      const orderWith3Decimals = { ...defaultOrder, selectedToken: tokenWith3Decimals };

      render(<CloseOrder toggleModal={mockToggleModal} isMarket={true} order={orderWith3Decimals} />);

      const submitButton = screen.getByRole("button", { name: "Submit" });
      await user.click(submitButton);

      await waitFor(() => {
        const call = mockMutate.mock.calls[0][0];
        const expectedSize = formatHlSize(Number(defaultOrder.size), 3);
        expect(call.orders[0].size).toBe(expectedSize);
      });
    });

    it("calculates correct maxDecimal for different szDecimals values", () => {
      // Perp with szDecimals=3: maxDecimal = 6 - 3 = 3
      const perpMaxDecimal = getMaxDecimal(false, 3);
      expect(perpMaxDecimal).toBe(3);

      // Spot with szDecimals=3: maxDecimal = 8 - 3 = 5
      const spotMaxDecimal = getMaxDecimal(true, 3);
      expect(spotMaxDecimal).toBe(5);
    });
  });
});
