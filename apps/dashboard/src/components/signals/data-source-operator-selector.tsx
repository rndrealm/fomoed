import { useDataSources } from "@/hooks/smart-signals/use-data-sources";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";

const OperatorSelector = ({
  allowedOperators,
  value,
  onChange,
}: {
  allowedOperators: string[];
  value: string | null;
  onChange: (value: string) => void;
}) => {
  const disabled = useMemo(() => {
    return allowedOperators.length === 0 || allowedOperators.length === 1;
  }, [allowedOperators.length]);

  return (
    <div className="w-full">
      <Label className="mb-2 text-muted-foreground">Operator</Label>

      <Select
        disabled={disabled}
        value={value || undefined}
        onValueChange={onChange}
      >
        <SelectTrigger
          className={clsx(
            "w-full bg-background !h-12 group-disabled:pointer-events-none",
            { "pointer-events-none": disabled },
          )}
        >
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
