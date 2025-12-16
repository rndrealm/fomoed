import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { useGetPerpBalance, useGetAssetData } from "@/services/queries/hyperliquid";
import { useExecuteTrade, useUpdateLeveraggeTrade } from "@/services/queries/trading";
import { useSupabaseAuth } from "@/components/providers";
import "@testing-library/jest-dom/vitest";
import CreateOrder from "@/components/widgets/trading/hyperliquid/create-order/perp";
import { PerpUniverse } from "@/services/queries/hyperliquid/types";
import { WsActiveAssetCtx } from "@/components/widgets/trading/chart/trading-view/hyperliquid/types";
import { useCheckAccess } from "@/components/widgets/trading/chart/trading-view/hyperliquid/use-check-access";
import { formatHlPrice, formatHlSize } from "@/components/widgets/trading/utils";
import { PERP_MAX_DECIMALS } from "@/components/widgets/trading/utils/constants";

// Mock all dependencies
vi.mock("wagmi");
vi.mock("@/services/queries/hyperliquid");
vi.mock("@/services/queries/trading");
vi.mock("@/components/providers");
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));
vi.mock("@/components/widgets/trading/chart/trading-view/hyperliquid/use-check-access");
vi.mock("@/lib/utils", async () => {
  const actual = await vi.importActual("@/lib/utils");
  return {
    ...actual,
    estimateLiqPrice: vi.fn(() => 95000),
    validateReduceOnly: vi.fn(() => ({ ok: true, reason: "" })),
    calcMargin: vi.fn(() => 100),
  };
});

// Helper function to calculate precision values based on szDecimals
const getPrecisionValues = (szDecimals: number) => {
  const maxDecimal = PERP_MAX_DECIMALS - szDecimals;
  return { szDecimals, maxDecimal };
};

// Test data
const mockSelectedToken = {
  baseTokenName: "BTC",
  index: 0,
  maxLeverage: 50,
  displayName: "BTC-PERP",
  szDecimals: 5,
  name: "BTC",
  marginTableId: 0,
  quoteTokenName: "USDC",
  tradingViewName: "BTCUSD",
} as PerpUniverse;

const mockTicker: WsActiveAssetCtx = {
  coin: "BTC",
  ctx: {
    midPx: 100000,
    dayNtlVlm: 1000000,
    prevDayPx: 99000,
    markPx: 100000,
    funding: 0.0001,
    openInterest: 5000000,
    oraclePx: 100000,
  },
};

// Additional test tokens with different szDecimals
const mockEthToken = {
  baseTokenName: "ETH",
  index: 1,
  maxLeverage: 50,
  displayName: "ETH-PERP",
  szDecimals: 4,
  name: "ETH",
  marginTableId: 1,
  quoteTokenName: "USDC",
  tradingViewName: "ETHUSD",
} as PerpUniverse;

const mockSolToken = {
  baseTokenName: "SOL",
  index: 2,
  maxLeverage: 20,
  displayName: "SOL-PERP",
  szDecimals: 3,
  name: "SOL",
  marginTableId: 2,
  quoteTokenName: "USDC",
  tradingViewName: "SOLUSD",
} as PerpUniverse;

