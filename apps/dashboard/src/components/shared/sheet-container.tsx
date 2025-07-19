import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ReactNode } from "react";

interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function SheetContainer(props: IProps) {
  const { open, onOpenChange, children } = props;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="max-w-[39rem]">{children}</SheetContent>
    </Sheet>
  );
}
