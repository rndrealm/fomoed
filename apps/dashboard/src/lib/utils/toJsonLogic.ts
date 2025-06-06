// Converts a builder condition object to a JSON Logic schema
// Supports basic logical and comparison operators, and topic references

export type TopicRef = {
  topic: [string, string];
};

export type ConditionNode =
  | { and: ConditionNode[] }
  | { or: ConditionNode[] }
  | {
      ">": [
        ConditionNode | number | TopicRef,
        ConditionNode | number | TopicRef,
      ];
    }
  | {
      "<": [
        ConditionNode | number | TopicRef,
        ConditionNode | number | TopicRef,
      ];
    }
  | {
      "==": [
        ConditionNode | boolean | number | TopicRef,
        ConditionNode | boolean | number | TopicRef,
      ];
    }
  | {
      "!=": [
        ConditionNode | boolean | number | TopicRef,
        ConditionNode | boolean | number | TopicRef,
      ];
    }
  | TopicRef
  | number
  | boolean;

/**
 * Recursively converts a builder condition object to JSON Logic schema
 * @param condition The builder condition object
 * @returns JSON Logic schema object
 */
export function toJsonLogic(condition: ConditionNode): any {
  if (typeof condition === "number" || typeof condition === "boolean") {
    return condition;
  }
  if ("topic" in condition) {
    return { topic: condition.topic };
  }
  if ("and" in condition) {
    return { and: condition.and.map(toJsonLogic) };
  }
  if ("or" in condition) {
    return { or: condition.or.map(toJsonLogic) };
  }
  if (">" in condition) {
    return { ">": condition[">"].map(toJsonLogic) };
  }
  if ("<" in condition) {
    return { "<": condition["<"].map(toJsonLogic) };
  }
  if ("==" in condition) {
    return { "==": condition["=="].map(toJsonLogic) };
  }
  if ("!=" in condition) {
    return { "!=": condition["!="].map(toJsonLogic) };
  }
  return condition;
}
