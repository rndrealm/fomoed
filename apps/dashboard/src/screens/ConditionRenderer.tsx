import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, ChevronRight, ChevronDown } from "lucide-react";
import { update, unset } from "lodash-es";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { atom, useAtom } from "jotai";
import { DataConfigDialog, DataType, DATA_TYPES, dataConfigOpenAtom, selectedDataTypeAtom } from "./DataConfigDialog";

// Define types for your condition structure
interface Topic {
    topic: [string, string]; // [source, type]
}

type OperandValue = Topic | number | boolean | ConditionObject;

interface LogicalCondition {
    and?: OperandValue[];
    or?: OperandValue[];
}

interface ComparisonCondition {
    ">": [OperandValue, OperandValue];
    "<": [OperandValue, OperandValue];
    ">=": [OperandValue, OperandValue];
    "<=": [OperandValue, OperandValue];
    "=": [OperandValue, OperandValue];
}

type ConditionObject = LogicalCondition | ComparisonCondition;

// Atoms to manage number input dialog
const numberInputDialogOpenAtom = atom(false);
const numberInputValueAtom = atom("");
const numberInputPathAtom = atom<(string | number)[] | null>(null);

// Function to update condition
function updateCondition(condition: object, path: (string | number)[], value: any): object {
    const updatedCondition = JSON.parse(JSON.stringify(condition)); // Create a deep copy
    update(updatedCondition, path, () => value);
    return updatedCondition;
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
                // Use the updateCondition function to safely update the condition
                const updatedCondition = updateCondition(wholeCondition, effectivePath, numValue);

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
    path: (string | number)[];
    wholeCondition: any;
    onUpdate?: (newCondition: object) => void;
    className?: string;
}

function DeleteButton({ path, wholeCondition, onUpdate, className }: DeleteButtonProps) {
    const handleDelete = () => {
        if (!path || !onUpdate || !wholeCondition) return;

        // Create a deep copy of the condition to avoid mutating the original
        const updatedCondition = JSON.parse(JSON.stringify(wholeCondition));

        // Use lodash unset to remove the property at the given path
        unset(updatedCondition, path);

        // Call onUpdate with the modified condition
        onUpdate(updatedCondition);
    };

    return (
        <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            className={`absolute -right-2 -top-2 p-1 h-5 w-5 rounded-full bg-[#2A2A2A] text-gray-400 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity ${className || ""}`}
        >
            <Trash2 size={10} />
        </Button>
    );
}

interface ActionButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    path?: (string | number)[];
    wholeCondition?: object;
    onUpdate?: (newCondition: object) => void;
}

function OperandButton({ children, onClick, path, wholeCondition, onUpdate }: ActionButtonProps) {
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

// OperatorDropdownContent component to eliminate duplication
interface OperatorDropdownContentProps {
    onSelect: (operatorType: string) => void;
}

const OperatorDropdownContent = React.memo(function OperatorDropdownContent({
    onSelect,
}: OperatorDropdownContentProps) {
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
});

// Helper function to render individual parts of the condition
function ConditionPart({
    part,
    path = [],
    onUpdate,
    wholeCondition,
}: {
    part: OperandValue;
    path?: (string | number)[];
    onUpdate?: (newCondition: object) => void;
    wholeCondition: object;
}) {
    if (typeof part === "object" && part !== null) {
        if ("topic" in part) {
            const [source, type] = part.topic;
            return (
                <OperandButton path={path} wholeCondition={wholeCondition} onUpdate={onUpdate}>
                    {`${source} (${type})`}
                </OperandButton>
            );
        } else {
            return (
                <ConditionRenderer condition={part} wholeCondition={wholeCondition} path={path} onUpdate={onUpdate} />
            );
        }
    } else if (typeof part === "number" || typeof part === "boolean") {
        return (
            <OperandButton path={path} wholeCondition={wholeCondition} onUpdate={onUpdate}>
                {String(part)}
            </OperandButton>
        );
    }
    return null;
}

export interface ConditionRendererProps {
    condition: object | null;
    wholeCondition: object;
    depth?: number;
    path?: (string | number)[];
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
    onUpdate,
    wholeCondition,
}: {
    operator: string;
    operands: any[];
    path: (string | number)[];
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

        // Use lodash update instead of custom updateAtPath
        const updatedCondition = JSON.parse(JSON.stringify({ [operator]: operands }));
        update(updatedCondition, newPath, () => newItem);

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

                    {onUpdate && <DeleteButton path={path} wholeCondition={wholeCondition} onUpdate={onUpdate} />}
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
                            <ConditionPart
                                part={operand}
                                path={[...path, operator, index]}
                                onUpdate={onUpdate}
                                wholeCondition={wholeCondition}
                            />
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
    onUpdate,
    wholeCondition,
}: {
    operator: string;
    operands: any[];
    path: (string | number)[];
    onUpdate?: (newCondition: object) => void;
    wholeCondition: object;
}) {
    return (
        <div className="flex items-center gap-2 p-2 bg-[#222222] rounded-md border border-[#444444] max-w-max group relative">
            {onUpdate && <DeleteButton path={path} wholeCondition={wholeCondition} onUpdate={onUpdate} />}
            {operands.map((operand: any, index: number) => (
                <React.Fragment key={index}>
                    <ConditionPart
                        part={operand}
                        path={[...path, operator, index]}
                        onUpdate={onUpdate}
                        wholeCondition={wholeCondition}
                    />
                    {index === 0 && <span className="text-white font-bold">{operator}</span>}
                </React.Fragment>
            ))}
        </div>
    );
}

export function ConditionRenderer({ condition, wholeCondition, path = [], onUpdate }: ConditionRendererProps) {
    // Get the current edit path from atom state
    const [numberInputPath] = useAtom(numberInputPathAtom);

    // Use an empty object if condition is null
    const safeCondition = condition || {};

    if (typeof safeCondition !== "object" || Object.keys(safeCondition).length === 0) {
        return <EmptyCondition onUpdate={onUpdate} />;
    }

    // Assuming the top level is always an operator object like { "and": [...] } or { ">": [...] }
    const operator = Object.keys(safeCondition)[0];
    const operands = safeCondition[operator];

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
                    onUpdate={onUpdate}
                    wholeCondition={wholeCondition}
                />
            ) : isComparisonOperator ? (
                <ComparisonOperatorRenderer
                    operator={operator}
                    operands={operands}
                    path={path}
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
