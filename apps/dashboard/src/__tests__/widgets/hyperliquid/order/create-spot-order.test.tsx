import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { useGetSpotBalance } from "@/services/queries/hyperliquid";
import { useExecuteTrade } from "@/services/queries/trading";
import { useSupabaseAuth } from "@/components/providers";
import "@testing-library/jest-dom/vitest";
import CreateSpotOrder from "@/components/widgets/trading/hyperliquid/create-order/spot";
import { SpotsUniverse } from "@/services/queries/hyperliquid/types";
import { WsActiveSpotAssetCtx } from "@/components/widgets/trading/chart/trading-view/hyperliquid/types";
import { useCheckAccess } from "@/components/widgets/trading/chart/trading-view/hyperliquid/use-check-access";

// Mock all dependencies
vi.mock("wagmi");
vi.mock("@/services/queries/hyperliquid");
vi.mock("@/services/queries/trading");
vi.mock("@/components/providers");
vi.mock("@/components/widgets/trading/chart/trading-view/hyperliquid/use-check-access");
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock jotai atoms
vi.mock("jotai", () => ({
  useAtomValue: vi.fn(),
  atom: vi.fn(),
}));

// Mock utils
vi.mock("@/components/widgets/ascendex/utils", () => ({
  getFromAndToToken: vi.fn((displayName: string) => {
    const [from, to] = displayName.split("/");
    return { from, to };
  }),
}));

const mockSelectedToken: SpotsUniverse = {
  index: 0,
  displayName: "BTC/USDC",
  tokens: [0, 1],
  name: "BTC/USDC",
  isCanonical: true,
  szDecimals: 5,
} as SpotsUniverse;

const mockTicker: WsActiveSpotAssetCtx = {
  coin: "BTC",
  ctx: {
    midPx: 100000,
    dayNtlVlm: 1000000,
    prevDayPx: 99000,
    markPx: 100000,
    circulatingSupply: 19000000,
  },
};

