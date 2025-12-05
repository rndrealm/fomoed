import React, { ReactNode } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import CloseIcon from "../icons/CloseIcon";
import { cn } from "@/lib/utils";
import { RenderIf } from "./render-if";
import { DialogDescription } from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface IProps {
  open: boolean;
  handleClose: () => void;
  children: ReactNode;
  size?: "lg";
  className?: string;
  title?: string;
  description?: string;
  noHeader?: boolean;
  bgBlur?: boolean;
  dialogOverlayClassName?: string;
  hideX?: boolean;
  headerClassName?: string;
  preventOutsideClick?: boolean;
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
    description,
    noHeader = false,
    bgBlur = true,
    dialogOverlayClassName = "",
    headerClassName = "",
    preventOutsideClick = false,
    hideX,
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
        onInteractOutside={(e) => {
          if (preventOutsideClick) {
            e.preventDefault();
          }
        }}
        dialogOverlayClassName={cn(!bgBlur ? "backdrop-blur-[0px] bg-[transparent]" : "", dialogOverlayClassName)}
      >
        <DialogTitle className={cn(noHeader ? "hidden" : "")}>
          <div className="flex items-center justify-between">
            <p className={cn("text-base text-white", headerClassName)}>{title}</p>

            <RenderIf condition={!hideX}>
              <button type="button" onClick={handleClose}>
                <CloseIcon />
              </button>
            </RenderIf>
          </div>
        </DialogTitle>
        <VisuallyHidden>
          <DialogDescription>{description || title || "Dialog description"}</DialogDescription>
        </VisuallyHidden>

        {children}
      </DialogContent>
    </Dialog>
  );
}
