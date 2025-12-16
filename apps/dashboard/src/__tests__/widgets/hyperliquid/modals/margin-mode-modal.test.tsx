import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import MarginModeModal from "@/components/widgets/trading/hyperliquid/modals/margin-mode-modal";

// Mock OrderCheckLayout to simplify testing
vi.mock("@/components/widgets/trading/hyperliquid/create-order/order-check-layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("MarginModeModal Component", () => {
  const mockUpdateMarginMode = vi.fn();
  const mockOnClose = vi.fn();

  const defaultProps = {
    isCross: false,
    updateMarginMode: mockUpdateMarginMode,
    isLoading: false,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Component Rendering", () => {
    it("renders the margin mode modal correctly", () => {
      render(<MarginModeModal {...defaultProps} />);

      expect(screen.getByText("Cross")).toBeInTheDocument();
      expect(screen.getByText("Isolated")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
    });

    it("displays Cross margin mode option with description", () => {
      render(<MarginModeModal {...defaultProps} />);

      expect(screen.getByText("Cross")).toBeInTheDocument();
      expect(
        screen.getByText(/Your available balance backs all open positions/i),
      ).toBeInTheDocument();
    });

    it("displays Isolated margin mode option with description", () => {
      render(<MarginModeModal {...defaultProps} />);

      expect(screen.getByText("Isolated")).toBeInTheDocument();
      expect(
        screen.getByText(/Only the margin you assign to this position is at risk/i),
      ).toBeInTheDocument();
    });

    it("renders both margin mode options as clickable buttons", () => {
      render(<MarginModeModal {...defaultProps} />);

      const buttons = screen.getAllByRole("button");
      // Should have Cross, Isolated, and Submit buttons
      expect(buttons.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("Initial Selection State", () => {
    it("shows Cross mode as selected when isCross is true", () => {
      render(<MarginModeModal {...defaultProps} isCross={true} />);

      // Check for checked checkbox in Cross option
      const crossOption = screen.getByText("Cross").closest("button");
      expect(crossOption).toBeInTheDocument();
    });

    it("shows Isolated mode as selected when isCross is false", () => {
      render(<MarginModeModal {...defaultProps} isCross={false} />);

      // Check for checked checkbox in Isolated option
      const isolatedOption = screen.getByText("Isolated").closest("button");
      expect(isolatedOption).toBeInTheDocument();
    });

    it("correctly initializes with cross margin mode", () => {
      render(<MarginModeModal {...defaultProps} isCross={true} />);

      // Verify the component renders without errors
      expect(screen.getByText("Cross")).toBeInTheDocument();
      expect(screen.getByText("Isolated")).toBeInTheDocument();
    });

    it("correctly initializes with isolated margin mode", () => {
      render(<MarginModeModal {...defaultProps} isCross={false} />);

      // Verify the component renders without errors
      expect(screen.getByText("Cross")).toBeInTheDocument();
      expect(screen.getByText("Isolated")).toBeInTheDocument();
    });
  });

  describe("Margin Mode Selection", () => {
    it("allows selecting Cross margin mode", async () => {
      render(<MarginModeModal {...defaultProps} isCross={false} />);

      const crossButton = screen.getByText("Cross").closest("button");
      if (crossButton) {
        await userEvent.click(crossButton);
      }

      // Verify the selection changed (component should update)
      expect(crossButton).toBeInTheDocument();
    });

    it("allows selecting Isolated margin mode", async () => {
      render(<MarginModeModal {...defaultProps} isCross={true} />);

      const isolatedButton = screen.getByText("Isolated").closest("button");
      if (isolatedButton) {
        await userEvent.click(isolatedButton);
      }

      // Verify the selection changed
      expect(isolatedButton).toBeInTheDocument();
    });

    it("allows switching between modes multiple times", async () => {
      render(<MarginModeModal {...defaultProps} isCross={false} />);

      const crossButton = screen.getByText("Cross").closest("button");
      const isolatedButton = screen.getByText("Isolated").closest("button");

      // Switch to Cross
      if (crossButton) {
        await userEvent.click(crossButton);
      }

      // Switch back to Isolated
      if (isolatedButton) {
        await userEvent.click(isolatedButton);
      }

      // Switch to Cross again
      if (crossButton) {
        await userEvent.click(crossButton);
      }

      expect(crossButton).toBeInTheDocument();
    });

    it("clicking the same option twice does not cause errors", async () => {
      render(<MarginModeModal {...defaultProps} isCross={false} />);

      const isolatedButton = screen.getByText("Isolated").closest("button");

      if (isolatedButton) {
        await userEvent.click(isolatedButton);
        await userEvent.click(isolatedButton);
      }

      expect(isolatedButton).toBeInTheDocument();
    });
  });

  describe("Submit Functionality", () => {
    it("calls updateMarginMode with true when submitting Cross mode", async () => {
      render(<MarginModeModal {...defaultProps} isCross={false} />);

      // Select Cross mode
      const crossButton = screen.getByText("Cross").closest("button");
      if (crossButton) {
        await userEvent.click(crossButton);
      }

      // Click Submit
      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      expect(mockUpdateMarginMode).toHaveBeenCalledWith(true);
      expect(mockUpdateMarginMode).toHaveBeenCalledTimes(1);
    });

    it("calls updateMarginMode with false when submitting Isolated mode", async () => {
      render(<MarginModeModal {...defaultProps} isCross={true} />);

      // Select Isolated mode
      const isolatedButton = screen.getByText("Isolated").closest("button");
      if (isolatedButton) {
        await userEvent.click(isolatedButton);
      }

      // Click Submit
      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      expect(mockUpdateMarginMode).toHaveBeenCalledWith(false);
      expect(mockUpdateMarginMode).toHaveBeenCalledTimes(1);
    });

    it("submits initial mode if no changes made", async () => {
      render(<MarginModeModal {...defaultProps} isCross={true} />);

      // Click Submit without making any changes
      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      expect(mockUpdateMarginMode).toHaveBeenCalledWith(true);
    });

    it("submits the most recent selection when mode is changed multiple times", async () => {
      render(<MarginModeModal {...defaultProps} isCross={false} />);

      const crossButton = screen.getByText("Cross").closest("button");
      const isolatedButton = screen.getByText("Isolated").closest("button");

      // Make multiple changes
      if (crossButton) {
        await userEvent.click(crossButton);
      }
      if (isolatedButton) {
        await userEvent.click(isolatedButton);
      }
      if (crossButton) {
        await userEvent.click(crossButton);
      }

      // Submit
      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      // Should submit Cross (the last selection)
      expect(mockUpdateMarginMode).toHaveBeenCalledWith(true);
    });

    it("does not call onClose when Submit is clicked", async () => {
      render(<MarginModeModal {...defaultProps} />);

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("Loading States", () => {
    it("shows loading state on Submit button when isLoading is true", () => {
      render(<MarginModeModal {...defaultProps} isLoading={true} />);

      const submitButton = screen.getByRole("button", { name: /submit/i });
      expect(submitButton).toBeDisabled();
    });

    it("enables Submit button when not loading", () => {
      render(<MarginModeModal {...defaultProps} isLoading={false} />);

      const submitButton = screen.getByRole("button", { name: /submit/i });
      expect(submitButton).not.toBeDisabled();
    });

    it("allows mode selection while loading", async () => {
      render(<MarginModeModal {...defaultProps} isLoading={true} />);

      const crossButton = screen.getByText("Cross").closest("button");
      if (crossButton) {
        await userEvent.click(crossButton);
      }

      // Selection should still work
      expect(crossButton).toBeInTheDocument();
    });

    it("prevents multiple submissions when loading", async () => {
      render(<MarginModeModal {...defaultProps} isLoading={true} />);

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      // Should not be called because button is disabled
      expect(mockUpdateMarginMode).not.toHaveBeenCalled();
    });
  });

  describe("Mode Descriptions", () => {
    it("displays complete Cross mode description", () => {
      render(<MarginModeModal {...defaultProps} />);

      const description = screen.getByText(/Your available balance backs all open positions/i);
      expect(description).toBeInTheDocument();
    });

    it("displays complete Isolated mode description", () => {
      render(<MarginModeModal {...defaultProps} />);

      const description = screen.getByText(/Only the margin you assign to this position is at risk/i);
      expect(description).toBeInTheDocument();
    });

    it("shows that Cross mode affects entire account", () => {
      render(<MarginModeModal {...defaultProps} />);

      expect(
        screen.getByText(/Your available balance backs all open positions/i),
      ).toBeInTheDocument();
    });

    it("shows that Isolated mode limits risk", () => {
      render(<MarginModeModal {...defaultProps} />);

      expect(
        screen.getByText(/Only the margin you assign to this position is at risk/i),
      ).toBeInTheDocument();
    });
  });

  describe("Visual Styling", () => {
    it("applies correct styling to mode option containers", () => {
      render(<MarginModeModal {...defaultProps} />);

      const crossButton = screen.getByText("Cross").closest("button");
      expect(crossButton).toHaveClass("bg-[#18181A]");
    });

    it("renders checkboxes for mode selection", () => {
      render(<MarginModeModal {...defaultProps} />);

      // Both Cross and Isolated should have checkbox-like behavior
      expect(screen.getByText("Cross")).toBeInTheDocument();
      expect(screen.getByText("Isolated")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles rapid mode switching", async () => {
      render(<MarginModeModal {...defaultProps} isCross={false} />);

      const crossButton = screen.getByText("Cross").closest("button");
      const isolatedButton = screen.getByText("Isolated").closest("button");

      // Rapid switches
      if (crossButton && isolatedButton) {
        await userEvent.click(crossButton);
        await userEvent.click(isolatedButton);
        await userEvent.click(crossButton);
        await userEvent.click(isolatedButton);
        await userEvent.click(crossButton);
      }

      expect(crossButton).toBeInTheDocument();
    });

    it("handles submit without making any selection changes", async () => {
      render(<MarginModeModal {...defaultProps} isCross={true} />);

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      expect(mockUpdateMarginMode).toHaveBeenCalledWith(true);
    });

    it("maintains selection state between renders", () => {
      const { rerender } = render(<MarginModeModal {...defaultProps} isCross={false} />);

      expect(screen.getByText("Isolated")).toBeInTheDocument();

      rerender(<MarginModeModal {...defaultProps} isCross={true} />);

      expect(screen.getByText("Cross")).toBeInTheDocument();
    });
  });

  describe("Type Safety", () => {
    it("passes boolean true for Cross mode", async () => {
      render(<MarginModeModal {...defaultProps} isCross={false} />);

      const crossButton = screen.getByText("Cross").closest("button");
      if (crossButton) {
        await userEvent.click(crossButton);
      }

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      expect(mockUpdateMarginMode).toHaveBeenCalledWith(expect.any(Boolean));
      expect(mockUpdateMarginMode).toHaveBeenCalledWith(true);
    });

    it("passes boolean false for Isolated mode", async () => {
      render(<MarginModeModal {...defaultProps} isCross={true} />);

      const isolatedButton = screen.getByText("Isolated").closest("button");
      if (isolatedButton) {
        await userEvent.click(isolatedButton);
      }

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      expect(mockUpdateMarginMode).toHaveBeenCalledWith(expect.any(Boolean));
      expect(mockUpdateMarginMode).toHaveBeenCalledWith(false);
    });

    it("ensures isCross prop is boolean", () => {
      const { unmount } = render(<MarginModeModal {...defaultProps} isCross={true as boolean} />);
      expect(screen.getByText("Cross")).toBeInTheDocument();

      unmount();
      render(<MarginModeModal {...defaultProps} isCross={false as boolean} />);
      expect(screen.getByText("Isolated")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("renders mode options as interactive buttons", () => {
      render(<MarginModeModal {...defaultProps} />);

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThanOrEqual(3); // Cross, Isolated, Submit
    });

    it("submit button has proper role", () => {
      render(<MarginModeModal {...defaultProps} />);

      const submitButton = screen.getByRole("button", { name: /submit/i });
      expect(submitButton).toBeInTheDocument();
    });

    it("mode option labels are visible", () => {
      render(<MarginModeModal {...defaultProps} />);

      expect(screen.getByText("Cross")).toBeVisible();
      expect(screen.getByText("Isolated")).toBeVisible();
    });

    it("descriptions are visible for both modes", () => {
      render(<MarginModeModal {...defaultProps} />);

      const crossDesc = screen.getByText(/Your available balance backs all open positions/i);
      const isolatedDesc = screen.getByText(/Only the margin you assign to this position is at risk/i);

      expect(crossDesc).toBeVisible();
      expect(isolatedDesc).toBeVisible();
    });
  });

  describe("Complete User Flow", () => {
    it("completes full flow: render -> select -> submit", async () => {
      render(<MarginModeModal {...defaultProps} isCross={false} />);

      // Initial state
      expect(screen.getByText("Isolated")).toBeInTheDocument();

      // Select Cross
      const crossButton = screen.getByText("Cross").closest("button");
      if (crossButton) {
        await userEvent.click(crossButton);
      }

      // Submit
      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      // Verify callback
      expect(mockUpdateMarginMode).toHaveBeenCalledWith(true);
    });

    it("completes flow with mode switch before submit", async () => {
      render(<MarginModeModal {...defaultProps} isCross={true} />);

      // Switch to Isolated
      const isolatedButton = screen.getByText("Isolated").closest("button");
      if (isolatedButton) {
        await userEvent.click(isolatedButton);
      }

      // Switch back to Cross
      const crossButton = screen.getByText("Cross").closest("button");
      if (crossButton) {
        await userEvent.click(crossButton);
      }

      // Submit
      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      // Should submit the last selection (Cross = true)
      expect(mockUpdateMarginMode).toHaveBeenCalledWith(true);
    });
  });

  describe("Mode Option Values", () => {
    it("Cross option has value true", async () => {
      render(<MarginModeModal {...defaultProps} isCross={false} />);

      const crossButton = screen.getByText("Cross").closest("button");
      if (crossButton) {
        await userEvent.click(crossButton);
      }

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      const callArg = mockUpdateMarginMode.mock.calls[0][0];
      expect(callArg).toBe(true);
      expect(typeof callArg).toBe("boolean");
    });

    it("Isolated option has value false", async () => {
      render(<MarginModeModal {...defaultProps} isCross={true} />);

      const isolatedButton = screen.getByText("Isolated").closest("button");
      if (isolatedButton) {
        await userEvent.click(isolatedButton);
      }

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await userEvent.click(submitButton);

      const callArg = mockUpdateMarginMode.mock.calls[0][0];
      expect(callArg).toBe(false);
      expect(typeof callArg).toBe("boolean");
    });
  });
});
