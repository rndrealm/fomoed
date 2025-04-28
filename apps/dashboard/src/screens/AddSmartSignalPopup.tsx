import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { atom } from "jotai";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import React, { useEffect } from "react";
import { ConditionRenderer } from "./ConditionRenderer";
import { useSmartSignals } from "./hooks/use-smart-signals";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Atom to manage the dialog open state
const addSmartSignalOpenAtom = atomWithStorage("addSmartSignalOpen", false);

const conditionAtom = atom<object>({});

// Utility to check for any placeholder (null) operand in the condition
function hasPlaceholderOperand(obj: any): boolean {
    if (obj === null) return true;
    if (Array.isArray(obj)) return obj.some(hasPlaceholderOperand);
    if (typeof obj === "object" && obj !== null) {
        // Check for empty AND/OR
        if ("and" in obj && Array.isArray(obj.and) && obj.and.length === 0) return true;
        if ("or" in obj && Array.isArray(obj.or) && obj.or.length === 0) return true;
        return Object.values(obj).some(hasPlaceholderOperand);
    }
    return false;
}

interface AddSmartSignalPopupProps {
    trigger?: React.ReactNode;
}

export function AddSmartSignalPopup({ trigger }: AddSmartSignalPopupProps) {
    const [open, setOpen] = useAtom(addSmartSignalOpenAtom);
    const [condition, setCondition] = useAtom(conditionAtom);
    const { saveSmartSignal } = useSmartSignals();

    // Notification settings
    const [inAppNotification, setInAppNotification] = React.useState(true);
    const [emailNotification, setEmailNotification] = React.useState(true);

    useEffect(() => {
        console.log("Condition changed:", condition);
    }, [condition]);

    const handleUpdateCondition = (newCondition: object) => {
        setCondition(newCondition);
    };

    const handleCreateSignal = async () => {
        try {
            await saveSmartSignal(condition, { inAppNotification, emailNotification });
            setOpen(false);
        } catch (error) {
            console.error("Error creating smart signal:", error);
        }
    };

    const isCreateDisabled = Object.keys(condition).length < 1 || hasPlaceholderOperand(condition);

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                {trigger && <div onClick={() => setOpen(true)}>{trigger}</div>}

                <DialogContent className="h-[800px] w-[90%] max-w-[90%] sm:max-w-[90%] bg-[#1A1A1A] border-[#333333] text-white flex flex-col p-0 px-4">
                    <DialogHeader className="p-6 pb-4 border-b border-[#333333]">
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-white">Add a Smart Signal</DialogTitle>
                        </div>
                        <DialogDescription className="text-neutral-400 pt-1">
                            Configure your new smart signal here.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-3 flex-grow gap-x-4">
                        <Card className="flex-grow flex flex-col p-4 bg-white/5 border-[#333333] font-mono text-sm text-white overflow-scroll col-span-2">
                            <div>Condition</div>
                            <ConditionRenderer
                                condition={condition}
                                onUpdate={handleUpdateCondition}
                                wholeCondition={condition}
                            />
                        </Card>

                        <Card className="flex-grow flex flex-col p-4 bg-white/5 border-[#333333] font-mono text-sm text-white overflow-scroll">
                            <div className="mb-4">Notification settings</div>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center space-x-2">
                                    <Label htmlFor="in-app-notification" className="flex-grow">
                                        In-app notification
                                    </Label>
                                    <Switch
                                        id="in-app-notification"
                                        checked={inAppNotification}
                                        onCheckedChange={setInAppNotification}
                                        disabled={true}
                                    />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Label htmlFor="email-notification" className="flex-grow">
                                        Email notification
                                    </Label>
                                    <Switch
                                        id="email-notification"
                                        checked={emailNotification}
                                        onCheckedChange={setEmailNotification}
                                    />
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="flex justify-end gap-2 p-4 border-t border-[#333333]">
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="border-[#333333] bg-[#222222] text-gray-400 hover:bg-[#2A2A2A] hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-blue-500 text-white hover:bg-blue-600"
                            onClick={handleCreateSignal}
                            disabled={isCreateDisabled}
                        >
                            Create Signal
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default AddSmartSignalPopup;
