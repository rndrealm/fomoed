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
import { ConditionOperator } from "./condition-group";

type ConditionOperatorProps = {
  allowedOperators: string[];
  value: ConditionOperator | null;
  setValue: (operator: ConditionOperator) => void;
};

const OperatorSelector = ({
  allowedOperators,
  value,
  setValue,
}: ConditionOperatorProps) => {
  const disabled = useMemo(() => {
    return allowedOperators.length === 0 || allowedOperators.length === 1;
  }, [allowedOperators.length]);

  return (
    <div className="w-full">
      <Label className="mb-2 text-muted-foreground">Operator</Label>

      <Select
        disabled={disabled}
        value={value || undefined}
        onValueChange={setValue}
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
  operator: ConditionOperatorProps["value"];
  setOperator: ConditionOperatorProps["setValue"];
  dataSourcePrefix: string | null;
};

const DataSourceOperatorSelector = ({
  operator,
  setOperator,
  dataSourcePrefix,
}: DataSourceOperatorSelectorProps) => {
  const { getDataSourceAllowedOperators } = useDataSources();

  const allowedOperators = useMemo(() => {
    if (!dataSourcePrefix) {
      return [];
    }
    return getDataSourceAllowedOperators(dataSourcePrefix);
  }, [dataSourcePrefix, getDataSourceAllowedOperators]);

  // Automatically set initial operator according to data source
  useEffect(() => {
    if (allowedOperators.length < 1 || operator) {
      return;
    }

    setOperator(allowedOperators[0] as ConditionOperator);
  }, [operator, allowedOperators, setOperator]);

  return (
    <OperatorSelector
      allowedOperators={allowedOperators}
      value={operator}
      setValue={setOperator}
    />
  );
};

export default DataSourceOperatorSelector;
