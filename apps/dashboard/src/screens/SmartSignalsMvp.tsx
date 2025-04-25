import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Plus, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddSmartSignalPopup from "./AddSmartSignalPopup";
import NotificationList from "./NotificationList";
import SmartSignalList from "./SmartSignalList";

export default function SmartSignalsMvp() {
    return (
        <Card className="w-full h-full bg-[#1A1A1A] border-[#333333]">
            <CardHeader>
                <CardTitle className="text-xl text-white">Smart Signals Dashboard</CardTitle>
                <CardDescription className="text-gray-400">View your signals and notifications</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-6">
                    {/* Smart Signals Section */}
                    <div className="flex flex-col">
                        <h2 className="text-lg font-semibold mb-4 flex items-center text-white">
                            <TrendingUp size={18} className="mr-2 text-blue-500" />
                            Smart Signals
                        </h2>

                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            <SmartSignalList />
                        </div>

                        <div className="flex justify-end">
                            <AddSmartSignalPopup
                                trigger={
                                    <Button
                                        variant="outline"
                                        className="border-dashed border-[#333333] bg-[#222222] text-blue-500 hover:text-blue-300 hover:bg-[#2A2A2A] max-w-max"
                                    >
                                        <Plus size={16} />
                                        Add Smart Signal
                                    </Button>
                                }
                            />
                        </div>
                    </div>

                    {/* Notifications Section */}
                    <div>
                        <NotificationList />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
