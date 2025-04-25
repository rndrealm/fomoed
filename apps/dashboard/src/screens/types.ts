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
