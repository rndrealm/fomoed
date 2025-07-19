import { Loader2Icon, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { FunctionComponent } from "react";
import clsx from "clsx";

interface AutoGenerateButtonProps {
  onClick: () => void;
  isPending?: boolean;
}

const AutoGenerateButton: FunctionComponent<AutoGenerateButtonProps> = ({
  onClick,
  isPending = false,
}) => {
  return (
    <Button
      variant="secondary"
      className={clsx(
        "px-4 py-2 font-bold text-white h-12 border-white/10 border",
      )}
      onClick={onClick}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2Icon className="mr-1 h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="mr-1 h-4 w-4" />
      )}
      Auto Generate
    </Button>
  );
};

export default AutoGenerateButton;
