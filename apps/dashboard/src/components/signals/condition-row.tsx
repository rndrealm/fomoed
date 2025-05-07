import { ChevronsUpDown, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
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
        value={condition.operator}
        onChange={(v) => onChange({ ...condition, operator: v })}
      />

      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <Label className="mb-2 text-muted-foreground">Value</Label>
          <Input
            type="number"
            placeholder="Value"
            className="w-fit"
            value={condition.value || ""}
            onChange={(e) => onChange({ ...condition, value: e.target.value })}
          />
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
