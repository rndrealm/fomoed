import { Plus, Trash2 } from "lucide-react";
import { nanoid } from "nanoid";
import { Button } from "../ui/button";
import ConditionRow from "./condition-row";

export const MAX_DEPTH = 3;

export type Condition = {
  id: string;
  type: "condition";
  dataSourceId: string | null;
  topic: string | null;
  operator: string | null;
  value: string | number | boolean | null;
};

export type Group = {
  id: string;
  type: "group";
  operand: GroupOperand;
  children: (Condition | Group)[];
  depth?: number;
};

export type GroupOperand = "and" | "or";

export const defaultCondition = (): Condition => ({
  id: nanoid(),
  type: "condition",
  dataSourceId: null,
  topic: null,
  operator: null,
  value: null,
});

export const defaultGroup = (depth: number): Group => ({
  id: nanoid(),
  type: "group",
  operand: "and",
  children: [defaultCondition()],
});

type NavConditionGroupProps = {
  group: Group;
  depth: number;
  onUpdate: (group: Group) => void;
  onRemove?: () => void;
};

const SignalConditionGroup = ({
  group,
  depth,
  onUpdate,
  onRemove,
}: NavConditionGroupProps) => {
  // Toggle between and/or
  const handleGroupOperandChange = () => {
    onUpdate({ ...group, operand: group.operand === "and" ? "or" : "and" });
  };

  // Add a new condition at this level
  const handleAddCondition = () => {
    onUpdate({ ...group, children: [...group.children, defaultCondition()] });
  };

  // Add a new group at this level (if depth < MAX_DEPTH)
  const handleAddGroup = () => {
    if (depth < MAX_DEPTH - 1) {
      onUpdate({
        ...group,
        children: [...group.children, defaultGroup(depth + 1)],
      });
    }
  };

  // Update a child (condition or group) by id
  const handleUpdateChild = (id: string, updated: Condition | Group) => {
    const next = group.children.map((c) => (c.id === id ? updated : c));
    onUpdate({ ...group, children: next });
  };

  // Remove a child (condition or group) by id
  const handleRemoveChild = (id: string) => {
    const next = group.children.filter((c) => c.id !== id);
    // Always keep at least one condition in a group
    if (next.length === 0 && depth === 0) {
      onUpdate({ ...group, children: [defaultCondition()] });
    } else {
      onUpdate({ ...group, children: next });
    }
  };

  return (
    <div className="flex flex-col p-5 border border-border rounded-md bg-[#080808]">
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handleGroupOperandChange}
            className="uppercase text-xs bg-white text-black px-2 py-1 border border-border rounded"
          >
            {group.operand}
          </button>
          {onRemove && (
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
        <div className="flex gap-2">
          <Button
            variant={"ghost"}
            size={"sm"}
            className="text-xs flex gap-2 items-center"
            onClick={handleAddCondition}
          >
            <Plus size={12} /> Add condition
          </Button>
          <Button
            variant={"ghost"}
            size={"sm"}
            className=" text-xs"
            onClick={handleAddGroup}
            disabled={depth >= MAX_DEPTH - 1}
          >
            Add group
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {group.children.map((child) =>
          child.type === "condition" ? (
            <ConditionRow
              key={child.id}
              condition={child as Condition}
              onChange={(updated) => handleUpdateChild(child.id, updated)}
              onRemove={() => handleRemoveChild(child.id)}
              isRemovable={group.children.length > 1}
            />
          ) : (
            <div key={child.id} className="pl-4">
              <SignalConditionGroup
                group={child as Group}
                depth={depth + 1}
                onUpdate={(updated) => handleUpdateChild(child.id, updated)}
                onRemove={() => handleRemoveChild(child.id)}
              />
            </div>
          ),
        )}
      </div>
    </div>
  );
};

export default SignalConditionGroup;
