import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { atom } from "jotai";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import React, { useEffect } from "react";
import { ConditionRenderer } from "./ConditionRenderer";
import { unset } from "lodash-es"; // Import unset from lodash-es
import { DataConfigDialog } from "./DataConfigDialog";

// Atom to manage the dialog open state
const addSmartSignalOpenAtom = atomWithStorage("addSmartSignalOpen", false);
const conditionAtom = atom<object>({
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
}); // Atom to store the condition object

interface AddSmartSignalPopupProps {
    trigger?: React.ReactNode;
}

export function AddSmartSignalPopup({ trigger }: AddSmartSignalPopupProps) {
    const [open, setOpen] = useAtom(addSmartSignalOpenAtom);
    const [condition, setCondition] = useAtom(conditionAtom);

    // Log condition changes
    useEffect(() => {
        console.log("Condition changed:", condition);
    }, [condition]);

    // Function to handle updating the condition (now handles both updates and deletions)
    const handleUpdateCondition = (newCondition: object) => {
        setCondition(newCondition);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                {trigger && <div onClick={() => setOpen(true)}>{trigger}</div>}
                {/* Use p-0 on DialogContent and manage padding internally for flex structure */}
                <DialogContent className="h-[800px] w-[90%] max-w-[90%] sm:max-w-[90%] bg-[#1A1A1A] border-[#333333] text-white flex flex-col p-0 px-4">
                    {/* Header - fixed height */}
                    <DialogHeader className="p-6 pb-4 border-b border-[#333333]">
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-white">Add a Smart Signal</DialogTitle>
                        </div>
                        <DialogDescription className="text-neutral-400 pt-1">
                            Configure your new smart signal here.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Signal Preview Area - flex-grow to fill available space */}
                    <Card className="flex-grow flex flex-col p-4 bg-white/5 border-[#333333] min-h-0 font-mono text-sm text-white">
                        {/* Now only passing onUpdate handler */}
                        <ConditionRenderer
                            condition={condition}
                            onUpdate={handleUpdateCondition}
                            wholeCondition={condition}
                        />
                    </Card>

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
            </Dialog>

            <DataConfigDialog />
        </>
    );
}

export default AddSmartSignalPopup;
