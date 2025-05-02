import {
  Condition,
  ConditionGroup,
  LogicalOperator,
  SimpleCondition,
} from "@/lib/types/signal.types";

// Generate a unique ID for new conditions
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

// Create a new simple condition with default values
export const createSimpleCondition = (): SimpleCondition => {
  return {
    id: generateId(),
    type: "simple",
    dataSource: "",
    operator: "",
    value: "",
  };
};

// Create a new condition group
export const createConditionGroup = (
  operator: LogicalOperator = "AND",
  conditions: Condition[] = []
): ConditionGroup => {
  return {
    id: generateId(),
    type: "group",
    operator,
    conditions: conditions.length > 0 ? conditions : [createSimpleCondition()],
  };
};

// Deep clone a condition (for immutable updates)
export const cloneCondition = (condition: Condition): Condition => {
  return JSON.parse(JSON.stringify(condition));
};

// Add a condition to a group
export const addConditionToGroup = (
  group: ConditionGroup,
  newCondition: Condition
): ConditionGroup => {
  return {
    ...group,
    conditions: [...group.conditions, newCondition],
  };
};

// Remove a condition from a group by ID
export const removeConditionFromGroup = (
  group: ConditionGroup,
  conditionId: string
): ConditionGroup => {
  return {
    ...group,
    conditions: group.conditions.filter((c) => c.id !== conditionId),
  };
};

// Update a condition in a group by ID
export const updateConditionInGroup = (
  group: ConditionGroup,
  conditionId: string,
  updatedCondition: Condition
): ConditionGroup => {
  return {
    ...group,
    conditions: group.conditions.map((c) =>
      c.id === conditionId
        ? updatedCondition
        : c.type === "group"
          ? updateConditionInGroup(
              c as ConditionGroup,
              conditionId,
              updatedCondition
            )
          : c
    ),
  };
};

// Toggle the logical operator of a condition group
export const toggleGroupOperator = (group: ConditionGroup): ConditionGroup => {
  return {
    ...group,
    operator: group.operator === "AND" ? "OR" : "AND",
  };
};

// Check if a condition is valid (has all required fields)
export const isSimpleConditionValid = (condition: SimpleCondition): boolean => {
  return Boolean(
    condition.dataSource &&
      condition.operator &&
      condition.value !== undefined &&
      condition.value !== ""
  );
};

// Check if a condition group is valid (has valid conditions)
export const isConditionGroupValid = (group: ConditionGroup): boolean => {
  if (group.conditions.length === 0) return false;

  return group.conditions.every((condition) => {
    if (condition.type === "simple") {
      return isSimpleConditionValid(condition as SimpleCondition);
    } else {
      return isConditionGroupValid(condition as ConditionGroup);
    }
  });
};
