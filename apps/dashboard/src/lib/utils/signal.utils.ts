import { Condition, Group } from "@/components/signals/condition-group";
import { nanoid } from "nanoid";

export function extractTopicsFromJsonLogic(logic: any): string[] {
  const topics: string[] = [];

  function traverse(node: any) {
    if (!node || typeof node !== "object") return;
    // Check for topic object
    if (
      node.topic &&
      Array.isArray(node.topic) &&
      typeof node.topic[0] === "string"
    ) {
      topics.push(node.topic[0]);
    }
    // Traverse arrays
    if (Array.isArray(node)) {
      node.forEach(traverse);
    } else {
      // Traverse object values
      Object.values(node).forEach(traverse);
    }
  }

  traverse(logic);
  return topics;
}

// Converts a JSON Logic object to a Group/Condition tree using 'children' and 'operand'
export const jsonLogicToGroup = (logic: any, isRoot = true): any => {
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
};

export const toJsonLogic = (group: Group): any => {
  const arr = group.children
    .map((c) =>
      c.type === "condition"
        ? conditionToJsonLogic(c as Condition)
        : toJsonLogic(c as Group)
    )
    .filter(Boolean);
  return { [group.operand]: arr };
};

// Helper for JSON-logic conversion
export const conditionToJsonLogic = (cond: Condition) => {
  if (!cond.operator || !cond.topic || !cond.value) return null;
  return {
    [cond.operator]: [
      isNaN(Number(cond.value)) ? cond.value : Number(cond.value),
      {
        topic: [cond.topic, cond.dataSource],
      },
    ],
  };
};
