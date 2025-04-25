import { PriceConfig } from "./data-source-configs/PriceConfig";
import { FearGreedConfig } from "./data-source-configs/FearGreedConfig";
import { StreamingStatusConfig } from "./data-source-configs/StreamingStatusConfig";

// We are using JSON logic. Example JSON structure:
/**
 * {
    or: [
        {
            and: [
                { ">": [{ topic: ["ETHUSDT", "price"] }, 100000] },
                { "=": [false, { topic: ["youtube_streaming_DiscoverCrypto", "isStreaming"] }] },
                { "=": [false, { topic: ["youtube_streaming_DiscoverCrypto", "isStreaming"] }] },
            ],
        },
        {
            and: [
                { ">": [{ topic: ["ETHUSDT", "price"] }, 100000] },
                { "=": [false, { topic: ["youtube_streaming_DiscoverCrypto", "isStreaming"] }] },
                { "=": [false, { topic: ["youtube_streaming_DiscoverCrypto", "isStreaming"] }] },
            ],
        },
    ],
}
*/

export interface DataConfigComponentProps {
    setDataObject: (data: object) => void;
    onValidChange: () => boolean;
}

export interface DataType {
    id: string;
    label: string;
    component: React.FC<DataConfigComponentProps>;
}

export const DATA_TYPES: DataType[] = [
    { id: "price", label: "Price", component: PriceConfig },
    { id: "fear_greed", label: "Fear & Greed", component: FearGreedConfig },
    { id: "streaming_status", label: "Streaming status", component: StreamingStatusConfig },
];

export interface DataStream {
    topic: [string, string]; // [topicName, field]
}

export type OperandValue = DataStream | number | boolean | ConditionObject;

export interface LogicalCondition {
    and?: OperandValue[];
    or?: OperandValue[];
}

export interface ComparisonCondition {
    ">": [OperandValue, OperandValue];
    "<": [OperandValue, OperandValue];
    ">=": [OperandValue, OperandValue];
    "<=": [OperandValue, OperandValue];
    "=": [OperandValue, OperandValue];
}

export type ConditionObject = LogicalCondition | ComparisonCondition;

/**
 * Transcribes a ConditionObject into a human-readable string.
 * @param condition The condition object to transcribe.
 * @returns Human-readable string representation.
 */
export function transcribeCondition(condition: ConditionObject): string {
    function operandToString(operand: OperandValue): string {
        if (typeof operand === "number" || typeof operand === "boolean") {
            return operand.toString();
        }
        if (Array.isArray((operand as DataStream).topic)) {
            const ds = operand as DataStream;
            return `${ds.topic[0]} ${ds.topic[1]}`;
        }
        if (typeof operand === "object") {
            return transcribeCondition(operand as ConditionObject);
        }
        return String(operand);
    }

    if ("and" in condition && Array.isArray(condition.and)) {
        return `(${condition.and.map(operandToString).join(" AND ")})`;
    }
    if ("or" in condition && Array.isArray(condition.or)) {
        return `(${condition.or.map(operandToString).join(" OR ")})`;
    }
    for (const op of [">", "<", ">=", "<=", "="] as const) {
        if (op in condition) {
            const [left, right] = (condition as any)[op] as [OperandValue, OperandValue];
            return `(${operandToString(left)} ${op} ${operandToString(right)})`;
        }
    }
    return "Unknown condition";
}