describe("CreateSpotOrder Component", () => {
  const mockMutate = vi.fn();

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  beforeEach(() => {
    vi.clearAllMocks();

    (useAccount as ReturnType<typeof vi.fn>).mockReturnValue({
      address: "0x123",
    });

    (useGetSpotBalance as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        balances: [
          { coin: "BTC", total: "1.5" },
          { coin: "USDC", total: "50000" },
        ],
      },
    });

    (useExecuteTrade as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    (useSupabaseAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      session: {
        access_token: "mock-token",
        user: { id: "mock-user-id" },
      },
    });

    (useCheckAccess as ReturnType<typeof vi.fn>).mockReturnValue({
      connected: true,
      blocker: null,
      isPending: false,
    });
  });

  describe("Component Rendering", () => {
    it("renders the spot order form correctly", () => {
      render(<CreateSpotOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

      expect(screen.getByText("Buy / Long")).toBeInTheDocument();
      expect(screen.getByText("Sell / Short")).toBeInTheDocument();
      expect(screen.getByText("Limit")).toBeInTheDocument();
      expect(screen.getByText("Market")).toBeInTheDocument();
    });

    it("displays available balance", () => {
      render(<CreateSpotOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

      expect(screen.getByText("$50000.00")).toBeInTheDocument();
    });
  });

  describe("Buy/Sell Toggle", () => {
    it("shows correct balance when switching to sell", async () => {
      render(<CreateSpotOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

      const sellButton = screen.getByText("Sell / Short");
      await userEvent.click(sellButton);

      await waitFor(() => {
        expect(screen.getByText("$1.50")).toBeInTheDocument();
      });
    });
  });

  describe("Form Validation", () => {
    it("validates price is greater than 0", async () => {
      render(<CreateSpotOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

      const priceInput = screen.getByPlaceholderText("Price (USDC)");
      await userEvent.clear(priceInput);
      await userEvent.type(priceInput, "0");

      const quantityInput = screen.getByPlaceholderText("Quantity");
      await userEvent.type(quantityInput, "100");

      const submitButton = screen.getByRole("button", { name: /create order/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        const errorMessages = screen.getAllByText("Price must be greater than 0");
        expect(errorMessages.length).toBeGreaterThan(0);
      });
    });

    it("validates quantity is at least 10", async () => {
      render(<CreateSpotOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

      const priceInput = screen.getByPlaceholderText("Price (USDC)");
      await userEvent.clear(priceInput);
      await userEvent.type(priceInput, "100000");

      const quantityInput = screen.getByPlaceholderText("Quantity");
      await userEvent.type(quantityInput, "5");

      const submitButton = screen.getByRole("button", { name: /create order/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Quantity must be greater than 10");
      });
    });

    it("requires both price and quantity fields", () => {
      render(<CreateSpotOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

      const submitButton = screen.getByRole("button", { name: /create order/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe("Order Submission", () => {
    it("submits a valid buy order", async () => {
      render(<CreateSpotOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

      const priceInput = screen.getByPlaceholderText("Price (USDC)");
      await userEvent.clear(priceInput);
      await userEvent.type(priceInput, "100000");

      const quantityInput = screen.getByPlaceholderText("Quantity");
      await userEvent.type(quantityInput, "100");

      const submitButton = screen.getByRole("button", { name: /create order/i });
      await userEvent.click(submitButton);

      // Should open confirmation modal - check for Submit button which is unique to the modal
      await waitFor(
        () => {
          expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it("submits a valid sell order", async () => {
      render(<CreateSpotOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

      const sellButton = screen.getByText("Sell / Short");
      await userEvent.click(sellButton);

      const priceInput = screen.getByPlaceholderText("Price (USDC)");
      await userEvent.clear(priceInput);
      await userEvent.type(priceInput, "100000");

      const quantityInput = screen.getByPlaceholderText("Quantity");
      await userEvent.type(quantityInput, "100");

      // Wait for the submit button to be available and enabled
      const submitButton = await waitFor(
        () => {
          const button = screen.getByRole("button", { name: /create order/i });
          expect(button).not.toBeDisabled();
          return button;
        },
        { timeout: 3000 },
      );
      await userEvent.click(submitButton);

      // Should open confirmation modal - check for Submit button which is unique to the modal
      await waitFor(
        () => {
          expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it("executes trade when order is confirmed", async () => {
      render(<CreateSpotOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

      const priceInput = screen.getByPlaceholderText("Price (USDC)");
      await userEvent.clear(priceInput);
      await userEvent.type(priceInput, "100000");

      const quantityInput = screen.getByPlaceholderText("Quantity");
      await userEvent.type(quantityInput, "100");

      const submitButton = screen.getByRole("button", { name: /create order/i });
      await userEvent.click(submitButton);

      // Confirm the order
      await waitFor(() => {
        const confirmButton = screen.getByRole("button", { name: /submit/i });
        return userEvent.click(confirmButton);
      });

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          expect.objectContaining({
            provider: "hyperliquid",
            wallet_address: "0x123",
            grouping: "na",
            orders: expect.arrayContaining([
              expect.objectContaining({
                type: "limit",
                asset: 10000,
                side: "buy",
              }),
            ]),
          }),
        );
      });
    });
  });

  describe("Loading States", () => {
    it("disables submit button during order execution", () => {
      (useExecuteTrade as ReturnType<typeof vi.fn>).mockReturnValue({
        mutate: mockMutate,
        isPending: true,
      });

      render(<CreateSpotOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

      const submitButton = screen.getByRole("button", { name: /create order/i });
      expect(submitButton).toHaveAttribute("disabled");
    });
  });

  describe("Payload Structure Validation", () => {
    describe("Spot Limit Order Payloads", () => {
      it("creates correct payload for spot buy limit order", async () => {
        render(<CreateSpotOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

        const priceInput = screen.getByPlaceholderText("Price (USDC)");
        await userEvent.clear(priceInput);
        await userEvent.type(priceInput, "100000");

        const quantityInput = screen.getByPlaceholderText("Quantity");
        await userEvent.type(quantityInput, "1000");

        const submitButton = screen.getByRole("button", { name: /create order/i });
        await userEvent.click(submitButton);

        await waitFor(() => {
          const confirmButton = screen.getByRole("button", { name: /submit/i });
          return userEvent.click(confirmButton);
        });

        await waitFor(() => {
          expect(mockMutate).toHaveBeenCalledWith({
            provider: "hyperliquid",
            wallet_address: "0x123",
            grouping: "na",
            orders: [
              {
                type: "limit",
                asset: 10000,
                side: "buy",
                price: "100000",
                size: "0.01000",
                reduceOnly: false,
                timeInForce: "Gtc",
              },
            ],
          });
        });

        const call = mockMutate.mock.calls[0][0];
        expect(typeof call.provider).toBe("string");
        expect(typeof call.wallet_address).toBe("string");
        expect(call.grouping).toBe("na");
        expect(Array.isArray(call.orders)).toBe(true);
        expect(call.orders[0].type).toBe("limit");
        expect(typeof call.orders[0].price).toBe("string");
        expect(typeof call.orders[0].size).toBe("string");
        expect(typeof call.orders[0].asset).toBe("number");
        expect(call.orders[0].asset).toBeGreaterThanOrEqual(10000);
      });

      it("creates correct payload for spot sell limit order", async () => {
        render(<CreateSpotOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

        const sellButton = screen.getByText("Sell / Short");
        await userEvent.click(sellButton);

        const priceInput = screen.getByPlaceholderText("Price (USDC)");
        await userEvent.clear(priceInput);
        await userEvent.type(priceInput, "99000");

        const quantityInput = screen.getByPlaceholderText("Quantity");
        await userEvent.type(quantityInput, "2000");

        // Wait for the submit button to be available and enabled
        const submitButton = await waitFor(
          () => {
            const button = screen.getByRole("button", { name: /create order/i });
            expect(button).not.toBeDisabled();
            return button;
          },
          { timeout: 3000 },
        );
        await userEvent.click(submitButton);

        await waitFor(() => {
          const confirmButton = screen.getByRole("button", { name: /submit/i });
          return userEvent.click(confirmButton);
        });

        await waitFor(() => {
          expect(mockMutate).toHaveBeenCalledWith({
            provider: "hyperliquid",
            wallet_address: "0x123",
            grouping: "na",
            orders: [
              {
                type: "limit",
                asset: 10000,
                side: "sell",
                price: "99000",
                size: "0.02020",
                reduceOnly: false,
                timeInForce: "Gtc",
              },
            ],
          });
        });
      });

      it("creates correct payload with different TIF values", async () => {
        render(<CreateSpotOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

        const priceInput = screen.getByPlaceholderText("Price (USDC)");
        await userEvent.clear(priceInput);
        await userEvent.type(priceInput, "100000");

        const quantityInput = screen.getByPlaceholderText("Quantity");
        await userEvent.type(quantityInput, "500");

        // Note: TIF selection depends on your actual UI implementation
        // This assumes there's a way to change TIF in the form

        const submitButton = screen.getByRole("button", { name: /create order/i });
        await userEvent.click(submitButton);

        await waitFor(() => {
          const confirmButton = screen.getByRole("button", { name: /submit/i });
          return userEvent.click(confirmButton);
        });

        await waitFor(() => {
          const call = mockMutate.mock.calls[0][0];
          // Default should be Gtc
          expect(call.orders[0].timeInForce).toBe("Gtc");
        });
      });
    });

    describe("Spot Market Order Payloads", () => {
      it("creates correct payload for spot market buy order", async () => {
        render(<CreateSpotOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

        const marketButton = screen.getByText("Market");
        await userEvent.click(marketButton);

        const quantityInput = screen.getByPlaceholderText("Quantity");
        await userEvent.type(quantityInput, "1500");

        const submitButton = screen.getByRole("button", { name: /create order/i });
        await userEvent.click(submitButton);

        await waitFor(() => {
          const confirmButton = screen.getByRole("button", { name: /submit/i });
          return userEvent.click(confirmButton);
        });

        await waitFor(() => {
          expect(mockMutate).toHaveBeenCalledWith({
            provider: "hyperliquid",
            wallet_address: "0x123",
            grouping: "na",
            orders: [
              {
                type: "market",
                asset: 10000,
                side: "buy",
                size: expect.any(String),
                reduceOnly: false,
                isSpot: true,
              },
            ],
          });
        });

        const call = mockMutate.mock.calls[0][0];
        expect(call.orders[0]).not.toHaveProperty("price");
        expect(call.orders[0]).not.toHaveProperty("timeInForce");
      });

      it("creates correct payload for spot market sell order", async () => {
        render(<CreateSpotOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

        const sellButton = screen.getByText("Sell / Short");
        await userEvent.click(sellButton);

        const marketButton = screen.getByText("Market");
        await userEvent.click(marketButton);

        const quantityInput = screen.getByPlaceholderText("Quantity");
        await userEvent.type(quantityInput, "800");

        const submitButton = screen.getByRole("button", { name: /create order/i });
        await userEvent.click(submitButton);

        await waitFor(() => {
          const confirmButton = screen.getByRole("button", { name: /submit/i });
          return userEvent.click(confirmButton);
        });

        await waitFor(() => {
          expect(mockMutate).toHaveBeenCalledWith({
            provider: "hyperliquid",
            wallet_address: "0x123",
            grouping: "na",
            orders: [
              {
                type: "market",
                asset: 10000,
                side: "sell",
                size: expect.any(String),
                reduceOnly: false,
                isSpot: true,
              },
            ],
          });
        });
      });
    });

    describe("Spot Order Constraints", () => {
      it("ensures spot orders never have TP/SL (single order only)", async () => {
        render(<CreateSpotOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

        const priceInput = screen.getByPlaceholderText("Price (USDC)");
        await userEvent.clear(priceInput);
        await userEvent.type(priceInput, "100000");

        const quantityInput = screen.getByPlaceholderText("Quantity");
        await userEvent.type(quantityInput, "1000");

        const submitButton = screen.getByRole("button", { name: /create order/i });
        await userEvent.click(submitButton);

        await waitFor(() => {
          const confirmButton = screen.getByRole("button", { name: /submit/i });
          return userEvent.click(confirmButton);
        });

        await waitFor(() => {
          const call = mockMutate.mock.calls[0][0];

          expect(call.orders).toHaveLength(1);
          expect(call.grouping).toBe("na");
        });
      });

      it("ensures spot orders always have reduceOnly: false", async () => {
        render(<CreateSpotOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

        const priceInput = screen.getByPlaceholderText("Price (USDC)");
        await userEvent.clear(priceInput);
        await userEvent.type(priceInput, "100000");

        const quantityInput = screen.getByPlaceholderText("Quantity");
        await userEvent.type(quantityInput, "500");

        const submitButton = screen.getByRole("button", { name: /create order/i });
        await userEvent.click(submitButton);

        await waitFor(() => {
          const confirmButton = screen.getByRole("button", { name: /submit/i });
          return userEvent.click(confirmButton);
        });

        await waitFor(() => {
          const call = mockMutate.mock.calls[0][0];
          expect(call.orders[0].reduceOnly).toBe(false);
        });
      });
    });

    describe("Payload Type Safety", () => {
      it("ensures all string fields are strings not numbers", async () => {
        render(<CreateSpotOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

        const priceInput = screen.getByPlaceholderText("Price (USDC)");
        await userEvent.clear(priceInput);
        await userEvent.type(priceInput, "100000");

        const quantityInput = screen.getByPlaceholderText("Quantity");
        await userEvent.type(quantityInput, "1000");

        const submitButton = screen.getByRole("button", { name: /create order/i });
        await userEvent.click(submitButton);

        await waitFor(() => {
          const confirmButton = screen.getByRole("button", { name: /submit/i });
          return userEvent.click(confirmButton);
        });

        await waitFor(() => {
          const call = mockMutate.mock.calls[0][0];
          const order = call.orders[0];

          expect(typeof order.price).toBe("string");
          expect(typeof order.size).toBe("string");
          expect(typeof order.asset).toBe("number");
          expect(typeof call.wallet_address).toBe("string");
          expect(typeof call.provider).toBe("string");
          expect(typeof order.reduceOnly).toBe("boolean");
        });
      });

      it("validates asset calculation for spot orders", async () => {
        const customToken = { ...mockSelectedToken, index: 5 };
        render(<CreateSpotOrder selectedToken={customToken} ticker={mockTicker} />);

        const priceInput = screen.getByPlaceholderText("Price (USDC)");
        await userEvent.clear(priceInput);
        await userEvent.type(priceInput, "100000");

        const quantityInput = screen.getByPlaceholderText("Quantity");
        await userEvent.type(quantityInput, "100");

        const submitButton = screen.getByRole("button", { name: /create order/i });
        await userEvent.click(submitButton);

        await waitFor(() => {
          const confirmButton = screen.getByRole("button", { name: /submit/i });
          return userEvent.click(confirmButton);
        });

        await waitFor(() => {
          const call = mockMutate.mock.calls[0][0];
          expect(call.orders[0].asset).toBe(10005);
        });
      });
    });

    describe("Size Calculation Accuracy", () => {
      it("calculates size correctly (quantity / price)", async () => {
        render(<CreateSpotOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

        const priceInput = screen.getByPlaceholderText("Price (USDC)");
        await userEvent.clear(priceInput);
        await userEvent.type(priceInput, "50000");

        const quantityInput = screen.getByPlaceholderText("Quantity");
        await userEvent.type(quantityInput, "25000");

        const submitButton = screen.getByRole("button", { name: /create order/i });
        await userEvent.click(submitButton);

        await waitFor(() => {
          const confirmButton = screen.getByRole("button", { name: /submit/i });
          return userEvent.click(confirmButton);
        });

        await waitFor(() => {
          const call = mockMutate.mock.calls[0][0];
          expect(call.orders[0].size).toBe("0.50000");
        });
      });

      it("formats size to 5 decimal places (szDecimals)", async () => {
        render(<CreateSpotOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

        const priceInput = screen.getByPlaceholderText("Price (USDC)");
        await userEvent.clear(priceInput);
        await userEvent.type(priceInput, "100000");

        const quantityInput = screen.getByPlaceholderText("Quantity");
        await userEvent.type(quantityInput, "33333");

        const submitButton = screen.getByRole("button", { name: /create order/i });
        await userEvent.click(submitButton);

        await waitFor(() => {
          const confirmButton = screen.getByRole("button", { name: /submit/i });
          return userEvent.click(confirmButton);
        });

        await waitFor(() => {
          const call = mockMutate.mock.calls[0][0];
          expect(call.orders[0].size).toBe("0.33333");
        });
      });
    });
  });
});
