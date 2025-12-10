import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import ConfirmModal from "@/components/widgets/trading/hyperliquid/modals/confirm-modal";

describe("ConfirmModal Component", () => {
  const mockToggle = vi.fn();
  const mockOnConfirm = vi.fn();

  const defaultOrderData = {
    action: true,
    size: "0.5 BTC",
    price: "$100,000",
    liqPrice: "$95,000",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Component Rendering", () => {
    it("renders the modal with order details correctly", () => {
      render(<ConfirmModal toggle={mockToggle} orderData={defaultOrderData} onConfirm={mockOnConfirm} isLoading={false} />);

      expect(screen.getByText("Action")).toBeInTheDocument();
      expect(screen.getByText("Size")).toBeInTheDocument();
      expect(screen.getByText("Price")).toBeInTheDocument();
      expect(screen.getByText("Estimated Liquidation Price")).toBeInTheDocument();
    });

    it("displays order data values correctly", () => {
      render(<ConfirmModal toggle={mockToggle} orderData={defaultOrderData} onConfirm={mockOnConfirm} isLoading={false} />);

      expect(screen.getByText("Buy")).toBeInTheDocument();
      expect(screen.getByText("0.5 BTC")).toBeInTheDocument();
      expect(screen.getByText("$100,000")).toBeInTheDocument();
      expect(screen.getByText("$95,000")).toBeInTheDocument();
    });

    it("shows Submit button", () => {
      render(<ConfirmModal toggle={mockToggle} orderData={defaultOrderData} onConfirm={mockOnConfirm} isLoading={false} />);

      const submitButton = screen.getByRole("button", { name: /submit/i });
      expect(submitButton).toBeInTheDocument();
    });

    it("displays gas-free confirmation message", () => {
      render(<ConfirmModal toggle={mockToggle} orderData={defaultOrderData} onConfirm={mockOnConfirm} isLoading={false} />);

      expect(screen.getByText(/You Pay no gas/i)).toBeInTheDocument();
      expect(screen.getByText(/The order will be confirmed within a few seconds/i)).toBeInTheDocument();
    });
  });

  describe("Buy/Short Action Display", () => {
    it("displays 'Buy' for long positions with green color", () => {
      render(
        <ConfirmModal
          toggle={mockToggle}
          orderData={{ ...defaultOrderData, action: true }}
          onConfirm={mockOnConfirm}
          isLoading={false}
        />,
      );

      const buyText = screen.getByText("Buy");
      expect(buyText).toBeInTheDocument();
      expect(buyText).toHaveClass("text-[#00AF58]");
    });

    it("displays 'Short' for short positions with red color", () => {
      render(
        <ConfirmModal
          toggle={mockToggle}
          orderData={{ ...defaultOrderData, action: false }}
          onConfirm={mockOnConfirm}
          isLoading={false}
        />,
      );

      const shortText = screen.getByText("Short");
      expect(shortText).toBeInTheDocument();
      expect(shortText).toHaveClass("text-[#DC2626]");
    });

    it("applies correct color to size for long positions", () => {
      render(
        <ConfirmModal
          toggle={mockToggle}
          orderData={{ ...defaultOrderData, action: true }}
          onConfirm={mockOnConfirm}
          isLoading={false}
        />,
      );

      const sizeText = screen.getByText("0.5 BTC");
      expect(sizeText).toHaveClass("text-[#00AF58]");
    });

    it("applies correct color to size for short positions", () => {
      render(
        <ConfirmModal
          toggle={mockToggle}
          orderData={{ ...defaultOrderData, action: false }}
          onConfirm={mockOnConfirm}
          isLoading={false}
        />,
      );

      const sizeText = screen.getByText("0.5 BTC");
      expect(sizeText).toHaveClass("text-[#DC2626]");
    });
  });

  describe("Liquidation Price Display", () => {
    it("shows liquidation price when provided", () => {
      render(
        <ConfirmModal
          toggle={mockToggle}
          orderData={{ ...defaultOrderData, liqPrice: "$90,000" }}
          onConfirm={mockOnConfirm}
          isLoading={false}
        />,
      );

      expect(screen.getByText("Estimated Liquidation Price")).toBeInTheDocument();
      expect(screen.getByText("$90,000")).toBeInTheDocument();
    });

    it("hides liquidation price when not provided", () => {
      render(
        <ConfirmModal
          toggle={mockToggle}
          orderData={{ ...defaultOrderData, liqPrice: undefined }}
          onConfirm={mockOnConfirm}
          isLoading={false}
        />,
      );

      expect(screen.queryByText("Estimated Liquidation Price")).not.toBeInTheDocument();
    });

    it("hides liquidation price when empty string", () => {
      render(
        <ConfirmModal
          toggle={mockToggle}
          orderData={{ ...defaultOrderData, liqPrice: "" }}
          onConfirm={mockOnConfirm}
          isLoading={false}
        />,
      );

      expect(screen.queryByText("Estimated Liquidation Price")).not.toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("calls onConfirm when Submit button is clicked", async () => {
      render(<ConfirmModal toggle={mockToggle} orderData={defaultOrderData} onConfirm={mockOnConfirm} isLoading={false} />);

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it("does not call toggle when Submit is clicked", async () => {
      render(<ConfirmModal toggle={mockToggle} orderData={defaultOrderData} onConfirm={mockOnConfirm} isLoading={false} />);

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      expect(mockToggle).not.toHaveBeenCalled();
    });
  });

  describe("Loading States", () => {
    it("shows loading state on Submit button when isLoading is true", () => {
      render(<ConfirmModal toggle={mockToggle} orderData={defaultOrderData} onConfirm={mockOnConfirm} isLoading={true} />);

      const submitButton = screen.getByRole("button", { name: /submit/i });
      expect(submitButton).toBeDisabled();
    });

    it("enables Submit button when not loading", () => {
      render(<ConfirmModal toggle={mockToggle} orderData={defaultOrderData} onConfirm={mockOnConfirm} isLoading={false} />);

      const submitButton = screen.getByRole("button", { name: /submit/i });
      expect(submitButton).not.toBeDisabled();
    });

    it("prevents multiple submissions when loading", async () => {
      render(<ConfirmModal toggle={mockToggle} orderData={defaultOrderData} onConfirm={mockOnConfirm} isLoading={true} />);

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      // Should not be called because button is disabled
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("handles zero price value", () => {
      render(
        <ConfirmModal
          toggle={mockToggle}
          orderData={{ ...defaultOrderData, price: "$0" }}
          onConfirm={mockOnConfirm}
          isLoading={false}
        />,
      );

      expect(screen.getByText("$0")).toBeInTheDocument();
    });

    it("handles very large size values", () => {
      render(
        <ConfirmModal
          toggle={mockToggle}
          orderData={{ ...defaultOrderData, size: "999,999.99999 BTC" }}
          onConfirm={mockOnConfirm}
          isLoading={false}
        />,
      );

      expect(screen.getByText("999,999.99999 BTC")).toBeInTheDocument();
    });

    it("handles very small size values", () => {
      render(
        <ConfirmModal
          toggle={mockToggle}
          orderData={{ ...defaultOrderData, size: "0.00001 BTC" }}
          onConfirm={mockOnConfirm}
          isLoading={false}
        />,
      );

      expect(screen.getByText("0.00001 BTC")).toBeInTheDocument();
    });

    it("renders correctly with minimal order data", () => {
      const minimalOrderData = {
        action: true,
        size: "1",
        price: "100",
      };

      render(<ConfirmModal toggle={mockToggle} orderData={minimalOrderData} onConfirm={mockOnConfirm} isLoading={false} />);

      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("100")).toBeInTheDocument();
      expect(screen.queryByText("Estimated Liquidation Price")).not.toBeInTheDocument();
    });
  });

  describe("Type Safety", () => {
    it("handles boolean action prop correctly", () => {
      const { rerender } = render(
        <ConfirmModal
          toggle={mockToggle}
          orderData={{ ...defaultOrderData, action: true }}
          onConfirm={mockOnConfirm}
          isLoading={false}
        />,
      );

      expect(screen.getByText("Buy")).toBeInTheDocument();

      rerender(
        <ConfirmModal
          toggle={mockToggle}
          orderData={{ ...defaultOrderData, action: false }}
          onConfirm={mockOnConfirm}
          isLoading={false}
        />,
      );

      expect(screen.getByText("Short")).toBeInTheDocument();
    });

    it("ensures all props are properly typed", () => {
      const validProps = {
        toggle: mockToggle,
        orderData: {
          action: true as boolean,
          size: "0.5 BTC" as string,
          price: "$100,000" as string,
          liqPrice: "$95,000" as string | undefined,
        },
        onConfirm: mockOnConfirm,
        isLoading: false as boolean,
      };

      render(<ConfirmModal {...validProps} />);
      expect(screen.getByText("Buy")).toBeInTheDocument();
    });
  });
});
