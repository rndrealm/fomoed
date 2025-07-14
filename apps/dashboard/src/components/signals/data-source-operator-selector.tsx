import { useDataSources } from "@/hooks/smart-signals/use-data-sources";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useEffect, useState } from "react";

const OperatorSelector = ({
  allowedOperators,
  value,
  onChange,
}: {
  allowedOperators: string[];
  value: string | null;
  onChange: (value: string) => void;
}) => {
  return (
    <div className="w-full">
      <Label className="mb-2 text-muted-foreground">Operator</Label>

      <Select
        disabled={allowedOperators.length === 0}
        value={value || undefined}
        onValueChange={onChange}
      >
        <SelectTrigger className="w-full bg-background !h-12">
          <SelectValue placeholder="Select operator" />
        </SelectTrigger>

        <SelectContent className="max-h-[300px] overflow-y-auto">
          {allowedOperators.map((op) => (
            <SelectItem key={op} value={op} className="pl-6 text-sm">
              {op}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

type DataSourceOperatorSelectorProps = {
  value: string | null;
  onChange: (value: string) => void;
  dataSourcePrefix: string | null;
};

const DataSourceOperatorSelector = (props: DataSourceOperatorSelectorProps) => {
  const { getDataSourceAllowedOperators } = useDataSources();

  const [allowedOperators, setAllowedOperators] = useState<string[]>([]);

  useEffect(() => {
    if (!props.dataSourcePrefix) {
      setAllowedOperators([]);
      return;
    }

    setAllowedOperators(getDataSourceAllowedOperators(props.dataSourcePrefix));
  }, [props.dataSourcePrefix, getDataSourceAllowedOperators]);

  return (
    <OperatorSelector
      allowedOperators={allowedOperators}
      value={props.value || allowedOperators[0]}
      onChange={props.onChange}
    />
  );
};

export default DataSourceOperatorSelector;
