import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import dashboard from "@/lib/assets/dashboard";
import Image from "next/image";
import { useNextStep } from "nextstepjs";

interface IProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OnboardingModal(props: IProps) {
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
            Welcome to Fomoed, your personalized trading dashboard
          </h3>
          <p className="font-medium  text-mid text-[#B9B9B9] leading-[1.35]">
            Build your own market command center with powerful widgets. track,
            analyze, and act
          </p>
        </div>
        <div className="flex flex-col gap-1 mt-8 text-xs font-medium">
          <button
            className="bg-white w-full py-2 rounded-[6px]"
            onClick={() => {
              onOpenChange(false);
              startNextStep("mainTour");
            }}
          >
            Start Walkthrough
          </button>
          <button
            className="w-full py-2 bg-transparent  text-[#B9B9B9]"
            onClick={() => onOpenChange(false)}
          >
            Remind me later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
