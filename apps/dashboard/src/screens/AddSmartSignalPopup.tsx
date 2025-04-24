import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { atom } from "jotai";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import React from "react";
import { ConditionRenderer, deleteAtPath } from "./ConditionRenderer"; // Import the extracted components

// --- Configuration Components ---

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

// Define data types with associated components
// Define the type for a data type configuration object
interface DataType {
    id: string;
    label: string;
    component: React.FC; // Or React.ComponentType for more flexibility
}

// Define data types with associated components using the defined type
const DATA_TYPES: DataType[] = [
    { id: "price", label: "Price", component: PriceConfig },
    { id: "fear_greed", label: "Fear & Greed", component: FearGreedConfig },
    { id: "streaming_status", label: "Streaming status", component: StreamingStatusConfig },
];

// Atom to manage the dialog open state
const addSmartSignalOpenAtom = atomWithStorage("addSmartSignalOpen", false);
const dataConfigOpenAtom = atom(false);
const selectedDataTypeAtom = atom<DataType | null>(null);
const conditionAtom = atom<object | null>({
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
        {
            and: [
                { ">": [{ topic: ["ETHUSDT", "price"] }, 100000] },
                { "=": [false, { topic: ["youtube_streaming_DiscoverCrypto", "isStreaming"] }] },
                { "=": [false, { topic: ["youtube_streaming_DiscoverCrypto", "isStreaming"] }] },
            ],
        },
    ],
}); // Atom to store the condition object

interface AddSmartSignalPopupProps {
    trigger?: React.ReactNode;
}

// Action button component to eliminate repetition
interface ActionButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    onDelete?: () => void;
    canDelete?: boolean;
}

function ActionButton({ children, onClick, onDelete, canDelete = false }: ActionButtonProps) {
    return (
        <div className="flex items-center gap-1 group">
            <div
                onClick={onClick}
                className="flex items-center justify-center px-3 py-1 text-sm rounded-md border border-[#333333] bg-[#222222] hover:bg-[#2A2A2A] hover:text-white relative"
            >
                {children}
                {canDelete && (
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                            onDelete?.();
                        }}
                        className="absolute -right-2 -top-2 p-1 h-5 w-5 rounded-full bg-[#2A2A2A] text-gray-400 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Trash2 size={10} />
                    </Button>
                )}
            </div>
        </div>
    );
}

// --- DataConfig Dialog Component ---
function DataConfigDialog({ dataType }: { dataType: DataType }) {
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

export function AddSmartSignalPopup({ trigger }: AddSmartSignalPopupProps) {
    const [open, setOpen] = useAtom(addSmartSignalOpenAtom);
    const [, setDataConfigOpen] = useAtom(dataConfigOpenAtom);
    const [selectedDataType, setSelectedDataType] = useAtom(selectedDataTypeAtom);
    const [condition, setCondition] = useAtom(conditionAtom); // Now using both the getter and setter

    const handleDataItemClick = (dataType: DataType) => {
        setSelectedDataType(dataType);
        setDataConfigOpen(true);
    };

    // Function to handle deleting a part of the condition
    const handleDeleteConditionPart = (path: (string | number)[]) => {
        if (!condition) return;

        // If path is empty or contains only the root operator key, it's the root condition
        if (path.length === 0 || (path.length === 1 && typeof path[0] === "string")) {
            setCondition(null);
            return;
        }

        const updatedCondition = deleteAtPath(condition, path);
        setCondition(updatedCondition);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger && <div onClick={() => setOpen(true)}>{trigger}</div>}
            {/* Use p-0 on DialogContent and manage padding internally for flex structure */}
            <DialogContent className="h-[800px] w-[90%] max-w-[90%] sm:max-w-[90%] bg-[#1A1A1A] border-[#333333] text-white flex flex-col p-0">
                {/* Header - fixed height */}
                <DialogHeader className="p-6 pb-4 border-b border-[#333333]">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-white">Add a Smart Signal</DialogTitle>
                    </div>
                    <DialogDescription className="text-gray-400 pt-1">
                        Configure your new smart signal settings here.
                    </DialogDescription>
                </DialogHeader>

                {/* Main content - using flex column layout */}
                <div className="flex-grow p-6 flex flex-col space-y-4 overflow-hidden">
                    {/* Configuration Area - kept compact */}
                    <div className="flex-shrink-0">
                        <div className="flex flex-wrap gap-2">
                            {/* All configuration buttons using the reusable component */}
                            <ActionButton>AND</ActionButton>
                            <ActionButton>OR</ActionButton>
                            <ActionButton>&lt;</ActionButton>
                            <ActionButton>&gt;</ActionButton>
                            <ActionButton>=</ActionButton>

                            {/* Data dropdown instead of simple button */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-[#333333] bg-[#222222] hover:bg-[#2A2A2A] hover:text-white cursor-pointer flex items-center gap-1"
                                    >
                                        Data <ChevronDown size={14} />
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent className="bg-[#222222] border-[#333333] text-white">
                                    {DATA_TYPES.map((dataType) => (
                                        <DropdownMenuItem
                                            key={dataType.id}
                                            className="hover:bg-[#2A2A2A] cursor-pointer"
                                            onClick={() => handleDataItemClick(dataType)}
                                        >
                                            {dataType.label}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <ActionButton>Number</ActionButton>
                            <ActionButton>Bool</ActionButton>
                        </div>
                    </div>

                    {/* Signal Preview Area - flex-grow to fill available space */}
                    <Card className="flex-grow flex flex-col p-4 bg-[#222222] border-[#333333] min-h-0">
                        <p className="text-sm text-gray-400 mb-2 flex-shrink-0">Condition</p>
                        <div className="flex-grow overflow-y-auto p-3 rounded bg-[#2A2A2A] border border-[#3A3A3A] text-gray-300 font-mono text-sm">
                            {/* Now passing the delete handler to ConditionRenderer */}
                            <ConditionRenderer condition={condition} onDelete={handleDeleteConditionPart} />
                        </div>
                    </Card>

                    {/* JSON Preview */}
                    <div className="flex-shrink-0">
                        <p className="text-sm text-gray-400 mb-2">JSON Representation</p>
                        <textarea
                            disabled
                            value={JSON.stringify(condition, null, 2)}
                            className="w-full h-24 p-3 rounded bg-[#2A2A2A] border border-[#3A3A3A] text-gray-300 font-mono resize-none focus:outline-none focus:ring-0 text-xs"
                            aria-label="JSON representation of the condition"
                        />
                    </div>
                </div>

                {/* Footer - fixed height */}
                <div className="flex justify-end gap-2 p-4 border-t border-[#333333]">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        className="border-[#333333] bg-[#222222] text-gray-400 hover:bg-[#2A2A2A] hover:text-white"
                    >
                        Cancel
                    </Button>
                    <Button className="bg-blue-500 text-white hover:bg-blue-600">Create Signal</Button>
                </div>
            </DialogContent>

            {/* Data Config Dialog */}
            {selectedDataType && <DataConfigDialog dataType={selectedDataType} />}
        </Dialog>
    );
}

export default AddSmartSignalPopup;
