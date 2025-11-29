"use client";
import React from "react";
import { ModalContainer } from "../../shared";
import { cn } from "@/lib/utils";

interface TermsAndConditionsModalProps {
  isOpen: boolean;
  onContinue: () => void;
  isLoading?: boolean;
}

export function TermsAndConditionsModal({ isOpen, onContinue, isLoading = false }: TermsAndConditionsModalProps) {
  return (
    <ModalContainer
      open={isOpen}
      handleClose={() => {}}
      className="!max-w-[528px] w-[90%] bg-[#FFFFFF] border border-[#DCDCDC] rounded-[20px] p-4 flex flex-col gap-5"
      title=""
      noHeader
      bgBlur={true}
    >
      <div className="flex flex-col items-center justify-center text-left space-y-5">
        <p className="text-[16px] font-inter font-normal text-[#646464] leading-relaxed">
          By clicking continue you agree to the{" "}
          <a
            href="/terms-of-service"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0C0C0C] underline font-medium hover:opacity-80"
          >
            Terms of Service and Privacy Policy
          </a>{" "}
          of Fomoed.
        </p>

        <button
          onClick={onContinue}
          disabled={isLoading}
          className={cn(
            "w-[496px] h-[56px] rounded-[10px] bg-[#E7E7E7] text-[16px] font-medium text-[#000000] transition",
            isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-[#dcdcdc]",
          )}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
              Processing...
            </div>
          ) : (
            "Continue"
          )}
        </button>
      </div>
    </ModalContainer>
  );
}
