"use client";
import React, { ReactNode } from "react";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { RenderIf } from "../shared";
import { cn } from "@/lib/utils";

interface IProps {
  children: ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

// text-[#7d7d7d]

export function SubmitButton(props: IProps) {
  const { children, isLoading = false, disabled = false, onClick } = props;
  return (
    <Button
      className={cn(
        `w-full h-[45px] font-medium text-base leading-[1.35] text-[#373737] bg-white hover:bg-white rounded-2xl disabled:opacity-100`,
        isLoading ? "disabled:bg-white" : "disabled:bg-[#2a2a2a]"
      )}
      type="submit"
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      <RenderIf condition={isLoading}>
        <Loader2 className="animate-spin" />
      </RenderIf>
      {children}
    </Button>
  );
}
