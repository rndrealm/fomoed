import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MockRouter from "next-router-mock";
import { MemoryRouterProvider } from "next-router-mock/MemoryRouterProvider";
import { toast } from "sonner";
import { describe, it, expect, beforeEach, vi } from "vitest";
import UpdatePasswordPage from "@/app/auth/update-password/page";
import { setNewPassword, signInWithTokenHash } from "@/services/queries/auth/server-actions";
import { AppRoutes } from "@/lib/routes";
import "@testing-library/jest-dom/vitest";

// Mock the dependencies
vi.mock("@/services/queries/auth/server-actions", () => ({
  setNewPassword: vi.fn(),
  signInWithTokenHash: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: vi.fn(),
}));

vi.mock("next/navigation", () => {
  const actual = vi.importActual("next-router-mock");
  return {
    ...actual,
    useRouter: () => MockRouter,
    useSearchParams: () => new URLSearchParams("token_hash=mock-token-hash"),
  };
});

const mockPush = vi.fn();

// Setup for each test
beforeEach(() => {
  vi.clearAllMocks();
  MockRouter.push = mockPush;
  MockRouter.pathname = "/auth/update-password";
});

// Create a wrapper with the mock router
const renderWithRouter = (ui: React.ReactNode) => {
  return render(<MemoryRouterProvider>{ui}</MemoryRouterProvider>);
};

describe("Update Password Page", () => {
  it("renders update password form correctly", () => {
    renderWithRouter(<UpdatePasswordPage />);

    // Check that form elements are present
    expect(screen.getByPlaceholderText("New Password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Confirm Password")).toBeInTheDocument();
    expect(screen.getByText("Continue")).toBeInTheDocument();
    expect(screen.getByText("Create Password")).toBeInTheDocument();
  });

  it("calls signInWithTokenHash on initial render", async () => {
    renderWithRouter(<UpdatePasswordPage />);

    // Check if signInWithTokenHash was called with the token
    await waitFor(() => {
      expect(signInWithTokenHash).toHaveBeenCalledWith("mock-token-hash");
    });
  });

  it("has submit button disabled when form inputs are empty", async () => {
    renderWithRouter(<UpdatePasswordPage />);

    // Check that the continue button is in the disabled state when no inputs are entered
    const continueButton = screen.getByText("Continue").closest("button");
    expect(continueButton).toHaveAttribute("disabled", "");
  });

  it("enables submit button when both fields have values", async () => {
    renderWithRouter(<UpdatePasswordPage />);

    // Fill form with data
    await userEvent.type(screen.getByPlaceholderText("New Password"), "Password1!");
    await userEvent.type(screen.getByPlaceholderText("Confirm Password"), "Password1!");

    // Check that the submit button is enabled
    const continueButton = screen.getByText("Continue").closest("button");
    expect(continueButton).not.toHaveAttribute("disabled");
  });

  it("validates password minimum length", async () => {
    renderWithRouter(<UpdatePasswordPage />);

    // Fill form with short password
    await userEvent.type(screen.getByPlaceholderText("New Password"), "Pass1!");
    await userEvent.type(screen.getByPlaceholderText("Confirm Password"), "Pass1!");

    // Submit form
    fireEvent.click(screen.getByText("Continue"));

    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText("Password must be at least 8 characters")).toBeInTheDocument();
    });
  });

  it("validates password requires uppercase letter", async () => {
    renderWithRouter(<UpdatePasswordPage />);

    // Fill form with password missing uppercase
    await userEvent.type(screen.getByPlaceholderText("New Password"), "password1!");
    await userEvent.type(screen.getByPlaceholderText("Confirm Password"), "password1!");

    // Submit form
    fireEvent.click(screen.getByText("Continue"));

    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText("Password must contain at least one uppercase letter")).toBeInTheDocument();
    });
  });

  it("validates password requires lowercase letter", async () => {
    renderWithRouter(<UpdatePasswordPage />);

    // Fill form with password missing lowercase
    await userEvent.type(screen.getByPlaceholderText("New Password"), "PASSWORD1!");
    await userEvent.type(screen.getByPlaceholderText("Confirm Password"), "PASSWORD1!");

    // Submit form
    fireEvent.click(screen.getByText("Continue"));

    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText("Password must contain at least one lowercase letter")).toBeInTheDocument();
    });
  });

  it("validates password requires number", async () => {
    renderWithRouter(<UpdatePasswordPage />);

    // Fill form with password missing number
    await userEvent.type(screen.getByPlaceholderText("New Password"), "Password!");
    await userEvent.type(screen.getByPlaceholderText("Confirm Password"), "Password!");

    // Submit form
    fireEvent.click(screen.getByText("Continue"));

    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText("Password must contain at least one number")).toBeInTheDocument();
    });
  });

  it("validates password requires special character", async () => {
    renderWithRouter(<UpdatePasswordPage />);

    // Fill form with password missing special character
    await userEvent.type(screen.getByPlaceholderText("New Password"), "Password1");
    await userEvent.type(screen.getByPlaceholderText("Confirm Password"), "Password1");

    // Submit form
    fireEvent.click(screen.getByText("Continue"));

    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText("Password must contain at least one special character")).toBeInTheDocument();
    });
  });

  it("validates password match", async () => {
    renderWithRouter(<UpdatePasswordPage />);

    // Fill form with mismatched passwords
    await userEvent.type(screen.getByPlaceholderText("New Password"), "Password1!");
    await userEvent.type(screen.getByPlaceholderText("Confirm Password"), "Different1!");

    // Submit form
    fireEvent.click(screen.getByText("Continue"));

    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText("Passwords must match")).toBeInTheDocument();
    });
  });

  it("submits the form with valid data and redirects on success", async () => {
    // Mock successful password update
    (setNewPassword as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });

    renderWithRouter(<UpdatePasswordPage />);

    // Fill form with valid data
    await userEvent.type(screen.getByPlaceholderText("New Password"), "Password1!");
    await userEvent.type(screen.getByPlaceholderText("Confirm Password"), "Password1!");

    // Submit form
    fireEvent.click(screen.getByText("Continue"));

    // Check if the setNewPassword function was called with correct values
    await waitFor(() => {
      expect(setNewPassword).toHaveBeenCalledWith({
        password: "Password1!",
      });
    });

    // Check if redirect happened after successful password update
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(AppRoutes.dashboard.path);
    });
  });

  it("shows error toast when password update fails with specific message", async () => {
    // Mock failed password update
    const errorMessage = "Invalid token";
    (setNewPassword as ReturnType<typeof vi.fn>).mockResolvedValue({ success: false, message: errorMessage });

    renderWithRouter(<UpdatePasswordPage />);

    // Fill form with valid data
    await userEvent.type(screen.getByPlaceholderText("New Password"), "Password1!");
    await userEvent.type(screen.getByPlaceholderText("Confirm Password"), "Password1!");

    // Submit form
    fireEvent.click(screen.getByText("Continue"));

    // Check if error toast was shown
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(errorMessage);
    });

    // Check that redirect didn't happen
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("shows a generic error message when no specific error is returned", async () => {
    // Mock failed password update with no message
    (setNewPassword as ReturnType<typeof vi.fn>).mockResolvedValue({ success: false });

    renderWithRouter(<UpdatePasswordPage />);

    // Fill form with valid data
    await userEvent.type(screen.getByPlaceholderText("New Password"), "Password1!");
    await userEvent.type(screen.getByPlaceholderText("Confirm Password"), "Password1!");

    // Submit form
    fireEvent.click(screen.getByText("Continue"));

    // Check if generic error toast was shown
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith("Something went wrong!");
    });
  });
});
