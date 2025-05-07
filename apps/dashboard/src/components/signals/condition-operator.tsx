import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type OperatorProps = {
  value?: string | null;
  onChange?: (value: string) => void;
};

const Operator = (props: OperatorProps) => {
  return (
    <div className="w-full">
      <Label className="mb-2 text-muted-foreground">Operator</Label>

      <Select
        disabled={false}
        value={props.value || undefined}
        onValueChange={props.onChange || (() => {})}
      >
        <SelectTrigger className="w-full bg-background">
          <SelectValue placeholder="Select operator" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px] overflow-y-auto">
          {["==", ">", "<", ">=", "<="].map((op) => (
            <SelectItem key={op} value={op} className="pl-6 text-sm">
              {op}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default Operator;
