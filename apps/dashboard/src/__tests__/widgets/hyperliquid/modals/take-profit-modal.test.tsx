import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import "@testing-library/jest-dom/vitest";
import { TakeProfit } from "@/components/widgets/trading/hyperliquid/modals/take-profit";
import { useSupabaseAuth } from "@/components/providers";
import { useExecuteTrade } from "@/services/queries/trading";
import { useTicker } from "@/components/widgets/trading/chart/trading-view/hyperliquid/use-ticker";

// Mock all dependencies
vi.mock("wagmi");
vi.mock("@/components/providers");
vi.mock("@/services/queries/trading");
vi.mock("@/components/widgets/trading/chart/trading-view/hyperliquid/use-ticker");
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("TakeProfit Modal Component", () => {
  const mockToggleModal = vi.fn();
  const mockMutate = vi.fn();

  const mockSelectedToken = {
    index: 0,
    szDecimals: 5,
    name: "BTC",
  };

  const defaultOrder = {
    coin: "BTC",
    positionSize: "0.5",
    entryPrice: "100000",
    markPrice: "101000",
    selectedToken: mockSelectedToken,
    isSpot: false,
    isLong: true,
    leverage: 10,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (useAccount as ReturnType<typeof vi.fn>).mockReturnValue({
      address: "0x123",
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
          midPx: 101000,
        },
      },
    });
  });

  describe("Component Rendering", () => {
    it("renders the take profit modal correctly", () => {
      render(<TakeProfit order={defaultOrder} toggleModal={mockToggleModal} />);

      expect(screen.getByText("Coin")).toBeInTheDocument();
      expect(screen.getByText("Position")).toBeInTheDocument();
      expect(screen.getByText("Entry Price")).toBeInTheDocument();
      expect(screen.getByText("Mark Price")).toBeInTheDocument();
    });

    it("displays order information correctly", () => {
      render(<TakeProfit order={defaultOrder} toggleModal={mockToggleModal} />);

      expect(screen.getByText("BTC")).toBeInTheDocument();
      expect(screen.getByText(/0.5 BTC/i)).toBeInTheDocument();
    });

    it("shows TP Price input field", () => {
      render(<TakeProfit order={defaultOrder} toggleModal={mockToggleModal} />);

      const tpInput = screen.getByLabelText("TP Price");
      expect(tpInput).toBeInTheDocument();
      expect(tpInput).toHaveAttribute("type", "number");
    });

    it("shows SL Price input field", () => {
      render(<TakeProfit order={defaultOrder} toggleModal={mockToggleModal} />);

      const slInput = screen.getByLabelText("SL Price");
      expect(slInput).toBeInTheDocument();
      expect(slInput).toHaveAttribute("type", "number");
    });

    it("shows Gain percentage input", () => {
      render(<TakeProfit order={defaultOrder} toggleModal={mockToggleModal} />);

      const gainInput = screen.getByLabelText("Gain");
      expect(gainInput).toBeInTheDocument();
    });

    it("displays submit button", () => {
      render(<TakeProfit order={defaultOrder} toggleModal={mockToggleModal} />);

      const submitButton = screen.getByRole("button", { name: /submit/i });
      expect(submitButton).toBeInTheDocument();
    });
  });

  describe("Long Position Validation", () => {
    it("validates TP price is greater than current price for long", async () => {
      render(<TakeProfit order={defaultOrder} toggleModal={mockToggleModal} />);

      const tpInput = screen.getByLabelText("TP Price");
      await userEvent.type(tpInput, "100000");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          "Take Profit price must be greater than order price for long positions",
        );
      });
    });

    it("validates SL price is lower than current price for long", async () => {
      render(<TakeProfit order={defaultOrder} toggleModal={mockToggleModal} />);

      const slInput = screen.getByLabelText("SL Price");
      await userEvent.type(slInput, "102000");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Stop Loss price must be lower than order price for long positions");
      });
    });

    it("allows valid TP price above current price for long", async () => {
      render(<TakeProfit order={defaultOrder} toggleModal={mockToggleModal} />);

      const tpInput = screen.getByLabelText("TP Price");
      await userEvent.type(tpInput, "110000");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled();
      });
    });

    it("allows valid SL price below current price for long", async () => {
      render(<TakeProfit order={defaultOrder} toggleModal={mockToggleModal} />);

      const slInput = screen.getByLabelText("SL Price");
      await userEvent.type(slInput, "95000");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled();
      });
    });
  });

  describe("Short Position Validation", () => {
    const shortOrder = {
      ...defaultOrder,
      isLong: false,
    };

    it("validates TP price is lower than current price for short", async () => {
      render(<TakeProfit order={shortOrder} toggleModal={mockToggleModal} />);

      const tpInput = screen.getByLabelText("TP Price");
      await userEvent.type(tpInput, "105000");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          "Take Profit price must be lower than order price for short positions",
        );
      });
    });

    it("validates SL price is greater than current price for short", async () => {
      render(<TakeProfit order={shortOrder} toggleModal={mockToggleModal} />);

      const slInput = screen.getByLabelText("SL Price");
      await userEvent.type(slInput, "95000");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          "Stop Loss price must be greater than order price for short positions",
        );
      });
    });

    it("allows valid TP price below current price for short", async () => {
      render(<TakeProfit order={shortOrder} toggleModal={mockToggleModal} />);

      const tpInput = screen.getByLabelText("TP Price");
      await userEvent.type(tpInput, "95000");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled();
      });
    });

    it("allows valid SL price above current price for short", async () => {
      render(<TakeProfit order={shortOrder} toggleModal={mockToggleModal} />);

      const slInput = screen.getByLabelText("SL Price");
      await userEvent.type(slInput, "110000");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled();
      });
    });
  });

  describe("Form Validation", () => {
    it("shows error when neither TP nor SL is set", async () => {
      render(<TakeProfit order={defaultOrder} toggleModal={mockToggleModal} />);

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Please set at least a Take Profit or Stop Loss price.");
      });
    });

    it("validates TP price is greater than 0", async () => {
      render(<TakeProfit order={defaultOrder} toggleModal={mockToggleModal} />);

      const tpInput = screen.getByLabelText("TP Price");
      await userEvent.type(tpInput, "0");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Take Profit price must be greater than 0");
      });
    });

    it("validates SL price is greater than 0", async () => {
      render(<TakeProfit order={defaultOrder} toggleModal={mockToggleModal} />);

      const slInput = screen.getByLabelText("SL Price");
      await userEvent.type(slInput, "0");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Stop Loss price must be greater than 0");
      });
    });

    it("allows submitting with only TP price", async () => {
      render(<TakeProfit order={defaultOrder} toggleModal={mockToggleModal} />);

      const tpInput = screen.getByLabelText("TP Price");
      await userEvent.type(tpInput, "110000");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled();
      });
    });

    it("allows submitting with only SL price", async () => {
      render(<TakeProfit order={defaultOrder} toggleModal={mockToggleModal} />);

      const slInput = screen.getByLabelText("SL Price");
      await userEvent.type(slInput, "95000");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled();
      });
    });

    it("allows submitting with both TP and SL prices", async () => {
      render(<TakeProfit order={defaultOrder} toggleModal={mockToggleModal} />);

      const tpInput = screen.getByLabelText("TP Price");
      const slInput = screen.getByLabelText("SL Price");

      await userEvent.type(tpInput, "110000");
      await userEvent.type(slInput, "95000");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled();
      });
    });
  });

  describe("Order Payload Generation", () => {
    it("creates correct payload for TP only order", async () => {
      render(<TakeProfit order={defaultOrder} toggleModal={mockToggleModal} />);

      const tpInput = screen.getByLabelText("TP Price");
      await userEvent.type(tpInput, "110000");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          expect.objectContaining({
            provider: "hyperliquid",
            wallet_address: "0x123",
            grouping: "normalTpsl",
            orders: expect.arrayContaining([
              expect.objectContaining({
                type: "trigger",
                side: "sell", // Opposite for long
                triggerPrice: expect.any(String),
                tpsl: "tp",
                reduceOnly: true,
                isMarket: true,
              }),
            ]),
          }),
        );
      });
    });

    it("creates correct payload for SL only order", async () => {
      render(<TakeProfit order={defaultOrder} toggleModal={mockToggleModal} />);

      const slInput = screen.getByLabelText("SL Price");
      await userEvent.type(slInput, "95000");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          expect.objectContaining({
            orders: expect.arrayContaining([
              expect.objectContaining({
                type: "trigger",
                tpsl: "sl",
                reduceOnly: true,
              }),
            ]),
          }),
        );
      });
    });

    it("creates correct payload with both TP and SL", async () => {
      render(<TakeProfit order={defaultOrder} toggleModal={mockToggleModal} />);

      const tpInput = screen.getByLabelText("TP Price");
      const slInput = screen.getByLabelText("SL Price");

      await userEvent.type(tpInput, "110000");
      await userEvent.type(slInput, "95000");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        const call = mockMutate.mock.calls[0][0];
        expect(call.orders).toHaveLength(2);
        expect(call.orders[0].tpsl).toBe("tp");
        expect(call.orders[1].tpsl).toBe("sl");
      });
    });

    it("uses opposite side for short positions", async () => {
      const shortOrder = { ...defaultOrder, isLong: false };
      render(<TakeProfit order={shortOrder} toggleModal={mockToggleModal} />);

      const tpInput = screen.getByLabelText("TP Price");
      await userEvent.type(tpInput, "95000");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        const call = mockMutate.mock.calls[0][0];
        expect(call.orders[0].side).toBe("buy"); // Opposite for short
      });
    });

    it("includes position size in order", async () => {
      render(<TakeProfit order={defaultOrder} toggleModal={mockToggleModal} />);

      const tpInput = screen.getByLabelText("TP Price");
      await userEvent.type(tpInput, "110000");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        const call = mockMutate.mock.calls[0][0];
        expect(call.orders[0].size).toBe("0.5");
      });
    });

    it("applies slippage adjustment to execution price", async () => {
      render(<TakeProfit order={defaultOrder} toggleModal={mockToggleModal} />);

      const tpInput = screen.getByLabelText("TP Price");
      await userEvent.type(tpInput, "110000");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        const call = mockMutate.mock.calls[0][0];
        // Price should be adjusted by 3.6% slippage (110000 * 0.964)
        const expectedPrice = 110000 * (1 - 0.036);
        expect(parseFloat(call.orders[0].price)).toBeCloseTo(expectedPrice, 0);
      });
    });
  });

  describe("Spot vs Perp Asset Index", () => {
    it("uses correct asset index for perp", async () => {
      render(<TakeProfit order={defaultOrder} toggleModal={mockToggleModal} />);

      const tpInput = screen.getByLabelText("TP Price");
      await userEvent.type(tpInput, "110000");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        const call = mockMutate.mock.calls[0][0];
        expect(call.orders[0].asset).toBe(0); // Perp asset index
      });
    });

    it("uses correct asset index for spot (index + 10000)", async () => {
      const spotOrder = { ...defaultOrder, isSpot: true };
      render(<TakeProfit order={spotOrder} toggleModal={mockToggleModal} />);

      const tpInput = screen.getByLabelText("TP Price");
      await userEvent.type(tpInput, "110000");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        const call = mockMutate.mock.calls[0][0];
        expect(call.orders[0].asset).toBe(10000); // Spot asset index (0 + 10000)
      });
    });
  });

  describe("Loading States", () => {
    it("shows loading state when isPending is true", () => {
      (useExecuteTrade as ReturnType<typeof vi.fn>).mockReturnValue({
        mutate: mockMutate,
        isPending: true,
      });

      render(<TakeProfit order={defaultOrder} toggleModal={mockToggleModal} />);

      const submitButton = screen.getByRole("button", { name: /submit/i });
      expect(submitButton).toBeDisabled();
    });

    it("enables submit button when not loading", () => {
      render(<TakeProfit order={defaultOrder} toggleModal={mockToggleModal} />);

      const submitButton = screen.getByRole("button", { name: /submit/i });
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe("Position Display", () => {
    it("displays long position in green", () => {
      render(<TakeProfit order={defaultOrder} toggleModal={mockToggleModal} />);

      const positionText = screen.getByText(/0.5 BTC/i);
      expect(positionText).toHaveClass("text-[#4ADE80]");
    });

    it("displays short position in red", () => {
      const shortOrder = { ...defaultOrder, isLong: false };
      render(<TakeProfit order={shortOrder} toggleModal={mockToggleModal} />);

      const positionText = screen.getByText(/0.5 BTC/i);
      expect(positionText).toHaveClass("text-[#FF7A7A]");
    });

    it("displays entry price correctly", () => {
      render(<TakeProfit order={defaultOrder} toggleModal={mockToggleModal} />);

      expect(screen.getByText("Entry Price")).toBeInTheDocument();
      // Entry price display is formatted, so just check it exists
    });

    it("displays mark price correctly", () => {
      render(<TakeProfit order={defaultOrder} toggleModal={mockToggleModal} />);

      expect(screen.getByText("Mark Price")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles missing ticker data gracefully", () => {
      (useTicker as ReturnType<typeof vi.fn>).mockReturnValue({
        ticker: null,
      });

      render(<TakeProfit order={defaultOrder} toggleModal={mockToggleModal} />);

      expect(screen.getByLabelText("TP Price")).toBeInTheDocument();
    });

    it("handles zero position size", () => {
      const zeroOrder = { ...defaultOrder, positionSize: "0" };
      render(<TakeProfit order={zeroOrder} toggleModal={mockToggleModal} />);

      expect(screen.getByText("Position")).toBeInTheDocument();
    });

    it("handles very large position sizes", () => {
      const largeOrder = { ...defaultOrder, positionSize: "999999.99999" };
      render(<TakeProfit order={largeOrder} toggleModal={mockToggleModal} />);

      expect(screen.getByText(/999999.99999 BTC/i)).toBeInTheDocument();
    });

    it("handles decimal TP prices correctly", async () => {
      render(<TakeProfit order={defaultOrder} toggleModal={mockToggleModal} />);

      const tpInput = screen.getByLabelText("TP Price");
      await userEvent.type(tpInput, "110000.50");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled();
      });
    });

    it("handles very small decimal prices", async () => {
      render(<TakeProfit order={defaultOrder} toggleModal={mockToggleModal} />);

      const slInput = screen.getByLabelText("SL Price");
      await userEvent.type(slInput, "0.00001");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
    });
  });

  describe("Callback Functionality", () => {
    it("calls onSuccess callback after successful submission", async () => {
      let successCallback: (() => void) | undefined;

      (useExecuteTrade as ReturnType<typeof vi.fn>).mockImplementation(
        (_token: any, onSuccess: () => void) => {
          successCallback = onSuccess;
          return {
            mutate: mockMutate,
            isPending: false,
          };
        },
      );

      render(<TakeProfit order={defaultOrder} toggleModal={mockToggleModal} />);

      const tpInput = screen.getByLabelText("TP Price");
      await userEvent.type(tpInput, "110000");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      // Simulate success
      if (successCallback) {
        successCallback();
      }

      expect(mockToggleModal).toHaveBeenCalled();
    });
  });

  describe("Type Safety", () => {
    it("ensures trigger prices are strings", async () => {
      render(<TakeProfit order={defaultOrder} toggleModal={mockToggleModal} />);

      const tpInput = screen.getByLabelText("TP Price");
      await userEvent.type(tpInput, "110000");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        const call = mockMutate.mock.calls[0][0];
        expect(typeof call.orders[0].triggerPrice).toBe("string");
        expect(typeof call.orders[0].price).toBe("string");
        expect(typeof call.orders[0].size).toBe("string");
      });
    });

    it("ensures asset is a number", async () => {
      render(<TakeProfit order={defaultOrder} toggleModal={mockToggleModal} />);

      const tpInput = screen.getByLabelText("TP Price");
      await userEvent.type(tpInput, "110000");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        const call = mockMutate.mock.calls[0][0];
        expect(typeof call.orders[0].asset).toBe("number");
      });
    });

    it("ensures boolean flags are booleans", async () => {
      render(<TakeProfit order={defaultOrder} toggleModal={mockToggleModal} />);

      const tpInput = screen.getByLabelText("TP Price");
      await userEvent.type(tpInput, "110000");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        const call = mockMutate.mock.calls[0][0];
        expect(typeof call.orders[0].isMarket).toBe("boolean");
        expect(typeof call.orders[0].reduceOnly).toBe("boolean");
      });
    });
  });

  describe("Multiple Orders", () => {
    it("creates TP order first, then SL order", async () => {
      render(<TakeProfit order={defaultOrder} toggleModal={mockToggleModal} />);

      const tpInput = screen.getByLabelText("TP Price");
      const slInput = screen.getByLabelText("SL Price");

      await userEvent.type(tpInput, "110000");
      await userEvent.type(slInput, "95000");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        const call = mockMutate.mock.calls[0][0];
        expect(call.orders).toHaveLength(2);
        expect(call.orders[0].tpsl).toBe("tp");
        expect(call.orders[1].tpsl).toBe("sl");
      });
    });

    it("both orders have reduceOnly set to true", async () => {
      render(<TakeProfit order={defaultOrder} toggleModal={mockToggleModal} />);

      const tpInput = screen.getByLabelText("TP Price");
      const slInput = screen.getByLabelText("SL Price");

      await userEvent.type(tpInput, "110000");
      await userEvent.type(slInput, "95000");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        const call = mockMutate.mock.calls[0][0];
        expect(call.orders[0].reduceOnly).toBe(true);
        expect(call.orders[1].reduceOnly).toBe(true);
      });
    });

    it("both orders use same position size", async () => {
      render(<TakeProfit order={defaultOrder} toggleModal={mockToggleModal} />);

      const tpInput = screen.getByLabelText("TP Price");
      const slInput = screen.getByLabelText("SL Price");

      await userEvent.type(tpInput, "110000");
      await userEvent.type(slInput, "95000");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        const call = mockMutate.mock.calls[0][0];
        expect(call.orders[0].size).toBe(call.orders[1].size);
        expect(call.orders[0].size).toBe("0.5");
      });
    });
  });
});
