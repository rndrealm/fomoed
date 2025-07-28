import { Button } from "@/components/ui/button";
import { FunctionComponent } from "react";

interface BoolValSelectorProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

const BoolValSelector: FunctionComponent<BoolValSelectorProps> = ({
  value,
  onChange,
}) => {
  return (
    <Button
      variant="outline"
      onClick={() => onChange(!value)}
      className="w-full justify-between !h-12"
    >
      {value ? "True" : "False"}
    </Button>
  );
};

export default BoolValSelector;
