import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Condition,
  ConditionGroup as ConditionGroupType,
} from "@/lib/types/signal.types";
import {
  createConditionGroup,
  createSimpleCondition,
  toggleGroupOperator,
} from "@/lib/utils/signal.utils";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import React from "react";
import SimpleConditionComponent from "./simple-condition";

interface ConditionGroupProps {
  group: ConditionGroupType;
  onUpdate: (updatedGroup: ConditionGroupType) => void;
  onDelete?: () => void;
  nestingLevel?: number;
  isRoot?: boolean;
  assetPair?: string;
}

const ConditionGroupComponent: React.FC<ConditionGroupProps> = ({
  group,
  onUpdate,
  onDelete,
  nestingLevel = 0,
  isRoot = false,
  assetPair,
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const handleAddCondition = () => {
    const newCondition = createSimpleCondition();
    if (assetPair) {
      newCondition.assetPair = assetPair;
    }

    const updatedGroup = {
      ...group,
      conditions: [...group.conditions, newCondition],
    };
    onUpdate(updatedGroup);
  };

  const handleAddGroup = () => {
    const newGroup = createConditionGroup();
    if (assetPair) {
      newGroup.assetPair = assetPair;
    }

    const updatedGroup = {
      ...group,
      conditions: [...group.conditions, newGroup],
    };
    onUpdate(updatedGroup);
  };

  const handleConditionUpdate = (
    index: number,
    updatedCondition: Condition
  ) => {
    const updatedConditions = [...group.conditions];
    updatedConditions[index] = updatedCondition;
    onUpdate({
      ...group,
      conditions: updatedConditions,
    });
  };

  const handleConditionDelete = (index: number) => {
    // Don't allow deleting the last condition in the root group
    if (isRoot && group.conditions.length <= 1) {
      return;
    }
    const updatedConditions = [...group.conditions];
    updatedConditions.splice(index, 1);
    onUpdate({
      ...group,
      conditions: updatedConditions,
    });
  };

  const toggleOperator = () => {
    onUpdate(toggleGroupOperator(group));
  };

  const borderColor =
    nestingLevel % 3 === 0
      ? "border-orange-400"
      : nestingLevel % 3 === 1
        ? "border-blue-400"
        : "border-purple-400";

  return (
    <Card
      className={`transition-all duration-200 ease-in-out mb-3 border-l-4 ${borderColor} gap-2`}
    >
      <CardHeader className="px-4 py-2 flex flex-row items-center justify-between ">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-6 w-6"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>

          <Badge
            onClick={toggleOperator}
            className="cursor-pointer bg-orange-500 hover:bg-orange-500/90"
          >
            {group.operator}
          </Badge>

          {!isRoot && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-gray-500 hover:text-destructive ml-2"
            >
              Remove
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddCondition}
            className="text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Condition
          </Button>

          {nestingLevel < 3 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddGroup}
              className="text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Group
            </Button>
          )}
        </div>
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="pt-2">
          {group.conditions.map((condition, index) => (
            <div key={condition.id} className="mb-2">
              {condition.type === "simple" ? (
                <SimpleConditionComponent
                  condition={condition as any}
                  onUpdate={(updated) => handleConditionUpdate(index, updated)}
                  onDelete={() => handleConditionDelete(index)}
                  assetPair={assetPair}
                />
              ) : (
                <ConditionGroupComponent
                  group={condition as ConditionGroupType}
                  onUpdate={(updated) => handleConditionUpdate(index, updated)}
                  onDelete={() => handleConditionDelete(index)}
                  nestingLevel={nestingLevel + 1}
                  assetPair={assetPair}
                />
              )}
            </div>
          ))}

          {group.conditions.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No conditions. Add a condition or group.
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default ConditionGroupComponent;
