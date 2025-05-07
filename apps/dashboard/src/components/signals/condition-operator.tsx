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
    <Select
      disabled={false}
      value={props.value || undefined}
      onValueChange={props.onChange || (() => {})}
    >
      <SelectTrigger className="w-[180px] bg-background">
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
  );
};

export default Operator;
