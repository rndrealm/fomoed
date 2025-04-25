import React from "react";
import { atom, useAtom } from "jotai";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Define the type for a data type configuration object
export interface DataType {
    id: string;
    label: string;
    component: React.FC;
}

// Atoms to manage data config dialogs
export const dataConfigOpenAtom = atom(false);
export const selectedDataTypeAtom = atom<DataType | null>(null);

// Price Configuration
function PriceConfig() {
    // Example symbols, replace with actual data source if needed
    const symbols = ["ETH", "BTC"];

    return (
        <div className="space-y-4 p-4">
            <div className="space-y-2">
                <Label htmlFor="symbol" className="text-gray-400">
                    Symbol
                </Label>
                <Select>
                    <SelectTrigger id="symbol" className="w-full bg-[#2A2A2A] border-[#3A3A3A] text-white">
                        <SelectValue placeholder="Select symbol" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#222222] border-[#333333] text-white">
                        {symbols.map((symbol) => (
                            <SelectItem key={symbol} value={symbol} className="hover:bg-[#2A2A2A] cursor-pointer">
                                {symbol}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {/* Add more price-specific configurations here */}
        </div>
    );
}

// Fear & Greed Configuration (Placeholder)
function FearGreedConfig() {
    return <div className="p-4 text-gray-400">Fear & Greed configuration options will be added here.</div>;
}

// Streaming Status Configuration (Placeholder)
function StreamingStatusConfig() {
    return <div className="p-4 text-gray-400">Streaming Status configuration options will be added here.</div>;
}

// Define data types with associated components using the defined type
export const DATA_TYPES: DataType[] = [
    { id: "price", label: "Price", component: PriceConfig },
    { id: "fear_greed", label: "Fear & Greed", component: FearGreedConfig },
    { id: "streaming_status", label: "Streaming status", component: StreamingStatusConfig },
];

// DataConfig Dialog Component
export function DataConfigDialog({ dataType }: { dataType: DataType }) {
    const [open, setOpen] = useAtom(dataConfigOpenAtom);

    const renderConfigComponent = () => {
        const Component = dataType.component;
        return <Component />;
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[650px] h-[600px] bg-[#1A1A1A] border-[#333333] text-white flex flex-col p-0">
                {/* Header section - fixed height */}
                <DialogHeader className="p-6 pb-4">
                    <DialogTitle className="text-white">
                        Configure <span className="px-2 py-1 bg-white/10 rounded">{dataType.label}</span> Data
                    </DialogTitle>
                    <DialogDescription className="text-gray-400 pt-1">
                        Add a data source to your smart signal.
                    </DialogDescription>
                </DialogHeader>

                {/* Scrollable content area */}
                <div className="flex-grow overflow-y-auto px-6">{renderConfigComponent()}</div>

                {/* Footer section - fixed height */}
                <div className="flex justify-end gap-2 p-4 border-t border-[#333333]">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        className="border-[#333333] bg-[#222222] text-gray-400 hover:bg-[#2A2A2A] hover:text-white"
                    >
                        Cancel
                    </Button>
                    <Button className="bg-blue-500 text-white hover:bg-blue-600">Add</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
