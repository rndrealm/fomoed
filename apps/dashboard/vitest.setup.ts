import { vi, beforeAll } from "vitest";

// Mock ResizeObserver for components that use it (like Slider)
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock React Query globally
vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();

  // Create a new QueryClient inside the factory to avoid hoisting issues
  const { QueryClient } = actual;
  const mockQueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return {
    ...actual,
    useQueryClient: vi.fn(() => mockQueryClient),
    QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
  };
});

beforeAll(() => {
  vi.mock("next/navigation", async (importOriginal) => {
    const actual = await importOriginal<typeof import("next/navigation")>();
    const { useRouter } = await vi.importActual<typeof import("next-router-mock")>("next-router-mock");
    const usePathname = vi.fn().mockImplementation(() => {
      const router = useRouter();
      return router.pathname;
    });
    const useSearchParams = vi.fn().mockImplementation(() => {
      const router = useRouter();
      return new URLSearchParams(router.query?.toString());
    });
    return {
      ...actual,
      useRouter: vi.fn().mockImplementation(useRouter),
      usePathname,
      useSearchParams,
    };
  });
});
