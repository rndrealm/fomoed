"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { AppRoutes } from "@/lib/routes";
import FormLogo from "@/components/icons/FormLogo";
import { Button } from "../ui/button";

interface GuestSignupModalProps {
  isOpen: boolean;
}

export function GuestSignupModal({ isOpen }: GuestSignupModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleSignUp = () => {
    router.push(AppRoutes.auth.path);
  };

  const handleLogin = () => {
    router.push(AppRoutes.auth.login.path);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-orange-600/20 blur-3xl" />

        {/* Modal content */}
        <div className="relative bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] border border-[#333] rounded-2xl p-8 shadow-2xl">
          {/* Icon/Logo */}
          <div className="flex justify-center mb-6">
            <FormLogo />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white text-center mb-3">
            Track signals / Never miss out.
          </h2>

          {/* Description */}
          <p className="text-gray-400 text-center mb-8">
            Make every signal count. Create a free account to save your dashboard, access real-time crypto data, and everything needed to stay ahead in crypto.
          </p>

          {/* Benefits list */}
          <div className="space-y-3 mb-8">
            {[
              "Save your custom dashboard layout",
              "Access real-time crypto data",
              "Create unlimited tabs and widgets",
              "Sync across all your devices",
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-orange-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="text-gray-300 text-sm">{benefit}</p>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleSignUp}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Join for free
            </Button>

            <Button
              onClick={handleLogin}
              className="w-full bg-transparent hover:bg-white/5 text-gray-300 hover:text-white font-medium py-3 px-6 rounded-lg border border-[#333] hover:border-[#555] transition-all duration-200"
            >
              Already have an account? Log in
            </Button>
          </div>

          {/* Footer note */}
          <p className="text-xs text-gray-500 text-center mt-6">
            No credit card required • Free forever
          </p>
        </div>
      </div>
    </div>
  );
}
