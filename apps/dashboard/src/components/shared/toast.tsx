"use client";

import React from "react";
import { toast as sonnerToast } from "sonner";
import { Close } from "../icons/icons";

interface ToastProps {
  id: string | number;
  title?: string;
  description: string;
  // button: {
  //   label: string;
  //   onClick: () => void;
  // };
}

/** I recommend abstracting the toast function
 *  so that you can call it without having to use toast.custom everytime. */
export function toast(toast: Omit<ToastProps, "id">) {
  return sonnerToast.custom((id) => <Toast id={id} title={toast.title} description={toast.description} />, {
    position: "top-center",
  });
}

/** A fully custom toast that still maintains the animations and interactions. */
function Toast(props: ToastProps) {
  const { title, description, id } = props;

  return (
    <div className="flex w-full items-center gap-4 rounded-[12px] border border-[#262626] bg-[#0a0a0a] px-4 py-0 md:max-w-[523px]">
      <div className="flex flex-1 items-center">
        <div className="w-full">
          <p className="text-sm leading-[1] tracking-[-1.5%] text-[#FAFAFA]">{description}</p>
        </div>
      </div>
      <button className="flex h-[40px] w-[40px] items-center justify-center">
        <Close />
      </button>
    </div>
  );
}
