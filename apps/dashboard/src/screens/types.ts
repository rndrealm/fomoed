import { PriceConfig } from "./data-source-configs/PriceConfig";
import { FearGreedConfig } from "./data-source-configs/FearGreedConfig";
import { StreamingStatusConfig } from "./data-source-configs/StreamingStatusConfig";

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
