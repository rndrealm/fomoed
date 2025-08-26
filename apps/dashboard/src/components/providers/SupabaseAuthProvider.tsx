"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createSupabaseBrowserClient } from "@/lib/utils/supabase/browser-client";
import { Session, User } from "@supabase/supabase-js";
import { usePathname, useRouter } from "next/navigation";

// Define the context type
type SupabaseAuthContextType = {
  session: Session | null;
  // user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  // refreshSession: () => Promise<void>;
};

// Create the context with default values
const SupabaseAuthContext = createContext<SupabaseAuthContextType>({
  session: null,
  // user: null,
  isLoading: true,
  signOut: async () => {},
  // refreshSession: async () => {},
});

// Custom hook to use the auth context
export const useSupabaseAuth = () => useContext(SupabaseAuthContext);

interface SupabaseAuthProviderProps {
  children: ReactNode;
}

export function SupabaseAuthProvider({ children }: SupabaseAuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  // const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      setIsLoading(true);

      try {
        // Get session data
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setSession(session);
        // setUser(session?.user || null);

        // Listen for auth changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          setSession(session);
          // setUser(session?.user || null);
        });

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
    // eslint-disable-next-line
  }, []);

  // Sign out function
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      // setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Refresh session function
  // const refreshSession = async () => {
  //   try {
  //     const { data, error } = await supabase.auth.refreshSession();
  //     if (error) throw error;
  //     setSession(data.session);
  //     setUser(data.session?.user || null);
  //   } catch (error) {
  //     console.error("Error refreshing session:", error);
  //   }
  // };

  // Check if user is trying to access protected routes without session
  useEffect(() => {
    if (!isLoading && !session) {
      // Check if trying to access dashboard or signals routes
      if (pathname.startsWith("/dashboard") || pathname.includes("/signals")) {
        // Redirect to login page
        router.push("/auth/login");
      }
    }
  }, [isLoading, session, pathname, router]);
  console.log(isLoading, session);

  // Provide the context value
  const value = {
    session,
    // user,
    isLoading,
    signOut,
    // refreshSession,
  };

  return <SupabaseAuthContext.Provider value={value}>{children}</SupabaseAuthContext.Provider>;
}
