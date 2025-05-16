import { topicSelectorMap } from "@/constant/signals/data-source-config";
import { ChevronsUpDown, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Condition } from "./condition-group";
import Operator from "./condition-operator";
import SignalDataSourceSelector from "./data-source-selector";

type ConditionRowProps = {
  condition: Condition;
  onChange: (c: Condition) => void;
  onRemove: () => void;
  isRemovable: boolean;
};

const ConditionRow = ({
  condition,
  onChange,
  onRemove,
  isRemovable,
}: ConditionRowProps) => {
  const TopicSelector = useMemo(() => {
    if (condition.dataSource) {
      return topicSelectorMap[condition.dataSource]?.component || null;
    }
    return null;
  }, [condition.dataSource]);

  const allowedOperators = useMemo(() => {
    if (condition.dataSource) {
      return topicSelectorMap[condition.dataSource]?.allowedOperators || [];
    }
    return [];
  }, [condition.dataSource]);

  const valueType = useMemo(() => {
    if (condition.dataSource) {
      return topicSelectorMap[condition.dataSource]?.valueType || null;
    }
    return null;
  }, [condition.dataSource]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <SignalDataSourceSelector
        onChange={(value) =>
          onChange({ ...condition, dataSource: value, topic: null })
        }
        value={condition.dataSource}
      />
      {TopicSelector ? (
        <TopicSelector
          value={condition.topic}
          onChange={(v) => onChange({ ...condition, topic: v })}
        />
      ) : (
        <div className="w-full">
          <Label className="mb-2 text-muted-foreground">Topic</Label>
          <Button
            variant="outline"
            disabled
            className="w-full justify-between "
          >
            Select topic
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </div>
      )}
      <Operator
        allowedOperators={allowedOperators}
        value={condition.operator}
        onChange={(v) => onChange({ ...condition, operator: v })}
      />

      <div className="flex items-center gap-4">
        <div className="flex flex-col w-full">
          <Label className="mb-2 text-muted-foreground">Value</Label>
          {(valueType === "number" || valueType === "string") && (
            <Input
              type={valueType}
              placeholder="Value"
              className="w-fit"
              value={
                typeof condition.value === "string" ||
                typeof condition.value === "number"
                  ? condition.value
                  : ""
              }
              onChange={(e) =>
                onChange({ ...condition, value: e.target.value })
              }
            />
          )}

          {valueType === "boolean" && (
            <Button
              variant="outline"
              onClick={() =>
                onChange({ ...condition, value: !condition.value })
              }
              className="w-fit flex-1 justify-between "
            >
              {condition.value ? "True" : "False"}
            </Button>
          )}

          {!valueType && (
            <Button
              disabled
              variant="outline"
              onClick={() =>
                onChange({ ...condition, value: !condition.value })
              }
              className="w-full grow justify-between "
            >
              Select value
            </Button>
          )}
        </div>
        <Separator orientation="vertical" />
        {isRemovable && (
          <Button
            variant="ghost"
            size="icon"
            className="p-2"
            onClick={onRemove}
          >
            <Trash2 className="w-4 h-4 text-muted-foreground" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ConditionRow;
