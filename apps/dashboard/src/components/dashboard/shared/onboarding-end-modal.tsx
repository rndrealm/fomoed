import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import dashboard from "@/lib/assets/dashboard";
import Image from "next/image";
import { useNextStep } from "nextstepjs";

interface IProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OnboardingEndModal(props: IProps) {
  const { isOpen, onOpenChange } = props;
  const { startNextStep } = useNextStep();
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTitle></DialogTitle>
      <DialogContent className="w-[27.5625rem] h-[30.125rem] flex flex-col test-bg border-none py-6 [&>button]:hidden">
        <div className="flex items-center justify-center flex-1">
          <div>
            <Image
              src={dashboard.logo}
              width={262}
              height={64}
              alt="Fomoed Logo"
            />
          </div>
        </div>
        <div className="">
          <h3 className="pb-2 text-xl font-semibold text-white ">
            You’re all set!
          </h3>
          <p className="font-medium  text-mid text-[#B9B9B9] leading-[1.35]">
            Start exploring the markets your way. Add more widgets, monitor
            trends, and stay ahead.
          </p>
        </div>
        <div className="flex flex-col gap-1 mt-8 text-xs font-medium">
          <button
            className="bg-white w-full py-2 rounded-[6px]"
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