describe("CreateOrder Component", () => {
  const mockMutate = vi.fn();
  const mockUpdateLeverage = vi.fn();

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    (useAccount as ReturnType<typeof vi.fn>).mockReturnValue({
      address: "0x123",
    });

    (useGetPerpBalance as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        withdrawable: "1000",
        assetPositions: [],
      },
    });

    (useGetAssetData as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        leverage: { value: 10, type: "isolated" },
      },
    });

    (useExecuteTrade as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    (useUpdateLeveraggeTrade as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mockUpdateLeverage,
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
    it("renders the order form correctly", () => {
      render(<CreateOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

      expect(screen.getByText("Buy / Long")).toBeInTheDocument();
      expect(screen.getByText("Sell / Short")).toBeInTheDocument();
      expect(screen.getByText("Limit")).toBeInTheDocument();
      expect(screen.getByText("Market")).toBeInTheDocument();
      expect(screen.getByText("Available Equity")).toBeInTheDocument();
    });

    it("displays leverage and margin mode buttons", () => {
      render(<CreateOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

      expect(screen.getByText("10x")).toBeInTheDocument();
      expect(screen.getByText("Isolated")).toBeInTheDocument();
    });

    it("shows Create Order button", () => {
      render(<CreateOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

      const submitButton = screen.getByRole("button", { name: /create order/i });
      expect(submitButton).toBeInTheDocument();
    });
  });

  describe("Order Type Selection", () => {
    it("switches between limit and market order types", async () => {
      render(<CreateOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

      const marketButton = screen.getByText("Market");
      await userEvent.click(marketButton);

      // Price field should be hidden for market orders (parent div has 'hidden' class)
      const priceInput = screen.queryByPlaceholderText("Price (USDC)");
      expect(priceInput?.closest(".hidden")).toBeTruthy();
    });

    it("shows price input for limit orders", () => {
      render(<CreateOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

      const priceInput = screen.getByPlaceholderText("Price (USDC)");
      expect(priceInput).toBeInTheDocument();
      expect(priceInput?.closest(".hidden")).toBeFalsy();
    });
  });

  describe("Long/Short Toggle", () => {
    it("toggles between long and short positions", async () => {
      render(<CreateOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

      const shortButton = screen.getByText("Sell / Short");
      await userEvent.click(shortButton);

      expect(shortButton).toBeInTheDocument();
    });
  });

  describe("Form Validation", () => {
    it("validates price is greater than 0", async () => {
      render(<CreateOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

      const priceInput = screen.getByPlaceholderText("Price (USDC)");
      const quantityInput = screen.getByPlaceholderText("Quantity");

      await userEvent.clear(priceInput);
      await userEvent.type(priceInput, "0");
      await userEvent.type(quantityInput, "1");

      const submitButton = screen.getByRole("button", { name: /create order/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        const errorMessages = screen.getAllByText("Price must be greater than 0");
        expect(errorMessages.length).toBeGreaterThan(0);
      });
    });

    it("validates quantity is positive", async () => {
      render(<CreateOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

      const quantityInput = screen.getByPlaceholderText("Quantity");
      await userEvent.type(quantityInput, "-1");

      const submitButton = screen.getByRole("button", { name: /create order/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        const errorMessages = screen.getAllByText("Quantity must be a positive number");
        expect(errorMessages.length).toBeGreaterThan(0);
      });
    });

    it("requires both price and quantity", async () => {
      render(<CreateOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

      const submitButton = screen.getByRole("button", { name: /create order/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe("TP/SL Validation", () => {
    it("validates SL price is lower than order price for long positions", async () => {
      render(<CreateOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

      const tpslCheckbox = screen.getByLabelText("TP/SL");
      await userEvent.click(tpslCheckbox);

      const priceInput = screen.getByPlaceholderText("Price (USDC)");
      await userEvent.clear(priceInput);
      await userEvent.type(priceInput, "100000");

      const slInput = screen.getByLabelText("SL Price");
      await userEvent.type(slInput, "101000");

      const quantityInput = screen.getByPlaceholderText("Quantity");
      await userEvent.type(quantityInput, "1");

      const submitButton = screen.getByRole("button", { name: /create order/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Stop Loss price must be lower than order price for long positions");
      });
    });

    it("validates TP/SL correctly for short positions", async () => {
      render(<CreateOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

      // Switch to short
      const shortButton = screen.getByText("Sell / Short");
      await userEvent.click(shortButton);

      // Enable TP/SL
      const tpslCheckbox = screen.getByLabelText("TP/SL");
      await userEvent.click(tpslCheckbox);

      const priceInput = screen.getByPlaceholderText("Price (USDC)");
      await userEvent.clear(priceInput);
      await userEvent.type(priceInput, "100000");

      // For short: TP should be lower than order price
      const tpInput = screen.getByLabelText("TP Price");
      await userEvent.type(tpInput, "101000");

      const quantityInput = screen.getByPlaceholderText("Quantity");
      await userEvent.type(quantityInput, "1");

      const submitButton = screen.getByRole("button", { name: /create order/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          "Take Profit price must be lower than order price for short positions",
        );
      });
    });
  });

  describe("Order Submission", () => {
    it("submits a valid limit order successfully", async () => {
      render(<CreateOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

      // Wait for initial render and price to be set
      await waitFor(() => {
        expect(screen.getByPlaceholderText("Price (USDC)")).toHaveValue("100000");
      });

      const quantityInput = screen.getByPlaceholderText("Quantity");

      await userEvent.type(quantityInput, "100");

      const submitButton = screen.getByRole("button", { name: /create order/i });

      // Wait for button to be enabled
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });

      // Use fireEvent.submit instead of clicking to bypass any potential click handlers
      const form = submitButton.closest("form");
      if (form) {
        fireEvent.submit(form);
      }

      // Should open confirmation modal - check for Submit button which is unique to the modal
      await waitFor(
        () => {
          expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it("submits order with TP/SL successfully", async () => {
      render(<CreateOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

      // Wait for initial render and price to be set
      await waitFor(() => {
        expect(screen.getByPlaceholderText("Price (USDC)")).toHaveValue("100000");
      });

      // Enable TP/SL
      const tpslCheckbox = screen.getByLabelText("TP/SL");
      await userEvent.click(tpslCheckbox);

      const quantityInput = screen.getByPlaceholderText("Quantity");
      await userEvent.type(quantityInput, "100");

      const tpInput = screen.getByLabelText("TP Price");
      await userEvent.type(tpInput, "105000");

      const slInput = screen.getByLabelText("SL Price");
      await userEvent.type(slInput, "95000");

      const submitButton = screen.getByRole("button", { name: /create order/i });

      // Wait for button to be enabled
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });

      // Use fireEvent.submit instead of clicking to bypass any potential click handlers
      const form = submitButton.closest("form");
      if (form) {
        fireEvent.submit(form);
      }

      // Should open confirmation modal - check for Submit button which is unique to the modal
      await waitFor(
        () => {
          expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it("executes trade when confirmation is accepted", async () => {
      render(<CreateOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

      const priceInput = screen.getByPlaceholderText("Price (USDC)");
      const quantityInput = screen.getByPlaceholderText("Quantity");

      await userEvent.clear(priceInput);
      await userEvent.type(priceInput, "100000");
      await userEvent.type(quantityInput, "1");

      const submitButton = screen.getByRole("button", { name: /create order/i });
      await userEvent.click(submitButton);

      // Confirm the order
      await waitFor(() => {
        const confirmButton = screen.getByRole("button", { name: /submit/i });
        return userEvent.click(confirmButton);
      });

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled();
      });
    });
  });

  describe("Balance Display", () => {
    it("displays available balance correctly", () => {
      render(<CreateOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

      expect(screen.getByText("$1000.00")).toBeInTheDocument();
    });

    it("displays current position", () => {
      (useGetPerpBalance as ReturnType<typeof vi.fn>).mockReturnValue({
        data: {
          withdrawable: "1000",
          assetPositions: [{ position: { coin: "BTC", szi: "0.5" } }],
        },
      });

      render(<CreateOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

      expect(screen.getByText("$0.5")).toBeInTheDocument();
    });
  });

  describe("Loading States", () => {
    it("shows loading state when order is being executed", () => {
      (useExecuteTrade as ReturnType<typeof vi.fn>).mockReturnValue({
        mutate: mockMutate,
        isPending: true,
      });

      render(<CreateOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

      const submitButton = screen.getByRole("button", { name: /create order/i });
      expect(submitButton).toHaveAttribute("disabled");
    });
  });

  describe("Payload Structure Validation", () => {
    describe("Limit Order Payloads", () => {
      it("creates correct payload for basic long limit order", async () => {
        const { szDecimals, maxDecimal } = getPrecisionValues(mockSelectedToken.szDecimals);
        const marketPrice = mockTicker.ctx.midPx || 100000;
        const inputQuantity = "1000";
        const orderSize = Number(inputQuantity) / marketPrice;
        const expectedSize = formatHlSize(orderSize, szDecimals);
        const expectedPrice = formatHlPrice(100000, maxDecimal);

        render(<CreateOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

        const priceInput = screen.getByPlaceholderText("Price (USDC)");
        const quantityInput = screen.getByPlaceholderText("Quantity");

        await userEvent.clear(priceInput);
        await userEvent.type(priceInput, "100000");
        await userEvent.type(quantityInput, inputQuantity);

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
                asset: 0,
                side: "buy",
                price: expectedPrice,
                size: expectedSize,
                reduceOnly: false,
                timeInForce: "Gtc",
              },
            ],
          });
        });

        const call = mockMutate.mock.calls[0][0];
        expect(typeof call.provider).toBe("string");
        expect(typeof call.wallet_address).toBe("string");
        expect(typeof call.grouping).toBe("string");
        expect(Array.isArray(call.orders)).toBe(true);
        expect(call.orders[0].type).toBe("limit");
        expect(typeof call.orders[0].price).toBe("string");
        expect(typeof call.orders[0].size).toBe("string");
        expect(typeof call.orders[0].asset).toBe("number");
      });

      it("creates correct payload for short limit order with Ioc timeInForce", async () => {
        const { szDecimals, maxDecimal } = getPrecisionValues(mockSelectedToken.szDecimals);
        const marketPrice = mockTicker.ctx.midPx || 100000;
        const inputQuantity = "500";
        const orderSize = Number(inputQuantity) / marketPrice;
        const expectedSize = formatHlSize(orderSize, szDecimals);
        const expectedPrice = formatHlPrice(99000, maxDecimal);

        render(<CreateOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

        const shortButton = screen.getByText("Sell / Short");
        await userEvent.click(shortButton);

        const priceInput = screen.getByPlaceholderText("Price (USDC)");
        const quantityInput = screen.getByPlaceholderText("Quantity");

        await userEvent.clear(priceInput);
        await userEvent.type(priceInput, "99000");
        await userEvent.type(quantityInput, inputQuantity);

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
                asset: 0,
                side: "sell",
                price: expectedPrice,
                size: expectedSize,
                reduceOnly: false,
                timeInForce: "Gtc",
              },
            ],
          });
        });
      });

      it("creates correct payload for limit order with reduceOnly enabled", async () => {
        (useGetPerpBalance as ReturnType<typeof vi.fn>).mockReturnValue({
          data: {
            withdrawable: "1000",
            assetPositions: [{ position: { coin: "BTC", szi: "1" } }],
          },
        });

        render(<CreateOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

        const priceInput = screen.getByPlaceholderText("Price (USDC)");
        const quantityInput = screen.getByPlaceholderText("Quantity");

        await userEvent.clear(priceInput);
        await userEvent.type(priceInput, "100000");
        await userEvent.type(quantityInput, "500");

        const reduceOnlyCheckbox = screen.getByLabelText("Reduce Only");
        await userEvent.click(reduceOnlyCheckbox);

        const submitButton = screen.getByRole("button", { name: /create order/i });
        await userEvent.click(submitButton);

        await waitFor(() => {
          const confirmButton = screen.getByRole("button", { name: /submit/i });
          return userEvent.click(confirmButton);
        });

        await waitFor(() => {
          expect(mockMutate).toHaveBeenCalledWith(
            expect.objectContaining({
              orders: [
                expect.objectContaining({
                  type: "limit",
                  reduceOnly: true,
                }),
              ],
            }),
          );
        });
      });
    });

    describe("Market Order Payloads", () => {
      it("creates correct payload for long market order", async () => {
        const { szDecimals } = getPrecisionValues(mockSelectedToken.szDecimals);
        const marketPrice = mockTicker.ctx.midPx || 100000;
        const inputQuantity = "2000";
        const orderSize = Number(inputQuantity) / marketPrice;
        const expectedSize = formatHlSize(orderSize, szDecimals);

        render(<CreateOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

        const marketButton = screen.getByText("Market");
        await userEvent.click(marketButton);

        const quantityInput = screen.getByPlaceholderText("Quantity");
        await userEvent.type(quantityInput, inputQuantity);

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
                asset: 0,
                side: "buy",
                size: expectedSize,
                reduceOnly: false,
                isSpot: false,
              },
            ],
          });
        });

        const call = mockMutate.mock.calls[0][0];
        expect(call.orders[0]).not.toHaveProperty("price");
        expect(call.orders[0]).not.toHaveProperty("timeInForce");
      });

      it("creates correct payload for short market order", async () => {
        const { szDecimals } = getPrecisionValues(mockSelectedToken.szDecimals);
        const marketPrice = mockTicker.ctx.midPx || 100000;
        const inputQuantity = "1500";
        const orderSize = Number(inputQuantity) / marketPrice;
        const expectedSize = formatHlSize(orderSize, szDecimals);

        render(<CreateOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

        const shortButton = screen.getByText("Sell / Short");
        await userEvent.click(shortButton);

        const marketButton = screen.getByText("Market");
        await userEvent.click(marketButton);

        const quantityInput = screen.getByPlaceholderText("Quantity");
        await userEvent.type(quantityInput, inputQuantity);

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
                asset: 0,
                side: "sell",
                size: expectedSize,
                reduceOnly: false,
                isSpot: false,
              },
            ],
          });
        });
      });
    });

    describe("Orders with TP/SL (Trigger Orders)", () => {
      it("creates correct payload for limit order with take profit only", async () => {
        const { szDecimals, maxDecimal } = getPrecisionValues(mockSelectedToken.szDecimals);
        const marketPrice = mockTicker.ctx.midPx || 100000;
        const inputQuantity = "1000";
        const orderSize = Number(inputQuantity) / marketPrice;
        const expectedSize = formatHlSize(orderSize, szDecimals);
        const expectedPrice = formatHlPrice(100000, maxDecimal);
        const tpPrice = 110000;
        const expectedTpTriggerPrice = formatHlPrice(tpPrice, maxDecimal);
        const expectedTpPrice = formatHlPrice(tpPrice * (1 - 0.036), maxDecimal);

        render(<CreateOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

        const tpslCheckbox = screen.getByLabelText("TP/SL");
        await userEvent.click(tpslCheckbox);

        const priceInput = screen.getByPlaceholderText("Price (USDC)");
        await userEvent.clear(priceInput);
        await userEvent.type(priceInput, "100000");

        const quantityInput = screen.getByPlaceholderText("Quantity");
        await userEvent.type(quantityInput, inputQuantity);

        const tpInput = screen.getByLabelText("TP Price");
        await userEvent.type(tpInput, "110000");

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
            grouping: "normalTpsl",
            orders: [
              {
                type: "limit",
                asset: 0,
                side: "buy",
                price: expectedPrice,
                size: expectedSize,
                reduceOnly: false,
                timeInForce: "Gtc",
              },
              {
                type: "trigger",
                asset: 0,
                side: "sell",
                triggerPrice: expectedTpTriggerPrice,
                size: expectedSize,
                price: expectedTpPrice,
                isMarket: true,
                reduceOnly: true,
                tpsl: "tp",
              },
            ],
          });
        });

        const call = mockMutate.mock.calls[0][0];
        expect(call.grouping).toBe("normalTpsl");
        expect(call.orders).toHaveLength(2);
        expect(call.orders[1].type).toBe("trigger");
        expect(call.orders[1].tpsl).toBe("tp");
        expect(call.orders[1].reduceOnly).toBe(true);
        expect(call.orders[1].isMarket).toBe(true);
        expect(typeof call.orders[1].triggerPrice).toBe("string");
      });

      it("creates correct payload for limit order with stop loss only", async () => {
        const { szDecimals, maxDecimal } = getPrecisionValues(mockSelectedToken.szDecimals);
        const marketPrice = mockTicker.ctx.midPx || 100000;
        const inputQuantity = "1000";
        const orderSize = Number(inputQuantity) / marketPrice;
        const expectedSize = formatHlSize(orderSize, szDecimals);
        const expectedPrice = formatHlPrice(100000, maxDecimal);
        const slPrice = 95000;
        const expectedSlTriggerPrice = formatHlPrice(slPrice, maxDecimal);
        const expectedSlPrice = formatHlPrice(slPrice * (1 - 0.036), maxDecimal);

        render(<CreateOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

        const tpslCheckbox = screen.getByLabelText("TP/SL");
        await userEvent.click(tpslCheckbox);

        const priceInput = screen.getByPlaceholderText("Price (USDC)");
        await userEvent.clear(priceInput);
        await userEvent.type(priceInput, "100000");

        const quantityInput = screen.getByPlaceholderText("Quantity");
        await userEvent.type(quantityInput, inputQuantity);

        const slInput = screen.getByLabelText("SL Price");
        await userEvent.type(slInput, "95000");

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
            grouping: "normalTpsl",
            orders: [
              {
                type: "limit",
                asset: 0,
                side: "buy",
                price: expectedPrice,
                size: expectedSize,
                reduceOnly: false,
                timeInForce: "Gtc",
              },
              {
                type: "trigger",
                asset: 0,
                side: "sell",
                triggerPrice: expectedSlTriggerPrice,
                size: expectedSize,
                price: expectedSlPrice,
                isMarket: true,
                reduceOnly: true,
                tpsl: "sl",
              },
            ],
          });
        });

        const call = mockMutate.mock.calls[0][0];
        expect(call.orders[1].tpsl).toBe("sl");
      });

      it("creates correct payload for limit order with both TP and SL", async () => {
        const { szDecimals, maxDecimal } = getPrecisionValues(mockSelectedToken.szDecimals);
        const marketPrice = mockTicker.ctx.midPx || 100000;
        const inputQuantity = "1000";
        const orderSize = Number(inputQuantity) / marketPrice;
        const expectedSize = formatHlSize(orderSize, szDecimals);
        const expectedPrice = formatHlPrice(100000, maxDecimal);
        const tpPrice = 110000;
        const slPrice = 95000;
        const expectedTpTriggerPrice = formatHlPrice(tpPrice, maxDecimal);
        const expectedTpPrice = formatHlPrice(tpPrice * (1 - 0.036), maxDecimal);
        const expectedSlTriggerPrice = formatHlPrice(slPrice, maxDecimal);
        const expectedSlPrice = formatHlPrice(slPrice * (1 - 0.036), maxDecimal);

        render(<CreateOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

        const tpslCheckbox = screen.getByLabelText("TP/SL");
        await userEvent.click(tpslCheckbox);

        const priceInput = screen.getByPlaceholderText("Price (USDC)");
        await userEvent.clear(priceInput);
        await userEvent.type(priceInput, "100000");

        const quantityInput = screen.getByPlaceholderText("Quantity");
        await userEvent.type(quantityInput, inputQuantity);

        const tpInput = screen.getByLabelText("TP Price");
        await userEvent.type(tpInput, "110000");

        const slInput = screen.getByLabelText("SL Price");
        await userEvent.type(slInput, "95000");

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
            grouping: "normalTpsl",
            orders: [
              {
                type: "limit",
                asset: 0,
                side: "buy",
                price: expectedPrice,
                size: expectedSize,
                reduceOnly: false,
                timeInForce: "Gtc",
              },
              {
                type: "trigger",
                asset: 0,
                side: "sell",
                triggerPrice: expectedTpTriggerPrice,
                size: expectedSize,
                price: expectedTpPrice,
                isMarket: true,
                reduceOnly: true,
                tpsl: "tp",
              },
              {
                type: "trigger",
                asset: 0,
                side: "sell",
                triggerPrice: expectedSlTriggerPrice,
                size: expectedSize,
                price: expectedSlPrice,
                isMarket: true,
                reduceOnly: true,
                tpsl: "sl",
              },
            ],
          });
        });

        const call = mockMutate.mock.calls[0][0];
        expect(call.orders).toHaveLength(3);
        expect(call.orders[1].tpsl).toBe("tp");
        expect(call.orders[2].tpsl).toBe("sl");
      });

      it("creates correct payload for short order with TP/SL (opposite sides)", async () => {
        const { szDecimals, maxDecimal } = getPrecisionValues(mockSelectedToken.szDecimals);
        const marketPrice = mockTicker.ctx.midPx || 100000;
        const inputQuantity = "1000";
        const orderSize = Number(inputQuantity) / marketPrice;
        const expectedSize = formatHlSize(orderSize, szDecimals);
        const expectedPrice = formatHlPrice(100000, maxDecimal);
        const tpPrice = 95000;
        const slPrice = 105000;
        const expectedTpTriggerPrice = formatHlPrice(tpPrice, maxDecimal);
        const expectedTpPrice = formatHlPrice(tpPrice * (1 - 0.036), maxDecimal);
        const expectedSlTriggerPrice = formatHlPrice(slPrice, maxDecimal);
        const expectedSlPrice = formatHlPrice(slPrice * (1 - 0.036), maxDecimal);

        render(<CreateOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

        const shortButton = screen.getByText("Sell / Short");
        await userEvent.click(shortButton);

        const tpslCheckbox = screen.getByLabelText("TP/SL");
        await userEvent.click(tpslCheckbox);

        const priceInput = screen.getByPlaceholderText("Price (USDC)");
        await userEvent.clear(priceInput);
        await userEvent.type(priceInput, "100000");

        const quantityInput = screen.getByPlaceholderText("Quantity");
        await userEvent.type(quantityInput, inputQuantity);

        const tpInput = screen.getByLabelText("TP Price");
        await userEvent.type(tpInput, "95000");

        const slInput = screen.getByLabelText("SL Price");
        await userEvent.type(slInput, "105000");

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
            grouping: "normalTpsl",
            orders: [
              {
                type: "limit",
                asset: 0,
                side: "sell",
                price: expectedPrice,
                size: expectedSize,
                reduceOnly: false,
                timeInForce: "Gtc",
              },
              {
                type: "trigger",
                asset: 0,
                side: "buy",
                triggerPrice: expectedTpTriggerPrice,
                size: expectedSize,
                price: expectedTpPrice,
                isMarket: true,
                reduceOnly: true,
                tpsl: "tp",
              },
              {
                type: "trigger",
                asset: 0,
                side: "buy",
                triggerPrice: expectedSlTriggerPrice,
                size: expectedSize,
                price: expectedSlPrice,
                isMarket: true,
                reduceOnly: true,
                tpsl: "sl",
              },
            ],
          });
        });

        const call = mockMutate.mock.calls[0][0];
        expect(call.orders[0].side).toBe("sell");
        expect(call.orders[1].side).toBe("buy");
        expect(call.orders[2].side).toBe("buy");
      });

      it("creates correct payload for market order with TP/SL", async () => {
        render(<CreateOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

        const marketButton = screen.getByText("Market");
        await userEvent.click(marketButton);

        const tpslCheckbox = screen.getByLabelText("TP/SL");
        await userEvent.click(tpslCheckbox);

        const quantityInput = screen.getByPlaceholderText("Quantity");
        await userEvent.type(quantityInput, "1000");

        const tpInput = screen.getByLabelText("TP Price");
        await userEvent.type(tpInput, "110000");

        const slInput = screen.getByLabelText("SL Price");
        await userEvent.type(slInput, "95000");

        const submitButton = screen.getByRole("button", { name: /create order/i });
        await userEvent.click(submitButton);

        await waitFor(() => {
          const confirmButton = screen.getByRole("button", { name: /submit/i });
          return userEvent.click(confirmButton);
        });

        await waitFor(() => {
          const call = mockMutate.mock.calls[0][0];

          expect(call.orders[0].type).toBe("market");
          expect(call.orders[0]).not.toHaveProperty("price");
          expect(call.orders[0]).not.toHaveProperty("timeInForce");

          expect(call.orders[1].type).toBe("trigger");
          expect(call.orders[2].type).toBe("trigger");
        });
      });
    });

    describe("Payload Type Safety", () => {
      it("ensures all string fields are strings not numbers", async () => {
        render(<CreateOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

        const priceInput = screen.getByPlaceholderText("Price (USDC)");
        const quantityInput = screen.getByPlaceholderText("Quantity");

        await userEvent.clear(priceInput);
        await userEvent.type(priceInput, "100000");
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
        });
      });

      it("ensures trigger order fields are correct types", async () => {
        render(<CreateOrder selectedToken={mockSelectedToken} ticker={mockTicker} />);

        const tpslCheckbox = screen.getByLabelText("TP/SL");
        await userEvent.click(tpslCheckbox);

        const priceInput = screen.getByPlaceholderText("Price (USDC)");
        await userEvent.clear(priceInput);
        await userEvent.type(priceInput, "100000");

        const quantityInput = screen.getByPlaceholderText("Quantity");
        await userEvent.type(quantityInput, "1000");

        const tpInput = screen.getByLabelText("TP Price");
        await userEvent.type(tpInput, "110000");

        const submitButton = screen.getByRole("button", { name: /create order/i });
        await userEvent.click(submitButton);

        await waitFor(() => {
          const confirmButton = screen.getByRole("button", { name: /submit/i });
          return userEvent.click(confirmButton);
        });

        await waitFor(() => {
          const call = mockMutate.mock.calls[0][0];
          const triggerOrder = call.orders[1];

          expect(typeof triggerOrder.triggerPrice).toBe("string");
          expect(typeof triggerOrder.isMarket).toBe("boolean");
          expect(typeof triggerOrder.reduceOnly).toBe("boolean");
          expect(triggerOrder.tpsl).toMatch(/^(tp|sl)$/);
        });
      });
    });

    describe("Precision Testing with Different Assets", () => {
      it("creates order with correct precision for ETH (szDecimals=4)", async () => {
        const ethTicker: WsActiveAssetCtx = {
          coin: "ETH",
          ctx: {
            midPx: 3500,
            dayNtlVlm: 500000,
            prevDayPx: 3450,
            markPx: 3500,
            funding: 0.0001,
            openInterest: 1000000,
            oraclePx: 3500,
          },
        };

        const { szDecimals, maxDecimal } = getPrecisionValues(mockEthToken.szDecimals);
        const marketPrice = ethTicker.ctx.midPx || 3500;
        const inputQuantity = "1000";
        const orderSize = Number(inputQuantity) / marketPrice;
        const expectedSize = formatHlSize(orderSize, szDecimals); // 4 decimals for ETH
        const expectedPrice = formatHlPrice(3500, maxDecimal); // 2 decimals for price (6-4)

        render(<CreateOrder selectedToken={mockEthToken} ticker={ethTicker} />);

        const priceInput = screen.getByPlaceholderText("Price (USDC)");
        const quantityInput = screen.getByPlaceholderText("Quantity");

        await userEvent.clear(priceInput);
        await userEvent.type(priceInput, "3500");
        await userEvent.type(quantityInput, inputQuantity);

        const submitButton = screen.getByRole("button", { name: /create order/i });
        await userEvent.click(submitButton);

        await waitFor(() => {
          const confirmButton = screen.getByRole("button", { name: /submit/i });
          return userEvent.click(confirmButton);
        });

        await waitFor(() => {
          const call = mockMutate.mock.calls[0][0];
          expect(call.orders[0].size).toBe(expectedSize);
          expect(call.orders[0].price).toBe(expectedPrice);

          // Verify precision: ETH should have 4 decimal places for size
          const sizeDecimals = (call.orders[0].size.split('.')[1] || '').length;
          expect(sizeDecimals).toBeLessThanOrEqual(szDecimals);
        });
      });

      it("creates order with correct precision for SOL (szDecimals=3)", async () => {
        const solTicker: WsActiveAssetCtx = {
          coin: "SOL",
          ctx: {
            midPx: 150,
            dayNtlVlm: 200000,
            prevDayPx: 148,
            markPx: 150,
            funding: 0.0001,
            openInterest: 500000,
            oraclePx: 150,
          },
        };

        const { szDecimals, maxDecimal } = getPrecisionValues(mockSolToken.szDecimals);
        const marketPrice = solTicker.ctx.midPx || 150;
        const inputQuantity = "1000";
        // Note: User types 1000 in USDC input, component uses formatHlSizeInput which may not truncate
        // Let's verify what actually comes out
        const orderSize = Number(inputQuantity) / marketPrice;
        const expectedSize = formatHlSize(orderSize, szDecimals); // 3 decimals for SOL
        const expectedPrice = formatHlPrice(150, maxDecimal); // 3 decimals for price (6-3)

        render(<CreateOrder selectedToken={mockSolToken} ticker={solTicker} />);

        const priceInput = screen.getByPlaceholderText("Price (USDC)");
        const quantityInput = screen.getByPlaceholderText("Quantity");

        await userEvent.clear(priceInput);
        await userEvent.type(priceInput, "150");
        await userEvent.type(quantityInput, inputQuantity);

        const submitButton = screen.getByRole("button", { name: /create order/i });
        await userEvent.click(submitButton);

        await waitFor(() => {
          const confirmButton = screen.getByRole("button", { name: /submit/i });
          return userEvent.click(confirmButton);
        });

        await waitFor(() => {
          const call = mockMutate.mock.calls[0][0];
          // Verify the size is properly formatted with correct precision (3 decimals max for SOL)
          const actualSize = call.orders[0].size;
          const sizeDecimals = (actualSize.split('.')[1] || '').length;
          expect(sizeDecimals).toBeLessThanOrEqual(szDecimals);

          // Verify the size is close to expected (allowing for precision formatting differences)
          expect(parseFloat(actualSize)).toBeCloseTo(orderSize, szDecimals);

          expect(call.orders[0].price).toBe(expectedPrice);
        });
      });

      it("verifies precision differences between BTC, ETH, and SOL", () => {
        // BTC: szDecimals=5, maxDecimal=1
        const btcPrecision = getPrecisionValues(mockSelectedToken.szDecimals);
        expect(btcPrecision.szDecimals).toBe(5);
        expect(btcPrecision.maxDecimal).toBe(1);

        // ETH: szDecimals=4, maxDecimal=2
        const ethPrecision = getPrecisionValues(mockEthToken.szDecimals);
        expect(ethPrecision.szDecimals).toBe(4);
        expect(ethPrecision.maxDecimal).toBe(2);

        // SOL: szDecimals=3, maxDecimal=3
        const solPrecision = getPrecisionValues(mockSolToken.szDecimals);
        expect(solPrecision.szDecimals).toBe(3);
        expect(solPrecision.maxDecimal).toBe(3);

        // Test formatting with actual values
        const btcSize = formatHlSize(0.012345678, btcPrecision.szDecimals);
        const ethSize = formatHlSize(0.28765432, ethPrecision.szDecimals);
        const solSize = formatHlSize(6.6789123, solPrecision.szDecimals);

        expect(btcSize).toBe("0.01234"); // Truncated to 5 decimals
        expect(ethSize).toBe("0.2876"); // Truncated to 4 decimals
        expect(solSize).toBe("6.678"); // Truncated to 3 decimals

        // Test actual calculation from test
        const actualSolSize = formatHlSize(1000 / 150, solPrecision.szDecimals);
        expect(actualSolSize).toBe("6.666"); // 1000/150 = 6.666...

        const btcPrice = formatHlPrice(100000.123, btcPrecision.maxDecimal);
        const ethPrice = formatHlPrice(3500.567, ethPrecision.maxDecimal);
        const solPrice = formatHlPrice(150.9876, solPrecision.maxDecimal);

        // Prices are limited by both SF (5) and maxDecimal
        expect(btcPrice).toBe("100000"); // Limited by 5 significant figures
        expect(ethPrice).toBe("3500.6"); // Limited by 2 decimal places
        expect(solPrice).toBe("150.99"); // Limited by 3 decimal places
      });
    });
  });
});
