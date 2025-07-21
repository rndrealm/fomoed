import { Condition, Group } from "@/components/signals/condition-group";
import {
  DataSource,
  signalDataSources,
} from "@/constant/signals/data-source-config";
import { nanoid } from "nanoid";

const dataSourceIdTopicSeparator = "-";

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
          dataSourceId: null,
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
      jsonLogicToGroup(item, false),
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
      const [it1, it2] = logic[op];

      let value: string | number | boolean | null = null;
      let topicObj: { topic: string } | null = null;

      if (typeof it1 === "object") {
        topicObj = it1;
        value = it2;
      } else if (typeof it2 === "object") {
        topicObj = it2;
        value = it1;
      }

      const [dataSourceId, topic] = topicObj?.topic?.split(
        dataSourceIdTopicSeparator,
      ) || [null, null];

      const condition = {
        id: nanoid(),
        type: "condition",
        operator: op,
        value: value,
        dataSourceId,
        topic,
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
        : toJsonLogic(c as Group),
    )
    .filter(Boolean);
  return { [group.operand]: arr };
};

// Helper for JSON-logic conversion
export const conditionToJsonLogic = (cond: Condition) => {
  if (
    !cond.operator ||
    !cond.topic ||
    cond.value === null ||
    cond.value === undefined
  )
    return null;

  return {
    [cond.operator]: [
      {
        topic: cond.dataSourceId + dataSourceIdTopicSeparator + cond.topic,
      },
      isNaN(Number(cond.value)) ? cond.value : Number(cond.value),
    ],
  };
};

/**
 * Get a data source object by its ID
 * @param id The ID of the data source to find
 * @returns The data source object if found, undefined otherwise
 */
export const getDataSourceById = (id: string): DataSource | undefined => {
  for (const group of signalDataSources) {
    const dataSource = group.dataSources.find((source) => source.id === id);
    if (dataSource) {
      return dataSource;
    }
  }
  return undefined;
};

function isConditionValid(condition: Condition): boolean {
  return (
    !!condition.dataSourceId &&
    !!condition.topic &&
    !!condition.operator &&
    !!condition.value
  );
}

export function isConditionGroupValid(group: Group): boolean {
  if (group.children.length === 0) return false;

  // Check if all children are valid conditions or groups
  for (const child of group.children) {
    if (child.type === "condition") {
      if (!isConditionValid(child as Condition)) return false;
    } else if (child.type === "group") {
      if (!isConditionGroupValid(child as Group)) return false;
    } else {
      return false; // Invalid type
    }
  }

  return true;
}
