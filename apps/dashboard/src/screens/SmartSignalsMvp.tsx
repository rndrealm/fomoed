import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Plus, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddSmartSignalPopup from "./AddSmartSignalPopup";
import NotificationList from "./NotificationList";

// Placeholder component for smart signal items
const SmartSignalItem = ({
    title,
    description,
    timestamp,
}: {
    title: string;
    description: string;
    timestamp: string;
}) => (
    <div className="flex items-start p-4 rounded-md border border-[#333333] mb-3 bg-[#222222] hover:bg-[#2A2A2A] transition-colors">
        <div className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center mr-3">
            <TrendingUp size={16} />
        </div>
        <div className="flex-1">
            <h3 className="font-medium text-white">{title}</h3>
            <p className="text-gray-400 text-sm mt-1">{description}</p>
            <span className="text-xs text-gray-500 mt-2 block">{timestamp}</span>
        </div>
    </div>
);

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
                            <SmartSignalItem
                                title="ETH Price Increase"
                                description="Ethereum has increased by 5% in the last 24 hours."
                                timestamp="2 hours ago"
                            />
                            <SmartSignalItem
                                title="BTC Volume Spike"
                                description="Unusual trading volume detected for Bitcoin on major exchanges."
                                timestamp="4 hours ago"
                            />
                            <SmartSignalItem
                                title="Gas Fees Dropping"
                                description="Average gas fees have decreased by 15% since yesterday."
                                timestamp="6 hours ago"
                            />
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
