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
  id?: string;
}

// text-[#7d7d7d]

export function SubmitButton(props: IProps) {
  const { children, isLoading = false, disabled = false, onClick, id } = props;
  return (
    <Button
      className={cn(
        `h-[45px] w-full rounded-2xl bg-white text-base leading-[1.35] font-medium text-[#373737] transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#151515] disabled:bg-[#0C0C0C] disabled:text-[#7d7d7d]`,
        isLoading ? "disabled:bg-white" : "disabled:bg-[#2a2a2a]",
      )}
      type="submit"
      disabled={disabled || isLoading}
      onClick={onClick}
      id={id}
      aria-label="Sign in"
    >
      <RenderIf condition={isLoading}>
        <Loader2 className="animate-spin" />
      </RenderIf>
      {children}
    </Button>
  );
}
