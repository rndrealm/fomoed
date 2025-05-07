import { Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Condition } from "./condition-group";
import Operator from "./condition-operator";
import { CFGIConfig } from "./data-configs/CFGIConfig";
import { PriceTickerConfig } from "./data-configs/PriceTickerConfig";
import SignalDataSourceSelector from "./data-source-selector";

type ConditionRowProps = {
  condition: Condition;
  onChange: (c: Condition) => void;
  onRemove: () => void;
  isRemovable: boolean;
};

const topicSelectorMap: Record<
  string,
  React.FC<{ value: string | null; onChange: (value: string) => void }>
> = {
  price: PriceTickerConfig,
  cfgi: CFGIConfig,
};

const ConditionRow = ({
  condition,
  onChange,
  onRemove,
  isRemovable,
}: ConditionRowProps) => {
  // Find the topic selector component for the current data source
  const TopicSelector = condition.dataSource
    ? topicSelectorMap[condition.dataSource]
    : undefined;

  return (
    <div className="flex items-center gap-4">
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
      ) : null}
      <Operator
        value={condition.operator}
        onChange={(v) => onChange({ ...condition, operator: v })}
      />
      <input
        type="text"
        placeholder="Value"
        className="border border-border rounded-md px-2 py-1 bg-background"
        value={condition.value || ""}
        onChange={(e) => onChange({ ...condition, value: e.target.value })}
      />
      {isRemovable && (
        <Button variant="ghost" size="icon" className="p-2" onClick={onRemove}>
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      )}
    </div>
  );
};

export default ConditionRow;
