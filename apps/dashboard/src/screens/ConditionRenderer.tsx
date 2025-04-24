import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";

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

// Helper function to render individual parts of the condition
function renderConditionPart(
    part: any,
    path: (string | number)[] = [],
    onDelete?: (path: (string | number)[]) => void
): React.ReactNode {
    if (typeof part === "object" && part !== null) {
        if ("topic" in part) {
            // Render topic placeholder
            const [source, type] = part.topic;
            return (
                <ActionButton canDelete={!!onDelete} onDelete={() => onDelete && onDelete(path)}>
                    {`${source} (${type})`}
                </ActionButton>
            );
        } else {
            // Recursively render nested conditions/operators
            return <ConditionRenderer condition={part} path={path} onDelete={onDelete} />;
        }
    } else if (typeof part === "number" || typeof part === "boolean") {
        // Render primitive values
        return (
            <ActionButton canDelete={!!onDelete} onDelete={() => onDelete && onDelete(path)}>
                {String(part)}
            </ActionButton>
        );
    }
    // Handle other types or invalid parts if necessary
    return null;
}

export interface ConditionRendererProps {
    condition: object | null;
    depth?: number;
    path?: (string | number)[];
    onDelete?: (path: (string | number)[]) => void;
}

export function ConditionRenderer({ condition, path = [], onDelete }: ConditionRendererProps) {
    if (!condition || typeof condition !== "object" || Object.keys(condition).length === 0) {
        return <span className="text-gray-500 italic">Build your signal using the buttons above</span>;
    }

    // Assuming the top level is always an operator object like { "and": [...] } or { ">": [...] }
    const operator = Object.keys(condition)[0];
    const operands = (condition as any)[operator];

    if (!Array.isArray(operands)) {
        return <span className="text-red-500 italic">Invalid condition structure</span>;
    }

    const isLogicalOperator = ["and", "or"].includes(operator.toLowerCase());
    const isComparisonOperator = [">", "<", ">=", "<=", "="].includes(operator);

    if (isLogicalOperator) {
        return (
            <div className="flex flex-col">
                <div className="flex items-center gap-2 group">
                    <div className="text-white font-medium bg-[#333333] px-3 py-1 rounded-md w-fit relative flex items-center">
                        {operator.toUpperCase()}
                        <Button
                            size="sm"
                            variant="ghost"
                            className="p-0 h-5 w-5 text-gray-400 hover:text-gray-100 hover:bg-[#444444] ml-2"
                        >
                            <Plus size={14} />
                        </Button>
                        {onDelete && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onDelete(path)}
                                className="absolute -right-2 -top-2 p-1 h-5 w-5 rounded-full bg-[#2A2A2A] text-gray-400 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 size={10} />
                            </Button>
                        )}
                    </div>
                </div>
                <div className="relative flex flex-col pl-8 pt-2">
                    {/* Vertical connecting line - height set to stop at the last child */}
                    <div
                        className="absolute left-4 top-0 w-px bg-[#444444]"
                        style={{
                            height: operands.length > 0 ? "calc(100% - 1.5rem)" : "0px",
                        }}
                    ></div>

                    {operands.map((operand: any, index: number) => (
                        <div key={index} className="relative pb-3 last:pb-0">
                            {/* Horizontal connector line */}
                            <div className="absolute left-0 top-4 h-px w-4 bg-[#444444] -translate-x-4"></div>
                            <div className="pt-1">
                                {renderConditionPart(operand, [...path, operator, index], onDelete)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    } else if (isComparisonOperator) {
        return (
            <div className="flex items-center gap-2 p-2 bg-[#222222] rounded-md border border-[#444444] max-w-max group relative">
                {onDelete && (
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDelete(path)}
                        className="absolute -right-2 -top-2 p-1 h-5 w-5 rounded-full bg-[#2A2A2A] text-gray-400 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Trash2 size={10} />
                    </Button>
                )}
                {operands.map((operand: any, index: number) => (
                    <React.Fragment key={index}>
                        {/* Don't pass onDelete to the individual operands, only to the entire comparison block */}
                        {renderConditionPart(operand, [...path, operator, index])}
                        {index === 0 && <span className="text-white font-bold">{operator}</span>}
                    </React.Fragment>
                ))}
            </div>
        );
    } else {
        // Fallback rendering for unknown operators
        return (
            <div className="flex items-center gap-2">
                <span className="text-gray-400">{operator}</span>
                {operands.map((operand: any, index: number) => (
                    <React.Fragment key={index}>
                        {renderConditionPart(operand, [...path, operator, index], onDelete)}
                    </React.Fragment>
                ))}
            </div>
        );
    }
}
