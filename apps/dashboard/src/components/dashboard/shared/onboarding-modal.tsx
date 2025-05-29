import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTour } from "@reactour/tour";

interface IProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OnboardingModal(props: IProps) {
  const { isOpen, onOpenChange } = props;
  const { setIsOpen } = useTour();
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Welcome</DialogTitle>
          <DialogDescription>
            This is a guided tour to help you get started with the dashboard.
            You can skip this at any time.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center py-4">
          <div className="w-14 h-14 rounded-2xl bg-[#333] animate-pulse" />
        </div>
        <DialogFooter>
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="bg-red-500"
          >
            Skip Tour
          </Button>
          <Button
            type="button"
            onClick={() => {
              onOpenChange(false);
              setTimeout(() => {
                setIsOpen(true);
              }, 500);
            }}
          >
            Start Tour
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
