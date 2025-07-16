import { topicSelectorMap } from "@/constant/signals/data-source-config";
import { ChevronsUpDown, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Condition, ConditionOperator } from "./condition-group";
import DataSourceOperatorSelector from "./data-source-operator-selector";
import SignalDataSourceSelector from "./data-source-selector";
import ValueSuggestions from "./value-suggestions";
import {
  DataSourceType,
  useDataSources,
} from "@/hooks/smart-signals/use-data-sources";
import BoolValSelector from "./value-selectors/bool-val-selector";

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
  const { getDataSourceType } = useDataSources();

  const [dataSourcePrefix, setDataSourcePrefix] = useState<string | null>(null);
  const [operator, setOperator] = useState<ConditionOperator | null>(null);

  const dataSourceType = useMemo<DataSourceType | null>(() => {
    if (dataSourcePrefix) {
      return getDataSourceType(dataSourcePrefix);
    }

    return null;
  }, [dataSourcePrefix, getDataSourceType]);

  const TopicSelector = useMemo(() => {
    if (condition.dataSourceId) {
      return topicSelectorMap[condition.dataSourceId]?.component || null;
    }
    return null;
  }, [condition.dataSourceId]);

  // TODO load this dynamically from API
  const suggestionsEnabled = false;

  const setTopicOnCond = useCallback(
    (topic: string) => {
      const topicWithDataSourcePrefix = dataSourcePrefix + ":" + topic;
      onChange({ ...condition, topic: topicWithDataSourcePrefix });
    },
    [condition, onChange, dataSourcePrefix],
  );

  // Propagate initial operator value into the condition object
  useEffect(() => {
    if (operator && condition.operator !== operator) {
      onChange({ ...condition, operator });
    }
  }, [operator, condition, onChange]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 h-12">
      <SignalDataSourceSelector
        onDataSourcePrefixChange={(value) => {
          onChange({ ...condition, dataSourceId: value, topic: null });
          setDataSourcePrefix(value);
        }}
        value={condition.dataSourceId}
      />

      {condition.dataSourceId ? (
        (TopicSelector && (
          <TopicSelector
            selectedTopic={condition.topic?.replace(/.*:/, "") || null}
            onChange={setTopicOnCond}
            dataSourcePrefix={condition.dataSourceId}
          />
        )) || (
          <div className="bg-red-500 h-12 rounded-lg self-end grid place-items-center font-mono font-semibold">
            MISSCONFIGURED
          </div>
        )
      ) : (
        <div className="w-full">
          <Label className="mb-2 text-muted-foreground">Topic</Label>
          <Button
            variant="outline"
            disabled
            className="w-full justify-between h-12"
          >
            Select topic
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </div>
      )}

      <DataSourceOperatorSelector
        operator={operator}
        setOperator={setOperator}
        dataSourcePrefix={condition.dataSourceId}
      />

      <div className="flex items-center gap-4">
        <div className="flex flex-col w-full">
          <Label className="mb-2 text-muted-foreground">Value</Label>
          {(dataSourceType === "int" ||
            dataSourceType === "string" ||
            dataSourceType === "decimal") && (
            <Input
              type={dataSourceType}
              placeholder="Value"
              className="w-full !h-12"
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

          {dataSourceType === "percentage" && (
            <Input
              type="number"
              max={100}
              min={0}
              placeholder="Percentage %"
              className="w-full !h-12"
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

          {dataSourceType === "bool" && (
            <BoolValSelector
              value={(condition.value as boolean) ?? true}
              onChange={(value) => onChange({ ...condition, value })}
            />
          )}

          {!dataSourceType && (
            <Button
              disabled
              variant="outline"
              onClick={() =>
                onChange({ ...condition, value: !condition.value })
              }
              className="w-full grow justify-between !h-12"
            >
              Select value
            </Button>
          )}

          <div>
            {suggestionsEnabled && (
              <ValueSuggestions
                dataSourceId={condition.dataSourceId}
                topic={condition.topic}
                onSelect={(value) => onChange({ ...condition, value })}
              />
            )}
          </div>
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
