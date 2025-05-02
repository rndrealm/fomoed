import SignalBuilder from "@/components/signals/signal-builder";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, TrendingUp } from "lucide-react";
import AddSmartSignalPopup from "./AddSmartSignalPopup";
import NotificationList from "./NotificationList";
import SmartSignalList from "./SmartSignalList";

export default function SmartSignalsMvp() {
  return (
    <Card className="w-full h-full bg-[#1A1A1A] border-[#333333]">
      <CardHeader>
        <CardTitle className="text-xl text-white">
          Smart Signals Dashboard
        </CardTitle>
        <CardDescription className="text-gray-400">
          View your signals and notifications
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-grow">
        <div className="grid grid-cols-2 gap-6 h-full">
          {/* Smart Signals Section */}
          <div className="flex flex-col">
            <div className="text-lg font-semibold flex items-center text-white h-16">
              <TrendingUp size={18} className="mr-2 text-blue-500" />
              <h2 className="grid place-items-center pl-2">Smart Signals</h2>
              <div className="flex-grow"></div>
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

            <div className="flex justify-end"></div>

            <div className="space-y-2 overflow-y-auto">
              <SmartSignalList />
            </div>
          </div>

          {/* Notifications Section */}
          <div>
            <NotificationList />
          </div>
        </div>

        {/* TEMP */}
        <div className="max-w-5xl mx-auto">
          <SignalBuilder
            initialSignal={undefined}
            onSave={(data) => console.log(data)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
