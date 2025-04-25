import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, ChevronRight, ChevronDown } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { atom, useAtom } from "jotai";

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

// --- Data Types and Configuration Components ---

// Define the type for a data type configuration object
interface DataType {
    id: string;
    label: string;
    component: React.FC;
}

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
const DATA_TYPES: DataType[] = [
    { id: "price", label: "Price", component: PriceConfig },
    { id: "fear_greed", label: "Fear & Greed", component: FearGreedConfig },
    { id: "streaming_status", label: "Streaming status", component: StreamingStatusConfig },
];

// Atoms to manage data config dialogs
const dataConfigOpenAtom = atom(false);
const selectedDataTypeAtom = atom<DataType | null>(null);

// Atoms to manage number input dialog
const numberInputDialogOpenAtom = atom(false);
const numberInputValueAtom = atom("");
const numberInputPathAtom = atom<(string | number)[] | null>(null);

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

// Number Input Dialog Component
function NumberInputDialog({
    wholeCondition,
    onUpdate,
    editPath,
}: {
    wholeCondition: any;
    onUpdate?: (newCondition: object) => void;
    editPath?: (string | number)[];
}) {
    const [open, setOpen] = useAtom(numberInputDialogOpenAtom);
    const [inputValue, setInputValue] = useAtom(numberInputValueAtom);
    const [path, setPath] = useAtom(numberInputPathAtom);

    // Use the path provided in props if available, otherwise use the one from atom state
    const effectivePath = editPath || path;

    const handleSave = () => {
        // Ensure path, onUpdate, and currentCondition are valid before proceeding
        if (effectivePath && onUpdate && wholeCondition) {
            const numValue = parseFloat(inputValue);

            // Check if the parsed value is a valid number
            if (!isNaN(numValue)) {
                // Use the existing updateAtPath helper function to safely update the condition
                const updatedCondition = updateAtPath(wholeCondition, effectivePath, numValue);

                // Pass the fully updated condition object back to the parent
                onUpdate(updatedCondition);
            } else {
                // Handle cases where input is not a valid number, e.g., show an error
                console.error("Invalid number input:", inputValue);
            }
        } else {
            console.error("Cannot save number: Missing path, onUpdate handler, or current condition.", {
                effectivePath,
                onUpdate,
                wholeCondition,
            });
        }

        // Reset state and close the dialog regardless of success or failure
        setOpen(false);
        setInputValue("");
        setPath(null);
    };

    const handleCancel = () => {
        setOpen(false);
        setInputValue("");
        setPath(null);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[400px] bg-[#1A1A1A] border-[#333333] text-white p-6">
                <DialogHeader>
                    <DialogTitle className="text-white">Enter a number</DialogTitle>
                    <DialogDescription className="text-gray-400 pt-1">
                        Please enter a numeric value for this operand.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <Label htmlFor="number-input" className="text-gray-400 mb-2 block">
                        Number value
                    </Label>
                    <Input
                        id="number-input"
                        type="number"
                        step="any"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="bg-[#2A2A2A] border-[#3A3A3A] text-white"
                        placeholder="Enter a number"
                        autoFocus
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        className="border-[#333333] bg-[#222222] text-gray-400 hover:bg-[#2A2A2A] hover:text-white"
                    >
                        Cancel
                    </Button>
                    <Button
                        className="bg-blue-500 text-white hover:bg-blue-600"
                        onClick={handleSave}
                        disabled={inputValue === "" || isNaN(parseFloat(inputValue))}
                    >
                        Save
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Value Dropdown Component
export function ValueDropdown() {
    const [, setDataConfigOpen] = useAtom(dataConfigOpenAtom);
    const [selectedDataType, setSelectedDataType] = useAtom(selectedDataTypeAtom);

    const handleDataItemClick = (dataType: DataType) => {
        setSelectedDataType(dataType);
        setDataConfigOpen(true);
    };

    return (
        <>
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

            {/* Render the dialog conditionally */}
            {selectedDataType && <DataConfigDialog dataType={selectedDataType} />}
        </>
    );
}

// Delete button component to eliminate repetition
interface DeleteButtonProps {
    onDelete: () => void;
    className?: string;
}

function DeleteButton({ onDelete, className }: DeleteButtonProps) {
    return (
        <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            className={`absolute -right-2 -top-2 p-1 h-5 w-5 rounded-full bg-[#2A2A2A] text-gray-400 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity ${className || ""}`}
        >
            <Trash2 size={10} />
        </Button>
    );
}

// Action button component to eliminate repetition
interface ActionButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    onDelete?: () => void;
    canDelete?: boolean;
    path?: (string | number)[];
}

function OperandButton({ children, onClick, onDelete, canDelete = false, path }: ActionButtonProps) {
    const [, setDataConfigOpen] = useAtom(dataConfigOpenAtom);
    const [, setSelectedDataType] = useAtom(selectedDataTypeAtom);
    const [, setNumberInputDialogOpen] = useAtom(numberInputDialogOpenAtom);
    const [, setNumberInputValue] = useAtom(numberInputValueAtom);
    const [, setNumberInputPath] = useAtom(numberInputPathAtom);

    const handleDataItemClick = (dataType: DataType) => {
        setSelectedDataType(dataType);
        setDataConfigOpen(true);
    };

    const handleNumberClick = () => {
        if (path) {
            // If the child is already a number, pre-fill the input with its value
            if (typeof children === "string" && !isNaN(parseFloat(children))) {
                setNumberInputValue(children);
            } else {
                setNumberInputValue("");
            }

            setNumberInputPath(path);
            setNumberInputDialogOpen(true);
        }
    };

    return (
        <div className="flex items-center gap-1 group">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div
                        onClick={onClick}
                        className="flex items-center justify-center px-3 py-1 text-sm rounded-md border border-[#333333] bg-[#222222] hover:bg-[#2A2A2A] hover:text-white relative cursor-pointer"
                    >
                        {children}
                        {canDelete && onDelete && <DeleteButton onDelete={() => onDelete?.()} />}
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#222222] border-[#333333] text-white">
                    {/* Direct options */}
                    <DropdownMenuItem className="hover:bg-[#2A2A2A] cursor-pointer" onClick={handleNumberClick}>
                        Number
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-[#2A2A2A] cursor-pointer">Boolean</DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-[#444444]" />

                    {/* Data source submenu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center justify-between w-full px-2 py-1.5 text-sm hover:bg-[#2A2A2A] cursor-pointer rounded-sm">
                            <span>Data source</span>
                            <ChevronRight size={14} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="right" className="bg-[#222222] border-[#333333] text-white">
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
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

// Helper function to delete a value at a specific path in an object
export function deleteAtPath(obj: any, path: (string | number)[]): any {
    if (!obj || path.length === 0) return obj;

    // Create a deep copy to avoid direct mutation
    const result = JSON.parse(JSON.stringify(obj));

    if (path.length === 1) {
        // For arrays, we need special handling
        if (Array.isArray(result)) {
            result.splice(path[0] as number, 1);
        } else {
            delete result[path[0]];
        }
        return result;
    }

    let current = result;
    const pathToParent = path.slice(0, path.length - 1);
    const lastKey = path[path.length - 1];

    // Navigate to the parent of the item to delete
    for (const key of pathToParent) {
        current = current[key];
        if (current === undefined) return result; // Path doesn't exist
    }

    // Delete the item
    if (Array.isArray(current)) {
        current.splice(lastKey as number, 1);
    } else {
        delete current[lastKey];
    }

    return result;
}

// Helper function to update a value at a specific path in an object
export function updateAtPath(wholeCondition: any, path: (string | number)[], value: any): any {
    console.log("Updating path:", path, "with value:", value);
    console.log("Whole condition:", wholeCondition);

    if (!wholeCondition || path.length === 0) return wholeCondition;

    // Create a deep copy to avoid direct mutation
    const result = JSON.parse(JSON.stringify(wholeCondition));

    let current = result;
    const pathToParent = path.slice(0, path.length - 1);
    const lastKey = path[path.length - 1];

    // Navigate to the parent of the item to update
    for (const key of pathToParent) {
        // If a step in the path doesn't exist, return the original object
        // This prevents errors if the path is somehow invalid during an update
        if (current[key] === undefined) {
            console.error("Invalid path during update:", path, "at key:", key, ", current:", current);
            return wholeCondition; // Return original object if path is broken
        }
        current = current[key];
    }

    // Update the item at the final key
    // Check if the parent is an array and the key is a valid index
    if (Array.isArray(current) && typeof lastKey === "number" && lastKey >= 0 && lastKey < current.length) {
        current[lastKey] = value; // Replace the value at the index
    } else if (Array.isArray(current) && typeof lastKey === "number" && lastKey === current.length) {
        current.push(value); // Append the value to the array
    } else if (typeof current === "object" && current !== null && !Array.isArray(current)) {
        // Check if the parent is an object (and not an array or null)
        current[lastKey] = value; // Set or update the property
    } else {
        // Log an error if the target structure is not as expected (e.g., trying to set a numeric key on an object)
        console.error("Cannot update path:", path, "Target structure invalid at final step.");
        return wholeCondition; // Return original object on error
    }

    return result;
}

// OperatorDropdownContent component to eliminate duplication
interface OperatorDropdownContentProps {
    onSelect: (operatorType: string) => void;
}

function OperatorDropdownContent({ onSelect }: OperatorDropdownContentProps) {
    return (
        <DropdownMenuContent className="w-48 bg-[#222222] border-[#444444]">
            <DropdownMenuLabel className="text-xs text-gray-400">Logical Operators</DropdownMenuLabel>
            <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => onSelect("and")} className="cursor-pointer hover:bg-[#333333]">
                    <span className="text-white">AND</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSelect("or")} className="cursor-pointer hover:bg-[#333333]">
                    <span className="text-white">OR</span>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-[#444444]" />
            <DropdownMenuLabel className="text-xs text-gray-400">Relational Operators</DropdownMenuLabel>
            <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => onSelect(">")} className="cursor-pointer hover:bg-[#333333]">
                    <span className="text-white">Greater Than (&gt;)</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSelect("<")} className="cursor-pointer hover:bg-[#333333]">
                    <span className="text-white">Less Than (&lt;)</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSelect(">=")} className="cursor-pointer hover:bg-[#333333]">
                    <span className="text-white">Greater Than or Equal (≥)</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSelect("<=")} className="cursor-pointer hover:bg-[#333333]">
                    <span className="text-white">Less Than or Equal (≤)</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSelect("=")} className="cursor-pointer hover:bg-[#333333]">
                    <span className="text-white">Equal (=)</span>
                </DropdownMenuItem>
            </DropdownMenuGroup>
        </DropdownMenuContent>
    );
}

// Helper function to render individual parts of the condition
function renderConditionPart({
    part,
    path = [],
    onDelete,
    onUpdate,
    wholeCondition,
}: {
    part: any;
    path?: (string | number)[];
    onDelete?: (path: (string | number)[]) => void;
    onUpdate?: (newCondition: object) => void;
    wholeCondition: object;
}): React.ReactNode {
    if (typeof part === "object" && part !== null) {
        if ("topic" in part) {
            // Render topic placeholder
            const [source, type] = part.topic;
            return (
                <OperandButton canDelete={!!onDelete} onDelete={() => onDelete && onDelete(path)} path={path}>
                    {`${source} (${type})`}
                </OperandButton>
            );
        } else {
            // Recursively render nested conditions/operators
            return (
                <ConditionRenderer
                    condition={part}
                    wholeCondition={wholeCondition}
                    path={path}
                    onDelete={onDelete}
                    onUpdate={onUpdate}
                />
            );
        }
    } else if (typeof part === "number" || typeof part === "boolean") {
        // Render primitive values with path for editing
        return (
            <OperandButton canDelete={!!onDelete} onDelete={() => onDelete && onDelete(path)} path={path}>
                {String(part)}
            </OperandButton>
        );
    }
    // Handle other types or invalid parts if necessary
    return null;
}

export interface ConditionRendererProps {
    condition: object | null;
    wholeCondition: object;
    depth?: number;
    path?: (string | number)[];
    onDelete?: (path: (string | number)[]) => void;
    onUpdate?: (newCondition: object) => void;
}

// Component to render empty condition state
function EmptyCondition({ onUpdate }: { onUpdate?: (newCondition: object) => void }) {
    const handleSelect = (operatorType: string) => {
        if (!onUpdate) return;

        if (operatorType === "and" || operatorType === "or") {
            onUpdate({ [operatorType]: [] });
        } else {
            onUpdate({ [operatorType]: [{ topic: ["placeholder", "value"] }, 0] });
        }
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-gray-500 italic">Build your signal using the buttons above</span>
            {onUpdate && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            size="sm"
                            variant="outline"
                            className="p-1 h-7 w-7 rounded-full bg-[#2A2A2A] text-gray-400 hover:text-gray-100 hover:bg-[#444444]"
                        >
                            <Plus size={14} />
                        </Button>
                    </DropdownMenuTrigger>
                    <OperatorDropdownContent onSelect={handleSelect} />
                </DropdownMenu>
            )}
        </div>
    );
}

// Component to render logical operators (AND, OR)
function LogicalOperatorRenderer({
    operator,
    operands,
    path,
    onDelete,
    onUpdate,
    wholeCondition,
}: {
    operator: string;
    operands: any[];
    path: (string | number)[];
    onDelete?: (path: (string | number)[]) => void;
    onUpdate?: (newCondition: object) => void;
    wholeCondition: object;
}) {
    const handleAddCondition = (operatorType: string) => {
        if (!onUpdate) return;

        let newItem;
        if (operatorType === "and" || operatorType === "or") {
            newItem = { [operatorType]: [] };
        } else {
            newItem = { [operatorType]: [{ topic: ["placeholder", "value"] }, 0] };
        }

        const newPath = [...path, operator, operands.length];
        const updatedCondition = updateAtPath({ [operator]: operands }, newPath, newItem);
        onUpdate(updatedCondition);
    };

    return (
        <div className="flex flex-col">
            <div className="flex items-center gap-2 group">
                <div className="text-white font-medium bg-[#333333] px-3 py-1 rounded-md w-fit relative flex items-center">
                    {operator.toUpperCase()}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="p-0 h-5 w-5 text-gray-400 hover:text-gray-100 hover:bg-[#444444] ml-2"
                            >
                                <Plus size={14} />
                            </Button>
                        </DropdownMenuTrigger>
                        <OperatorDropdownContent onSelect={handleAddCondition} />
                    </DropdownMenu>

                    {onDelete && <DeleteButton onDelete={() => onDelete(path)} />}
                </div>
            </div>
            <div className="relative flex flex-col pl-8 pt-2">
                <div
                    className="absolute left-4 top-0 w-px bg-[#444444]"
                    style={{
                        height: operands.length > 0 ? "calc(100% - 1.5rem)" : "0px",
                    }}
                ></div>

                {operands.map((operand: any, index: number) => (
                    <div key={index} className="relative pb-3 last:pb-0">
                        <div className="absolute left-0 top-4 h-px w-4 bg-[#444444] -translate-x-4"></div>
                        <div className="pt-1">
                            {renderConditionPart({
                                part: operand,
                                path: [...path, operator, index],
                                onDelete,
                                onUpdate,
                                wholeCondition,
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Component to render comparison operators (>, <, >=, <=, =)
function ComparisonOperatorRenderer({
    operator,
    operands,
    path,
    onDelete,
    onUpdate,
    wholeCondition,
}: {
    operator: string;
    operands: any[];
    path: (string | number)[];
    onDelete?: (path: (string | number)[]) => void;
    onUpdate?: (newCondition: object) => void;
    wholeCondition: object;
}) {
    return (
        <div className="flex items-center gap-2 p-2 bg-[#222222] rounded-md border border-[#444444] max-w-max group relative">
            {onDelete && <DeleteButton onDelete={() => onDelete(path)} />}
            {operands.map((operand: any, index: number) => (
                <React.Fragment key={index}>
                    {renderConditionPart({
                        part: operand,
                        path: [...path, operator, index],
                        onDelete: undefined,
                        onUpdate,
                        wholeCondition,
                    })}
                    {index === 0 && <span className="text-white font-bold">{operator}</span>}
                </React.Fragment>
            ))}
        </div>
    );
}

export function ConditionRenderer({
    condition,
    wholeCondition,
    path = [],
    onDelete,
    onUpdate,
}: ConditionRendererProps) {
    // Get the current edit path from atom state
    const [numberInputPath] = useAtom(numberInputPathAtom);

    if (!condition || typeof condition !== "object" || Object.keys(condition).length === 0) {
        return <EmptyCondition onUpdate={onUpdate} />;
    }

    // Assuming the top level is always an operator object like { "and": [...] } or { ">": [...] }
    const operator = Object.keys(condition)[0];
    const operands = (condition as any)[operator];

    if (!Array.isArray(operands)) {
        return <span className="text-red-500 italic">Invalid condition structure</span>;
    }

    const isLogicalOperator = ["and", "or"].includes(operator.toLowerCase());
    const isComparisonOperator = [">", "<", ">=", "<=", "="].includes(operator);

    // Add the NumberInputDialog at the top level, passing the current edit path
    return (
        <>
            <NumberInputDialog wholeCondition={wholeCondition} onUpdate={onUpdate} editPath={numberInputPath} />

            {isLogicalOperator ? (
                <LogicalOperatorRenderer
                    operator={operator}
                    operands={operands}
                    path={path}
                    onDelete={onDelete}
                    onUpdate={onUpdate}
                    wholeCondition={wholeCondition}
                />
            ) : isComparisonOperator ? (
                <ComparisonOperatorRenderer
                    operator={operator}
                    operands={operands}
                    path={path}
                    onDelete={onDelete}
                    onUpdate={onUpdate}
                    wholeCondition={wholeCondition}
                />
            ) : (
                // Just render the operator name if we don't have a specific renderer for it
                <span className="text-red-500 italic">Unsupported operator: {operator}</span>
            )}
        </>
    );
}
