import { nanoid } from "nanoid";
import { useCallback, useEffect, useState } from "react";
import SignalConditionGroup, {
  Condition,
  defaultGroup,
  Group,
} from "./condition-group";

// Converts a JSON Logic object to a Group/Condition tree using 'children' and 'operand'
function jsonLogicToGroup(logic: any, isRoot = true): any {
  if (!logic || typeof logic !== "object") {
    // Always return a root group with one empty condition
    return {
      id: nanoid(),
      type: "group",
      operand: "and",
      children: [
        {
          id: nanoid(),
          type: "condition",
          dataSource: null,
          topic: null,
          operator: null,
          value: null,
        },
      ],
    };
  }
  if (logic.and || logic.or) {
    const operand = logic.and ? "and" : "or";
    const arr = logic[operand];
    const children: (Group | Condition)[] = arr.map((item: any) =>
      jsonLogicToGroup(item, false)
    );
    return {
      id: nanoid(),
      type: "group",
      operand,
      children,
    };
  }
  for (const op of [">", "<", "==", "!="]) {
    if (logic[op]) {
      const [value, topicObj] = logic[op];
      const condition = {
        id: nanoid(),
        type: "condition",
        operator: op,
        value: value,
        dataSource: topicObj?.topic?.[1] || null,
        topic: topicObj?.topic?.[0] || null,
      };
      // Only wrap in a group if this is the root
      if (isRoot) {
        return {
          id: nanoid(),
          type: "group",
          operand: "and",
          children: [condition],
        };
      }
      return condition;
    }
  }
  // fallback: empty root group with one empty condition
  if (isRoot) {
    return {
      id: nanoid(),
      type: "group",
      operand: "and",
      children: [
        {
          id: nanoid(),
          type: "condition",
          dataSource: null,
          topic: null,
          operator: null,
          value: null,
        },
      ],
    };
  }
  return null;
}

type ManualSignalBuilderProps = {
  editMode?: boolean;
  initialLogic?: object | null;
  setLogic: (logic: object | null) => void;
};

// Place this outside the component to avoid infinite re-renders
const toJsonLogic = (group: Group): any => {
  const arr = group.children
    .map((c) =>
      c.type === "condition"
        ? conditionToJsonLogic(c as Condition)
        : toJsonLogic(c as Group)
    )
    .filter(Boolean);
  return { [group.operand]: arr };
};

const ManualSignalBuilder = ({
  editMode = false,
  initialLogic,
  setLogic,
}: ManualSignalBuilderProps) => {
  // The root group state (always present)
  const [rootGroup, setRootGroup] = useState<Group>(
    initialLogic ? jsonLogicToGroup(initialLogic) : defaultGroup(0)
  );

  // Recursively update a group or condition in the tree
  const updateGroup = useCallback((updated: Group) => {
    setRootGroup(updated);
  }, []);

  useEffect(() => {
    setLogic(toJsonLogic(rootGroup));
  }, [rootGroup, setLogic]);

  return (
    <SignalConditionGroup group={rootGroup} depth={0} onUpdate={updateGroup} />
  );
};

// Helper for JSON-logic conversion
function conditionToJsonLogic(cond: Condition) {
  if (!cond.operator || !cond.topic || !cond.value) return null;
  return {
    [cond.operator]: [
      isNaN(Number(cond.value)) ? cond.value : Number(cond.value),
      {
        topic: [cond.topic, cond.dataSource],
      },
    ],
  };
}

export default ManualSignalBuilder;
