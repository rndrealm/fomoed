import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MockRouter from "next-router-mock";
import { MemoryRouterProvider } from "next-router-mock/MemoryRouterProvider";
import { toast } from "sonner";
import { describe, it, expect, beforeEach, vi } from "vitest";
import LoginPage from "@/app/auth/login/page";
import { loginUser } from "@/services/queries/auth/server-actions";
import { AppRoutes } from "@/lib/routes";
import "@testing-library/jest-dom/vitest";

// Mock the dependencies
vi.mock("@/services/queries/auth/server-actions", () => ({
  loginUser: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: vi.fn(),
}));

vi.mock("next/navigation", () => {
  const actual = vi.importActual("next-router-mock");
  return {
    ...actual,
    useRouter: () => MockRouter,
  };
});

const mockPush = vi.fn();

// Setup for each test
beforeEach(() => {
  vi.clearAllMocks();
  MockRouter.push = mockPush;
  MockRouter.pathname = "/auth/login";
});

// Create a wrapper with the mock router
const renderWithRouter = (ui: React.ReactNode) => {
  return render(<MemoryRouterProvider>{ui}</MemoryRouterProvider>);
};

describe("Login Page", () => {
  it("renders login form correctly", () => {
    renderWithRouter(<LoginPage />);

    // Check that form elements are present
    expect(screen.getByPlaceholderText("you@email.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("password")).toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByText("Welcome Back")).toBeInTheDocument();
    expect(screen.getByText("Login to access more tools.")).toBeInTheDocument();
  });

  it("has submit button disabled when form inputs are empty", async () => {
    renderWithRouter(<LoginPage />);

    // Check that the login button is in the disabled state when no inputs are entered
    const loginButton = screen.getByRole("button", { name: /login/i });
    expect(loginButton).toHaveAttribute("disabled");
  });

  it("enables submit button when both fields have values", async () => {
    renderWithRouter(<LoginPage />);

    // Fill form with data
    await userEvent.type(screen.getByPlaceholderText("you@email.com"), "test@example.com");
    await userEvent.type(screen.getByPlaceholderText("password"), "password123");

    // Check that the submit button is enabled
    const loginButton = screen.getByRole("button", { name: /login/i });
    expect(loginButton).not.toHaveAttribute("disabled");
  });

  it("validates email format", async () => {
    renderWithRouter(<LoginPage />);

    // Fill form with invalid email
    await userEvent.type(screen.getByPlaceholderText("you@email.com"), "invalid-email");
    await userEvent.type(screen.getByPlaceholderText("password"), "password123");

    // Submit form
    fireEvent.click(screen.getByText("Login"));

    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText("Please enter a valid email address")).toBeInTheDocument();
    });
  });

  it("submits the form with valid data and redirects on success", async () => {
    // Mock successful login
    (loginUser as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });

    renderWithRouter(<LoginPage />);

    // Fill form with valid data
    await userEvent.type(screen.getByPlaceholderText("you@email.com"), "test@example.com");
    await userEvent.type(screen.getByPlaceholderText("password"), "password123");

    // Submit form
    fireEvent.click(screen.getByText("Login"));

    // Check for loading state
    expect(screen.getByText("Login")).toBeInTheDocument();

    // Check if the loginUser function was called with correct values
    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });

    // Check if redirect happened after successful login
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(AppRoutes.dashboard.path);
    });
  });

  it("shows error toast when login fails with specific message", async () => {
    // Mock failed login
    const errorMessage = "Invalid credentials";
    (loginUser as ReturnType<typeof vi.fn>).mockResolvedValue({ success: false, message: errorMessage });

    renderWithRouter(<LoginPage />);

    // Fill form with valid data
    await userEvent.type(screen.getByPlaceholderText("you@email.com"), "test@example.com");
    await userEvent.type(screen.getByPlaceholderText("password"), "wrong-password");

    // Submit form
    fireEvent.click(screen.getByText("Login"));

    // Check if error toast was shown
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(errorMessage);
    });

    // Check that redirect didn't happen
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("shows a generic error message when no specific error is returned", async () => {
    // Mock failed login with no message
    (loginUser as ReturnType<typeof vi.fn>).mockResolvedValue({ success: false });

    renderWithRouter(<LoginPage />);

    // Fill form with valid data
    await userEvent.type(screen.getByPlaceholderText("you@email.com"), "test@example.com");
    await userEvent.type(screen.getByPlaceholderText("password"), "password123");

    // Submit form
    fireEvent.click(screen.getByText("Login"));

    // Check if generic error toast was shown
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith("Something went wrong!");
    });
  });

  it("handles exceptions during login process", async () => {
    // Mock login function to throw an error
    (loginUser as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Network error"));

    renderWithRouter(<LoginPage />);

    // Fill form with valid data
    await userEvent.type(screen.getByPlaceholderText("you@email.com"), "test@example.com");
    await userEvent.type(screen.getByPlaceholderText("password"), "password123");

    // Submit form
    fireEvent.click(screen.getByText("Login"));

    // Check that isLoading state was reset
    await waitFor(() => {
      expect(screen.getByText("Login")).toBeInTheDocument();
    });
  });

  it("navigates to forgot password page when 'Reset' is clicked", async () => {
    renderWithRouter(<LoginPage />);

    // Find the Link component with the correct href
    const resetLink = screen.getByText("Reset").closest("a");
    expect(resetLink).toHaveAttribute("href", AppRoutes.auth.forgotPassword.path);
  });
});
