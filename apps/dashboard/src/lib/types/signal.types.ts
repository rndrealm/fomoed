export type DataSourceType = "number" | "boolean" | "string" | "enum";

export interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  category: string;
  enumValues?: string[];
}

export type OperatorType =
  | ">"
  | "<"
  | ">="
  | "<="
  | "=="
  | "!="
  | "contains"
  | "startsWith"
  | "endsWith";

export interface Operator {
  id: string;
  symbol: OperatorType;
  name: string;
  applicableTypes: DataSourceType[];
}

export type ConditionType = "simple" | "group";
export type LogicalOperator = "AND" | "OR";

export interface SimpleCondition {
  id: string;
  type: "simple";
  dataSource: string; // ID of the data source
  operator: string; // ID of the operator
  value: string | number | boolean;
  assetPair?: string; // Optional asset pair reference
}

export interface ConditionGroup {
  id: string;
  type: "group";
  operator: LogicalOperator;
  conditions: Condition[];
  assetPair?: string; // Optional asset pair reference
}

export type Condition = SimpleCondition | ConditionGroup;

export interface SignalDefinition {
  id: string;
  name: string;
  description: string;
  rootCondition: ConditionGroup;
  notifications: {
    email: boolean;
    inApp: boolean;
  };
  createdAt: string;
  updatedAt: string;
  primaryAssetPair?: string; // Optional primary asset pair for the whole signal
}
