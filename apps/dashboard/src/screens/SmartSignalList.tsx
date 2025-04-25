import { TrendingUp, Trash } from "lucide-react";
import { transcribeCondition } from "./types";
import { useSmartSignals } from "./hooks/use-smart-signals";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { useAtom } from "jotai";
import { smartSignalsAtom } from "./hooks/use-smart-signals";

interface SmartSignalItemProps {
    title: string;
    description: string;
    createdAt: string;
    onDelete?: () => void;
    firedAt: string | null;
}

const SmartSignalItem = ({ title, description, createdAt, onDelete, firedAt }: SmartSignalItemProps) => (
    <div className="group flex items-start p-4 rounded-md border border-[#333333] mb-3 bg-[#222222] hover:bg-[#2A2A2A] transition-colors relative">
        <div className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center mr-3">
            <TrendingUp size={16} />
        </div>
        <div className="flex-1">
            <h3 className="font-medium text-white">{title}</h3>
            <p className="text-gray-400 text-sm mt-1">{description}</p>
            <span className="text-xs text-gray-500 mt-2 block">Created: {createdAt}</span>
            <span className={`text-xs mt-1 block ${firedAt ? "text-green-400" : "text-yellow-400"}`}>
                {firedAt ? `Fired at: ${firedAt}` : "Not fired yet"}
            </span>
        </div>
        {onDelete && (
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10"
                onClick={onDelete}
                aria-label="Delete smart signal"
            >
                <Trash className="text-red-500" />
            </Button>
        )}
    </div>
);

export default function SmartSignalList() {
    const [smartSignals] = useAtom(smartSignalsAtom);
    const { deleteSmartSignal } = useSmartSignals();
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const handleDelete = async (id: number) => {
        setDeletingId(id);
        await deleteSmartSignal(id);
        setDeletingId(null);
    };

    return (
        <>
            {smartSignals.map((signal) => (
                <SmartSignalItem
                    key={signal.id}
                    title={"Placeholder Title"}
                    description={transcribeCondition(JSON.parse(signal.condition))}
                    createdAt={signal.created_at}
                    firedAt={signal.fired_at}
                    onDelete={() => handleDelete(signal.id as number)}
                />
            ))}
        </>
    );
}
