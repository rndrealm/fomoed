import React, { ReactNode } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import CloseIcon from "../icons/CloseIcon";
import { cn } from "@/lib/utils";
import { RenderIf } from "./render-if";

interface IProps {
  open: boolean;
  handleClose: () => void;
  children: ReactNode;
  size?: "lg";
  className?: string;
  title?: string;
  noHeader?: boolean;
  bgBlur?: boolean;
  dialogOverlayClassName?: string;
}

const sizeClassMap: Record<NonNullable<IProps["size"]>, string> = {
  lg: "!max-w-[628px]",
};

export function ModalContainer(props: IProps) {
  const {
    open,
    handleClose,
    children,
    size = "lg",
    className = "",
    title,
    noHeader = false,
    bgBlur = true,
    dialogOverlayClassName = "",
  } = props;

  const contentClasses = cn(
    "bg-[#212426] [&>button.absolute.top-4.right-4]:hidden rounded-lg border-none p-3 max-h-[680px] overflow-y-auto sm:w-full w-[90%] flex flex-col gap-4",
    size && sizeClassMap[size],
    className,
  );

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        handleClose();
      }}
    >
      <DialogContent
        className={contentClasses}
        dialogOverlayClassName={cn(!bgBlur ? "backdrop-blur-[0px] bg-[transparent]" : "", dialogOverlayClassName)}
      >
        <DialogTitle className={cn(noHeader ? "hidden" : "")}>
          <div className="flex items-center justify-between">
            <p className="text-base text-white">{title}</p>

            <button type="button" onClick={handleClose}>
              <CloseIcon />
            </button>
          </div>
        </DialogTitle>

        {children}
      </DialogContent>
    </Dialog>
  );
}
