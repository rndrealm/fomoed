import React from "react";
import { atom, useAtom } from "jotai";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataType } from "./types";

export const selectedDataTypeAtom = atom<DataType | null>(null);

export function DataConfigDialog({
    onSet,
    isOpen,
    onOpenChange,
}: {
    onSet: (dataObject: object) => void;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [selectedDataType, setSelectedDataType] = useAtom(selectedDataTypeAtom);
    const [dataObject, setDataObject] = React.useState<object | null>(null);

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setSelectedDataType(null);
            setDataObject(null);
        }
        onOpenChange(open);
    };

    const renderConfigComponent = () => {
        if (!selectedDataType) return null;
        const Component = selectedDataType.component;
        return <Component setDataObject={setDataObject} onValidChange={() => true} />;
    };

    const handleAdd = () => {
        if (!dataObject) {
            console.error("Data object is null or undefined");
            return;
        }

        onSet(dataObject);
        setSelectedDataType(null);
        setDataObject(null);
        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[650px] h-[600px] bg-[#1A1A1A] border-[#333333] text-white flex flex-col p-0">
                <DialogHeader className="p-6 pb-4">
                    <DialogTitle className="text-white">
                        Configure <span className="px-2 py-1 bg-white/10 rounded">{selectedDataType?.label}</span> Data
                    </DialogTitle>
                    <DialogDescription className="text-gray-400 pt-1">
                        Add a data source to your smart signal.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-grow overflow-y-auto px-6">{renderConfigComponent()}</div>

                <div className="flex justify-end gap-2 p-4 border-t border-[#333333]">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setSelectedDataType(null);
                            setDataObject(null);
                            onOpenChange(false);
                        }}
                        className="border-[#333333] bg-[#222222] text-gray-400 hover:bg-[#2A2A2A] hover:text-white"
                    >
                        Cancel
                    </Button>
                    <Button
                        className="bg-blue-500 text-white hover:bg-blue-600"
                        onClick={handleAdd}
                        disabled={!dataObject}
                    >
                        Add
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
