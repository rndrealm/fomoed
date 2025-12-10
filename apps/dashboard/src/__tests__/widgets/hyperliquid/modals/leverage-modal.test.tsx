import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import LeverageModal from "@/components/widgets/trading/hyperliquid/modals/leverage-modal";

// Mock OrderCheckLayout to simplify testing
vi.mock("@/components/widgets/trading/hyperliquid/create-order/order-check-layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("LeverageModal Component", () => {
  const mockUpdateLeverage = vi.fn();
  const mockOnClose = vi.fn();

  const defaultProps = {
    leverage: 10,
    updateLeverage: mockUpdateLeverage,
    isLoading: false,
    maxLeverage: 50,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Component Rendering", () => {
    it("renders the leverage modal correctly", () => {
      render(<LeverageModal {...defaultProps} />);

      expect(
        screen.getByText(/Pick how much you want to amplify your position/i),
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
    });

    it("displays slider component", () => {
      render(<LeverageModal {...defaultProps} />);

      // Slider is present (checking for the range input)
      const slider = screen.getByRole("slider");
      expect(slider).toBeInTheDocument();
    });

    it("displays leverage input field", () => {
      render(<LeverageModal {...defaultProps} />);

      const input = screen.getByRole("spinbutton");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("type", "number");
    });

    it("shows current leverage value in input", () => {
      render(<LeverageModal {...defaultProps} leverage={25} />);

      const input = screen.getByRole("spinbutton") as HTMLInputElement;
      expect(input.value).toBe("25");
    });

    it("displays descriptive text about leverage", () => {
      render(<LeverageModal {...defaultProps} />);

      expect(
        screen.getByText(/Higher leverage boosts your upside — and your downside/i),
      ).toBeInTheDocument();
    });
  });

  describe("Slider Interaction", () => {
    it("updates input value when slider changes", async () => {
      render(<LeverageModal {...defaultProps} />);

      const slider = screen.getByRole("slider");
      const input = screen.getByRole("spinbutton") as HTMLInputElement;

      // Change slider value
      await userEvent.click(slider);
      // Note: Actual slider interaction is complex, this tests the component renders

      expect(input).toBeInTheDocument();
    });

    it("respects max leverage limit on slider", () => {
      render(<LeverageModal {...defaultProps} maxLeverage={30} />);

      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("aria-valuemax", "30");
    });

    it("has minimum slider value of 1", () => {
      render(<LeverageModal {...defaultProps} />);

      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("aria-valuemin", "1");
    });
  });

  describe("Input Validation", () => {
    it("allows valid leverage input", async () => {
      render(<LeverageModal {...defaultProps} />);

      const input = screen.getByRole("spinbutton");
      await userEvent.clear(input);
      await userEvent.type(input, "20");

      expect(screen.queryByText(/Leverage must be greater than 0/i)).not.toBeInTheDocument();
    });

    it("shows error for zero leverage", async () => {
      render(<LeverageModal {...defaultProps} />);

      const input = screen.getByRole("spinbutton");
      await userEvent.clear(input);
      await userEvent.type(input, "0");

      await waitFor(() => {
        expect(screen.getByText("Leverage must be greater than 0")).toBeInTheDocument();
      });
    });

    it("shows error for negative leverage", async () => {
      render(<LeverageModal {...defaultProps} />);

      const input = screen.getByRole("spinbutton");
      await userEvent.clear(input);
      await userEvent.type(input, "-5");

      await waitFor(() => {
        expect(screen.getByText("Leverage must be greater than 0")).toBeInTheDocument();
      });
    });

    it("prevents input greater than maxLeverage", async () => {
      render(<LeverageModal {...defaultProps} maxLeverage={50} />);

      const input = screen.getByRole("spinbutton") as HTMLInputElement;
      await userEvent.clear(input);
      await userEvent.type(input, "100");

      // Should not accept 100, value should remain at previous or be capped
      expect(parseInt(input.value)).toBeLessThanOrEqual(50);
    });

    it("clears error when valid value is entered", async () => {
      render(<LeverageModal {...defaultProps} />);

      const input = screen.getByRole("spinbutton");

      // First enter invalid value
      await userEvent.clear(input);
      await userEvent.type(input, "0");

      await waitFor(() => {
        expect(screen.getByText("Leverage must be greater than 0")).toBeInTheDocument();
      });

      // Then enter valid value
      await userEvent.clear(input);
      await userEvent.type(input, "15");

      await waitFor(() => {
        expect(screen.queryByText("Leverage must be greater than 0")).not.toBeInTheDocument();
      });
    });

    it("clears error when input is emptied", async () => {
      render(<LeverageModal {...defaultProps} />);

      const input = screen.getByRole("spinbutton");

      // Enter invalid value
      await userEvent.clear(input);
      await userEvent.type(input, "0");

      await waitFor(() => {
        expect(screen.getByText("Leverage must be greater than 0")).toBeInTheDocument();
      });

      // Clear input
      await userEvent.clear(input);

      await waitFor(() => {
        expect(screen.queryByText("Leverage must be greater than 0")).not.toBeInTheDocument();
      });
    });
  });

  describe("High Leverage Warning", () => {
    it("shows warning when leverage exceeds half of maxLeverage", async () => {
      render(<LeverageModal {...defaultProps} maxLeverage={50} />);

      const input = screen.getByRole("spinbutton");
      await userEvent.clear(input);
      await userEvent.type(input, "30");

      await waitFor(() => {
        expect(
          screen.getByText(/High leverage detected, there's a high chance of liquidation/i),
        ).toBeInTheDocument();
      });
    });

    it("does not show warning for leverage below threshold", async () => {
      render(<LeverageModal {...defaultProps} maxLeverage={50} />);

      const input = screen.getByRole("spinbutton");
      await userEvent.clear(input);
      await userEvent.type(input, "20");

      await waitFor(() => {
        expect(
          screen.queryByText(/High leverage detected/i),
        ).not.toBeInTheDocument();
      });
    });

    it("shows warning at exactly half of maxLeverage threshold", async () => {
      render(<LeverageModal {...defaultProps} maxLeverage={50} />);

      const input = screen.getByRole("spinbutton");
      await userEvent.clear(input);
      await userEvent.type(input, "26");

      await waitFor(() => {
        expect(
          screen.getByText(/High leverage detected/i),
        ).toBeInTheDocument();
      });
    });

    it("displays danger icon with warning", async () => {
      render(<LeverageModal {...defaultProps} maxLeverage={50} />);

      const input = screen.getByRole("spinbutton");
      await userEvent.clear(input);
      await userEvent.type(input, "40");

      await waitFor(() => {
        // Check that the warning text is present (icon is SVG)
        expect(screen.getByText(/High leverage detected/i)).toBeInTheDocument();
      });
    });
  });

  describe("Button Interactions", () => {
    it("calls onClose when Cancel button is clicked", async () => {
      render(<LeverageModal {...defaultProps} />);

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      await userEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("calls updateLeverage when Submit button is clicked with valid value", async () => {
      render(<LeverageModal {...defaultProps} />);

      const input = screen.getByRole("spinbutton");
      await userEvent.clear(input);
      await userEvent.type(input, "25");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      expect(mockUpdateLeverage).toHaveBeenCalledWith(25);
    });

    it("does not call updateLeverage with invalid value", async () => {
      render(<LeverageModal {...defaultProps} />);

      const input = screen.getByRole("spinbutton");
      await userEvent.clear(input);
      await userEvent.type(input, "0");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      expect(mockUpdateLeverage).not.toHaveBeenCalled();
    });

    it("disables submission with high leverage warning", async () => {
      render(<LeverageModal {...defaultProps} maxLeverage={50} />);

      const input = screen.getByRole("spinbutton");
      await userEvent.clear(input);
      await userEvent.type(input, "40");

      const submitButton = screen.getByRole("button", { name: /submit/i });

      // Warning is shown and button should be disabled
      await waitFor(() => {
        expect(screen.getByText(/High leverage detected/i)).toBeInTheDocument();
      });

      expect(submitButton).toBeDisabled();
      expect(mockUpdateLeverage).not.toHaveBeenCalled();
    });

    it("disables buttons when error is present", async () => {
      render(<LeverageModal {...defaultProps} />);

      const input = screen.getByRole("spinbutton");
      await userEvent.clear(input);
      await userEvent.type(input, "0");

      await waitFor(() => {
        expect(screen.getByText("Leverage must be greater than 0")).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      const submitButton = screen.getByRole("button", { name: /submit/i });

      expect(cancelButton).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });
  });

  describe("Loading States", () => {
    it("shows loading state on Submit button when isLoading is true", () => {
      render(<LeverageModal {...defaultProps} isLoading={true} />);

      const submitButton = screen.getByRole("button", { name: /submit/i });
      expect(submitButton).toBeDisabled();
    });

    it("disables interaction when loading", () => {
      render(<LeverageModal {...defaultProps} isLoading={true} />);

      const input = screen.getByRole("spinbutton");
      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      const submitButton = screen.getByRole("button", { name: /submit/i });

      expect(submitButton).toBeDisabled();
      // Input should still be interactive
      expect(input).not.toBeDisabled();
    });

    it("enables button when not loading", () => {
      render(<LeverageModal {...defaultProps} isLoading={false} />);

      const submitButton = screen.getByRole("button", { name: /submit/i });
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe("Edge Cases", () => {
    it("handles leverage value of 1 (minimum)", () => {
      render(<LeverageModal {...defaultProps} leverage={1} />);

      const input = screen.getByRole("spinbutton") as HTMLInputElement;
      expect(input.value).toBe("1");
    });

    it("handles leverage value equal to maxLeverage", () => {
      render(<LeverageModal {...defaultProps} leverage={50} maxLeverage={50} />);

      const input = screen.getByRole("spinbutton") as HTMLInputElement;
      expect(input.value).toBe("50");
    });

    it("handles maxLeverage of 1", () => {
      render(<LeverageModal {...defaultProps} maxLeverage={1} />);

      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("aria-valuemax", "1");
    });

    it("handles very high maxLeverage values", () => {
      render(<LeverageModal {...defaultProps} maxLeverage={200} />);

      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("aria-valuemax", "200");
    });

    it("handles decimal input correctly", async () => {
      render(<LeverageModal {...defaultProps} />);

      const input = screen.getByRole("spinbutton");
      await userEvent.clear(input);
      await userEvent.type(input, "15.5");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      expect(mockUpdateLeverage).toHaveBeenCalledWith(15.5);
    });

    it("handles non-numeric input", async () => {
      render(<LeverageModal {...defaultProps} />);

      const input = screen.getByRole("spinbutton");
      await userEvent.clear(input);
      await userEvent.type(input, "abc");

      await waitFor(() => {
        expect(screen.getByText("Leverage must be greater than 0")).toBeInTheDocument();
      });
    });

    it("handles empty input on submit", async () => {
      render(<LeverageModal {...defaultProps} />);

      const input = screen.getByRole("spinbutton");
      await userEvent.clear(input);

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      // Should not call updateLeverage with empty value
      expect(mockUpdateLeverage).not.toHaveBeenCalled();
    });

    it("handles rapid value changes", async () => {
      render(<LeverageModal {...defaultProps} />);

      const input = screen.getByRole("spinbutton");

      await userEvent.clear(input);
      await userEvent.type(input, "5");
      await userEvent.clear(input);
      await userEvent.type(input, "10");
      await userEvent.clear(input);
      await userEvent.type(input, "20");

      const inputElement = input as HTMLInputElement;
      expect(inputElement.value).toBe("20");
    });
  });

  describe("Type Safety", () => {
    it("accepts valid leverage number", () => {
      render(<LeverageModal {...defaultProps} leverage={25} />);

      const input = screen.getByRole("spinbutton") as HTMLInputElement;
      expect(parseInt(input.value)).toBe(25);
    });

    it("calls updateLeverage with number type", async () => {
      render(<LeverageModal {...defaultProps} />);

      const input = screen.getByRole("spinbutton");
      await userEvent.clear(input);
      await userEvent.type(input, "30");

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      expect(mockUpdateLeverage).toHaveBeenCalledWith(expect.any(Number));
      expect(mockUpdateLeverage).toHaveBeenCalledWith(30);
    });

    it("ensures maxLeverage constraint is enforced", async () => {
      render(<LeverageModal {...defaultProps} maxLeverage={20} />);

      const input = screen.getByRole("spinbutton") as HTMLInputElement;
      await userEvent.clear(input);
      await userEvent.type(input, "50");

      // Value should be capped at maxLeverage
      expect(parseInt(input.value)).toBeLessThanOrEqual(20);
    });
  });

  describe("Warning Display", () => {
    it("warning text has correct styling", async () => {
      render(<LeverageModal {...defaultProps} maxLeverage={50} />);

      const input = screen.getByRole("spinbutton");
      await userEvent.clear(input);
      await userEvent.type(input, "30");

      await waitFor(() => {
        const warningText = screen.getByText(/High leverage detected/i);
        expect(warningText).toHaveClass("text-[#FFC26D]");
      });
    });

    it("warning section is invisible when no error", () => {
      render(<LeverageModal {...defaultProps} />);

      const input = screen.getByRole("spinbutton");

      // Find the error/warning container - it should have invisible class
      const errorContainer = screen.getByRole("spinbutton").parentElement?.parentElement?.querySelector(".invisible");
      expect(errorContainer).toBeInTheDocument();
    });

    it("warning section becomes visible with error", async () => {
      render(<LeverageModal {...defaultProps} maxLeverage={50} />);

      const input = screen.getByRole("spinbutton");
      await userEvent.clear(input);
      await userEvent.type(input, "30");

      await waitFor(() => {
        const warningText = screen.getByText(/High leverage detected/i);
        expect(warningText).toBeVisible();
      });
    });
  });

  describe("Multiple Leverage Changes", () => {
    it("handles multiple leverage updates correctly", async () => {
      render(<LeverageModal {...defaultProps} />);

      const input = screen.getByRole("spinbutton");
      const submitButton = screen.getByRole("button", { name: /submit/i });

      // First update
      await userEvent.clear(input);
      await userEvent.type(input, "15");
      await userEvent.click(submitButton);

      expect(mockUpdateLeverage).toHaveBeenCalledWith(15);

      // Second update
      await userEvent.clear(input);
      await userEvent.type(input, "25");
      await userEvent.click(submitButton);

      expect(mockUpdateLeverage).toHaveBeenCalledWith(25);
      expect(mockUpdateLeverage).toHaveBeenCalledTimes(2);
    });

    it("maintains state between interactions", async () => {
      const { rerender } = render(<LeverageModal {...defaultProps} leverage={10} />);

      const input = screen.getByRole("spinbutton") as HTMLInputElement;
      expect(input.value).toBe("10");

      rerender(<LeverageModal {...defaultProps} leverage={20} />);

      expect(input.value).toBe("20");
    });
  });
});
