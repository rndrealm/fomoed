import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type OperatorProps = {
  allowedOperators: string[];
  value?: string | null;
  onChange?: (value: string) => void;
};

const Operator = (props: OperatorProps) => {
  return (
    <div className="w-full">
      <Label className="mb-2 text-muted-foreground">Operator</Label>

      <Select
        disabled={!props.allowedOperators.length}
        value={props.value || undefined}
        onValueChange={props.onChange || (() => {})}
      >
        <SelectTrigger className="w-full bg-background !h-12">
          <SelectValue placeholder="Select operator" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px] overflow-y-auto">
          {props.allowedOperators.map((op) => (
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
