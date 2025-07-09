import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MockRouter from "next-router-mock";
import { MemoryRouterProvider } from "next-router-mock/MemoryRouterProvider";
import { toast } from "sonner";
import { describe, it, expect, beforeEach, vi } from "vitest";
import SignupPage from "@/app/auth/page";
import { signUpNewUser } from "@/services/queries/auth/server-actions";
import { AppRoutes } from "@/lib/routes";
import "@testing-library/jest-dom/vitest";

// Mock the dependencies
vi.mock("@/services/queries/auth/server-actions", () => ({
  signUpNewUser: vi.fn(),
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
  MockRouter.pathname = "/auth";
});

// Create a wrapper with the mock router
const renderWithRouter = (ui: React.ReactNode) => {
  return render(<MemoryRouterProvider>{ui}</MemoryRouterProvider>);
};

describe("Signup Page", () => {
  it("renders signup form correctly", () => {
    renderWithRouter(<SignupPage />);

    // Check that form elements are present
    expect(screen.getByPlaceholderText("username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@email.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("password")).toBeInTheDocument();
    expect(screen.getByText("Continue")).toBeInTheDocument();
    expect(screen.getByText("Create an Account on Fomoed")).toBeInTheDocument();
  });

  it("has submit button disabled when form inputs are empty", async () => {
    renderWithRouter(<SignupPage />);

    // Check that the continue button is in the disabled state when no inputs are entered
    const continueButton = screen.getByText("Continue").closest("button");
    expect(continueButton).toHaveAttribute("disabled", "");
  });

  it("enables submit button when all fields have values", async () => {
    renderWithRouter(<SignupPage />);

    // Fill form with valid data
    await userEvent.type(screen.getByPlaceholderText("username"), "testuser");
    await userEvent.type(screen.getByPlaceholderText("you@email.com"), "test@example.com");
    await userEvent.type(screen.getByPlaceholderText("password"), "Password1!");

    // Check that the submit button is enabled
    const continueButton = screen.getByText("Continue").closest("button");
    expect(continueButton).not.toHaveAttribute("disabled");
  });

  it("validates partially filled form inputs", async () => {
    renderWithRouter(<SignupPage />);

    // Fill only username, leaving other fields empty
    await userEvent.type(screen.getByPlaceholderText("username"), "testuser");

    // Button should still be disabled
    const continueButton = screen.getByText("Continue").closest("button");
    expect(continueButton).toHaveAttribute("disabled", "");

    // Use programmatic form submission to trigger validation
    // This simulates what would happen if validation were triggered without button click
    fireEvent.submit(screen.getByPlaceholderText("password").closest("form")!);

    // Wait for validation messages
    await waitFor(() => {
      expect(screen.getByText("Please enter your email address")).toBeInTheDocument();
      expect(screen.getByText("Please enter your password")).toBeInTheDocument();
    });
  });

  it("validates email format", async () => {
    renderWithRouter(<SignupPage />);

    // Fill form with invalid email
    await userEvent.type(screen.getByPlaceholderText("username"), "testuser");
    await userEvent.type(screen.getByPlaceholderText("you@email.com"), "invalid-email");
    await userEvent.type(screen.getByPlaceholderText("password"), "Password1!");

    // Submit form
    fireEvent.click(screen.getByText("Continue"));

    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText("Please enter a valid email address")).toBeInTheDocument();
    });
  });

  it("validates password minimum length", async () => {
    renderWithRouter(<SignupPage />);

    // Fill form with short password
    await userEvent.type(screen.getByPlaceholderText("username"), "testuser");
    await userEvent.type(screen.getByPlaceholderText("you@email.com"), "test@example.com");
    await userEvent.type(screen.getByPlaceholderText("password"), "Pass1!");

    // Submit form
    fireEvent.click(screen.getByText("Continue"));

    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText("Password must be at least 8 characters")).toBeInTheDocument();
    });
  });

  it("validates password requires uppercase letter", async () => {
    renderWithRouter(<SignupPage />);

    // Fill form with password missing uppercase
    await userEvent.type(screen.getByPlaceholderText("username"), "testuser");
    await userEvent.type(screen.getByPlaceholderText("you@email.com"), "test@example.com");
    await userEvent.type(screen.getByPlaceholderText("password"), "password1!");

    // Submit form
    fireEvent.click(screen.getByText("Continue"));

    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText("Password must contain at least one uppercase letter")).toBeInTheDocument();
    });
  });

  it("validates password requires lowercase letter", async () => {
    renderWithRouter(<SignupPage />);

    // Fill form with password missing lowercase
    await userEvent.type(screen.getByPlaceholderText("username"), "testuser");
    await userEvent.type(screen.getByPlaceholderText("you@email.com"), "test@example.com");
    await userEvent.type(screen.getByPlaceholderText("password"), "PASSWORD1!");

    // Submit form
    fireEvent.click(screen.getByText("Continue"));

    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText("Password must contain at least one lowercase letter")).toBeInTheDocument();
    });
  });

  it("validates password requires number", async () => {
    renderWithRouter(<SignupPage />);

    // Fill form with password missing number
    await userEvent.type(screen.getByPlaceholderText("username"), "testuser");
    await userEvent.type(screen.getByPlaceholderText("you@email.com"), "test@example.com");
    await userEvent.type(screen.getByPlaceholderText("password"), "Password!");

    // Submit form
    fireEvent.click(screen.getByText("Continue"));

    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText("Password must contain at least one number")).toBeInTheDocument();
    });
  });

  it("validates password requires special character", async () => {
    renderWithRouter(<SignupPage />);

    // Fill form with password missing special character
    await userEvent.type(screen.getByPlaceholderText("username"), "testuser");
    await userEvent.type(screen.getByPlaceholderText("you@email.com"), "test@example.com");
    await userEvent.type(screen.getByPlaceholderText("password"), "Password1");

    // Submit form
    fireEvent.click(screen.getByText("Continue"));

    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText("Password must contain at least one special character")).toBeInTheDocument();
    });
  });

  it("submits the form with valid data and redirects on success", async () => {
    // Mock successful signup
    (signUpNewUser as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });

    renderWithRouter(<SignupPage />);

    // Fill form with valid data
    await userEvent.type(screen.getByPlaceholderText("username"), "testuser");
    await userEvent.type(screen.getByPlaceholderText("you@email.com"), "test@example.com");
    await userEvent.type(screen.getByPlaceholderText("password"), "Password1!");

    // Submit form
    fireEvent.click(screen.getByText("Continue"));

    // Check if the signUpNewUser function was called with correct values
    await waitFor(() => {
      expect(signUpNewUser).toHaveBeenCalledWith({
        username: "testuser",
        email: "test@example.com",
        password: "Password1!",
      });
    });

    // Check if redirect happened after successful signup
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(AppRoutes.auth.mailAuthenticate.path);
    });
  });

  it("shows error toast when signup fails", async () => {
    // Mock failed signup
    const errorMessage = "User already exists";
    (signUpNewUser as ReturnType<typeof vi.fn>).mockResolvedValue({ success: false, message: errorMessage });

    renderWithRouter(<SignupPage />);

    // Fill form with valid data
    await userEvent.type(screen.getByPlaceholderText("username"), "testuser");
    await userEvent.type(screen.getByPlaceholderText("you@email.com"), "test@example.com");
    await userEvent.type(screen.getByPlaceholderText("password"), "Password1!");

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
    // Mock failed signup with no message
    (signUpNewUser as ReturnType<typeof vi.fn>).mockResolvedValue({ success: false });

    renderWithRouter(<SignupPage />);

    // Fill form with valid data
    await userEvent.type(screen.getByPlaceholderText("username"), "testuser");
    await userEvent.type(screen.getByPlaceholderText("you@email.com"), "test@example.com");
    await userEvent.type(screen.getByPlaceholderText("password"), "Password1!");

    // Submit form
    fireEvent.click(screen.getByText("Continue"));

    // Check if generic error toast was shown
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith("Something went wrong!");
    });
  });
});
