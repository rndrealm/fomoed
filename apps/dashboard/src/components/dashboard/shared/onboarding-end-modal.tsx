import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import dashboard from "@/lib/assets/dashboard";
import Image from "next/image";

interface IProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OnboardingEndModal(props: IProps) {
  const { isOpen, onOpenChange } = props;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTitle></DialogTitle>
      <DialogContent className="test-bg flex h-[30.125rem] w-[27.5625rem] flex-col border-none py-6 [&>button]:hidden">
        <div className="flex flex-1 items-center justify-center">
          <div>
            <Image src={dashboard.logo} width={262} height={64} alt="Fomoed Logo" />
          </div>
        </div>
        <div className="">
          <h3 className="pb-2 text-xl font-semibold text-white">You’re all set!</h3>
          <p className="text-mid leading-[1.35] font-medium text-[#B9B9B9]">
            Start exploring the markets your way. Add more widgets, monitor trends, and stay ahead.
          </p>
        </div>
        <div className="mt-8 flex flex-col gap-1 text-xs font-medium">
          <button
            className="w-full rounded-[6px] bg-white py-2"
            onClick={() => {
              onOpenChange(false);
            }}
          >
            Go to Dashboard
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
